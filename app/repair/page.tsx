import type { Metadata } from 'next'
import RepairClient from './RepairClient'
import { getAllBrands, getAllCategories } from '../api/services/category.service'
import { Suspense } from 'react'

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

async function RepairPageContent() {
    let brands: any[] = []
    let categories: any[] = []

    try {
        const [brandRes, catRes] = await Promise.all([
            getAllBrands(),
            getAllCategories()
        ])
        brands = brandRes?.data || brandRes || []
        categories = catRes?.data || catRes || []
    } catch (err) {
        console.error('Failed to fetch data for repair page:', err)
    }

    return <RepairClient brands={brands} categories={categories} />
}

export default function RepairPage() {
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
            <Suspense fallback={
                <div className="min-h-screen bg-[#F5F7FA] flex flex-col">
                    <div className="bg-white border-b border-gray-100 py-12 md:py-16">
                        <div className="max-w-7xl mx-auto px-4 lg:px-8 flex flex-col md:flex-row items-center gap-12">
                            <div className="flex-1 space-y-6">
                                <div className="h-6 w-40 bg-gray-100 rounded-full animate-pulse" />
                                <div className="space-y-3">
                                    <div className="h-10 w-[85%] bg-gray-100 rounded-xl animate-pulse" />
                                    <div className="h-10 w-[60%] bg-gray-100 rounded-xl animate-pulse" />
                                </div>
                                <div className="h-16 w-[75%] bg-gray-50 rounded-xl animate-pulse" />
                            </div>
                            <div className="w-64 h-64 bg-gray-50 rounded-full animate-pulse hidden md:block" />
                        </div>
                    </div>
                    <div className="flex-1 py-8">
                        <div className="max-w-7xl mx-auto space-y-6">
                            <div className="h-4 bg-gray-200/60 rounded-full animate-pulse" />
                            <div className="w-full h-[600px] bg-white border-none border-gray-100 animate-pulse flex flex-col p-6 space-y-8">
                                <div className="h-4 w-28 bg-gray-100 rounded-full" />
                                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
                                    {Array.from({ length: 10 }).map((_, i) => (
                                        <div key={i} className="aspect-[4/5] bg-gray-50 rounded-2xl" />
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            }>
                <RepairPageContent />
            </Suspense>
        </>
    )
}
