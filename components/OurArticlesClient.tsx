'use client';

import React from 'react';

import { BlogService } from '@/app/api/services/blog.service';
import OurArticles from '@/app/homepage/OurArticles';
import SkeletonCard from '@/app/skeleton/SkeletonCard';
import LazySection from './LazySection';

export default function OurArticlesClient() {
    return (
        <LazySection
            fetcher={() => BlogService.getBlogList({ per_page: 10 }).then(r => Array.isArray(r) ? r : r.data)}
            component={(data) => <OurArticles blogpage="home" initialData={data} />}
            fallback={<SkeletonCard />}
        />
    );
}
