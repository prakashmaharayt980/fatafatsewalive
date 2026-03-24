'use client';

import React from 'react';
import LazySection from './LazySection';
import { getBlogList } from '@/app/api/services/blog.service';
import OurArticles from '@/app/homepage/OurArticles';

export default function OurArticlesSectionClient() {
    return (
        <LazySection
            fallback={<div className="min-h-[400px] animate-pulse bg-gray-50 rounded-2xl" />}
            minHeight="400px"
            fetcher={() => getBlogList({ per_page: 5 }).then(res => Array.isArray(res) ? res : (res.data || []))}
            render={(data) => <OurArticles blogpage="home" initialData={data} />}
        />
    );
}
