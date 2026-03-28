'use client'

import React, { useState, useMemo, useRef, useCallback, useEffect } from 'react'
import {
    ShieldCheck, Smartphone, Zap, Handshake, Store, BadgePercent,
    CreditCard, Search, Loader2, ArrowRight, Users, Check, ChevronRight,
    Truck, ImagePlus, Upload, X, Fingerprint, Star, TrendingUp,
    LocateFixed, Navigation, MapPinned, User, Send, AlertCircle, RefreshCw,
    ShoppingBag,
    CheckCircle2,
    XCircle
} from 'lucide-react'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import logoImg from '@/public/imgfile/logoimg.png'

import {
    type ProductListItem, type FullProduct, type ColorOption, type ConditionAnswer,
    CONDITION_QUESTIONS, calculateExchangeValue, getMaxExchangeValue,
    extractColorsFromVariants, guessColorHex
} from './exchange-helpers'
import { ProductService } from '../api/services/product.service'
import { getBrandProducts, getCategoryProducts } from '../api/services/category.service'
import type { NavbarItem } from '../context/navbar.interface'
import EmiFaq from '../emi/apply/_components/EmiFaq'

interface MainProps {
    categories: NavbarItem[]
    initialProducts?: ProductListItem[]
    bannerSection?: React.ReactNode
    blogSection?: React.ReactNode
}

// ── Mock data for SEO content (rendered even before interaction) ─────────────
const POPULAR_BRANDS = ['Samsung', 'Apple', 'Xiaomi', 'OnePlus', 'Oppo', 'Vivo', 'Realme', 'Nokia']
const TRUST_STATS = [
    { value: '10,000+', label: 'Devices exchanged' },
    { value: '4.8★', label: 'Customer rating' },
    { value: '2 hrs', label: 'Avg pickup time' },
    { value: '100%', label: 'Free pickup' },
]

