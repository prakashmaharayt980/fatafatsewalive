'use server'

import { cacheLife, cacheTag } from 'next/cache'
import { searchProducts } from '@/app/api/services/product.service'

export async function fetchEmiProducts(slug: string, per_page = 20) {
    'use cache'
    cacheLife('hours')
    cacheTag('emi-products', `emi-${slug}`)
    const res = await searchProducts({ categories: slug, per_page })
    return res?.data ?? res?.products ?? []
}
