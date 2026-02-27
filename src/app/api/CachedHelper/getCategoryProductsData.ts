'use server';

import { unstable_cache } from 'next/cache';
import { CategoryService } from '@/app/api/services/category.service';

export const getCategoryProductsData = unstable_cache(
    async (id: string) => {
        try {
            const response = await CategoryService.getCategoryProducts({ id, per_page: 10 });
            return response;
        } catch (error) {
            console.error(`Failed to fetch cached category products for id: ${id}`, error);
            return null;
        }
    },
    ['category-products-cache'], // Cache Key
    {
        revalidate: 3600, // Cache lifetime in seconds (1 hour)
        tags: ['category-products'], // Tag for manual invalidation
    }
);
