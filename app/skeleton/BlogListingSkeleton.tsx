import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';

export default function BlogListingSkeleton() {
    return (
        <div className="min-h-screen bg-[var(--colour-bg4)] pb-16">
            <div className="w-full px-3 sm:px-5 lg:px-6 pt-4">

                {/* ─── Hero Banner Skeleton ─── */}
                {/* ─── Hero Banner Skeleton ─── */}
                <div className="w-full mb-8">
                    <Skeleton className="w-full h-[250px] sm:h-[300px] rounded-xl" />
                </div>

                {/* ─── Main Content ─── */}
                <div className="space-y-8">

                    {/* ═══ 1. Blog Grid (3/4) + Sidebar (1/4) ═══ */}
                    <div className="flex flex-col lg:flex-row gap-5">
                        <div className="w-full lg:w-3/4">
                            {/* Header */}
                            <div className="flex justify-between items-center mb-4">
                                <div className="flex items-center gap-2.5">
                                    <Skeleton className="w-1 h-6 rounded-full" />
                                    <Skeleton className="h-6 w-40" />
                                </div>
                                <Skeleton className="h-6 w-24 rounded-full" />
                            </div>
                            {/* Grid */}
                            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
                                {[...Array(8)].map((_, i) => (
                                    <div key={i} className="flex flex-col gap-2">
                                        <Skeleton className="w-full aspect-[4/3] rounded-lg" />
                                        <Skeleton className="h-4 w-full" />
                                        <Skeleton className="h-3 w-2/3" />
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Sidebar Deals */}
                        <div className="hidden lg:block w-full lg:w-1/4 space-y-4">
                            <div className="flex items-center gap-2 mb-4">
                                <Skeleton className="w-6 h-6 rounded" />
                                <Skeleton className="h-5 w-32" />
                            </div>
                            {[...Array(6)].map((_, i) => (
                                <div key={i} className="flex gap-3">
                                    <Skeleton className="w-16 h-16 rounded-md flex-shrink-0" />
                                    <div className="flex-1 space-y-2">
                                        <Skeleton className="h-3 w-full" />
                                        <Skeleton className="h-3 w-1/2" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>


                    {/* ═══ 2. Banner Section ═══ */}
                    <div className="w-full">
                        <div className="relative overflow-hidden rounded border border-gray-200 bg-white">
                            <Skeleton className="w-full h-[120px] sm:h-[150px]" />
                        </div>
                    </div>

                    {/* ═══ 5. Web Stories ═══ */}
                    <div>
                        <div className="flex items-center gap-2.5 mb-4">
                            <Skeleton className="w-1 h-6 rounded-full" />
                            <Skeleton className="h-6 w-40" />
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2.5">
                            {[...Array(5)].map((_, i) => (
                                <Skeleton key={i} className="aspect-[9/16] rounded-lg" />
                            ))}
                        </div>
                    </div>

                    {/* ═══ 3. Featured Stories (Product Basket) ═══ */}
                    <div>
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2.5">
                                <Skeleton className="w-1 h-6 rounded-full" />
                                <Skeleton className="h-6 w-48" />
                            </div>
                        </div>
                        <div className="flex gap-3 overflow-hidden">
                            {[...Array(5)].map((_, i) => (
                                <div key={i} className="flex-shrink-0 w-[calc(20%-10px)] h-64 bg-white rounded-lg p-2 border border-gray-100">
                                    <Skeleton className="w-full aspect-square rounded-lg mb-2" />
                                    <Skeleton className="h-4 w-3/4 mb-1" />
                                    <Skeleton className="h-4 w-1/2" />
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* ═══ 4. Products + Widget (Complex Grid) ═══ */}
                    <div className="grid gap-1 h-[400px]" style={{
                        gridTemplateColumns: 'repeat(5, 1fr)',
                        gridTemplateRows: 'repeat(2, 1fr)'
                    }}>
                        <Skeleton className="col-span-2 row-span-1 rounded-lg" />
                        <Skeleton className="col-span-1 row-span-1 rounded-lg" />
                        <Skeleton className="col-span-1 row-span-2 rounded-lg" />
                        <Skeleton className="col-span-1 row-span-2 rounded-lg" />
                        <Skeleton className="col-span-1 row-span-1 rounded-lg" />
                        <Skeleton className="col-span-1 row-span-1 rounded-lg" />
                    </div>
                </div>
            </div>
        </div>
    );
}
