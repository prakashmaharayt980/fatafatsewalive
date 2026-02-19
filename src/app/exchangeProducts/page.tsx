import { Metadata } from 'next'
import RemoteServices from '@/app/api/remoteservice'
import ExchangeClient from './ExchangeClient'

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

export default async function ExchangePage() {
    let brands: Array<{ id: number; name: string; slug: string; image?: string }> = []

    try {
        const res = await RemoteServices.getAllBrands()
        brands = res?.data || []
    } catch (err) {
        console.error('Failed to fetch brands for exchange page:', err)
    }

    return <ExchangeClient brands={brands} />
}