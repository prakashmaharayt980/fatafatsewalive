'use client'

import React from 'react'
import Image from 'next/image'
import { ArrowRight } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Props {
    product: any
    selectedBrand?: string
    onSelect: (product: any) => void
    isSelected?: boolean
    getProductImage: (product: any) => string
}

export default function RepairProductCard({
    product,
    selectedBrand,
    onSelect,
    isSelected = false,
    getProductImage,
}: Props) {
    const brandName = product.brand?.name ?? selectedBrand

    return (
        <button
            onClick={() => onSelect(product)}
            className={cn(
                'group flex flex-col text-left rounded-2xl border overflow-hidden bg-white transition-all duration-300 hover:border-gray-200 hover:shadow-[0_8px_32px_rgba(0,0,0,0.08)] h-full',
                isSelected ? 'border-[var(--colour-fsP2)]' : 'border-gray-100'
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
            <div className="p-3.5 flex flex-col flex-1 gap-1.5">
                {brandName && (
                    <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 truncate">{brandName}</p>
                )}
                <p className={cn(
                    'text-[13px] font-bold leading-snug line-clamp-2 transition-colors min-h-[2.4rem]',
                    isSelected ? 'text-[var(--colour-fsP2)]' : 'text-gray-800 group-hover:text-[var(--colour-fsP2)]'
                )}>
                    {product.name}
                </p>
                <div className="mt-auto pt-2.5 border-t border-gray-50 flex items-center justify-between">
                    <div>
                        <p className="text-[9.5px] font-bold uppercase tracking-wide text-gray-400">Professional</p>
                        <p className="text-[13px] font-bold tracking-tight text-gray-900">
                            Service Request
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
    )
}
