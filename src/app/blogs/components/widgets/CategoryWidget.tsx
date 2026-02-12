'use client';

import React from 'react';
import Link from 'next/link';
import useSWR from 'swr';
import RemoteServices from '@/app/api/remoteservice';
import { Layers } from 'lucide-react';

const CategoryWidget = () => {
    const { data: categories, isLoading } = useSWR('blog-sidebar-categories', () =>
        RemoteServices.getAllCategories().then(res => res.data?.slice(0, 8) || [])
    );

    if (isLoading) return <div className="h-48 bg-gray-100 rounded-2xl animate-pulse"></div>;
    if (!categories || categories.length === 0) return null;

    return (
        <div className="bg-white rounded-2xl p-5 border-2 border-gray-100 shadow-md hover:shadow-xl transition-shadow">
            <h3 className="text-xl font-bold text-gray-900 mb-5 font-heading flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[var(--colour-fsP2)] to-blue-700 flex items-center justify-center">
                    <Layers className="w-4 h-4 text-white" />
                </div>
                Categories
            </h3>
            <div className="flex flex-wrap gap-2">
                {categories.map((cat: any) => (
                    <Link
                        key={cat.id}
                        href={`/category/${cat.slug}?id=${cat.id}`}
                        className="px-4 py-2 bg-gradient-to-br from-gray-50 to-white text-gray-700 text-xs font-bold rounded-lg hover:bg-gradient-to-r hover:from-[var(--colour-fsP2)] hover:to-blue-700 hover:text-white transition-all border-2 border-gray-100 hover:border-[var(--colour-fsP2)] hover:shadow-md"
                    >
                        {cat.title}
                    </Link>
                ))}
            </div>
        </div>
    );
};

export default CategoryWidget;
