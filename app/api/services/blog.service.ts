

import { apiPublic } from '../ServiceHelper/index';

export const getBlogList = (params?: { page?: number; per_page?: number; category?: string, search?: string, sort?: string }) => {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.per_page) queryParams.append('per_page', params.per_page.toString());
    if (params?.category) queryParams.append('category', params.category);
    if (params?.search) queryParams.append('search', params.search);
    if (params?.sort) queryParams.append('sort', params.sort);
    const query = queryParams.toString();
    return apiPublic.get(`/v1/blogs${query ? `?${query}` : ''}`).then((res: any) => res.data);
};

export const getBlogBySlug = (slug: string) =>
    apiPublic.get(`/v1/blogs/${slug}`).then((res: any) => res.data);

export const getRelatedBlogs = (slug: string, limit: number = 4) =>
    apiPublic.get(`/v1/blogs/${slug}/related?limit=${limit}`).then((res: any) => res.data);

export const getBlogCategories = () =>
    apiPublic.get(`/v1/blogs/categories`).then((res: any) => res.data);

// No object exports allowed in 'use server' files
