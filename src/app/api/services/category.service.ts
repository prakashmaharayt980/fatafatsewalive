import { SearchParams } from '@/app/category/[slug]/types';
import { apiPublic } from './client';



export const CategoryService = {
    getAllCategories: () =>
        apiPublic.get(`/categorys/navbarItems`).then(res => res.data),

    getCategoryBySlug: (slug: string) =>
        apiPublic.get(`/v1/categories/${slug}`).then(res => res.data),


    getAllBrands: () =>
        apiPublic.get(`/get-all-brands`).then(res => res.data),

    getBrandProducts: (slug: string, params?: SearchParams) => {
        const queryParams = new URLSearchParams();
        if (params?.page) queryParams.append('page', params.page.toString());
        if (params?.per_page) queryParams.append('per_page', params.per_page.toString());
        if (params?.sort) queryParams.append('sort', params.sort);
        const query = queryParams.toString();
        return apiPublic.get(`/v1/brand/${slug}/products${query ? `?${query}` : ''}`).then(res => res.data);
    },
    getCategoryProducts: (slug: string, params?: SearchParams) => {
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
        queryParams.append('is_featured', 'false');
        queryParams.append('include', 'brand,categories');
        const query = queryParams.toString();
        return apiPublic.get(`/v1/categories/${slug}/products${query ? `?${query}` : ''}`).then(res => res.data);
    },
};
