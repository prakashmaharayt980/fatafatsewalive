'use client'

import React, { useState, useMemo } from 'react'
import Image from 'next/image'
import { useSearchParams } from 'next/navigation'
import { cn } from '@/lib/utils'
import { RefreshCw, Apple, Building2, Percent } from 'lucide-react'

import EmiBasketSection from './EmiBasketSection'
import EmiFaq from '../apply/_components/EmiFaq'
import { logoImg } from '@/app/CommonVue/Image'

const TENURE_OPTIONS = [6, 9, 12, 18]
type EmiPlan = 'standard' | 'apple_zero' | 'citizens_0_40'

interface Props {
    initialCategories?: any[]
    footerBanners?: any[]
}

const SECTIONS = [
    { slug: 'mobile-price-in-nepal', title: 'Mobiles on EMI' },
    { slug: 'laptop-price-in-nepal', title: 'Laptops & MacBooks' },
]

const EMI_PLANS: { id: EmiPlan; name: string; desc: string; icon: React.ReactNode }[] = [
    { id: 'standard',      name: 'Standard EMI',    desc: 'All banks, regular rates', icon: <Building2 className="w-4 h-4" /> },
    { id: 'apple_zero',    name: 'Apple 0% EMI',    desc: '0% interest on Apple only', icon: <Apple className="w-4 h-4" /> },
    { id: 'citizens_0_40', name: 'Citizens Bank',   desc: '0% with 40% down payment', icon: <Percent className="w-4 h-4" /> },
]

const TRUST_STATS = [
    { value: '500+', label: 'EMI products' },
    { value: '0%',   label: 'Interest available' },
    { value: '4',    label: 'Tenure options' },
    { value: 'NPR 2K', label: 'Starting EMI' },
]

