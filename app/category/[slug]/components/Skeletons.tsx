import React, { memo } from 'react';

// --- FilterSidebar Skeletons ---
export const FilterSidebarSkeleton = () => {
    return (
        <div className="space-y-3">
            {[...Array(4)].map((_, i) => (
                <div key={i} className="h-6 bg-gray-50 rounded animate-pulse" />
            ))}
        </div>
    );
};

// --- ProductCard Skeletons ---
export const ProductCardSkeleton = memo(() => (
    <div className="bg-white rounded-2xl overflow-hidden border border-gray-100">
        <div className="aspect-square bg-linear-to-br from-gray-100 to-gray-200 animate-pulse" />
        <div className="p-4 space-y-3">
            <div className="h-3 w-20 bg-gray-200 rounded-full animate-pulse" />
            <div className="h-4 bg-gray-200 rounded-full animate-pulse" />
            <div className="h-5 w-24 bg-gray-200 rounded-full animate-pulse" />
        </div>
    </div>
));

ProductCardSkeleton.displayName = 'ProductCardSkeleton';

export const ProductCardRowSkeleton = memo(() => (
    <div className="bg-white rounded-2xl overflow-hidden border border-gray-100">
        <div className="flex flex-col sm:flex-row">
            <div className="w-full sm:w-48 aspect-square sm:aspect-auto sm:h-48 bg-linear-to-br from-gray-100 to-gray-200 animate-pulse" />
            <div className="flex-1 p-4 space-y-3">
                <div className="h-3 w-20 bg-gray-200 rounded-full animate-pulse" />
                <div className="h-4 bg-gray-200 rounded-full animate-pulse w-3/4" />
                <div className="h-3 bg-gray-100 rounded-full animate-pulse w-1/2" />
                <div className="h-5 w-24 bg-gray-200 rounded-full animate-pulse mt-4" />
            </div>
        </div>
    </div>
));

ProductCardRowSkeleton.displayName = 'ProductCardRowSkeleton';
