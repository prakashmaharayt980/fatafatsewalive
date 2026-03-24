import { apiPublic, apiPrivate } from './client';

export const ProductService = {
    // Get product by slug (SEO-friendly)
    getProductBySlug: (slug: string) =>
        apiPublic.get(`/v1/products/${slug}`).then(res => res.data.data),

    // Search products with query
    searchProducts: (params: { search?: string; page?: number; per_page?: number; brands?: string | number; categories?: string | number; sort?: string }) => {
        const queryParams = new URLSearchParams();
        if (params.search) queryParams.append('search', params.search);
        if (params.page) queryParams.append('page', params.page.toString());
        if (params.brands) queryParams.append('brands', params.brands.toString());
        if (params.categories) queryParams.append('categories', params.categories.toString());
        if (params.sort) queryParams.append('sort', params.sort.toString());
        queryParams.append('per_page', (params.per_page || 10).toString());
        return apiPublic.get(`/v1/products?${queryParams.toString()}`).then(res => res.data);
    },

    // Get related products by product slug
    getRelatedProducts: (slug: string, limit: number = 8) =>
        apiPublic.get(`/v1/products/${slug}/related?limit=${limit}`).then(res => res.data),



    // Get featured products
    getFeaturedProducts: (limit: number = 12) =>
        apiPublic.get(`/v1/products/featured?limit=${limit}`).then(res => res.data),

    // Get new arrivals
    getNewArrivals: (limit: number = 12) =>
        apiPublic.get(`/v1/products/new-arrivals?limit=${limit}`).then(res => res.data),

    // Get products on sale
    getSaleProducts: (limit: number = 12) =>
        apiPublic.get(`/v1/products/on-sale?limit=${limit}`).then(res => res.data),
};
