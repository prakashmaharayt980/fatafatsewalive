'use client'

import React, { useState, useMemo, useRef, useCallback, useEffect, useTransition } from 'react'
import {
    ChevronRight, ChevronDown, ShieldCheck, Smartphone, Zap, Wrench, MapPin, Clock,
    Check, Search, ArrowRight, Upload, X, Phone, User, FileText, Star, Truck, Package,
    Camera, Droplets, Cpu, CircleDot, AlertTriangle, Award, Navigation, Edit2, Home
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import Image from 'next/image'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import RemoteServices from '@/app/api/remoteservice'
import {
    REPAIR_CATEGORIES, PICKUP_LOCATIONS, REPAIR_SERVICES, CROSS_SELL_ITEMS,
    getRepairEstimate, getRepairLabels, initialRepairForm, RepairFormData
} from './repair-helpers'
import RepairSEOSections from './RepairSEOSections'
import { useAddress } from '@/app/context/AddressContext'

interface BrandItem { id: number; name: string; slug: string; image?: string }
interface ProductListItem {
    id: number | string; name: string; slug: string;
    image: { full: string; thumb: string; preview: string } | string;
    price: number | string; discounted_price: number | string;
}

// Lazy-loaded component for conditional repair selection block
const RepairSelector = dynamic(() => import('./RepairSelector'), {
    loading: () => <div className="min-h-[300px] rounded-2xl border-2 border-gray-100 bg-gray-50 animate-pulse mb-8" />
})

const GoogleMapAddress = dynamic(() => import('@/app/checkout/GoogleMapAddress'), {
    loading: () => <div className="h-[250px] w-full bg-gray-50 border border-gray-100 rounded-xl animate-pulse flex items-center justify-center"><MapPin className="text-gray-300 w-8 h-8" /></div>,
    ssr: false
})

interface RepairClientProps { brands: BrandItem[] }

export default function RepairClient({ brands }: RepairClientProps) {
    const router = useRouter()
    useEffect(() => { window.scrollTo(0, 0) }, [])

    // ── State ────────────────────────────────────────────────
    const { storeLocations, fetchStoreLocations, userLocation, setUserLocation } = useAddress()
    const [addressEntryMode, setAddressEntryMode] = useState<'saved' | 'gps' | 'manual'>('saved')

    const [form, setForm] = useState<RepairFormData & { agreedToTerms: boolean }>({
        ...initialRepairForm,
        address: 'Koteshwor-32, Kathmandu', // Simulated default address
        agreedToTerms: false
    })
    const [products, setProducts] = useState<ProductListItem[]>([])
    const [isLoadingProducts, setIsLoadingProducts] = useState(false)
    const [searchTerm, setSearchTerm] = useState('')
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [formErrors, setFormErrors] = useState<Record<string, string>>({})

    // Refs for scrolling
    const modelRef = useRef<HTMLDivElement>(null)
    const repairRef = useRef<HTMLDivElement>(null)
    const issueRef = useRef<HTMLDivElement>(null)
    const pickupRef = useRef<HTMLDivElement>(null)
    const detailsRef = useRef<HTMLDivElement>(null)
    const reviewRef = useRef<HTMLDivElement>(null)
    const fileInputRef = useRef<HTMLInputElement>(null)
    const searchTimerRef = useRef<NodeJS.Timeout | null>(null)

    // IntersectionObserver for form animation
    const formSectionRef = useRef<HTMLDivElement>(null)
    const [formVisible, setFormVisible] = useState(false)
    useEffect(() => {
        fetchStoreLocations()

        if (!formSectionRef.current) return
        const observer = new IntersectionObserver(
            (entries) => entries.forEach(entry => entry.isIntersecting && entry.target.classList.add('animate-in')),
            { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
        )
        observer.observe(formSectionRef.current)
        return () => observer.disconnect()
    }, [])

    // ── Estimate ─────────────────────────────────────────────
    const estimate = useMemo(() => getRepairEstimate(form.selectedRepairs), [form.selectedRepairs])
    const repairLabels = useMemo(() => getRepairLabels(form.selectedRepairs), [form.selectedRepairs])

    // ── Handlers ─────────────────────────────────────────────
    const update = (partial: Partial<RepairFormData & { agreedToTerms: boolean }>) => setForm(prev => ({ ...prev, ...partial }))

    const fetchProducts = useCallback(async (brandSlug: string, search?: string) => {
        setIsLoadingProducts(true)
        try {
            let res
            if (search?.trim()) {
                res = await RemoteServices.searchProducts({ search: search.trim(), per_page: 20 })
            } else {
                res = await RemoteServices.getBrandProducts(brandSlug, { per_page: 20 })
            }
            setProducts(res?.data || [])
        } catch { setProducts([]) }
        setIsLoadingProducts(false)
    }, [])

    // Product cache to avoid re-fetching
    const productCacheRef = useRef<Record<string, ProductListItem[]>>({})

    const handleBrandSelect = (brand: BrandItem) => {
        update({ brand: brand.slug, productId: null, productName: '', productImage: '' })
        setSearchTerm('')
        // Use cache if available
        if (productCacheRef.current[brand.slug]) {
            setProducts(productCacheRef.current[brand.slug])
        } else {
            setProducts([])
            fetchProducts(brand.slug).then(() => {
                // Will be updated after fetch completes
            })
        }
        setTimeout(() => modelRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100)
    }

    // Cache products after fetch
    useEffect(() => {
        if (form.brand && products.length > 0 && !productCacheRef.current[form.brand]) {
            productCacheRef.current[form.brand] = products
        }
    }, [products, form.brand])

    const handleSearch = (value: string) => {
        setSearchTerm(value)
        if (searchTimerRef.current) clearTimeout(searchTimerRef.current)
        if (value.length >= 2 && form.brand) {
            searchTimerRef.current = setTimeout(() => fetchProducts(form.brand, value), 300)
        }
    }

    const handleSelectProduct = (product: ProductListItem) => {
        const img = typeof product.image === 'string' ? product.image : product.image?.thumb || '/imgfile/logoimg.png'
        update({ productId: String(product.id), productName: product.name, productImage: img })
        setTimeout(() => repairRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100)
    }

    const toggleRepair = (id: string) => {
        const current = form.selectedRepairs
        const next = current.includes(id) ? current.filter(r => r !== id) : [...current, id]
        update({ selectedRepairs: next })
    }

    const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || [])
        const maxFiles = 5
        const remaining = maxFiles - form.photos.length
        const toAdd = files.slice(0, remaining)
        if (toAdd.length === 0) return

        const newPhotos = [...form.photos, ...toAdd]
        const newUrls = [...form.photoUrls]
        for (const file of toAdd) {
            const reader = new FileReader()
            reader.onload = () => {
                newUrls.push(reader.result as string)
                update({ photoUrls: [...newUrls] })
            }
            reader.readAsDataURL(file)
        }
        update({ photos: newPhotos })
    }

    const removePhoto = (index: number) => {
        update({
            photos: form.photos.filter((_, i) => i !== index),
            photoUrls: form.photoUrls.filter((_, i) => i !== index),
        })
    }

    const validateForm = (): boolean => {
        const errors: Record<string, string> = {}
        if (!form.productId) errors.product = 'Please select a device'
        if (form.selectedRepairs.length === 0) errors.repairs = 'Select at least one repair'
        if (!form.address.trim()) errors.address = 'Pickup address is required'
        if (!form.agreedToTerms) errors.terms = 'You must agree to the terms and conditions'
        setFormErrors(errors)
        return Object.keys(errors).length === 0
    }

    const handleSubmit = async () => {
        if (!validateForm()) return
        setIsSubmitting(true)
        // In production, this would call an API
        await new Promise(r => setTimeout(r, 1500))
        setIsSubmitting(false)

        const params = new URLSearchParams({
            name: 'Verified User',
            phone: '+977 9800000000',
            device: form.productName,
            image: form.productImage,
            repairs: form.selectedRepairs.join(','),
            pickup: 'pickup',
            address: form.address,
            estMin: '',
            estMax: '',
        })
        router.push(`/repair/success?${params.toString()}`)
    }

    const getProductImage = (p: ProductListItem) => {
        if (typeof p.image === 'string') return p.image
        return p.image?.thumb || p.image?.full || '/imgfile/logoimg.png'
    }

    // ── Render ───────────────────────────────────────────────
    // Next steps
    const nextStep = useMemo(() => {
        if (!form.brand) return null
        if (!form.productId) return { label: 'Select Model', action: () => modelRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }) }
        if (form.selectedRepairs.length === 0) return { label: 'Select Repairs', action: () => repairRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }) }
        if (!form.address) return { label: 'Add Address', action: () => pickupRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }) }
        if (!form.agreedToTerms) return {
            label: 'Review & Submit', action: () => {
                setFormErrors(prev => ({ ...prev, terms: 'Please agree to terms to complete request' }))
                reviewRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
            }
        }
        return { label: 'Submit Request', action: handleSubmit }
    }, [form, handleSubmit])

    return (
        <div className="min-h-screen bg-[var(--colour-bg4)] font-sans antialiased text-[var(--colour-text1)] relative">

            {/* ═══ STICKY ACTION BAR ═══ */}
            {form.brand && form.productId && (
                <div className="fixed top-[88px] sm:top-[85px] left-0 right-0 z-50 animate-in slide-in-from-top-6 fade-in duration-300">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="bg-white border text-[var(--colour-text2)] border-[var(--colour-border3)] shadow-sm rounded-lg p-2 sm:p-3 flex items-center justify-between gap-3 sm:gap-6 mt-2">
                            <button
                                onClick={() => modelRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
                                className="flex items-center gap-3 sm:gap-4 cursor-pointer group hover:opacity-80 transition-opacity outline-none"
                                title="Click to change model"
                            >
                                <div className="relative w-10 h-10 sm:w-12 sm:h-12 bg-gray-50/80 p-0.5 border border-gray-100 rounded-full flex-shrink-0 flex items-center justify-center shadow-inner overflow-hidden group-hover:bg-gray-100 transition-colors">
                                    {form.productImage ? (
                                        <Image src={form.productImage} alt={form.productName} fill className="object-contain p-2" />
                                    ) : (
                                        <Smartphone className="w-5 h-5 text-gray-400" />
                                    )}
                                </div>
                                <div className="flex flex-col py-1 text-left">
                                    <span className="text-[13px] sm:text-[15px] text-gray-900 font-extrabold leading-tight line-clamp-1 max-w-[130px] sm:max-w-[200px]">
                                        {form.productName || 'Select Model'}
                                    </span>
                                    <div className="flex items-center gap-1.5 mt-0.5">
                                        {form.selectedRepairs.length > 0 ? (
                                            <span className="inline-flex items-center gap-1 text-[var(--colour-fsP1)] text-[11px] sm:text-[12px] font-bold">
                                                <Wrench className="w-3.5 h-3.5" /> {form.selectedRepairs.length} Repair{form.selectedRepairs.length > 1 ? 's' : ''}
                                            </span>
                                        ) : (
                                            <span className="text-[11px] sm:text-[12px] text-gray-400 font-medium">No repairs selected</span>
                                        )}
                                    </div>
                                </div>
                            </button>
                            {nextStep && (
                                <div>
                                    <Button
                                        onClick={nextStep.action}
                                        disabled={isSubmitting}
                                        className={`transition-all duration-200 text-white font-bold h-10 sm:h-11 px-5 sm:px-6 rounded-lg whitespace-nowrap text-[13px] tracking-wide ${isSubmitting ? 'cursor-not-allowed opacity-60 flex gap-2' : 'flex gap-2'} ${nextStep.label === 'Submit Request'
                                            ? 'bg-[#0D5500] hover:bg-[#0a4400]'
                                            : 'bg-[var(--colour-fsP1)] hover:bg-[var(--colour-bg2)]'
                                            }`}
                                    >
                                        {isSubmitting ? <><div className="animate-spin rounded-full h-3.5 w-3.5 border-b-2 border-white" /> Submitting...</> : <>{nextStep.label} <ArrowRight className="h-4 w-4" /></>}
                                    </Button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Spacer for sticky bar */}
            {form.brand && form.productId && <div className="h-16" />}
            <main className="min-h-screen bg-[var(--colour-bg4)] font-sans text-[var(--colour-text2)] pb-24">

                {/* ═══ HERO ═══ */}
                <section className="relative overflow-hidden bg-gradient-to-br from-[#FEF3E8] via-[#FFF7F0] to-[#FAE8D4] pt-10 pb-20 md:pt-14 md:pb-28">
                    <div className="container mx-auto px-4 lg:px-8">
                        <div className="flex flex-col md:flex-row items-center justify-between gap-8 md:gap-12">
                            <div className="md:w-1/2 space-y-5 text-center md:text-left z-10">
                                <nav className="flex items-center gap-1.5 text-sm mb-2 justify-center md:justify-start" aria-label="Breadcrumb">
                                    <Link href="/" className="text-[var(--colour-fsP2)] hover:text-[var(--colour-fsP1)] font-medium transition-colors">Home</Link>
                                    <ChevronRight className="w-4 h-4 text-gray-400" />
                                    <span className="text-slate-800 font-semibold">Repair</span>
                                </nav>
                                <h1 className="text-4xl md:text-5xl lg:text-[3.5rem] font-extrabold text-[var(--colour-fsP1)] leading-tight tracking-tight">Device Repair</h1>
                                <p className="text-lg md:text-xl font-semibold text-[var(--colour-text2)]">Expert Repair by Certified Technicians</p>
                                <p className="text-[var(--colour-text3)] text-base max-w-md mx-auto md:mx-0">Screen cracked? Battery dying? We fix all brands with genuine parts and a 90-day warranty.</p>
                                <div className="flex flex-wrap gap-3 justify-center md:justify-start">
                                    {[
                                        { icon: <ShieldCheck className="h-4 w-4" />, text: '90-Day Warranty' },
                                        { icon: <Truck className="h-4 w-4" />, text: 'Free Pickup' },
                                        { icon: <Award className="h-4 w-4" />, text: 'Certified Techs' },
                                    ].map((b, i) => (
                                        <span key={i} className="bg-white/80 backdrop-blur-sm border border-[var(--colour-border3)] rounded-full px-3.5 py-1.5 flex items-center gap-2 text-xs font-semibold text-[var(--colour-text2)]">
                                            <span className="text-[var(--colour-fsP1)]">{b.icon}</span> {b.text}
                                        </span>
                                    ))}
                                </div>
                            </div>
                            <div className="md:w-1/2 relative flex justify-center">
                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[280px] h-[280px] md:w-[360px] md:h-[360px] bg-[var(--colour-fsP1)]/10 rounded-full blur-3xl" />
                                <div className="relative z-10 w-full max-w-[350px] md:max-w-[400px] aspect-square">
                                    <Image src="/imgfile/logoimg.png" alt="Device Repair - Fatafat Sewa" fill className="object-contain drop-shadow-2xl" sizes="(max-width: 768px) 100vw, 50vw" priority fetchPriority="high" />
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* ═══ REPAIR FORM ═══ */}
                <section ref={formSectionRef} className="relative z-20 -mt-12 mb-12 container mx-auto px-4 lg:px-8">
                    <Card className="bg-white border-none shadow-[var(--shadow-premium-lg)] rounded-2xl overflow-visible">
                        <div className="bg-[var(--colour-fsP1)] px-6 py-3.5 flex items-center gap-3 rounded-t-2xl">
                            <Wrench className="h-5 w-5 text-white/80" />
                            <h2 className="text-white text-lg font-bold">Request a Repair</h2>
                        </div>

                        <CardContent className="p-6 md:p-8">

                            {/* ─── STEP 1: Select Brand ─── */}
                            <div className="mb-10">
                                <div className="flex items-center justify-between mb-5">
                                    <h3 className="text-lg font-extrabold text-[var(--colour-text2)] flex items-center gap-2.5">
                                        <span className="bg-[var(--colour-fsP1)] text-white w-7 h-7 rounded-full flex items-center justify-center text-sm shadow-md shadow-[var(--colour-fsP1)]/20">1</span>
                                        Select Brand
                                    </h3>
                                </div>
                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4 max-h-[400px] overflow-y-auto pr-1 scrollbar-thin">
                                    {brands.map((brand) => (
                                        <button key={brand.id} onClick={() => handleBrandSelect(brand)} style={{ cursor: 'pointer' }}
                                            className={cn('relative flex items-center justify-center h-14 px-4 rounded-xl border-2 transition-all duration-200 hover:shadow-md hover:-translate-y-0.5',
                                                form.brand === brand.slug ? 'border-[var(--colour-fsP1)] bg-[var(--colour-fsP1)]/5 shadow-sm ring-1 ring-[var(--colour-fsP1)]/20 text-[var(--colour-fsP1)]' : 'border-gray-200 bg-white hover:border-[var(--colour-fsP1)]/40 text-[var(--colour-text2)]')}>
                                            {form.brand === brand.slug && <div className="absolute top-1.5 right-1.5 w-4 h-4 bg-[var(--colour-fsP1)] rounded-full flex items-center justify-center shadow-sm animate-in zoom-in duration-200"><Check className="h-2.5 w-2.5 text-white stroke-[3]" /></div>}
                                            <span className="text-[13px] font-extrabold uppercase tracking-wide truncate max-w-full px-2">{brand.name}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* ─── STEP 2: Select Model ─── */}
                            {form.brand && (
                                <div ref={modelRef} className="scroll-mt-32 mb-10 animate-fade-in">
                                    <div className="flex items-center justify-between mb-5">
                                        <h3 className="text-lg font-extrabold text-[var(--colour-text2)] flex items-center gap-2.5">
                                            <span className="bg-[var(--colour-fsP1)] text-white w-7 h-7 rounded-full flex items-center justify-center text-sm shadow-md shadow-[var(--colour-fsP1)]/20">2</span>
                                            Select Device
                                        </h3>
                                    </div>
                                    <div className="relative mb-4 max-w-md">
                                        <Search className="absolute left-3.5 top-3.5 h-4 w-4 text-[var(--colour-fsP1)]" />
                                        <Input placeholder="Search model..." className="pl-10 pr-10 h-12 bg-white border-2 border-[var(--colour-fsP1)]/30 rounded-xl text-sm font-medium focus:border-[var(--colour-fsP1)] focus:ring-2 focus:ring-[var(--colour-fsP1)]/20 transition-all placeholder:text-[var(--colour-text3)]/60"
                                            value={searchTerm} onChange={e => handleSearch(e.target.value)} />
                                        {isLoadingProducts && <div className="absolute right-3.5 top-3.5"><div className="animate-spin rounded-full h-4 w-4 border-2 border-[var(--colour-fsP1)] border-t-transparent" /></div>}
                                    </div>

                                    {isLoadingProducts && products.length === 0 ? (
                                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                                            {Array.from({ length: 8 }).map((_, i) => (
                                                <div key={i} className="flex flex-col items-center p-3 rounded-xl border-2 border-gray-100 bg-white animate-pulse" style={{ animationDelay: `${i * 75}ms` }}>
                                                    <div className="w-16 h-16 bg-gray-100 rounded-lg mb-2" />
                                                    <div className="w-20 h-3 bg-gray-100 rounded mb-1" />
                                                    <div className="w-14 h-2.5 bg-gray-50 rounded" />
                                                </div>
                                            ))}
                                        </div>
                                    ) : products.length > 0 ? (
                                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 max-h-[420px] overflow-y-auto pr-1 scrollbar-thin">
                                            {products.map((product, idx) => (
                                                <button key={product.id} onClick={() => handleSelectProduct(product)} style={{ cursor: 'pointer', animationDelay: `${idx * 40}ms` }}
                                                    className={cn('relative flex flex-col items-center p-3 rounded-xl border-2 transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5 animate-in fade-in slide-in-from-bottom-2',
                                                        form.productId === String(product.id) ? 'border-[var(--colour-fsP1)] bg-orange-50 shadow-md ring-1 ring-[var(--colour-fsP1)]/20' : 'border-[var(--colour-border3)] bg-white hover:border-[var(--colour-fsP1)]/50')}>
                                                    {form.productId === String(product.id) && <div className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-[var(--colour-fsP1)] rounded-full flex items-center justify-center shadow-sm"><Check className="h-3 w-3 text-white" /></div>}
                                                    <div className="w-16 h-16 flex items-center justify-center mb-2">
                                                        <Image src={getProductImage(product)} alt={product.name} width={64} height={64} className="object-contain transition-transform duration-200 group-hover:scale-105" loading="lazy" />
                                                    </div>
                                                    <span className="text-xs font-semibold text-center leading-tight line-clamp-2 mb-1">{product.name}</span>
                                                    {product.discounted_price && <span className="text-[10px] font-bold text-[var(--colour-fsP1)]">Rs. {Number(product.discounted_price).toLocaleString()}</span>}
                                                </button>
                                            ))}
                                        </div>
                                    ) : form.brand && !isLoadingProducts ? (
                                        <div className="text-center py-10 bg-gray-50/50 rounded-xl border border-dashed border-gray-200">
                                            <Search className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                                            <p className="text-sm font-medium text-gray-400">No devices found</p>
                                            <p className="text-xs text-gray-400 mt-0.5">Try a different brand or search term</p>
                                        </div>
                                    ) : null}
                                </div>
                            )}

                            {/* ─── STEP 3: What Needs Repair? ─── */}
                            {form.productId && (
                                <div ref={repairRef} className="scroll-mt-32">
                                    <RepairSelector
                                        selectedRepairs={form.selectedRepairs}
                                        onToggle={toggleRepair}
                                        error={formErrors.repairs}
                                    />
                                </div>
                            )}

                            {/* ─── STEP 4: Describe Issue ─── */}
                            {form.selectedRepairs.length > 0 && (
                                <div ref={issueRef} className="scroll-mt-32 mb-10 animate-fade-in">
                                    <div className="flex items-center justify-between mb-2">
                                        <h3 className="text-lg font-extrabold text-[var(--colour-text2)] flex items-center gap-2.5">
                                            <span className="bg-[var(--colour-fsP1)] text-white w-7 h-7 rounded-full flex items-center justify-center text-sm shadow-md shadow-[var(--colour-fsP1)]/20">4</span>
                                            Describe the Issue
                                        </h3>
                                    </div>
                                    <p className="text-xs text-gray-500 mb-5 ml-9">Tell us more about the problem (optional photos)</p>

                                    <textarea
                                        value={form.issueDescription}
                                        onChange={e => update({ issueDescription: e.target.value })}
                                        placeholder="E.g. My screen has a crack at the top-right corner and the touch is not responding..."
                                        className="w-full h-32 p-4 border border-[var(--colour-border2)] bg-white rounded-lg text-[13px] leading-relaxed resize-none focus:border-[var(--colour-fsP1)] focus:ring-1 focus:ring-[var(--colour-fsP1)] transition-colors placeholder:text-gray-400 outline-none shadow-sm"
                                    />

                                    {/* Photo Upload */}
                                    <div className="mt-3">
                                        <div className="flex items-center gap-3 flex-wrap">
                                            {form.photoUrls.map((url, i) => (
                                                <div key={i} className="relative w-20 h-20 rounded-lg overflow-hidden border-2 border-[var(--colour-border3)]">
                                                    <Image src={url} alt={`Photo ${i + 1}`} fill className="object-cover" />
                                                    <button onClick={() => removePhoto(i)} className="absolute top-0.5 right-0.5 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center cursor-pointer"><X className="h-3 w-3" /></button>
                                                </div>
                                            ))}
                                            {form.photos.length < 5 && (
                                                <button onClick={() => fileInputRef.current?.click()} className="w-20 h-20 border-2 border-dashed border-[var(--colour-border3)] rounded-lg flex flex-col items-center justify-center gap-1 text-gray-400 hover:border-[var(--colour-fsP1)] hover:text-[var(--colour-fsP1)] transition-colors cursor-pointer">
                                                    <Upload className="h-5 w-5" />
                                                    <span className="text-[9px] font-medium">Add Photo</span>
                                                </button>
                                            )}
                                        </div>
                                        <input ref={fileInputRef} type="file" accept="image/*" multiple onChange={handlePhotoUpload} className="hidden" />
                                        <p className="text-[10px] text-gray-400 mt-1.5">Optional: Upload up to 5 photos of the damage ({form.photos.length}/5)</p>
                                    </div>
                                </div>
                            )}

                            {/* ─── STEP 5: Pickup Location ─── */}
                            {form.selectedRepairs.length > 0 && (
                                <div ref={pickupRef} className="scroll-mt-32 mb-10 animate-fade-in">
                                    <div className="flex items-center justify-between mb-5">
                                        <h3 className="text-lg font-extrabold text-[var(--colour-text2)] flex items-center gap-2.5">
                                            <span className="bg-[var(--colour-fsP1)] text-white w-7 h-7 rounded-full flex items-center justify-center text-sm shadow-md shadow-[var(--colour-fsP1)]/20">5</span>
                                            Pickup Address
                                        </h3>
                                    </div>

                                    <div className="sm:col-span-2 mt-2 space-y-4 max-w-full lg:max-w-3xl">
                                        <label className="text-xs font-semibold text-gray-500 mb-1 block">Where should our delivery partner arrive? *</label>

                                        {/* Entry Mode Tabs */}
                                        <div className="flex p-1 bg-gray-100 rounded-lg max-w-lg">
                                            <button onClick={() => setAddressEntryMode('saved')} className={cn('flex-1 py-2 px-2 text-[11px] sm:text-xs font-bold rounded-md flex items-center justify-center gap-1.5 transition-all outline-none', addressEntryMode === 'saved' ? 'bg-white text-[var(--colour-fsP1)] shadow-sm' : 'text-gray-500 hover:text-gray-700')}>
                                                <Home className="h-3.5 w-3.5" /> Saved Address
                                            </button>
                                            <button onClick={() => setAddressEntryMode('gps')} className={cn('flex-1 py-2 px-2 text-[11px] sm:text-xs font-bold rounded-md flex items-center justify-center gap-1.5 transition-all outline-none', addressEntryMode === 'gps' ? 'bg-white text-[var(--colour-fsP1)] shadow-sm' : 'text-gray-500 hover:text-gray-700')}>
                                                <Navigation className="h-3.5 w-3.5" /> Use Map (GPS)
                                            </button>
                                            <button onClick={() => setAddressEntryMode('manual')} className={cn('flex-1 py-2 px-2 text-[11px] sm:text-xs font-bold rounded-md flex items-center justify-center gap-1.5 transition-all outline-none', addressEntryMode === 'manual' ? 'bg-white text-[var(--colour-fsP1)] shadow-sm' : 'text-gray-500 hover:text-gray-700')}>
                                                <Edit2 className="h-3.5 w-3.5" /> Type Manually
                                            </button>
                                        </div>

                                        {addressEntryMode === 'saved' ? (
                                            <div className="flex items-start gap-4 p-4 rounded-xl border-2 border-[var(--colour-fsP1)] bg-[var(--colour-fsP1)]/5 animate-fade-in relative">
                                                <div className="w-10 h-10 rounded-full bg-[var(--colour-fsP1)] text-white flex items-center justify-center shrink-0">
                                                    <Home className="h-5 w-5" />
                                                </div>
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <span className="text-sm font-bold text-[var(--colour-text2)]">Home Address</span>
                                                        <span className="text-[10px] font-bold px-2 py-0.5 bg-green-100 text-green-700 rounded-full">Default</span>
                                                    </div>
                                                    <p className="text-xs text-gray-600 mb-0.5">Verified User</p>
                                                    <p className="text-xs text-gray-600 mb-2">+977 9800000000</p>
                                                    <p className="text-sm font-medium text-[var(--colour-text2)]">{form.address}</p>
                                                </div>
                                                <div className="absolute top-4 right-4 text-[var(--colour-fsP1)]">
                                                    <Check className="h-5 w-5 stroke-[3]" />
                                                </div>
                                            </div>
                                        ) : addressEntryMode === 'gps' ? (
                                            <div className="rounded-lg overflow-hidden border border-[var(--colour-border2)] shadow-sm relative bg-gray-50 animate-fade-in">
                                                <div className="h-[280px] w-full">
                                                    <GoogleMapAddress
                                                        onLocationSelect={(loc) => {
                                                            setUserLocation(loc as any)
                                                            update({ address: loc.address })
                                                        }}
                                                        initialPosition={userLocation || undefined}
                                                    />
                                                </div>
                                                <div className="p-3 bg-white border-t border-[var(--colour-border2)] flex gap-3 items-center">
                                                    <MapPin className="h-5 w-5 text-[var(--colour-fsP1)] shrink-0" />
                                                    <Input
                                                        value={form.address}
                                                        onChange={e => update({ address: e.target.value })}
                                                        placeholder="Confirm or adjust map address..."
                                                        className="h-10 border-none px-0 rounded-none text-[13px] font-medium bg-transparent focus-visible:ring-0 shadow-none py-1"
                                                    />
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="relative animate-fade-in">
                                                <MapPin className="absolute left-3 top-3.5 h-4 w-4 text-gray-400" />
                                                <Input value={form.address} onChange={e => update({ address: e.target.value })}
                                                    placeholder="Your full pickup address (e.g. Baneshwor, Kathmandu)" className="pl-10 h-12 border-2 rounded-xl text-sm" />
                                            </div>
                                        )}
                                        {formErrors.address && <p className="text-[10px] text-red-500 mt-0.5">{formErrors.address}</p>}
                                    </div>
                                </div>
                            )}

                            {/* ─── STEP 6: Diagnosis Report & Submit ─── */}
                            {form.selectedRepairs.length > 0 && form.address && (
                                <div ref={reviewRef} className="scroll-mt-32 animate-fade-in mt-2">
                                    <div className="flex items-center justify-between mb-5">
                                        <h3 className="text-lg font-extrabold text-[var(--colour-text2)] flex items-center gap-2.5">
                                            <span className="bg-[var(--colour-fsP1)] text-white w-7 h-7 rounded-full flex items-center justify-center text-sm shadow-md shadow-[var(--colour-fsP1)]/20">6</span>
                                            Diagnosis Report
                                        </h3>
                                    </div>

                                    {/* Clean Ticket Style Design */}
                                    <div className="bg-white border-2 border-[var(--colour-border3)] shadow-sm rounded-xl overflow-hidden mb-6">
                                        {/* Ticket Header */}
                                        <div className="bg-gray-50/50 border-b border-[var(--colour-border3)] px-5 py-4 flex items-center justify-between">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 bg-white rounded-lg border border-gray-100 flex items-center justify-center shrink-0 shadow-sm p-1.5 relative overflow-hidden">
                                                    {form.productImage ? <Image src={form.productImage} alt={form.productName} fill className="object-contain p-1" /> : <Smartphone className="text-gray-300" />}
                                                </div>
                                                <div>
                                                    <p className="text-[15px] font-extrabold text-gray-900 leading-tight mb-0.5">{form.productName}</p>
                                                    <p className="text-xs font-semibold text-[var(--colour-fsP1)]">{form.selectedRepairs.length} {form.selectedRepairs.length === 1 ? 'issue' : 'issues'} selected</p>
                                                </div>
                                            </div>
                                            <div className="hidden sm:block text-right">
                                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Status</p>
                                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-700">Pending Review</span>
                                            </div>
                                        </div>

                                        {/* Ticket Body */}
                                        <div className="px-5 py-4">
                                            <div className="mb-4">
                                                <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">Reported Damage</p>
                                                <div className="flex flex-wrap gap-2">
                                                    {repairLabels.map((label, idx) => (
                                                        <span key={idx} className="bg-gray-100 text-gray-700 text-xs font-bold px-2.5 py-1 rounded-md border border-gray-200">{label}</span>
                                                    ))}
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-dashed border-gray-200">
                                                <div>
                                                    <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">Customer / Contact</p>
                                                    <p className="text-sm font-semibold text-gray-800">Verified User</p>
                                                    <p className="text-xs text-gray-500 font-medium">+977 9800000000</p>
                                                </div>
                                                <div>
                                                    <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">Pickup Information</p>
                                                    <p className="text-sm font-semibold text-gray-800 leading-snug break-words">{form.address}</p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Ticket Footer / Summary */}
                                        <div className="bg-[var(--colour-fsP1)]/[0.03] border-t border-[var(--colour-border3)] px-5 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                            <div className="flex items-center gap-2.5 text-amber-700 max-w-sm">
                                                <AlertTriangle className="h-4 w-4 shrink-0" />
                                                <p className="text-[11px] leading-snug font-medium">Final cost estimate will be confirmed after physical diagnosis by our technician.</p>
                                            </div>
                                            <div className="text-left sm:text-right">
                                                <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">Est. Total</p>
                                                <p className="text-lg font-extrabold text-gray-900">TBD</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="mb-6 flex items-start gap-3 p-3 bg-gray-50/80 rounded-xl border border-gray-100">
                                        <div className="mt-0.5 flex items-center h-5">
                                            <input
                                                type="checkbox"
                                                id="terms-checkbox"
                                                checked={form.agreedToTerms}
                                                onChange={e => update({ agreedToTerms: e.target.checked })}
                                                className="w-4 h-4 text-[var(--colour-fsP1)] bg-white border-gray-300 rounded focus:ring-[var(--colour-fsP1)]/50 focus:ring-2 cursor-pointer transition-all"
                                            />
                                        </div>
                                        <div className="text-sm">
                                            <label htmlFor="terms-checkbox" className="font-semibold text-gray-800 cursor-pointer">I agree to the Terms and Conditions</label>
                                            <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                                                I understand that Fatafat Sewa will conduct a physical inspection of my device.
                                                If the actual repair cost exceeds the estimate, I will be notified for approval before any work begins.
                                            </p>
                                            {formErrors.terms && <p className="text-[11px] text-red-500 mt-1.5 font-bold animate-in fade-in">{formErrors.terms}</p>}
                                        </div>
                                    </div>

                                    <Button onClick={handleSubmit} disabled={isSubmitting || !form.agreedToTerms}
                                        className={cn("w-full h-12 text-white font-bold rounded-xl text-sm transition-all shadow-lg",
                                            !form.agreedToTerms ? "bg-gray-300 cursor-not-allowed text-gray-500 shadow-none border border-gray-200" : "bg-[var(--colour-fsP1)] hover:bg-[var(--colour-bg2)] hover:shadow-xl hover:-translate-y-0.5 cursor-pointer"
                                        )}>
                                        {isSubmitting ? (
                                            <span className="flex items-center gap-2"><div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" /> Submitting...</span>
                                        ) : (
                                            <span className="flex items-center gap-2">Submit Request <ArrowRight className="h-4 w-4" /></span>
                                        )}
                                    </Button>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </section>

                {/* ═══ SEO SECTIONS ═══ */}
                <RepairSEOSections />
            </main>
        </div>
    )
}
