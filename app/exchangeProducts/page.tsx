import type { Metadata } from 'next'

import ExchangeClient from './ExchangeClient'
import { getAllCategories, getCategoryProducts } from '../api/services/category.service'
import type { NavbarItem } from '../context/navbar.interface'
import type { ProductListItem } from './exchange-helpers'
import { cacheLife, cacheTag } from 'next/cache'
import { Suspense, type ReactNode } from 'react'

import LazySection from '@/components/LazySection'
import BannerSectionServer from '@/components/BannerSectionServer'
import OurArticlesSectionClient from '@/components/OurArticlesSectionClient'

// ── Cached Data Fetchers ────────────────────────────────────

export const metadata: Metadata = {
    title: 'Mobile Exchange — Trade In Your Old Phone | Fatafat Sewa',
    description:
        'Get the best value for your old mobile phone with Fatafat Sewa\'s exchange program. Instant price quotes, free pickup, and easy upgrade to the latest smartphones.',
    keywords: [
        'mobile exchange',
        'phone trade in',
        'old phone exchange',
        'phone exchange Nepal',
        'sell old phone',
        'Fatafat Sewa exchange',
        'smartphone upgrade',
    ],
    openGraph: {
        title: 'Mobile Exchange — Trade In Your Old Phone | Fatafat Sewa',
        description:
            'Trade in your old mobile phone and upgrade to the latest smartphones. Get instant price quotes and free pickup from Fatafat Sewa.',
        type: 'website',
        url: 'https://fatafatsewa.com/exchangeProducts',
        images: [{ url: '/imgfile/logoimg.png', width: 600, height: 600, alt: 'Fatafat Sewa Mobile Exchange' }],
    },
    twitter: {
        card: 'summary_large_image',
        title: 'Mobile Exchange — Trade In Your Old Phone | Fatafat Sewa',
        description: 'Get the best value for your old phone. Instant quotes, free pickup.',
    },
    alternates: {
        canonical: 'https://fatafatsewa.com/exchangeProducts',
    },
}


async function getCachedCategories() {
    try {
        const res = await getAllCategories()
        return (res?.data || []) as NavbarItem[]
    } catch (err) {
        console.error('Failed to fetch categories:', err)
        return []
    }
}

async function getCachedInitialProducts(categorySlug: string, brandSlug?: string) {
    try {
        const productsRes = await getCategoryProducts(categorySlug, { brand: brandSlug, exchange_available: true, per_page: 10 })
        const products = (productsRes?.data?.products || []) as ProductListItem[]
        return products
    } catch (err) {
        console.error('Failed to fetch initial products:', err)
        return []
    }
}

// ── Page Content ───────────────────────────────────────────

async function ExchangePageContent({ blogSection }: { blogSection: ReactNode }) {
    'use cache'
    cacheLife('hours')
    cacheTag('exchange-discovery')

    const categories = await getCachedCategories()
    let initialProducts: ProductListItem[] = []

    if (categories.length > 0) {
        const firstValidCat = categories.find(cat =>
            cat.title?.toLowerCase().includes('mobile') ||
            cat.title?.toLowerCase().includes('laptop') ||
            cat.title?.toLowerCase().includes('smartphone') ||
            cat.title?.toLowerCase().includes('macbook') ||
            cat.slug?.toLowerCase().includes('mobile') ||
            cat.slug?.toLowerCase().includes('laptop') ||
            cat.slug?.toLowerCase().includes('smartphone') ||
            cat.slug?.toLowerCase().includes('macbook')
        ) || categories[0]

        const firstBrand = firstValidCat.brands && firstValidCat.brands.length > 0 ? firstValidCat.brands[0].slug : undefined
        initialProducts = await getCachedInitialProducts(firstValidCat.slug, firstBrand)
    }

    const bannerSection = (
        <LazySection
            fallback={<div className="w-full aspect-[1000/250] bg-gray-100 animate-pulse rounded" />}
            aspectRatio="1000/250"
            rootMargin="800px"
        >
            <BannerSectionServer slug="home-banner-fourth-test" type="Bannerfooter" />
        </LazySection>
    )

    return (
        <ExchangeClient
            categories={categories}
            initialProducts={initialProducts}
            bannerSection={bannerSection}
            blogSection={blogSection}
        />
    )
}

async function ExchangePageWrapper() {
    const blogSection = (
        <Suspense fallback={<div className="h-40 w-full animate-pulse bg-gray-50 border border-gray-100 rounded-2xl" />}>
            <OurArticlesSectionClient />
        </Suspense>
    )
    return <ExchangePageContent blogSection={blogSection} />
}

export default function ExchangePage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-[#F5F7FA] flex flex-col">
                {/* Hero Skeleton (White) */}
                <div className="bg-white border-b border-gray-100 py-12 md:py-16">
                    <div className="max-w-7xl mx-auto px-4 lg:px-8 flex flex-col md:flex-row items-center gap-12">
                        <div className="flex-1 space-y-6">
                            <div className="h-6 w-40 bg-gray-100 rounded-full animate-pulse" />
                            <div className="space-y-3">
                                <div className="h-10 w-[85%] bg-gray-100 rounded-xl animate-pulse" />
                                <div className="h-10 w-[60%] bg-gray-100 rounded-xl animate-pulse" />
                            </div>
                            <div className="h-16 w-[75%] bg-gray-50 rounded-xl animate-pulse" />
                            <div className="flex gap-4">
                                <div className="h-12 w-48 bg-gray-100 rounded-xl animate-pulse" />
                                <div className="h-12 w-40 bg-gray-100 rounded-xl animate-pulse" />
                            </div>
                        </div>
                        <div className="w-64 h-64 bg-gray-50 rounded-full animate-pulse hidden md:block" />
                    </div>
                </div>

                {/* Content Area Skeleton (Gray) */}
                <div className="flex-1  py-8">
                    <div className="max-w-7xl mx-auto space-y-6">
                        <div className="h-4  bg-gray-200/60 rounded-full animate-pulse" />
                        <div className="w-full h-[600px] bg-white  border-none border-gray-100 animate-pulse flex flex-col p-6 space-y-8">
                            <div className="h-4 w-28 bg-gray-100 rounded-full" />
                            <div className="grid grid-cols-2 gap-4">
                                <div className="h-32 bg-gray-50 rounded-xl" />
                                <div className="h-32 bg-gray-50 rounded-xl" />
                                <div className="h-32 bg-gray-50 rounded-xl" />
                                <div className="h-32 bg-gray-50 rounded-xl" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        }>
            <ExchangePageWrapper />
        </Suspense>
    )
}