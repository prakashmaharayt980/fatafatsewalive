'use client';

import React, { useState, useEffect } from 'react';
import { useInView } from 'react-intersection-observer';
import BasketCardwithImage from './BasketCardwithImage';
import SkeletonCard from '@/app/skeleton/SkeletonCard';
import { CategoryService } from '../api/services/category.service';
import { MiscService } from '../api/services/misc.service';

interface BasketCardwithImageFetcherProps {
    title?: string;
    slug: string;
}

export default function BasketCardwithImageFetcher({ title, slug }: BasketCardwithImageFetcherProps) {
    const [data, setData] = useState<any>(null);
    const [bannerImageUrl, setBannerImageUrl] = useState<string | undefined>(undefined);
    const [isLoading, setIsLoading] = useState(false);
    const [hasFetched, setHasFetched] = useState(false);

    const { ref, inView } = useInView({
        triggerOnce: true,
        rootMargin: '200px 0px',
    });

    useEffect(() => {
        if (inView && !hasFetched) {
            setHasFetched(true);
            setIsLoading(true);

            Promise.allSettled([
                CategoryService.getCategoryProducts(slug, { per_page: 10 }).then(res => res.data),
                MiscService.getBannerBySlug('right-slider-thumbnail-test').then(res => res.data)
            ])
            .then(([productsRes, bannerRes]) => {
                if (productsRes.status === 'fulfilled' && productsRes.value) {
                    setData(productsRes.value);
                }
                if (bannerRes.status === 'fulfilled' && bannerRes.value) {
                    const bData = bannerRes.value;
                    setBannerImageUrl(bData?.images?.[0]?.url || bData?.images?.[0]?.image?.full);
                }
            })
            .catch((error: any) => {
                console.error(`Failed to lazy fetch for category ${slug}:`, error?.message || 'Unknown error');
            })
            .finally(() => {
                setIsLoading(false);
            });
        }
    }, [inView, hasFetched, slug]);

    return (
        <div ref={ref} className="min-h-[200px] w-full mt-4">
            {isLoading || !hasFetched ? (
                <SkeletonCard />
            ) : data && data.products && data.products.length > 0 ? (
                <BasketCardwithImage
                    title={title || data.category?.name || data.category?.title}
                    slug={slug}
                    imageUrl={bannerImageUrl}
                    initialData={data}
                />
            ) : null}
        </div>
    );
}
