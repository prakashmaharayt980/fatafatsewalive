'use client'

import React, { useState, useMemo, useRef, useCallback, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import {
    type ProductListItem, type FullProduct, type ColorOption, type ConditionAnswer,
    calculateExchangeValue, getMaxExchangeValue,
    extractColorsFromVariants
} from './exchange-helpers'
import { ProductService } from '../api/services/product.service'
import { getBrandProducts, getCategoryProducts } from '../api/services/category.service'
import type { NavbarItem } from '../context/navbar.interface'
import { useAuth, useAuthStore } from '../context/AuthContext'
import type { ShippingAddress } from '../checkout/checkoutTypes'
// @ts-ignore
import EmiFaq from '../emi/apply/_components/EmiFaq'

// Sub-components
import ExchangeHero from './_components/ExchangeHero'
import ExchangeBreadcrumb from './_components/ExchangeBreadcrumb'
import CatalogView from './_components/CatalogView'
import ExchangeForm from './_components/ExchangeForm'
import ExchangeSeoSections from './_components/ExchangeSeoSections'

import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
} from '@/components/ui/sheet'

interface MainProps {
    categories: NavbarItem[]
    initialProducts?: ProductListItem[]
    bannerSection?: React.ReactNode
    blogSection?: React.ReactNode
}

interface ExchangeState {
    selectedCategory: NavbarItem | null
    selectedBrand: string
    searchTerm: string
    products: ProductListItem[]
    isLoadingProducts: boolean
    selectedProduct: FullProduct | null
    isLoadingDetail: boolean
    colorOptions: ColorOption[]
    selectedColor: ColorOption | null
    conditionAnswers: ConditionAnswer
    conditionComplete: boolean
    pickupSelected: boolean
    selectedAddress: ShippingAddress | null
    isFormOpen: boolean
    // Verification Data
    serialNumber: string
    governmentId: string
    devicePhoto: File | string | null
    phoneNumber: string
    problems: string[]
    reason: string
    isSubmitting: boolean
}

