'use client'

import React from 'react'
import { ChevronRight } from 'lucide-react'

interface RepairBreadcrumbProps {
    selectedBrand: string
    selectedProduct: string | null
}

export default function RepairBreadcrumb({
    selectedBrand,
    selectedProduct
}: RepairBreadcrumbProps) {
    return (
        <div className="flex items-center gap-2 mb-5 text-xs font-bold text-gray-400">
            <span>Repair</span>
            {selectedBrand && (
                <>
                    <ChevronRight style={{ width: 12, height: 12 }} />
                    <span style={{ color: 'var(--colour-fsP2)' }}>{selectedBrand.charAt(0).toUpperCase() + selectedBrand.slice(1)}</span>
                </>
            )}
            {selectedProduct && (
                <>
                    <ChevronRight style={{ width: 12, height: 12 }} />
                    <span className="text-gray-600 line-clamp-1 max-w-[120px]">{selectedProduct}</span>
                </>
            )}
        </div>
    )
}
