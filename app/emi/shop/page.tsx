import type { Metadata } from 'next'
import { Suspense } from 'react'


import ShopByEmiClient from './ShopByEmiClient'
import { getBannerData } from '@/app/api/CachedHelper/getBannerData'
import { getCachedAllCategories } from '@/app/api/utils/categoryCache'
import { getCategoryProducts } from '@/app/api/services/category.service'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://fatafatsewa.com'

const banners = [
    { slug: 'banner-3-img-test', type: 'Banner2' as const },
    { slug: 'home-banner-fourth-test', type: 'Bannerfooter' as const },

] as const



export const metadata: Metadata = {
    title: 'Shop by EMI — Buy Mobiles & Laptops on Easy Installments | Fatafat Sewa',
    description:
        'Shop mobiles, laptops and gadgets on 0% interest EMI in Nepal. Filter by monthly budget, tenure, brand, and financing plan. Get genuine products with official warranty at Fatafat Sewa.',
    alternates: {
        canonical: `${SITE_URL}/emi/shop`,
    },
    openGraph: {
        title: 'Shop by EMI — Buy Mobiles & Laptops on Easy Installments | Fatafat Sewa',
        description:
            'Find gadgets that fit your monthly budget. Filter by EMI plan, brand, and tenure. 0% interest available on Apple, Samsung and more.',
        url: `${SITE_URL}/emi/shop`,
        type: 'website',
    },
}

export default async function Page() {
    const [heroBanner, footerBanner, categories, initialProducts] = await Promise.all([
        getBannerData(banners[0].slug),
        getBannerData(banners[1].slug),
        getCachedAllCategories(),
        getCategoryProducts('mobile-price-in-nepal', { emi_enabled: true, brand: 'iphone-price-in-nepal', per_page: 5, sort: 'newest' }),
    ])

    const jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'WebPage',
        name: 'Shop by EMI — Fatafat Sewa',
        description: 'Find mobiles, laptops and gadgets on easy EMI installments in Nepal.',
        breadcrumb: {
            '@type': 'BreadcrumbList',
            itemListElement: [
                { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
                { '@type': 'ListItem', position: 2, name: 'EMI Shop', item: `${SITE_URL}/emi/shop` },
            ],
        },
        mainEntity: {
            '@type': 'Product',
            name: 'EMI Gadget Collection',
            description: 'A wide range of gadgets available on 0% Interest EMI in Nepal.',
            brand: { '@type': 'Brand', name: 'Fatafat Sewa' },
            offers: {
                '@type': 'AggregateOffer',
                priceCurrency: 'NPR',
                offerCount: '500',
                lowPrice: '10000',
                highPrice: '500000',
            },
        },
    }

    return (
        <main>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />
            <Suspense fallback={
                <div className="min-h-screen flex items-center justify-center bg-slate-50">
                    <div className="text-center space-y-3">
                        <div className="w-10 h-10 border-4 border-[var(--colour-fsP2)] border-t-transparent rounded-full animate-spin mx-auto" />
                        <p className="text-sm font-semibold text-slate-500">Loading EMI Shop…</p>
                    </div>
                </div>
            }>
                <ShopByEmiClient
                    initialCategories={categories ?? []}
                    heroBanners={[heroBanner].filter(Boolean) as any}
                    footerBanners={[footerBanner].filter(Boolean) as any}
                    initialProducts={initialProducts}
                />
            </Suspense>
        </main>
    )
}
