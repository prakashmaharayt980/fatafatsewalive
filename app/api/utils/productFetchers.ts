import { getCachedCategoryProducts } from './categoryCache';
import { getBlogList } from '../services/blog.service';

/**
 * Fetches products from a category with randomized page selection.
 * Logic:
 * 1. Fetch Page 1 (10 items) to get meta.total
 * 2. Pick ONE random page from the total available
 * 3. Fetch that specific page
 */
export async function getRandomBasketProducts(slug: string, count: number = 10) {
    const perPage = 10;
    const sort = 'newest';

    try {
        // 1. Initial fetch to get total (very fast if cached)
        const firstPage = await getCachedCategoryProducts(slug, { per_page: perPage, page: 1, sort });
        const meta = firstPage?.meta || firstPage?.data?.meta || {};
        const total = meta.total || 0;

        if (total <= perPage) return firstPage;

        // 2. Pick ONE random page
        const totalPages = Math.ceil(total / perPage);
        const randomPage = Math.floor(Math.random() * Math.min(totalPages, 10)) + 1; // Limit to first 10 pages for quality

        if (randomPage === 1) return firstPage;

        // 3. Fetch that specific random page
        const result = await getCachedCategoryProducts(slug, { per_page: perPage, page: randomPage, sort });
        
        return result;
    } catch (error) {
        console.error(`getRandomBasketProducts failed for ${slug}:`, error);
        return getCachedCategoryProducts(slug, { per_page: count, sort });
    }
}

/**
 * Randomizes blog fetching by picking a random page.
 */
export async function getRandomBlogList(params: { category?: string; per_page?: number } = {}) {
    const perPage = params.per_page || 10;
    try {
        // 1. Initial fetch to get total
        const firstPage = await getBlogList({ ...params, per_page: perPage, page: 1 });
        const total = firstPage?.meta?.total || firstPage?.total || 0;

        if (total <= perPage) return firstPage?.data || firstPage || [];

        // 2. Pick a random page from the first 5 pages for freshness
        const totalPages = Math.ceil(total / perPage);
        const randomPage = Math.floor(Math.random() * Math.min(totalPages, 5)) + 1;

        if (randomPage === 1) return firstPage?.data || firstPage || [];

        const result = await getBlogList({ ...params, per_page: perPage, page: randomPage });
        return result?.data || result || [];
    } catch (error) {
        console.error("getRandomBlogList failed:", error);
        const fallback = await getBlogList({ ...params, per_page: perPage });
        return fallback?.data || fallback || [];
    }
}
