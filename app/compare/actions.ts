'use server'

import { searchProducts } from '@/app/api/services/product.service'

export async function fetchSearchProducts(params: { search?: string; categories?: string | number; brands?: string | number; per_page?: number; page?: number }) {
    return searchProducts(params)
}
