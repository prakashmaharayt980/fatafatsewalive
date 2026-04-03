
import React from 'react';
import type { Metadata } from 'next';
import ApplyEmiClient from '../_components/ApplyEmiClient';
import { EmiProvider } from '../../_components/emiContext';

import type { ProductData } from '@/app/types/ProductDetailsTypes';
import { getProductBySlug as fetchProductBySlug } from '@/app/api/services/product.service';

async function getProductBySlug(slug: string): Promise<ProductData | null> {
    if (!slug) return null;
    try {
        const product = await fetchProductBySlug(slug);
        return product || null;
    } catch (error) {
        console.error("Error fetching product for EMI:", error);
        return null;
    }
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
    const resolvedParams = await params;
    const slug = resolvedParams.slug;
    const product = slug ? await getProductBySlug(slug) : null;

    const title = product
        ? `Apply EMI for ${product.name} — 0% Interest | Fatafat Sewa`
        : 'Apply for 0% EMI on Electronics in Nepal | Fatafat Sewa';
    const description = product
        ? `Get ${product.name} on easy EMI in Nepal. 0% interest, instant approval, flexible tenure. Apply online at Fatafat Sewa.`
        : 'Apply for 0% EMI on mobiles, laptops & electronics in Nepal. Instant approval, flexible tenure with major Nepali banks. Fatafat Sewa.';
    const url = product
        ? `https://fatafatsewa.com/emi/apply/${slug}`
        : 'https://fatafatsewa.com/emi/apply';

    return {
        title,
        description,
        keywords: product
            ? [`${product.name} EMI Nepal`, 'buy on EMI Nepal', '0% interest EMI', 'Fatafat Sewa EMI', 'online EMI Nepal']
            : ['EMI Nepal', '0% EMI electronics Nepal', 'buy mobile EMI', 'laptop EMI Nepal', 'Fatafat Sewa'],
        alternates: { canonical: url },
        openGraph: {
            title,
            description,
            url,
            siteName: 'Fatafat Sewa',
            type: 'website',
            images: [{ url: '/og-image.jpg', width: 1200, height: 630, alt: 'Fatafat Sewa EMI' }],
        },
        twitter: {
            card: 'summary_large_image',
            title,
            description,
            site: '@fatafatsewa',
        },
    };
}

import { Suspense } from 'react';

async function ApplyEmiPageContent({ params, searchParams }: { params: Promise<{ slug: string }>, searchParams: Promise<{ selectedcolor: string }> }) {
    const resolvedParams = await params;
    const slug = resolvedParams.slug;
    const resolvedSearchParams = await searchParams;
    const selectedcolor = resolvedSearchParams?.selectedcolor;

    const product = slug ? await getProductBySlug(slug) : null;

    return (
        <EmiProvider>
            <ApplyEmiClient initialProduct={product} selectedcolor={selectedcolor} />
        </EmiProvider>
    );
}

export default function ApplyEmiPage(props: { params: Promise<{ slug: string }>, searchParams: Promise<{ selectedcolor: string }> }) {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center space-y-4">
                    <div className="w-12 h-12 border-4 border-(--colour-fsP2) border-t-transparent rounded-full animate-spin mx-auto"></div>
                    <p className="text-gray-500 font-medium">Preparing EMI application...</p>
                </div>
            </div>
        }>
            <ApplyEmiPageContent {...props} />
        </Suspense>
    );
}

