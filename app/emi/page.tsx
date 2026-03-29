
import React from 'react';

import ClientEmiPage from './_components/ClientEmiPage';
import type { ProductDetails } from '@/app/types/ProductDetailsTypes';
import type { BannerItem } from '@/app/types/BannerTypes';
import { ProductService } from '../api/services/product.service';
import { getBannerData } from '../api/CachedHelper/getBannerData';

interface PageProps {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

const getProductBySlug = async (slug: string): Promise<ProductDetails | null> => {
    try {
        const product = await ProductService.getProductBySlug(slug);
        return product || null;
    } catch (error) {
        console.error("Failed to fetch product for EMI Metadata:", error);
        return null;
    }
};

const getEmiBanner = async (): Promise<BannerItem | null> => {
    // Attempt to fetch production-ready banner, fallback to test if needed
    const banner = await getBannerData('emi-banner-test');
    if (banner) return banner;
    return getBannerData('emi-banner-test');
};

export async function generateMetadata({ searchParams }: PageProps) {
    const resolvedSearchParams = await searchParams;
    const productSlug = resolvedSearchParams?.slug;

    let title = "EMI Calculator | Fatafat Sewa";
    let description = "Calculate your monthly EMI including down payments and bank interest rates.";

    if (productSlug && typeof productSlug === 'string') {
        const product = await getProductBySlug(productSlug);
        if (product) {
            title = `Buy ${product.name} on EMI | Fatafat Sewa`;
            description = `Calculate EMI for ${product.name}. Check down payment options, monthly installments, and bank interest rates.`;
        }
    }

    return {
        title,
        description,
        openGraph: {
            title,
            description,
        },
    };
}

import { Suspense } from 'react';

const EmiPageContent = async ({ searchParams }: PageProps) => {
    const resolvedSearchParams = await searchParams;
    const productSlug = resolvedSearchParams?.slug;

    // Fetch product and banner in parallel for performance
    const [initialProduct, emiBanner] = await Promise.all([
        productSlug && typeof productSlug === 'string' ? getProductBySlug(productSlug) : Promise.resolve(null),
        getEmiBanner()
    ]);

    return (
        <ClientEmiPage initialProduct={initialProduct} emiBanner={emiBanner} />
    );
};

const Page = (props: PageProps) => {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center space-y-4">
                    <div className="w-12 h-12 border-4 border-[var(--colour-logoblue1)] border-t-transparent rounded-full animate-spin mx-auto"></div>
                    <p className="text-gray-500 font-medium font-heading">Loading EMI Calculator...</p>
                </div>
            </div>
        }>
            <EmiPageContent {...props} />
        </Suspense>
    );
};


export default Page;