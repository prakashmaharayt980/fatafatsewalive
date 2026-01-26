import { apiPublic } from './client';

export const BlogService = {
    // Get all blog posts with optional pagination
    getBlogList: (params?: { page?: number; per_page?: number; category?: string }) => {
        const queryParams = new URLSearchParams();
        if (params?.page) queryParams.append('page', params.page.toString());
        if (params?.per_page) queryParams.append('per_page', params.per_page.toString());
        if (params?.category) queryParams.append('category', params.category);
        const query = queryParams.toString();
        return apiPublic.get(`/v1/blogs${query ? `?${query}` : ''}`).then(res => res.data);
    },

    // Get blog post by slug
    getBlogBySlug: (slug: string) =>
        apiPublic.get(`/v1/blog/${slug}`).then(res => res.data),

    // Get related blog posts
    getRelatedBlogs: (slug: string, limit: number = 4) =>
        apiPublic.get(`/v1/blog/${slug}/related?limit=${limit}`).then(res => res.data),

    // Get blog categories
    getBlogCategories: () =>
        apiPublic.get(`/v1/blog/categories`).then(res => res.data),

    // Get featured blogs
    getFeaturedBlogs: (limit: number = 3) =>
        apiPublic.get(`/v1/blogs/featured?limit=${limit}`).then(res => res.data),
};