export default function ExchangeClient({ categories, initialProducts = [], bannerSection, blogSection }: MainProps) {
    const router = useRouter()

    const [viewMode, setViewMode] = useState<'catalog' | 'wizard'>('catalog')
    const [selectedCategory, setSelectedCategory] = useState<NavbarItem | null>(null)
    const [selectedBrand, setSelectedBrand] = useState('')
    const [searchTerm, setSearchTerm] = useState('')
    const [products, setProducts] = useState<ProductListItem[]>(initialProducts)
    const [isLoadingProducts, setIsLoadingProducts] = useState(false)
    const [selectedProduct, setSelectedProduct] = useState<FullProduct | null>(null)
    const [isLoadingDetail, setIsLoadingDetail] = useState(false)
    const [colorOptions, setColorOptions] = useState<ColorOption[]>([])
    const [selectedColor, setSelectedColor] = useState<ColorOption | null>(null)
    const [conditionAnswers, setConditionAnswers] = useState<ConditionAnswer>({ screen: 0, body: 0, battery: 0, functional: 0 })
    const [conditionComplete, setConditionComplete] = useState(false)
    const [showResult, setShowResult] = useState(false)
    const [pickupSelected, setPickupSelected] = useState(false)

    const fileInputRef = useRef<HTMLInputElement>(null)
    const colorRef = useRef<HTMLDivElement>(null)
    const conditionRef = useRef<HTMLDivElement>(null)
    const pickupOptionRef = useRef<HTMLDivElement>(null)
    const pickupDetailsRef = useRef<HTMLDivElement>(null)
    const formSectionRef = useRef<HTMLDivElement>(null)
    const brandSectionRef = useRef<HTMLDivElement>(null)
    const modelSectionRef = useRef<HTMLDivElement>(null)
    const searchTimerRef = useRef<NodeJS.Timeout | null>(null)

    // ── Pre-select first category if none selected, but avoid re-triggering if already in sync
    useEffect(() => {
        if (categories.length > 0 && !selectedCategory) {
            setSelectedCategory(categories[0])
            // If we don't have products yet, use initialProducts
            if (products.length === 0 && initialProducts.length > 0) {
                setProducts(initialProducts)
            }
        }
    }, [categories, initialProducts, selectedCategory, products.length])

    // ── Derived ──────────────────────────────────────────────
    const activePrice = useCallback((product: FullProduct, color: ColorOption | null) =>
        color ? color.discountedPrice || color.price : product.discounted_price || product.price
        , [])

    const exchangeValue = useMemo(() => {
        if (!selectedProduct) return 0
        return calculateExchangeValue(
            activePrice(selectedProduct, selectedColor),
            selectedProduct.created_at,
            conditionComplete ? conditionAnswers : undefined
        )
    }, [selectedProduct, selectedColor, conditionAnswers, conditionComplete, activePrice])

    const maxExchangeValue = useMemo(() => {
        if (!selectedProduct) return 0
        return getMaxExchangeValue(activePrice(selectedProduct, selectedColor), selectedProduct.created_at)
    }, [selectedProduct, selectedColor, activePrice])

    const stepNumber = (base: number) => colorOptions.length > 0 ? base + 1 : base

    // ── Data fetchers ────────────────────────────────────────
    const fetchProducts = useCallback(async (brandSlug: string, search?: string, forceCategorySlug?: string) => {
        setIsLoadingProducts(true)
        try {
            let fetched: ProductListItem[] = []
            const targetCat = forceCategorySlug !== undefined ? forceCategorySlug : selectedCategory?.slug;

            if (search?.trim()) {
                const res = await ProductService.searchProducts({ search: search.trim(), categories: targetCat, brands: brandSlug, per_page: 20 })
                fetched = res?.data || []
            } else if (targetCat) {
                const res = await getCategoryProducts(targetCat, { brand: brandSlug, exchange_available: true, per_page: 40 })
                fetched = res?.data?.products || []
            } else {
                const res = await getBrandProducts(brandSlug, { per_page: 20 })
                fetched = res?.data || []
            }
            setProducts(fetched)
        } catch {
            setProducts([])
        }
        setIsLoadingProducts(false)
    }, [selectedCategory])

    // ── Reset helpers ────────────────────────────────────────
    const resetCondition = useCallback(() => {
        setShowResult(false)
        setConditionComplete(false)
        setConditionAnswers({ screen: 0, body: 0, battery: 0, functional: 0 })
    }, [])

    // ── Handlers ─────────────────────────────────────────────
    const handleSelectCategory = (cat: NavbarItem) => {
        setSelectedCategory(cat)
        setSelectedBrand('')
        setSelectedProduct(null)
        setColorOptions([])
        setSelectedColor(null)
        setSearchTerm('')
        // No longer clearing products here to prevent layout "bounce"
        resetCondition()

        // 1. Fetch products for this category right away (brand is empty)
        fetchProducts('', '', cat.slug)

        // 2. Decide where to scroll: skip Brand selection if empty
        const hasBrands = (cat.brands?.length || 0) > 0
        const targetRef = hasBrands ? brandSectionRef : modelSectionRef
        setTimeout(() => targetRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 150)
    }

    const handleSelectBrand = (slug: string) => {
        setSelectedBrand(slug)
        setSelectedProduct(null)
        setColorOptions([])
        setSelectedColor(null)
        setSearchTerm('')
        resetCondition()
        fetchProducts(slug)
        setTimeout(() => modelSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100)
    }

    const handleSearch = (value: string) => {
        setSearchTerm(value)
        if (searchTimerRef.current) clearTimeout(searchTimerRef.current)
        searchTimerRef.current = setTimeout(() => {
            if (selectedBrand) fetchProducts(selectedBrand, value)
        }, 400)
    }

    const handleSelectProduct = async (product: ProductListItem) => {
        setIsLoadingDetail(true)
        setSelectedColor(null)
        resetCondition()
        try {
            const full = await ProductService.getProductBySlug(product.slug)
            setSelectedProduct(full)
            const colors = extractColorsFromVariants(full)
            setColorOptions(colors)
            if (colors.length === 1) setSelectedColor(colors[0])
        } catch {
            setSelectedProduct({
                id: Number(product.id), name: product.name, slug: product.slug,
                price: Number(product.price), discounted_price: Number(product.discounted_price),
                created_at: product.created_at,
                image: typeof product.image === 'string' ? { full: product.image, thumb: product.image, preview: product.image } : product.image,
                images: [], variants: [],
                brand: { id: 0, name: '', slug: selectedBrand },
            })
            setColorOptions([])
        }
        setIsLoadingDetail(false)
    }

    const handleConditionAnswer = (key: keyof ConditionAnswer, value: number) => {
        const updated = { ...conditionAnswers, [key]: value }
        setConditionAnswers(updated)
        const allAnswered = updated.screen > 0 && updated.body > 0 && updated.battery > 0 && updated.functional > 0
        setConditionComplete(allAnswered)
        if (allAnswered) setShowResult(true)
    }

    const getProductImage = (p: any) => {
        if (!p) return logoImg.src;
        if (typeof p.image === 'string') return p.image;
        return p.thumb?.url
    }

    // ─────────────────────────────────────────────────────────
    return (
        <main className="min-h-screen bg-[#F5F7FA] text-gray-800 pb-28">

            {/* ══════════════════════════════════════
                HERO — SEO-rich, always visible
            ══════════════════════════════════════ */}
            <section className="bg-white border-b border-gray-100">
                <div className=" mx-auto px-4 lg:px-8 max-w-7xl py-10 md:py-14">
                    <div className="flex flex-col md:flex-row items-center gap-10 md:gap-14">

                        {/* Left */}
                        <div className="flex-1 space-y-5 text-center md:text-left">
                            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-widest border" style={{ color: 'var(--colour-fsP2)', borderColor: '#C7D9F5', background: '#EEF3FB' }}>
                                <RefreshCw style={{ width: 10, height: 10 }} /> Mobile Exchange Program
                            </div>

                            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-gray-900 leading-[1.15] tracking-tight">
                                Exchange your old phone.<br />
                                <span style={{ color: 'var(--colour-fsP2)' }}>Get instant value.</span>
                            </h1>

                            <p className="text-gray-500 text-base max-w-lg mx-auto md:mx-0 leading-relaxed">
                                Trade in your old smartphone and get the best market value applied directly towards your new device. Free doorstep pickup across Nepal — no hassle, no hidden charges.
                            </p>

                            {/* Trust stats */}
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-lg mx-auto md:mx-0">
                                {TRUST_STATS.map((s, i) => (
                                    <div key={i} className="bg-[#F5F7FA] rounded-xl p-3 text-center border border-gray-100">
                                        <p className="text-lg font-extrabold text-gray-900">{s.value}</p>
                                        <p className="text-[11px] text-gray-400 font-bold mt-0.5 leading-tight">{s.label}</p>
                                    </div>
                                ))}
                            </div>

                            <div className="flex flex-col sm:flex-row gap-3 justify-center md:justify-start">
                                <button
                                    onClick={() => {
                                        setViewMode('wizard');
                                        setTimeout(() => formSectionRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
                                    }}
                                    className="h-11 px-6 rounded-xl text-white text-sm font-bold cursor-pointer transition-opacity hover:opacity-90 flex items-center justify-center gap-2"
                                    style={{ background: 'var(--colour-fsP2)' }}
                                >
                                    Look for exchange product <ArrowRight style={{ width: 14, height: 14 }} />
                                </button>
                                <button
                                    onClick={() => {
                                        setViewMode('catalog');
                                        setTimeout(() => formSectionRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
                                    }}
                                    className="h-11 px-6 rounded-xl text-sm font-bold border border-gray-200 bg-white text-gray-700 cursor-pointer hover:bg-gray-50 transition-colors"
                                >
                                    View all categories
                                </button>
                            </div>
                        </div>

                        {/* Right — image + popular brands */}
                        <div className="shrink-0 flex flex-col items-center gap-5">
                            <div className="relative w-[200px] h-[200px] md:w-[240px] md:h-[240px]">
                                <div className="absolute inset-0 rounded-full" style={{ background: '#EEF3FB' }} />
                                <Image src={logoImg} alt="Mobile Exchange Nepal — Fatafat Sewa" fill className="object-contain relative z-10 drop-shadow-xl p-6" sizes="240px" priority />
                            </div>
                            {/* Popular brands strip — SEO content */}
                            <div className="text-center">
                                <p className="text-[11px] font-bold uppercase tracking-widest text-gray-400 mb-2">Popular brands we accept</p>
                                <div className="flex flex-wrap justify-center gap-1.5">
                                    {POPULAR_BRANDS.map(b => (
                                        <span key={b} className="px-2.5 py-1 rounded-lg bg-white border border-gray-200 text-[11px] font-bold text-gray-600">{b}</span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ══════════════════════════════════════
                EXCHANGE FLOW CARD
            ══════════════════════════════════════ */}
            <section ref={formSectionRef} className="mx-auto px-4 lg:px-8 max-w-8xl py-8">

                {/* Breadcrumb / progress indicator */}
                <div className="flex items-center gap-2 mb-5 text-xs font-bold text-gray-400">
                    <span>Exchange</span>
                    {selectedCategory && <><ChevronRight style={{ width: 12, height: 12 }} /><span style={{ color: 'var(--colour-fsP2)' }}>{selectedCategory.title}</span></>}
                    {selectedBrand && <><ChevronRight style={{ width: 12, height: 12 }} /><span style={{ color: 'var(--colour-fsP2)' }}>{selectedCategory?.brands?.find(b => b.slug === selectedBrand)?.name}</span></>}
                    {selectedProduct && <><ChevronRight style={{ width: 12, height: 12 }} /><span className="text-gray-600 line-clamp-1 max-w-[120px]">{selectedProduct.name}</span></>}
                </div>

                <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden min-h-[500px]">

                    {/* Tabs Header */}
                    <div className="flex items-center px-4 pt-4 border-b border-gray-100 bg-gray-50 gap-2">
                        <button
                            onClick={() => setViewMode('catalog')}
                            className={cn("px-5 py-3 text-sm font-bold transition-colors border-b-2", viewMode === 'catalog' ? "border-[var(--colour-fsP2)] text-[var(--colour-fsP2)]" : "border-transparent text-gray-500 hover:text-gray-700")}
                        >
                            <TrendingUp className="inline w-4 h-4 mr-1.5 align-text-bottom" /> Products Catalog
                        </button>
                        <button
                            onClick={() => setViewMode('wizard')}
                            className={cn("px-5 py-3 text-sm font-bold transition-colors border-b-2", viewMode === 'wizard' ? "border-[var(--colour-fsP2)] text-[var(--colour-fsP2)]" : "border-transparent text-gray-500 hover:text-gray-700")}
                        >
                            <RefreshCw className="inline w-4 h-4 mr-1.5 align-text-bottom" /> Exchange Quote
                        </button>
                    </div>


                    {viewMode === 'catalog' && (
                        <div className="p-5 md:p-7 space-y-6">
                            {/* Categories Filter */}
                            <div className="space-y-2">
                                <p className="text-xs font-extrabold uppercase tracking-widest text-gray-400">Categories</p>
                                <div className="flex flex-wrap gap-2">
                                    {categories.filter(c => {
                                        const title = c.title?.toLowerCase() || ''
                                        const slug = c.slug?.toLowerCase() || ''
                                        return title.includes('mobile') || title.includes('laptop') || title.includes('smartphone') || title.includes('macbook') || slug.includes('mobile') || slug.includes('laptop') || slug.includes('smartphone') || slug.includes('macbook')
                                    }).map(cat => (
                                        <button
                                            key={cat.id}
                                            onClick={() => {
                                                setSelectedCategory(cat);
                                                setSelectedBrand('');
                                                const bSlug = cat.brands && cat.brands.length > 0 ? cat.brands[0].slug : '';
                                                fetchProducts(bSlug, undefined, cat.slug);
                                            }}
                                            className={cn("px-4 py-2 rounded-full text-sm font-bold border transition-colors", selectedCategory?.id === cat.id ? "bg-[var(--colour-fsP2)] border-[var(--colour-fsP2)] text-white shadow-md" : "bg-white border-gray-200 text-gray-700 hover:border-gray-300")}
                                        >
                                            {cat.title}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Brands Filter */}
                            {selectedCategory && (selectedCategory.brands?.length || 0) > 0 && (
                                <div className="space-y-2">
                                    <p className="text-xs font-extrabold uppercase tracking-widest text-gray-400">Brands</p>
                                    <div className="flex flex-wrap gap-2">
                                        <button
                                            onClick={() => { setSelectedBrand(''); fetchProducts(''); }}
                                            className={cn("px-3 py-1.5 rounded-lg text-xs font-bold border transition-colors", !selectedBrand ? "bg-gray-800 border-gray-800 text-white" : "bg-white border-gray-200 text-gray-600 hover:border-gray-300")}
                                        >
                                            All Brands
                                        </button>
                                        {selectedCategory.brands?.map(brand => (
                                            <button
                                                key={brand.slug}
                                                onClick={() => { setSelectedBrand(brand.slug); fetchProducts(brand.slug); }}
                                                className={cn("px-3 py-1.5 rounded-lg text-xs font-bold border transition-colors", selectedBrand === brand.slug ? "bg-gray-800 border-gray-800 text-white" : "bg-white border-gray-200 text-gray-600 hover:border-gray-300")}
                                            >
                                                {brand.name}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Search */}
                            <div className="relative max-w-sm">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" style={{ width: 13, height: 13 }} />
                                <Input
                                    placeholder="Search specific model…"
                                    className="pl-8 pr-8 h-10 text-sm border-gray-200 rounded-lg font-bold bg-gray-50/50"
                                    value={searchTerm}
                                    onChange={e => handleSearch(e.target.value)}
                                />
                                {searchTerm && (
                                    <button onClick={() => handleSearch('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer">
                                        <X style={{ width: 12, height: 12 }} />
                                    </button>
                                )}
                            </div>

                            {/* Products Grid — Non-blocking loading approach to prevent "bounce" */}
                            <div className="relative min-h-[400px]">
                                {isLoadingProducts && (
                                    <div className="absolute inset-0 z-20 flex items-start justify-center pt-24 bg-white/40 backdrop-blur-[1px] transition-opacity duration-300">
                                        <div className="flex items-center gap-2 px-4 py-2 bg-white/90 shadow-xl border border-gray-100 rounded-full text-[var(--colour-fsP2)] text-xs font-bold animate-in fade-in zoom-in duration-300">
                                            <Loader2 className="animate-spin" size={14} />
                                            Refreshing catalog…
                                        </div>
                                    </div>
                                )}

                                {products.length > 0 && (
                                    <div className={cn(
                                        "grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4 transition-all duration-500",
                                        isLoadingProducts ? "opacity-40 grayscale-[0.3]" : "opacity-100"
                                    )}>
                                        {products.map(product => {
                                            const maxVal = getMaxExchangeValue(product.discounted_price || product.price, product.created_at)
                                            return (
                                                <div
                                                    key={product.id}
                                                    className="group text-left rounded-2xl border border-gray-100 bg-white transition-all duration-300 overflow-hidden flex flex-col hover:border-[var(--colour-fsP2)]/30 hover:shadow-lg hover:-translate-y-1"
                                                >
                                                    {/* Card Content */}
                                                    <button
                                                        onClick={() => {
                                                            const targetBrand = product.brand?.slug || selectedBrand
                                                            if (!selectedCategory || !selectedCategory.brands?.some(b => b.slug === targetBrand)) {
                                                                const cat = categories.find(c => c.brands?.some(b => b.slug === targetBrand))
                                                                if (cat) setSelectedCategory(cat)
                                                            }
                                                            setSelectedBrand(targetBrand)
                                                            handleSelectProduct(product)
                                                            setViewMode('wizard')
                                                            setTimeout(() => conditionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 300)
                                                        }}
                                                        className="w-full text-left cursor-pointer flex-1 flex flex-col"
                                                    >
                                                        {/* Image */}
                                                        <div className="w-full aspect-[5/4] relative overflow-hidden bg-gray-50 border-b border-gray-100 shrink-0">
                                                            <Image
                                                                src={getProductImage(product)}
                                                                alt={product.name}
                                                                fill
                                                                className="object-contain p-2 group-hover:scale-105 transition-transform duration-500"
                                                                sizes="(max-width: 640px) 50vw, 20vw"
                                                            />
                                                            <div className="absolute top-2 right-2 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-widest bg-white/90 border border-gray-100 text-gray-500">
                                                                {product.brand?.name || selectedBrand}
                                                            </div>
                                                        </div>

                                                        {/* Info */}
                                                        <div className="px-3 pt-3 pb-2 flex flex-col flex-1 gap-2">
                                                            <p className="text-[11px] font-bold leading-snug line-clamp-2 text-gray-800 group-hover:text-[var(--colour-fsP2)] transition-colors">
                                                                {product.name}
                                                            </p>
                                                            <div className="flex flex-col">
                                                                <span className="text-[9px] text-gray-400 font-semibold uppercase tracking-wide">Exchange value up to</span>
                                                                <span className="text-sm font-black tracking-tight" style={{ color: 'var(--colour-fsP2)' }}>
                                                                    Rs. {maxVal.toLocaleString()}
                                                                </span>
                                                            </div>
                                                            <div className="w-full py-1.5 rounded-lg bg-[#EEF3FB] text-[10px] font-bold text-center text-[var(--colour-fsP2)]">
                                                                Select to Exchange
                                                            </div>
                                                        </div>
                                                    </button>

                                                    {/* Action Buttons */}
                                                    {/* Action Buttons */}
                                                    <div className="px-3 pb-3">
                                                        <Link
                                                            href={`/product/${product.slug}`}
                                                            className="w-full py-2 text-[10px] font-bold text-center rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors flex items-center justify-center gap-1"
                                                        >
                                                            <ShoppingBag size={11} />
                                                            Buy New One
                                                        </Link>
                                                    </div>
                                                </div>
                                            )
                                        })}

                                        {products.length === 0 && !isLoadingProducts && (
                                            <div className="col-span-full flex flex-col items-center py-20 gap-3 text-gray-300 animate-in fade-in slide-in-from-bottom-2 duration-500">
                                                <Search style={{ width: 40, height: 40 }} />
                                                <div className="text-center">
                                                    <p className="text-sm font-bold text-gray-500">
                                                        {searchTerm ? `No results for "${searchTerm}"` : 'No models available'}
                                                    </p>
                                                    <p className="text-[11px] text-gray-400 mt-1">Try another brand or search term</p>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {viewMode === 'wizard' && (
                        <>
                            {/* Header */}
                            <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-100 bg-white sticky top-0 z-10">
                                <div className="flex items-center gap-3">
                                    <RefreshCw size={14} style={{ color: 'var(--colour-fsP2)' }} />
                                    <div>
                                        <p className="text-sm font-bold text-gray-900">Exchange Your Device</p>
                                        <p className="text-[11px] text-gray-400">Select your old phone to get an instant quote</p>
                                    </div>
                                </div>
                                {selectedCategory && (
                                    <button
                                        onClick={() => {
                                            setSelectedCategory(null); setSelectedBrand(''); setSelectedProduct(null);
                                            setColorOptions([]); setSelectedColor(null); setProducts([]); resetCondition()
                                        }}
                                        className="text-[11px] font-semibold text-gray-400 hover:text-gray-700 flex items-center gap-1 transition-colors"
                                    >
                                        <X size={11} /> Reset
                                    </button>
                                )}
                            </div>

                            <div className="divide-y divide-gray-100">

                                {/* ══ STEP 1: CATEGORY ══ */}
                                <div className="p-5 space-y-3">
                                    <div className="flex items-center gap-2">
                                        <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Step 1</span>
                                        {selectedCategory && <Check size={12} className="text-[var(--colour-fsP2)]" />}
                                    </div>
                                    <p className="text-sm font-bold text-gray-900">What type of device are you exchanging?</p>
                                    <div className="flex flex-wrap gap-2">
                                        {categories.map(cat => {
                                            const active = selectedCategory?.id === cat.id
                                            return (
                                                <button
                                                    key={cat.id}
                                                    onClick={() => handleSelectCategory(cat)}
                                                    className={cn(
                                                        'flex items-center gap-2 px-3 py-2 rounded-full border text-xs font-semibold transition-all',
                                                        active
                                                            ? 'border-[var(--colour-fsP2)] bg-[#EEF3FB] text-[var(--colour-fsP2)]'
                                                            : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300 hover:bg-gray-50'
                                                    )}
                                                >
                                                    {cat.thumb?.url
                                                        ? <Image src={cat.thumb.url} alt={cat.title} width={14} height={14} className="object-contain" />
                                                        : <Smartphone size={12} className={active ? 'text-[var(--colour-fsP2)]' : 'text-gray-400'} />
                                                    }
                                                    {cat.title}
                                                </button>
                                            )
                                        })}
                                    </div>
                                </div>

                                {/* ══ STEP 2: BRAND ══ */}
                                {selectedCategory && (selectedCategory.brands?.length || 0) > 0 && (
                                    <div ref={brandSectionRef} className={cn('p-5 space-y-3 transition-opacity duration-300', selectedCategory ? 'opacity-100' : 'opacity-40 pointer-events-none')}>
                                        <div className="flex items-center gap-2">
                                            <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Step 2</span>
                                            {selectedBrand && <Check size={12} className="text-[var(--colour-fsP2)]" />}
                                        </div>
                                        <p className="text-sm font-bold text-gray-900">Which brand is your phone?</p>
                                        <div className="flex flex-wrap gap-2">
                                            {(selectedCategory?.brands ?? []).map((brand, i) => {
                                                const active = selectedBrand === brand.slug
                                                return (
                                                    <button
                                                        key={i}
                                                        onClick={() => handleSelectBrand(brand.slug)}
                                                        className={cn(
                                                            'flex items-center gap-2 px-3 py-2 rounded-full border text-xs font-semibold transition-all',
                                                            active
                                                                ? 'border-[var(--colour-fsP2)] bg-[#EEF3FB] text-[var(--colour-fsP2)]'
                                                                : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300 hover:bg-gray-50'
                                                        )}
                                                    >
                                                        {brand.thumb?.url
                                                            ? <Image src={brand.thumb.url} alt={brand.name} width={14} height={14} className="object-contain" />
                                                            : <span className="text-[10px] font-black uppercase">{brand.name.slice(0, 2)}</span>
                                                        }
                                                        {brand.name}
                                                    </button>
                                                )
                                            })}
                                        </div>
                                    </div>
                                )}

                                {/* ══ STEP 2/3: MODEL — PRODUCT CARDS ══ */}
                                <div ref={modelSectionRef} className={cn('p-5 space-y-3 transition-opacity duration-300', selectedCategory ? 'opacity-100' : 'opacity-40 pointer-events-none')}>
                                    <div className="flex items-center gap-2">
                                        <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
                                            {(selectedCategory?.brands?.length || 0) > 0 ? 'Step 3' : 'Step 2'}
                                        </span>
                                        {selectedProduct && <Check size={12} className="text-[var(--colour-fsP2)]" />}
                                    </div>
                                    <p className="text-sm font-bold text-gray-900">Which model are you exchanging?</p>

                                    {/* Search */}
                                    <div className="relative max-w-xs">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={12} />
                                        <Input
                                            placeholder="Search model…"
                                            className="pl-8 pr-8 h-8 text-xs border-gray-200 rounded-lg font-semibold"
                                            value={searchTerm}
                                            onChange={e => handleSearch(e.target.value)}
                                        />
                                        {searchTerm && (
                                            <button onClick={() => handleSearch('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                                                <X size={11} />
                                            </button>
                                        )}
                                    </div>

                                    {isLoadingProducts ? (
                                        <div className="flex items-center gap-2 py-6 text-gray-400 text-xs">
                                            <Loader2 className="animate-spin" size={13} /> Loading models…
                                        </div>
                                    ) : products.length === 0 ? (
                                        <p className="text-xs text-gray-400 py-4">
                                            {searchTerm ? `No results for "${searchTerm}"` : 'No products found'}
                                        </p>
                                    ) : (
                                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                                            {products.map(product => {
                                                const maxVal = getMaxExchangeValue(product.discounted_price || product.price, product.created_at)
                                                const isSelected = selectedProduct?.slug === product.slug
                                                return (
                                                    <button
                                                        key={product.id}
                                                        onClick={() => handleSelectProduct(product)}
                                                        className={cn(
                                                            'group flex flex-col text-left rounded-xl border overflow-hidden bg-white transition-all duration-200',
                                                            isSelected
                                                                ? 'border-[var(--colour-fsP2)] ring-1 ring-[var(--colour-fsP2)]/20'
                                                                : 'border-gray-100 hover:border-gray-300'
                                                        )}
                                                    >
                                                        {/* Image — 4:3 ratio */}
                                                        <div className="w-full aspect-[4/3] relative bg-gray-50 overflow-hidden">
                                                            <Image
                                                                src={getProductImage(product)}
                                                                alt={product.name}
                                                                fill
                                                                className="object-contain p-3 group-hover:scale-105 transition-transform duration-300"
                                                                sizes="(max-width: 640px) 50vw, 20vw"
                                                            />
                                                            {isSelected && (
                                                                <div className="absolute top-2 right-2 w-5 h-5 rounded-full flex items-center justify-center" style={{ background: 'var(--colour-fsP2)' }}>
                                                                    <Check size={10} color="#fff" />
                                                                </div>
                                                            )}
                                                        </div>

                                                        {/* Info */}
                                                        <div className="p-2.5 flex flex-col gap-1 flex-1">
                                                            <p className={cn(
                                                                'text-[11px] font-bold leading-snug line-clamp-2',
                                                                isSelected ? 'text-[var(--colour-fsP2)]' : 'text-gray-800'
                                                            )}>
                                                                {product.name}
                                                            </p>
                                                            <div className="mt-auto pt-1">
                                                                <p className="text-[9px] font-semibold uppercase tracking-wide text-gray-400">Up to</p>
                                                                <p className="text-xs font-black tracking-tight" style={{ color: 'var(--colour-fsP2)' }}>
                                                                    Rs. {maxVal.toLocaleString()}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </button>
                                                )
                                            })}
                                        </div>
                                    )}
                                </div>

                                {/* ══ STEP 4: COLOR VARIANT ══ */}
                                {isLoadingDetail && (
                                    <div className="p-5 flex items-center gap-2 text-gray-400 text-xs">
                                        <Loader2 className="animate-spin" size={13} /> Loading variants…
                                    </div>
                                )}

                                {selectedProduct && !isLoadingDetail && colorOptions.length > 0 && (
                                    <div className="p-5 space-y-3">
                                        <div className="flex items-center gap-2">
                                            <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
                                                {(selectedCategory?.brands?.length || 0) > 0 ? 'Step 4' : 'Step 3'}
                                            </span>
                                            {selectedColor && <Check size={12} className="text-[var(--colour-fsP2)]" />}
                                        </div>
                                        <p className="text-sm font-bold text-gray-900">Which color variant do you have?</p>
                                        <div className="flex flex-wrap gap-2">
                                            {colorOptions.map(c => {
                                                const active = selectedColor?.name === c.name
                                                return (
                                                    <button
                                                        key={c.name}
                                                        onClick={() => { setSelectedColor(c); resetCondition() }}
                                                        className={cn(
                                                            'flex items-center gap-2 px-3 py-2 rounded-full border text-xs font-semibold transition-all',
                                                            active
                                                                ? 'border-[var(--colour-fsP2)] bg-[#EEF3FB] text-[var(--colour-fsP2)]'
                                                                : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300 hover:bg-gray-50'
                                                        )}
                                                    >
                                                        <span className="w-3 h-3 rounded-full border border-gray-200 shrink-0" style={{ backgroundColor: c.hex }} />
                                                        {c.name}
                                                        <span className={cn('font-bold', active ? 'text-[var(--colour-fsP2)]/70' : 'text-gray-400')}>
                                                            · Rs. {c.discountedPrice.toLocaleString()}
                                                        </span>
                                                    </button>
                                                )
                                            })}
                                        </div>
                                    </div>
                                )}

                                {/* ══ STEP 5: CONDITION ══ */}
                                {selectedProduct && !isLoadingDetail && (colorOptions.length === 0 || selectedColor) && (
                                    <div className="p-5 space-y-6" ref={conditionRef}>
                                        <div className="flex items-center gap-2">
                                            <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
                                                {(selectedCategory?.brands?.length || 0) > 0 ? (colorOptions.length > 0 ? 'Step 5' : 'Step 4') : (colorOptions.length > 0 ? 'Step 4' : 'Step 3')}
                                            </span>
                                            {conditionComplete && <Check size={12} className="text-[var(--colour-fsP2)]" />}
                                        </div>
                                        <p className="text-sm font-bold text-gray-900">Tell us about your phone's condition</p>

                                        <div className="space-y-5">
                                            {CONDITION_QUESTIONS.map(q => (
                                                <div key={q.key} className="space-y-2.5">
                                                    <p className="text-xs font-bold text-gray-700">{q.label}</p>
                                                    <div className="grid grid-cols-3 gap-2">
                                                        {q.options.map((opt, i) => {
                                                            const sel = conditionAnswers[q.key] === opt.value
                                                            const icons = [
                                                                <CheckCircle2 size={18} />,
                                                                <AlertCircle size={18} />,
                                                                <XCircle size={18} />,
                                                            ]
                                                            const colors = [
                                                                {
                                                                    active: 'border-emerald-400 bg-emerald-50 text-emerald-700',
                                                                    icon: 'text-emerald-500',
                                                                    idle: 'border-gray-100 bg-white text-gray-500 hover:border-emerald-200 hover:bg-emerald-50/40 hover:text-emerald-600',
                                                                },
                                                                {
                                                                    active: 'border-amber-400 bg-amber-50 text-amber-700',
                                                                    icon: 'text-amber-500',
                                                                    idle: 'border-gray-100 bg-white text-gray-500 hover:border-amber-200 hover:bg-amber-50/40 hover:text-amber-600',
                                                                },
                                                                {
                                                                    active: 'border-red-400 bg-red-50 text-red-700',
                                                                    icon: 'text-red-500',
                                                                    idle: 'border-gray-100 bg-white text-gray-500 hover:border-red-200 hover:bg-red-50/40 hover:text-red-600',
                                                                },
                                                            ]
                                                            const c = colors[i]
                                                            return (
                                                                <button
                                                                    key={opt.label}
                                                                    onClick={() => handleConditionAnswer(q.key, opt.value)}
                                                                    className={cn(
                                                                        'flex flex-col items-center justify-center gap-2 rounded-xl border py-4 px-2 text-center transition-all duration-150',
                                                                        sel ? c.active : c.idle
                                                                    )}
                                                                >
                                                                    <span className={cn('transition-colors', sel ? c.icon : 'text-gray-300')}>
                                                                        {icons[i]}
                                                                    </span>
                                                                    <span className="text-[10px] font-bold leading-tight">{opt.label}</span>
                                                                </button>
                                                            )
                                                        })}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* ══ RESULT ══ */}
                                {showResult && conditionComplete && (
                                    <>
                                        <div className="p-5">
                                            <div className="rounded-xl border border-gray-100 overflow-hidden bg-white">
                                                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-12 h-12 rounded-xl bg-gray-50 border border-gray-100 relative overflow-hidden shrink-0">
                                                            {/* <Image src={getProductImage(selectedProduct)} alt={selectedProduct.name} fill className="object-contain p-1.5" sizes="48px" />/ */}
                                                        </div>
                                                        <div>
                                                            {/* <p className="text-xs font-bold text-gray-900 leading-snug">{selectedProduct.name}</p> */}
                                                            {selectedColor && (
                                                                <div className="flex items-center gap-1.5 mt-1">
                                                                    <span className="w-2 h-2 rounded-full border border-gray-200 shrink-0" style={{ backgroundColor: selectedColor.hex }} />
                                                                    <span className="text-[11px] text-gray-500">{selectedColor.name}</span>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <div className="sm:text-right">
                                                        <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider mb-0.5">Exchange value</p>
                                                        <p className="text-xl font-black tracking-tight" style={{ color: 'var(--colour-fsP2)' }}>
                                                            Rs. {exchangeValue.toLocaleString()}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="px-4 py-2.5 bg-green-50 border-t border-green-100 flex items-center gap-2">
                                                    <Check size={11} className="text-green-600 shrink-0" />
                                                    <span className="text-[11px] font-semibold text-green-700">Eligible for instant credit</span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Pickup */}
                                        <div ref={pickupOptionRef} className="p-5 space-y-3">
                                            <div className="flex items-center gap-2">
                                                <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Pickup</span>
                                                {pickupSelected && <Check size={12} className="text-[var(--colour-fsP2)]" />}
                                            </div>
                                            <p className="text-sm font-bold text-gray-900">How do you want to hand over your phone?</p>
                                            <div className="flex flex-wrap gap-2">
                                                <button
                                                    onClick={() => setPickupSelected(true)}
                                                    className={cn(
                                                        'flex items-center gap-2 px-3 py-2 rounded-full border text-xs font-semibold transition-all',
                                                        pickupSelected
                                                            ? 'border-[var(--colour-fsP2)] bg-[#EEF3FB] text-[var(--colour-fsP2)]'
                                                            : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300 hover:bg-gray-50'
                                                    )}
                                                >
                                                    <Truck size={12} />
                                                    Free Doorstep Pickup
                                                    <span className="px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-green-100 text-green-700">Fastest</span>
                                                </button>
                                                <div className="flex items-center gap-2 px-3 py-2 rounded-full border border-gray-100 text-xs font-semibold text-gray-300 cursor-not-allowed">
                                                    <Store size={12} />
                                                    Walk-in Showroom
                                                    <span className="px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-gray-100 text-gray-400">Soon</span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Checkout */}
                                        {pickupSelected && (
                                            <div ref={pickupDetailsRef} className="p-5">
                                                <div className="rounded-xl border border-gray-100 bg-white p-4 flex flex-col sm:flex-row items-start sm:items-center gap-4 justify-between">
                                                    <div>
                                                        <p className="text-sm font-bold text-gray-900">Ready to proceed?</p>
                                                        <p className="text-xs text-gray-400 mt-0.5">Log in to confirm your exchange and schedule pickup.</p>
                                                    </div>
                                                    <button
                                                        onClick={() => router.push('/login?redirect=/checkout/exchange')}
                                                        className="shrink-0 inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-bold text-white transition-opacity hover:opacity-90 whitespace-nowrap"
                                                        style={{ background: 'var(--colour-fsP2)' }}
                                                    >
                                                        Login to Checkout <ArrowRight size={13} />
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </>
                                )}
                            </div>
                        </>
                    )}
                </div>
            </section>

            {/* ══════════════════════════════════════
                DYNAMIC SEO BANNER
            ══════════════════════════════════════ */}
            {bannerSection && (
                <section className="bg-white border-t border-gray-100 max-w-8xl mx-auto  px-2">
                    {bannerSection}
                </section>
            )}

            {/* ══════════════════════════════════════
                SEO CONTENT — Why Exchange
            ══════════════════════════════════════ */}
            <section className="bg-white border-t border-gray-100 py-10">
                <div className="container mx-auto px-4 lg:px-8 max-w-6xl">
                    <div className="text-center mb-8">
                        <h2 className="text-lg font-bold text-gray-900 mb-1">
                            Why exchange your phone with Fatafat Sewa?
                        </h2>
                        <p className="text-sm text-gray-400 max-w-md mx-auto">
                            Nepal's most trusted mobile exchange — transparent pricing, free pickup, instant upgrade.
                        </p>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                        {[
                            { icon: BadgePercent, title: 'Best Price Guaranteed', desc: 'Instant market-rate quote for any model.' },
                            { icon: Truck, title: 'Free Doorstep Pickup', desc: 'We come to you — zero collection charges.' },
                            { icon: CreditCard, title: '0% EMI Upgrade', desc: 'Use exchange value and pay balance in EMI.' },
                            { icon: ShieldCheck, title: 'Transparent Process', desc: 'Condition-based valuation, no hidden cuts.' },
                            { icon: Zap, title: 'Same-Day Upgrade', desc: 'Walk out with your new phone today.' },
                        ].map((item, i) => (
                            <div
                                key={i}
                                className="flex flex-col items-center text-center rounded-xl border border-gray-200 p-4 gap-2.5 hover:border-gray-300 hover:shadow-sm transition-all group"
                            >
                                <div className="w-9 h-9 rounded-lg bg-[#EEF3FB] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                                    <item.icon size={16} style={{ color: 'var(--colour-fsP2)' }} />
                                </div>
                                <p className="text-xs font-semibold text-gray-800 leading-snug">{item.title}</p>
                                <p className="text-[11px] text-gray-400 leading-relaxed">{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ══════════════════════════════════════
                SEO CONTENT — Supported brands grid
            ══════════════════════════════════════ */}



            <section className="bg-[#F5F7FA] border-t border-gray-100 py-12">
                <div className="container mx-auto px-4 lg:px-8 max-w-6xl">
                    <div className="text-center mb-8">
                        <h2 className="text-lg font-bold text-gray-900 mb-1">Brands We Accept for Exchange</h2>
                        <p className="text-sm text-gray-400">All major smartphone brands accepted — get the best trade-in value.</p>
                    </div>

                    <div className="flex flex-wrap justify-center gap-2">
                        {[...POPULAR_BRANDS, 'Huawei', 'Motorola', 'Sony', 'Google', 'Asus', 'Lenovo', 'Tecno', 'Infinix', 'Itel', 'HMD'].map(b => (
                            <div
                                key={b}
                                className="px-4 py-2 rounded-lg bg-white border border-gray-200 text-xs font-bold text-gray-800 hover:border-[var(--colour-fsP2)] hover:text-[var(--colour-fsP2)] hover:shadow-sm transition-all cursor-default"
                            >
                                {b}
                            </div>
                        ))}
                    </div>

                    <p className="text-center text-[11px] text-gray-400 mt-5">
                        Don't see your brand?{' '}
                        <span className="font-bold text-gray-600 cursor-pointer hover:text-[var(--colour-fsP2)] transition-colors">
                            Contact us
                        </span>{' '}
                        — we accept most smartphones.
                    </p>
                </div>
            </section>

            {/* ══════════════════════════════════════
                SEO CONTENT — How it works
            ══════════════════════════════════════ */}
            <section className="bg-white border-t border-gray-100 py-12">
                <div className="container mx-auto px-4 lg:px-8 max-w-6xl">
                    <div className="text-center mb-8">
                        <h2 className="text-xl font-extrabold text-gray-900 mb-2">How the mobile exchange works</h2>
                        <p className="text-sm text-gray-500">Simple 4-step process from quote to new device</p>
                    </div>
                    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {[
                            { icon: Smartphone, n: '1', title: 'Get instant quote', desc: 'Select your device, assess condition, and get an instant price estimate — no waiting.' },
                            { icon: Truck, n: '2', title: 'Schedule free pickup', desc: 'Book a doorstep pickup at your convenient time. Our team comes to you, free of charge.' },
                            { icon: ShieldCheck, n: '3', title: 'Device inspection', desc: 'Our technician does a quick physical inspection to confirm the final exchange value.' },
                            { icon: Handshake, n: '4', title: 'Upgrade your phone', desc: 'Apply the value to your new purchase. Pay the difference via cash, card, or 0% EMI.' },
                        ].map((item, i) => (
                            <div key={i} className="relative bg-white rounded-xl border border-gray-200 p-5 hover:shadow-sm transition-all">
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: '#EEF3FB' }}>
                                        <item.icon style={{ width: 16, height: 16, color: 'var(--colour-fsP2)' }} />
                                    </div>
                                    <span className="text-[10px] font-extrabold uppercase tracking-widest text-gray-400">Step {item.n}</span>
                                </div>
                                <p className="text-sm font-bold text-gray-900 mb-1.5">{item.title}</p>
                                <p className="text-xs text-gray-500 leading-relaxed">{item.desc}</p>
                                {i < 3 && (
                                    <div className="hidden lg:flex absolute top-8 -right-2 z-10">
                                        <ArrowRight style={{ width: 14, height: 14, color: '#d1d5db' }} />
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </section>


            {/* ══════════════════════════════════════
                MIDDLE BANNER (HOMEPAGE STYLE)
            ══════════════════════════════════════ */}
            {bannerSection && (
                <div className="container mx-auto px-4 lg:px-8 max-w-7xl py-6">
                    {bannerSection}
                </div>
            )}

            {/* ══════════════════════════════════════
                FAQ
            ══════════════════════════════════════ */}
            <section className="bg-[#F5F7FA] border-t border-gray-100 max-w-7xl mx-auto py-4">
                <EmiFaq
                    params={{ type: 'brand', per_page: 15, page: 1 }}
                    title="Frequently asked questions about mobile exchange"
                    subtitle="Everything you need to know before exchanging your phone"
                />
            </section>

            {/* ══════════════════════════════════════
                CTA BANNER
            ══════════════════════════════════════ */}
            <section className="bg-white border-t border-gray-100 py-12">
                <div className="container mx-auto px-4 lg:px-8 max-w-2xl text-center">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-widest border mb-4" style={{ color: 'var(--colour-fsP2)', borderColor: '#C7D9F5', background: '#EEF3FB' }}>
                        <TrendingUp style={{ width: 10, height: 10 }} /> Best exchange rates in Nepal
                    </div>
                    <h2 className="text-2xl font-extrabold text-gray-900 mb-2">Ready to upgrade your smartphone?</h2>
                    <p className="text-gray-500 text-sm mb-7 leading-relaxed">Join 10,000+ customers who've already exchanged their phones with Fatafat Sewa. Get the best trade-in value, free pickup, and instant upgrade.</p>
                    <div className="flex flex-col sm:flex-row justify-center gap-3">
                        <button className="h-11 px-7 rounded-xl text-white text-sm font-bold cursor-pointer hover:opacity-90 transition-opacity flex items-center justify-center gap-2" style={{ background: 'var(--colour-fsP2)' }} onClick={() => formSectionRef.current?.scrollIntoView({ behavior: 'smooth' })}>
                            Get exchange quote <ArrowRight style={{ width: 14, height: 14 }} />
                        </button>
                        <button className="h-11 px-7 rounded-xl text-sm font-bold border border-gray-200 bg-white text-gray-700 cursor-pointer hover:bg-gray-50 transition-colors flex items-center justify-center gap-2">
                            <Store style={{ width: 14, height: 14 }} /> Find showroom
                        </button>
                    </div>
                </div>
            </section>

            {/* ══════════════════════════════════════
                BLOG SECTION
            ══════════════════════════════════════ */}
            {blogSection && (
                <section className="bg-[#F5F7FA] border-t border-gray-100 py-4">
                    {blogSection}
                </section>
            )}

            {/* ══════════════════════════════════════
                FLOATING PROGRESS BAR
            ══════════════════════════════════════ */}
            {/* ══════════════════════════════════════
                FLOATING PROGRESS BAR (REFINED)
            ══════════════════════════════════════ */}
            {selectedProduct && (
                <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 w-[92%] sm:w-auto pointer-events-none animate-in slide-in-from-top-4 duration-500">
                    <div className="pointer-events-auto mx-auto bg-[#F5F7FA] w-full py-1.5 px-2 sm:px-5 flex items-center gap-3 sm:gap-6 min-w-[300px] sm:min-w-[480px] max-w-full">
                        {/* Compact thumbnail */}
                        <div className="w-10 h-10 rounded-full bg-white shadow-sm border border-gray-100 overflow-hidden relative shrink-0">
                            <Image src={getProductImage(selectedProduct)} alt={selectedProduct.name} fill className="object-contain p-1.5 transition-transform group-hover:scale-110" sizes="40px" />
                        </div>

                        <div className="flex-1 min-w-0">
                            <p className="text-[12px] font-extrabold text-gray-900 line-clamp-1 flex items-center gap-2">
                                {selectedProduct.name}
                                {conditionComplete && <Check size={12} className="text-green-500" />}
                            </p>
                            <div className="flex items-center gap-3">
                                <div className="flex items-center gap-1">
                                    <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Exchange value</span>
                                    <span className="text-[15px] font-black leading-none" style={{ color: 'var(--colour-fsP2)' }}>
                                        Rs. {(conditionComplete ? exchangeValue : maxExchangeValue).toLocaleString()}
                                    </span>
                                </div>
                                {!conditionComplete && (
                                    <span className="hidden sm:inline-flex items-center gap-1 text-[9px] font-bold text-gray-400 bg-gray-50 px-1.5 py-0.5 rounded-full border border-gray-100">
                                        <RefreshCw size={8} /> Est. Value
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* Desktop Only: Next/Checkout Shortcut */}
                        {conditionComplete && (
                            <button
                                onClick={() => router.push('/login?redirect=/checkout/exchange')}
                                className="hidden md:flex items-center justify-center w-8 h-8 rounded-full text-white bg-[var(--colour-fsP2)] shadow-sm hover:scale-105 transition-all"
                            >
                                <ArrowRight size={14} />
                            </button>
                        )}
                    </div>
                </div>
            )}

            {/* ══════════════════════════════════════
                BLOG / LATEST ARTICLES
            ══════════════════════════════════════ */}
            {blogSection && (
                <div className="bg-white border-t border-gray-100">
                    <div className="container mx-auto px-4 lg:px-8 max-w-7xl">
                        {blogSection}
                    </div>
                </div>
            )}
        </main>
    )
}

// ── Shared components ─────────────────────────────────────────────────────────



function ActiveDot({ size = 'medium' }: { size?: 'small' | 'medium' }) {
    const s = size === 'small' ? 'w-4 h-4' : 'w-5 h-5'
    return (
        <div className={cn("absolute -top-1.5 -right-1.5 rounded-full flex items-center justify-center z-10 shadow-lg ring-2 ring-white animate-in zoom-in duration-300", s)} style={{ background: 'var(--colour-fsP2)' }}>
            <Check style={{ width: size === 'small' ? 8 : 10, height: size === 'small' ? 8 : 10, color: '#fff' }} />
        </div>
    )
}

function FieldError({ msg }: { msg?: string }) {
    if (!msg) return null
    return (
        <p className="text-[11px] text-red-500 mt-1 flex items-center gap-1 font-bold">
            <AlertCircle style={{ width: 11, height: 11 }} />{msg}
        </p>
    )
}