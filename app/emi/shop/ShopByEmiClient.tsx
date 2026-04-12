'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { CheckCircle, Search, ShieldCheck, FileText, Zap, ArrowRight } from 'lucide-react'
import logoImg from '@/public/imgfile/logoimg.png'
import { bankingEmiPartners } from '@/app/CommonVue/Partners'
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

// ─── Static data ────────────────────────────────────────────────────────────

const STEPS = [
    { Icon: Search,      label: 'Choose',            color: 'var(--colour-fsP1)', desc: 'Select any product worth above NPR 15,000 from our store.' },
    { Icon: ShieldCheck, label: 'Check Eligibility', color: 'var(--colour-fsP2)', desc: 'Quick online verification with your information and credit history.' },
    { Icon: FileText,    label: 'Submit',             color: '#6366f1',            desc: 'Upload basic documents and choose your bank partner.' },
    { Icon: Zap,         label: 'Approval',           color: '#10b981',            desc: 'Get instant approval and pick up your device or get it delivered.' },
]

const ELIGIBILITY = [
    { label: 'Age Requirement',   desc: 'Must be between 21 and 60 years of age.' },
    { label: 'Stable Income',     desc: 'Minimum monthly salary of Rs. 22,000 required.' },
    { label: 'Employment Record', desc: 'At least 6 months of continuous service in current organization.' },
    { label: 'Document Readiness', desc: 'Valid Citizenship & Salary Certificate / Bank Statement.' },
]

const FILTERS = [
    { label: 'All',        value: 'all' },
    { label: 'Mobiles',    value: 'mobiles',    slug: 'mobile-price-in-nepal',    title: 'Mobiles on Easy EMI',    badge: '0% Interest' },
    { label: 'Laptops',    value: 'laptops',    slug: 'laptop-price-in-nepal',    title: 'Laptops on Easy EMI',    badge: 'Easy EMI' },
    { label: 'Appliances', value: 'appliances', slug: 'appliance-price-in-nepal', title: 'Appliances on Easy EMI', badge: 'Easy EMI' },
]

const DOWN_OPTS   = [10, 20, 30]
const TENURE_OPTS = [6, 12, 18]

// ─── Sub-components ─────────────────────────────────────────────────────────

function SectionHeading({ label, sub }: { label: string; sub?: string }) {
    return (
        <div className="mb-6">
            <div className="flex items-center gap-2.5 mb-1">
                <div className="w-1 h-5 rounded-full shrink-0" style={{ background: 'var(--colour-fsP1)' }} />
                <h2 className="text-lg sm:text-xl font-bold text-(--colour-text2)">{label}</h2>
            </div>
            {sub && <p className="text-xs text-(--colour-text3) pl-3.5">{sub}</p>}
        </div>
    )
}

// ─── Main component ──────────────────────────────────────────────────────────

