import React from 'react';

function SkeltonCard() {
  return (
    <div className="w-full py-6 sm:py-8 bg-transparent">
      {/* Header Match */}
      <div className="flex items-center justify-between px-4 sm:px-6 mb-5">
        <div className="flex items-center gap-3">
          <div className="w-1 h-7 bg-gray-200 rounded-full animate-pulse" />
          <div className="h-6 w-32 bg-gray-200 rounded animate-pulse" />
        </div>
        <div className="h-8 w-24 bg-gray-200 rounded-full animate-pulse" />
      </div>

      <div className="px-2 sm:px-4">
        {/* Horizontal Scroll Layout Match */}
        <div className="flex gap-3 sm:gap-4 overflow-hidden">
          {[...Array(6)].map((_, index) => (
            <div
              key={index}
              className="flex-shrink-0 w-[calc(50%-8px)] sm:w-[calc(33.333%-12px)] md:w-[calc(25%-12px)] lg:w-[calc(20%-13px)] flex flex-col rounded-lg p-2 border border-gray-50 bg-white shadow-sm"
            >
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
