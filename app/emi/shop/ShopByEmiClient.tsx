'use client'

import React, { useMemo, useState } from 'react'
import Image from 'next/image'
import { ShoppingBag } from 'lucide-react'
import logoImg from '@/public/imgfile/logoimg.png'
import type { NavbarItem } from '@/app/context/navbar.interface'
import type { BannerItem } from '@/app/types/BannerTypes'
import EmiBasketSection from './EmiBasketSection'
import EmiOfferBanner from './EmiOfferBanner'
import EmiFaq from '../apply/_components/EmiFaq'
import TopBanner from '@/app/homepage/Bannerfooter'

interface Props {
    initialCategories?: NavbarItem[]
    footerBanners?: BannerItem[]
    heroBanners?: BannerItem[]
    initialProducts?: any
}

interface State {
    budget: number
    tenure: number
    downPaymentStr: string
    zeroEmi: boolean
}

export default function ShopByEmiClient({
    footerBanners = [],
    initialProducts,
}: Props) {
    const [state] = useState<State>({
        budget: 500000,
        tenure: 12,
        downPaymentStr: '0',
        zeroEmi: true,
    })

    const downPayment = Number(state.downPaymentStr) || 0
    const faqParams = useMemo(() => ({ type: 'brand', per_page: 10, page: 1 }), [])

    return (
        <div className="min-h-screen bg-[#f8f9fa] pb-10">
            {/* ═══ HERO ═══ */}
            <section className="bg-white border-b border-gray-100">
                <div className="mx-auto px-4 lg:px-8 max-w-6xl py-8 md:py-12">

                    {/* Top row */}
                    <div className="flex flex-col md:flex-row items-center gap-8 md:gap-12">

                        {/* Left */}
                        <div className="flex-1 space-y-4 text-center md:text-left">

                            {/* Social proof badge */}
                            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold border" style={{ color: 'var(--colour-fsP2)', borderColor: '#C7D9F5', background: '#EEF3FB' }}>
                                <ShoppingBag style={{ width: 10, height: 10 }} />
                                <span>50,000+ buyers in Nepal trust Fatafat EMI</span>
                            </div>

                            <h1 className="text-3xl sm:text-4xl lg:text-[2.6rem] font-extrabold text-gray-900 leading-[1.15] tracking-tight">
                                Own it today.<br />
                                <span style={{ color: 'var(--colour-fsP2)' }}>Pay in easy EMIs.</span>
                            </h1>

                            <p className="text-gray-500 text-sm max-w-md mx-auto md:mx-0 leading-relaxed">
                                Don't wait to save up — get your device now on <strong className="text-gray-700">0% interest EMI</strong> from Rs.&nbsp;1,000/month. Flexible tenures up to 24 months with major Nepali banks.
                            </p>

                            {/* Stats */}
                            <div className="grid grid-cols-4 gap-2 max-w-sm mx-auto md:mx-0">
                                {[
                                    { value: '0%', label: 'Interest' },
                                    { value: '24mo', label: 'Max tenure' },
                                    { value: '500+', label: 'Products' },
                                    { value: 'Free', label: 'Delivery' },
                                ].map((s, i) => (
                                    <div key={i} className="bg-[#F5F7FA] rounded-xl p-2.5 text-center border border-gray-100">
                                        <p className="text-base font-extrabold text-gray-900">{s.value}</p>
                                        <p className="text-[10px] text-gray-400 font-bold mt-0.5">{s.label}</p>
                                    </div>
                                ))}
                            </div>

                            {/* How it works — 3 steps */}
                            <div className="flex flex-col sm:flex-row gap-2 max-w-md mx-auto md:mx-0">
                                {[
                                    { step: '1', text: 'Pick your device' },
                                    { step: '2', text: 'Choose EMI plan' },
                                    { step: '3', text: 'Get it delivered' },
                                ].map((s, i) => (
                                    <div key={i} className="flex items-center gap-2 flex-1 bg-[#F5F7FA] rounded-xl px-3 py-2 border border-gray-100">
                                        <span className="w-5 h-5 rounded-full text-white text-[10px] font-black flex items-center justify-center shrink-0" style={{ background: 'var(--colour-fsP2)' }}>
                                            {s.step}
                                        </span>
                                        <span className="text-[11px] font-semibold text-gray-700">{s.text}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Right — image only */}
                        <div className="shrink-0 flex items-center justify-center">
                            <div className="relative w-50 h-50 md:w-60 md:h-60">
                                <div className="absolute inset-0 rounded-full" style={{ background: '#EEF3FB' }} />
                                <Image
                                    src={logoImg}
                                    alt="Shop by EMI — Fatafat Sewa"
                                    fill
                                    className="object-contain relative z-10 p-6"
                                    sizes="240px"
                                    priority
                                />
                            </div>
                        </div>
                    </div>

                    {/* Popular brands — full width below */}
                    <div className="mt-7 pt-5 border-t border-gray-100">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-3">EMI available on top brands</p>
                        <div className="flex flex-wrap gap-2">
                            {['Apple', 'Samsung', 'Xiaomi', 'OnePlus', 'Realme', 'Vivo', 'Oppo', 'HP', 'Dell', 'Lenovo', 'Asus'].map(b => (
                                <span key={b} className="px-3 py-1 rounded-full bg-[#F5F7FA] border border-gray-100 text-[11px] font-bold text-gray-600">
                                    {b}
                                </span>
                            ))}
                        </div>
                    </div>

                </div>
            </section>

            {/* ── HERO BANNER ───────────────────────────────────── */}
            <div>
                <TopBanner data={footerBanners?.[0]} />
            </div>

            {/* ── iPHONE — 0% INTEREST EMI (SSR hydrated) ────────── */}
            <div className="w-full mt-6">
                <div className="bg-white w-full border-y border-gray-100 px-4 py-4 md:px-8">
                    <EmiBasketSection
                        slug="mobile-price-in-nepal"
                        title="iPhone Series — 0% Interest EMI"
                        brandSlug="iphone-price-in-nepal"
                        budget={state.budget}
                        tenure={state.tenure}
                        downPayment={downPayment}
                        zeroEmi={state.zeroEmi}
                        initialData={initialProducts}
                        badge="0% Interest"
                    />
                </div>
            </div>

            {/* ── LAPTOPS ON EMI (on-demand) ───────────────────────── */}
            <div className="w-full mt-6">
                <div className="bg-white w-full border-y border-gray-100 px-4 py-4 md:px-8">
                    <EmiBasketSection
                        slug="laptop-price-in-nepal"
                        title="Laptops — Study & Work on Easy EMI"
                        budget={state.budget}
                        tenure={state.tenure}
                        downPayment={downPayment}
                        zeroEmi={false}
                        badge="Easy EMI"
                    />
                </div>
            </div>

            {/* ── EMI OFFER BANNER (on-demand) ─────────────────────── */}
            {/* offer */}
            <EmiOfferBanner slug="emi-offer-deals" />

            {/* ── MID INCOME PLAN (on-demand) ──────────────────────── */}
            <div className="w-full mt-6">
                <div className="bg-white w-full border-y border-gray-100 px-4 py-4 md:px-8">
                    <EmiBasketSection
                        slug="mobile-price-in-nepal"
                        title="Mid Income Plan — Smartphones Rs. 30K–80K"
                        brandSlug="samsung-price-in-nepal"
                        budget={80000}
                        tenure={12}
                        downPayment={downPayment}
                        zeroEmi={false}
                        badge="Popular"
                    />
                </div>
            </div>

            {/* ── STUDENT PLAN (on-demand) ─────────────────────────── */}
            <div className="w-full mt-6">
                <div className="bg-white w-full border-y border-gray-100 px-4 py-4 md:px-8">
                    <EmiBasketSection
                        slug="mobile-price-in-nepal"
                        title="Student Plan — Budget Phones Under Rs. 30K"
                        budget={30000}
                        tenure={6}
                        downPayment={downPayment}
                        zeroEmi={false}
                        badge="Budget"
                    />
                </div>
            </div>

            {/* ── FOOTER BANNER ────────────────────────────────────── */}
            <div className="mt-10">
                <TopBanner data={footerBanners?.[0]} />
            </div>

            <div className="mx-2 sm:mx-4 rounded-t-xl border border-gray-200 bg-white px-2">
                <EmiFaq params={faqParams} />
            </div>
        </div>
    )
}
