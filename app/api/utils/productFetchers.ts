'use server'

import { getCachedCategoryProducts } from './categoryCache';
import { getBlogList } from '../services/blog.service';

export async function getRandomBasketProducts(slug: string, count: number = 10) {
    try {
        const [page1, page2] = await Promise.all([
            getCachedCategoryProducts(slug, { per_page: count, page: 1, sort: 'newest' }),
            getCachedCategoryProducts(slug, { per_page: count, page: 2, sort: 'newest' }),
        ]);
        const p1 = page1?.data?.products ?? page1?.data ?? [];
        const p2 = page2?.data?.products ?? page2?.data ?? [];
        return { data: { products: [...p1, ...p2] } };
    } catch (error) {
        console.error(`getRandomBasketProducts failed for ${slug}:`, error);
        return getCachedCategoryProducts(slug, { per_page: count, sort: 'newest' });
    }
}

export async function getRandomBlogList(params: { category?: string; per_page?: number } = {}) {
    try {
        const result = await getBlogList({ ...params, page: 1 , sort:'asc'});
        return result?.data || result || [];
    } catch (error) {
        console.error('getRandomBlogList failed:', error);
        return [];
    }
}
