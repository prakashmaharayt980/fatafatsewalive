import { apiPublic } from './client';

export interface CategoryQueryParams {
    page?: number;
    per_page?: number;
    sort?: 'price_asc' | 'price_desc' | 'newest' | 'popular';
    min_price?: number;
    max_price?: number;
    brand?: string;
}

export const CategoryService = {
    // Get all categories (flat list)
    getAllCategories: () =>
        apiPublic.get(`/v1/categories`).then(res => res.data),

    // Get category tree for navigation
    getCategoryTree: () =>
        apiPublic.get(`/v1/categories/tree`).then(res => res.data),

    // Get category by slug with products
    getCategoryBySlug: (slug: string, params?: CategoryQueryParams) => {
        const queryParams = new URLSearchParams();
        if (params?.page) queryParams.append('page', params.page.toString());
        if (params?.per_page) queryParams.append('per_page', params.per_page.toString());
        if (params?.sort) queryParams.append('sort', params.sort);
        if (params?.min_price) queryParams.append('min_price', params.min_price.toString());
        if (params?.max_price) queryParams.append('max_price', params.max_price.toString());
        if (params?.brand) queryParams.append('brand', params.brand);
        const query = queryParams.toString();
        return apiPublic.get(`/v1/category/${slug}${query ? `?${query}` : ''}`).then(res => res.data);
    },

    // Get parent categories only
    getParentCategories: () =>
        apiPublic.get(`/v1/categories/parents`).then(res => res.data),

    // Get all brands
    getAllBrands: () =>
        apiPublic.get(`/v1/brands`).then(res => res.data),

    // Get brand by slug
    getBrandBySlug: (slug: string) =>
        apiPublic.get(`/v1/brand/${slug}`).then(res => res.data),

    // Get products by brand slug
    getBrandProducts: (slug: string, params?: CategoryQueryParams) => {
        const queryParams = new URLSearchParams();
        if (params?.page) queryParams.append('page', params.page.toString());
        if (params?.per_page) queryParams.append('per_page', params.per_page.toString());
        if (params?.sort) queryParams.append('sort', params.sort);
        const query = queryParams.toString();
        return apiPublic.get(`/v1/brand/${slug}/products${query ? `?${query}` : ''}`).then(res => res.data);
    },

    // Get products by category id
    // Get products by category id with filters
    getCategoryProducts: (params: { categories?: string | number; id?: string | number; brand?: string; brands?: string | number; page?: number; per_page?: number; sort?: string; min_price?: number; max_price?: number }) => {
        const queryParams = new URLSearchParams();
        const categoryId = params.categories || params.id;

        if (params.page) queryParams.append('page', params.page.toString());
        if (params.per_page) queryParams.append('per_page', params.per_page.toString());
        if (params.sort) queryParams.append('sort', params.sort);
        if (params.min_price) queryParams.append('min_price', params.min_price.toString());
        if (params.max_price) queryParams.append('max_price', params.max_price.toString());

        // Support both 'brand' (slug) and 'brands' (id/list)
        if (params.brand) queryParams.append('brand', params.brand);
        if (params.brands) queryParams.append('brands', params.brands.toString());

        const query = queryParams.toString();
        // If categories/id is provided, use that endpoint, otherwise fallback (though this method implies category context)
        return apiPublic.get(`/v1/categories/${categoryId}/products${query ? `?${query}` : ''}`).then(res => res.data);
    },
};
