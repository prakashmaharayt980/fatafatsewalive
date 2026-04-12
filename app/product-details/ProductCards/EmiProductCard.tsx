'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Star, Zap } from 'lucide-react'
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

    const imgSrc = product.thumb?.url ?? product.image?.thumb ?? product.image?.full ?? banner2
    const brandName = product.brand?.name ?? 'Featured'
    const originalPrice = Number(product.price?.original_price ?? 0)
    const currentPrice = Number(product.numericPrice ?? product.price?.current ?? 0)
    const hasDiscount = originalPrice > currentPrice && currentPrice > 0
    const discount = hasDiscount ? Math.round((1 - currentPrice / originalPrice) * 100) : 0
    const rating = Number(product.average_rating ?? 0)
    const productUrl = `/emi?slug=${product.slug}`

    const handleClick = () => {
        trackViewContent(product as never)
        trackProductClick({
            id: product.id.toString(),
            name: product.name,
            price: currentPrice,
            category: product.categories?.[0]?.title ?? '',
        })
    }

    return (
        <Link
            href={productUrl}
            onClick={handleClick}
            className="group relative flex flex-col w-full bg-white border border-gray-200 rounded-xl overflow-hidden hover:border-gray-300 hover:shadow-md transition-all duration-200"
            style={{ animationDelay: `${(index % 12) * 40}ms` }}
        >
            {/* Discount badge */}
            {hasDiscount && (
                <div className="absolute top-2 left-2 z-10 bg-rose-500 text-white text-[10px] font-bold px-2 py-0.5 rounded">
                    -{discount}%
                </div>
            )}

            {/* 0% EMI badge */}
            {zeroEmi && (
                <div className="absolute top-2 right-2 z-10 flex items-center gap-0.5 bg-emerald-500 text-white text-[10px] font-bold px-2 py-0.5 rounded">
                    <Zap className="h-2.5 w-2.5 fill-white" />
                    0%
                </div>
            )}

            {/* Image */}
            <div className="relative w-full aspect-square bg-gray-50 p-3">
                <Image
                    src={imgSrc}
                    alt={product.name}
                    fill
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 20vw"
                    className="object-contain transition-transform duration-300 group-hover:scale-[1.03]"
                    priority={priority && index < 4}
                    loading={priority && index < 4 ? undefined : 'lazy'}
                />
            </div>

            {/* Content */}
            <div className="flex flex-col gap-1 p-3 flex-grow border-t border-gray-100">
                {/* Brand + Rating */}
                <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                        {brandName}
                    </span>
                    {rating > 0 && (
                        <span className="flex items-center gap-0.5 text-[10px] font-bold text-amber-500">
                            <Star className="w-2.5 h-2.5 fill-amber-400 stroke-amber-400" />
                            {rating.toFixed(1)}
                        </span>
                    )}
                </div>

                {/* Product Name */}
                <h3
                    className="text-[12px] font-semibold text-gray-800 leading-snug line-clamp-2 min-h-[2.6em]"
                    title={product.name}
                >
                    {product.name}
                </h3>

                {/* Price */}
                <div className="flex items-baseline gap-1.5 mt-0.5">
                    <span className="text-sm font-black text-gray-900">
                        Rs. {currentPrice.toLocaleString()}
                    </span>
                    {hasDiscount && (
                        <span className="text-[10px] font-medium text-gray-400 line-through">
                            Rs. {originalPrice.toLocaleString()}
                        </span>
                    )}
                </div>

                {/* EMI pill */}
                {product.monthlyEmi > 0 && (
                    <div className="mt-auto pt-2">
                        <div className="flex items-center justify-between rounded-lg bg-slate-50 border border-slate-200 px-2.5 py-1.5">
                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">EMI/{tenure}M</span>
                            <span className="text-[12px] font-black text-slate-900">
                                Rs. {product.monthlyEmi.toLocaleString()}
                            </span>
                        </div>
                        {downPayment > 0 && (
                            <p className="text-[9px] font-medium text-gray-400 mt-1 text-right">
                                Down: Rs. {downPayment.toLocaleString()}
                            </p>
                        )}
                    </div>
                )}
            </div>
        </Link>
    )
}

export const EmiProductCardSkeleton = () => (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
        <div className="aspect-square animate-pulse bg-slate-100" />
        <div className="space-y-2 p-3 border-t border-gray-100">
            <div className="h-2 w-14 animate-pulse rounded bg-slate-100" />
            <div className="h-3.5 w-full animate-pulse rounded bg-slate-100" />
            <div className="h-3.5 w-3/4 animate-pulse rounded bg-slate-100" />
            <div className="h-4 w-2/3 animate-pulse rounded bg-slate-100" />
            <div className="h-8 w-full animate-pulse rounded-lg bg-slate-100 mt-1" />
        </div>
    </div>
)

export default EmiProductCard
