'use client'

import { cn } from '@/lib/utils'
import { Star, CreditCard, Clock, ArrowRight } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { ProductSummary } from '@/app/types/ProductDetailsTypes'

// ─── Types ───────────────────────────────────────────────────
export interface EmiProductCardProps {
    product: ProductSummary & { monthlyEmi: number; numericPrice: number }
    tenure: number
    zeroEmi: boolean
    downPayment: number
    index?: number
    priority?: boolean
}

// ─── Component ───────────────────────────────────────────────
const EmiProductCard = ({
    product,
    tenure,
    zeroEmi,
    downPayment,
    index,
    priority = false,
}: EmiProductCardProps) => {
    if (!product || !product.id) return null

    const imgSrc = product.image?.thumb || product.image?.full || product.image?.preview || '/imgfile/banner_2.png'
    const brandName = product.brand?.name || ''
    const originalPrice = Number(product.original_price) || 0
    const discount = originalPrice && product.numericPrice < originalPrice
        ? Math.round((1 - product.numericPrice / originalPrice) * 100)
        : 0
    const rating = product.average_rating || (4 + Math.random()).toFixed(1)
    const productUrl = `/emi?slug=${product.slug}`

    return (
        <div
            data-track={`emi-card-${product.id}`}
            className="group relative w-full flex flex-col bg-white h-full shadow-sm hover:shadow-[0_0_20px_rgba(0,0,0,0.1)] hover:border-[var(--colour-fsP2)]/30 hover:-translate-y-1 transition-all duration-300 rounded-[12px] overflow-hidden border border-gray-100"
        >
            {/* ── Image ── */}
            <div className="relative aspect-[5/4] w-full bg-white p-2">
                {/* Badges - Top Left */}
                <div className="absolute top-0 left-0 z-10 flex flex-col gap-1">
                    {discount > 0 && (
                        <div className="bg-red-500 text-white text-[10px] font-bold px-3 py-1 rounded-tl-[10px] rounded-br-[10px] shadow-sm">
                            {discount}% OFF
                        </div>
                    )}
                </div>

                {/* EMI badge - Top Right */}
                {product.emi_enabled === 1 && (
                    <div className="absolute top-2 right-2 z-10 flex items-center gap-0.5 bg-[var(--colour-fsP2)] text-white text-[9px] font-bold px-1.5 py-0.5 rounded shadow-sm">
                        <CreditCard className="w-2.5 h-2.5" /> EMI
                    </div>
                )}

                <div className="relative w-full h-full">
                    <Image
                        src={imgSrc}
                        alt={`${product.name} - ${brandName}`}
                        fill
                        className="object-contain mix-blend-multiply transition-transform duration-500 group-hover:scale-105"
                        priority={priority}
                        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
                        unoptimized
                    />
                </div>
            </div>

            {/* ── Content ── */}
            <div className="p-2 flex flex-col gap-0.5 flex-grow">
                {/* Brand + Rating */}
                <div className="flex justify-between items-start">
                    <span className="text-[11px] text-gray-700 font-bold uppercase tracking-wide">
                        {brandName || 'Brand'}
                    </span>
                    <div className="flex items-center gap-0.5 bg-[var(--colour-fsP2)] text-white px-1.5 py-0.5 rounded-[4px] shadow-sm">
                        <span className="text-[10px] font-extrabold">{rating}</span>
                        <Star className="w-2 h-2 fill-current" />
                    </div>
                </div>

                {/* Title */}
                <h3
                    className="text-[13px] sm:text-[14px] font-bold text-gray-800 leading-snug line-clamp-2 min-h-[2.6em] group-hover:text-[var(--colour-fsP2)] transition-colors mt-0.5"
                    title={product.name}
                >
                    <Link href={productUrl} className="focus:outline-none">
                        <span aria-hidden="true" className="absolute inset-0 z-10" />
                        {product.name}
                    </Link>
                </h3>

                {/* Price */}
                <div className="mt-1 space-y-0.5">
                    <div className="flex items-baseline gap-2">
                        <span className="text-base sm:text-lg font-extrabold text-[#1f2937]">
                            Rs. {product.numericPrice.toLocaleString()}
                        </span>
                    </div>
                    {originalPrice > product.numericPrice && (
                        <div className="flex items-center gap-2 text-[14px]">
                            <span className="text-gray-500 line-through decoration-gray-500 font-medium">
                                Rs. {originalPrice.toLocaleString()}
                            </span>
                            {discount > 0 && (
                                <span className="text-[var(--colour-fsP2)] font-bold bg-blue-50 px-1 py-0.5 rounded-sm text-[12px]">
                                    {discount}% OFF
                                </span>
                            )}
                        </div>
                    )}
                </div>

                {/* ── EMI Section ── */}
                <div className="mt-1.5 space-y-1.5">
                    {/* EMI Monthly badge */}
                    <div className="flex flex-wrap gap-1">
                        <span className="inline-flex items-center text-[12px] font-semibold text-white bg-[#1967b3] px-1.5 py-0.5 rounded-sm shadow-sm">
                            EMI Rs. {product.monthlyEmi.toLocaleString()}/mo
                        </span>
                        <span className="inline-flex items-center text-[11px] font-semibold text-gray-600 bg-gray-100 px-1.5 py-0.5 rounded-sm">
                            <Clock className="w-3 h-3 mr-0.5" /> {tenure} mon
                        </span>
                    </div>

                    {/* EMI info chips */}
                    <div className="flex flex-wrap gap-1">
                        {zeroEmi ? (
                            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded-sm">
                                ✓ 0% Interest
                            </span>
                        ) : (
                            <span className="text-[10px] font-medium text-amber-700 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded-sm">
                                With Interest
                            </span>
                        )}
                        {downPayment > 0 && (
                            <span className="text-[10px] font-medium text-gray-600 bg-gray-50 border border-gray-200 px-1.5 py-0.5 rounded-sm">
                                DP: Rs. {downPayment.toLocaleString()}
                            </span>
                        )}
                    </div>

                    {/* Apply CTA */}
                    <div className="pt-0.5">
                        <span className="inline-flex items-center gap-1 text-[12px] font-bold text-[var(--colour-fsP2)] group-hover:underline">
                            Apply for EMI <ArrowRight className="w-3 h-3 transition-transform group-hover:translate-x-0.5" />
                        </span>
                    </div>
                </div>
            </div>
        </div>
    )
}

// ─── Skeleton ────────────────────────────────────────────────
export const EmiProductCardSkeleton = () => (
    <div className="bg-white rounded-[12px] overflow-hidden border border-gray-100 h-full">
        <div className="aspect-[5/4] bg-gray-50 animate-pulse" />
        <div className="p-2 space-y-2">
            <div className="flex justify-between">
                <div className="h-3 w-16 bg-gray-200 rounded animate-pulse" />
                <div className="h-3 w-10 bg-gray-200 rounded animate-pulse" />
            </div>
            <div className="h-4 w-full bg-gray-200 rounded animate-pulse" />
            <div className="h-4 w-3/4 bg-gray-200 rounded animate-pulse" />
            <div className="h-5 w-24 bg-gray-200 rounded animate-pulse mt-1" />
            <div className="flex gap-1 mt-1">
                <div className="h-5 w-28 bg-blue-100 rounded animate-pulse" />
                <div className="h-5 w-16 bg-gray-100 rounded animate-pulse" />
            </div>
            <div className="h-3 w-20 bg-gray-200 rounded animate-pulse" />
        </div>
    </div>
)

export default EmiProductCard
