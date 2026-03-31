import React from "react";

export default function ProductLoading() {
    return (
        <div className="min-h-screen bg-[#f7f7f8] pb-20">
            <div className="max-w-8xl mx-auto px-3 sm:px-4 lg:px-8 py-4">

                {/* Breadcrumb skeleton — 3 items matching actual layout */}
                <div className="flex items-center gap-1 mb-4">
                    <div className="h-4 w-10 bg-gray-200 rounded animate-pulse" />
                    <div className="h-4 w-3 bg-gray-100 rounded animate-pulse" />
                    <div className="h-4 w-20 bg-gray-200 rounded animate-pulse" />
                    <div className="h-4 w-3 bg-gray-100 rounded animate-pulse" />
                    <div className="h-4 w-36 bg-gray-200 rounded animate-pulse" />
                </div>

                {/* Main grid — matches ProductPageClient col layout */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-4 md:gap-5 lg:gap-6 mb-8">

                    {/* Image gallery */}
                    <div className="md:col-span-1 lg:col-span-4">
                        <div className="flex gap-2.5">
                            <div className="hidden md:flex flex-col gap-1.5">
                                {Array.from({ length: 5 }, (_, i) => (
                                    <div key={i} className="w-13.5 h-13.5 bg-gray-200 rounded-lg animate-pulse" />
                                ))}
                            </div>
                            <div className="flex-1 aspect-square bg-gray-200 rounded-2xl animate-pulse" />
                        </div>
                        <div className="md:hidden flex gap-2 mt-2">
                            {Array.from({ length: 4 }, (_, i) => (
                                <div key={i} className="w-12 h-12 bg-gray-200 rounded-lg animate-pulse" />
                            ))}
                        </div>
                    </div>

                    {/* BuyBox */}
                    <div className="md:col-span-1 lg:col-span-5">
                        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                            <div className="px-4 pt-4 pb-3 border-b border-gray-50 space-y-2">
                                <div className="flex justify-between">
                                    <div className="h-3 w-16 bg-gray-200 rounded animate-pulse" />
                                    <div className="h-7 w-16 bg-gray-100 rounded-xl animate-pulse" />
                                </div>
                                <div className="h-6 w-3/4 bg-gray-200 rounded-lg animate-pulse" />
                                <div className="h-3 w-20 bg-gray-100 rounded animate-pulse" />
                            </div>
                            <div className="px-4 py-3 border-b border-gray-50 bg-gray-50/40 space-y-2">
                                <div className="h-9 w-40 bg-gray-200 rounded-lg animate-pulse" />
                                <div className="h-3 w-16 bg-gray-100 rounded animate-pulse" />
                            </div>
                            <div className="px-4 py-3 space-y-2.5">
                                <div className="h-4 w-24 bg-gray-100 rounded animate-pulse" />
                                <div className="grid grid-cols-3 gap-2">
                                    <div className="h-10 bg-gray-200 rounded-xl animate-pulse" />
                                    <div className="h-10 bg-gray-200 rounded-xl animate-pulse" />
                                    <div className="h-10 bg-gray-200 rounded-xl animate-pulse" />
                                </div>
                                <div className="h-9 w-full bg-gray-100 rounded-xl animate-pulse" />
                            </div>
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className="hidden lg:block lg:col-span-3 space-y-4">
                        <div className="bg-white rounded-2xl border border-gray-100 p-4 space-y-3">
                            <div className="h-4 w-24 bg-gray-200 rounded animate-pulse" />
                            {Array.from({ length: 3 }, (_, i) => (
                                <div key={i} className="flex gap-3">
                                    <div className="w-8 h-8 bg-gray-100 rounded-xl animate-pulse shrink-0" />
                                    <div className="flex-1 space-y-1.5 py-0.5">
                                        <div className="h-3 w-full bg-gray-100 rounded animate-pulse" />
                                        <div className="h-2.5 w-2/3 bg-gray-50 rounded animate-pulse" />
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="bg-white rounded-2xl border border-gray-100 p-4 space-y-3">
                            <div className="h-4 w-28 bg-gray-200 rounded animate-pulse" />
                            <div className="grid grid-cols-4 gap-2">
                                {Array.from({ length: 4 }, (_, i) => (
                                    <div key={i} className="aspect-3/2 bg-gray-100 rounded-xl animate-pulse" />
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Description skeleton */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-4 py-5">
                    <div className="h-6 w-44 bg-gray-200 rounded-lg animate-pulse mb-4" />
                    <div className="space-y-2.5">
                        {Array.from({ length: 5 }, (_, i) => (
                            <div key={i} className="h-4 bg-gray-100 rounded animate-pulse" style={{ width: `${95 - i * 8}%` }} />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
