
import React from 'react';

export default function ProductLoading() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white pb-20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">

                {/* Breadcrumb Skeleton */}
                <div className="flex gap-2 mb-6 sm:mb-8">
                    <div className="h-5 w-16 bg-gray-200 rounded animate-pulse" />
                    <div className="h-5 w-4 bg-gray-200 rounded animate-pulse" />
                    <div className="h-5 w-24 bg-gray-200 rounded animate-pulse" />
                    <div className="h-5 w-4 bg-gray-200 rounded animate-pulse" />
                    <div className="h-5 w-32 bg-gray-200 rounded animate-pulse" />
                </div>

                {/* Main Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 lg:gap-10 m-4">

                    {/* Left: Image Gallery Skeleton (3/5) */}
                    <div className="lg:col-span-3 space-y-4">
                        {/* Main Image */}
                        <div className="w-full aspect-[4/3] bg-gray-200 rounded-2xl animate-pulse" />

                        {/* Thumbnails */}
                        <div className="grid grid-cols-5 gap-2 sm:gap-4">
                            {[...Array(5)].map((_, i) => (
                                <div key={i} className="aspect-square bg-gray-200 rounded-lg animate-pulse" />
                            ))}
                        </div>
                    </div>

                    {/* Right: Info Skeleton (2/5) */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Title */}
                        <div className="h-8 w-3/4 bg-gray-200 rounded-lg animate-pulse" />

                        {/* Price */}
                        <div className="h-10 w-1/3 bg-gray-200 rounded-lg animate-pulse" />

                        {/* Rating */}
                        <div className="flex gap-1">
                            {[...Array(5)].map((_, i) => (
                                <div key={i} className="w-4 h-4 bg-gray-200 rounded-full animate-pulse" />
                            ))}
                        </div>

                        {/* Divider */}
                        <div className="h-px bg-gray-200 w-full" />

                        {/* Variants (Color) */}
                        <div className="space-y-3">
                            <div className="h-4 w-16 bg-gray-200 rounded animate-pulse" />
                            <div className="flex gap-3">
                                {[...Array(3)].map((_, i) => (
                                    <div key={i} className="w-10 h-10 rounded-full bg-gray-200 animate-pulse" />
                                ))}
                            </div>
                        </div>

                        {/* Quantity */}
                        <div className="space-y-3">
                            <div className="h-4 w-16 bg-gray-200 rounded animate-pulse" />
                            <div className="h-10 w-32 bg-gray-200 rounded-lg animate-pulse" />
                        </div>

                        {/* Buttons */}
                        <div className="flex gap-4 pt-4">
                            <div className="h-12 flex-1 bg-gray-200 rounded-xl animate-pulse" />
                            <div className="h-12 w-12 bg-gray-200 rounded-xl animate-pulse" />
                        </div>

                        {/* Highlights */}
                        <div className="pt-6 space-y-3">
                            <div className="h-5 w-40 bg-gray-200 rounded animate-pulse mb-4" />
                            {[...Array(4)].map((_, i) => (
                                <div key={i} className="flex gap-3">
                                    <div className="w-1.5 h-1.5 mt-2 rounded-full bg-gray-200" />
                                    <div className="h-4 w-full bg-gray-200 rounded animate-pulse" />
                                </div>
                            ))}
                        </div>
                    </div>

                </div>

                {/* Bottom Tabs Skeleton */}
                <div className="mt-16 space-y-4">
                    <div className="flex gap-4 border-b border-gray-200 pb-2">
                        <div className="h-8 w-32 bg-gray-200 rounded-t-lg animate-pulse" />
                        <div className="h-8 w-32 bg-gray-200 rounded-t-lg animate-pulse" />
                    </div>
                    <div className="h-48 bg-gray-100 rounded-xl animate-pulse" />
                </div>

            </div>
        </div>
    );
}
