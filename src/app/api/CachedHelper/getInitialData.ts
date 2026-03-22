'use server';

import { unstable_cache } from 'next/cache';

import { CategoryService } from '@/app/api/services/category.service';
import { MiscService } from '../services/misc.service';
import { ProductService } from '../services/product.service';
import { BlogService } from '../services/blog.service';

// --- Homepage Data Fetcher ---
export const getHomepageData = async () => {
    // 1. Fetch Critical Banners
    const criticalSlugs = {
        main: 'main-banner-test',
        side: 'test-slug-banner',
    };

    const bannerPromises = Object.entries(criticalSlugs).map(async ([key, slug]) => {
        try {
            const res = await MiscService.getBannerBySlug(slug);
            return { key, data: res.data || null };
        } catch (e) {
            console.error(`Failed to fetch critical banner: ${slug}`, e);
            return { key, data: null };
        }
    });

    const bannerResults = await Promise.all(bannerPromises);

    const criticalData = bannerResults.reduce((acc, { key, data }) => {
        acc[key] = data;
        return acc;
    }, {} as Record<string, any>);

    return {
        criticalData
    };
};

// --- Blog Page Data Fetcher ---
export const getBlogPageData = unstable_cache(
    async () => {


        const [bannerRes, dealsRes, blogRes] = await Promise.allSettled([
            MiscService.getBannerBySlug('blog-banner-test'),
            ProductService.searchProducts({ search: 'Pro', page: 1, per_page: 10 }),
            BlogService.getBlogList({ page: 1, per_page: 12 }),
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
        revalidate: 1,
        tags: ['blog', 'banner', 'products']
    }
);
