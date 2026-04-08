'use client'

import React, { useState, useMemo, useRef, useCallback, useEffect } from 'react'
import { toast } from 'sonner'
import { searchProducts, submitRepairRequest } from '../api/services/product.service'
import { getCategoryProducts } from '../api/services/category.service'

import type { ShippingAddress } from '../checkout/checkoutTypes'

// Sub-components
import RepairHero from './_components/RepairHero'
import RepairBreadcrumb from './_components/RepairBreadcrumb'
import RepairCatalogView from './_components/RepairCatalogView'
import RepairForm from './_components/RepairForm'
import RepairSEOSections from './_components/RepairSEOSections'
import RepairSuccessDialog from './_components/RepairSuccessDialog'

import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
} from '@/components/ui/sheet'
import { useAuthStore } from '../context/AuthContext'
import { useShallow } from 'zustand/react/shallow'

interface BrandItem { id: number; name: string; slug: string; image?: string }
interface CategoryItem { id: number; title: string; slug: string; brands?: BrandItem[] }
interface RepairClientProps { brands: BrandItem[]; categories: CategoryItem[] }

interface SuccessData {
    name: string
    phone: string
    device: string
    image: string
    repairs: string[]
    address: string
}

interface State {
    selectedCategory: CategoryItem | null
    selectedBrand: string
    searchTerm: string
    products: any[]
    isLoadingProducts: boolean
    selectedProduct: any
    isLoadingDetail: boolean
    selectedRepairs: string[]
    issueDescription: string
    photoUrls: string[]
    photos: File[]
    isFormOpen: boolean
    serialNumber: string
    phoneNumber: string
    isSubmitting: boolean
    selectedAddress: ShippingAddress | null
    successData: SuccessData | null
}

