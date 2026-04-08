import type { Metadata } from 'next'
import ExchangeClient from './ExchangeClient'
import { getAllCategories, getCategoryProducts } from '../api/services/category.service'
import type { NavbarItem } from '../context/navbar.interface'
import { IS_EXCHANGE_CATEGORY, type ProductListItem } from './exchange-helpers'
import { Suspense, type ReactNode } from 'react'
import UnderConstruction from '@/components/UnderConstruction'

import LazySection from '@/components/LazySection'
import BannerSectionServer from '@/components/BannerSectionServer'
import OurArticlesSection from '@/components/OurArticlesSection'

export const metadata: Metadata = {
    title: 'Mobile Exchange — Trade In Your Old Phone | Fatafat Sewa',
    description: 'Get the best value for your old mobile phone with Fatafat Sewa\'s exchange program. Instant price quotes, free pickup, and easy upgrade to the latest smartphones.',
    keywords: [
        'mobile exchange', 'phone trade in', 'old phone exchange', 'phone exchange Nepal',
        'sell old phone', 'Fatafat Sewa exchange', 'smartphone upgrade',
    ],
    openGraph: {
        title: 'Mobile Exchange — Trade In Your Old Phone | Fatafat Sewa',
        description: 'Trade in your old mobile phone and upgrade to the latest smartphones. Get instant price quotes and free pickup from Fatafat Sewa.',
        type: 'website',
        url: 'https://fatafatsewa.com/exchangeProducts',
        images: [{ url: '/imgfile/logoimg.png', width: 600, height: 600, alt: 'Fatafat Sewa Mobile Exchange' }],
    },
}

async function getCategories() {
    try {
        const res = await getAllCategories()
        return (res?.data ?? []) as NavbarItem[]
    } catch (err) {
        console.error('Failed to fetch categories:', err)
        return []
    }
}

async function getInitialProducts(categorySlug: string, brandSlug?: string) {
    try {
        const productsRes = await getCategoryProducts(categorySlug, { brand: brandSlug, exchange_available: true, per_page: 10 })
        return (productsRes?.data?.products ?? []) as ProductListItem[]
    } catch (err) {
        console.error('Failed to fetch initial products:', err)
        return []
    }
}

async function ExchangePageContent({ blogSection }: { blogSection: ReactNode }) {
    /*
    const categories = await getCategories()
    let initialProducts: ProductListItem[] = []

    if (categories.length > 0) {
        const firstValidCat = categories.find(IS_EXCHANGE_CATEGORY) ?? categories[0]
        const firstBrand = firstValidCat.brands && firstValidCat.brands.length > 0 ? firstValidCat.brands[0].slug : undefined
        initialProducts = await getInitialProducts(firstValidCat.slug, firstBrand)
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
    */
    return (
        <div className="flex flex-col gap-8 py-12 px-4 min-h-[70vh] items-center justify-center">
            <UnderConstruction
                title="Mobile Exchange Coming Soon"
                description="We are refining our exchange process to give you the best value for your old devices. Stay tuned for a smarter way to upgrade!"
            />
        </div>
    )
}

async function ExchangePageWrapper() {
    const blogSection = (
        <Suspense fallback={<div className="h-40 w-full animate-pulse bg-gray-50 border border-gray-100 rounded-2xl" />}>
            <OurArticlesSection />
        </Suspense>
    )
    return <ExchangePageContent blogSection={blogSection} />
}

export default function ExchangePage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-[#F5F7FA]" />}>
            <ExchangePageWrapper />
        </Suspense>
    )
}