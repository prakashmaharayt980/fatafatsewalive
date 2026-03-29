import type { Metadata } from 'next'

import ExchangeClient from './ExchangeClient'
import { getAllCategories, getCategoryProducts } from '../api/services/category.service';
import type { NavbarItem } from '../context/navbar.interface';
import type { ProductListItem } from './exchange-helpers';

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

import LazySection from '@/components/LazySection'
import BannerSectionServer from '@/components/BannerSectionServer'
import OurArticlesSectionClient from '@/components/OurArticlesSectionClient'

import { Suspense } from 'react'

async function ExchangePageContent() {
    let categories: NavbarItem[] = []
    let initialProducts: ProductListItem[] = []

    try {
        const res = await getAllCategories()
        const allCats: NavbarItem[] = res?.data || []
        
        // Do not filter categories per user request: "show all category ,brands"
        categories = allCats;

        // Pre-fetch products for the first category and its first brand to serve SSR content for SEO
        if (categories.length > 0) {
            const firstCat = categories[0]
            const firstBrand = firstCat.brands && firstCat.brands.length > 0 ? firstCat.brands[0].slug : undefined
            const productsRes = await getCategoryProducts(firstCat.slug, { brand: firstBrand, exchange_available: true, per_page: 40 })
            initialProducts = productsRes?.data?.products || []
        }

    } catch (err) {
        console.error('Failed to fetch data for exchange page:', err)
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
            <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
                <div className="w-full max-w-lg space-y-8 animate-in fade-in duration-700">
                    <div className="space-y-4 text-center">
                        <div className="w-16 h-16 border-4 border-[var(--colour-logoblue1)] border-t-transparent rounded-full animate-spin mx-auto shadow-sm"></div>
                        <h2 className="text-2xl font-bold text-gray-800 font-heading">Preparing Mobile Exchange</h2>
                        <p className="text-gray-500 max-w-xs mx-auto">Get ready for the best market value on your device. Just a few more seconds...</p>
                    </div>
                </div>
            </div>
        }>
            <ExchangePageContent />
        </Suspense>
    )
}