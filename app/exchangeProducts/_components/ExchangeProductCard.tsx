'use client'

import React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight, ShoppingBag } from 'lucide-react'
import { cn } from '@/lib/utils'
import { getMaxExchangeValue, type ProductListItem } from '../exchange-helpers'

interface Props {
    product: ProductListItem
    selectedBrand?: string
    onSelect: (product: ProductListItem) => void
    isSelected?: boolean
    variant?: 'catalog' | 'compact'
}

export default function ExchangeProductCard({
    product,
    selectedBrand,
    onSelect,
    isSelected = false,
    variant = 'catalog'
}: Props) {
    const maxVal = getMaxExchangeValue(product.discounted_price ?? product.price, product.created_at)
    const brandName = product.brand?.name ?? selectedBrand

    const getProductImage = (p: any) => {
        if (!p) return ''
        if (typeof p.image === 'string') return p.image
        return p.image?.thumb ?? p.image?.full ?? ''
    }

    if (variant === 'compact') {
        return (
            <button
                onClick={() => onSelect(product)}
                className={cn(
                    'group flex flex-col text-left rounded-2xl border overflow-hidden bg-white transition-all duration-300 hover:border-gray-200 hover:shadow-[0_8px_32px_rgba(0,0,0,0.08)]',
                    isSelected ? 'border-(--colour-fsP2)' : 'border-gray-100'
                )}
            >
                <div className="w-full aspect-square relative bg-gray-50 overflow-hidden">
                    <Image
                        src={getProductImage(product)}
                        alt={product.name}
                        fill
                        className="object-contain p-4 mix-blend-multiply transition-transform duration-500 group-hover:scale-105"
                        sizes="(max-width: 640px) 50vw, 20vw"
                    />
                </div>
                <div className="p-3 flex flex-col flex-1 gap-1.5">
                    {brandName && (
                        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 truncate">{brandName}</p>
                    )}
                    <p className={cn(
                        'text-[12px] font-bold leading-snug line-clamp-2 transition-colors min-h-[2.4rem]',
                        isSelected ? 'text-(--colour-fsP2)' : 'text-gray-800 group-hover:text-(--colour-fsP2)'
                    )}>
                        {product.name}
                    </p>
                    <div className="mt-auto pt-2 border-t border-gray-50 flex items-center justify-between">
                        <div>
                            <p className="text-[9px] font-bold uppercase tracking-wide text-gray-400">Up to</p>
                            <p className="text-sm font-bold tracking-tight" style={{ color: 'var(--colour-fsP2)' }}>
                                Rs. {maxVal.toLocaleString()}
                            </p>
                        </div>
                        <div
                            className="w-7 h-7 rounded-full text-white flex items-center justify-center shrink-0"
                            style={{ background: 'var(--colour-fsP2)' }}
                        >
                            <ArrowRight size={12} />
                        </div>
                    </div>
                </div>
            </button>
        )
    }

    return (
        <div className="group flex flex-col bg-white rounded-2xl border border-gray-100 hover:border-gray-200 hover:shadow-[0_8px_32px_rgba(0,0,0,0.08)] transition-all duration-300 overflow-hidden h-full">
            <button
                onClick={() => onSelect(product)}
                className="w-full text-left flex-1 flex flex-col cursor-pointer"
            >
                <div className="relative aspect-square w-full bg-gray-50 overflow-hidden">
                    <Image
                        src={getProductImage(product)}
                        alt={product.name}
                        fill
                        className="object-contain p-4 mix-blend-multiply transition-transform duration-500 group-hover:scale-105"
                        sizes="(max-width: 640px) 50vw, 20vw"
                    />
                </div>
                <div className="flex flex-col flex-1 p-3.5 pt-3">
                    {brandName && (
                        <p className="text-[10.5px] font-bold uppercase tracking-widest text-gray-400 truncate mb-1">{brandName}</p>
                    )}
                    <p className="text-[13px] font-bold text-gray-800 leading-snug line-clamp-2 min-h-9 mb-auto group-hover:text-(--colour-fsP2) transition-colors">
                        {product.name}
                    </p>
                    <div className="mt-2.5 pt-2.5 border-t border-gray-50 flex items-center justify-between">
                        <div>
                            <p className="text-[9.5px] font-bold uppercase tracking-wide text-gray-400">Exchange up to</p>
                            <p className="text-[15px] font-bold tracking-tight" style={{ color: 'var(--colour-fsP2)' }}>
                                Rs. {maxVal.toLocaleString()}
                            </p>
                        </div>
                        <div
                            className="w-8 h-8 rounded-full text-white flex items-center justify-center shrink-0 shadow-sm"
                            style={{ background: 'var(--colour-fsP2)' }}
                        >
                            <ArrowRight size={14} />
                        </div>
                    </div>
                </div>
            </button>

            <div className="px-3.5 pb-3.5">
                <Link
                    href={`/product-details/${product.slug}`}
                    onClick={e => e.stopPropagation()}
                    className="w-full h-9 text-[10px] font-bold uppercase tracking-widest rounded-xl border border-gray-100 text-gray-500 hover:border-(--colour-fsP2) hover:text-(--colour-fsP2) transition-colors flex items-center justify-center gap-1.5"
                >
                    <ShoppingBag size={11} />
                    Buy at retail price
                </Link>
            </div>
        </div>
    )
}
