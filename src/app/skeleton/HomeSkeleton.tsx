import React from 'react';
import SkeletonCard from './SkeletonCard';

const HomeSkeleton = () => {
    return (
        <div className="w-full space-y-2">
            {/* Banner Section Skeleton - Matches Imgbanner.tsx */}
            <section className="w-full px-3 py-4 sm:px-4 sm:py-4">
                <div className="mx-auto">
                    <div className="flex flex-col lg:flex-row gap-1 sm:gap-2">
                        {/* Main Carousel Skeleton (60% on desktop) */}
                        <div className="w-full lg:w-[60%]">
                            <div className="relative w-full aspect-[1920/700] bg-gray-200 rounded sm:rounded md:rounded animate-pulse" />
                        </div>

                        {/* Side Images Skeleton (40% on desktop) */}
                        <div className="w-full lg:w-[40%] hidden lg:flex flex-col gap-1 h-full">
                            {/* Top Side Image */}
                            <div className="relative flex-1 w-full rounded overflow-hidden bg-gray-200 animate-pulse" />

                            {/* Bottom Two Side Images */}
                            <div className="flex gap-1 flex-1">
                                <div className="relative flex-1 bg-gray-200 animate-pulse rounded" />
                                <div className="relative flex-1 bg-gray-200 animate-pulse rounded" />
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Mobile Phone Section Skeleton - Matches BasketCard.tsx */}
            <div className="w-full py-2 sm:py-3 bg-transparent">
                {/* Header Match */}
                <div className="flex items-center justify-between px-4 sm:px-6 mb-3">
                    <div className="flex items-center gap-3">
                        <div className="w-1 h-7 bg-gray-200 rounded-full animate-pulse" />
                        <div className="h-6 w-40 bg-gray-200 rounded animate-pulse" /> {/* Title: Mobile Phone */}
                    </div>
                    <div className="h-8 w-24 bg-gray-200 rounded-full animate-pulse" /> {/* Button: View All */}
                </div>

                {/* Product List Skeleton */}
                <div className="flex overflow-hidden px-1 sm:px-6 pb-2 mt-2 pt-2 gap-2">
                    {/* Exact widths from BasketCard.tsx: w-1/2 sm:w-1/3 md:w-1/4 lg:w-1/5 */}
                    {[...Array(5)].map((_, i) => (
                        <div
                            key={i}
                            className="flex-shrink-0 w-1/2 sm:w-1/3 md:w-1/4 lg:w-1/5 px-1 sm:px-1.5"
                        >
                            <div className="bg-white rounded-[12px] overflow-hidden border border-gray-100 h-full card-shadow p-2">
                                <div className="aspect-[5/4] bg-gray-200 rounded animate-pulse mb-2" />
                                <div className="space-y-2">
                                    <div className="h-3 w-1/2 bg-gray-200 rounded animate-pulse" />
                                    <div className="h-4 w-full bg-gray-200 rounded animate-pulse" />
                                    <div className="h-4 w-3/4 bg-gray-200 rounded animate-pulse" />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Additional Generic Rows to fill screen */}
            <div className="px-4 py-4 space-y-4 opacity-50">
                <div className="h-64 bg-gray-100 rounded animate-pulse w-full" />
            </div>
        </div>
    );
};

export default HomeSkeleton;
