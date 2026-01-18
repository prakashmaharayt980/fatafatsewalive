import React from 'react';

const HeaderSkeleton = () => {
    return (
        
        <header className="sticky top-0 z-50 w-full bg-white border-b border-gray-200">
            {/* Top Header Skeleton */}
            <div className="container mx-auto px-4 py-2">
                <div className="flex items-center justify-between">
                    {/* Logo Skeleton */}
                    <div className="flex items-center space-x-2">
                        <div className="w-32 h-16 bg-gray-200 rounded-lg animate-pulse"></div>
                    </div>

                    {/* Search Bar Skeleton - Desktop */}
                    <div className="hidden md:flex items-center flex-1 max-w-lg mx-4">
                        <div className="relative w-full">
                            <div className="w-full h-9 bg-gray-200 rounded-2xl animate-pulse"></div>
                        </div>
                    </div>

                    {/* Right Icons Skeleton */}
                    <div className="flex items-center space-x-1">
                        {/* Blog Button Skeleton */}
                        <div className="hidden md:block">
                            <div className="h-9 w-16 bg-gray-200 rounded animate-pulse"></div>
                        </div>

                        {/* EMI Button Skeleton */}
                        <div className="hidden md:block">
                            <div className="h-9 w-14 bg-gray-200 rounded animate-pulse"></div>
                        </div>

                        {/* Cart Skeleton */}
                        <div className="h-9 w-20 bg-gray-200 rounded animate-pulse"></div>

                        {/* Account Dropdown Skeleton */}
                        <div className="h-9 w-24 bg-gray-200 rounded animate-pulse"></div>

                        {/* Wishlist Skeleton */}
                        <div className="h-9 w-9 bg-gray-200 rounded animate-pulse"></div>

                        {/* Mobile Menu Button Skeleton */}
                        <div className="md:hidden h-9 w-9 bg-gray-200 rounded animate-pulse"></div>
                    </div>
                </div>

                {/* Mobile Search Bar Skeleton */}
                <div className="md:hidden mt-3">
                    <div className="relative w-full">
                        <div className="w-full h-9 bg-gray-200 rounded-2xl animate-pulse"></div>
                    </div>
                </div>
            </div>

            {/* Navigation Categories Skeleton */}
            <div className="bg-gray-300 animate-pulse">
                <div className="container mx-auto px-2">
                    {/* Desktop Categories Skeleton */}
                    <div className="hidden md:block">
                        <div className="flex flex-wrap gap-1">
                            {Array.from({ length: 8 }).map((_, index) => (
                                <div key={index} className="h-10 bg-gray-400 rounded-lg animate-pulse" style={{ width: `${Math.random() * 60 + 80}px` }}>
                                </div>
                            ))}
                        </div>
                    </div>
                    
                    {/* Mobile Category Navigation Skeleton */}
                    <div className="md:hidden">
                        <div className="flex overflow-x-auto scrollbar-none gap-2 py-2 px-1">
                            {Array.from({ length: 6 }).map((_, index) => (
                                <div 
                                    key={index} 
                                    className="flex-shrink-0 h-8 bg-gray-400 rounded-lg animate-pulse"
                                    style={{ width: `${Math.random() * 40 + 60}px` }}
                                ></div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default HeaderSkeleton;