'use client';

import React from 'react';
import LazySection from './LazySection';
import { CategoryService } from '@/app/api/services/category.service';
import { MiscService } from '@/app/api/services/misc.service';
import BasketCard from '@/app/homepage/BasketCard';
import BasketCardwithImage from '@/app/homepage/BasketCardwithImage';
import SkeletonCard from '@/app/skeleton/SkeletonCard';

interface BasketSectionClientProps {
    slug: string;
    title: string;
    imgSlug?: string;
}

export default function BasketSectionClient({ slug, title, imgSlug }: BasketSectionClientProps) {
    return (
        <LazySection
            fetcher={() =>
                Promise.allSettled([
                    CategoryService.getCategoryProducts(slug, { per_page: 10 }).then(res => res.data),
                    imgSlug ? MiscService.getBannerBySlug(imgSlug).then(res => res.data) : Promise.resolve(null)
                ])
                    .then(([prodRes, bannerRes]) => {
                        const products = prodRes.status === 'fulfilled' ? prodRes.value : null;
                        const bData = bannerRes.status === 'fulfilled' ? bannerRes.value : null;
                        const bannerUrl = bData?.images?.[0]?.url


                        return { products, bannerUrl };
                    })
            }
            component={(data: any) => (
                data.bannerUrl ? (
                    <BasketCardwithImage
                        title={title}
                        slug={slug}
                        imageUrl={data.bannerUrl}
                        initialData={data.products}
                    />
                ) : (
                    <BasketCard
                        title={title}
                        slug={slug}
                        initialData={data.products}
                    />
                )
            )}
            fallback={<SkeletonCard />}
        />
    );
}
