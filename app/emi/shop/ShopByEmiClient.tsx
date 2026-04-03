'use client'

import React, { useMemo, useState } from 'react'
import Image from 'next/image'
import { useSearchParams } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
    Apple,
    BadgePercent,
    Building2,
    CheckCircle2,
    ChevronRight,
    Landmark,
    Percent,
    RefreshCw,
    Sparkles,
    Tags,
} from 'lucide-react'

import type { NavbarItem } from '@/app/context/navbar.interface'
import EmiBasketSection from './EmiBasketSection'
import EmiFaq from '../apply/_components/EmiFaq'
import { logoImg } from '@/app/CommonVue/Image'

const TENURE_OPTIONS = [6, 9, 12, 18]
type EmiPlan = 'standard' | 'apple_zero' | 'citizens_0_40'

interface BannerItem {
    image?: { full?: string | null } | null
    thumbnail_image?: { full?: string | null } | null
}

interface Props {
    initialCategories?: NavbarItem[]
    footerBanners?: BannerItem[]
}

interface State {
    budget: number
    tenure: number
    downPaymentStr: string
    zeroEmi: boolean
    emiPlan: EmiPlan
    selectedCategorySlug: string
    selectedBrandSlug: string
}

const EMI_PLANS: Array<{ id: EmiPlan; name: string; desc: string; icon: React.ReactNode }> = [
    { id: 'standard', name: 'Standard EMI', desc: 'Regular bank financing', icon: <Building2 className="h-4 w-4" /> },
    { id: 'apple_zero', name: 'Apple 0% EMI', desc: 'Apple-focused 0% options', icon: <Apple className="h-4 w-4" /> },
    { id: 'citizens_0_40', name: 'Citizens 0% Plan', desc: '0% with 40% down payment', icon: <Percent className="h-4 w-4" /> },
]

function getBannerImage(banner?: BannerItem) {
    return banner?.image?.full ?? banner?.thumbnail_image?.full ?? null
}

