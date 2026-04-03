'use client'

import React, { useState, useMemo, useRef, useCallback, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import {
    type ProductListItem, type FullProduct, type ConditionAnswer,
    calculateExchangeValueBreakdown,
    GET_CONDITION_QUESTIONS, IS_EXCHANGE_CATEGORY, getThumbnail, parsePrice
} from './exchange-helpers'
import { searchProducts, getProductBySlug, submitExchangeRequest } from '../api/services/product.service'
import { getCategoryProducts } from '../api/services/category.service'
import type { NavbarItem } from '../context/navbar.interface'
import { useAuth } from '../context/AuthContext'
import type { ShippingAddress } from '../checkout/checkoutTypes'
// @ts-ignore
import EmiFaq from '../emi/apply/_components/EmiFaq'

import ExchangeHero from './_components/ExchangeHero'
import ExchangeBreadcrumb from './_components/ExchangeBreadcrumb'
import CatalogView from './_components/CatalogView'
import ExchangeForm from './_components/ExchangeForm'
import ExchangeSeoSections from './_components/ExchangeSeoSections'

import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
} from '@/components/ui/sheet'

interface Props {
    categories: NavbarItem[]
    initialProducts?: ProductListItem[]
    bannerSection?: React.ReactNode
    blogSection?: React.ReactNode
}

interface State {
    selectedCategory: NavbarItem | null
    selectedBrand: string
    searchTerm: string
    products: ProductListItem[]
    isLoadingProducts: boolean
    selectedProduct: FullProduct | null
    isLoadingDetail: boolean
    conditionAnswers: ConditionAnswer
    pickupSelected: boolean
    selectedAddress: ShippingAddress | null
    isFormOpen: boolean
    serialNumber: string
    governmentId: string
    devicePhoto: string | null
    phoneNumber: string
    problems: string[]
    reason: string
    isSubmitting: boolean
    selectedNewProduct: ProductListItem | null
    newProducts: ProductListItem[]
    isLoadingNewProducts: boolean
    satisfactionChoice: 'yes' | 'no' | 'offer' | null
    satisfactionReason: string
    offeredAmount: string
}

