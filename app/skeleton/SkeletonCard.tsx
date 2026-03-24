import React from 'react';

function SkeletonCard() {
    return (
        <div className="w-full py-2 sm:py-3 bg-transparent">
            {/* Header Match */}
            <div className="flex items-center justify-between px-4 sm:px-6 mb-3">
                <div className="flex items-center gap-3">
                    <div className="w-1 h-7 bg-gray-200 rounded-full animate-pulse" />
                    <div className="h-6 w-40 bg-gray-200 rounded animate-pulse" />
                </div>
                <div className="h-8 w-24 bg-gray-200 rounded-full animate-pulse" />
            </div>

            <div className="flex overflow-hidden px-1 sm:px-6 pb-2 mt-2 pt-2 gap-2">
                {/* Exact widths from BasketCard.tsx */}
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
    );
}

export default SkeletonCard;
