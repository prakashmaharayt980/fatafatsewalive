'use server'

import { getRandomBasketProducts, getRandomBlogList } from '@/app/api/utils/productFetchers'
import { getCategoryProducts, getAllCategories } from '@/app/api/services/category.service'
import { getBannerData } from '@/app/api/CachedHelper/getBannerData'

export async function fetchRandomBasketProducts(slug: string, count = 8) {
    return getRandomBasketProducts(slug, count)
}

export async function fetchRandomBlogList(params: { category?: string; per_page?: number }) {
    return getRandomBlogList(params)
}

export async function fetchCategoryProducts(slug: string, opts: { brand?: string; min_price?: number; max_price?: number; per_page?: number; page?: number } = {}) {
    return getCategoryProducts(slug, opts as any)
}

export async function fetchAllCategories() {
    return getAllCategories()
}

export async function fetchBannerData(slug: string) {
    return getBannerData(slug)
}