export default function ShopByEmiClient({ initialCategories = [], footerBanners = [] }: Props) {
    const searchParams = useSearchParams()

    const categoryList = useMemo(() => {
        if (Array.isArray(initialCategories)) return initialCategories
        if (typeof initialCategories === 'object' && initialCategories !== null) {
            return (initialCategories as any).data ?? (initialCategories as any).categories ?? []
        }
        return []
    }, [initialCategories])

    const [budget, setBudget] = useState(Number(searchParams.get('budget')) || 5000)
    const [tenure, setTenure] = useState(12)
    const [downPaymentStr, setDownPaymentStr] = useState('0')
    const downPayment = Number(downPaymentStr) || 0
    const [zeroEmi, setZeroEmi] = useState(true)
    const [emiPlan, setEmiPlan] = useState<EmiPlan>('standard')

    const validBanner0 = footerBanners[0]?.image?.full ?? footerBanners[0]?.thumbnail_image?.full ?? null
    const validBanner1 = footerBanners[1]?.image?.full ?? footerBanners[1]?.thumbnail_image?.full ?? null

    return (
        <div className="min-h-screen bg-[var(--colour-bg4)]">

            {/* ─── Hero — inspired by ExchangeHero ─── */}
            <section className="bg-white border-b border-gray-100">
                <div className="mx-auto px-4 lg:px-8 max-w-7xl py-10 md:py-14">
                    <div className="flex flex-col md:flex-row items-center gap-10 md:gap-14">

                        <div className="flex-1 space-y-5 text-center md:text-left">
                            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-widest border"
                                style={{ color: 'var(--colour-fsP2)', borderColor: '#C7D9F5', background: '#EEF3FB' }}>
                                <RefreshCw className="w-2.5 h-2.5" /> EMI Marketplace
                            </div>

                            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-gray-900 leading-[1.15] tracking-tight">
                                Find your next gadget<br />
                                <span style={{ color: 'var(--colour-fsP2)' }}>on easy EMI.</span>
                            </h1>

                            <p className="text-gray-500 text-base max-w-lg mx-auto md:mx-0 leading-relaxed font-medium">
                                Set your monthly budget and discover products that fit. Choose tenure, down payment, and bank plan — all in one place.
                            </p>

                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-lg mx-auto md:mx-0">
                                {TRUST_STATS.map((s) => (
                                    <div key={s.label} className="bg-[#F5F7FA] rounded-xl p-3 text-center border border-gray-100">
                                        <p className="text-lg font-extrabold text-gray-900">{s.value}</p>
                                        <p className="text-[11px] text-gray-400 font-bold mt-0.5 leading-tight">{s.label}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="shrink-0">
                            <div className="relative w-[180px] h-[180px] md:w-[220px] md:h-[220px]">
                                <div className="absolute inset-0 rounded-full" style={{ background: '#EEF3FB' }} />
                                <Image
                                    src={logoImg}
                                    alt="Shop by EMI — Fatafat Sewa"
                                    fill
                                    className="object-contain relative z-10 p-6"
                                    sizes="220px"
                                    priority
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <div className="mx-auto px-4 lg:px-8 max-w-7xl py-8 space-y-6">

                {/* ─── Filter Card ─── */}
                <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">

                    {/* Budget */}
                    <div className="px-5 py-5 border-b border-gray-100">
                        <div className="flex items-end justify-between mb-4">
                            <div>
                                <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-1">Monthly Budget</p>
                                <p className="text-2xl font-extrabold text-gray-900">
                                    NPR {budget.toLocaleString()}
                                    <span className="text-sm font-semibold text-gray-400 ml-1">/ month</span>
                                </p>
                            </div>
                            <span className="text-[11px] font-bold px-3 py-1 rounded-full border"
                                style={{ color: 'var(--colour-fsP2)', borderColor: '#C7D9F5', background: '#EEF3FB' }}>
                                {budget > 15000 ? 'Premium' : 'Smart Value'}
                            </span>
                        </div>
                        <input
                            type="range" min={2000} max={25000} step={500} value={budget}
                            onChange={(e) => setBudget(Number(e.target.value))}
                            className="w-full h-1.5 rounded-full appearance-none cursor-pointer accent-[var(--colour-fsP2)] bg-gray-200"
                        />
                        <div className="flex justify-between text-[10px] text-gray-400 font-bold uppercase mt-1.5">
                            <span>NPR 2K</span><span>NPR 12K</span><span>NPR 25K</span>
                        </div>
                    </div>

                    {/* Tenure + Down Payment + Interest */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-gray-100">
                        <div className="px-5 py-4">
                            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-3">Tenure</p>
                            <div className="flex flex-wrap gap-2">
                                {TENURE_OPTIONS.map((m) => (
                                    <button
                                        key={m}
                                        onClick={() => setTenure(m)}
                                        className={cn(
                                            "px-3 py-1.5 rounded-lg text-sm font-bold border transition-colors",
                                            tenure === m
                                                ? "text-white border-[var(--colour-fsP2)]"
                                                : "bg-white text-gray-600 border-gray-200 hover:border-gray-300"
                                        )}
                                        style={tenure === m ? { background: 'var(--colour-fsP2)' } : undefined}
                                    >
                                        {m}M
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="px-5 py-4">
                            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-3">Down Payment</p>
                            <div className="relative max-w-[160px]">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[11px] font-bold"
                                    style={{ color: 'var(--colour-fsP2)' }}>NPR</span>
                                <input
                                    type="text" value={downPaymentStr}
                                    onChange={(e) => /^\d*$/.test(e.target.value) && setDownPaymentStr(e.target.value)}
                                    className="w-full pl-11 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-lg outline-none font-bold text-sm focus:border-gray-300 transition-colors"
                                />
                            </div>
                        </div>

                        <div className="px-5 py-4">
                            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-3">Interest</p>
                            <div className="inline-flex bg-gray-100 rounded-lg p-0.5 gap-0.5">
                                <button
                                    onClick={() => setZeroEmi(true)}
                                    className={cn("px-3 py-1.5 rounded-md text-xs font-bold transition-colors",
                                        zeroEmi ? "bg-white shadow-sm" : "text-gray-400")}
                                    style={zeroEmi ? { color: 'var(--colour-fsP2)' } : undefined}
                                >
                                    0% EMI
                                </button>
                                <button
                                    onClick={() => setZeroEmi(false)}
                                    className={cn("px-3 py-1.5 rounded-md text-xs font-bold transition-colors",
                                        !zeroEmi ? "bg-white shadow-sm" : "text-gray-400")}
                                    style={!zeroEmi ? { color: 'var(--colour-fsP2)' } : undefined}
                                >
                                    Standard
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Bank Plan */}
                    <div className="px-5 py-4 bg-gray-50 border-t border-gray-100">
                        <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-3">Special EMI Plan</p>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                            {EMI_PLANS.map((plan) => (
                                <button
                                    key={plan.id}
                                    onClick={() => setEmiPlan(plan.id)}
                                    className={cn(
                                        "flex items-center gap-3 px-4 py-3 rounded-xl border text-left transition-colors",
                                        emiPlan === plan.id
                                            ? "bg-white border-[var(--colour-fsP2)]"
                                            : "bg-white border-gray-200 hover:border-gray-300"
                                    )}
                                >
                                    <div className={cn("w-8 h-8 rounded-lg border flex items-center justify-center shrink-0",
                                        emiPlan === plan.id ? "border-[var(--colour-fsP2)]" : "border-gray-200")}
                                        style={emiPlan === plan.id ? { color: 'var(--colour-fsP2)' } : { color: '#9ca3af' }}>
                                        {plan.icon}
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-gray-800">{plan.name}</p>
                                        <p className="text-[10px] text-gray-400 mt-0.5">{plan.desc}</p>
                                    </div>
                                    {emiPlan === plan.id && (
                                        <div className="ml-auto w-4 h-4 rounded-full flex items-center justify-center shrink-0"
                                            style={{ background: 'var(--colour-fsP2)' }}>
                                            <svg className="w-2.5 h-2.5 text-white" viewBox="0 0 10 10" fill="none">
                                                <path d="M2 5l2 2 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                            </svg>
                                        </div>
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* ─── Product Sections — inspired by BasketCard ─── */}
                <EmiBasketSection
                    slug="trending-picks"
                    title="Trending EMI Picks"
                    category={{
                        name: 'Trending Picks',
                        slug: 'trending-picks',
                        image: { full: 'https://images.unsplash.com/photo-1550009158-9ebf69173e03?q=80&w=800&auto=format&fit=crop' },
                    }}
                    budget={budget} tenure={tenure} downPayment={downPayment} zeroEmi={zeroEmi} emiPlan={emiPlan}
                />

                {/* ─── Mid Banner — inspired by TwoImageBanner ─── */}
                {validBanner0 && (
                    <div className="w-full overflow-hidden rounded-xl border border-gray-100 shadow-sm aspect-[1000/300] sm:aspect-[1000/250] relative">
                        <Image src={validBanner0} alt="EMI Deals" fill className="object-cover" sizes="100vw" />
                    </div>
                )}

                {SECTIONS.map((sec) => {
                    const categoryInfo = categoryList.find((c: any) => c.slug === sec.slug)
                    return (
                        <EmiBasketSection
                            key={sec.slug}
                            slug={sec.slug}
                            title={categoryInfo?.name ?? sec.title}
                            category={categoryInfo}
                            budget={budget} tenure={tenure} downPayment={downPayment} zeroEmi={zeroEmi} emiPlan={emiPlan}
                        />
                    )
                })}

                {validBanner1 && (
                    <div className="w-full overflow-hidden rounded-xl border border-gray-100 shadow-sm aspect-[1000/300] sm:aspect-[1000/250] relative">
                        <Image src={validBanner1} alt="Verified Seller" fill className="object-cover" sizes="100vw" />
                    </div>
                )}

                {/* ─── FAQ ─── */}
                <div className="bg-white border border-gray-200 rounded-2xl p-6 md:p-8">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-1 h-6 rounded-full" style={{ background: 'var(--colour-fsP1)' }} />
                        <h2 className="text-xl font-bold text-gray-900">Frequently Asked — EMI</h2>
                    </div>
                    <EmiFaq params={useMemo(() => ({ type: 'brand', per_page: 10, page: 1 }), [])} />
                </div>
            </div>
        </div>
    )
}
