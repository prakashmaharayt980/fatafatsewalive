'use server'

import { unstable_cache } from 'next/cache';
import { apiPublic } from './client';

export const getBlogList = async (params?: { page?: number; per_page?: number; category?: string, search?: string, sort?: string }) => {
    return unstable_cache(
        async () => {
            const queryParams = new URLSearchParams();
            if (params?.page) queryParams.append('page', params.page.toString());
            if (params?.per_page) queryParams.append('per_page', params.per_page.toString());
            if (params?.category) queryParams.append('category', params.category);
            if (params?.search) queryParams.append('search', params.search);
            if (params?.sort) queryParams.append('sort', params.sort);
            const query = queryParams.toString();
            return apiPublic.get(`/v1/blogs${query ? `?${query}` : ''}`).then((res: any) => res.data);
        },
        [`blog-list-${JSON.stringify(params || {})}`],
        { revalidate: 3600, tags: ['blogs'] }
    )();
};

export const getBlogBySlug = async (slug: string) =>
    apiPublic.get(`/v1/blogs/${slug}`).then((res: any) => res.data);

export const getRelatedBlogs = async (slug: string, limit: number = 4) =>
    apiPublic.get(`/v1/blogs/${slug}/related?limit=${limit}`).then((res: any) => res.data);

export const getBlogCategories = async () =>
    unstable_cache(
        async () => apiPublic.get(`/v1/blogs/categories`).then((res: any) => res.data),
        ['blog-categories'],
        { revalidate: 3600, tags: ['blog-categories'] }
    )();

// No object exports allowed in 'use server' files
