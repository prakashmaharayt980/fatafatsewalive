'use server'

import { getCategoryProducts } from '@/app/api/services/category.service'

export async function fetchCategoryProducts(slug: string, opts: { brand?: string; min_price?: number; max_price?: number; per_page?: number; page?: number } = {}) {
    return getCategoryProducts(slug, opts as any)
}
