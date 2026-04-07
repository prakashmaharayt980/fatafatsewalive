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
        if (dist < 0) return { d: 0, h: 0, m: 0, s: 0 }
        return {
            d: Math.floor(dist / 86400000),
            h: Math.floor((dist % 86400000) / 3600000),
            m: Math.floor((dist % 3600000) / 60000),
            s: Math.floor((dist % 60000) / 1000),
        }
    }
    const [t, setT] = useState<TimeLeft>(calc)
    useEffect(() => {
        const id = setInterval(() => { const n = calc(); setT(n); if (!n.d && !n.h && !n.m && !n.s) clearInterval(id) }, 1000)
        return () => clearInterval(id)
    }, [end])
    return t
}

const R = 22
const C = 2 * Math.PI * R

function ClockRing({ value, max, label, color }: { value: number; max: number; label: string; color: string }) {
    return (
        <div className="flex flex-col items-center gap-1">
            <div className="relative w-13 h-13">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 56 56">
                    <circle cx="28" cy="28" r={R} fill="none" stroke="white" strokeWidth="3" opacity="0.6" />
                    <circle cx="28" cy="28" r={R} fill="none" stroke={color} strokeWidth="3"
                        strokeDasharray={C} strokeDashoffset={C - (value / max) * C}
                        strokeLinecap="round" style={{ transition: 'stroke-dashoffset 0.8s ease' }} />
                </svg>
                <span className="absolute inset-0 flex items-center justify-center text-[13px] font-black tabular-nums font-mono text-(--colour-text2)">
                    {String(value).padStart(2, '0')}
                </span>
            </div>
            <span className="text-[9px] font-bold uppercase tracking-widest text-(--colour-text3)">{label}</span>
        </div>
    )
}

function SaleProductCard({ p }: { p: CampaignProduct }) {
    const disc = p.price.current > p.price.discounted
        ? Math.round(((p.price.current - p.price.discounted) / p.price.current) * 100)
        : 0
    const emi = Math.round(p.price.discounted / 12)

    return (
        <Link
            href={`/product-details/${p.slug}`}
            className="group flex flex-col shrink-0 w-38 bg-white border border-(--colour-border3) rounded-xl overflow-hidden hover:border-(--colour-fsP2)/40 hover:shadow-sm transition-all duration-150"
        >
            <div className="relative w-full aspect-square bg-(--colour-bg4)">
                {disc > 0 && (
                    <span className="absolute top-1.5 left-1.5 z-10 text-[9px] font-black text-white px-1.5 py-0.5 rounded-md" style={{ background: 'var(--colour-fsP1)' }}>
                        -{disc}%
                    </span>
                )}
                {p.thumb?.url && (
                    <Image src={p.thumb.url} alt={p.thumb.alt_text ?? p.name} fill sizes="152px"
                        className="object-contain p-3 mix-blend-multiply group-hover:scale-[1.03] transition-transform duration-200" />
                )}
            </div>

            <div className="p-2.5 flex flex-col gap-0.5 border-t border-(--colour-border3)">
                <p className="text-[11px] font-semibold text-(--colour-text2) line-clamp-2 leading-snug">{p.name}</p>
                <p className="text-[13px] font-bold text-(--colour-text1) mt-1">Rs.&nbsp;{p.price.discounted.toLocaleString()}</p>
                {disc > 0 && (
                    <p className="text-[10px] text-(--colour-text3) line-through">Rs.&nbsp;{p.price.current.toLocaleString()}</p>
                )}
                <span className="mt-1 self-start text-[10px] font-bold px-1.5 py-0.5 rounded-md" style={{ color: 'var(--colour-fsP2)', background: '#EEF3FB' }}>
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

    const t = useCountdown(offer?.end_date ?? new Date(Date.now() + 86400000).toISOString())

    if (!inView) return <div ref={ref} className="min-h-25" />
    if (!offer) return null

    const products = offer.products?.data ?? []

    return (
        <div ref={ref} className="w-full border-y border-(--colour-border3) overflow-hidden" style={{ background: '#EEF3FB' }}>

            {/* Hero row */}
            <div className="flex flex-col md:flex-row px-6 py-8 md:px-8 gap-8 md:gap-0">

                {/* Left — content 2/5 */}
                <div className="md:w-2/5 flex flex-col justify-center gap-5">

                    <div className="inline-flex items-center gap-1.5 self-start px-2.5 py-1 rounded-full border text-[10px] font-black uppercase tracking-widest" style={{ color: 'var(--colour-fsP2)', borderColor: '#C7D9F5', background: 'white' }}>
                        <Zap style={{ width: 9, height: 9, fill: 'currentColor' }} /> Limited EMI Offer
                    </div>

                    <div>
                        <h2 className="text-xl sm:text-2xl font-extrabold text-(--colour-text1) leading-tight">
                            {offer.name}
                        </h2>
                        <p className="text-(--colour-text3) text-sm mt-1.5 max-w-xs leading-relaxed">
                            Exclusive gadget deals on 0% EMI — limited time, approved by major Nepali banks.
                        </p>
                    </div>

                    {/* Clock countdown */}
                    <div>
                        <p className="text-[10px] font-black uppercase tracking-widest mb-3 text-(--colour-text3)">
                            Offer ends in
                        </p>
                        <div className="flex items-center gap-2">
                            <ClockRing value={t.d} max={30} label="Days" color="var(--colour-fsP2)" />
                            <span className="text-(--colour-border3) font-black text-xl mb-4">·</span>
                            <ClockRing value={t.h} max={24} label="Hrs" color="var(--colour-fsP1)" />
                            <span className="text-(--colour-border3) font-black text-xl mb-4">·</span>
                            <ClockRing value={t.m} max={60} label="Min" color="var(--colour-fsP2)" />
                            <span className="text-(--colour-border3) font-black text-xl mb-4">·</span>
                            <ClockRing value={t.s} max={60} label="Sec" color="var(--colour-fsP1)" />
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <Link
                            href={`/offers/${offer.slug}`}
                            className="inline-flex items-center gap-2 h-9 px-4 rounded-lg text-white text-sm font-bold transition-opacity hover:opacity-90"
                            style={{ background: 'var(--colour-fsP2)' }}
                        >
                            <ShoppingBag style={{ width: 13, height: 13 }} /> Shop Offer
                        </Link>
                        <Link href="/offers" className="inline-flex items-center gap-1 text-sm font-semibold text-(--colour-text3) hover:text-(--colour-text2) transition-colors">
                            All deals <ArrowRight style={{ width: 12, height: 12 }} />
                        </Link>
                    </div>
                </div>

     
            </div>

            {/* Product strip — white cards on tinted bg */}
            {products.length > 0 && (
                <div className="px-6 md:px-8 pb-6">
     
                    <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-1">
                        {products.map(p => <SaleProductCard key={p.id} p={p} />)}
                    </div>
                </div>
            )}
        </div>
    )
}
