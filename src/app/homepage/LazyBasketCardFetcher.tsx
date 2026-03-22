'use client';

import React, { useState, useEffect } from 'react';
import { useInView } from 'react-intersection-observer';
import BasketCard from './BasketCard';
import SkeletonCard from '@/app/skeleton/SkeletonCard';
import { CategoryService } from '../api/services/category.service';

interface LazyBasketCardFetcherProps {
    title?: string;
    slug: string;
    brandSlug?: string;
    minPrice?: number;
    maxPrice?: number;
}

export default function LazyBasketCardFetcher({ title, slug, brandSlug, minPrice, maxPrice }: LazyBasketCardFetcherProps) {
    const [data, setData] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [hasFetched, setHasFetched] = useState(false);

    const { ref, inView } = useInView({
        triggerOnce: true,
        rootMargin: '200px 0px', // Load 200px before scrolling into view
    });

    useEffect(() => {
        if (inView && !hasFetched) {
            setHasFetched(true);
            setIsLoading(true);

            const params: any = { per_page: 10 };
            if (brandSlug) params.brand = brandSlug;
            if (minPrice !== undefined) params.min_price = minPrice;


            CategoryService.getCategoryProducts(slug, params)
                .then((res) => {
                    if (res && res.data) {
                        setData(res.data);
                    }
                })
                .catch((error: any) => {
                    if (error?.response?.status !== 404) {
                        console.error(`Failed to fetch lazy products for category ${slug}:`, error?.message || 'Unknown error');
                    }
                })
                .finally(() => {
                    setIsLoading(false);
                });
        }
    }, [inView, hasFetched, slug, brandSlug, minPrice, maxPrice]);

    return (
        <div ref={ref} className="min-h-[200px] w-full mt-4">
            {isLoading || !hasFetched ? (
                <SkeletonCard />
            ) : data && data.products && data.products.length > 0 ? (
                <BasketCard
                    title={title || data.category?.name || data.category?.title}
                    slug={slug}
                    initialData={data}
                />
            ) : null}
        </div>
    );
}
