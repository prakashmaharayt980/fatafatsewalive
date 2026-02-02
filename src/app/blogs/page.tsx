import React from 'react';
import { Metadata } from 'next';
import RemoteServices from '../api/remoteservice';
import BlogListingClient from './components/BlogListingClient';
import { Article } from '../types/Blogtypes';

export const metadata: Metadata = {
    title: 'Blog & News - Fatafat Sewa',
    description: 'Latest tech news, reviews, buying guides, and deals from Fatafat Sewa.',
};

export default async function BlogPage() {
    // 1. Fetch Main Blog List
    const blogRes = await RemoteServices.getBlogList();
    const articles: Article[] = Array.isArray(blogRes) ? blogRes : blogRes.data || [];

    // 2. Fetch Banner Data
    // Handling error gracefully or ensuring API response structure matches
    let bannerData = { data: [], meta: {} };
    try {
        const bannerRes = await RemoteServices.getAllBanners();
        bannerData = { data: bannerRes.data || [], meta: bannerRes.meta || {} };
    } catch (e) {
        console.error("Banner fetch failed", e);
    }

    // 3. Fetch Brand Articles
    // Reusing Bloglist fetch logic for now, slicing first 4 reversed as per previous logic
    const brandRes = await RemoteServices.getBlogList();
    const brandArticles: Article[] = (Array.isArray(brandRes) ? brandRes : brandRes.data || [])
        .reverse()
        .slice(0, 4);

    // 4. Fetch Categories
    let categories: any[] = [];
    try {
        const catRes = await RemoteServices.getBlogCategories();
        categories = catRes.data || [];
        // Ensure "All" is present if not returned
        if (!categories.find((c: any) => c.slug === 'all' || c.title === 'All')) {
            categories.unshift({ id: 'all', title: 'All', slug: 'all' });
        }
    } catch (e) {
        console.error("Category fetch failed", e);
        // Fallback default
        categories = [{ id: 'all', title: 'All', slug: 'all' }];
    }

    return (
        <BlogListingClient
            initialArticles={articles}
            initialBannerData={bannerData as any}
            initialBrandArticles={brandArticles}
            categories={categories}
        />
    );
}