export default function ExchangeClient({ categories, initialProducts = [], bannerSection, blogSection }: MainProps) {
    const router = useRouter()

    const [state, setState] = useState<ExchangeState>({
        selectedCategory: null,
        selectedBrand: '',
        searchTerm: '',
        products: initialProducts,
        isLoadingProducts: false,
        selectedProduct: null,
        isLoadingDetail: false,
        colorOptions: [],
        selectedColor: null,
        conditionAnswers: { screen: 0, body: 0, battery: 0, functional: 0 },
        conditionComplete: false,
        pickupSelected: true,
        selectedAddress: null,
        isFormOpen: false,
        serialNumber: '',
        governmentId: '',
        devicePhoto: null,
        phoneNumber: '',
        problems: [],
        reason: '',
        isSubmitting: false,
    })

    // ── Filter Categories to Mobile & Laptop Only ──
    const filteredCategories = useMemo(() => {
        return categories.filter(cat =>
            cat.title?.toLowerCase().includes('mobile') ||
            cat.title?.toLowerCase().includes('laptop') ||
            cat.title?.toLowerCase().includes('smartphone') ||
            cat.title?.toLowerCase().includes('macbook') ||
            cat.slug?.toLowerCase().includes('mobile') ||
            cat.slug?.toLowerCase().includes('laptop') ||
            cat.slug?.toLowerCase().includes('smartphone') ||
            cat.slug?.toLowerCase().includes('macbook')
        )
    }, [categories])

    const { isLoggedIn, setloginDailogOpen, user } = useAuth()

    const updateState = useCallback((updates: Partial<ExchangeState>) => {
        setState(prev => ({ ...prev, ...updates }))
    }, [])

    const formSectionRef = useRef<HTMLDivElement>(null)
    const brandSectionRef = useRef<HTMLDivElement>(null)
    const modelSectionRef = useRef<HTMLDivElement>(null)
    const searchTimerRef = useRef<NodeJS.Timeout | null>(null)

    // ── Pre-select first category if none selected
    useEffect(() => {
        if (filteredCategories.length > 0 && !state.selectedCategory) {
            updateState({
                selectedCategory: filteredCategories[0],
                products: state.products.length === 0 && initialProducts.length > 0 ? initialProducts : state.products
            })
        }
    }, [categories, initialProducts, state.selectedCategory, state.products.length, updateState])

    // ── Derived
    const activePrice = useCallback((product: FullProduct, color: ColorOption | null) =>
        color ? color.discountedPrice || color.price : product.discounted_price || product.price
        , [])

    const exchangeValue = useMemo(() => {
        if (!state.selectedProduct) return 0
        return calculateExchangeValue(
            activePrice(state.selectedProduct, state.selectedColor),
            state.selectedProduct.created_at,
            state.conditionComplete ? state.conditionAnswers : undefined
        )
    }, [state.selectedProduct, state.selectedColor, state.conditionAnswers, state.conditionComplete, activePrice])

    const maxExchangeValue = useMemo(() => {
        if (!state.selectedProduct) return 0
        return getMaxExchangeValue(activePrice(state.selectedProduct, state.selectedColor), state.selectedProduct.created_at)
    }, [state.selectedProduct, state.selectedColor, activePrice])

    // ── Data fetchers
    const fetchProducts = useCallback(async (brandSlug: string, search?: string, forceCategorySlug?: string) => {
        updateState({ isLoadingProducts: true })
        try {
            let fetched: ProductListItem[] = []
            const targetCat = forceCategorySlug !== undefined ? forceCategorySlug : state.selectedCategory?.slug;

            if (search?.trim()) {
                const res = await ProductService.searchProducts({ search: search.trim(), categories: targetCat, brands: brandSlug, per_page: 10 })
                fetched = res?.data || []
            } else if (targetCat) {
                const res = await getCategoryProducts(targetCat, { brand: brandSlug, exchange_available: true, per_page: 10 })
                fetched = res?.data?.products || []
            } else {
                const res = await getBrandProducts(brandSlug, { per_page: 10 })
                fetched = res?.data || []
            }
            updateState({ products: fetched, isLoadingProducts: false })
        } catch {
            updateState({ products: [], isLoadingProducts: false })
        }
    }, [state.selectedCategory, updateState])

    // ── Reset helpers
    const handleResetAll = useCallback(() => {
        updateState({
            selectedCategory: null,
            selectedBrand: '',
            selectedProduct: null,
            colorOptions: [],
            selectedColor: null,
            products: [],
            conditionComplete: false,
            conditionAnswers: { screen: 0, body: 0, battery: 0, functional: 0 },
            isFormOpen: false,
            serialNumber: '',
            governmentId: '',
            devicePhoto: null,
            phoneNumber: '',
            problems: [],
            reason: '',
            selectedAddress: null,
        })
    }, [updateState])

    // ── Handlers
    const handleSelectCategory = (cat: NavbarItem) => {
        updateState({
            selectedCategory: cat,
            selectedBrand: '',
            selectedProduct: null,
            colorOptions: [],
            selectedColor: null,
            searchTerm: '',
            conditionComplete: false,
            conditionAnswers: { screen: 0, body: 0, battery: 0, functional: 0 }
        })
        fetchProducts('', '', cat.slug)
        const hasBrands = (cat.brands?.length || 0) > 0
        const targetRef = hasBrands ? brandSectionRef : modelSectionRef
        setTimeout(() => targetRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 150)
    }

    const handleSelectBrand = (slug: string) => {
        updateState({
            selectedBrand: slug,
            selectedProduct: null,
            colorOptions: [],
            selectedColor: null,
            searchTerm: '',
            conditionComplete: false,
            conditionAnswers: { screen: 0, body: 0, battery: 0, functional: 0 }
        })
        fetchProducts(slug)
        setTimeout(() => modelSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100)
    }

    const handleSearch = (value: string) => {
        updateState({ searchTerm: value })
        if (searchTimerRef.current) clearTimeout(searchTimerRef.current)
        searchTimerRef.current = setTimeout(() => {
            fetchProducts(state.selectedBrand, value)
        }, 400)
    }

    const handleSelectProduct = async (product: ProductListItem) => {
        updateState({
            isLoadingDetail: true,
            selectedColor: null,
            conditionComplete: false,
            conditionAnswers: { screen: 0, body: 0, battery: 0, functional: 0 },
            isFormOpen: true,
            serialNumber: '',
            governmentId: '',
            devicePhoto: null,
            phoneNumber: '',
            selectedAddress: null,
        })

        try {
            const full = await ProductService.getProductBySlug(product.slug)
            const colors = extractColorsFromVariants(full)
            updateState({
                selectedProduct: full,
                colorOptions: colors,
                selectedColor: colors.length === 1 ? colors[0] : null,
                isLoadingDetail: false
            })
        } catch {
            updateState({
                selectedProduct: {
                    id: Number(product.id), name: product.name, slug: product.slug,
                    price: Number(product.price), discounted_price: Number(product.discounted_price),
                    created_at: product.created_at,
                    image: typeof product.image === 'string' ? { full: product.image, thumb: product.image, preview: product.image } : product.image,
                    images: [], variants: [],
                    brand: { id: 0, name: '', slug: state.selectedBrand },
                },
                colorOptions: [],
                isLoadingDetail: false
            })
        }
    }

    const handleConditionAnswer = (key: 'screen' | 'body' | 'battery' | 'functional', value: number) => {
        const updatedAnswers = { ...state.conditionAnswers, [key]: value }
        const allAnswered = Object.values(updatedAnswers).every(v => v > 0)
        updateState({
            conditionAnswers: updatedAnswers,
            conditionComplete: allAnswered,
        })
    }

    const handleVerificationChange = (key: 'serialNumber' | 'governmentId' | 'devicePhoto' | 'phoneNumber', value: any) => {
        updateState({ [key]: value } as any)
    }

    const handleConditionExtra = (key: 'problems' | 'reason', value: any) => {
        updateState({ [key]: value } as any)
    }

    const getProductImage = (p: any) => {

        if (p.thumb?.url) return p.thumb.url;

        return '/imgfile/logoimg.png';
    }

    const handleCheckout = async () => {
        if (!isLoggedIn) {
            setloginDailogOpen(true)
            return
        }

        const addr = state.selectedAddress?.address
        const contact = state.selectedAddress?.contact_info
        const geo = state.selectedAddress?.geo

        const contactName = contact?.first_name
            ? `${contact.first_name} ${contact.last_name ?? ''}`.trim()
            : (user?.name ?? '')
        const contactPhone = state.phoneNumber || contact?.contact_number || user?.phone || ''

        const payload = {
            product_id: state.selectedProduct?.id,
            color: state.selectedColor?.name ?? '',
            exchange_value: exchangeValue,
            serial_number: state.serialNumber,
            government_id: state.governmentId,
            phone_number: state.phoneNumber,
            device_photo: state.devicePhoto ?? null,
            problems: state.problems,
            reason: state.reason,
            pickup: state.pickupSelected,
            address: {
                full_address: [addr?.landmark, addr?.city, addr?.district, addr?.province].filter(Boolean).join(', '),
                landmark: addr?.landmark ?? '',
                city: addr?.city ?? '',
                district: addr?.district ?? '',
                province: addr?.province ?? '',
                lat: geo?.lat ?? null,
                lng: geo?.lng ?? null,
            },
            contact_name: contactName,
            contact_phone: contactPhone,
        }

        updateState({ isSubmitting: true })
        try {
            await ProductService.submitExchangeRequest(payload)

            if (state.devicePhoto) {
                try { sessionStorage.setItem('exchangeDevicePhoto', state.devicePhoto as string) } catch { }
            }

            const params = new URLSearchParams({
                name: contactName || 'Customer',
                phone: contactPhone,
                device: state.selectedProduct?.name ?? '',
                value: String(exchangeValue),
                color: payload.color,
                image: getProductImage(state.selectedProduct),
                address: payload.address.full_address,
                serial: payload.serial_number,
                govtId: payload.government_id,
                pickup: state.pickupSelected ? 'Yes' : 'No',
                problems: state.problems.join(', '),
                reason: state.reason,
                contactName,
                contactPhone,
            })

            handleResetAll()
            router.push(`/exchangeProducts/success?${params.toString()}`)
        } catch {
            toast.error('Failed to submit exchange request. Please try again.')
        } finally {
            updateState({ isSubmitting: false })
        }
    }

    return (
        <main className="min-h-screen bg-[#F5F7FA] text-gray-800 pb-28">
            <ExchangeHero
                onWizardClick={() => {
                    formSectionRef.current?.scrollIntoView({ behavior: 'smooth' })
                }}
                onCatalogClick={() => {
                    formSectionRef.current?.scrollIntoView({ behavior: 'smooth' })
                }}
            />

            <section ref={formSectionRef} className="mx-auto px-4 lg:px-8 max-w-8xl py-8">
                <ExchangeBreadcrumb
                    selectedCategory={state.selectedCategory}
                    selectedBrand={state.selectedBrand}
                    selectedProduct={state.selectedProduct}
                />

                <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden min-h-[500px]">
                    <CatalogView
                        categories={filteredCategories}
                        selectedCategory={state.selectedCategory}
                        selectedBrand={state.selectedBrand}
                        searchTerm={state.searchTerm}
                        products={state.products}
                        isLoadingProducts={state.isLoadingProducts}
                        onSelectCategory={handleSelectCategory}
                        onSelectBrand={handleSelectBrand}
                        onSearch={handleSearch}
                        onSelectProduct={handleSelectProduct}
                        getProductImage={getProductImage}
                    />

                    {/* Wizard Popup (Sheet) */}
                    <Sheet
                        open={state.isFormOpen}
                        onOpenChange={(open) => updateState({ isFormOpen: open })}
                    >
                        <SheetContent side="right" showOverlay={false} className="w-full sm:max-w-105 p-0 overflow-y-auto border-0 shadow-2xl ring-1 ring-black/5">
                            <SheetHeader className="sr-only">
                                <SheetTitle>Exchange Details</SheetTitle>
                                <SheetDescription>Complete the details below to get an instant quote</SheetDescription>
                            </SheetHeader>
                            <ExchangeForm
                                selectedCategory={state.selectedCategory}
                                selectedProduct={state.selectedProduct}
                                isLoadingDetail={state.isLoadingDetail}
                                conditionAnswers={state.conditionAnswers}
                                conditionComplete={state.conditionComplete}
                                exchangeValue={exchangeValue}
                                pickupSelected={state.pickupSelected}
                                onConditionAnswer={handleConditionAnswer}
                                onPickupSelect={(sel) => updateState({ pickupSelected: sel })}
                                onCheckout={handleCheckout}
                                isLoggedIn={isLoggedIn}
                                onLoginRequest={() => setloginDailogOpen(true)}
                                selectedAddress={state.selectedAddress}
                                onAddressSelect={(addr: ShippingAddress) => updateState({ selectedAddress: addr })}
                                serialNumber={state.serialNumber}
                                governmentId={state.governmentId}
                                devicePhoto={state.devicePhoto}
                                phoneNumber={state.phoneNumber}
                                onVerificationChange={handleVerificationChange}
                                problems={state.problems}
                                reason={state.reason}
                                onConditionExtra={handleConditionExtra}
                            />
                        </SheetContent>
                    </Sheet>
                </div>
            </section>

            <ExchangeSeoSections onGetQuoteClick={() => formSectionRef.current?.scrollIntoView({ behavior: 'smooth' })} />

            {bannerSection && (
                <div className="container mx-auto px-4 lg:px-8 max-w-7xl py-6">
                    {bannerSection}
                </div>
            )}

            <section className="bg-[#F5F7FA] border-t border-gray-100 max-w-7xl mx-auto py-4">
                <EmiFaq
                    params={{ type: 'brand', per_page: 15, page: 1 }}
                    title="Frequently asked questions about mobile exchange"
                    subtitle="Everything you need to know before exchanging your phone"
                />
            </section>

            {blogSection && (
                <section className="bg-[#F5F7FA] border-t w-screen border-gray-100 ">
                    {blogSection}
                </section>
            )}
        </main>
    )
}
