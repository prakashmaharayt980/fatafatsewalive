import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';

export default function BlogDetailsSkeleton() {
    return (
        <div className="min-h-screen bg-[#F9FAFB] pb-20 pt-10">
            {/* Hero Skeleton (Centered) */}
            <div className="container mx-auto px-4 md:px-6 lg:px-8 max-w-5xl mb-16">
                <div className="flex flex-col items-center space-y-6 mb-8 text-center">
                    <Skeleton className="h-8 w-24 rounded-full" />
                    <Skeleton className="h-12 md:h-16 w-3/4" />
                    <Skeleton className="h-12 md:h-16 w-1/2" />
                    <div className="flex gap-4 mt-4">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-4 w-24" />
                    </div>
                </div>
                <Skeleton className="w-full aspect-[21/9] rounded-3xl" />
            </div>

            <div className="container mx-auto px-4 md:px-6 lg:px-8 max-w-7xl">
                <div className="flex flex-col lg:flex-row gap-12 lg:gap-16">
                    {/* Main Content Skeleton */}
                    <div className="lg:w-2/3 space-y-6">
                        {/* Verdict Box Skeleton */}
                        <Skeleton className="h-32 w-full rounded-xl" />

                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-5/6" />
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-64 w-full rounded-xl my-8" />
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-11/12" />
                        <Skeleton className="h-4 w-full" />
                    </div>

                    {/* Sidebar Skeleton */}
                    <aside className="w-full lg:w-1/3 mt-8 lg:mt-0">
                        <Skeleton className="h-[500px] w-full rounded-xl" />
                    </aside>
                </div>
            </div>
        </div>
    );
}
