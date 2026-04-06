import React from 'react';
import { cn } from '@/lib/utils';

interface SkeletonCardProps {
    withBanner?: boolean;
}

/**
 * Premium Skeleton component that mimics ProductCard and BasketCard
 * Matches layout, spacing, and border-radius to prevent layout shift.
 */
function SkeletonCard({ withBanner = false }: SkeletonCardProps) {
    return (
        <div className="w-full py-4 sm:py-6 bg-transparent">
            <div className={cn("flex flex-col gap-4", withBanner && "md:flex-row items-stretch min-h-[460px]")}>
                
                {/* Optional side banner skeleton */}
                {withBanner && (
                    <div className="hidden md:block w-1/5 min-w-[220px] bg-gray-200 rounded-2xl animate-pulse shrink-0 relative overflow-hidden">
                         <div className="absolute bottom-10 left-6 space-y-3">
                            <div className="h-3 w-16 bg-gray-300/50 rounded" />
                            <div className="h-6 w-32 bg-gray-300/50 rounded-lg" />
                            <div className="h-8 w-24 bg-gray-300/50 rounded-full mt-2" />
                         </div>
                    </div>
                )}

                <div className={cn("flex-1 flex flex-col", withBanner ? "w-full md:w-4/5" : "w-full")}>
                    {/* Header — matches BasketCard header exactly */}
                    <div className="flex items-center justify-between px-4 sm:px-6 mb-4">
                        <div className="flex items-center gap-3">
                            <div className="w-1 h-7 bg-gray-200 rounded-full animate-pulse" />
                            <div className="h-6 w-48 bg-gray-200 rounded-lg animate-pulse" />
                        </div>
                        <div className="h-8 w-24 bg-gray-100 rounded-full animate-pulse" />
                    </div>

                    {/* Product row */}
                    <div className="relative px-2 sm:px-6">
                        <div className="flex pb-2 pt-2 gap-4 overflow-hidden">
                            {/* 5 cards on desktop (lg:w-1/5), 2 on mobile (w-1/2) */}
                            {Array.from({ length: 5 }, (_, i) => (
                                <div
                                    key={i}
                                    className={cn(
                                        "flex-shrink-0 snap-start",
                                        withBanner 
                                            ? "w-[calc(50%-8px)] sm:w-[calc(33.333%-11px)] md:w-[calc(25%-12px)]"
                                            : "w-[calc(50%-8px)] sm:w-1/3 md:w-1/4 lg:w-1/5"
                                    )}
                                >
                                    {/* ProductCard outer shell */}
                                    <div className="bg-white rounded-[12px] overflow-hidden border border-gray-100 shadow-sm flex flex-col h-full animate-pulse">
                                        {/* Image area */}
                                        <div className="p-2">
                                            <div className="aspect-square bg-gray-50 rounded-lg w-full" />
                                        </div>

                                        {/* Content area */}
                                        <div className="p-2 flex flex-col gap-1.5">
                                            {/* Brand row */}
                                            <div className="h-2.5 w-1/3 bg-gray-100 rounded" />

                                            {/* Title */}
                                            <div className="space-y-1.5 py-0.5">
                                                <div className="h-3 w-full bg-gray-200 rounded" />
                                                <div className="h-3 w-4/5 bg-gray-200 rounded" />
                                            </div>

                                            {/* Price */}
                                            <div className="h-5 w-2/3 bg-gray-200 rounded-md mt-1" />

                                            {/* Badges */}
                                            <div className="flex gap-1 mt-2">
                                                <div className="h-4 w-16 bg-gray-100 rounded-sm" />
                                                <div className="h-4 w-20 bg-gray-100 rounded-sm" />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default SkeletonCard;
