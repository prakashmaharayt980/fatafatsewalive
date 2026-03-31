import { unstable_cache } from 'next/cache';
import { apiPublic } from './client';

type SearchParams = {
    search?: string;
    page?: number;
    per_page?: number;
    brands?: string | number;
    categories?: string | number;
    sort?: string;
    exchange_available?: boolean;
};

// ─── Named exports (preferred for Server Actions / RSC) ──────────────────────

export const getProductBySlug = async (slug: string) => {
    return unstable_cache(
        async () => {
            if (!slug) return null;
            try {
                const res = await apiPublic.get(`/v1/products/${slug}`);
                return res.data.data;
            } catch (error: any) {
                if (error.response?.status === 404) {
                    // Cache the null so the 404 endpoint is NOT hammered again
                    return null;
                }
                console.error(`Error fetching product by slug: ${slug}`, error);
                return null;
            }
        },
        [`product-${slug}`],
        {
            revalidate: 3600, // 1 hour — 404s are also cached
            tags: ['products', `product-${slug}`],
        }
    )();
};

export const searchProducts = async (params: SearchParams) => {
    const queryParams = new URLSearchParams();
    if (params.search) queryParams.append('search', params.search);
    if (params.page) queryParams.append('page', params.page.toString());
    if (params.brands) queryParams.append('brand', params.brands.toString());
    if (params.categories) queryParams.append('category', params.categories.toString());
    if (params.sort) queryParams.append('sort', params.sort.toString());
    if (params.exchange_available !== undefined) queryParams.append('exchange_available', params.exchange_available.toString());
    queryParams.append('per_page', (params.per_page || 10).toString());
    return apiPublic.get(`/v1/products?${queryParams.toString()}`).then(res => res.data);
};

export const getRelatedProducts = async (slug: string, limit = 8) =>
    apiPublic.get(`/v1/products/${slug}/related?limit=${limit}`).then(res => res.data);

export const getFeaturedProducts = async (limit = 12) =>
    apiPublic.get(`/v1/products/featured?limit=${limit}`).then(res => res.data);

export const getNewArrivals = async (limit = 12) =>
    apiPublic.get(`/v1/products/new-arrivals?limit=${limit}`).then(res => res.data);

export const getSaleProducts = async (limit = 12) =>
    apiPublic.get(`/v1/products/on-sale?limit=${limit}`).then(res => res.data);

export const submitExchangeRequest = async (data: any) => {
    return apiPublic.post('/v1/exchange-requests', data).then(res => res.data);
}

export const submitRepairRequest = async (data: any) => {
    return apiPublic.post('/v1/repair-requests', data).then(res => res.data);
}

// ─── Backward-compat object (keeps all existing call sites working) ──────────

export const ProductService = {
    getProductBySlug,
    searchProducts,
    getRelatedProducts,
    getFeaturedProducts,
    getNewArrivals,
    getSaleProducts,
    submitExchangeRequest,
    submitRepairRequest,
};
