import React from 'react';
import { CategoryService } from '@/app/api/services/category.service';
import { MiscService } from '@/app/api/services/misc.service';
import dynamic from 'next/dynamic';
const BasketCard = dynamic(() => import('@/app/homepage/BasketCard'), { ssr: true });
const BasketCardwithImage = dynamic(() => import('@/app/homepage/BasketCardwithImage'), { ssr: true });

import { decorateProduct } from '@/app/api/utils/productDecorator';

interface BasketSectionServerProps {
    slug: string;
    title: string;
    imgSlug?: string;
}

export default async function BasketSectionServer({ slug, title, imgSlug }: BasketSectionServerProps) {
    const [prodRes, bannerRes] = await Promise.allSettled([
        CategoryService.getCategoryProducts(slug, { per_page: 10 }).then(res => res.data),
        imgSlug ? MiscService.getBannerBySlug(imgSlug).then(res => res.data) : Promise.resolve(null)
    ]);

    const productsData = prodRes.status === 'fulfilled' ? prodRes.value : null;
    const bData = bannerRes.status === 'fulfilled' ? bannerRes.value : null;
    const bannerUrl = bData?.images?.[0]?.url;

    // Decorate products on server
    const decoratedProducts = productsData?.products?.map((p: any, idx: number) => decorateProduct(p, idx)) || [];
    const initialData = productsData ? { ...productsData, products: decoratedProducts } : null;

    return bannerUrl ? (
        <BasketCardwithImage
            title={title}
            slug={slug}
            imageUrl={bannerUrl}
            initialData={initialData}
        />
    ) : (
        <BasketCard
            title={title}
            slug={slug}
            initialData={initialData}
        />
    );
}
