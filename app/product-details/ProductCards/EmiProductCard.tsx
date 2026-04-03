'use client'

import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight, Clock3, CreditCard, Star, Truck } from 'lucide-react'
import banner2 from '@/public/imgfile/banner2.jpeg'
import type { ProductSummary } from '@/app/types/ProductDetailsTypes'
import { trackViewContent } from '@/lib/Analytic'
import { trackProductClick } from '@/lib/analytics'

export interface EmiProductCardProps {
    product: ProductSummary & { monthlyEmi: number; numericPrice: number }
    tenure: number
    zeroEmi: boolean
    downPayment: number
    index?: number
    priority?: boolean
}

const EmiProductCard = ({
    product,
    tenure,
    zeroEmi,
    downPayment,
    index = 0,
    priority = false,
}: EmiProductCardProps) => {
    if (!product?.id) return null

    const imgSrc = product.image?.thumb ?? product.image?.full ?? product.image?.preview ?? banner2
    const brandName = product.brand?.name ?? 'Featured'
    const originalPrice = Number(product.original_price ?? 0)
    const currentPrice = Number(product.numericPrice ?? 0)
    const hasDiscount = originalPrice > currentPrice && currentPrice > 0
    const discount = hasDiscount ? Math.round((1 - currentPrice / originalPrice) * 100) : 0
    const rating = Number(product.average_rating ?? 0)
    const productUrl = `/emi?slug=${product.slug}`

    return (
        <Link
            href={productUrl}
            onClick={() => {
                trackViewContent(product as never)
                trackProductClick({
                    id: product.id.toString(),
                    name: product.name,
                    price: currentPrice,
                    category: product.categories?.[0]?.title ?? '',
                })
            }}
            className="group relative flex h-full flex-col overflow-hidden rounded-[26px] border border-slate-200 bg-white transition-all duration-300 hover:-translate-y-1 hover:border-slate-300 hover:shadow-[0_20px_50px_-35px_rgba(15,23,42,0.35)]"
            style={{ animationDelay: `${(index % 12) * 40}ms` }}
        >
            <div className="relative aspect-square overflow-hidden bg-[linear-gradient(180deg,#f8fafc_0%,#eef3fb_100%)]">
                <div className="absolute left-3 top-3 z-10 flex flex-wrap gap-1.5">
                    {hasDiscount && (
                        <span className="rounded-full bg-rose-500 px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.14em] text-white">
                            -{discount}%
                        </span>
                    )}
                    {product.emi_enabled ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-[#e8f0fb] px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.14em] text-(--colour-fsP2)">
                            <CreditCard className="h-3 w-3" />
                            EMI
                        </span>
                    ) : null}
                </div>

                {rating > 0 ? (
                    <div className="absolute right-3 top-3 z-10 inline-flex items-center gap-1 rounded-full border border-amber-200 bg-white/95 px-2.5 py-1 text-[10px] font-black text-slate-700 shadow-sm">
                        <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                        {rating.toFixed(1)}
                    </div>
                ) : null}

                <Image
                    src={imgSrc}
                    alt={`${product.name} - ${brandName}`}
                    fill
                    priority={priority}
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
                    className="object-contain p-5 mix-blend-multiply transition-transform duration-500 group-hover:scale-105"
                />
            </div>

            <div className="flex flex-1 flex-col p-4">
                <p className="text-[10.5px] font-black uppercase tracking-[0.22em] text-slate-400">
                    {brandName}
                </p>

                <h3 className="mt-2 min-h-[42px] text-[14px] font-bold leading-snug text-slate-800 transition-colors group-hover:text-(--colour-fsP2)">
                    {product.name}
                </h3>

                <div className="mt-4 space-y-1">
                    <div className="flex items-end gap-2">
                        <p className="text-[21px] font-black tracking-tight text-slate-950">
                            Rs. {currentPrice.toLocaleString()}
                        </p>
                        {hasDiscount ? (
                            <p className="pb-0.5 text-[12px] font-bold text-slate-400 line-through">
                                Rs. {originalPrice.toLocaleString()}
                            </p>
                        ) : null}
                    </div>
                    <div className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-[0.16em] text-(--colour-fsP1)">
                        <Truck className="h-3 w-3" />
                        Free delivery
                    </div>
                </div>

                <div className="mt-4 rounded-[22px] border border-blue-100 bg-[linear-gradient(135deg,#eef5ff_0%,#ffffff_100%)] p-3.5">
                    <div className="flex items-start justify-between gap-3">
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-500">Monthly EMI</p>
                            <p className="mt-1 text-[20px] font-black tracking-tight text-(--colour-fsP2)">
                                Rs. {product.monthlyEmi.toLocaleString()}
                                <span className="ml-1 text-[11px] font-bold uppercase tracking-[0.12em] text-slate-400">/ month</span>
                            </p>
                        </div>
                        <div className="rounded-2xl bg-white px-2.5 py-2 text-center shadow-sm">
                            <div className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-[0.16em] text-slate-500">
                                <Clock3 className="h-3 w-3" />
                                {tenure}M
                            </div>
                        </div>
                    </div>

                    <div className="mt-3 flex flex-wrap gap-2">
                        <span className={`rounded-full px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.16em] ${zeroEmi ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>
                            {zeroEmi ? '0% EMI View' : 'Standard EMI'}
                        </span>
                        {downPayment > 0 ? (
                            <span className="rounded-full bg-white px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.16em] text-slate-600">
                                DP Rs. {downPayment.toLocaleString()}
                            </span>
                        ) : null}
                    </div>
                </div>

                <div className="mt-auto flex items-center justify-between border-t border-slate-100 pt-4">
                    <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-slate-400">
                        Open EMI details
                    </p>
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-950 px-3 py-2 text-[11px] font-black uppercase tracking-[0.14em] text-white transition group-hover:bg-(--colour-fsP2)">
                        Apply
                        <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                    </span>
                </div>
            </div>
        </Link>
    )
}

export const EmiProductCardSkeleton = () => (
    <div className="h-full overflow-hidden rounded-[26px] border border-slate-200 bg-white">
        <div className="aspect-square animate-pulse bg-slate-100" />
        <div className="space-y-3 p-4">
            <div className="h-3 w-16 animate-pulse rounded bg-slate-100" />
            <div className="h-4 w-full animate-pulse rounded bg-slate-100" />
            <div className="h-4 w-3/4 animate-pulse rounded bg-slate-100" />
            <div className="h-6 w-28 animate-pulse rounded bg-slate-100" />
            <div className="rounded-[22px] bg-slate-50 p-3">
                <div className="h-5 w-32 animate-pulse rounded bg-slate-100" />
                <div className="mt-3 h-4 w-24 animate-pulse rounded bg-slate-100" />
            </div>
            <div className="h-10 w-full animate-pulse rounded-full bg-slate-100" />
        </div>
    </div>
)

export default EmiProductCard
