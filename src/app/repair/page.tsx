import { Metadata } from 'next'
import RemoteServices from '@/app/api/remoteservice'
import RepairClient from './RepairClient'

export const metadata: Metadata = {
    title: 'Mobile & Laptop Repair — Expert Device Repair Service | Fatafat Sewa',
    description:
        'Get your phone or laptop repaired by certified technicians at Fatafat Sewa. Screen replacement, battery change, water damage repair, and more. Free pickup across Nepal with 90-day warranty.',
    keywords: [
        'mobile repair Nepal',
        'phone screen repair',
        'battery replacement Nepal',
        'laptop repair Kathmandu',
        'water damage repair',
        'charging port repair',
        'Fatafat Sewa repair',
        'phone repair near me',
        'smartphone repair service',
        'device repair Kathmandu',
    ],
    openGraph: {
        title: 'Mobile & Laptop Repair — Expert Device Repair Service | Fatafat Sewa',
        description:
            'Certified technicians, OEM parts, free pickup, and 90-day warranty. Get your device repaired today with Fatafat Sewa.',
        type: 'website',
        url: 'https://fatafatsewa.com/repair',
        images: [{ url: '/imgfile/logoimg.png', width: 600, height: 600, alt: 'Fatafat Sewa Device Repair' }],
    },
    twitter: {
        card: 'summary_large_image',
        title: 'Mobile & Laptop Repair — Expert Device Repair Service | Fatafat Sewa',
        description: 'Certified repair with free pickup and 90-day warranty.',
    },
    alternates: {
        canonical: 'https://fatafatsewa.com/repair',
    },
}

export default async function RepairPage() {
    let brands: Array<{ id: number; name: string; slug: string; image?: string }> = []

    try {
        const res = await RemoteServices.getAllBrands()
        brands = res?.data || []
    } catch (err) {
        console.error('Failed to fetch brands for repair page:', err)
    }

    // JSON-LD structured data
    const jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'LocalBusiness',
        name: 'Fatafat Sewa - Device Repair',
        description: 'Expert mobile phone and laptop repair service in Nepal with certified technicians and OEM parts.',
        url: 'https://fatafatsewa.com/repair',
        telephone: '+977 9828757575',
        address: {
            '@type': 'PostalAddress',
            streetAddress: 'Sitapaila Road-14',
            addressLocality: 'Kathmandu',
            addressCountry: 'NP',
        },
        openingHours: 'Su-Fr 10:00-18:00',
        image: 'https://fatafatsewa.com/imgfile/logoimg.png',
        priceRange: 'Rs. 500 - Rs. 15,000',
        hasOfferCatalog: {
            '@type': 'OfferCatalog',
            name: 'Device Repair Services',
            itemListElement: [
                { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Screen Repair', description: 'Cracked or scratched display replacement' } },
                { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Battery Replacement', description: 'Battery swap for all phone models' } },
                { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Water Damage Repair', description: 'Liquid damage assessment and restoration' } },
                { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Charging Port Repair', description: 'Fix loose or broken charging connections' } },
                { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Camera Repair', description: 'Front and rear camera fixes' } },
                { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Software Fix', description: 'OS reinstall, virus removal, performance optimization' } },
            ],
        },
    }

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />
            <RepairClient brands={brands} />
        </>
    )
}
