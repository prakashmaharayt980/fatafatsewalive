import type { Metadata } from 'next'
import { Suspense } from 'react'
import ShopByEmiClient from './ShopByEmiClient'
import { getAllCategories } from '@/app/api/services/category.service'
import { getBannerData } from '@/app/api/CachedHelper/getBannerData'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://fatafatsewa.com';

export const metadata: Metadata = {
    title: 'Shop by EMI — Find Products That Fit Your Budget | Fatafat Sewa',
    description:
        'Browse products based on your monthly EMI budget. Filter by tenure, down payment, brand, and sort by popularity or price. Find the perfect gadget within your budget at Fatafat Sewa.',
    alternates: {
        canonical: `${SITE_URL}/emi/shop`,
    },
    openGraph: {
        title: 'Shop by EMI — Find Products That Fit Your Budget | Fatafat Sewa',
        description:
            'Browse products based on your monthly EMI budget. Filter by tenure, down payment, and sort by popularity or price.',
        url: `${SITE_URL}/emi/shop`,
        type: 'website',
    },
}

export default async function ShopByEmiPage() {
    const banners = await Promise.all([
        getBannerData('home-banner-fourth-test')

    ])

    const categories = await getAllCategories()

    const jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'WebPage',
        name: 'Shop by EMI - Fatafat Sewa',
        description: 'Find mobiles, laptops and gadgets on easy EMI installments in Nepal.',
        breadcrumb: {
            '@type': 'BreadcrumbList',
            itemListElement: [
                {
                    '@type': 'ListItem',
                    position: 1,
                    name: 'Home',
                    item: SITE_URL,
                },
                {
                    '@type': 'ListItem',
                    position: 2,
                    name: 'EMI Shop',
                    item: `${SITE_URL}/emi/shop`,
                },
            ],
        },
        mainEntity: {
            '@type': 'Product',
            name: 'EMI Gadget Collection',
            description: 'A wide range of gadgets available on 0% Interest EMI in Nepal.',
            brand: {
                '@type': 'Brand',
                name: 'Fatafat Sewa',
            },
            offers: {
                '@type': 'AggregateOffer',
                priceCurrency: 'NPR',
                offerCount: '500',
                lowPrice: '10000',
                highPrice: '500000',
            }
        }
    };

    return (
        <main>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />
            <Suspense fallback={
                <div className="min-h-screen bg-[var(--colour-bg4)] flex items-center justify-center">
                    <div className="text-center">
                        <div className="w-10 h-10 border-4 border-[var(--colour-fsP2)] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                        <p className="text-sm font-medium text-[var(--colour-text3)]">Loading Shop by EMI...</p>
                    </div>
                </div>
            }>
                <ShopByEmiClient 
                    initialCategories={categories || []} 
                    footerBanners={banners.filter(Boolean)} 
                />
            </Suspense>
        </main>
    )
}
