'use server'

import { searchProducts, getProductBySlug } from '@/app/api/services/product.service'

export async function fetchSearchProducts(params: { search?: string; categories?: string | number; brands?: string | number; per_page?: number; page?: number; sort?: string; emi?: boolean }) {
    return searchProducts(params)
}

export async function fetchProductBySlug(slug: string) {
    return getProductBySlug(slug)
}
