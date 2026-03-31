'use client'

import React from 'react'
import { ChevronRight } from 'lucide-react'
import type { NavbarItem } from '@/app/context/navbar.interface'
import type { FullProduct } from '../exchange-helpers'

interface ExchangeBreadcrumbProps {
    selectedCategory: NavbarItem | null
    selectedBrand: string
    selectedProduct: FullProduct | null
}

export default function ExchangeBreadcrumb({
    selectedCategory,
    selectedBrand,
    selectedProduct
}: ExchangeBreadcrumbProps) {
    return (
        <div className="flex items-center gap-2 mb-5 text-xs font-bold text-gray-400">
            <span>Exchange</span>
            {selectedCategory && (
                <>
                    <ChevronRight style={{ width: 12, height: 12 }} />
                    <span style={{ color: 'var(--colour-fsP2)' }}>{selectedCategory.title}</span>
                </>
            )}
            {selectedBrand && selectedCategory && (
                <>
                    <ChevronRight style={{ width: 12, height: 12 }} />
                    <span style={{ color: 'var(--colour-fsP2)' }}>
                        {selectedCategory.brands?.find(b => b.slug === selectedBrand)?.name || selectedBrand}
                    </span>
                </>
            )}
            {selectedProduct && (
                <>
                    <ChevronRight style={{ width: 12, height: 12 }} />
                    <span className="text-gray-600 line-clamp-1 max-w-[120px]">{selectedProduct.name}</span>
                </>
            )}
        </div>
    )
}
