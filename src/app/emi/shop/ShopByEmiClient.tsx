'use client'

import React, { useState, useMemo, useEffect, useCallback } from 'react'
import Image from 'next/image'
import { useSearchParams } from 'next/navigation'
import { cn } from '@/lib/utils'
import { ChevronDown, SlidersHorizontal, ShoppingBag, Loader2, Search, X } from 'lucide-react'
import RemoteServices from '@/app/api/remoteservice'
import { ProductSummary } from '@/app/types/ProductDetailsTypes'
import EmiProductCard, { EmiProductCardSkeleton } from '@/app/products/ProductCards/EmiProductCard'

// ─── Types ───────────────────────────────────────────────────
interface Brand {
    id: number
    name: string
    slug: string
    brand_image?: { full: string; thumb: string }
}

const TENURE_OPTIONS = [6, 9, 12, 18]
const SORT_OPTIONS = ['Popularity', 'Price: Low → High', 'Price: High → Low']
const PER_PAGE = 12

export default function ShopByEmiClient() {
    const searchParams = useSearchParams()
    const initialBudget = Number(searchParams.get('budget')) || 5000

    // ─── State ───
    const [budget, setBudget] = useState(initialBudget)
    const [tenure, setTenure] = useState(12)
    const [downPaymentStr, setDownPaymentStr] = useState('0')
    const downPayment = Number(downPaymentStr) || 0
    const [zeroEmi, setZeroEmi] = useState(true)
    const [sortBy, setSortBy] = useState('Popularity')
    const [showSortDropdown, setShowSortDropdown] = useState(false)
    const [searchQuery, setSearchQuery] = useState('')

    // Brand filter
    const [allBrands, setAllBrands] = useState<Brand[]>([])
    const [selectedBrands, setSelectedBrands] = useState<number[]>([])

    // Products
    const [products, setProducts] = useState<ProductSummary[]>([])
    const [loading, setLoading] = useState(true)
    const [page, setPage] = useState(1)
    const [hasMore, setHasMore] = useState(true)
    const [loadingMore, setLoadingMore] = useState(false)

    // ─── Fetch Brands ───
    useEffect(() => {
        RemoteServices.getAllBrands()
            .then((res: any) => {
                const brands = res?.data || res || []
                setAllBrands(Array.isArray(brands) ? brands : [])
            })
            .catch(() => setAllBrands([]))
    }, [])

    // ─── Compute max price from budget ───
    const maxAffordablePrice = useMemo(() => {
        // max product price = (budget * tenure) + downPayment
        const factor = zeroEmi ? 1 : 1 / (1 + 0.12 * (tenure / 12))
        return Math.round(budget * tenure * factor + downPayment)
    }, [budget, tenure, downPayment, zeroEmi])

    // ─── Filter brands by affordable price range ───
    const visibleBrands = useMemo(() => {
        // Show all brands but only those that have products in an affordable range
        // Since we can't know brand-product price mapping client side,
        // show all brands and let the API filter
        return allBrands
    }, [allBrands])

    // ─── Sort mapping ───
    const sortParam = useMemo(() => {
        if (sortBy === 'Price: Low → High') return 'price_asc'
        if (sortBy === 'Price: High → Low') return 'price_desc'
        return 'popular'
    }, [sortBy])

    // ─── Fetch Products ───
    const fetchProducts = useCallback(async (pageNum: number, append: boolean = false) => {
        if (pageNum === 1) setLoading(true)
        else setLoadingMore(true)

        try {
            const params: any = {
                page: pageNum,
                per_page: PER_PAGE,
                search: searchQuery || undefined,
            }
            if (selectedBrands.length > 0) {
                params.brands = selectedBrands.join(',')
            }

            const res = await RemoteServices.searchProducts(params)
            const data = res?.data || res?.products || []
            const productList: ProductSummary[] = Array.isArray(data) ? data : []

            if (append) {
                setProducts(prev => [...prev, ...productList])
            } else {
                setProducts(productList)
            }
            setHasMore(productList.length >= PER_PAGE)
        } catch {
            if (!append) setProducts([])
            setHasMore(false)
        } finally {
            setLoading(false)
            setLoadingMore(false)
        }
    }, [searchQuery, selectedBrands])

    // Refetch when filters change
    useEffect(() => {
        setPage(1)
        fetchProducts(1, false)
    }, [fetchProducts])

    // ─── Compute EMI for each product ───
    const productsWithEmi = useMemo(() => {
        return products
            .map((p) => {
                const price = Number(p.discounted_price || p.price) || 0
                const financedAmount = Math.max(price - downPayment, 0)
                const monthlyEmi = zeroEmi
                    ? financedAmount / tenure
                    : (financedAmount * (1 + 0.12 * (tenure / 12))) / tenure
                return { ...p, monthlyEmi: Math.round(monthlyEmi), numericPrice: price }
            })
            .filter((p) => p.monthlyEmi <= budget && p.monthlyEmi > 0)
            .sort((a, b) => {
                if (sortBy === 'Price: Low → High') return a.numericPrice - b.numericPrice
                if (sortBy === 'Price: High → Low') return b.numericPrice - a.numericPrice
                return 0
            })
    }, [products, budget, tenure, downPayment, zeroEmi, sortBy])

    // ─── Toggle brand ───
    const toggleBrand = (id: number) => {
        setSelectedBrands(prev =>
            prev.includes(id) ? prev.filter(b => b !== id) : [...prev, id]
        )
    }

    const loadMore = () => {
        const nextPage = page + 1
        setPage(nextPage)
        fetchProducts(nextPage, true)
    }

    return (
        <div className="min-h-screen bg-[var(--colour-bg4)]">

            {/* ═══ HERO ═══ */}
            <section className="relative bg-gradient-to-br from-[#E8F0FE] via-[#F0F6FF] to-[#E0ECFA] pt-8 pb-16 md:pt-10 md:pb-20 overflow-hidden">
                <div className="absolute top-0 right-0 w-72 h-72 bg-[var(--colour-fsP2)]/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4" />
                <div className="absolute bottom-0 left-0 w-52 h-52 bg-[var(--colour-fsP1)]/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/4" />
                <div className="container mx-auto px-4 lg:px-8 relative z-10 flex flex-col md:flex-row items-center gap-8 md:gap-12">

                    {/* Text */}
                    <div className="flex-1 text-center md:text-left">

                        <div className="inline-flex items-center gap-2 bg-white/70 backdrop-blur-sm border border-[var(--colour-fsP2)]/20 rounded-full px-4 py-1.5 mb-4 shadow-sm">
                            <ShoppingBag className="w-4 h-4 text-[var(--colour-fsP2)]" />
                            <span className="text-xs font-bold text-[var(--colour-fsP2)] uppercase tracking-wider">Shop by EMI</span>
                        </div>
                        <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-[var(--colour-fsP2)] mb-3 tracking-tight">
                            EMI Budget-Based Browsing
                        </h1>
                        <p className="text-[var(--colour-text3)] text-base md:text-lg max-w-xl leading-relaxed">
                            Find products that fit your monthly EMI budget. Set your budget, choose a tenure, and discover what you can afford.
                        </p>
                    </div>

                    {/* Image */}
                    <div className="w-48 h-48 md:w-64 md:h-64 lg:w-72 lg:h-72 relative shrink-0">
                        <div className="absolute inset-0 bg-[var(--colour-fsP2)]/8 rounded-full blur-2xl scale-110" />
                        <Image src="/imgfile/logoimg.png" alt="Shop by EMI - Fatafat Sewa" fill className="object-contain drop-shadow-2xl relative z-10" sizes="(max-width: 768px) 192px, 288px" priority />
                    </div>

                </div>
            </section>



            {/* ═══ FILTERS ═══ */}
            <div className="container mx-auto px-4 lg:px-8 -mt-8 md:-mt-12 relative z-20 pb-12">
                <div className="bg-white rounded-2xl shadow-lg border border-[var(--colour-border3)] p-5 sm:p-7 mb-8 space-y-5">

                    {/* Budget Slider */}
                    <div className="space-y-3">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                            <label className="text-sm font-bold text-[var(--colour-text2)]" htmlFor="budget-slider">
                                My Monthly Budget:
                                <span className="text-xl md:text-2xl font-extrabold text-[var(--colour-fsP2)] ml-2">
                                    NPR {budget.toLocaleString()}
                                </span>
                                <span className="text-[var(--colour-text3)] font-normal text-sm"> / month</span>
                            </label>
                            <div className="relative self-end sm:self-auto">
                                <button
                                    onClick={() => setShowSortDropdown(!showSortDropdown)}
                                    className="flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-[var(--colour-text2)] bg-[var(--colour-bg4)] border border-[var(--colour-border3)] rounded-lg px-2.5 py-1.5 sm:px-3 sm:py-2 hover:border-[var(--colour-fsP2)]/40 transition-colors cursor-pointer"
                                    aria-label="Sort products"
                                >
                                    Sort By: <span className="text-[var(--colour-fsP2)]">{sortBy}</span>
                                    <ChevronDown className={cn("w-3.5 h-3.5 text-[var(--colour-text3)] transition-transform", showSortDropdown && "rotate-180")} />
                                </button>
                                {showSortDropdown && (
                                    <div className="absolute right-0 top-full mt-1 bg-white border border-[var(--colour-border3)] rounded-xl shadow-lg z-30 min-w-[180px] overflow-hidden">
                                        {SORT_OPTIONS.map((opt) => (
                                            <button
                                                key={opt}
                                                onClick={() => { setSortBy(opt); setShowSortDropdown(false) }}
                                                className={cn(
                                                    "w-full text-left px-4 py-2.5 text-sm font-medium transition-colors cursor-pointer",
                                                    sortBy === opt ? "bg-[var(--colour-fsP2)]/10 text-[var(--colour-fsP2)] font-bold" : "text-[var(--colour-text2)] hover:bg-[var(--colour-bg4)]"
                                                )}
                                            >
                                                {opt}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                        <input
                            id="budget-slider"
                            type="range"
                            min={2000}
                            max={20000}
                            step={500}
                            value={budget}
                            onChange={(e) => setBudget(Number(e.target.value))}
                            className="w-full h-2 bg-gray-200 rounded-full appearance-none cursor-pointer accent-[var(--colour-fsP2)]"
                            aria-label={`Monthly budget slider, currently NPR ${budget.toLocaleString()}`}
                        />
                        <div className="flex justify-between text-xs text-[var(--colour-text3)] font-medium">
                            <span>NPR 2,000</span>
                            <span>NPR 10,000</span>
                            <span>NPR 20,000</span>
                        </div>
                    </div>

                    {/* Tenure + Down Payment + EMI Type */}
                    <div className="grid grid-cols-2 md:grid-cols-[1fr_auto_auto] gap-x-4 gap-y-4 items-end">
                        {/* Tenure Pills */}
                        <div className="space-y-3 col-span-2 md:col-span-1">
                            <label htmlFor="tenure-selector" className="text-xs font-semibold text-[var(--colour-text3)] uppercase tracking-wider">Tenure</label>
                            <div id="tenure-selector" role="group" aria-label="Select EMI tenure" className="flex gap-1.5 mt-2">
                                {TENURE_OPTIONS.map((m) => (
                                    <button
                                        key={m}
                                        onClick={() => setTenure(m)}
                                        className={cn(
                                            "px-3 py-2 rounded-full text-sm font-bold border transition-all cursor-pointer",
                                            tenure === m
                                                ? "bg-[var(--colour-fsP2)] text-white border-[var(--colour-fsP2)] shadow-sm"
                                                : "bg-[var(--colour-bg4)] text-[var(--colour-text2)] border-[var(--colour-fsP2)]/30"
                                        )}
                                        aria-label={`${m} months EMI tenure`}
                                        aria-pressed={tenure === m}
                                    >
                                        {m}&nbsp;mon
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Down Payment */}
                        <div className="space-y-1.5 space-x-1">
                            <label htmlFor="down-payment" className="text-xs font-semibold text-[var(--colour-text3)] uppercase tracking-wider">Down Payment</label>
                            <div className="relative mt-2">
                                <span className="absolute inset-y-0 left-3 flex items-center text-xs font-bold text-[var(--colour-fsP2)] pointer-events-none">NPR</span>
                                <input
                                    id="down-payment"
                                    type="text"
                                    inputMode="numeric"
                                    value={downPaymentStr}
                                    onChange={(e) => {
                                        const val = e.target.value
                                        if (val === '' || /^\d*$/.test(val)) setDownPaymentStr(val)
                                    }}
                                    maxLength={6}
                                    onBlur={() => { if (downPaymentStr === '') setDownPaymentStr('0') }}
                                    className="w-full pl-12 pr-3 py-2 bg-[var(--colour-bg4)] border border-[var(--colour-border3)] rounded-xl focus:border-[var(--colour-fsP2)] focus:ring-2 focus:ring-[var(--colour-fsP2)]/10 outline-none font-bold text-sm text-[var(--colour-text2)] transition-all"
                                />
                            </div>
                        </div>

                        {/* EMI Type Toggle */}
                        <div className="space-y-1.5 flex flex-col">
                            <label htmlFor="interest-type" className="text-xs font-semibold text-[var(--colour-text3)] uppercase tracking-wider">Interest</label>
                            <div id="interest-type" role="group" aria-label="Select interest type" className="inline-flex bg-[var(--colour-bg4)] rounded-full p-0.5 mt-2">
                                <button
                                    onClick={() => setZeroEmi(true)}
                                    className={cn(
                                        "sm:px-4 px-2 sm:py-2 py-1 rounded-full text-sm font-bold transition-all cursor-pointer",
                                        zeroEmi
                                            ? "bg-[var(--colour-fsP2)] text-white shadow-sm"
                                            : "text-[var(--colour-text3)] hover:text-[var(--colour-text2)]"
                                    )}
                                    aria-label="Select zero percent EMI"
                                    aria-pressed={zeroEmi}
                                >
                                    0% EMI
                                </button>
                                <button
                                    onClick={() => setZeroEmi(false)}
                                    className={cn(
                                        "sm:px-4 px-2 sm:py-2 py-1 rounded-full text-sm font-bold transition-all cursor-pointer",
                                        !zeroEmi
                                            ? "bg-[var(--colour-fsP2)] text-white shadow-sm"
                                            : "text-[var(--colour-text3)] hover:text-[var(--colour-text2)]"
                                    )}
                                    aria-label="Select EMI with interest"
                                    aria-pressed={!zeroEmi}
                                >
                                    Interest
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* ═══ Brands + Search — inside card ═══ */}
                    <div className="border-t border-[var(--colour-border3)] pt-4 mt-1 space-y-3">
                        {/* Search */}
                        <div className="relative w-full sm:w-56">
                            <label htmlFor="product-search" className="sr-only">Search products</label>
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[var(--colour-text3)]" />
                            <input
                                id="product-search"
                                type="text"
                                placeholder="Search products..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-8 pr-7 py-1.5 bg-[var(--colour-bg4)] border border-[var(--colour-border3)] rounded-full text-xs font-medium text-[var(--colour-text2)] placeholder:text-[var(--colour-text3)] focus:border-[var(--colour-fsP2)] outline-none transition-all"
                            />
                            {searchQuery && (
                                <button onClick={() => setSearchQuery('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 cursor-pointer" aria-label="Clear search">
                                    <X className="w-3 h-3 text-[var(--colour-text3)]" />
                                </button>
                            )}
                        </div>

                        {/* Brand Pills - wrapping */}
                        {visibleBrands.length > 0 && (
                            <div className="flex flex-wrap items-center gap-1.5">
                                {visibleBrands.slice(0, 24).map((brand) => (
                                    <button
                                        key={brand.id}
                                        onClick={() => toggleBrand(brand.id)}
                                        className={cn(
                                            "px-2.5 py-1 rounded-full text-[11px] font-semibold border whitespace-nowrap transition-all cursor-pointer",
                                            selectedBrands.includes(brand.id)
                                                ? "bg-[var(--colour-fsP2)] text-white border-[var(--colour-fsP2)]"
                                                : "bg-white text-[var(--colour-text3)] border-[var(--colour-border3)] hover:border-[var(--colour-fsP2)]/40 hover:text-[var(--colour-fsP2)]"
                                        )}
                                        aria-label={`Filter by ${brand.name}`}
                                    >
                                        {brand.name}
                                    </button>
                                ))}
                                {selectedBrands.length > 0 && (
                                    <button
                                        onClick={() => setSelectedBrands([])}
                                        className="text-[11px] font-semibold text-red-500 hover:underline cursor-pointer flex items-center gap-0.5"
                                        aria-label="Clear brand filters"
                                    >
                                        <X className="w-3 h-3" /> Clear
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* ═══ RESULTS HEADER ═══ */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-5">
                    <div>
                        <p className="text-[var(--colour-text2)] text-base font-semibold">
                            Showing Results for: <span className="font-extrabold text-[var(--colour-fsP2)]">Up to NPR {budget.toLocaleString()} / Month EMI</span>
                        </p>
                        <p className="text-xs text-[var(--colour-text3)] mt-0.5">
                            Max affordable price: NPR {maxAffordablePrice.toLocaleString()} · {tenure} months · {zeroEmi ? '0% interest' : 'with interest'}
                            {selectedBrands.length > 0 && ` · ${selectedBrands.length} brand${selectedBrands.length > 1 ? 's' : ''} selected`}
                        </p>
                    </div>
                    <div className="flex items-center gap-1.5 text-sm text-[var(--colour-text3)]">
                        <SlidersHorizontal className="w-4 h-4" />
                        {productsWithEmi.length} product{productsWithEmi.length !== 1 ? 's' : ''}
                    </div>
                </div>

                {/* ═══ PRODUCT GRID ═══ */}
                {loading ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-3 lg:gap-4">
                        {Array.from({ length: 10 }).map((_, i) => (
                            <EmiProductCardSkeleton key={i} />
                        ))}
                    </div>
                ) : productsWithEmi.length > 0 ? (
                    <>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-3 lg:gap-4">
                            {productsWithEmi.map((product, idx) => (
                                <EmiProductCard
                                    key={product.id}
                                    product={product}
                                    tenure={tenure}
                                    zeroEmi={zeroEmi}
                                    downPayment={downPayment}
                                    index={idx}
                                    priority={idx < 5}
                                />
                            ))}
                        </div>

                        {/* Load More */}
                        {hasMore && (
                            <div className="text-center mt-8">
                                <button
                                    onClick={loadMore}
                                    disabled={loadingMore}
                                    className="inline-flex items-center gap-2 bg-white border-2 border-[var(--colour-border3)] hover:border-[var(--colour-fsP2)]/40 text-[var(--colour-text2)] font-bold text-sm px-8 py-3 rounded-full transition-all hover:shadow-md cursor-pointer disabled:opacity-50"
                                    aria-label="Load more products"
                                >
                                    {loadingMore ? (
                                        <>
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                            Loading...
                                        </>
                                    ) : (
                                        <>
                                            Load More Products
                                            <ChevronDown className="w-4 h-4" />
                                        </>
                                    )}
                                </button>
                            </div>
                        )}
                    </>
                ) : (
                    <div className="text-center py-16 bg-white rounded-2xl border border-[var(--colour-border3)]">
                        <div className="w-16 h-16 bg-[var(--colour-fsP2)]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                            <ShoppingBag className="w-7 h-7 text-[var(--colour-fsP2)]" />
                        </div>
                        <h2 className="text-lg font-bold text-[var(--colour-text2)] mb-1.5">No products found</h2>
                        <p className="text-sm text-[var(--colour-text3)] max-w-sm mx-auto mb-4">
                            {products.length > 0
                                ? 'Try increasing your monthly budget or reducing the down payment to see products in your EMI range.'
                                : 'Try adjusting your search or filters to discover products.'}
                        </p>
                        {(selectedBrands.length > 0 || searchQuery) && (
                            <button
                                onClick={() => { setSelectedBrands([]); setSearchQuery('') }}
                                className="text-sm font-semibold text-[var(--colour-fsP2)] hover:underline cursor-pointer"
                                aria-label="Clear all filters"
                            >
                                Clear All Filters
                            </button>
                        )}
                    </div>
                )}
            </div>
        </div>
    )
}
