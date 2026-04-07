'use client'

import React, { useMemo } from 'react'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import LazySection from '@/components/LazySection'
import EmiProductCard from './EmiProductCard'
import { getCategoryProducts } from '@/app/api/services/category.service'

interface Props {
    slug: string
    title: string
    brandSlug?: string
    budget?: number
    tenure?: number
    downPayment?: number
    zeroEmi?: boolean
    emiPlan?: 'standard' | 'apple_zero' | 'citizens_0_40'
    initialData?: any
    badge?: string
}

const ensureArray = (data: any): any[] => {
    if (!data) return []
    if (Array.isArray(data)) return data
    return data.data?.products || data.data?.data || data.products || data.data || []
}

const Skeleton = () => (
    <div className="flex flex-col bg-white border border-(--colour-border3) rounded-2xl overflow-hidden animate-pulse">
        <div className="aspect-square bg-(--colour-bg4)" />
        <div className="p-3 flex flex-col gap-2">
            <div className="h-2.5 w-3/4 rounded-full bg-gray-100" />
            <div className="h-2.5 w-full rounded-full bg-gray-100" />
            <div className="h-3 w-1/2 rounded-full bg-gray-100 mt-1" />
            <div className="h-5 w-2/3 rounded-lg bg-gray-100 mt-0.5" />
        </div>
    </div>
)

export default function EmiBasketSection({ slug, title, brandSlug, initialData, badge }: Props) {
    const fetcher = useMemo(() => () =>
        getCategoryProducts(slug, { page: 1, per_page: 5, emi_enabled: true, brand: brandSlug }),
        [slug, brandSlug]
    )

    return (
        <LazySection
            fetcher={fetcher}
            initialData={initialData}
            render={(data) => {
                const products = ensureArray(data)
                if (!products.length) return null

                return (
                    <section id={`${slug}-emi`} className="w-full">
                        {/* Section header */}
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-3">
                                <div className="w-1 h-5 rounded-full" style={{ background: 'var(--colour-fsP1)' }} />
                                <h2 className="text-lg font-bold text-(--colour-text1)">{title}</h2>

                            </div>
                   
                        </div>

                        {/* Grid */}
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                            {products.map((p: any, i: number) => (
                                <EmiProductCard key={p.slug ?? i} product={p} priority={i < 4} />
                            ))}
                        </div>
                    </section>
                )
            }}
            fallback={
                <div>
                    <div className="h-6 w-64 rounded-full bg-gray-100 animate-pulse mb-4" />
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                        {Array.from({ length: 4 }, (_, i) => <Skeleton key={i} />)}
                    </div>
                </div>
            }
        />
    )
}
