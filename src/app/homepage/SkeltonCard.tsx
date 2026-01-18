import React from 'react';

function SkeltonCard() {
  return (
    <div className="w-full bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden my-4">
      <div className="flex items-center justify-between p-4 border-b border-gray-100">
        <div className="h-6 w-32 bg-gray-200 rounded animate-pulse"></div>
        <div className="h-8 w-24 bg-gray-200 rounded-full animate-pulse"></div>
      </div>
      <div className="p-4">
        {/* Responsive Grid: 2 cols on mobile, 3 on sm, 4 on md, 6 on lg */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
          {[...Array(6)].map((_, index) => (
            <div key={index} className="flex flex-col bg-white rounded-lg p-2 border border-gray-50">
              {/* Image Placeholder */}
              <div className="w-full aspect-square bg-gray-200 rounded-lg animate-pulse mb-3"></div>

              {/* Title Placeholder */}
              <div className="h-4 w-3/4 bg-gray-200 rounded animate-pulse mb-2"></div>

              {/* Price/Subtitle Placeholder */}
              <div className="h-4 w-1/2 bg-gray-200 rounded animate-pulse mb-3"></div>

              {/* Button Placeholder */}
              <div className="mt-auto h-8 w-full bg-gray-200 rounded animate-pulse"></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default SkeltonCard;
