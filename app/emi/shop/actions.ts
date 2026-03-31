'use server'

import { searchProducts } from '@/app/api/services/product.service'

export async function fetchEmiProducts(slug: string, per_page = 20) {
    const res = await searchProducts({ categories: slug, per_page })
    return res?.data ?? res?.products ?? []
}
