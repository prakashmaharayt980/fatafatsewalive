'use client';

import React from 'react';
import LazySection from './LazySection';
import { getBannerData } from '@/app/api/CachedHelper/getBannerData';
import SkeletonCard from '@/app/skeleton/SkeletonCard';

interface BannerSectionClientProps {
    slug: string;
    Component: React.ComponentType<{ data: any }>;
    className?: string;
}

export default function BannerSectionClient({ slug, Component, className }: BannerSectionClientProps) {
    return (
        <LazySection
            fetcher={() => getBannerData(slug)}
            component={(data) => <Component data={data} />}
            fallback={<SkeletonCard />}
            className={className}
        />
    );
}
