'use server';

import { CategoryService } from '@/app/api/services/category.service';
import { FilterState } from '../types';

export interface FetchProductsInput {
    slug: string;
    filters: FilterState;
    page: number;
    per_page?: number;
}

function buildParams(filters: FilterState, page: number, per_page: number) {
    return {
        page,
        per_page,
        sort: filters.sort || 'newest',
        min_price: filters.min_price > 0 ? filters.min_price : undefined,
        max_price: filters.max_price < 100000 ? filters.max_price : undefined,
        brand: filters.brand?.length ? filters.brand.join(',') : undefined,
        // filters.category already contains sub_category if it was seeded from URL
        category: filters.category?.length ? filters.category.join(',') : undefined,
        emi_enabled: filters.emi_enabled || undefined,
        pre_order: filters.pre_order || undefined,
        exchange_available: filters.exchange_available || undefined,
    };
}

export async function fetchCategoryProducts({ slug, filters, page, per_page = 10 }: FetchProductsInput) {
    const params = buildParams(filters, page, per_page);
    try {
        const result = await CategoryService.getCategoryProducts(slug, params);
        return {
            products: result?.data?.products ?? [],
            meta: result?.meta ?? { current_page: page, per_page, total: 0, last_page: 1 },
            error: null,
        };
    } catch {
        return {
            products: [],
            meta: { current_page: page, per_page, total: 0, last_page: 1 },
            error: 'Failed to fetch products',
        };
    }
}