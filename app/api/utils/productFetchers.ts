'use server'

import { getBlogList } from '../services/blog.service'
import { decorateProduct } from './productDecorator'
import type { ProductData } from '../../types/ProductDetailsTypes'
import { getCategoryProducts } from '../services/category.service'

export async function getRandomBasketProducts(slug: string, count: number = 10) {
    try {
        const response = await getCategoryProducts(slug, { per_page: count, page: 1, sort: 'newest', brand: '' })
        const rawProducts = response?.data?.products ?? response?.data ?? []
        // No randomization to ensure deterministic SSR and caching
        const products = [...rawProducts]
            .slice(0, count)
            .map((p: ProductData, idx: number) => decorateProduct(p, idx))
        return { products }
    } catch (error) {
        console.error(`getRandomBasketProducts failed for ${slug}:`, error)
        return { products: [] }
    }
}

export async function getFilteredBasketProducts(slug: string, options: { brand?: string; min_price?: number; count?: number; emi_enabled?: boolean } = {}) {
    const { brand = '', min_price, count = 10, emi_enabled } = options
    try {
        const response = await getCategoryProducts(slug, { per_page: count, page: 1, sort: 'newest', brand, min_price, emi_enabled })
        const rawProducts = response?.data?.products ?? response?.data ?? []
        const decorated = rawProducts.map((p: ProductData, idx: number) => decorateProduct(p, idx))
        return { products: decorated }
    } catch (error) {
        console.error(`getFilteredBasketProducts failed for ${slug}:`, error)
        return { products: [] }
    }
}

export async function getRandomBlogList(params: { category?: string; search?: string; page?: number; per_page?: number; sort?: string } = { sort: 'desc' }) {
    try {
        const result = await getBlogList({ ...params })
        return result?.data || result || []
    } catch (error) {
        console.error('getRandomBlogList failed:', error)
        return []
    }
}