export default function ShopByEmiClient({ footerBanners = [], initialProducts }: Props) {
    const [calc, setCalc]           = useState({ price: 145000, downPct: 20, tenure: 12 })
    const [activeFilter, setFilter] = useState('all')
    const faqParams                 = useMemo(() => ({ type: 'brand', per_page: 10, page: 1 }), [])

    const downAmt    = Math.round(calc.price * calc.downPct / 100)
    const principal  = calc.price - downAmt
    const monthlyEmi = Math.round(principal / calc.tenure)
    const active     = FILTERS.find(f => f.value === activeFilter)

    return (
        <div className="min-h-screen bg-(--colour-bg4)">

            {/* ══════════════════════════════════════════════
                HERO
            ══════════════════════════════════════════════ */}
            <section className="px-4 sm:px-6 md:px-10 py-10 sm:py-14" style={{ background: '#111827' }}>
                <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center gap-8 sm:gap-12">

                    {/* Left */}
                    <div className="flex-1 space-y-5 text-center sm:text-left">
                        <span className="inline-block px-3 py-1 text-[10px] font-black tracking-widest uppercase rounded-full border border-orange-500/40 text-orange-400">
                            Limited Offer
                        </span>

                        <h1 className="text-3xl sm:text-4xl md:text-[2.75rem] font-extrabold text-white leading-[1.15] tracking-tight">
                            Upgrade Today,<br />
                            <span style={{ color: 'var(--colour-fsP1)' }}>Pay Tomorrow</span>
                        </h1>

                        <p className="text-sm text-gray-400 max-w-sm mx-auto sm:mx-0 leading-relaxed">
                            Experience the freedom of 0% EMI on the latest gadgets. No hidden costs — just simple monthly payments designed for your lifestyle.
                        </p>

                        <div className="flex items-center gap-3 justify-center sm:justify-start flex-wrap">
                            <Link
                                href="/emi/applyemi"
                                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-bold text-white transition-opacity hover:opacity-90"
                                style={{ background: 'var(--colour-fsP1)' }}
                            >
                                Apply for EMI <ArrowRight className="w-3.5 h-3.5" />
                            </Link>
                            <Link
                                href="#emi-products"
                                className="px-5 py-2.5 rounded-lg text-sm font-bold text-white border border-white/25 hover:border-white/50 transition-colors"
                            >
                                Explore Catalog
                            </Link>
                        </div>
                    </div>

                    {/* Right — image */}
                    <div className="shrink-0">
                        <div
                            className="w-40 h-40 sm:w-52 sm:h-52 md:w-60 md:h-60 rounded-2xl flex items-center justify-center border border-white/10"
                            style={{ background: '#1f2937' }}
                        >
                            <Image
                                src={logoImg}
                                alt="Fatafat Sewa EMI"
                                width={200}
                                height={200}
                                className="object-contain p-6 w-full h-full"
                                priority
                            />
                        </div>
                    </div>
                </div>
            </section>

            {/* ══════════════════════════════════════════════
                EMI CALCULATOR
            ══════════════════════════════════════════════ */}
            <section className="bg-white border-b border-(--colour-border3) px-4 sm:px-6 md:px-10 py-8 md:py-10">
                <div className="max-w-5xl mx-auto">
                    <SectionHeading label="Smart EMI Calculator" sub="Estimate your monthly budget in seconds" />

                    <div className="flex flex-col md:flex-row gap-5 md:gap-8">

                        {/* Controls */}
                        <div className="flex-1 space-y-6">

                            {/* Price slider */}
                            <div>
                                <div className="flex justify-between items-center mb-2.5">
                                    <span className="text-xs font-semibold text-(--colour-text3)">Product Price (NPR)</span>
                                    <span className="text-sm font-extrabold" style={{ color: 'var(--colour-fsP2)' }}>
                                        Rs. {calc.price.toLocaleString()}
                                    </span>
                                </div>
                                <input
                                    type="range"
                                    min={10000}
                                    max={500000}
                                    step={1000}
                                    value={calc.price}
                                    onChange={e => setCalc(p => ({ ...p, price: Number(e.target.value) }))}
                                    className="w-full h-1.5 rounded-full accent-(--colour-fsP2) cursor-pointer"
                                />
                                <div className="flex justify-between mt-1">
                                    <span className="text-[10px] text-(--colour-text3)">Rs. 10,000</span>
                                    <span className="text-[10px] text-(--colour-text3)">Rs. 5,00,000</span>
                                </div>
                            </div>

                            {/* Down Payment */}
                            <div>
                                <p className="text-xs font-semibold text-(--colour-text3) mb-2.5">Down Payment</p>
                                <div className="flex gap-2">
                                    {DOWN_OPTS.map(pct => (
                                        <button
                                            key={pct}
                                            type="button"
                                            onClick={() => setCalc(p => ({ ...p, downPct: pct }))}
                                            className={`flex-1 py-2 rounded-lg text-sm font-bold border transition-colors ${
                                                calc.downPct === pct
                                                    ? 'text-white border-transparent'
                                                    : 'text-(--colour-text3) border-(--colour-border3) hover:border-(--colour-fsP2)/40'
                                            }`}
                                            style={calc.downPct === pct ? { background: 'var(--colour-fsP2)', borderColor: 'var(--colour-fsP2)' } : {}}
                                        >
                                            {pct}%
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Tenure */}
                            <div>
                                <p className="text-xs font-semibold text-(--colour-text3) mb-2.5">Tenure (Months)</p>
                                <div className="flex gap-2">
                                    {TENURE_OPTS.map(t => (
                                        <button
                                            key={t}
                                            type="button"
                                            onClick={() => setCalc(p => ({ ...p, tenure: t }))}
                                            className={`flex-1 py-2 rounded-lg text-sm font-bold border transition-colors ${
                                                calc.tenure === t
                                                    ? 'text-white border-transparent'
                                                    : 'text-(--colour-text3) border-(--colour-border3) hover:border-(--colour-fsP2)/40'
                                            }`}
                                            style={calc.tenure === t ? { background: 'var(--colour-fsP2)', borderColor: 'var(--colour-fsP2)' } : {}}
                                        >
                                            {t} Mo
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Breakdown panel */}
                        <div
                            className="md:w-60 lg:w-68 rounded-xl p-5 text-white flex flex-col gap-4"
                            style={{ background: 'var(--colour-fsP2)' }}
                        >
                            <p className="text-sm font-bold tracking-wide">Payment Breakdown</p>

                            <div className="space-y-3 text-xs">
                                <div className="flex justify-between items-center">
                                    <span className="text-blue-200">Principal Amount</span>
                                    <span className="font-bold">Rs. {calc.price.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-blue-200">Down Payment ({calc.downPct}%)</span>
                                    <span className="font-bold">Rs. {downAmt.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-blue-200">EMI Interest</span>
                                    <span className="font-bold" style={{ color: '#86efac' }}>0% Fixed</span>
                                </div>
                            </div>

                            <div className="border-t border-white/20 pt-4">
                                <p className="text-[9px] font-black uppercase tracking-[0.15em] text-blue-200 mb-1.5">
                                    Monthly Installment
                                </p>
                                <p className="text-[1.75rem] font-extrabold leading-none">
                                    Rs. {monthlyEmi.toLocaleString()}
                                </p>
                                <p className="text-[10px] text-blue-200 mt-1">for {calc.tenure} months</p>
                            </div>

                            <Link
                                href="/emi/applyemi"
                                className="mt-auto block text-center py-2.5 rounded-lg font-bold text-sm border border-white/30 hover:bg-white/10 transition-colors"
                            >
                                Apply Now
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* ══════════════════════════════════════════════
                PRODUCTS  +  FILTER
            ══════════════════════════════════════════════ */}
            <section id="emi-products" className="mt-3 bg-white border-b border-(--colour-border3)">

                {/* Filter tab bar */}
                <div className="border-b border-(--colour-border3) px-4 sm:px-6 md:px-10">
                    <div className="max-w-5xl mx-auto flex items-center gap-1.5 overflow-x-auto pt-4 pb-0 scrollbar-hide">
                        {FILTERS.map(f => (
                            <button
                                key={f.value}
                                type="button"
                                onClick={() => setFilter(f.value)}
                                className={`shrink-0 px-4 py-2 mb-0 rounded-t-lg text-sm font-bold border-b-2 transition-colors ${
                                    activeFilter === f.value
                                        ? 'text-(--colour-fsP2) border-(--colour-fsP2) bg-blue-50/60'
                                        : 'text-(--colour-text3) border-transparent hover:text-(--colour-text2)'
                                }`}
                            >
                                {f.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Product grid */}
                <div className="px-4 sm:px-6 md:px-10 py-6 max-w-5xl mx-auto">
                    {activeFilter === 'all' ? (
                        <div className="space-y-8">
                            <EmiBasketSection
                                slug="mobile-price-in-nepal"
                                title="Apple iPhones"
                                brandSlug="iphone-price-in-nepal"
                                budget={500000}
                                tenure={12}
                                downPayment={0}
                                zeroEmi={true}
                                initialData={initialProducts}
                                badge="0% Interest"
                            />
                            <EmiBasketSection
                                slug="laptop-price-in-nepal"
                                title="Premium Laptops"
                                budget={500000}
                                tenure={12}
                                downPayment={0}
                                zeroEmi={false}
                                badge="Easy EMI"
                            />
                        </div>
                    ) : active?.slug ? (
                        <EmiBasketSection
                            slug={active.slug}
                            title={active.title ?? ''}
                            budget={500000}
                            tenure={12}
                            downPayment={0}
                            zeroEmi={false}
                            badge={active.badge}
                        />
                    ) : null}
                </div>
            </section>

            {/* ══════════════════════════════════════════════
                BANNER  +  OFFER
            ══════════════════════════════════════════════ */}
            <TopBanner data={footerBanners?.[0]} />

            <div className="mt-3">
                <EmiOfferBanner slug="emi-offer-deals" />
            </div>

            {/* ══════════════════════════════════════════════
                4 STEPS
            ══════════════════════════════════════════════ */}
            <section className="mt-3 bg-white border-b border-(--colour-border3) px-4 sm:px-6 md:px-10 py-8 md:py-12">
                <div className="max-w-5xl mx-auto">
                    <div className="text-center mb-8">
                        <h2 className="text-xl sm:text-2xl font-extrabold text-(--colour-text2)">4 Steps to Your New Device</h2>
                        <p className="text-xs text-(--colour-text3) mt-1.5 max-w-sm mx-auto leading-relaxed">
                            Getting a product on EMI has never been easier. Simple, transparent process.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                        {STEPS.map((step, i) => (
                            <div
                                key={step.label}
                                className="relative flex flex-col p-5 rounded-xl border border-(--colour-border3) bg-(--colour-bg4) overflow-hidden"
                            >
                                {/* Step number — faint background */}
                                <span
                                    className="absolute top-3 right-3 text-5xl font-black leading-none select-none"
                                    style={{ color: step.color, opacity: 0.08 }}
                                >
                                    {i + 1}
                                </span>

                                <div
                                    className="w-10 h-10 rounded-xl flex items-center justify-center mb-4 shrink-0"
                                    style={{ background: step.color }}
                                >
                                    <step.Icon className="w-5 h-5 text-white" strokeWidth={2} />
                                </div>

                                <p
                                    className="text-[10px] font-black uppercase tracking-widest mb-1"
                                    style={{ color: step.color }}
                                >
                                    Step {i + 1}
                                </p>
                                <p className="text-sm font-bold text-(--colour-text2) mb-1.5">{step.label}</p>
                                <p className="text-xs text-(--colour-text3) leading-relaxed">{step.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ══════════════════════════════════════════════
                BANKING PARTNERS
            ══════════════════════════════════════════════ */}
            <section className="bg-white border-b border-(--colour-border3) px-4 sm:px-6 md:px-10 py-8">
                <div className="max-w-5xl mx-auto">
                    <p className="text-center text-[10px] font-black uppercase tracking-[0.18em] text-(--colour-text3) mb-6">
                        Our Trusted Banking Partners
                    </p>
                    <div className="flex items-center justify-center flex-wrap gap-x-6 gap-y-4">
                        {bankingEmiPartners.map((logo, i) => (
                            <div key={i} className="relative w-20 h-10 sm:w-24 sm:h-12">
                                <Image
                                    src={logo}
                                    alt={`Banking partner ${i + 1}`}
                                    fill
                                    sizes="96px"
                                    className="object-contain grayscale hover:grayscale-0 transition-all duration-200 opacity-70 hover:opacity-100"
                                />
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ══════════════════════════════════════════════
                ELIGIBILITY CHECKLIST
            ══════════════════════════════════════════════ */}
            <section className="bg-white border-b border-(--colour-border3) px-4 sm:px-6 md:px-10 py-8 md:py-10">
                <div className="max-w-5xl mx-auto">
                    <div className="text-center mb-8">
                        <h2 className="text-xl sm:text-2xl font-extrabold text-(--colour-text2)">Eligibility Checklist</h2>
                        <p className="text-xs text-(--colour-text3) mt-1.5">Make sure you meet these requirements before applying.</p>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-3 mb-6">
                        {ELIGIBILITY.map((item, i) => (
                            <div
                                key={item.label}
                                className="flex items-start gap-4 p-5 rounded-xl border border-(--colour-border3) bg-(--colour-bg4)"
                            >
                                <div
                                    className="w-9 h-9 rounded-full flex items-center justify-center shrink-0"
                                    style={{ background: '#dcfce7' }}
                                >
                                    <CheckCircle className="w-5 h-5" style={{ color: '#10b981' }} />
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-(--colour-text2)">{item.label}</p>
                                    <p className="text-xs text-(--colour-text3) mt-0.5 leading-relaxed">{item.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="flex flex-col sm:flex-row items-center gap-4 p-5 rounded-xl border border-(--colour-border3) bg-(--colour-bg4)">
                        <div className="flex-1 text-center sm:text-left">
                            <p className="text-sm font-bold text-(--colour-text2)">Ready to apply?</p>
                            <p className="text-xs text-(--colour-text3) mt-0.5">
                                Our team verifies your documents within <strong className="text-(--colour-text2)">24 hours</strong>.
                            </p>
                        </div>
                        <Link
                            href="/emi/applyemi"
                            className="shrink-0 inline-flex items-center gap-2 px-6 py-3 rounded-full text-sm font-bold text-white transition-opacity hover:opacity-90"
                            style={{ background: 'var(--colour-fsP2)' }}
                        >
                            Start Application <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                    </div>
                </div>
            </section>

            {/* ══════════════════════════════════════════════
                FAQ  (original structure)
            ══════════════════════════════════════════════ */}
            <div className="mt-3 bg-white border-t border-(--colour-border3) px-4 sm:px-6">
                <EmiFaq params={faqParams} />
            </div>

            <TopBanner data={footerBanners?.[0]} />
        </div>
    )
}
