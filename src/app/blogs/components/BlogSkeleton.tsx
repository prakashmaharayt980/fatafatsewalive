import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';

export default function BlogSkeleton() {
    return (
        <div className="min-h-screen bg-[#F9FAFB] pb-20">
            {/* Banner Skeleton */}
            <div className="pt-8 px-2 md:px-4 max-w-[1600px] mx-auto mb-8">
                <div className="flex gap-4">
                    <Skeleton className="w-full h-[300px] md:h-[400px] lg:h-[500px]" />
                </div>
            </div>

            <div className="container mx-auto px-4 md:px-6 lg:px-8 max-w-[1600px]">
                <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">

                    {/* Main Content Skeleton */}
                    <div className="lg:w-3/4 space-y-12">

                        {/* Featured Post Skeleton */}
                        <div className="space-y-4">
                            <Skeleton className="w-full aspect-[16/9] rounded-3xl" />
                            <div className="space-y-2 p-4">
                                <Skeleton className="h-4 w-32" />
                                <Skeleton className="h-8 w-3/4" />
                                <Skeleton className="h-4 w-full" />
                                <Skeleton className="h-4 w-2/3" />
                            </div>
                        </div>

                        {/* Recent Posts Skeleton */}
                        <div className="space-y-8">
                            <Skeleton className="h-8 w-48 mb-4 " />

                            {/* Secondary Post Skeleton */}
                            <div className="flex flex-col md:flex-row gap-6 bg-white rounded-2xl p-4 border border-gray-100">
                                <Skeleton className="w-full md:w-1/2 h-[240px] rounded-xl" />
                                <div className="w-full md:w-1/2 space-y-4 py-4">
                                    <Skeleton className="h-4 w-24" />
                                    <Skeleton className="h-6 w-full" />
                                    <Skeleton className="h-4 w-full" />
                                    <Skeleton className="h-4 w-5/6" />
                                </div>
                            </div>

                            {/* Grid Posts Skeleton */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {[1, 2, 3, 4].map((i) => (
                                    <div key={i} className="bg-white rounded-2xl p-4 border border-gray-100 space-y-4">
                                        <Skeleton className="w-full aspect-[4/3] rounded-xl" />
                                        <Skeleton className="h-4 w-20" />
                                        <Skeleton className="h-6 w-full" />
                                        <Skeleton className="h-4 w-full" />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Sidebar Skeleton */}
                    <aside className="w-full lg:w-1/4 mt-8 lg:mt-0 space-y-8">
                        <Skeleton className="h-[400px] w-full rounded-2xl" />
                        <Skeleton className="h-[300px] w-full rounded-2xl" />
                    </aside>
                </div>
            </div>
        </div>
    );
}
