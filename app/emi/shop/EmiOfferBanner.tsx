'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Tag, ArrowRight, ShoppingBag } from 'lucide-react'
import { useInView } from 'react-intersection-observer'
import { fetchOfferDetails } from '@/app/api/services/offers.service'
import type { CampaignDetails, CampaignProduct } from '@/app/api/services/offers.interface'

interface Props {
    slug: string
}

function ProductCard({ p }: { p: CampaignProduct }) {
    const hasDiscount = p.price.current > p.price.discounted
    const discountPercent = hasDiscount
        ? Math.round(((p.price.current - p.price.discounted) / p.price.current) * 100)
        : 0

    return (
        <Link
            href={`/product-details/${p.slug}`}
            className="flex items-center gap-2.5 shrink-0 w-48 bg-white border border-gray-100 rounded-xl p-2 hover:border-gray-200 transition-colors"
        >
            <div className="relative w-12 h-12 shrink-0 bg-[#F5F7FA] rounded-lg overflow-hidden">
                {p.thumb?.url && (
                    <Image src={p.thumb.url} alt={p.thumb.alt_text ?? p.name} fill sizes="48px" className="object-contain p-1.5" />
                )}
            </div>
            <div className="min-w-0 flex-1">
                <p className="text-[11px] font-semibold text-gray-800 truncate leading-snug">{p.name}</p>
                <p className="text-[12px] font-extrabold text-gray-900 mt-0.5">Rs.&nbsp;{p.price.discounted.toLocaleString()}</p>
                {hasDiscount && (
                    <div className="flex items-center gap-1">
                        <p className="text-[10px] text-gray-400 line-through">Rs.&nbsp;{p.price.current.toLocaleString()}</p>
                        <span className="text-[9px] font-black px-1 py-px rounded" style={{ color: 'var(--colour-fsP1)', background: '#FFF4EE' }}>
                            -{discountPercent}%
                        </span>
                    </div>
                )}
            </div>
        </Link>
    )
}

export default function EmiOfferBanner({ slug }: Props) {
    const { ref, inView } = useInView({ threshold: 0.05, triggerOnce: true })
    const [offer, setOffer] = useState<CampaignDetails | null>(null)

    useEffect(() => {
        if (!inView) return
        fetchOfferDetails(slug)
            .then(res => setOffer(res.data))
            .catch(() => null)
    }, [inView, slug])

    if (!inView) return <div ref={ref} className="min-h-25" />
    if (!offer) return null

    const products = offer.products?.data ?? []

    return (
        <div ref={ref} className="w-full mt-6 bg-white border-y border-gray-100">

            {/* Main content row */}
            <div className="flex flex-col md:flex-row">

                {/* Left — content */}
                <div className="flex-1 px-6 py-8 md:px-10 md:py-10 flex flex-col justify-center gap-5">

                    <div className="inline-flex items-center gap-1.5 self-start px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border" style={{ color: 'var(--colour-fsP1)', borderColor: '#FFD6C0', background: '#FFF4EE' }}>
                        <Tag style={{ width: 9, height: 9 }} /> Special EMI Offer
                    </div>

                    <div>
                        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-gray-900 tracking-tight leading-tight">
                            {offer.name}
                        </h2>
                        <p className="text-gray-500 text-sm mt-2 max-w-sm leading-relaxed">
                            Exclusive deals on top gadgets — all available on easy EMI. No hidden charges, instant approval with partner banks.
                        </p>
                    </div>

                    {products.length > 0 && (
                        <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">
                            {products.length} products in this offer
                        </p>
                    )}

                    <div className="flex items-center gap-4">
                        <Link
                            href={`/offers/${offer.slug}`}
                            className="inline-flex items-center gap-2 h-10 px-5 rounded-xl text-white text-sm font-bold transition-opacity hover:opacity-90"
                            style={{ background: 'var(--colour-fsP2)' }}
                        >
                            <ShoppingBag style={{ width: 14, height: 14 }} /> Shop Offer
                        </Link>
                        <Link
                            href="/offers"
                            className="inline-flex items-center gap-1 text-sm font-semibold text-gray-500 hover:text-gray-800 transition-colors"
                        >
                            All deals <ArrowRight style={{ width: 13, height: 13 }} />
                        </Link>
                    </div>
                </div>

                {/* Right — banner image */}
                {offer.thumb?.url && (
                    <div className="md:w-72 lg:w-96 shrink-0 bg-[#F5F7FA] border-l border-gray-100 flex items-center justify-center p-8">
                        <div className="relative w-full aspect-square max-w-65">
                            <Image
                                src={offer.thumb.url}
                                alt={offer.thumb.alt_text ?? offer.name}
                                fill
                                sizes="(max-width: 768px) 80vw, 384px"
                                className="object-contain drop-shadow-xl"
                                priority
                            />
                        </div>
                    </div>
                )}
            </div>

            {/* Product strip */}
            {products.length > 0 && (
                <div className="border-t border-gray-100 px-6 md:px-10 py-4">
                    <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-1">
                        {products.map(p => (
                            <ProductCard key={p.id} p={p} />
                        ))}
                    </div>
                </div>
            )}
        </div>
    )
}
