
import React from 'react';
import { Metadata } from 'next';
import ApplyEmiClient from '../_components/ApplyEmiClient';
import RemoteServices from '@/app/api/remoteservice';
import { ProductDetails } from '@/app/types/ProductDetailsTypes';

// Fetch product by slug helper
async function getProductBySlug(slug: string): Promise<ProductDetails | null> {
    if (!slug) return null;
    try {
        const product = await RemoteServices.getProductBySlug(slug);
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

export default async function ApplyEmiPage({ params, searchParams }: { params: Promise<{ slug: string }>, searchParams: Promise<{ selectedcolor: string }> }) {
    const resolvedParams = await params;
    const slug = resolvedParams.slug;
    const resolvedSearchParams = await searchParams;
    const selectedcolor = resolvedSearchParams?.selectedcolor;

    const product = slug ? await getProductBySlug(slug) : null;

    return (
        <ApplyEmiClient initialProduct={product} selectedcolor={selectedcolor} />
    );
}
