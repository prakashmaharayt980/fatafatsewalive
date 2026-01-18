'use client';

import React from 'react';
import Link from 'next/link';
import useSWR from 'swr';
import RemoteServices from '@/app/api/remoteservice';
import { Layers } from 'lucide-react';

const CategoryWidget = () => {
    const { data: categories, isLoading } = useSWR('blog-sidebar-categories', () =>
        RemoteServices.getCategoriesAll().then(res => res.data?.slice(0, 8) || [])
    );

    if (isLoading) return <div className="h-48 bg-gray-100 rounded-2xl animate-pulse"></div>;
    if (!categories || categories.length === 0) return null;

    return (
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
            <h3 className="text-lg font-bold text-gray-900 mb-4 font-heading flex items-center gap-2">
                <Layers className="w-5 h-5 text-blue-600" />
                Categories
            </h3>
            <div className="flex flex-wrap gap-2">
                {categories.map((cat: any) => (
                    <Link
                        key={cat.id}
                        href={`/category/${cat.slug}?id=${cat.id}`}
                        className="px-3 py-1.5 bg-gray-50 text-gray-600 text-xs font-medium rounded-lg hover:bg-blue-50 hover:text-blue-600 transition-colors border border-gray-100"
                    >
                        {cat.title}
                    </Link>
                ))}
            </div>
        </div>
    );
};

export default CategoryWidget;
