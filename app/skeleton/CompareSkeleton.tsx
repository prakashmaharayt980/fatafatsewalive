import React from 'react';

/**
 * specialized skeleton for LazyCompareProducts to match CompareCard layout
 */
export const CompareCardSkeleton = () => (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="h-8 bg-gray-50 animate-pulse flex items-center justify-center">
            <div className="h-3 w-16 bg-gray-200 rounded" />
        </div>
        <div className="flex items-stretch px-3 py-3">
            {/* Left Product */}
            <div className="flex flex-col items-center gap-2 flex-1 pr-3">
                <div className="w-20 h-24 bg-gray-200 rounded-lg animate-pulse" />
                <div className="h-3 w-full bg-gray-200 rounded animate-pulse" />
                <div className="h-3 w-2/3 bg-gray-200 rounded animate-pulse" />
            </div>
            {/* VS Middle */}
            <div className="flex flex-col items-center justify-center gap-1 shrink-0">
                <div className="w-px h-8 bg-gray-100" />
                <div className="w-7 h-7 rounded-full bg-gray-100 border-2 border-gray-50 flex items-center justify-center">
                    <div className="w-3 h-3 bg-gray-200 rounded-full animate-pulse" />
                </div>
                <div className="w-px h-8 bg-gray-100" />
            </div>
            {/* Right Product */}
            <div className="flex flex-col items-center gap-2 flex-1 pl-3">
                <div className="w-20 h-24 bg-gray-200 rounded-lg animate-pulse" />
                <div className="h-3 w-full bg-gray-200 rounded animate-pulse" />
                <div className="h-3 w-2/3 bg-gray-200 rounded animate-pulse" />
            </div>
        </div>
        <div className="px-3 pb-3">
            <div className="w-full h-8 bg-gray-50 rounded-xl animate-pulse" />
        </div>
    </div>
);

const CompareSkeleton = () => {
    return (
        <div className="w-full mt-10">
            <div className="flex items-center justify-between px-4 sm:px-6 mb-3">
                <div className="flex items-center gap-3">
                    <div className="w-1 h-7 bg-gray-200 rounded-full animate-pulse" />
                    <div className="h-6 w-48 bg-gray-200 rounded animate-pulse" />
                </div>
                <div className="h-8 w-24 bg-gray-200 rounded-full animate-pulse" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {[...Array(4)].map((_, i) => (
                    <CompareCardSkeleton key={i} />
                ))}
            </div>
        </div>
    );
};

export default CompareSkeleton;
