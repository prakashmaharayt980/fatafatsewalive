
import React from 'react';
import RemoteServices from '@/app/api/remoteservice';
import ClientEmiPage from './ClientEmiPage';
import { ProductDetails } from '@/app/types/ProductDetailsTypes';

interface PageProps {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

const getProduct = async (id: string) => {
    try {
        const response = await RemoteServices.searchProducts({ search: id });
        return response.data?.[0] || null;
    } catch (error) {
        console.error("Failed to fetch product for EMI Metadata:", error);
        return null;
    }
};

export async function generateMetadata({ searchParams }: PageProps) {
    const resolvedSearchParams = await searchParams;
    const productId = resolvedSearchParams?.id;

    let title = "EMI Calculator | Fatafat Sewa";
    let description = "Calculate your monthly EMI including down payments and bank interest rates.";

    if (productId && typeof productId === 'string') {
        const product = await getProduct(productId);
        if (product) {
            title = `Buy ${product.name} on EMI | Fatafat Sewa`;
            description = `Calculate EMI for ${product.name}. Price: Rs ${product.price}. Check down payment options and monthly installments.`;
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

const Page = async ({ searchParams }: PageProps) => {
    const resolvedSearchParams = await searchParams;
    const productId = resolvedSearchParams?.id;
    let initialProduct: ProductDetails | null = null;

    if (productId && typeof productId === 'string') {
        initialProduct = await getProduct(productId);
    }

    return (
        <ClientEmiPage initialProduct={initialProduct} />
    );
};

export default Page;