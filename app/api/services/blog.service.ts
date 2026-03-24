
'use server'

import { apiPublic } from './client';

export const getBlogList = async (params?: { page?: number; per_page?: number; category?: string }) => {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.per_page) queryParams.append('per_page', params.per_page.toString());
    if (params?.category) queryParams.append('category', params.category);
    const query = queryParams.toString();
    return apiPublic.get(`/v1/blogs${query ? `?${query}` : ''}`).then(res => res.data);
};

export const getBlogBySlug = async (slug: string) =>
    apiPublic.get(`/v1/blog/${slug}`).then(res => res.data);

export const getRelatedBlogs = async (slug: string, limit: number = 4) =>
    apiPublic.get(`/v1/blog/${slug}/related?limit=${limit}`).then(res => res.data);

export const getBlogCategories = async () =>
    apiPublic.get(`/v1/blog/categories`).then(res => res.data);

// No object exports allowed in 'use server' files
