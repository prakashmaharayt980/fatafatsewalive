import React from 'react';

import BasketCard from './BasketCard';
import { CategoryService } from '../api/services/category.service';

interface BasketCardFetcherProps {
    title?: string;
    slug: string;
}

export default async function BasketCardFetcher({ title, slug }: BasketCardFetcherProps) {
    // Fetch data on the server
    let data;
    try {
        data = await CategoryService.getCategoryProducts(slug, { per_page: 10 }).then((res) => res.data);
    } catch (error: any) {
        if (error?.response?.status !== 404) {
            console.error(`Failed to fetch products for category ${slug}:`, error?.message || 'Unknown error');
        }
        return null;
    }

    if (!data || !data.products || data.products.length === 0) {
        return null; // Or return a fallback UI
    }

    // Pass the data as initialData to the client component
    return (
        <BasketCard
            title={title || data.category?.name || data.category?.title}
            slug={slug}
            initialData={data}
        />
    );
}
