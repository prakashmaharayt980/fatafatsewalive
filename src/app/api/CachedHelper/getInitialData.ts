'use server';

import { unstable_cache } from 'next/cache';
import RemoteServices from '@/app/api/remoteservice';
import { CategoryService } from '@/app/api/services/category.service';

// --- Homepage Data Fetcher ---
export const getHomepageData = unstable_cache(
    async () => {
        // 1. Fetch Critical Banners
        const criticalSlugs = {
            main: 'main-banner-test',
            side: 'test-slug-banner',
            category: 'right-slider-thumbnail-test',
        };

        const bannerPromises = Object.entries(criticalSlugs).map(async ([key, slug]) => {
            try {
                const res = await RemoteServices.getBannerBySlug(slug);
                return { key, data: res.data || null };
            } catch (e) {
                console.error(`Failed to fetch critical banner: ${slug}`, e);
                return { key, data: null };
            }
        });

        // 2. Fetch Mobile Phones Product Data (ID: 1)
        const productPromise = CategoryService.getCategoryProducts({ id: '1', per_page: 10 })
            .catch(e => {
                console.error("Failed to fetch mobile phone data", e);
                return null;
            });

        const [bannerResults, mobilePhoneData] = await Promise.all([
            Promise.all(bannerPromises),
            productPromise
        ]);

        const criticalData = bannerResults.reduce((acc, { key, data }) => {
            acc[key] = data;
            return acc;
        }, {} as Record<string, any>);

        return {
            criticalData,
            mobilePhoneData,
        };
    },
    ['homepage-data'], // Cache Key
    {
        revalidate: 3600, // Cache lifetime in seconds (1 hour)
        tags: ['homepage'] // Tag for manual invalidation
    }
);

// --- Blog Page Data Fetcher ---
export const getBlogPageData = unstable_cache(
    async () => {
        // Fetch specific banner for blog
        // Fetch deals (ProductDeals) - 'Pro' search
        // Fetch latest articles (BlogList)

        const [bannerRes, dealsRes, blogRes] = await Promise.allSettled([
            RemoteServices.getBannerBySlug('blog-banner-test'),
            RemoteServices.searchProducts({ search: 'Pro', page: 1, per_page: 10 }),
            RemoteServices.getBlogList({ page: 1, per_page: 12 }),
        ]);

        const bannerData = bannerRes.status === 'fulfilled' ? bannerRes.value.data || null : null;
        const dealProducts = dealsRes.status === 'fulfilled' ? dealsRes.value.data || [] : [];
        const latestArticles = blogRes.status === 'fulfilled'
            ? (Array.isArray(blogRes.value) ? blogRes.value : blogRes.value.data || [])
            : [];

        return {
            bannerData,
            dealProducts,
            latestArticles
        };
    },
    ['blog-page-data'],
    {
        revalidate: 3600,
        tags: ['blog', 'banner', 'products']
    }
);
