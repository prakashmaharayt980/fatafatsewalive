// Server-side cache helper for category products.
// This file intentionally has NO 'use server' directive so that
// unstable_cache can be used freely at module level.
// Import getCachedCategoryProducts instead of getCategoryProducts
// wherever caching is needed (BasketSectionServer, BasketSectionClient).

import { unstable_cache } from 'next/cache';
import { getCategoryProducts } from '@/app/api/services/category.service';
import type { SearchParams } from '@/app/category/[slug]/types';

// Created ONCE at module level — correct unstable_cache pattern.
// Cache key: ['category-products'] + [slug, paramsJson] from args.
// Each unique (slug, params) combination is stored as a separate entry.
// Revalidates every 5 minutes. Purge via revalidateTag('category-products').
const _cachedFetch = unstable_cache(
    async (slug: string, paramsJson: string) => {
        const params: SearchParams = paramsJson ? JSON.parse(paramsJson) : {};
        return getCategoryProducts(slug, params);
    },
    ['category-products'],
    { revalidate: 300, tags: ['category-products'] }
);

export const getCachedCategoryProducts = (slug: string, params?: SearchParams) =>
    _cachedFetch(slug, JSON.stringify(params ?? {}));
