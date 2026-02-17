'use client';

import React, { useState, useEffect } from 'react';
import { useInView } from 'react-intersection-observer';
import dynamic from 'next/dynamic';
import SkeletonBanner from '@/app/skeleton/SkeletonBanner';

// Dynamic imports for banner variants to save bundle size
const OneImageBanner = dynamic(() => import('../homepage/Bannerfooter'), {
    loading: () => <SkeletonBanner />
});
const TwoImageBanner = dynamic(() => import('../homepage/Banner2'), {
    loading: () => <SkeletonBanner />
});
const OfferBanner = dynamic(() => import('../homepage/OfferBanner'), {
    loading: () => <div className="w-full h-64 bg-gray-100 animate-pulse rounded-xl" /> // Offer banner might need different height, or use SkeletonBanner with props if adjustable
});

interface BannerFetcherProps {
    slug: string;
    variant?: 'footer' | 'two-image' | 'offer';
    fetchAction: (slug: string) => Promise<any>;
    className?: string;
}

const BannerFetcher = ({
    slug,
    variant = 'footer',
    fetchAction,
    className,
}: BannerFetcherProps) => {
    const [data, setData] = useState<any>(null);
    const [hasFetched, setHasFetched] = useState(false);

    const { ref, inView } = useInView({
        triggerOnce: true,
        threshold: 0.1,
        rootMargin: '200px 0px',
    });

    useEffect(() => {
        if (inView && !hasFetched) {
            setHasFetched(true);
            fetchAction(slug)
                .then((res) => {
                    if (res) setData(res);
                })
                .catch((err) => console.error(`Error loading banner ${slug}:`, err));
        }
    }, [inView, hasFetched, slug, fetchAction]);

    let Component: any;
    switch (variant) {
        case 'two-image':
            Component = TwoImageBanner;
            break;
        case 'offer':
            Component = OfferBanner;
            break;
        case 'footer':
        default:
            Component = OneImageBanner;
            break;
    }

    return (
        <div ref={ref} className={`min-h-[100px] w-full ${className || ''}`} data-track={`banner-${slug}`}>
            {data ? (
                <Component data={data} />
            ) : (
                <SkeletonBanner />
            )}
        </div>
    );
};

export default BannerFetcher;
