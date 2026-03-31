
import type { ProductDetails } from '@/app/types/ProductDetailsTypes';
import PreOrderCheckoutClient from './PreOrderCheckoutClient';
import { getProductBySlug } from '@/app/api/services/product.service';

// Same fetch pattern as products/[slug]/page.tsx
async function getProduct(slug: string): Promise<ProductDetails | null> {
    if (!slug) return null;
    try {
        const data = await getProductBySlug(slug);
        return data;
    } catch (error) {
        console.error('Error fetching product for pre-order:', error);
        return null;
    }
}

import { Suspense } from 'react';

// --- CONTENT COMPONENT ---
async function PreOrderCheckoutPageContent({
    params,
}: {
    params: Promise<{ slug: string }>;
}) {
    const { slug } = await params;
    const productData = await getProduct(slug);

    if (!productData) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 flex-col gap-3">
                <h2 className="text-xl font-bold text-gray-800">Product Not Found</h2>
                <p className="text-gray-500 text-sm">The product you are trying to pre-order does not exist.</p>
                <a href="/" className="text-blue-600 hover:underline text-sm font-medium">← Back to Home</a>
            </div>
        );
    }

    return <PreOrderCheckoutClient product={productData} />;
}

// --- MAIN PAGE WRAPPER ---
export default function PreOrderCheckoutPage(props: { params: Promise<{ slug: string }> }) {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center space-y-4">
                    <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
                    <p className="text-gray-500 font-medium">Loading pre-order checkout...</p>
                </div>
            </div>
        }>
            <PreOrderCheckoutPageContent {...props} />
        </Suspense>
    );
}

