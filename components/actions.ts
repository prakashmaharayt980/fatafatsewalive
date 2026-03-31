'use server'

import { getRandomBasketProducts } from '@/app/api/utils/productFetchers'
import { getBannerBySlug } from '@/app/api/services/misc.service'
import { GetallOfferlist, GetOfferDetailsBySlug } from '@/app/api/services/offers.service'

export async function fetchBasketSection(slug: string, imgSlug?: string) {
    const [prodRes, bannerRes] = await Promise.allSettled([
        getRandomBasketProducts(slug),
        imgSlug ? getBannerBySlug(imgSlug).then(r => r.data) : Promise.resolve(null),
    ])

    const productsData = prodRes.status === 'fulfilled' ? prodRes.value : null
    const bannerData = bannerRes.status === 'fulfilled' ? bannerRes.value : null
    const bannerUrl = bannerData?.images?.[0]?.url

    const innerData = productsData?.data ?? productsData
    const rawProducts = innerData?.products ?? []

    return {
        innerData: innerData ?? null,
        rawProducts,
        bannerUrl: bannerUrl ?? null,
    }
}

export async function fetchOfferData() {
    const campaigns = await GetallOfferlist()
    if (!campaigns?.success || !campaigns.data?.length) return null
    const details = await GetOfferDetailsBySlug(campaigns.data[0].slug)
    return details?.success ? details.data : null
}
