import React from 'react';

// Mirror the exact structure of BasketCard + ProductCard so height
// matches pixel-perfectly and there is zero layout shift on render.
function SkeletonCard() {
    return (
        <div className="w-full py-2 sm:py-3 bg-transparent">
            {/* Header — matches BasketCard header exactly */}
            <div className="flex items-center justify-between px-4 sm:px-6 mb-3">
                <div className="flex items-center gap-3">
                    <div className="w-1 h-7 bg-gray-200 rounded-full animate-pulse" />
                    <div className="h-6 w-40 bg-gray-200 rounded animate-pulse" />
                </div>
                <div className="h-8 w-24 bg-gray-200 rounded-full animate-pulse" />
            </div>

            {/* Product row — px-1 sm:px-6 matches BasketCard's wrapper */}
            <div className="relative px-1 sm:px-6">
                <div className="flex pb-2 mt-2 pt-2 gap-0">
                    {/* 5 cards visible on desktop (lg:w-1/5), 2 on mobile (w-1/2) */}
                    {[...Array(5)].map((_, i) => (
                        <div
                            key={i}
                            className="flex-shrink-0 w-1/2 sm:w-1/3 md:w-1/4 lg:w-1/5 px-1 sm:px-1.5"
                        >
                            {/* ProductCard outer shell */}
                            <div className="bg-white rounded-[12px] overflow-hidden border border-gray-100 shadow-sm flex flex-col">

                                {/* Image area — ProductCard uses aspect-[2/2] + p-2 */}
                                <div className="p-2">
                                    <div className="aspect-square bg-gray-200 rounded-lg animate-pulse" />
                                </div>

                                {/* Content area — ProductCard uses p-2 flex flex-col gap-0.5 */}
                                <div className="p-2 flex flex-col gap-0.5">
                                    {/* Brand row */}
                                    <div className="h-3 w-1/2 bg-gray-200 rounded animate-pulse" />

                                    {/* Title — min-h-[2.6em] line-clamp-2 */}
                                    <div className="space-y-1 mt-0.5" style={{ minHeight: '2.6em' }}>
                                        <div className="h-3.5 w-full bg-gray-200 rounded animate-pulse" />
                                        <div className="h-3.5 w-3/4 bg-gray-200 rounded animate-pulse" />
                                    </div>

                                    {/* Price */}
                                    <div className="h-5 w-2/3 bg-gray-200 rounded animate-pulse mt-1" />

                                    {/* EMI + Delivery badges */}
                                    <div className="flex gap-1 mt-1.5">
                                        <div className="h-4 w-16 bg-gray-200 rounded-sm animate-pulse" />
                                        <div className="h-4 w-20 bg-gray-200 rounded-sm animate-pulse" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Dots row — same as BasketCard navigation dots */}
                <div className="flex justify-center gap-3 mt-1">
                    {[...Array(2)].map((_, i) => (
                        <div
                            key={i}
                            className={`h-2 rounded-full bg-gray-200 animate-pulse ${i === 0 ? 'w-6' : 'w-4'}`}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
}

export default SkeletonCard;
