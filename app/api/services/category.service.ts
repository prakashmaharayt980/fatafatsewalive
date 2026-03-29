
'use server'

import type { SearchParams } from '@/app/category/[slug]/types';
import { apiPublic, apiPrivate, n8nApi } from './client';
import { unstable_cache } from 'next/cache';


export const getAllCategories = async () => {
    'use cache';
    return apiPublic.get(`/categorys/navbarItems`).then(res => res.data);
};

export const getCategoryBySlug = async (slug: string) => {
    'use cache';
    return apiPublic.get(`/v1/categories/${slug}`).then(res => res.data);
};


export const getAllBrands = async () => {
    'use cache';
    try {
        const res = await apiPublic.get(`/v1/get-all-brands`);
        return res.data;
    } catch (error: any) {
        // Fallback for legacy or different environments
        if (error?.response?.status === 404) {
            try {
                return await apiPublic.get(`/get-all-brands`).then(res => res.data);
            } catch (fallbackError: any) {
                console.warn('API Warning: Brand list not found at /v1/get-all-brands or /get-all-brands');
                return { data: [] }; // Return empty data to prevent build crash
            }
        }
        throw error;
    }
};

export const getBrandProducts = async (slug: string, params?: SearchParams) => {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.per_page) queryParams.append('per_page', params.per_page.toString());
    if (params?.sort) queryParams.append('sort', params.sort);
    const query = queryParams.toString();
    return apiPublic.get(`/v1/brand/${slug}/products${query ? `?${query}` : ''}`).then(res => res.data);
};

export const getCategoryProducts = async (slug: string, params?: SearchParams) => {
    'use cache';
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.per_page) queryParams.append('per_page', params.per_page.toString());
    if (params?.sort) queryParams.append('sort', params.sort);
    if (params?.min_price) queryParams.append('min_price', params.min_price.toString());
    if (params?.max_price) queryParams.append('max_price', params.max_price.toString());
    if (params?.brand) queryParams.append('brand', params.brand);
    if (params?.category) queryParams.append('category', params.category);
    if (params?.emi_enabled !== undefined) queryParams.append('emi_enabled', params.emi_enabled.toString());
    if (params?.pre_order !== undefined) queryParams.append('pre_order', params.pre_order.toString());
    if (params?.exchange_available !== undefined) queryParams.append('exchange_available', params.exchange_available.toString());
    if (params?.offset !== undefined) queryParams.append('offset', params.offset.toString());
    queryParams.append('include', 'brand,categories');
    const query = queryParams.toString();
    try {
        const res = await apiPublic.get(`/v1/categories/${slug}/products${query ? `?${query}` : ''}`);
        return res.data;
    } catch (error: any) {
        if (error?.response?.status === 404) return null;
        throw error;
    }
};

// No object exports allowed in 'use server' files
