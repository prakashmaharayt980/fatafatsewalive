'use client'

import React, { useState, useMemo, useRef, useCallback, useEffect } from 'react'
import {
    ChevronDown,
    ShieldCheck,
    Smartphone,
    Zap,
    Handshake,
    Store,
    BadgePercent,
    CreditCard,
    Phone,
    Search,
    Loader2,
    ArrowRight,
    Users,
    Check,
    ChevronRight,
    Truck,
    MapPin,
    ImagePlus,
    Upload,
    X,
    FileText,
    CheckCircle2,
    Fingerprint,
    Navigation,
    LocateFixed,
    MapPinned,
    User,
    Send,
    AlertCircle,
    ShoppingCart
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { cn } from '@/lib/utils'
import Image from 'next/image'
import Link from 'next/link'

// ════════════════════════════════════════════════════════════════════════════════
// MOCK DATA
// ════════════════════════════════════════════════════════════════════════════════

interface MockVariant {
    color: string
    colorHex: string
    storage: string
    price: number
    exchangeValue: number
}

interface MockProduct {
    id: number
    name: string
    slug: string
    image: string
    brand: string
    variants: MockVariant[]
}

interface MockBrand {
    id: number
    name: string
    slug: string
    logo: string
}

const BRANDS: MockBrand[] = [
    { id: 1, name: 'Apple', slug: 'apple', logo: 'https://fatafatsewa.com/storage/media/2047/conversions/logo-thumb.webp' },
    { id: 2, name: 'Samsung', slug: 'samsung', logo: 'https://fatafatsewa.com/storage/media/2047/conversions/logo-thumb.webp' },
    { id: 3, name: 'OnePlus', slug: 'oneplus', logo: 'https://fatafatsewa.com/storage/media/2047/conversions/logo-thumb.webp' },
    { id: 4, name: 'Xiaomi', slug: 'xiaomi', logo: 'https://fatafatsewa.com/storage/media/2047/conversions/logo-thumb.webp' },
    { id: 5, name: 'Google', slug: 'google', logo: 'https://fatafatsewa.com/storage/media/2047/conversions/logo-thumb.webp' },
    { id: 6, name: 'Oppo', slug: 'oppo', logo: 'https://fatafatsewa.com/storage/media/2047/conversions/logo-thumb.webp' },
    { id: 7, name: 'Vivo', slug: 'vivo', logo: 'https://fatafatsewa.com/storage/media/2047/conversions/logo-thumb.webp' },
    { id: 8, name: 'Realme', slug: 'realme', logo: 'https://fatafatsewa.com/storage/media/2047/conversions/logo-thumb.webp' },
]

const PRODUCTS: MockProduct[] = [
    // Apple
    {
        id: 1, name: 'iPhone 15 Pro Max', slug: 'iphone-15-pro-max', brand: 'apple', image: 'https://fatafatsewa.com/storage/media/2047/conversions/logo-thumb.webp', variants: [
            { color: 'Natural Titanium', colorHex: '#9A9A96', storage: '256GB', price: 234900, exchangeValue: 105000 },
            { color: 'Natural Titanium', colorHex: '#9A9A96', storage: '512GB', price: 264900, exchangeValue: 120000 },
            { color: 'Natural Titanium', colorHex: '#9A9A96', storage: '1TB', price: 294900, exchangeValue: 135000 },
            { color: 'Blue Titanium', colorHex: '#3B4F6B', storage: '256GB', price: 234900, exchangeValue: 105000 },
            { color: 'Blue Titanium', colorHex: '#3B4F6B', storage: '512GB', price: 264900, exchangeValue: 120000 },
            { color: 'Black Titanium', colorHex: '#2C2C2C', storage: '256GB', price: 234900, exchangeValue: 105000 },
            { color: 'White Titanium', colorHex: '#F2F1EB', storage: '256GB', price: 234900, exchangeValue: 105000 },
        ]
    },
    {
        id: 2, name: 'iPhone 15 Pro', slug: 'iphone-15-pro', brand: 'apple', image: 'https://fatafatsewa.com/storage/media/2047/conversions/logo-thumb.webp', variants: [
            { color: 'Natural Titanium', colorHex: '#9A9A96', storage: '128GB', price: 189900, exchangeValue: 82000 },
            { color: 'Natural Titanium', colorHex: '#9A9A96', storage: '256GB', price: 209900, exchangeValue: 92000 },
            { color: 'Blue Titanium', colorHex: '#3B4F6B', storage: '128GB', price: 189900, exchangeValue: 82000 },
            { color: 'Black Titanium', colorHex: '#2C2C2C', storage: '128GB', price: 189900, exchangeValue: 82000 },
        ]
    },
    {
        id: 3, name: 'iPhone 14', slug: 'iphone-14', brand: 'apple', image: 'https://fatafatsewa.com/storage/media/2047/conversions/logo-thumb.webp', variants: [
            { color: 'Blue', colorHex: '#A2C4E0', storage: '128GB', price: 119900, exchangeValue: 48000 },
            { color: 'Purple', colorHex: '#C8BFE7', storage: '128GB', price: 119900, exchangeValue: 48000 },
            { color: 'Midnight', colorHex: '#1F2020', storage: '128GB', price: 119900, exchangeValue: 48000 },
            { color: 'Midnight', colorHex: '#1F2020', storage: '256GB', price: 139900, exchangeValue: 55000 },
        ]
    },
    {
        id: 4, name: 'iPhone 13', slug: 'iphone-13', brand: 'apple', image: 'https://fatafatsewa.com/storage/media/2047/conversions/logo-thumb.webp', variants: [
            { color: 'Starlight', colorHex: '#FAF6F2', storage: '128GB', price: 89900, exchangeValue: 35000 },
            { color: 'Midnight', colorHex: '#1F2020', storage: '128GB', price: 89900, exchangeValue: 35000 },
            { color: 'Blue', colorHex: '#3E6D9E', storage: '128GB', price: 89900, exchangeValue: 35000 },
        ]
    },
    // Samsung
    {
        id: 5, name: 'Galaxy S24 Ultra', slug: 'galaxy-s24-ultra', brand: 'samsung', image: 'https://fatafatsewa.com/storage/media/2047/conversions/logo-thumb.webp', variants: [
            { color: 'Titanium Gray', colorHex: '#8E8E8E', storage: '256GB', price: 199999, exchangeValue: 88000 },
            { color: 'Titanium Gray', colorHex: '#8E8E8E', storage: '512GB', price: 229999, exchangeValue: 100000 },
            { color: 'Titanium Black', colorHex: '#2C2C2C', storage: '256GB', price: 199999, exchangeValue: 88000 },
            { color: 'Titanium Violet', colorHex: '#D0C4DF', storage: '256GB', price: 199999, exchangeValue: 88000 },
        ]
    },
    {
        id: 6, name: 'Galaxy S24+', slug: 'galaxy-s24-plus', brand: 'samsung', image: 'https://fatafatsewa.com/storage/media/2047/conversions/logo-thumb.webp', variants: [
            { color: 'Onyx Black', colorHex: '#1C1C1C', storage: '256GB', price: 149999, exchangeValue: 62000 },
            { color: 'Cobalt Violet', colorHex: '#9B8BB4', storage: '256GB', price: 149999, exchangeValue: 62000 },
        ]
    },
    {
        id: 7, name: 'Galaxy Z Fold5', slug: 'galaxy-z-fold5', brand: 'samsung', image: 'https://fatafatsewa.com/storage/media/2047/conversions/logo-thumb.webp', variants: [
            { color: 'Phantom Black', colorHex: '#1C1C1C', storage: '256GB', price: 184999, exchangeValue: 78000 },
            { color: 'Cream', colorHex: '#F5E6CA', storage: '256GB', price: 184999, exchangeValue: 78000 },
            { color: 'Phantom Black', colorHex: '#1C1C1C', storage: '512GB', price: 204999, exchangeValue: 88000 },
        ]
    },
    {
        id: 8, name: 'Galaxy A54', slug: 'galaxy-a54', brand: 'samsung', image: 'https://fatafatsewa.com/storage/media/2047/conversions/logo-thumb.webp', variants: [
            { color: 'Awesome Graphite', colorHex: '#4A4A4A', storage: '128GB', price: 42999, exchangeValue: 15000 },
            { color: 'Awesome Lime', colorHex: '#B5D63D', storage: '128GB', price: 42999, exchangeValue: 15000 },
        ]
    },
    // OnePlus
    {
        id: 9, name: 'OnePlus 12', slug: 'oneplus-12', brand: 'oneplus', image: 'https://fatafatsewa.com/storage/media/2047/conversions/logo-thumb.webp', variants: [
            { color: 'Silky Black', colorHex: '#1A1A1A', storage: '256GB', price: 64999, exchangeValue: 28000 },
            { color: 'Flowy Emerald', colorHex: '#2E7D5B', storage: '256GB', price: 64999, exchangeValue: 28000 },
            { color: 'Silky Black', colorHex: '#1A1A1A', storage: '512GB', price: 69999, exchangeValue: 32000 },
        ]
    },
    {
        id: 10, name: 'OnePlus Nord CE 3', slug: 'oneplus-nord-ce3', brand: 'oneplus', image: 'https://fatafatsewa.com/storage/media/2047/conversions/logo-thumb.webp', variants: [
            { color: 'Aqua Surge', colorHex: '#6BC5D2', storage: '128GB', price: 26999, exchangeValue: 10000 },
            { color: 'Grey Shimmer', colorHex: '#A0A0A0', storage: '128GB', price: 26999, exchangeValue: 10000 },
        ]
    },
    // Xiaomi
    {
        id: 11, name: 'Xiaomi 14 Ultra', slug: 'xiaomi-14-ultra', brand: 'xiaomi', image: 'https://fatafatsewa.com/storage/media/2047/conversions/logo-thumb.webp', variants: [
            { color: 'Black', colorHex: '#1A1A1A', storage: '512GB', price: 99999, exchangeValue: 42000 },
            { color: 'White', colorHex: '#F5F5F5', storage: '512GB', price: 99999, exchangeValue: 42000 },
        ]
    },
    {
        id: 12, name: 'Redmi Note 13 Pro', slug: 'redmi-note-13-pro', brand: 'xiaomi', image: 'https://fatafatsewa.com/storage/media/2047/conversions/logo-thumb.webp', variants: [
            { color: 'Midnight Black', colorHex: '#1A1A1A', storage: '128GB', price: 24999, exchangeValue: 9000 },
            { color: 'Forest Green', colorHex: '#3D6B47', storage: '128GB', price: 24999, exchangeValue: 9000 },
            { color: 'Lavender Purple', colorHex: '#C4A7D7', storage: '256GB', price: 28999, exchangeValue: 11000 },
        ]
    },
    // Google
    {
        id: 13, name: 'Pixel 8 Pro', slug: 'pixel-8-pro', brand: 'google', image: 'https://fatafatsewa.com/storage/media/2047/conversions/logo-thumb.webp', variants: [
            { color: 'Obsidian', colorHex: '#2C2C2E', storage: '128GB', price: 106999, exchangeValue: 45000 },
            { color: 'Bay', colorHex: '#8AB4F8', storage: '128GB', price: 106999, exchangeValue: 45000 },
            { color: 'Porcelain', colorHex: '#F1EDE6', storage: '256GB', price: 119999, exchangeValue: 50000 },
        ]
    },
    // Oppo
    {
        id: 14, name: 'Oppo Find X7 Ultra', slug: 'oppo-find-x7-ultra', brand: 'oppo', image: 'https://fatafatsewa.com/storage/media/2047/conversions/logo-thumb.webp', variants: [
            { color: 'Ocean Blue', colorHex: '#276BA4', storage: '256GB', price: 89999, exchangeValue: 38000 },
            { color: 'Hasselblad Brown', colorHex: '#8B6F47', storage: '256GB', price: 89999, exchangeValue: 38000 },
        ]
    },
    // Vivo
    {
        id: 15, name: 'Vivo X100 Pro', slug: 'vivo-x100-pro', brand: 'vivo', image: 'https://fatafatsewa.com/storage/media/2047/conversions/logo-thumb.webp', variants: [
            { color: 'Asteroid Black', colorHex: '#1A1A1A', storage: '256GB', price: 89999, exchangeValue: 36000 },
            { color: 'Stardust Blue', colorHex: '#4A7DB5', storage: '256GB', price: 89999, exchangeValue: 36000 },
        ]
    },
    // Realme
    {
        id: 16, name: 'Realme GT 5 Pro', slug: 'realme-gt5-pro', brand: 'realme', image: 'https://fatafatsewa.com/storage/media/2047/conversions/logo-thumb.webp', variants: [
            { color: 'Moon White', colorHex: '#F5F5F5', storage: '128GB', price: 37999, exchangeValue: 14000 },
            { color: 'Mars Orange', colorHex: '#E97451', storage: '256GB', price: 41999, exchangeValue: 16000 },
        ]
    },
]

// ════════════════════════════════════════════════════════════════════════════════
// COMPONENT
// ════════════════════════════════════════════════════════════════════════════════

export default function ExchangePage() {
    useEffect(() => { window.scrollTo(0, 0) }, [])

    const [selectedBrand, setSelectedBrand] = useState('')
    const [searchTerm, setSearchTerm] = useState('')
    const [selectedProduct, setSelectedProduct] = useState<MockProduct | null>(null)
    const [selectedColor, setSelectedColor] = useState('')
    const [selectedStorage, setSelectedStorage] = useState('')
    const [showResult, setShowResult] = useState(false)

    // Post-quote flow
    const [pickupSelected, setPickupSelected] = useState(false)
    const [productPhotos, setProductPhotos] = useState<File[]>([])
    const [photoPreviewUrls, setPhotoPreviewUrls] = useState<string[]>([])
    const [serialNumber, setSerialNumber] = useState('')
    const [agreedToTerms, setAgreedToTerms] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [showSuccess, setShowSuccess] = useState(false)
    const [fullName, setFullName] = useState('')
    const [phoneNumber, setPhoneNumber] = useState('')
    const [pickupAddress, setPickupAddress] = useState('')
    const [isLocating, setIsLocating] = useState(false)
    const [locationMethod, setLocationMethod] = useState<'geo' | 'manual' | ''>('')
    const [formErrors, setFormErrors] = useState<Record<string, string>>({})
    const fileInputRef = useRef<HTMLInputElement>(null)

    // Products filtered by brand
    const brandProducts = useMemo(() => {
        if (!selectedBrand) return []
        return PRODUCTS.filter(p => p.brand === selectedBrand)
    }, [selectedBrand])

    // Products filtered by search
    const filteredProducts = useMemo(() => {
        if (!searchTerm) return brandProducts
        return brandProducts.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()))
    }, [brandProducts, searchTerm])

    // Unique colors for selected product
    const availableColors = useMemo(() => {
        if (!selectedProduct) return []
        const map = new Map<string, string>()
        selectedProduct.variants.forEach(v => { if (!map.has(v.color)) map.set(v.color, v.colorHex) })
        return Array.from(map.entries()).map(([name, hex]) => ({ name, hex }))
    }, [selectedProduct])

    // Unique storages for selected product + color
    const availableStorages = useMemo(() => {
        if (!selectedProduct) return []
        const filtered = selectedColor
            ? selectedProduct.variants.filter(v => v.color === selectedColor)
            : selectedProduct.variants
        return [...new Set(filtered.map(v => v.storage))]
    }, [selectedProduct, selectedColor])

    // Current variant match
    const currentVariant = useMemo(() => {
        if (!selectedProduct || !selectedColor || !selectedStorage) return null
        return selectedProduct.variants.find(v => v.color === selectedColor && v.storage === selectedStorage) || null
    }, [selectedProduct, selectedColor, selectedStorage])

    // Handlers
    const handleSelectBrand = (slug: string) => {
        setSelectedBrand(slug)
        setSelectedProduct(null)
        setSelectedColor('')
        setSelectedStorage('')
        setShowResult(false)
        setSearchTerm('')
    }

    const handleSelectProduct = (product: MockProduct) => {
        setSelectedProduct(product)
        setSelectedColor('')
        setSelectedStorage('')
        setShowResult(false)
    }

    const handleSelectColor = (color: string) => {
        setSelectedColor(color)
        setSelectedStorage('')
        setShowResult(false)
    }

    const handleGetQuote = () => {
        if (currentVariant) {
            setShowResult(true)
            setPickupSelected(false)
            setProductPhotos([])
            setPhotoPreviewUrls([])
            setSerialNumber('')
            setAgreedToTerms(false)
            setShowSuccess(false)
            setFullName('')
            setPhoneNumber('')
            setPickupAddress('')
            setLocationMethod('')
        }
    }

    const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files
        if (!files) return
        const newFiles = Array.from(files).slice(0, 4 - productPhotos.length)
        setProductPhotos(prev => [...prev, ...newFiles])
        newFiles.forEach(file => {
            const reader = new FileReader()
            reader.onload = () => setPhotoPreviewUrls(prev => [...prev, reader.result as string])
            reader.readAsDataURL(file)
        })
    }

    const removePhoto = (index: number) => {
        setProductPhotos(prev => prev.filter((_, i) => i !== index))
        setPhotoPreviewUrls(prev => prev.filter((_, i) => i !== index))
    }

    const handleUseGeoLocation = useCallback(() => {
        if (!navigator.geolocation) {
            setPickupAddress('Geolocation not supported by your browser')
            setLocationMethod('manual')
            return
        }
        setIsLocating(true)
        setLocationMethod('geo')
        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const { latitude, longitude } = position.coords
                try {
                    const res = await fetch(
                        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`,
                        { headers: { 'Accept-Language': 'en' } }
                    )
                    const data = await res.json()
                    setPickupAddress(data.display_name || `${latitude}, ${longitude}`)
                } catch {
                    setPickupAddress(`Lat: ${latitude.toFixed(6)}, Lng: ${longitude.toFixed(6)}`)
                }
                setIsLocating(false)
            },
            () => {
                setPickupAddress('')
                setLocationMethod('manual')
                setIsLocating(false)
            },
            { enableHighAccuracy: true, timeout: 10000 }
        )
    }, [])

    const validateForm = (): boolean => {
        const errors: Record<string, string> = {}
        if (productPhotos.length === 0) errors.photos = 'Upload at least 1 photo'
        if (!serialNumber.trim()) errors.serial = 'IMEI is required'
        else if (serialNumber.trim().length < 15) errors.serial = 'IMEI must be at least 15 characters'
        else if (serialNumber.trim().length > 20) errors.serial = 'IMEI must be at most 20 characters'
        if (!pickupAddress.trim()) errors.address = 'Pickup address is required'
        else if (pickupAddress.trim().length < 5) errors.address = 'Address must be at least 5 characters'
        if (!fullName.trim()) errors.name = 'Full name is required'
        else if (fullName.trim().length < 3) errors.name = 'Name must be at least 3 characters'
        else if (fullName.trim().length > 50) errors.name = 'Name must be at most 50 characters'
        if (!phoneNumber.trim()) errors.phone = 'Phone number is required'
        else if (!/^\d{10}$/.test(phoneNumber.trim())) errors.phone = 'Phone must be exactly 10 digits'
        if (!agreedToTerms) errors.terms = 'You must agree to the terms'
        setFormErrors(errors)
        return Object.keys(errors).length === 0
    }

    const handleSubmitExchange = () => {
        if (!validateForm()) return
        setIsSubmitting(true)
        setTimeout(() => {
            setIsSubmitting(false)
            setShowSuccess(true)
        }, 2000)
    }

    const canSubmit = agreedToTerms && fullName.trim().length >= 3 && /^\d{10}$/.test(phoneNumber.trim()) && productPhotos.length > 0 && serialNumber.trim().length >= 15 && pickupAddress.trim().length >= 5

    return (
        <div className="min-h-screen bg-[var(--colour-bg4)] font-sans text-[var(--colour-text2)]">

            {/* ═══════════════════════════════════════════════════════════════
                HERO
            ═══════════════════════════════════════════════════════════════ */}
            <section className="relative overflow-hidden bg-gradient-to-br from-[#E8F0FE] via-[#F0F6FF] to-[#E0ECFA] pt-10 pb-20 md:pt-14 md:pb-28">
                <div className="container mx-auto px-4 lg:px-8">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-8 md:gap-12">
                        <div className="md:w-1/2 space-y-5 text-center md:text-left z-10">
                            <h1 className="text-4xl md:text-5xl lg:text-[3.5rem] font-extrabold text-[var(--colour-fsP2)] leading-tight tracking-tight">
                                Mobile Exchange
                            </h1>
                            <p className="text-lg md:text-xl font-semibold text-[var(--colour-text2)]">
                                Trade in Your Old Mobile for the Best Value!
                            </p>
                            <p className="text-[var(--colour-text3)] text-base max-w-md mx-auto md:mx-0">
                                Upgrade your device easily and affordably by exchanging your old mobile phone for a new one.
                            </p>
                            <div className="bg-white/90 backdrop-blur-sm shadow-[var(--shadow-premium-sm)] rounded-full py-2.5 px-5 inline-flex items-center gap-5 text-sm font-medium border border-[var(--colour-border3)] mx-auto md:mx-0">
                                <span className="flex items-center gap-2">
                                    <span className="bg-[var(--colour-fsP2)] text-white w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs">1</span>
                                    Get Immediate Price Quote
                                </span>
                                <ArrowRight className="h-4 w-4 text-[var(--colour-text3)]" />
                                <span className="flex items-center gap-2">
                                    <span className="bg-[var(--colour-fsP2)] text-white w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs">2</span>
                                    Visit Our Showroom
                                </span>
                            </div>
                        </div>
                        <div className="md:w-1/2 relative flex justify-center">
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[280px] h-[280px] md:w-[360px] md:h-[360px] bg-[var(--colour-fsP2)]/10 rounded-full blur-3xl" />
                            <div className="relative z-10 w-full max-w-[350px] md:max-w-[400px] aspect-square">
                                <Image src="/imgfile/logoimg.png" alt="Mobile Exchange - Fatafat Sewa" fill className="object-contain drop-shadow-2xl" sizes="(max-width: 768px) 100vw, 50vw" priority />
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ═══════════════════════════════════════════════════════════════
                EXCHANGE FLOW — 3 Steps in One Card
            ═══════════════════════════════════════════════════════════════ */}
            <section className="relative z-20 -mt-12 mb-12 container mx-auto px-4 lg:px-8">
                <Card className="bg-white border-none shadow-[var(--shadow-premium-lg)] rounded-2xl overflow-visible">
                    <div className="bg-[var(--colour-fsP2)] px-6 py-3.5 flex items-center gap-3 rounded-t-2xl">
                        <Smartphone className="h-5 w-5 text-white/80" />
                        <h3 className="text-white text-lg font-bold">Get an Instant Quote for Your Old Phone</h3>
                    </div>

                    <CardContent className="p-6 md:p-8">

                        {/* ─── STEP 1: Select Brand ─── */}
                        <div className="mb-8">
                            <h4 className="text-base font-bold text-[var(--colour-text2)] mb-4 flex items-center gap-2">
                                <span className="bg-[var(--colour-fsP2)] text-white w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold">1</span>
                                Select Brand
                            </h4>
                            <div className="grid grid-cols-4 sm:grid-cols-4 md:grid-cols-8 gap-3">
                                {BRANDS.map(brand => (
                                    <button
                                        key={brand.id}
                                        onClick={() => handleSelectBrand(brand.slug)}
                                        className={cn(
                                            'relative flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all duration-200 hover:shadow-md',
                                            selectedBrand === brand.slug
                                                ? 'border-[var(--colour-fsP2)] bg-blue-50 shadow-md'
                                                : 'border-[var(--colour-border3)] bg-white hover:border-[var(--colour-fsP2)]/40'
                                        )}
                                    >
                                        {selectedBrand === brand.slug && (
                                            <div className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-[var(--colour-fsP2)] rounded-full flex items-center justify-center">
                                                <Check className="h-3 w-3 text-white" />
                                            </div>
                                        )}
                                        <span className="text-xs font-semibold text-[var(--colour-text2)] text-center leading-tight">{brand.name}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* ─── STEP 2: Select Model ─── */}
                        {selectedBrand && (
                            <div className="mb-8 animate-fade-in">
                                <h4 className="text-base font-bold text-[var(--colour-text2)] mb-4 flex items-center gap-2">
                                    <span className="bg-[var(--colour-fsP2)] text-white w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold">2</span>
                                    Select Model
                                </h4>

                                {/* Search */}
                                <div className="relative mb-4 max-w-md">
                                    <Search className="absolute left-3.5 top-3.5 h-4 w-4 text-[var(--colour-fsP2)]" />
                                    <Input
                                        placeholder="Search model..."
                                        className="pl-10 h-12 bg-white border-2 border-[var(--colour-fsP2)]/30 rounded-xl text-sm font-medium focus:border-[var(--colour-fsP2)] focus:ring-2 focus:ring-[var(--colour-fsP2)]/20 transition-all placeholder:text-[var(--colour-text3)]/60"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                </div>

                                {/* Product Cards Grid */}
                                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                                    {filteredProducts.map(product => {
                                        const minPrice = Math.min(...product.variants.map(v => v.exchangeValue))
                                        const maxPrice = Math.max(...product.variants.map(v => v.exchangeValue))
                                        const isSelected = selectedProduct?.id === product.id

                                        return (
                                            <button
                                                key={product.id}
                                                onClick={() => handleSelectProduct(product)}
                                                className={cn(
                                                    'group relative text-left p-4 rounded-xl border-2 transition-all duration-200 hover:shadow-lg',
                                                    isSelected
                                                        ? 'border-[var(--colour-fsP2)] bg-blue-50/60 shadow-lg'
                                                        : 'border-[var(--colour-border3)] bg-white hover:border-[var(--colour-fsP2)]/40'
                                                )}
                                            >
                                                {isSelected && (
                                                    <div className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-[var(--colour-fsP2)] rounded-full flex items-center justify-center z-10">
                                                        <Check className="h-3 w-3 text-white" />
                                                    </div>
                                                )}

                                                {/* Product Image Placeholder */}
                                                <div className="w-full aspect-square bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg mb-3 flex items-center justify-center overflow-hidden">
                                                    <Smartphone className="h-12 w-12 text-[var(--colour-text3)]/40 group-hover:scale-110 transition-transform" />
                                                </div>

                                                <h5 className="text-sm font-bold text-[var(--colour-text2)] mb-1 leading-tight line-clamp-2">{product.name}</h5>

                                                {/* Color dots */}
                                                <div className="flex gap-1 mb-2">
                                                    {[...new Set(product.variants.map(v => v.colorHex))].slice(0, 4).map((hex, i) => (
                                                        <div key={i} className="w-3.5 h-3.5 rounded-full border border-gray-200" style={{ backgroundColor: hex }} />
                                                    ))}
                                                    {[...new Set(product.variants.map(v => v.colorHex))].length > 4 && (
                                                        <span className="text-[10px] text-[var(--colour-text3)]">+{[...new Set(product.variants.map(v => v.colorHex))].length - 4}</span>
                                                    )}
                                                </div>

                                                {/* Exchange Value Range */}
                                                <div className="text-xs text-[var(--colour-text3)]">Exchange up to</div>
                                                <div className="text-sm font-bold text-[var(--colour-bg3)]">
                                                    Rs. {minPrice === maxPrice ? minPrice.toLocaleString() : `${minPrice.toLocaleString()} – ${maxPrice.toLocaleString()}`}
                                                </div>
                                            </button>
                                        )
                                    })}
                                    {filteredProducts.length === 0 && (
                                        <div className="col-span-full text-center py-8 text-[var(--colour-text3)]">No products found for &quot;{searchTerm}&quot;</div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* ─── STEP 3: Select Variant ─── */}
                        {selectedProduct && (
                            <div className="animate-fade-in">
                                <h4 className="text-base font-bold text-[var(--colour-text2)] mb-4 flex items-center gap-2">
                                    <span className="bg-[var(--colour-fsP2)] text-white w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold">3</span>
                                    Choose Variant — {selectedProduct.name}
                                </h4>

                                <div className="bg-[var(--colour-bg4)] rounded-xl p-5 border border-[var(--colour-border3)]">
                                    <div className="grid md:grid-cols-2 gap-6">
                                        {/* Left: Color Selection */}
                                        <div>
                                            <label className="text-sm font-semibold text-[var(--colour-text3)] mb-3 block">Color</label>
                                            <div className="flex flex-wrap gap-2">
                                                {availableColors.map(c => (
                                                    <button
                                                        key={c.name}
                                                        onClick={() => handleSelectColor(c.name)}
                                                        className={cn(
                                                            'flex items-center gap-2 px-4 py-2.5 rounded-lg border-2 text-sm font-medium transition-all',
                                                            selectedColor === c.name
                                                                ? 'border-[var(--colour-fsP2)] bg-white shadow-sm'
                                                                : 'border-[var(--colour-border3)] bg-white hover:border-[var(--colour-fsP2)]/40'
                                                        )}
                                                    >
                                                        <div className="w-5 h-5 rounded-full border border-gray-300 shrink-0" style={{ backgroundColor: c.hex }} />
                                                        {c.name}
                                                        {selectedColor === c.name && <Check className="h-3.5 w-3.5 text-[var(--colour-fsP2)]" />}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Right: Storage Selection */}
                                        <div>
                                            <label className="text-sm font-semibold text-[var(--colour-text3)] mb-3 block">Storage</label>
                                            <div className="flex flex-wrap gap-2">
                                                {availableStorages.map(s => (
                                                    <button
                                                        key={s}
                                                        onClick={() => { setSelectedStorage(s); setShowResult(false) }}
                                                        className={cn(
                                                            'px-5 py-2.5 rounded-lg border-2 text-sm font-semibold transition-all',
                                                            selectedStorage === s
                                                                ? 'border-[var(--colour-fsP2)] bg-white text-[var(--colour-fsP2)] shadow-sm'
                                                                : 'border-[var(--colour-border3)] bg-white text-[var(--colour-text2)] hover:border-[var(--colour-fsP2)]/40'
                                                        )}
                                                    >
                                                        {s}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    </div>

                                    {/* CTA + Price */}
                                    <div className="mt-6 flex flex-col sm:flex-row items-center gap-4">
                                        <Button
                                            onClick={handleGetQuote}
                                            disabled={!currentVariant}
                                            className="h-13 px-10 bg-gradient-to-r from-[var(--colour-fsP2)] to-[#1565C0] hover:from-[#1565C0] hover:to-[var(--colour-fsP2)] text-white text-base font-bold rounded-xl shadow-lg hover:shadow-xl transition-all disabled:opacity-40 disabled:shadow-none"
                                        >
                                            <ShoppingCart className="h-5 w-5 mr-2" />
                                            Get Exchange Quote
                                        </Button>

                                        {currentVariant && !showResult && (
                                            <span className="text-sm text-[var(--colour-text3)]">
                                                Retail Price: <span className="font-semibold text-[var(--colour-text2)]">Rs. {currentVariant.price.toLocaleString()}</span>
                                            </span>
                                        )}
                                    </div>
                                </div>

                                {/* ─── Result ─── */}
                                {showResult && currentVariant && !showSuccess && (
                                    <div className="mt-5 p-5 bg-green-50 border border-green-200 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-4 animate-slide-up">
                                        <div>
                                            <h4 className="text-base font-bold text-[var(--colour-text2)]">Estimated Exchange Value</h4>
                                            <p className="text-sm text-[var(--colour-text3)]">
                                                {selectedProduct.name} · {selectedColor} · {selectedStorage}
                                            </p>
                                            <p className="text-xs text-[var(--colour-text3)] mt-1">
                                                Retail: Rs. {currentVariant.price.toLocaleString()}
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <span className="block text-3xl md:text-4xl font-extrabold text-[var(--colour-bg3)]">
                                                Rs. {currentVariant.exchangeValue.toLocaleString()}
                                            </span>
                                            <span className="text-xs text-[var(--colour-text3)]">* Subject to inspection</span>
                                        </div>
                                    </div>
                                )}

                                {/* ═══════════════════════════════════════════
                                    STEP 4: PICKUP OPTION
                                ═══════════════════════════════════════════ */}
                                {showResult && currentVariant && !showSuccess && (
                                    <div className="mt-8 animate-fade-in">
                                        {/* Step Header */}
                                        <div className="flex items-center gap-3 mb-5">
                                            <span className="bg-[var(--colour-fsP2)] text-white w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold">4</span>
                                            <h4 className="text-base font-bold text-[var(--colour-text2)]">How would you like to proceed?</h4>
                                        </div>

                                        {/* Pickup Option Card */}
                                        <button
                                            onClick={() => setPickupSelected(true)}
                                            className={cn(
                                                'relative w-full max-w-lg p-6 rounded-2xl border-2 text-left transition-all duration-300 hover:shadow-lg group',
                                                pickupSelected
                                                    ? 'border-[var(--colour-fsP2)] bg-gradient-to-br from-blue-50 to-[#E8F0FE] shadow-lg'
                                                    : 'border-[var(--colour-border3)] bg-white hover:border-[var(--colour-fsP2)]/50'
                                            )}
                                        >
                                            {pickupSelected && (
                                                <div className="absolute -top-2 -right-2 w-6 h-6 bg-[var(--colour-fsP2)] rounded-full flex items-center justify-center shadow-md">
                                                    <Check className="h-3.5 w-3.5 text-white" />
                                                </div>
                                            )}
                                            <div className="flex items-center gap-4">
                                                <div className={cn(
                                                    'w-14 h-14 rounded-xl flex items-center justify-center transition-all',
                                                    pickupSelected
                                                        ? 'bg-[var(--colour-fsP2)] shadow-md'
                                                        : 'bg-[#E8F0FE] group-hover:bg-[var(--colour-fsP2)]/20'
                                                )}>
                                                    <Truck className={cn(
                                                        'h-7 w-7 transition-colors',
                                                        pickupSelected ? 'text-white' : 'text-[var(--colour-fsP2)]'
                                                    )} />
                                                </div>
                                                <div className="flex-1">
                                                    <h5 className="text-base font-bold text-[var(--colour-text2)] mb-0.5">Schedule Product Pickup</h5>
                                                    <p className="text-sm text-[var(--colour-text3)]">Our driver will collect your device from your doorstep — free of charge!</p>
                                                </div>
                                                <ChevronRight className={cn(
                                                    'h-5 w-5 text-[var(--colour-text3)] transition-all shrink-0',
                                                    pickupSelected ? 'text-[var(--colour-fsP2)] rotate-90' : 'group-hover:translate-x-1'
                                                )} />
                                            </div>
                                        </button>
                                    </div>
                                )}

                                {/* ═══════════════════════════════════════════
                                    STEP 5: PICKUP DETAILS (only after pickup selected)
                                ═══════════════════════════════════════════ */}
                                {showResult && currentVariant && !showSuccess && pickupSelected && (
                                    <div className="mt-8 animate-fade-in">
                                        {/* Step Header */}
                                        <div className="flex items-center gap-2.5 mb-6">
                                            <span className="bg-[var(--colour-fsP2)] text-white w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold">5</span>
                                            <h4 className="text-lg font-bold text-[var(--colour-text2)]">Fill Pickup Details</h4>
                                        </div>

                                        {/* Form Container */}
                                        <div className="bg-white rounded-xl p-5 md:p-7 border border-gray-200">

                                            {/* Two Column Layout */}
                                            <div className="grid lg:grid-cols-2 gap-8">

                                                {/* ─── LEFT: Device Info ─── */}
                                                <div className="space-y-5">
                                                    <p className="text-sm font-semibold text-[var(--colour-bg3)]">Device Info</p>

                                                    {/* Product Photos */}
                                                    <div>
                                                        <div className="flex items-center justify-between mb-2">
                                                            <label className="text-sm font-semibold text-[var(--colour-text2)] flex items-center gap-1.5">
                                                                <ImagePlus className="h-4 w-4 text-[var(--colour-bg3)]" />
                                                                Product Photos
                                                            </label>
                                                            <span className="text-xs text-[var(--colour-text3)]">{productPhotos.length}/4</span>
                                                        </div>
                                                        <div className="grid grid-cols-4 gap-2">
                                                            {photoPreviewUrls.map((url, i) => (
                                                                <div key={i} className="relative aspect-square rounded-lg overflow-hidden border border-gray-200 group">
                                                                    <img src={url} alt={`Photo ${i + 1}`} className="w-full h-full object-cover" />
                                                                    <button
                                                                        onClick={() => removePhoto(i)}
                                                                        className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                                                    >
                                                                        <X className="h-3 w-3" />
                                                                    </button>
                                                                </div>
                                                            ))}
                                                            {productPhotos.length < 4 && (
                                                                <button
                                                                    onClick={() => fileInputRef.current?.click()}
                                                                    className="aspect-square rounded-lg border-2 border-dashed border-[var(--colour-fsP2)] bg-white hover:border-[var(--colour-fsP2)] hover:bg-[var(--colour-fsP2)]/30 transition-all flex flex-col items-center justify-center gap-1 cursor-pointer"
                                                                >
                                                                    <Upload className="h-5 w-5 text-[var(--colour-fsP2)]" />
                                                                    <span className="text-[10px] text-[var(--colour-fsP2)] font-medium">Add</span>
                                                                </button>
                                                            )}
                                                        </div>
                                                        <input ref={fileInputRef} type="file" accept="image/*" multiple className="hidden" onChange={handlePhotoUpload} />
                                                        {formErrors.photos && <p className="text-[11px] text-red-500 mt-1 flex items-center gap-1"><AlertCircle className="h-3 w-3" />{formErrors.photos}</p>}
                                                        <p className="text-[11px] text-[var(--colour-text3)] mt-1.5">Front, back & sides for accurate valuation (min 1, max 4)</p>
                                                    </div>

                                                    {/* IMEI */}
                                                    <div>
                                                        <label className="text-sm font-semibold text-[var(--colour-text2)] mb-2 flex items-center gap-1.5">
                                                            <Fingerprint className="h-4 w-4 text-[var(--colour-bg3)]" />
                                                            IMEI / Serial Number
                                                        </label>
                                                        <Input
                                                            value={serialNumber}
                                                            onChange={(e) => { setSerialNumber(e.target.value); setFormErrors(prev => ({ ...prev, serial: '' })) }}
                                                            placeholder="e.g. 356938035643809"
                                                            maxLength={20}
                                                            className={cn(
                                                                'h-11 bg-white border-2 rounded-lg text-sm focus:ring-1 transition-all',
                                                                formErrors.serial
                                                                    ? 'border-red-400 focus:border-red-500 focus:ring-red-200'
                                                                    : 'border-[var(--colour-fsP2)]/30 focus:border-[var(--colour-fsP2)] focus:ring-[var(--colour-fsP2)]/20'
                                                            )}
                                                        />
                                                        {formErrors.serial
                                                            ? <p className="text-[11px] text-red-500 mt-1 flex items-center gap-1"><AlertCircle className="h-3 w-3" />{formErrors.serial}</p>
                                                            : <p className="text-[11px] text-[var(--colour-text3)] mt-1.5">Dial <span className="font-mono font-semibold">*#06#</span> to find IMEI (15–20 chars)</p>
                                                        }
                                                    </div>
                                                </div>

                                                {/* ─── RIGHT: Pickup & Contact ─── */}
                                                <div className="space-y-5">
                                                    <p className="text-sm font-semibold text-[var(--colour-bg3)]">Pickup & Contact</p>

                                                    {/* Pickup Address */}
                                                    <div>
                                                        <label className="text-sm font-semibold text-[var(--colour-text2)] mb-2 flex items-center gap-1.5">
                                                            <MapPinned className="h-4 w-4 text-[var(--colour-bg3)]" />
                                                            Pickup Address
                                                        </label>

                                                        <div className="flex gap-2 mb-3">
                                                            <button
                                                                onClick={handleUseGeoLocation}
                                                                className={cn(
                                                                    'flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-semibold rounded-full border-2 transition-all',
                                                                    locationMethod === 'geo'
                                                                        ? 'border-[var(--colour-fsP2)] bg-[var(--colour-fsP2)] text-white'
                                                                        : 'border-[var(--colour-fsP2)]/30 bg-white text-[var(--colour-fsP2)] hover:bg-green-50'
                                                                )}
                                                            >
                                                                {isLocating ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <LocateFixed className="h-3.5 w-3.5" />}
                                                                Use GPS
                                                            </button>
                                                            <button
                                                                onClick={() => { setLocationMethod('manual'); setPickupAddress('') }}
                                                                className={cn(
                                                                    'flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-semibold rounded-full border-2 transition-all',
                                                                    locationMethod === 'manual'
                                                                        ? 'border-[var(--colour-fsP2)] bg-[var(--colour-fsP2)] text-white'
                                                                        : 'border-[var(--colour-fsP2)]/30 bg-white text-[var(--colour-fsP2)] hover:bg-green-50'
                                                                )}
                                                            >
                                                                <Navigation className="h-3.5 w-3.5" />
                                                                Type Address
                                                            </button>
                                                        </div>

                                                        {locationMethod === 'geo' && pickupAddress && (
                                                            <div className="bg-green-50 border border-green-200 rounded-lg p-2.5 flex items-center gap-2 mb-2 text-xs text-green-700">
                                                                <Check className="h-3.5 w-3.5 shrink-0" />
                                                                <span className="line-clamp-1">{pickupAddress}</span>
                                                            </div>
                                                        )}

                                                        {locationMethod === 'geo' && isLocating && (
                                                            <div className="bg-green-50 border border-green-200 rounded-lg p-2.5 flex items-center gap-2 mb-2 text-xs text-green-600">
                                                                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                                                Detecting location...
                                                            </div>
                                                        )}

                                                        {(locationMethod === 'manual' || (locationMethod === 'geo' && pickupAddress)) && (
                                                            <Input
                                                                value={pickupAddress}
                                                                onChange={(e) => { setPickupAddress(e.target.value); setFormErrors(prev => ({ ...prev, address: '' })) }}
                                                                placeholder="Full address, landmark, area..."
                                                                className={cn(
                                                                    'h-11 bg-white border-2 rounded-lg text-sm focus:ring-1 transition-all',
                                                                    formErrors.address
                                                                        ? 'border-red-400 focus:border-red-500 focus:ring-red-200'
                                                                        : 'border-[var(--colour-fsP2)]/30 focus:border-[var(--colour-fsP2)] focus:ring-[var(--colour-fsP2)]/20'
                                                                )}
                                                            />
                                                        )}
                                                        {formErrors.address && <p className="text-[11px] text-red-500 mt-1 flex items-center gap-1"><AlertCircle className="h-3 w-3" />{formErrors.address}</p>}
                                                    </div>

                                                    {/* Full Name */}
                                                    <div>
                                                        <label className="text-sm font-semibold text-[var(--colour-text2)] mb-2 flex items-center gap-1.5">
                                                            <User className="h-4 w-4 text-[var(--colour-bg3)]" />
                                                            Full Name
                                                        </label>
                                                        <Input
                                                            value={fullName}
                                                            onChange={(e) => { setFullName(e.target.value); setFormErrors(prev => ({ ...prev, name: '' })) }}
                                                            placeholder="e.g. Ram Sharma"
                                                            maxLength={50}
                                                            className={cn(
                                                                'h-11 bg-white border-2 rounded-lg text-sm focus:ring-1 transition-all',
                                                                formErrors.name
                                                                    ? 'border-red-400 focus:border-red-500 focus:ring-red-200'
                                                                    : 'border-[var(--colour-fsP2)]/30 focus:border-[var(--colour-fsP2)] focus:ring-[var(--colour-fsP2)]/20'
                                                            )}
                                                        />
                                                        {formErrors.name && <p className="text-[11px] text-red-500 mt-1 flex items-center gap-1"><AlertCircle className="h-3 w-3" />{formErrors.name}</p>}
                                                    </div>

                                                    {/* Phone Number */}
                                                    <div>
                                                        <label className="text-sm font-semibold text-[var(--colour-text2)] mb-2 flex items-center gap-1.5">
                                                            <Smartphone className="h-4 w-4 text-[var(--colour-bg3)]" />
                                                            Phone Number
                                                        </label>
                                                        <Input
                                                            value={phoneNumber}
                                                            onChange={(e) => { const v = e.target.value.replace(/\D/g, '').slice(0, 10); setPhoneNumber(v); setFormErrors(prev => ({ ...prev, phone: '' })) }}
                                                            placeholder="98XXXXXXXX"
                                                            maxLength={10}
                                                            className={cn(
                                                                'h-11 bg-white border-2 rounded-lg text-sm focus:ring-1 transition-all',
                                                                formErrors.phone
                                                                    ? 'border-red-400 focus:border-red-500 focus:ring-red-200'
                                                                    : 'border-[var(--colour-fsP2)]/30 focus:border-[var(--colour-fsP2)] focus:ring-[var(--colour-fsP2)]/20'
                                                            )}
                                                        />
                                                        {formErrors.phone
                                                            ? <p className="text-[11px] text-red-500 mt-1 flex items-center gap-1"><AlertCircle className="h-3 w-3" />{formErrors.phone}</p>
                                                            : <p className="text-[11px] text-[var(--colour-text3)] mt-1">10 digits only</p>
                                                        }
                                                    </div>
                                                </div>
                                            </div>

                                            {/* ─── Terms & Submit ─── */}
                                            <div className="mt-6 pt-5 border-t border-gray-100">
                                                <label className="flex items-start gap-3 cursor-pointer group mb-4">
                                                    <div className="relative mt-0.5">
                                                        <input type="checkbox" checked={agreedToTerms} onChange={(e) => { setAgreedToTerms(e.target.checked); setFormErrors(prev => ({ ...prev, terms: '' })) }} className="sr-only" />
                                                        <div className={cn(
                                                            'w-5 h-5 rounded border-2 flex items-center justify-center transition-all',
                                                            agreedToTerms
                                                                ? 'bg-[var(--colour-fsP2)] border-[var(--colour-fsP2)]'
                                                                : formErrors.terms
                                                                    ? 'bg-white border-red-400'
                                                                    : 'bg-white border-gray-300 group-hover:border-[var(--colour-bg3)]'
                                                        )}>
                                                            {agreedToTerms && <Check className="h-3 w-3 text-white" />}
                                                        </div>
                                                    </div>
                                                    <span className="text-sm text-[var(--colour-text3)] leading-snug">
                                                        I agree to the <Link href="#" className="text-[var(--colour-bg3)] font-semibold hover:underline">Terms & Conditions</Link> and <Link href="#" className="text-[var(--colour-bg3)] font-semibold hover:underline">Exchange Policy</Link>. Final value may vary based on inspection.
                                                    </span>
                                                </label>
                                                {formErrors.terms && <p className="text-[11px] text-red-500 mb-3 flex items-center gap-1"><AlertCircle className="h-3 w-3" />{formErrors.terms}</p>}

                                                <Button
                                                    onClick={handleSubmitExchange}
                                                    disabled={isSubmitting}
                                                    className="h-10 w-full bg-[var(--colour-bg3)] hover:bg-[#0D5500] text-white text-sm font-bold rounded-lg transition-all disabled:opacity-50"
                                                >
                                                    {isSubmitting ? (
                                                        <span className="flex items-center gap-2"><Loader2 className="h-4 w-4 animate-spin" /> Submitting...</span>
                                                    ) : (
                                                        <span className="flex items-center gap-2"><Send className="h-4 w-4" /> Submit Pickup Request</span>
                                                    )}
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* ═══════════════════════════════════════════
                                    SUCCESS DIALOG
                                ═══════════════════════════════════════════ */}
                                <Dialog open={showSuccess} onOpenChange={setShowSuccess}>
                                    <DialogContent className="sm:max-w-[380px] p-0 bg-white overflow-hidden border border-gray-200 rounded-2xl" showCloseButton={false}>
                                        <div className="p-6 text-center">
                                            {/* Animated check */}
                                            <div className="w-14 h-14 rounded-full bg-[var(--colour-bg3)] flex items-center justify-center mx-auto mb-4 animate-bounce" style={{ animationIterationCount: 2, animationDuration: '0.6s' }}>
                                                <Check className="h-7 w-7 text-white stroke-[3]" />
                                            </div>

                                            <h3 className="text-lg font-bold text-gray-900 mb-1">Exchange Request Submitted</h3>
                                            <p className="text-[13px] text-gray-500 mb-5">
                                                Thank you, <span className="font-semibold text-gray-700">{fullName}</span>
                                            </p>

                                            {/* Info rows */}
                                            <div className="bg-gray-50 rounded-xl divide-y divide-gray-200 text-left text-sm mb-5">
                                                <div className="flex justify-between items-center px-4 py-3">
                                                    <span className="text-gray-500">Device</span>
                                                    <span className="font-semibold text-gray-800 text-right max-w-[180px] truncate">{selectedProduct?.name}</span>
                                                </div>
                                                <div className="flex justify-between items-center px-4 py-3">
                                                    <span className="text-gray-500">Exchange Value</span>
                                                    <span className="font-bold text-[var(--colour-bg3)]">Rs. {currentVariant?.exchangeValue.toLocaleString()}</span>
                                                </div>
                                                <div className="flex justify-between items-center px-4 py-3">
                                                    <span className="text-gray-500">Pickup</span>
                                                    <span className="font-semibold text-gray-800 flex items-center gap-1.5"><Truck className="h-3.5 w-3.5" /> Driver Pickup</span>
                                                </div>
                                                <div className="flex justify-between items-center px-4 py-3">
                                                    <span className="text-gray-500">Contact</span>
                                                    <span className="font-semibold text-gray-800">{phoneNumber}</span>
                                                </div>
                                            </div>

                                            <p className="text-xs text-gray-400 mb-4">We'll call you shortly to schedule pickup.</p>

                                            <Button
                                                onClick={() => setShowSuccess(false)}
                                                className="w-full h-10 bg-[var(--colour-bg3)] hover:bg-[#0D5500] text-white font-semibold rounded-xl text-sm"
                                            >
                                                Done
                                            </Button>
                                        </div>
                                    </DialogContent>
                                </Dialog>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </section>

            {/* ═══════════════════════════════════════════════════════════════
                WHY EXCHANGE — 5 Cards
            ═══════════════════════════════════════════════════════════════ */}
            <section className="py-14 bg-white">
                <div className="container mx-auto px-4 lg:px-8">
                    <div className="flex items-center gap-3 mb-10 justify-center">
                        <span className="bg-[var(--colour-fsP2)] text-white w-7 h-7 rounded-md flex items-center justify-center font-bold text-sm">1</span>
                        <h2 className="text-2xl md:text-3xl font-bold text-[var(--colour-fsP2)]">Why Exchange with Fatafat Sewa?</h2>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-5">
                        {[
                            { icon: BadgePercent, title: 'Best Value Guaranteed', desc: 'Get the best market value for your old phone in seconds!' },
                            { icon: CreditCard, title: '0% EMI Optional', desc: 'Use the exchange value towards your new device and pay the rest in easy 0% EMI.' },
                            { icon: ShieldCheck, title: 'Free Mobile Insurance', desc: 'Enjoy a safe, worry-free upgrade with insurance on selected new purchases.' },
                            { icon: Zap, title: 'Instant Upgrade', desc: 'Walk out with a new phone on the same day!' },
                            { icon: Users, title: 'Trusted Partnerships', desc: 'We partner with top brands for a secure, trustworthy exchange.' },
                        ].map((item, i) => (
                            <div key={i} className="bg-[var(--colour-bg4)] rounded-xl p-5 text-center hover:bg-white hover:shadow-[var(--shadow-premium-md)] transition-all border border-transparent hover:border-[var(--colour-border3)] group">
                                <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center mx-auto mb-3 shadow-sm group-hover:scale-110 transition-transform">
                                    <item.icon className="h-7 w-7 text-[var(--colour-fsP2)]" />
                                </div>
                                <h3 className="font-bold text-[var(--colour-fsP2)] text-sm mb-1.5">{item.title}</h3>
                                <p className="text-xs text-[var(--colour-text3)] leading-relaxed">{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ═══════════════════════════════════════════════════════════════
                HOW IT WORKS — 3 Steps
            ═══════════════════════════════════════════════════════════════ */}
            <section className="py-14 bg-[var(--colour-bg4)]">
                <div className="container mx-auto px-4 lg:px-8">
                    <h2 className="text-2xl md:text-3xl font-bold text-[var(--colour-fsP2)] text-center mb-10">How Does the Mobile Exchange Work?</h2>
                    <div className="grid md:grid-cols-3 gap-6 md:gap-8">
                        {[
                            { icon: Smartphone, step: '1', title: 'Get Exchange Quote', color: 'var(--colour-fsP2)', bgColor: '#E8F0FE', desc: 'Use the form above to receive an immediate price quote for your old phone. It\'s quick & easy!' },
                            { icon: Store, step: '2', title: 'Visit Our Showroom', color: 'var(--colour-fsP2)', bgColor: '#E8F0FE', desc: 'Drop by our showroom to have our experts evaluate and confirm the final exchange value.' },
                            { icon: Handshake, step: '3', title: 'Upgrade to a New Phone', color: 'var(--colour-bg3)', bgColor: '#E8F5E9', desc: 'Trade in your old phone, pay the difference (or choose easy EMI!), and walk out with a brand new phone!' },
                        ].map((item, i) => (
                            <div key={i} className="bg-white rounded-2xl p-7 shadow-[var(--shadow-premium-sm)] border border-[var(--colour-border3)] text-center relative overflow-hidden hover-lift hover:shadow-[var(--shadow-premium-md)]">
                                <div className="absolute top-0 left-0 w-full h-1" style={{ backgroundColor: item.color }} />
                                <div className="mb-5 inline-flex justify-center items-center w-[72px] h-[72px] rounded-full" style={{ backgroundColor: item.bgColor }}>
                                    <item.icon className="h-9 w-9" style={{ color: item.color }} />
                                </div>
                                <h4 className="text-lg font-bold text-[var(--colour-text2)] mb-2">{item.step}. {item.title}</h4>
                                <p className="text-sm text-[var(--colour-text3)] leading-relaxed">{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ═══════════════════════════════════════════════════════════════
                FAQ
            ═══════════════════════════════════════════════════════════════ */}
            <section className="py-16 bg-gradient-to-b from-white to-[#F8FAFF]">
                <div className="container mx-auto px-4 lg:px-8 max-w-3xl">
                    <div className="text-center mb-10">
                        <span className="inline-block bg-[var(--colour-fsP2)]/10 text-[var(--colour-fsP2)] text-xs font-bold px-4 py-1.5 rounded-full mb-3 tracking-wide uppercase">FAQ</span>
                        <h2 className="text-2xl md:text-3xl font-bold text-[var(--colour-text2)]">Frequently Asked Questions</h2>
                        <p className="text-sm text-[var(--colour-text3)] mt-2">Everything you need to know about our exchange process</p>
                    </div>
                    <Accordion type="single" collapsible className="w-full space-y-3">
                        {[
                            { q: 'Which brands & models are accepted for exchange?', a: 'We accept a wide range of major brands including Apple, Samsung, OnePlus, Xiaomi, and more. Check the brand selector above for the full list.' },
                            { q: 'What factors determine my phone\'s exchange value?', a: 'The value depends on the model, age, storage capacity, and physical condition of the device (screen, body, camera, battery health).' },
                            { q: 'Can I exchange more than one phone?', a: 'Yes! You can exchange multiple devices to accumulate more value towards your new purchase. Please visit the showroom for multi-device evaluation.' },
                        ].map((item, i) => (
                            <AccordionItem key={i} value={`item-${i}`} className="border-2 border-[var(--colour-fsP2)]/15 rounded-xl px-5 bg-white shadow-sm hover:shadow-md hover:border-[var(--colour-fsP2)]/30 transition-all data-[state=open]:border-[var(--colour-fsP2)]/40 data-[state=open]:shadow-md data-[state=open]:bg-blue-50/30">
                                <AccordionTrigger className="text-[var(--colour-text2)] font-bold text-[15px] hover:no-underline py-5 hover:text-[var(--colour-fsP2)] transition-colors">{item.q}</AccordionTrigger>
                                <AccordionContent className="text-[var(--colour-text3)] text-sm pb-5 leading-relaxed">{item.a}</AccordionContent>
                            </AccordionItem>
                        ))}
                    </Accordion>
                </div>
            </section>

            {/* ═══════════════════════════════════════════════════════════════
                BOTTOM CTA
            ═══════════════════════════════════════════════════════════════ */}
            <section className="py-12 bg-[var(--colour-bg4)] border-t border-[var(--colour-border3)]">
                <div className="container mx-auto px-4 lg:px-8 text-center max-w-3xl">
                    <h2 className="text-2xl md:text-3xl font-bold text-[var(--colour-fsP2)] mb-1">
                        Visit Us & Upgrade <span className="text-[var(--colour-text2)] font-normal">Your Mobile Today!</span>
                    </h2>
                    <p className="text-[var(--colour-text3)] text-sm mb-7">Explore products or check EMI eligibility today.</p>
                    <div className="flex flex-col sm:flex-row justify-center gap-3">
                        <Button className="h-12 px-8 bg-[var(--colour-bg3)] hover:bg-[#0D5500] text-white text-base font-bold rounded-lg shadow-md hover:shadow-lg">Get Exchange Quote</Button>
                        <Button className="h-12 px-8 bg-[var(--colour-fsP2)] hover:bg-[var(--colour-bg2)] text-white text-base font-bold rounded-lg shadow-md hover:shadow-lg">Find Showroom</Button>
                    </div>
                </div>
            </section>


        </div>
    )
}