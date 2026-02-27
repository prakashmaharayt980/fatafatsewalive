'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import useSWR from 'swr';
import RemoteServices from '../api/remoteservice';
import { trackCategoryClick } from '@/lib/analytics';

// Reuse category fetcher or types if needed, or define local ones for simplicity
const fetcher = async () => {
    const res = await RemoteServices.getAllCategories();
    return res.data;
};

const CategoryGrid = () => {
    // 1. Fetch categories
    const { data: categories, error } = useSWR('categories-grid', fetcher, {
        revalidateOnFocus: false,
    });

    const displayCategories = Array.isArray(categories) ? categories.slice(0, 10) : []; // Show top 10

    if (!displayCategories.length) return null;

    return (
        <div className="w-full max-w-[1400px] mx-auto px-3 sm:px-6 my-6 sm:my-8">
            {/* Header */}
            <div className="flex items-center justify-between px-2 sm:px-0 mb-4 sm:mb-6 pb-2 border-b border-gray-100">
                <h2 className="text-xl sm:text-2xl font-black text-slate-800 tracking-tight relative inline-block">
                    Browse Categories
                    {/* Straight line underline extending slightly */}
                    <span className="absolute -bottom-2 left-0 w-[120%] h-[3px] bg-blue-600 rounded-sm"></span>
                </h2>
                <Link
                    href="/categories"
                    className="flex items-center gap-1 text-sm font-bold text-blue-600 hover:text-blue-700 transition-colors group"
                    onClick={() => trackCategoryClick('Browse Categories', 'view_all')}
                >
                    View All <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
                </Link>
            </div>

            {/* Grid Layout */}
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-2 sm:gap-4">
                {displayCategories.map((category) => (
                    <Link
                        key={category.id}
                        href={`/category/${category.slug}`}
                        className="group relative flex flex-col items-center p-2 sm:p-4 bg-white rounded-xl sm:rounded-2xl border border-gray-100 hover:border-blue-200 shadow-sm hover:shadow-lg transition-all duration-300"
                        onClick={() => trackCategoryClick(category.title, 'grid_click')}
                    >
                        {/* Image Container */}
                        <div className="relative w-14 h-14 sm:w-20 sm:h-20 md:w-24 md:h-24 mb-2 sm:mb-3 rounded-full bg-gray-50 group-hover:bg-blue-50 transition-colors duration-300 flex items-center justify-center overflow-hidden">
                            {category.image?.default ? (
                                <Image
                                    src={category.image.default}
                                    alt={category.title}
                                    fill
                                    className="object-cover p-1.5 sm:p-2 transition-transform duration-500 group-hover:scale-110"
                                    sizes="100px"
                                />
                            ) : (
                                <div className="text-gray-300 text-xs">No Img</div>
                            )}
                        </div>

                        {/* Title */}
                        <h3 className="text-[11px] sm:text-sm font-bold text-gray-700 group-hover:text-blue-600 text-center line-clamp-2 transition-colors">
                            {category.title}
                        </h3>

                        {/* Subtle Arrow (Optional) */}
                        <div className="absolute top-2 right-2 sm:top-3 sm:right-3 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300">
                            <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4 text-blue-400" />
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
};

export default CategoryGrid;
