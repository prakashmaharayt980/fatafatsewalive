'use client'

import { useMemo, useState } from 'react'
import Image from 'next/image'
import { CreditCard } from 'lucide-react'
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

const BRANDS = ['Apple', 'Samsung', 'Xiaomi', 'OnePlus', 'Realme', 'Vivo', 'Oppo', 'HP', 'Dell', 'Lenovo', 'Asus']

const STATS = [
    { value: '0%', label: 'Interest' },
    { value: '36mon', label: 'Tenure' },
    { value: '500+', label: 'Products' },
    { value: 'Free', label: 'Delivery' },
]

function Section({ children }: { children: React.ReactNode }) {
    return (
        <div className="bg-white border-none border-(--colour-border3) px-4 py-1 sm:px-6 md:px-8">
            {children}
        </div>
    )
}

export default function ShopByEmiClient({ footerBanners = [], initialProducts }: Props) {
    const [state] = useState({ budget: 500000, tenure: 12, downPaymentStr: '0', zeroEmi: true })
    const downPayment = Number(state.downPaymentStr) || 0
    const faqParams = useMemo(() => ({ type: 'brand', per_page: 10, page: 1 }), [])

    return (
        <div className="min-h-screen bg-(--colour-bg4) pb-8">

            {/* ═══ HERO ═══ */}
            <section className="bg-white border-b border-(--colour-border3) px-6 md:px-10 py-8 md:py-12">
                <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center gap-8 md:gap-14">

                    {/* Left */}
                    <div className="flex-1 space-y-5">
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-[11px] font-bold" style={{ color: 'var(--colour-fsP2)', borderColor: '#C7D9F5', background: '#EEF3FB' }}>
                            <CreditCard style={{ width: 11, height: 11 }} /> Shop by EMI
                        </div>

                        <div>
                            <h1 className="text-3xl sm:text-4xl font-extrabold text-(--colour-text2) leading-[1.15] tracking-tight">
                                Own it today.<br />
                                <span style={{ color: 'var(--colour-fsP2)' }}>Pay in easy EMIs.</span>
                            </h1>
                            <p className="text-(--colour-text3) text-sm mt-3 max-w-sm leading-relaxed">
                                Get your device on <strong className="text-(--colour-text2)">0% interest EMI</strong> from Rs.&nbsp;1,000/mo. Up to 36 months with major Nepali banks.
                            </p>
                        </div>

                        {/* Stats */}
                        <div className="grid grid-cols-4 gap-2 max-w-xs">
                            {STATS.map(s => (
                                <div key={s.label} className="bg-(--colour-bg4) rounded-xl p-2.5 text-center border border-(--colour-border3)">
                                    <p className="text-sm font-extrabold text-(--colour-text2)">{s.value}</p>
                                    <p className="text-[10px] text-(--colour-text3) font-medium mt-0.5">{s.label}</p>
                                </div>
                            ))}
                        </div>

                        {/* Brand chips */}
                        <div>
                            <p className="text-[10px] font-bold uppercase tracking-widest text-(--colour-text3) mb-2">EMI on top brands</p>
                            <div className="flex flex-wrap gap-1.5">
                                {BRANDS.map(b => (
                                    <span key={b} className="px-2.5 py-1 rounded-full text-[11px] font-semibold text-(--colour-text3) bg-(--colour-bg4) border border-(--colour-border3)">
                                        {b}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Right — logo */}
                    <div className="shrink-0">
                        <div className="relative w-44 h-44 md:w-56 md:h-56 rounded-full" style={{ background: '#EEF3FB' }}>
                            <Image src={logoImg} alt="Fatafat Sewa EMI" fill className="object-contain p-6" sizes="224px" priority />
                        </div>
                    </div>
                </div>
            </section>

            {/* ── BANNER ── */}


            {/* ── iPHONE 0% EMI ── */}
            <div className="mt-3">
                <Section>
                    <EmiBasketSection
                        slug="mobile-price-in-nepal"
                        title="With 0% EMI — Apple iPhones"
                        brandSlug="iphone-price-in-nepal"
                        budget={state.budget}
                        tenure={state.tenure}
                        downPayment={downPayment}
                        zeroEmi={state.zeroEmi}
                        initialData={initialProducts}
                        badge="0% Interest"
                    />
                </Section>
            </div>
            <TopBanner data={footerBanners?.[0]} />
            {/* ── LAPTOPS ── */}
            <div className="">
                <Section>
                    <EmiBasketSection
                        slug="laptop-price-in-nepal"
                        title="Laptops — Study & Work on Easy EMI"
                        budget={state.budget}
                        tenure={state.tenure}
                        downPayment={downPayment}
                        zeroEmi={false}
                        badge="Easy EMI"
                    />
                </Section>
            </div>

            {/* ── OFFER BANNER ── */}
            <div className="mt-3">
                <EmiOfferBanner slug="emi-offer-deals" />
            </div>

            {/* ── MID INCOME ── */}
            <div className="mt-3">
                <Section>
                    <EmiBasketSection
                        slug="mobile-price-in-nepal"
                        title="Mid Income Plan — Rs. 30K–80K"
                        brandSlug="samsung-price-in-nepal"
                        budget={80000}
                        tenure={12}
                        downPayment={downPayment}
                        zeroEmi={false}
                        badge="Popular"
                    />
                </Section>
            </div>
            {/* ── FOOTER ── */}
            <div className="">
                <TopBanner data={footerBanners?.[0]} />
            </div>
            {/* ── STUDENT PLAN ── */}
            <div className="mt-3">
                <Section>
                    <EmiBasketSection
                        slug="mobile-price-in-nepal"
                        title="Student Plan — Under Rs. 30K"
                        budget={30000}
                        tenure={6}
                        downPayment={downPayment}
                        zeroEmi={false}
                        badge="Budget"
                    />
                </Section>
            </div>



            <div className="mt-3 bg-white border-t border-(--colour-border3) px-4 sm:px-6">
                <EmiFaq params={faqParams} />
            </div>
        </div>
    )
}
