'use server'


import { getBlogList } from '../services/blog.service';
import { decorateProduct } from './productDecorator';
import type { ProductData } from '../../types/ProductDetailsTypes';
import { getCategoryProducts } from '../services/category.service';

export async function getRandomBasketProducts(slug: string, count: number = 10) {
    try {
        // Fetch a larger single batch to avoid duplicate parallel requests and cache collision
        const response = await getCategoryProducts(slug, { per_page: count, page: 1, sort: 'newest', brand: '' });
        const rawProducts = response?.data?.products ?? response?.data ?? [];

        // Apply an in-memory shuffle to create "randomness" without hammering the API
        const shuffled = [...rawProducts].sort(() => 0.5 - Math.random())
            .slice(0, count)
            .map((p: ProductData, idx: number) => decorateProduct(p, idx));

        return { products: shuffled };
    } catch (error) {
        console.error(`getRandomBasketProducts failed for ${slug}:`, error);
        return { products: [] };
    }
}

export async function getRandomBlogList(params: { category?: string; search?: string; page?: number; per_page?: number, sort?: string } = {
    sort: 'desc',

}) {
    try {
        const result = await getBlogList({ ...params });
        return result?.data || result || [];
    } catch (error) {
        console.error('getRandomBlogList failed:', error);
        return [];
    }
}
