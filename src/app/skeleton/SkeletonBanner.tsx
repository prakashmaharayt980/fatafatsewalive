import React from 'react';

const SkeletonBanner = () => {
    return (
        <div className="w-full my-4 px-2 sm:px-4">
            <div className="w-full h-32 sm:h-48 md:h-64 lg:h-80 bg-gray-200 rounded-lg animate-pulse" />
        </div>
    );
};

export default SkeletonBanner;
