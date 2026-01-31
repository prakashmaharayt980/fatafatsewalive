
import React from 'react';

export default function ProductLoading() {
    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 py-4">

                {/* Breadcrumb Skeleton */}
                <div className="flex gap-2 mb-6">
                    <div className="h-5 w-14 bg-gray-200 rounded animate-pulse" />
                    <div className="h-5 w-3 bg-gray-200 rounded animate-pulse" />
                    <div className="h-5 w-24 bg-gray-200 rounded animate-pulse" />
                    <div className="h-5 w-3 bg-gray-200 rounded animate-pulse" />
                    <div className="h-5 w-40 bg-gray-200 rounded animate-pulse" />
                </div>

                {/* Main 3-column Grid — matches ProductPageClient layout */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-4 md:gap-5 lg:gap-6 mb-8">

                    {/* Column 1: Image Gallery */}
                    <div className="md:col-span-1 lg:col-span-4">
                        <div className="w-full aspect-square max-h-[420px] bg-gray-200 rounded-2xl animate-pulse" />
                        <div className="flex gap-1.5 mt-2">
                            {[1, 2, 3, 4, 5].map((i) => (
                                <div key={i} className="w-14 h-14 bg-gray-200 rounded-lg animate-pulse" />
                            ))}
                        </div>
                    </div>

                    {/* Column 2: BuyBox */}
                    <div className="md:col-span-1 lg:col-span-5">
                        <div className="bg-white rounded-2xl border border-gray-100 p-4 sm:p-6 space-y-4">
                            {/* Brand + rating */}
                            <div className="flex gap-2">
                                <div className="h-4 w-20 bg-gray-200 rounded animate-pulse" />
                                <div className="h-4 w-14 bg-gray-200 rounded animate-pulse" />
                            </div>
                            {/* Title */}
                            <div className="h-7 w-3/4 bg-gray-200 rounded-lg animate-pulse" />
                            {/* SKU */}
                            <div className="h-3 w-24 bg-gray-100 rounded animate-pulse" />
                            {/* Price */}
                            <div className="flex items-end gap-3">
                                <div className="h-10 w-36 bg-gray-200 rounded-lg animate-pulse" />
                                <div className="h-5 w-20 bg-gray-100 rounded animate-pulse" />
                            </div>
                            {/* Highlights */}
                            <div className="space-y-2 pt-2">
                                {[1, 2, 3].map((i) => (
                                    <div key={i} className="flex gap-2">
                                        <div className="w-3.5 h-3.5 rounded-full bg-gray-200 flex-shrink-0 mt-0.5" />
                                        <div className="h-4 w-full bg-gray-100 rounded animate-pulse" />
                                    </div>
                                ))}
                            </div>
                            {/* Buttons */}
                            <div className="flex gap-2 pt-3">
                                <div className="h-11 flex-1 bg-gray-200 rounded-xl animate-pulse" />
                                <div className="h-11 flex-1 bg-gray-200 rounded-xl animate-pulse" />
                                <div className="h-11 flex-1 bg-gray-200 rounded-xl animate-pulse" />
                            </div>
                            {/* Trust badges */}
                            <div className="flex gap-2 pt-3 border-t border-gray-100">
                                {[1, 2, 3].map((i) => (
                                    <div key={i} className="flex-1 h-12 bg-gray-100 rounded-xl animate-pulse" />
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Column 3: Sidebar */}
                    <div className="hidden lg:block lg:col-span-3">
                        <div className="bg-white rounded-2xl border border-gray-100 p-4 space-y-3">
                            <div className="h-5 w-28 bg-gray-200 rounded animate-pulse" />
                            <div className="w-full aspect-[16/9] bg-gray-200 rounded-xl animate-pulse" />
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="flex gap-3">
                                    <div className="w-16 h-14 bg-gray-200 rounded-lg animate-pulse flex-shrink-0" />
                                    <div className="flex-1 space-y-2 py-1">
                                        <div className="h-3.5 w-full bg-gray-200 rounded animate-pulse" />
                                        <div className="h-3 w-2/3 bg-gray-200 rounded animate-pulse" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Description skeleton */}
                <div className="bg-white rounded-2xl border border-gray-100 px-2 py-3 sm:p-6 mb-8">
                    <div className="flex gap-4 border-b border-gray-200 pb-3 mb-4">
                        <div className="h-8 w-28 bg-gray-200 rounded-lg animate-pulse" />
                        <div className="h-8 w-28 bg-gray-200 rounded-lg animate-pulse" />
                    </div>
                    <div className="space-y-3">
                        {[1, 2, 3, 4].map((i) => (
                            <div key={i} className="h-4 w-full bg-gray-100 rounded animate-pulse" />
                        ))}
                        <div className="h-4 w-2/3 bg-gray-100 rounded animate-pulse" />
                    </div>
                </div>
            </div>
        </div>
    );
}
