import type { Metadata } from 'next'

import ExchangeClient from './ExchangeClient'
import { getAllCategories, getCategoryProducts } from '../api/services/category.service'
import type { NavbarItem } from '../context/navbar.interface'
import type { ProductListItem } from './exchange-helpers'
import { cacheLife, cacheTag } from 'next/cache'
import { Suspense } from 'react'

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

async function ExchangePageContent() {
    const categories = await getCachedCategories()
    let initialProducts: ProductListItem[] = []

    if (categories.length > 0) {
        // Find the first "Mobile" or "Laptop" category to use for initial products
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

    const blogSection = <OurArticlesSectionClient />

    return (
        <ExchangeClient
            categories={categories}
            initialProducts={initialProducts}
            bannerSection={bannerSection}
            blogSection={blogSection}
        />
    )
}

export default function ExchangePage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-[#F5F7FA] flex flex-col items-center justify-center p-4">
                <div className="w-full max-w-lg space-y-8 animate-in fade-in duration-700">
                    <div className="space-y-6 text-center">
                        <div className="w-20 h-20 border-4 border-blue-500 border-t-transparent rounded-[24px] animate-spin mx-auto shadow-xl shadow-blue-500/10"></div>
                        <h2 className="text-3xl font-black text-gray-900 tracking-tight">Fatafat Exchange</h2>
                        <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">AI Evaluation System Synchronizing...</p>
                    </div>
                </div>
            </div>
        }>
            <ExchangePageContent />
        </Suspense>
    )
}