export default function ShopByEmiClient({ initialCategories = [], footerBanners = [] }: Props) {
    const searchParams = useSearchParams()

    const categoryList = useMemo(() => {
        if (!Array.isArray(initialCategories)) return []
        return initialCategories.filter((category) => category?.status !== false)
    }, [initialCategories])

    const initialCategorySlug = useMemo(() => {
        const requested = searchParams.get('category')
        const hasRequested = categoryList.some((category) => category.slug === requested)
        return hasRequested ? requested ?? '' : categoryList[0]?.slug ?? ''
    }, [categoryList, searchParams])

    const [state, setState] = useState<State>({
        budget: Number(searchParams.get('budget') ?? '5000'),
        tenure: Number(searchParams.get('tenure') ?? '12'),
        downPaymentStr: searchParams.get('down_payment') ?? '0',
        zeroEmi: (searchParams.get('interest') ?? 'zero') === 'zero',
        emiPlan: (searchParams.get('plan') as EmiPlan) ?? 'standard',
        selectedCategorySlug: initialCategorySlug,
        selectedBrandSlug: searchParams.get('brand') ?? 'all',
    })

    const updateState = (updates: Partial<State>) => {
        setState((prev) => ({ ...prev, ...updates }))
    }

    const selectedCategory = useMemo(
        () => categoryList.find((category) => category.slug === state.selectedCategorySlug) ?? categoryList[0] ?? null,
        [categoryList, state.selectedCategorySlug]
    )

    const availableBrands = useMemo(() => {
        if (!selectedCategory?.brands?.length) return []
        return Array.from(new Map(selectedCategory.brands.map((brand) => [brand.slug, brand])).values())
    }, [selectedCategory])

    const selectedBrand = useMemo(() => {
        if (state.selectedBrandSlug === 'all') return null
        return availableBrands.find((brand) => brand.slug === state.selectedBrandSlug) ?? null
    }, [availableBrands, state.selectedBrandSlug])

    const visibleSections = useMemo(() => {
        if (!categoryList.length) return []
        const primary = selectedCategory ? [selectedCategory] : []
        const secondary = categoryList.filter((category) => category.slug !== selectedCategory?.slug).slice(0, 2)
        return [...primary, ...secondary]
    }, [categoryList, selectedCategory])

    const parsedDownPayment = Number(state.downPaymentStr)
    const downPayment = Number.isNaN(parsedDownPayment) ? 0 : parsedDownPayment
    const validBanner0 = getBannerImage(footerBanners[0])
    const validBanner1 = getBannerImage(footerBanners[1])
    const faqParams = useMemo(() => ({ type: 'brand', per_page: 10, page: 1 }), [])

    const heroImage = selectedCategory?.thumb?.url ?? logoImg
    const brandCount = availableBrands.length
    const categoryCount = categoryList.length

    return (
        <div className="min-h-screen bg-[linear-gradient(180deg,#f8fafc_0%,#ffffff_28%,#f8fafc_100%)]">
            <section className="border-b border-slate-200 bg-[linear-gradient(135deg,#fff7ed_0%,#ffffff_38%,#e8f0fb_100%)]">
                <div className="mx-auto max-w-7xl px-4 py-10 lg:px-8 lg:py-12">
                    <div className="grid gap-6 xl:grid-cols-[1.12fr_0.88fr]">
                        <div className="space-y-6">
                            <div className="inline-flex items-center gap-2 rounded-full border border-orange-200 bg-white/80 px-3 py-1 text-[10px] font-black uppercase tracking-[0.22em] text-(--colour-fsP1)">
                                <RefreshCw className="h-3.5 w-3.5" />
                                EMI Discovery Desk
                            </div>

                            <div className="space-y-4">
                                <h1 className="max-w-4xl text-3xl font-black leading-[1.05] tracking-tight text-slate-950 sm:text-4xl lg:text-5xl">
                                    Shop by EMI with a sharper catalog view, cleaner filters, and real category and brand navigation.
                                </h1>
                                <p className="max-w-2xl text-sm font-medium leading-7 text-slate-600 sm:text-base">
                                    Start from a monthly budget, jump into a navbar category, then narrow by brand without refetching menu data. The interface stays focused on products you can actually finance.
                                </p>
                            </div>

                            <div className="grid gap-3 sm:grid-cols-3">
                                {[
                                    { label: 'Navbar Categories', value: categoryCount.toString(), icon: Tags },
                                    { label: 'Visible Brands', value: brandCount.toString(), icon: Landmark },
                                    { label: 'Selected Plan', value: EMI_PLANS.find((plan) => plan.id === state.emiPlan)?.name ?? 'Standard EMI', icon: BadgePercent },
                                ].map((item) => (
                                    <div key={item.label} className="rounded-[24px] border border-white/70 bg-white/90 p-4 shadow-[0_18px_50px_-32px_rgba(15,23,42,0.45)]">
                                        <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-950 text-white">
                                            <item.icon className="h-4 w-4" />
                                        </div>
                                        <p className="text-[10px] font-black uppercase tracking-[0.22em] text-slate-500">{item.label}</p>
                                        <p className="mt-2 text-sm font-black text-slate-950">{item.value}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="rounded-[30px] border border-slate-200 bg-slate-950 p-5 text-white shadow-[0_32px_90px_-48px_rgba(15,23,42,0.9)] md:p-6">
                            <div className="flex items-start justify-between gap-4">
                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-[0.24em] text-orange-300">Focused Catalog</p>
                                    <h2 className="mt-2 text-2xl font-black">{selectedCategory?.title ?? 'EMI Categories'}</h2>
                                    <p className="mt-2 text-sm font-medium leading-6 text-slate-300">
                                        {selectedBrand
                                            ? `Currently narrowed to ${selectedBrand.name} inside ${selectedCategory?.title ?? 'the selected category'}.`
                                            : 'Pick a brand below to refine the selected category even more.'}
                                    </p>
                                </div>
                                <div className="relative h-24 w-24 overflow-hidden rounded-[24px] border border-white/10 bg-white/10 p-3">
                                    <Image
                                        src={heroImage}
                                        alt={selectedCategory?.thumb?.alt_text ?? selectedCategory?.title ?? 'EMI category'}
                                        fill
                                        className="object-contain p-3"
                                        sizes="96px"
                                    />
                                </div>
                            </div>

                            <div className="mt-6 space-y-3">
                                {[
                                    `Budget cap: NPR ${state.budget.toLocaleString()} per month`,
                                    `Tenure: ${state.tenure} months with NPR ${downPayment.toLocaleString()} down payment`,
                                    state.zeroEmi ? '0% EMI view is enabled' : 'Standard interest EMI view is enabled',
                                ].map((item, index) => (
                                    <div key={item} className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                                        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white/10 text-[11px] font-black text-orange-200">
                                            {index + 1}
                                        </div>
                                        <p className="text-sm font-medium leading-6 text-slate-200">{item}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <div className="mx-auto max-w-7xl space-y-6 px-4 py-8 lg:px-8">
                <div className="rounded-[30px] border border-slate-200 bg-white p-5 shadow-[0_20px_60px_-45px_rgba(15,23,42,0.6)] md:p-6">
                    <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
                        <div className="space-y-5">
                            <div>
                                <p className="text-[10px] font-black uppercase tracking-[0.22em] text-slate-500">Categories From Navbar</p>
                                <h2 className="mt-2 text-xl font-black text-slate-950">Choose where you want to shop</h2>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {categoryList.map((category) => {
                                    const active = category.slug === selectedCategory?.slug

                                    return (
                                        <button
                                            key={category.id}
                                            type="button"
                                            onClick={() => updateState({ selectedCategorySlug: category.slug, selectedBrandSlug: 'all' })}
                                            className={cn(
                                                'group inline-flex items-center gap-2 rounded-full border px-4 py-2.5 text-left text-xs font-black uppercase tracking-[0.18em] transition-all',
                                                active
                                                    ? 'border-slate-950 bg-slate-950 text-white shadow-[0_18px_40px_-30px_rgba(15,23,42,0.9)]'
                                                    : 'border-slate-200 bg-slate-50 text-slate-600 hover:border-orange-300 hover:bg-orange-50 hover:text-orange-600'
                                            )}
                                        >
                                            <span>{category.title}</span>
                                            <ChevronRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                                        </button>
                                    )
                                })}
                            </div>

                            <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-4">
                                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Category Context</p>
                                <p className="mt-2 text-sm font-semibold leading-6 text-slate-700">
                                    {selectedCategory?.children?.length
                                        ? `${selectedCategory.title} includes ${selectedCategory.children.length} sub-categories from the same navbar group.`
                                        : `${selectedCategory?.title ?? 'This category'} is ready to browse directly in EMI mode.`}
                                </p>
                            </div>
                        </div>

                        <div className="space-y-5">
                            <div>
                                <p className="text-[10px] font-black uppercase tracking-[0.22em] text-slate-500">Brands From Navbar</p>
                                <h2 className="mt-2 text-xl font-black text-slate-950">Refine by brand instantly</h2>
                            </div>

                            <div className="flex flex-wrap gap-2">
                                <button
                                    type="button"
                                    onClick={() => updateState({ selectedBrandSlug: 'all' })}
                                    className={cn(
                                        'rounded-full border px-4 py-2.5 text-xs font-black uppercase tracking-[0.18em] transition-all',
                                        state.selectedBrandSlug === 'all'
                                            ? 'border-slate-950 bg-slate-950 text-white'
                                            : 'border-slate-200 bg-slate-50 text-slate-600 hover:border-blue-300 hover:bg-blue-50 hover:text-(--colour-fsP2)'
                                    )}
                                >
                                    All Brands
                                </button>
                                {availableBrands.map((brand) => {
                                    const active = brand.slug === state.selectedBrandSlug

                                    return (
                                        <button
                                            key={brand.slug}
                                            type="button"
                                            onClick={() => updateState({ selectedBrandSlug: brand.slug })}
                                            className={cn(
                                                'rounded-full border px-4 py-2.5 text-xs font-black uppercase tracking-[0.18em] transition-all',
                                                active
                                                    ? 'border-(--colour-fsP2) bg-[#e8f0fb] text-(--colour-fsP2)'
                                                    : 'border-slate-200 bg-slate-50 text-slate-600 hover:border-blue-300 hover:bg-blue-50 hover:text-(--colour-fsP2)'
                                            )}
                                        >
                                            {brand.name}
                                        </button>
                                    )
                                })}
                            </div>

                            <div className="grid gap-3 sm:grid-cols-2">
                                <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-4">
                                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Selected Category</p>
                                    <p className="mt-2 text-sm font-black text-slate-950">{selectedCategory?.title ?? 'No category selected'}</p>
                                </div>
                                <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-4">
                                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Selected Brand</p>
                                    <p className="mt-2 text-sm font-black text-slate-950">{selectedBrand?.name ?? 'All brands'}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="rounded-[30px] border border-slate-200 bg-white p-5 shadow-[0_20px_60px_-45px_rgba(15,23,42,0.6)] md:p-6">
                    <div className="grid gap-5 xl:grid-cols-[1.15fr_0.85fr]">
                        <div className="space-y-5">
                            <div>
                                <p className="text-[10px] font-black uppercase tracking-[0.22em] text-slate-500">EMI Controls</p>
                                <h2 className="mt-2 text-xl font-black text-slate-950">Shape the monthly plan before browsing</h2>
                            </div>

                            <div className="rounded-[26px] border border-slate-200 bg-[linear-gradient(135deg,#f8fafc_0%,#ffffff_100%)] p-5">
                                <div className="mb-4 flex items-end justify-between gap-3">
                                    <div>
                                        <p className="text-[10px] font-black uppercase tracking-[0.22em] text-slate-500">Monthly Budget</p>
                                        <p className="mt-2 text-2xl font-black text-slate-950">
                                            NPR {state.budget.toLocaleString()}
                                            <span className="ml-1 text-sm font-semibold text-slate-400">/ month</span>
                                        </p>
                                    </div>
                                    <span className="rounded-full border border-orange-200 bg-orange-50 px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-orange-600">
                                        {state.budget > 15000 ? 'Premium Range' : 'Smart Range'}
                                    </span>
                                </div>

                                <input
                                    type="range"
                                    min={2000}
                                    max={25000}
                                    step={500}
                                    value={state.budget}
                                    onChange={(event) => updateState({ budget: Number(event.target.value) })}
                                    className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-slate-200 accent-[var(--colour-fsP2)]"
                                />
                                <div className="mt-2 flex justify-between text-[10px] font-black uppercase tracking-[0.14em] text-slate-400">
                                    <span>NPR 2K</span>
                                    <span>NPR 12K</span>
                                    <span>NPR 25K</span>
                                </div>
                            </div>
                        </div>

                        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-1">
                            <div className="rounded-[26px] border border-slate-200 bg-slate-50 p-4">
                                <p className="text-[10px] font-black uppercase tracking-[0.22em] text-slate-500">Tenure</p>
                                <div className="mt-3 flex flex-wrap gap-2">
                                    {TENURE_OPTIONS.map((months) => (
                                        <button
                                            key={months}
                                            type="button"
                                            onClick={() => updateState({ tenure: months })}
                                            className={cn(
                                                'rounded-2xl border px-3 py-2 text-sm font-black transition-all',
                                                state.tenure === months
                                                    ? 'border-(--colour-fsP2) bg-[#e8f0fb] text-(--colour-fsP2)'
                                                    : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                                            )}
                                        >
                                            {months}M
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="rounded-[26px] border border-slate-200 bg-slate-50 p-4">
                                <p className="text-[10px] font-black uppercase tracking-[0.22em] text-slate-500">Down Payment</p>
                                <div className="relative mt-3">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[11px] font-black text-(--colour-fsP2)">NPR</span>
                                    <input
                                        type="text"
                                        value={state.downPaymentStr}
                                        onChange={(event) => /^\d*$/.test(event.target.value) && updateState({ downPaymentStr: event.target.value })}
                                        className="h-11 w-full rounded-2xl border border-slate-200 bg-white pl-12 pr-3 text-sm font-black text-slate-900 outline-none transition focus:border-slate-300"
                                    />
                                </div>
                            </div>

                            <div className="rounded-[26px] border border-slate-200 bg-slate-50 p-4">
                                <p className="text-[10px] font-black uppercase tracking-[0.22em] text-slate-500">Interest View</p>
                                <div className="mt-3 inline-flex rounded-2xl bg-white p-1">
                                    <button
                                        type="button"
                                        onClick={() => updateState({ zeroEmi: true })}
                                        className={cn(
                                            'rounded-2xl px-3 py-2 text-xs font-black uppercase tracking-[0.14em] transition-all',
                                            state.zeroEmi ? 'bg-slate-950 text-white' : 'text-slate-500'
                                        )}
                                    >
                                        0% EMI
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => updateState({ zeroEmi: false })}
                                        className={cn(
                                            'rounded-2xl px-3 py-2 text-xs font-black uppercase tracking-[0.14em] transition-all',
                                            !state.zeroEmi ? 'bg-slate-950 text-white' : 'text-slate-500'
                                        )}
                                    >
                                        Standard
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="mt-5 rounded-[26px] border border-slate-200 bg-slate-50 p-4">
                        <div className="flex flex-wrap items-center justify-between gap-3">
                            <div>
                                <p className="text-[10px] font-black uppercase tracking-[0.22em] text-slate-500">Special EMI Plan</p>
                                <p className="mt-2 text-sm font-semibold text-slate-600">Choose the financing mode before reviewing the product rails below.</p>
                            </div>
                            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-emerald-600">
                                <CheckCircle2 className="h-3.5 w-3.5" />
                                Filter Ready
                            </div>
                        </div>
                        <div className="mt-4 grid gap-3 lg:grid-cols-3">
                            {EMI_PLANS.map((plan) => (
                                <button
                                    key={plan.id}
                                    type="button"
                                    onClick={() => updateState({ emiPlan: plan.id })}
                                    className={cn(
                                        'flex items-start gap-3 rounded-[24px] border p-4 text-left transition-all',
                                        state.emiPlan === plan.id
                                            ? 'border-slate-950 bg-slate-950 text-white shadow-[0_24px_60px_-36px_rgba(15,23,42,0.75)]'
                                            : 'border-slate-200 bg-white text-slate-800 hover:border-slate-300'
                                    )}
                                >
                                    <div className={cn('mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl', state.emiPlan === plan.id ? 'bg-white/10 text-orange-200' : 'bg-slate-50 text-(--colour-fsP2)')}>
                                        {plan.icon}
                                    </div>
                                    <div>
                                        <p className="text-sm font-black">{plan.name}</p>
                                        <p className={cn('mt-1 text-xs font-semibold leading-6', state.emiPlan === plan.id ? 'text-slate-300' : 'text-slate-500')}>
                                            {plan.desc}
                                        </p>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="rounded-[28px] border border-slate-200 bg-slate-950 p-5 text-white md:p-6">
                    <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-[0.22em] text-orange-300">Current Shopping Lens</p>
                            <h2 className="mt-2 text-xl font-black">
                                {selectedCategory?.title ?? 'EMI catalog'}
                                {selectedBrand ? ` / ${selectedBrand.name}` : ''}
                            </h2>
                        </div>
                        <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-black uppercase tracking-[0.16em] text-orange-100">
                            <Sparkles className="h-4 w-4" />
                            Products below follow this filter
                        </div>
                    </div>
                </div>

                <EmiBasketSection
                    key={`${selectedCategory?.slug ?? 'selected'}-${selectedBrand?.slug ?? 'all'}`}
                    slug={selectedCategory?.slug ?? 'mobile-price-in-nepal'}
                    title={selectedBrand ? `${selectedCategory?.title ?? 'Selected Category'} / ${selectedBrand.name}` : selectedCategory?.title ?? 'Selected Category'}
                    brandSlug={selectedBrand?.slug}
                    budget={state.budget}
                    tenure={state.tenure}
                    downPayment={downPayment}
                    zeroEmi={state.zeroEmi}
                    emiPlan={state.emiPlan}
                />

                {validBanner0 && (
                    <div className="relative aspect-[1000/270] overflow-hidden rounded-[28px] border border-slate-200 shadow-[0_20px_60px_-45px_rgba(15,23,42,0.6)]">
                        <Image src={validBanner0} alt="EMI banner" fill className="object-cover" sizes="100vw" />
                    </div>
                )}

                {visibleSections
                    .filter((section) => section.slug !== selectedCategory?.slug)
                    .map((section) => (
                        <EmiBasketSection
                            key={section.id}
                            slug={section.slug}
                            title={section.title}
                            budget={state.budget}
                            tenure={state.tenure}
                            downPayment={downPayment}
                            zeroEmi={state.zeroEmi}
                            emiPlan={state.emiPlan}
                        />
                    ))}

                {validBanner1 && (
                    <div className="relative aspect-[1000/270] overflow-hidden rounded-[28px] border border-slate-200 shadow-[0_20px_60px_-45px_rgba(15,23,42,0.6)]">
                        <Image src={validBanner1} alt="EMI campaign banner" fill className="object-cover" sizes="100vw" />
                    </div>
                )}

                <div className="rounded-[30px] border border-slate-200 bg-white p-6 shadow-[0_20px_60px_-45px_rgba(15,23,42,0.6)] md:p-8">
                    <div className="mb-6 flex items-center gap-3">
                        <div className="h-7 w-1 rounded-full bg-(--colour-fsP1)" />
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-[0.22em] text-slate-500">Need Help</p>
                            <h2 className="mt-1 text-xl font-black text-slate-950">Frequently Asked About EMI</h2>
                        </div>
                    </div>
                    <EmiFaq params={faqParams} />
                </div>
            </div>
        </div>
    )
}