export default function RepairClient({ brands, categories }: RepairClientProps) {
    const { isLoggedIn, user, triggerLoginAlert } = useAuthStore(
        useShallow((s) => ({
            isLoggedIn: s.isLoggedIn,
            user: s.user,
            triggerLoginAlert: s.triggerLoginAlert,
        }))
    );
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

    const [state, setState] = useState<State>({
        selectedCategory: null,
        selectedBrand: '',
        searchTerm: '',
        products: [],
        isLoadingProducts: false,
        selectedProduct: null,
        isLoadingDetail: false,
        selectedRepairs: [],
        issueDescription: '',
        photoUrls: [],
        photos: [],
        isFormOpen: false,
        serialNumber: '',

        phoneNumber: '',
        isSubmitting: false,
        selectedAddress: null,
        successData: null,
    })

    const updateState = useCallback((updates: Partial<State>) => {
        setState(prev => ({ ...prev, ...updates }))
    }, [])

    const formSectionRef = useRef<HTMLDivElement>(null)
    const searchTimerRef = useRef<NodeJS.Timeout | null>(null)

    // ── Pre-select first category ──
    useEffect(() => {
        if (filteredCategories.length > 0 && !state.selectedCategory) {
            updateState({ selectedCategory: filteredCategories[0] })
        }
    }, [filteredCategories, state.selectedCategory, updateState])

    // ── Data Fetchers ──
    const fetchProducts = useCallback(async (brandSlug: string, search?: string, forceCategorySlug?: string) => {
        updateState({ isLoadingProducts: true })
        try {
            let fetched: any[] = []
            const targetCat = forceCategorySlug ?? state.selectedCategory?.slug

            if (search?.trim()) {
                const res = await searchProducts({ search: search.trim(), categories: targetCat, brands: brandSlug, per_page: 20 })
                fetched = res?.data || []
            } else if (targetCat) {
                const res = await getCategoryProducts(targetCat, { brand: brandSlug, per_page: 20 })
                fetched = res?.data?.products || res?.data || []
            } else if (brandSlug) {
                const res = await searchProducts({ brands: brandSlug, per_page: 20 })
                fetched = res?.data || []
            } else {
                const res = await searchProducts({ per_page: 20 })
                fetched = res?.data || []
            }
            updateState({ products: fetched, isLoadingProducts: false })
        } catch {
            updateState({ products: [], isLoadingProducts: false })
        }
    }, [state.selectedCategory, updateState])

    useEffect(() => {
        if (state.selectedCategory) fetchProducts(state.selectedBrand)
    }, [state.selectedCategory, fetchProducts])

    // ── Handlers ──
    const handleSelectCategory = (cat: CategoryItem) => {
        updateState({
            selectedCategory: cat,
            selectedBrand: '',
            searchTerm: '',
            products: []
        })
        fetchProducts('', '', cat.slug)
    }

    const handleSelectBrand = (slug: string) => {
        updateState({ selectedBrand: slug, searchTerm: '', products: [] })
        fetchProducts(slug)
    }

    const handleSearch = (value: string) => {
        updateState({ searchTerm: value })
        if (searchTimerRef.current) clearTimeout(searchTimerRef.current)
        searchTimerRef.current = setTimeout(() => {
            fetchProducts(state.selectedBrand, value)
        }, 400)
    }

    const handleSelectProduct = (product: any) => {
        updateState({ selectedProduct: product, isFormOpen: true })
    }

    const handleResetAll = useCallback(() => {
        updateState({
            selectedCategory: null,
            selectedBrand: '',
            searchTerm: '',
            products: [],
            selectedProduct: null,
            selectedRepairs: [],
            issueDescription: '',
            photoUrls: [],
            photos: [],
            isFormOpen: false,
            serialNumber: '',
            phoneNumber: '',
            isSubmitting: false,
            selectedAddress: null,
            successData: null,
        })
    }, [updateState])

    useEffect(() => {
        return () => handleResetAll()
    }, [handleResetAll])

    const handleToggleRepair = (id: string) => {
        updateState({
            selectedRepairs: state.selectedRepairs.includes(id)
                ? state.selectedRepairs.filter(r => r !== id)
                : [...state.selectedRepairs, id]
        })
    }

    const handlePhotoUpload = (files: File[]) => {
        const newUrls = files.map(file => URL.createObjectURL(file))
        updateState({
            photos: [...state.photos, ...files],
            photoUrls: [...state.photoUrls, ...newUrls]
        })
    }

    const handlePhotoRemove = (index: number) => {
        const newPhotos = [...state.photos]
        const newUrls = [...state.photoUrls]
        newPhotos.splice(index, 1)
        newUrls.splice(index, 1)
        updateState({ photos: newPhotos, photoUrls: newUrls })
    }

    const handleVerificationChange = (key: string, value: string) => {
        updateState({ [key]: value } as any)
    }

    const handleCheckout = async () => {
        if (!isLoggedIn) {
            triggerLoginAlert()
            return
        }

        const addr = state.selectedAddress?.address
        const contact = state.selectedAddress?.contact_info
        const geo = state.selectedAddress?.geo

        const payload = {
            service_type: 'repair_request',
            customer: {
                name: contact?.first_name ? `${contact.first_name} ${contact.last_name ?? ''}`.trim() : (user?.name ?? ''),
                phone: state.phoneNumber || contact?.contact_number || user?.phone || '',
                user_id: user?.id || null
            },
            device_info: {
                product_id: state.selectedProduct?.id,
                name: state.selectedProduct?.name,
                serial_number: state.serialNumber,

            },
            repair_details: {
                selected_repairs: state.selectedRepairs,
                description: state.issueDescription,
                photos: state.photoUrls,
            },
            pickup_address: {
                full_address: [addr?.landmark, addr?.city, addr?.district, addr?.province].filter(Boolean).join(', '),
                landmark: addr?.landmark ?? '',
                city: addr?.city ?? '',
                district: addr?.district ?? '',
                province: addr?.province ?? '',
                lat: geo?.lat ?? null,
                lng: geo?.lng ?? null,
            },
            metadata: {
                source: 'repair_wizard_v2',
                timestamp: new Date().toISOString(),
            }
        }

        updateState({ isSubmitting: true })
        try {
            // await submitRepairRequest(payload)
            console.log('Repair Request Payload:', payload) // For debugging, remove in production

            updateState({
                isFormOpen: false,
                isSubmitting: false,
                successData: {
                    name: payload.customer.name || 'Customer',
                    phone: payload.customer.phone,
                    device: payload.device_info.name ?? '',
                    image: getProductImage(state.selectedProduct),
                    repairs: state.selectedRepairs,
                    address: payload.pickup_address.full_address,
                },
            })
        } catch {
            toast.error('Failed to submit repair request. Please try again.')
            updateState({ isSubmitting: false })
        }
    }

    const getProductImage = (p: any) => {
        if (!p) return '/imgfile/logoimg.png'
        if (p.thumb?.url) return p.thumb.url
        if (typeof p.image === 'string') return p.image
        return p.image?.thumb ?? p.image?.full ?? '/imgfile/logoimg.png'
    }

    return (
        <><main className="min-h-screen bg-[#F5F7FA] text-gray-800 pb-28">
            <RepairHero
                onStartClick={() => formSectionRef.current?.scrollIntoView({ behavior: 'smooth' })}
                onCatalogClick={() => formSectionRef.current?.scrollIntoView({ behavior: 'smooth' })}
            />

            <section ref={formSectionRef} className="mx-auto px-4 lg:px-8 max-w-8xl py-8">
                <RepairBreadcrumb
                    selectedBrand={state.selectedBrand}
                    selectedProduct={state.selectedProduct?.name}
                />

                <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden min-h-[500px]">
                    <RepairCatalogView
                        categories={filteredCategories}
                        selectedCategory={state.selectedCategory}
                        brands={brands}
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

                    {/* Repair Form Popup (Sheet) */}
                    <Sheet
                        open={state.isFormOpen}
                        onOpenChange={(open) => updateState({ isFormOpen: open })}
                    >
                        <SheetContent side="right" showOverlay={false} className="w-full sm:max-w-105 p-0 overflow-y-auto border-0 shadow-2xl ring-1 ring-black/5">
                            <SheetHeader className="sr-only">
                                <SheetTitle>Repair Details</SheetTitle>
                                <SheetDescription>Complete the details to request a repair</SheetDescription>
                            </SheetHeader>
                            <RepairForm
                                selectedProduct={state.selectedProduct}
                                isLoadingDetail={state.isLoadingDetail}
                                selectedRepairs={state.selectedRepairs}
                                onToggleRepair={handleToggleRepair}
                                issueDescription={state.issueDescription}
                                onDescriptionChange={(val) => updateState({ issueDescription: val })}
                                photoUrls={state.photoUrls}
                                onPhotoUpload={handlePhotoUpload}
                                onPhotoRemove={handlePhotoRemove}
                                pickupSelected={true}
                                onPickupSelect={() => { }}
                                onCheckout={handleCheckout}
                                onLoginRequest={() => triggerLoginAlert()}
                                isLoggedIn={isLoggedIn}
                                selectedAddress={state.selectedAddress}
                                onAddressSelect={(addr) => updateState({ selectedAddress: addr })}
                                serialNumber={state.serialNumber}

                                phoneNumber={state.phoneNumber}
                                onVerificationChange={handleVerificationChange}
                                isSubmitting={state.isSubmitting}
                            />
                        </SheetContent>
                    </Sheet>
                </div>
            </section>

            <RepairSEOSections onGetQuoteClick={() => formSectionRef.current?.scrollIntoView({ behavior: 'smooth' })} />
        </main>
            <RepairSuccessDialog
                data={state.successData}
                onClose={() => updateState({ successData: null })}
            />
        </>
    )
}
