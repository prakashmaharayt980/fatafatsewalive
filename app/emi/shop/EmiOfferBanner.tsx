'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Zap, ArrowRight, ShoppingBag } from 'lucide-react'
import { useInView } from 'react-intersection-observer'
import { fetchOfferDetails } from '@/app/api/services/offers.service'
import type { CampaignDetails, CampaignProduct } from '@/app/api/services/offers.interface'

interface Props { slug: string }
interface TimeLeft { d: number; h: number; m: number; s: number }

function useCountdown(end: string): TimeLeft {
    const calc = (): TimeLeft => {
        const dist = new Date(end).getTime() - Date.now()
        if (dist <= 0) return { d: 0, h: 0, m: 0, s: 0 }
        return {
            d: Math.floor(dist / 86400000),
            h: Math.floor((dist % 86400000) / 3600000),
            m: Math.floor((dist % 3600000) / 60000),
            s: Math.floor((dist % 60000) / 1000),
        }
    }
    const [t, setT] = useState<TimeLeft>(calc)
    useEffect(() => {
        const id = setInterval(() => {
            const n = calc()
            setT(n)
            if (!n.d && !n.h && !n.m && !n.s) clearInterval(id)
        }, 1000)
        return () => clearInterval(id)
    }, [end])
    return t
}

function CountBlock({ value, label }: { value: number; label: string }) {
    return (
        <div className="flex flex-col items-center gap-1.5">
            <div
                className="w-14 h-14 sm:w-16 sm:h-16 flex items-center justify-center rounded-xl text-white text-xl sm:text-2xl font-black tabular-nums font-mono"
                style={{ background: 'var(--colour-fsP2)' }}
            >
                {String(value).padStart(2, '0')}
            </div>
            <span className="text-[10px] sm:text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--colour-fsP2)' }}>
                {label}
            </span>
        </div>
    )
}

function ProductRow({ p }: { p: CampaignProduct }) {
    const hasDisc = p.price.current > p.price.discounted
    const disc = hasDisc ? Math.round(((p.price.current - p.price.discounted) / p.price.current) * 100) : 0
    const emi = Math.round(p.price.discounted / 12)

    return (
        <Link
            href={`/product-details/${p.slug}`}
            className="group flex items-center gap-2.5 sm:gap-3 p-2.5 rounded-xl bg-white border border-(--colour-border3) hover:border-(--colour-fsP2)/30 hover:shadow-sm transition-all shrink-0 min-w-[170px] sm:min-w-[190px]"
        >
            <div className="relative w-12 h-12 sm:w-14 sm:h-14 rounded-lg bg-(--colour-bg4) overflow-hidden shrink-0">
                {hasDisc && (
                    <span
                        className="absolute top-0.5 left-0.5 z-10 text-[8px] font-black text-white px-1 py-0.5 rounded"
                        style={{ background: 'var(--colour-fsP1)' }}
                    >
                        -{disc}%
                    </span>
                )}
                {p.thumb?.url && (
                    <Image
                        src={p.thumb.url}
                        alt={p.thumb.alt_text ?? p.name}
                        fill
                        sizes="56px"
                        className="object-contain p-1.5"
                    />
                )}
            </div>
            <div className="min-w-0 flex-1">
                <p className="text-xs sm:text-sm font-semibold text-(--colour-text2) truncate group-hover:text-(--colour-fsP2) transition-colors">
                    {p.name}
                </p>
                <p className="text-xs sm:text-sm font-bold" style={{ color: 'var(--colour-fsP1)' }}>
                    Rs.&nbsp;{p.price.discounted.toLocaleString()}
                </p>
                {hasDisc && (
                    <p className="text-[10px] text-(--colour-text3) line-through">
                        Rs.&nbsp;{p.price.current.toLocaleString()}
                    </p>
                )}
                <span className="text-[9px] font-bold" style={{ color: 'var(--colour-fsP2)' }}>
                    EMI Rs.&nbsp;{emi.toLocaleString()}/mo
                </span>
            </div>
        </Link>
    )
}

