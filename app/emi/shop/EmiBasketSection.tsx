'use client'

import React, { useMemo } from 'react'
import LazySection from '@/components/LazySection'
import SectionHeader from '@/app/blogs/components/SectionHeader'
import BlogProductBasket from '@/app/blogs/components/BlogProductBasket'
import { getCategoryProducts } from '@/app/api/services/category.service'
import type { ProductSummary } from '@/app/types/ProductDetailsTypes'

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

const ensureArray = (data: any) => {
    if (!data) return []
    if (Array.isArray(data)) return data
    return data.data?.products || data.data?.data || data.products || data.data || []
}

export default function EmiBasketSection({
    slug,
    title,
    brandSlug,
    initialData,
}: Props) {
    const emiFetcher = useMemo(() => () => 
        getCategoryProducts(slug, { 
            page: 1, 
            per_page: 5, 
            emi_enabled: true, 
            brand: brandSlug 
        }), 
    [slug, brandSlug])

    return (
        <LazySection
            fetcher={emiFetcher}
            initialData={initialData}
            render={(data) => {
                const finalProducts = ensureArray(data).slice(0, 5)

                return (
                    <section id={`${slug}-emi-deals`} className="w-full">
                        <SectionHeader
                            title={title}
                            accentColor="var(--colour-fsP2)"
                            linkHref={`/category/${slug}`}
                            linkText="View More"
                        />
                        <div className="w-full">
                            <BlogProductBasket
                                slug={slug}
                                id={`${slug}-b-1`}
                                data={finalProducts}
                                random={true}
                                isEmi={true}
                            />
                        </div>
                    </section>
                )
            }}
            fallback={<div className="h-95 bg-(--colour-bg4) rounded-lg animate-pulse" />}
        />
    )
}
