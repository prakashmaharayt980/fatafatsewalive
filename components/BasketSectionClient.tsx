'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import LazySection from './LazySection';
import SkeletonCard from '@/app/skeleton/SkeletonCard';
import { getCachedCategoryProducts } from '@/app/api/utils/categoryCache';
import { getBannerBySlug } from '@/app/api/services/misc.service';
import { decorateProduct } from '@/app/api/utils/productDecorator';

// Dynamic imports (outside for performance)
const BasketCard = dynamic(() => import('@/app/homepage/BasketCard'), { ssr: true });
const BasketCardwithImage = dynamic(() => import('@/app/homepage/BasketCardwithImage'), { ssr: true });

interface BasketSectionClientProps {
    slug: string;
    title: string;
    imgSlug?: string;
    isFirstSection?: boolean;
    sectionIndex?: number;
}

export default function BasketSectionClient({ slug, title, imgSlug, isFirstSection = false, sectionIndex = 0 }: BasketSectionClientProps) {
    // Only pre-fetch the first (above-fold) section; all others wait for actual scroll
    const rootMargin = sectionIndex === 0 ? '100px' : '0px';
    return (
        <LazySection
            fallback={<SkeletonCard />}
            minHeight="400px"
            rootMargin={rootMargin}
            fetcher={async () => {
                const [prodRes, bannerRes] = await Promise.allSettled([
                    getCachedCategoryProducts(slug, { per_page: 10 }),
                    imgSlug ? getBannerBySlug(imgSlug).then(res => res.data) : Promise.resolve(null)
                ]);

                const productsData = prodRes.status === 'fulfilled' ? prodRes.value : null;
                const bData = bannerRes.status === 'fulfilled' ? bannerRes.value : null;
                const bannerUrl = bData?.images?.[0]?.url;
                
                // API body is { data: { products: [...] } }
                const rawProducts = productsData?.data?.products || productsData?.products || [];
                const decoratedProducts = rawProducts.map((p: any, idx: number) => decorateProduct(p, idx));
                const innerData = productsData?.data || productsData;
                return { 
                    products: innerData ? { ...innerData, products: decoratedProducts } : null, 
                    bannerUrl 
                };
            }}
            render={(data) => {
                if (!data.products) return null;
                
                return data.bannerUrl ? (
                    <BasketCardwithImage
                        title={title}
                        slug={slug}
                        imageUrl={data.bannerUrl}
                        initialData={data.products}
                        isFirstSection={isFirstSection}
                    />
                ) : (
                    <BasketCard
                        title={title}
                        slug={slug}
                        initialData={data.products}
                        isFirstSection={isFirstSection}
                    />
                );
            }}
        />
    );
}