export default function ExchangeClient({ categories, initialProducts = [], bannerSection, blogSection }: Props) {
    const router = useRouter()
    const { isLoggedIn, setloginDailogOpen, user } = useAuth()

    const [state, setState] = useState<State>({
        selectedCategory: null,
        selectedBrand: '',
        searchTerm: '',
        products: initialProducts,
        isLoadingProducts: false,
        selectedProduct: null,
        isLoadingDetail: false,
        conditionAnswers: {
            switch_on: 1.0,
            mdms_registered: 1.0,
            problems: [],
            under_warranty: 1.0,
            accessories: []
        },
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
        selectedNewProduct: null,
        newProducts: [],
        isLoadingNewProducts: false,
        satisfactionChoice: null,
        satisfactionReason: '',
        offeredAmount: '',
    })

    const updateState = useCallback((updates: Partial<State>) => {
        setState(prev => ({ ...prev, ...updates }))
    }, [])

    const filteredCategories = useMemo(() => categories.filter(IS_EXCHANGE_CATEGORY), [categories])

    const formSectionRef = useRef<HTMLDivElement>(null)
    const brandSectionRef = useRef<HTMLDivElement>(null)
    const modelSectionRef = useRef<HTMLDivElement>(null)
    const searchTimerRef = useRef<NodeJS.Timeout | null>(null)

    useEffect(() => {
        if (filteredCategories.length > 0 && !state.selectedCategory) {
            updateState({
                selectedCategory: filteredCategories[0],
                products: state.products.length === 0 && initialProducts.length > 0 ? initialProducts : state.products
            })
        }
    }, [filteredCategories, initialProducts, state.selectedCategory, state.products.length, updateState])

    const valuation = useMemo(() => {
        if (!state.selectedProduct) return { total: 0, breakdown: [] }
        const price = state.selectedProduct.price
        if (!price) return { total: 0, breakdown: [] }
        return calculateExchangeValueBreakdown(
            price,
            state.selectedProduct.created_at ?? '',
            state.conditionAnswers
        )
    }, [state.selectedProduct, state.conditionAnswers])

    const fetchProducts = useCallback(async (brandSlug: string, search?: string, forceCategorySlug?: string) => {
        updateState({ isLoadingProducts: true })
        try {
            let fetched: ProductListItem[] = []
            const targetCat = forceCategorySlug ?? state.selectedCategory?.slug

            if (search?.trim()) {
                const res = await searchProducts({ search: search.trim(), categories: targetCat, brands: brandSlug, per_page: 10 })
                fetched = res?.data ?? []
            } else if (targetCat) {
                const res = await getCategoryProducts(targetCat, { brand: brandSlug, exchange_available: true, per_page: 10 })
                fetched = res?.data?.products ?? []
            }
            updateState({ products: fetched, isLoadingProducts: false })
        } catch {
            updateState({ products: [], isLoadingProducts: false })
        }
    }, [state.selectedCategory, updateState])

    const handleResetAll = useCallback(() => {
        updateState({
            selectedCategory: null,
            selectedBrand: '',
            selectedProduct: null,
            products: [],
            conditionAnswers: { switch_on: 1.0, mdms_registered: 1.0, problems: [], under_warranty: 1.0, accessories: [] },
            isFormOpen: false,
            serialNumber: '',
            governmentId: '',
            devicePhoto: null,
            phoneNumber: '',
            problems: [],
            reason: '',
            selectedAddress: null,
            selectedNewProduct: null,
            newProducts: [],
            isLoadingNewProducts: false,
            satisfactionChoice: null,
            satisfactionReason: '',
            offeredAmount: '',
        })
    }, [updateState])

    useEffect(() => {
        return () => { handleResetAll() }
    }, [handleResetAll])

    const handleSelectCategory = (cat: NavbarItem) => {
        updateState({
            selectedCategory: cat,
            selectedBrand: '',
            selectedProduct: null,
            searchTerm: '',
            conditionAnswers: { switch_on: 1.0, mdms_registered: 1.0, problems: [], under_warranty: 1.0, accessories: [] }
        })
        fetchProducts('', '', cat.slug)
        const hasBrands = (cat.brands?.length ?? 0) > 0
        const targetRef = hasBrands ? brandSectionRef : modelSectionRef
        setTimeout(() => targetRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 150)
    }

    const handleSelectBrand = (slug: string) => {
        updateState({
            selectedBrand: slug,
            selectedProduct: null,
            searchTerm: '',
            conditionAnswers: { switch_on: 1.0, mdms_registered: 1.0, problems: [], under_warranty: 1.0, accessories: [] }
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

    const handleSearchNewProducts = useCallback(async (query: string) => {
        if (!query.trim()) {
            updateState({ newProducts: state.products, isLoadingNewProducts: false })
            return
        }
        updateState({ isLoadingNewProducts: true })
        try {
            const res = await searchProducts({ search: query.trim(), per_page: 20 })
            updateState({ newProducts: res?.data ?? [], isLoadingNewProducts: false })
        } catch {
            updateState({ newProducts: [], isLoadingNewProducts: false })
        }
    }, [state.products, updateState])

    const handleSelectProduct = async (product: ProductListItem) => {
        updateState({
            isLoadingDetail: true,
            selectedProduct: {
                id: Number(product.id),
                name: product.name,
                slug: product.slug,
                price: parsePrice(product.price) || parsePrice(product.discounted_price ?? '') || 0,
                discounted_price: parsePrice(product.discounted_price ?? product.price) || parsePrice(product.price) || 0,
                created_at: product.created_at,
                image: typeof product.image === 'string' ? { full: product.image, thumb: product.image, preview: product.image } : product.image,
                brand: product.brand ?? { id: 0, name: '', slug: state.selectedBrand },
            },
            conditionAnswers: { switch_on: 1.0, mdms_registered: 1.0, problems: [], under_warranty: 1.0, accessories: [] },
            isFormOpen: true,
            phoneNumber: '',
            selectedAddress: null,
            selectedNewProduct: null,
        })

        try {
            const full = await getProductBySlug(product.slug)
            updateState({ selectedProduct: full, isLoadingDetail: false })
        } catch {
            updateState({ isLoadingDetail: false })
        }
    }

    const currentQuestions = useMemo(() => GET_CONDITION_QUESTIONS(
        state.selectedCategory?.slug ?? '',
        state.selectedProduct?.brand.name ?? '',
        state.selectedProduct?.attributes?.product_attributes ?? {}
    ), [state.selectedCategory, state.selectedProduct])

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
            service_type: 'exchange_request',
            customer: {
                name: contactName,
                phone: contactPhone,
                user_id: user?.id ?? null
            },
            device_info: {
                product_id: state.selectedProduct?.id,
                name: state.selectedProduct?.name,

                serial_number: state.serialNumber,
                government_id: state.governmentId,
                device_photo: state.devicePhoto ?? null,
                condition_answers: state.conditionAnswers,
                problems: state.problems,
                reason: state.reason,
            },
            valuation: {
                estimated_value: valuation.total,
                breakdown: valuation.breakdown,
            },
            target_device: state.selectedNewProduct ? {
                product_id: state.selectedNewProduct.id,
                name: state.selectedNewProduct.name,
                price: Number(state.selectedNewProduct.price),
                price_after_exchange: 0
            } : null,
            pickup_info: {
                selected: state.pickupSelected,
                address: {
                    full_address: [addr?.landmark, addr?.city, addr?.district, addr?.province].filter(Boolean).join(', '),
                    landmark: addr?.landmark ?? '',
                    city: addr?.city ?? '',
                    district: addr?.district ?? '',
                    province: addr?.province ?? '',
                    lat: geo?.lat ?? null,
                    lng: geo?.lng ?? null,
                }
            },
            satisfaction: {
                choice: state.satisfactionChoice,
                reason: state.satisfactionReason,
                offered_amount: state.offeredAmount ? Number(state.offeredAmount) : null,
            },
            //     source: 'exchange_wizard_v4_arko',
            //     timestamp: new Date().toISOString(),
            // }
        }

        updateState({ isSubmitting: true })
        try {
            // await submitExchangeRequest(payload)
            if (state.devicePhoto) {
                try { sessionStorage.setItem('exchangeDevicePhoto', state.devicePhoto) } catch { }
            }

            const params = new URLSearchParams({
                name: payload.customer.name,
                phone: payload.customer.phone,
                device: payload.device_info.name ?? '',
                value: String(valuation.total),
                image: getThumbnail(state.selectedProduct),
                address: payload.pickup_info.address.full_address,
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
                onWizardClick={() => { formSectionRef.current?.scrollIntoView({ behavior: 'smooth' }) }}
                onCatalogClick={() => { formSectionRef.current?.scrollIntoView({ behavior: 'smooth' }) }}
            />

            <section ref={formSectionRef} className="mx-auto px-4 lg:px-8 max-w-8xl py-4 sm:py-6">
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
                        getProductImage={getThumbnail}
                    />
                </div>

                <Sheet open={state.isFormOpen} onOpenChange={(open) => updateState({ isFormOpen: open })}>
                    <SheetContent className="sm:max-w-[540px] bg-white p-0 border-l-0 overflow-y-auto">
                        <SheetHeader className="px-6 py-4 border-b bg-white sticky top-0 z-50">
                            <SheetTitle className="text-xl hidden font-bold text-gray-900">Device Evaluation</SheetTitle>
                        </SheetHeader>
                          <ExchangeForm
                                questions={currentQuestions}
                                selectedCategory={state.selectedCategory}
                                selectedProduct={state.selectedProduct}
                                isLoadingDetail={state.isLoadingDetail}
                                conditionAnswers={state.conditionAnswers}
                                exchangeValue={valuation.total}
                                valuationBreakdown={valuation.breakdown}
                                pickupSelected={state.pickupSelected}
                                onConditionAnswer={(key, val) => updateState({ conditionAnswers: { ...state.conditionAnswers, [key]: val } })}
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
                                onVerificationChange={(key, val) => updateState({ [key]: val } as any)}
                                problems={state.problems}
                                reason={state.reason}
                                onConditionExtra={(key, val) => updateState({ [key]: val } as any)}
                                availableProducts={state.newProducts.length > 0 ? state.newProducts : state.products}
                                isLoadingProducts={state.isLoadingNewProducts}
                                onSearchProducts={handleSearchNewProducts}
                                selectedNewProduct={state.selectedNewProduct}
                                onSelectNewProduct={(p) => updateState({ selectedNewProduct: p })}
                                onBack={() => updateState({ isFormOpen: false })}
                                satisfactionChoice={state.satisfactionChoice}
                                satisfactionReason={state.satisfactionReason}
                                offeredAmount={state.offeredAmount}
                                onSatisfactionChange={(key, val) => updateState({ [key]: val } as any)}
                            />
                    </SheetContent>
                </Sheet>
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
                    subtitle="Everything you need to know"
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
