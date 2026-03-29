
import React from 'react';
import type { Metadata } from 'next';
import ApplyEmiClient from '../_components/ApplyEmiClient';
import { EmiProvider } from '../../_components/emiContext';

import type { ProductData } from '@/app/types/ProductDetailsTypes';
import { ProductService } from '@/app/api/services/product.service';

// Fetch product by slug helper
async function getProductBySlug(slug: string): Promise<ProductData | null> {
    if (!slug) return null;
    try {
        const product = await ProductService.getProductBySlug(slug);
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

    return {
        title: product ? `Apply EMI for ${product.name} | Fatafat Sewa` : 'Apply for EMI | Fatafat Sewa',
        description: product ? `Easy EMI application for ${product.name}. Get approved quickly at Fatafat Sewa.` : 'Apply for EMI on your favorite gadgets.',
    };
}

import { Suspense } from 'react';

// --- CONTENT COMPONENT ---
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

// --- MAIN PAGE WRAPPER ---
export default function ApplyEmiPage(props: { params: Promise<{ slug: string }>, searchParams: Promise<{ selectedcolor: string }> }) {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center space-y-4">
                    <div className="w-12 h-12 border-4 border-[var(--colour-fsP2)] border-t-transparent rounded-full animate-spin mx-auto"></div>
                    <p className="text-gray-500 font-medium">Preparing EMI application...</p>
                </div>
            </div>
        }>
            <ApplyEmiPageContent {...props} />
        </Suspense>
    );
}


