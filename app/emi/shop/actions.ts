'use server'

import { searchProducts } from '@/app/api/services/product.service'

export async function fetchEmiProducts(slug: string, per_page = 10, brand?: string) {
    const res = await searchProducts({ categories: slug, brands: brand, per_page })
    return res?.data ?? res?.products ?? []
}
