import React from "react";

export default function ProductLoading() {
    return (
        <div className="min-h-screen bg-[#f7f7f8] pb-20">
            <div className="max-w-8xl mx-auto px-3 sm:px-4 lg:px-8 py-4">

                {/* Breadcrumb skeleton */}
                <div className="flex items-center gap-1 mb-6">
                    <div className="h-3.5 w-12 bg-gray-200 rounded animate-pulse" />
                    <div className="h-3.5 w-3 bg-gray-100 rounded animate-pulse" />
                    <div className="h-3.5 w-24 bg-gray-200 rounded animate-pulse" />
                    <div className="h-3.5 w-3 bg-gray-100 rounded animate-pulse" />
                    <div className="h-3.5 w-40 bg-gray-200 rounded animate-pulse" />
                </div>

                {/* Main section grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-3 mb-8">

                    {/* Image Gallery Column */}
                    <div className="md:col-span-1 lg:col-span-4">
                        <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm space-y-4">
                            <div className="aspect-square bg-gray-100 rounded-xl animate-pulse w-full" />
                            <div className="flex gap-2 overflow-hidden">
                                {Array.from({ length: 4 }, (_, i) => (
                                    <div key={i} className="w-16 h-16 bg-gray-100 rounded-lg animate-pulse shrink-0" />
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* BuyBox Column */}
                    <div className="md:col-span-1 lg:col-span-5">
                        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm h-full overflow-hidden flex flex-col">
                            {/* Header details */}
                            <div className="px-5 pt-5 pb-4 border-b border-gray-50 flex flex-col gap-3">
                                <div className="flex justify-between items-start">
                                    <div className="h-4 w-28 bg-gray-100 rounded animate-pulse" />
                                    <div className="h-8 w-16 bg-gray-50 rounded-xl animate-pulse" />
                                </div>
                                <div className="h-7 w-5/6 bg-gray-200 rounded-lg animate-pulse" />
                                <div className="h-3 w-32 bg-gray-50 rounded animate-pulse" />
                            </div>

                            {/* Price / Offer area */}
                            <div className="px-5 py-4 border-b border-gray-50 bg-gray-50/30 flex flex-col gap-2">
                                <div className="h-10 w-44 bg-gray-200 rounded-lg animate-pulse" />
                                <div className="h-4 w-24 bg-gray-100 rounded animate-pulse" />
                            </div>

                            {/* Selection / Variant area */}
                            <div className="p-5 space-y-5 flex-1">
                                <div className="space-y-3">
                                    <div className="h-4 w-20 bg-gray-100 rounded animate-pulse" />
                                    <div className="flex gap-2">
                                        {Array.from({ length: 3 }, (_, i) => (
                                            <div key={i} className="h-11 w-20 bg-gray-200 rounded-xl animate-pulse" />
                                        ))}
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <div className="h-4 w-20 bg-gray-100 rounded animate-pulse" />
                                    <div className="flex gap-2">
                                        {Array.from({ length: 4 }, (_, i) => (
                                            <div key={i} className="h-10 w-10 bg-gray-200 rounded-full animate-pulse" />
                                        ))}
                                    </div>
                                </div>

                                {/* Buttons */}
                                <div className="pt-2 grid grid-cols-2 gap-3">
                                    <div className="h-12 bg-gray-100 rounded-xl animate-pulse" />
                                    <div className="h-12 bg-gray-800/10 rounded-xl animate-pulse" />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Sidebar Column */}
                    <div className="hidden lg:block lg:col-span-3 space-y-3">
                        <div className="bg-white rounded-2xl border border-gray-100 p-5 space-y-4">
                            <div className="h-5 w-32 bg-gray-200 rounded animate-pulse" />
                            {Array.from({ length: 3 }, (_, i) => (
                                <div key={i} className="flex gap-4">
                                    <div className="w-10 h-10 bg-gray-100 rounded-xl animate-pulse shrink-0" />
                                    <div className="flex-1 space-y-2 py-1">
                                        <div className="h-3 w-full bg-gray-100 rounded animate-pulse" />
                                        <div className="h-2 w-2/3 bg-gray-50 rounded animate-pulse" />
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="bg-white rounded-2xl border border-gray-100 p-5 space-y-4">
                            <div className="h-5 w-36 bg-gray-200 rounded animate-pulse" />
                            <div className="grid grid-cols-4 gap-2">
                                {Array.from({ length: 4 }, (_, i) => (
                                    <div key={i} className="aspect-[4/3] bg-gray-100 rounded-xl animate-pulse" />
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Lower details section */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-8">
                    <div className="flex border-b border-gray-100 mb-6">
                        <div className="h-10 w-24 bg-gray-100 rounded-t-lg animate-pulse mr-4" />
                        <div className="h-10 w-24 bg-gray-50 rounded-t-lg animate-pulse" />
                    </div>
                    <div className="space-y-4">
                        <div className="h-5 w-48 bg-gray-100 rounded animate-pulse" />
                        <div className="space-y-2">
                            {Array.from({ length: 6 }, (_, i) => (
                                <div key={i} className="h-4 bg-gray-50 rounded animate-pulse" style={{ width: `${100 - i * 5}%` }} />
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
