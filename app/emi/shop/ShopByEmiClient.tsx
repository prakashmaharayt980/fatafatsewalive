'use client'

import React, { useState, useMemo, useEffect, useCallback } from 'react'
import Image from 'next/image'
import { useSearchParams } from 'next/navigation'
import { cn } from '@/lib/utils'
import { ChevronDown, ShoppingBag, Loader2, Search, X, Check, Apple, Building2 } from 'lucide-react'

import type { ProductSummary } from '@/app/types/ProductDetailsTypes'
import EmiProductCard, { EmiProductCardSkeleton } from '@/app/product-details/ProductCards/EmiProductCard'
import { logoImg } from '@/app/CommonVue/Image'
import EmiBasketSection from './EmiBasketSection'

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

type EmiPlan = 'standard' | 'apple_zero' | 'citizens_0_40'

interface ShopByEmiClientProps {
    initialCategories?: any[]
    footerBanners?: any[]
}

const SECTIONS = [
    { slug: 'mobile-price-in-nepal', title: 'Mobiles on your EMI' },
    { slug: 'laptop-price-in-nepal', title: 'Laptops and MacBooks' },
]

export default function ShopByEmiClient({ initialCategories = [], footerBanners = [] }: ShopByEmiClientProps) {
    const searchParams = useSearchParams()
    
    // Normalize categories to an array (handles API wrapper objects)
    const categoryList = useMemo(() => {
        if (Array.isArray(initialCategories)) return initialCategories;
        if (typeof initialCategories === 'object' && initialCategories !== null) {
            return (initialCategories as any).data || (initialCategories as any).categories || [];
        }
        return [];
    }, [initialCategories]);

    const initialBudget = Number(searchParams.get('budget')) || 5000

    // ─── State ───
    const [budget, setBudget] = useState(initialBudget)
    const [tenure, setTenure] = useState(12)
    const [downPaymentStr, setDownPaymentStr] = useState('0')
    const downPayment = Number(downPaymentStr) || 0
    const [zeroEmi, setZeroEmi] = useState(true)
    const [sortBy, setSortBy] = useState('Popularity')
    const [emiPlan, setEmiPlan] = useState<EmiPlan>('standard')
    const [selectedBrands, setSelectedBrands] = useState<number[]>([])

    const toggleBrand = (id: number) => {
        setSelectedBrands(prev => prev.includes(id) ? prev.filter(b => b !== id) : [...prev, id])
    }

    return (
        <div className="min-h-screen bg-[var(--colour-bg4)]">
            <section className="relative bg-gradient-to-br from-[#E8F0FE] via-[#F0F6FF] to-[#E0ECFA] pt-8 pb-16 md:pt-10 md:pb-20 overflow-hidden">
                <div className="absolute top-0 right-0 w-72 h-72 bg-[var(--colour-fsP2)]/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4" />
                <div className="absolute bottom-0 left-0 w-52 h-52 bg-[var(--colour-fsP1)]/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/4" />
                <div className="container mx-auto px-4 lg:px-8 relative z-10 flex flex-col md:flex-row items-center gap-8 md:gap-12">
                    <div className="flex-1 text-center md:text-left">
                        <div className="inline-flex items-center gap-2 bg-white/70 backdrop-blur-sm border border-[var(--colour-fsP2)]/20 rounded-full px-4 py-1.5 mb-4 shadow-sm">
                            <ShoppingBag className="w-4 h-4 text-[var(--colour-fsP2)]" />
                            <span className="text-xs font-bold text-[var(--colour-fsP2)] uppercase tracking-wider">EMI Marketplace</span>
                        </div>
                        <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-[var(--colour-fsP2)] mb-3 tracking-tight">
                            Find your next gadget on <span className="text-[var(--colour-fsP1)]">EMI</span>
                        </h1>
                        <p className="text-[var(--colour-text3)] text-base md:text-lg max-w-xl leading-relaxed">
                            Discover original products within your monthly budget. Choose a bank plan, set your tenure, and shop with confidence.
                        </p>
                    </div>
                    <div className="w-48 h-48 md:w-64 md:h-64 lg:w-72 lg:h-72 relative shrink-0">
                        <div className="absolute inset-0 bg-[var(--colour-fsP2)]/8 rounded-full blur-2xl scale-110" />
                        <Image src={logoImg} alt="Shop by EMI" fill className="object-contain drop-shadow-2xl relative z-10" sizes="(max-width: 768px) 192px, 288px" priority />
                    </div>
                </div>
            </section>

            <div className="container mx-auto px-4 lg:px-8 -mt-8 md:-mt-12 relative z-20 pb-12">
                
                {/* ═══ GLOBAL FILTERS ═══ */}
                <div className="bg-white rounded-2xl shadow-xl border border-[var(--colour-border3)] p-5 sm:p-7 mb-8 space-y-6">
                    <div className="space-y-3">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                            <label className="text-sm font-bold text-[var(--colour-text2)]" htmlFor="budget-slider">
                                My Monthly Budget:
                                <span className="text-xl md:text-2xl font-extrabold text-[var(--colour-fsP2)] ml-2">NPR {budget.toLocaleString()}</span>
                                <span className="text-[var(--colour-text3)] font-normal text-sm"> / month</span>
                            </label>
                            <div className="flex items-center gap-2">
                                <div className="text-[10px] font-black text-emerald-600 bg-emerald-50 border border-emerald-100 rounded-full px-3 py-1 animate-pulse">
                                    {budget > 15000 ? "PREMIUM ACCESS" : "BUDGET MATCHED"}
                                </div>
                                <div className="text-xs font-semibold text-[var(--colour-text2)] bg-[var(--colour-bg4)] border border-[var(--colour-border3)] rounded-lg px-3 py-2">
                                    Sorting by popularity
                                </div>
                            </div>
                        </div>
                        <input id="budget-slider" type="range" min={2000} max={25000} step={500} value={budget} onChange={(e) => setBudget(Number(e.target.value))} className="w-full h-2 bg-gray-200 rounded-full appearance-none cursor-pointer accent-[var(--colour-fsP2)]" />
                        <div className="flex justify-between text-[10px] text-[var(--colour-text3)] font-black uppercase"><span>NPR 2K</span><span>NPR 12K</span><span>NPR 25K</span></div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-[1fr_auto_auto] gap-x-6 gap-y-4 items-end">
                        <div className="space-y-3 col-span-2 md:col-span-1">
                            <label className="text-[10px] font-black text-[var(--colour-text3)] uppercase tracking-[0.1em]">Tenure (Months)</label>
                            <div className="flex flex-wrap gap-2">
                                {TENURE_OPTIONS.map((m) => (
                                    <button key={m} onClick={() => setTenure(m)} className={cn("px-5 py-2.5 rounded-xl text-sm font-bold border-2 transition-all", tenure === m ? "bg-[var(--colour-fsP2)] text-white border-[var(--colour-fsP2)]" : "bg-white text-slate-800 border-gray-100 hover:border-[var(--colour-fsP2)]/20")}>
                                        {m} Months
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-[var(--colour-text3)] uppercase tracking-[0.1em]">Down Payment</label>
                            <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[10px] font-black text-[var(--colour-fsP2)]">NPR</span>
                                <input type="text" value={downPaymentStr} onChange={(e) => /^\d*$/.test(e.target.value) && setDownPaymentStr(e.target.value)} className="w-36 pl-12 pr-4 py-2.5 bg-gray-50 border-none rounded-xl focus:ring-2 ring-[var(--colour-fsP2)]/20 outline-none font-bold text-sm" />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-[var(--colour-text3)] uppercase tracking-[0.1em]">Interest Type</label>
                            <div className="inline-flex bg-gray-100 rounded-xl p-1 gap-1">
                                <button onClick={() => setZeroEmi(true)} className={cn("px-4 py-2 rounded-lg text-xs font-bold transition-all", zeroEmi ? "bg-white text-[var(--colour-fsP2)] shadow-sm" : "text-gray-400 font-medium")}>0% Interest</button>
                                <button onClick={() => setZeroEmi(false)} className={cn("px-4 py-2 rounded-lg text-xs font-bold transition-all", !zeroEmi ? "bg-white text-[var(--colour-fsP2)] shadow-sm" : "text-gray-400 font-medium")}>Standard</button>
                            </div>
                        </div>
                    </div>
                    
                    {/* Bank Offer Selector */}
                    <div className="pt-2">
                        <div className="flex items-center justify-between mb-3">
                            <label className="text-[10px] font-black text-[var(--colour-text3)] uppercase tracking-[0.1em]">Choose Special EMI Plan</label>
                            <span className="text-[9px] font-black text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full ring-1 ring-blue-100">EXCLUSIVE OFFER</span>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            {[
                                { id: 'standard', name: 'Standard EMI', icon: <Building2 className="w-4 h-4 text-orange-600" />, desc: 'Regular bank rates' },
                                { id: 'apple_zero', name: 'Apple 0% Special', icon: <Apple className="w-4 h-4 text-black" />, desc: '0% on Apple devices' },
                                { id: 'citizens_0_40', name: 'Citizens Offer', icon: <Building2 className="w-4 h-4 text-blue-700" />, desc: '0% with 40% Down' },
                            ].map((plan) => (
                                <button key={plan.id} onClick={() => setEmiPlan(plan.id as EmiPlan)} className={cn("px-4 py-3 rounded-xl border-2 transition-all flex items-center gap-3 text-left", emiPlan === plan.id ? "bg-blue-50/50 border-[var(--colour-fsP2)]" : "bg-white border-gray-100 hover:border-gray-200")}>
                                    <div className="w-8 h-8 rounded-lg bg-white shadow-sm flex items-center justify-center shrink-0">{plan.icon}</div>
                                    <div><p className="text-xs font-extrabold text-slate-800">{plan.name}</p><p className="text-[9px] text-gray-500 font-medium">{plan.desc}</p></div>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* ═══ SECTIONS View (Home BasketCard style) ═══ */}
                <div className="space-y-4">
                    
                    {/* Featured / Trending Section (Different Idea) */}
                    <EmiBasketSection 
                        slug="trending-picks" 
                        title="🔥 Trending EMI Picks" 
                        category={{ 
                            name: "Trending Picks", 
                            slug: "trending-picks", 
                            image: { full: 'https://images.unsplash.com/photo-1550009158-9ebf69173e03?q=80&w=800&auto=format&fit=crop' } 
                        }}
                        budget={budget} 
                        tenure={tenure} 
                        downPayment={downPayment} 
                        zeroEmi={zeroEmi} 
                        emiPlan={emiPlan} 
                    />
                        

                        {/* Middle Banner */}
                        {footerBanners[0] && (
                            <div className="my-8 rounded-3xl overflow-hidden border border-white shadow-xl bg-white p-2">
                                <Image src={footerBanners[0].image?.full || footerBanners[0].thumbnail_image?.full} alt="EMI Deals" width={1600} height={350} className="w-full object-cover rounded-2xl aspect-[16/4] sm:aspect-[16/3]" />
                            </div>
                        )}

                        {/* 2. Categorized Sections */}
                        {SECTIONS.map((sec) => {
                            const categoryInfo = categoryList.find((c: any) => c.slug === sec.slug);
                            return (
                                <EmiBasketSection 
                                    key={sec.slug} 
                                    slug={sec.slug} 
                                    title={categoryInfo?.name || sec.title} 
                                    category={categoryInfo}
                                    budget={budget} 
                                    tenure={tenure} 
                                    downPayment={downPayment} 
                                    zeroEmi={zeroEmi} 
                                    emiPlan={emiPlan} 
                                />
                            );
                        })}

                        {/* Final Banner */}
                        {footerBanners[1] && (
                            <div className="mt-12 rounded-3xl overflow-hidden border border-white shadow-xl bg-white p-2">
                                <Image src={footerBanners[1].image?.full || footerBanners[1].thumbnail_image?.full} alt="Verified Seller" width={1600} height={350} className="w-full object-cover rounded-2xl aspect-[16/4] sm:aspect-[16/3]" />
                            </div>
                        )}
                    </div>
                </div>
        </div>
    )
}
