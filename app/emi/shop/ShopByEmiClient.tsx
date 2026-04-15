'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { CheckCircle, Search, ShieldCheck, FileText, Zap, ArrowRight, CreditCard, Banknote } from 'lucide-react'
import { bankingEmiPartners } from '@/app/CommonVue/Partners'
import type { BannerItem } from '@/app/types/BannerTypes'
import EmiBasketSection from './EmiBasketSection'
import EmiOfferBanner from './EmiOfferBanner'
import EmiFaq from '../apply/_components/EmiFaq'
import TopBanner from '@/app/homepage/Bannerfooter'

interface Props {
    footerBanners?: BannerItem[]
    initialProducts?: any
}

// ─── Static data ─────────────────────────────────────────────────────────────

const STEPS = [
    { Icon: Search,      label: 'Choose',            color: 'var(--colour-fsP1)', desc: 'Select any product worth above NPR 15,000 from our store.' },
    { Icon: ShieldCheck, label: 'Check Eligibility', color: 'var(--colour-fsP2)', desc: 'Quick online verification with your information and credit history.' },
    { Icon: FileText,    label: 'Submit',             color: '#6366f1',            desc: 'Upload basic documents and choose your bank partner.' },
    { Icon: Zap,         label: 'Approval',           color: '#10b981',            desc: 'Get instant approval and pick up your device or get it delivered.' },
]

const ELIGIBILITY = [
    { label: 'Age Requirement',    desc: 'Must be between 21 and 60 years of age.' },
    { label: 'Stable Income',      desc: 'Minimum monthly salary of Rs. 22,000 required.' },
    { label: 'Employment Record',  desc: 'At least 6 months of continuous service in current organization.' },
    { label: 'Document Readiness', desc: 'Valid Citizenship & Salary Certificate / Bank Statement.' },
]

const FILTERS = [
    { label: 'All',     value: 'all' },
    { label: 'Mobiles', value: 'mobiles' },
    { label: 'Laptops', value: 'laptops' },
]

const MOBILE_BRANDS = [
    { title: 'Apple iPhones',    slug: 'mobile-price-in-nepal', brandSlug: 'iphone-price-in-nepal',   badge: '0% Interest' },
    { title: 'Samsung Mobiles',  slug: 'mobile-price-in-nepal', brandSlug: 'samsung-price-in-nepal',  badge: 'EMI Available' },
    { title: 'Realme Phones',    slug: 'mobile-price-in-nepal', brandSlug: 'realme-price-in-nepal',   badge: 'EMI Available' },
    { title: 'Xiaomi / Redmi',   slug: 'mobile-price-in-nepal', brandSlug: 'xiaomi-price-in-nepal',   badge: 'EMI Available' },
    { title: 'Vivo Phones',      slug: 'mobile-price-in-nepal', brandSlug: 'vivo-price-in-nepal',     badge: 'EMI Available' },
]

const LAPTOP_BRANDS = [
    { title: 'HP Laptops',     slug: 'laptop-price-in-nepal', brandSlug: 'hp-price-in-nepal',     badge: 'EMI Available' },
    { title: 'Dell Laptops',   slug: 'laptop-price-in-nepal', brandSlug: 'dell-price-in-nepal',   badge: 'EMI Available' },
    { title: 'Lenovo Laptops', slug: 'laptop-price-in-nepal', brandSlug: 'lenovo-price-in-nepal', badge: 'EMI Available' },
    { title: 'Asus Laptops',   slug: 'laptop-price-in-nepal', brandSlug: 'asus-price-in-nepal',   badge: 'EMI Available' },
    { title: 'Apple MacBooks', slug: 'laptop-price-in-nepal', brandSlug: 'apple-price-in-nepal',  badge: '0% Interest' },
]

const DOWN_OPTS   = [10, 20, 30]
const TENURE_OPTS = [6, 12, 18]

// ─── Sub-components ───────────────────────────────────────────────────────────

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

