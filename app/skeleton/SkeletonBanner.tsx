// src/app/skeleton/SkeletonBanner.tsx
import React from 'react';

const SkeletonBanner = () => {
  return (
    <div className="w-full px-2 py-1 sm:px-3 animate-pulse">
      <div className="flex flex-col lg:flex-row gap-2">
        {/* Main Banner Skeleton */}
        <div className="w-full lg:w-[58%] aspect-[1920/700] bg-gray-100 rounded" />
        
        {/* Side Banners Skeleton */}
        <div className="w-full lg:w-[42%] hidden lg:flex flex-col gap-2">
          <div className="flex-1 bg-gray-100 rounded aspect-[4/1]" />
          <div className="flex gap-2 flex-1">
            <div className="flex-1 bg-gray-100 rounded aspect-[2/1]" />
            <div className="flex-1 bg-gray-100 rounded aspect-[2/1]" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default SkeletonBanner;