export default function EmiOfferBanner({ slug }: Props) {
    const { ref, inView } = useInView({ threshold: 0.05, triggerOnce: true })
    const [offer, setOffer] = useState<CampaignDetails | null>(null)

    useEffect(() => {
        if (!inView) return
        fetchOfferDetails(slug).then(r => setOffer(r.data)).catch(() => null)
    }, [inView, slug])

    const fallbackEnd = new Date(Date.now() + 86400000).toISOString()
    const t = useCountdown(offer?.end_date ?? fallbackEnd)

    if (!inView) return <div ref={ref} className="min-h-24" />
    if (!offer) return null

    const products = offer.products?.data ?? []

    return (
        <div ref={ref} className="w-full border-y border-(--colour-border3)" style={{ background: '#EEF3FB' }}>
            <div className="px-4 sm:px-6 md:px-10 py-8 sm:py-10">
                <div className="max-w-5xl mx-auto">

                    {/* ── Main row: content + image ── */}
                    <div className="flex flex-col lg:flex-row lg:items-center gap-8 lg:gap-12 mb-8">

                        {/* Left — content */}
                        <div className="flex-1 flex flex-col items-center lg:items-start gap-4 text-center lg:text-left">

                            {/* Badge */}
                            <div
                                className="inline-flex items-center gap-2 pl-1.5 pr-4 py-1.5 rounded-full"
                                style={{ background: 'var(--colour-fsP2)' }}
                            >
                                <span
                                    className="p-1.5 rounded-full"
                                    style={{ background: 'var(--colour-fsP1)' }}
                                >
                                    <Zap className="w-3 h-3 text-white" style={{ fill: 'white' }} />
                                </span>
                                <span className="text-white text-xs font-bold uppercase tracking-wider">
                                    Limited EMI Offer
                                </span>
                            </div>

                            {/* Heading */}
                            <div className="space-y-2">
                                <h2
                                    className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight leading-[1.1]"
                                    style={{ color: 'var(--colour-fsP2)' }}
                                >
                                    {offer.name}
                                </h2>
                                <p className="text-sm sm:text-base text-(--colour-text3) max-w-md mx-auto lg:mx-0 leading-relaxed">
                                    Don&apos;t miss out — exclusive gadget deals on{' '}
                                    <span className="font-bold" style={{ color: 'var(--colour-fsP1)' }}>0% EMI</span>{' '}
                                    approved by major Nepali banks.
                                </p>
                            </div>

                            {/* Countdown */}
                            <div>
                                <p className="text-[10px] font-black uppercase tracking-[0.15em] text-(--colour-text3) mb-3">
                                    Offer ends in
                                </p>
                                <div className="flex items-center gap-2 sm:gap-3 justify-center lg:justify-start">
                                    <CountBlock value={t.d} label="Days" />
                                    <span className="font-black text-xl sm:text-2xl mb-5" style={{ color: 'var(--colour-fsP1)' }}>:</span>
                                    <CountBlock value={t.h} label="Hours" />
                                    <span className="font-black text-xl sm:text-2xl mb-5" style={{ color: 'var(--colour-fsP1)' }}>:</span>
                                    <CountBlock value={t.m} label="Min" />
                                    <span className="font-black text-xl sm:text-2xl mb-5" style={{ color: 'var(--colour-fsP1)' }}>:</span>
                                    <CountBlock value={t.s} label="Sec" />
                                </div>
                            </div>

                            {/* CTAs */}
                            <div className="flex flex-col sm:flex-row items-center gap-3">
                                <Link
                                    href={`/offers/${offer.slug}`}
                                    className="inline-flex items-center gap-2.5 px-8 py-3.5 rounded-full text-sm font-bold text-white transition-opacity hover:opacity-90"
                                    style={{ background: 'var(--colour-fsP2)' }}
                                >
                                    <ShoppingBag className="w-4 h-4" />
                                    Shop Now
                                    <ArrowRight className="w-4 h-4" />
                                </Link>
                                <Link
                                    href="/offers"
                                    className="inline-flex items-center gap-1.5 text-sm font-semibold transition-colors hover:opacity-80"
                                    style={{ color: 'var(--colour-fsP2)' }}
                                >
                                    View All Deals <ArrowRight className="w-4 h-4" />
                                </Link>
                            </div>
                        </div>

                        {/* Right — offer image */}
                        {offer?.thumb?.url && (
                            <div className="lg:w-5/12 flex justify-center shrink-0">
                                <div className="relative w-56 h-56 sm:w-72 sm:h-72 md:w-80 md:h-80">
                                    <Image
                                        src={offer.thumb.url}
                                        alt={offer.thumb.alt_text ?? offer.name}
                                        fill
                                        sizes="(max-width: 640px) 224px, (max-width: 768px) 288px, 320px"
                                        className="object-contain"
                                        priority
                                    />
                                </div>
                            </div>
                        )}
                    </div>

                    {/* ── Product strip ── */}
                    {products.length > 0 && (
                        <div className="grid grid-cols-2 gap-2 sm:flex sm:gap-3 sm:overflow-x-auto scrollbar-hide pb-1">
                            {products.map(p => <ProductRow key={p.id} p={p} />)}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