// ─── Main component ───────────────────────────────────────────────────────────

export default function ShopByEmiClient({ footerBanners = [], initialProducts }: Props) {
    const [calc, setCalc]           = useState({ price: 145000, downPct: 20, tenure: 12, payMethod: 'bank' as 'bank' | 'card' })
    const [activeFilter, setFilter] = useState('all')
    const faqParams                 = useMemo(() => ({ type: 'brand', per_page: 10, page: 1 }), [])

    const downAmt    = calc.payMethod === 'card' ? 0 : Math.round(calc.price * calc.downPct / 100)
    const principal  = calc.price - downAmt
    const monthlyEmi = Math.round(principal / calc.tenure)

    return (
        <div className="min-h-screen bg-(--colour-bg4)">

            {/* ══════════════════════════════════════════════
                HERO — clean white, border-based
            ══════════════════════════════════════════════ */}
            <section className="bg-white border-b border-(--colour-border3) px-4 sm:px-6 py-8 sm:py-10">
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 sm:gap-10">

                    {/* Left */}
                    <div className="flex-1 space-y-4">
                        <span
                            className="inline-block px-3 py-1 text-[10px] font-black tracking-widest uppercase rounded-full border text-white"
                            style={{ background: 'var(--colour-fsP1)', borderColor: 'var(--colour-fsP1)' }}
                        >
                            0% EMI Available
                        </span>

                        <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-(--colour-text2) leading-tight tracking-tight">
                            Upgrade Today,{' '}
                            <span style={{ color: 'var(--colour-fsP2)' }}>Pay in Easy Installments</span>
                        </h1>

                        <p className="text-sm text-(--colour-text3) max-w-lg leading-relaxed">
                            Shop mobiles &amp; laptops on 0% EMI in Nepal. No hidden charges — choose your bank, pick your tenure, and take home your device today.
                        </p>

                        <div className="flex items-center gap-3 flex-wrap">
                            <Link
                                href="/emi/applyemi"
                                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-bold text-white transition-opacity hover:opacity-90"
                                style={{ background: 'var(--colour-fsP2)' }}
                            >
                                Apply for EMI <ArrowRight className="w-3.5 h-3.5" />
                            </Link>
                            <Link
                                href="#emi-products"
                                className="px-5 py-2.5 rounded-lg text-sm font-bold border border-(--colour-border3) text-(--colour-text2) hover:border-(--colour-fsP2)/40 transition-colors"
                            >
                                Browse Products
                            </Link>
                        </div>
                    </div>

                    {/* Right — stat chips */}
                    <div className="flex sm:flex-col gap-2 flex-wrap sm:flex-nowrap shrink-0">
                        {[
                            { label: '0% Interest', sub: 'Select banks' },
                            { label: '10+ Banks',   sub: 'EMI partners' },
                            { label: '6–18 Months', sub: 'Flexible tenure' },
                        ].map(s => (
                            <div
                                key={s.label}
                                className="px-4 py-3 rounded-xl border border-(--colour-border3) bg-(--colour-bg4) text-center min-w-[110px]"
                            >
                                <p className="text-sm font-extrabold text-(--colour-text2)">{s.label}</p>
                                <p className="text-[10px] text-(--colour-text3) mt-0.5">{s.sub}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ══════════════════════════════════════════════
                EMI CALCULATOR
            ══════════════════════════════════════════════ */}
            <section className="bg-white border-b border-(--colour-border3) px-4 sm:px-6 py-8 md:py-10">
                <SectionHeading label="Smart EMI Calculator" sub="Estimate your monthly payment in seconds" />

                <div className="flex flex-col md:flex-row gap-5 md:gap-8">

                    {/* Controls */}
                    <div className="flex-1 space-y-6">

                        {/* Payment method toggle */}
                        <div>
                            <p className="text-xs font-semibold text-(--colour-text3) mb-2.5">Payment Method</p>
                            <div className="flex gap-2">
                                <button
                                    type="button"
                                    onClick={() => setCalc(p => ({ ...p, payMethod: 'bank' }))}
                                    className={`flex items-center gap-2 flex-1 py-2.5 px-3 rounded-lg text-sm font-bold border transition-colors ${
                                        calc.payMethod === 'bank'
                                            ? 'text-white border-transparent'
                                            : 'text-(--colour-text3) border-(--colour-border3) hover:border-(--colour-fsP2)/40'
                                    }`}
                                    style={calc.payMethod === 'bank' ? { background: 'var(--colour-fsP2)', borderColor: 'var(--colour-fsP2)' } : {}}
                                >
                                    <Banknote className="w-4 h-4 shrink-0" />
                                    Bank / Cash
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setCalc(p => ({ ...p, payMethod: 'card' }))}
                                    className={`flex items-center gap-2 flex-1 py-2.5 px-3 rounded-lg text-sm font-bold border transition-colors ${
                                        calc.payMethod === 'card'
                                            ? 'text-white border-transparent'
                                            : 'text-(--colour-text3) border-(--colour-border3) hover:border-(--colour-fsP2)/40'
                                    }`}
                                    style={calc.payMethod === 'card' ? { background: 'var(--colour-fsP2)', borderColor: 'var(--colour-fsP2)' } : {}}
                                >
                                    <CreditCard className="w-4 h-4 shrink-0" />
                                    Credit Card
                                </button>
                            </div>
                            {calc.payMethod === 'card' && (
                                <p className="text-[11px] text-(--colour-text3) mt-2 pl-1">
                                    0% interest on full amount with eligible credit cards. No down payment required.
                                </p>
                            )}
                        </div>

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

                        {/* Down Payment — only for bank method */}
                        {calc.payMethod === 'bank' && (
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
                        )}

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
                                <span className="text-blue-200">Product Price</span>
                                <span className="font-bold">Rs. {calc.price.toLocaleString()}</span>
                            </div>
                            {calc.payMethod === 'bank' ? (
                                <div className="flex justify-between items-center">
                                    <span className="text-blue-200">Down Payment ({calc.downPct}%)</span>
                                    <span className="font-bold">Rs. {downAmt.toLocaleString()}</span>
                                </div>
                            ) : (
                                <div className="flex justify-between items-center">
                                    <span className="text-blue-200">Down Payment</span>
                                    <span className="font-bold text-green-300">Not Required</span>
                                </div>
                            )}
                            <div className="flex justify-between items-center">
                                <span className="text-blue-200">EMI Interest</span>
                                <span className="font-bold text-green-300">0% Fixed</span>
                            </div>
                            {calc.payMethod === 'card' && (
                                <div className="flex justify-between items-center">
                                    <span className="text-blue-200">Method</span>
                                    <span className="font-bold flex items-center gap-1">
                                        <CreditCard className="w-3 h-3" /> Credit Card
                                    </span>
                                </div>
                            )}
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
            </section>

            {/* ══════════════════════════════════════════════
                FILTER + PRODUCTS
            ══════════════════════════════════════════════ */}
            <section id="emi-products" className="mt-3 bg-white border-b border-(--colour-border3)">

                {/* Filter tab bar */}
                <div className="border-b border-(--colour-border3) px-4 sm:px-6">
                    <div className="flex items-center gap-1.5 overflow-x-auto pt-4 pb-0 scrollbar-hide">
                        {FILTERS.map(f => (
                            <button
                                key={f.value}
                                type="button"
                                onClick={() => setFilter(f.value)}
                                className={`shrink-0 px-4 py-2 rounded-t-lg text-sm font-bold border-b-2 transition-colors ${
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

                {/* Product sections */}
                <div className="py-4">
                    {(activeFilter === 'all' || activeFilter === 'mobiles') && (
                        <div>
                            {activeFilter === 'all' && (
                                <div className="flex items-center gap-2.5 px-4 sm:px-6 mb-2 mt-2">
                                    <div className="w-1 h-4 rounded-full" style={{ background: 'var(--colour-fsP1)' }} />
                                    <p className="text-xs font-black uppercase tracking-widest text-(--colour-text3)">Mobiles on EMI</p>
                                </div>
                            )}
                            {MOBILE_BRANDS.map((b, i) => (
                                <EmiBasketSection
                                    key={b.brandSlug}
                                    slug={b.slug}
                                    title={b.title}
                                    brandSlug={b.brandSlug}
                                    badge={b.badge}
                                    isFirstSection={i === 0}
                                    initialData={i === 0 && activeFilter !== ('laptops' as string) ? initialProducts : undefined}
                                />
                            ))}
                        </div>
                    )}

                    {(activeFilter === 'all' || activeFilter === 'laptops') && (
                        <div className={activeFilter === 'all' ? 'mt-4 border-t border-(--colour-border3) pt-4' : ''}>
                            {activeFilter === 'all' && (
                                <div className="flex items-center gap-2.5 px-4 sm:px-6 mb-2">
                                    <div className="w-1 h-4 rounded-full" style={{ background: 'var(--colour-fsP2)' }} />
                                    <p className="text-xs font-black uppercase tracking-widest text-(--colour-text3)">Laptops on EMI</p>
                                </div>
                            )}
                            {LAPTOP_BRANDS.map((b, i) => (
                                <EmiBasketSection
                                    key={b.brandSlug}
                                    slug={b.slug}
                                    title={b.title}
                                    brandSlug={b.brandSlug}
                                    badge={b.badge}
                                    isFirstSection={i === 0 && activeFilter === 'laptops'}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </section>

            {/* ══════════════════════════════════════════════
                BANNER + OFFER
            ══════════════════════════════════════════════ */}
            <TopBanner data={footerBanners?.[0]} />

            <div className="mt-3">
                <EmiOfferBanner slug="emi-offer-deals" />
            </div>

            {/* ══════════════════════════════════════════════
                4 STEPS
            ══════════════════════════════════════════════ */}
            <section className="mt-3 bg-white border-b border-(--colour-border3) px-4 sm:px-6 py-8 md:py-12">
                <div className="text-center mb-8">
                    <h2 className="text-xl sm:text-2xl font-extrabold text-(--colour-text2)">4 Steps to Your New Device</h2>
                    <p className="text-xs text-(--colour-text3) mt-1.5 max-w-sm mx-auto leading-relaxed">
                        Simple, transparent process — no paperwork hassle.
                    </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                    {STEPS.map((step, i) => (
                        <div
                            key={step.label}
                            className="relative flex flex-col p-5 rounded-xl border border-(--colour-border3) bg-(--colour-bg4) overflow-hidden"
                        >
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
            </section>

            {/* ══════════════════════════════════════════════
                BANKING PARTNERS
            ══════════════════════════════════════════════ */}
            <section className="bg-white border-b border-(--colour-border3) px-4 sm:px-6 py-8">
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
            </section>

            {/* ══════════════════════════════════════════════
                ELIGIBILITY CHECKLIST
            ══════════════════════════════════════════════ */}
            <section className="bg-white border-b border-(--colour-border3) px-4 sm:px-6 py-8 md:py-10">
                <div className="text-center mb-8">
                    <h2 className="text-xl sm:text-2xl font-extrabold text-(--colour-text2)">Eligibility Checklist</h2>
                    <p className="text-xs text-(--colour-text3) mt-1.5">Make sure you meet these requirements before applying.</p>
                </div>

                <div className="grid sm:grid-cols-2 gap-3 mb-6">
                    {ELIGIBILITY.map(item => (
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
            </section>

            {/* ══════════════════════════════════════════════
                FAQ
            ══════════════════════════════════════════════ */}
            <div className="mt-3 bg-white border-t border-(--colour-border3) px-4 sm:px-6">
                <EmiFaq params={faqParams} />
            </div>

            <TopBanner data={footerBanners?.[0]} />
        </div>
    )
}
