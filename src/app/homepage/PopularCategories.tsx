'use client';

import React, { useState, useRef } from 'react';
import Image from 'next/image';
import RemoteServices from '../api/remoteservice';
import { useInView } from 'react-intersection-observer';
import useSWR from 'swr';

export interface CategoryTypes {
  categories: Array<{
    id: number;
    title: string;
    slug: string;
    parent_id: number | null;
    parent_tree: string | null;
    children: CategoryTypes['categories'];
    image: {
      name: string;
      default: string;
      original: string;
      preview: string;
      thumbnail: string;
      is_default: boolean;
    };
    created_at?: string;
    updated_at?: string;
  }>;
}

// Fetcher function for SWR
const fetcher = async () => {
  const res = await RemoteServices.AllCategory();
  console.log('Categories Response:', res.data); // Debug log
  return res.data; // Return the resolved data
};

const PopularCategories = () => {
  const [activeSlide, setActiveSlide] = useState(0);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const { ref, inView } = useInView({
    triggerOnce: true, // Fetch only once when the component enters the viewport
    threshold: 0.1, // Trigger when 10% of the component is visible
  });

  // Use SWR for data fetching
  const { data: categories, error, isLoading } = useSWR(
    inView ? 'categories' : null, // Only fetch when in view
    fetcher,
    {
      revalidateOnFocus: false, // Disable revalidation on focus
      revalidateOnReconnect: true, // Revalidate on reconnect
      dedupingInterval: 60000, // Dedupe requests within 60 seconds
    }
  );

  // Handle loading state
  if (isLoading) {
    return (
      <div className="text-center py-8">
        <h3 className="text-lg font-medium text-gray-600 mb-2">Loading Categories...</h3>
      </div>
    );
  }

  // Handle error state
  if (error) {
    console.error('SWR Error:', error); // Debug log for error
    return (
      <div className="text-center py-8">
        <h3 className="text-lg font-medium text-gray-600 mb-2">Failed to Load Categories</h3>
        <p className="text-gray-500 text-sm">Please try again later.</p>
      </div>
    );
  }

  // Handle empty state
  const visibleCategories = Array.isArray(categories) ? categories : [];

  const scrollTo = (index: number) => {
    if (scrollContainerRef.current) {
      const containerWidth = scrollContainerRef.current.offsetWidth;
      scrollContainerRef.current.scrollTo({
        left: containerWidth * index,
        behavior: 'smooth',
      });
      setActiveSlide(index);
    }
  };

  const handleScroll = () => {
    if (scrollContainerRef.current) {
      const scrollPosition = scrollContainerRef.current.scrollLeft;
      const containerWidth = scrollContainerRef.current.offsetWidth;
      const newActiveSlide = Math.round(scrollPosition / containerWidth);
      setActiveSlide(newActiveSlide);
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-2 sm:px-4 py-6 " ref={ref}>
      <div className="mb-2">
        <div className="flex items-center justify-center mb-2">
          <div className="flex-1 h-1 bg-gradient-to-r from-transparent via-blue-500 to-blue-500"></div>
          <h2 className="px-3 sm:px-6 text-lg sm:text-2xl font-bold text-gray-900">Popular Categories</h2>
          <div className="flex-1 h-1 bg-gradient-to-l from-transparent via-blue-500 to-blue-500"></div>
        </div>
      </div>
      {/* Categories Scroll Container */}
      <div className="relative">
        <div
          ref={scrollContainerRef}
          onScroll={handleScroll}
          className="flex overflow-x-auto scrollbar-hide snap-x snap-mandatory"
          style={{ scrollSnapType: 'x mandatory' }}
        >
          <div className="flex gap-2 sm:gap-4 lg:gap-6">
            {visibleCategories.map((category) => (
              <div
                key={category.id}
                className="flex-none w-[70px] sm:w-[100px] lg:w-[140px] snap-start
                  group relative bg-white rounded-lg sm:rounded-2xl p-2 sm:p-4 
                  transition-all duration-300 ease-out
                  hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)] 
                  hover:-translate-y-1
                  border border-gray-100 hover:border-orange-200"
                role="button"
                tabIndex={0}
              >
                <div className="relative w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 mx-auto mb-1 sm:mb-3">
                  <Image
                    src={category.image.default}
                    alt={category.title}
                    layout="fill"
                    className="rounded-lg sm:rounded-xl object-cover transition-transform duration-300 
                      group-hover:scale-110"
                    loading="lazy"
                  />
                </div>
                <h3 className="text-xs sm:text-sm font-medium text-gray-700 
                  group-hover:text-orange-600 text-center
                  transition-colors duration-300 leading-tight">
                  {category.title}
                </h3>
              </div>
            ))}
          </div>
        </div>
      </div>
      {/* Interactive Dots */}
      <div className="flex justify-center space-x-1 sm:space-x-2 mt-2">
        {Array.from({ length: Math.ceil(visibleCategories.length / 7) }).map((_, index) => (
          <button
            key={index}
            onClick={() => scrollTo(index)}
            className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full transition-all duration-300 ${activeSlide === index ? 'bg-orange-500 w-3 sm:w-4' : 'bg-gray-300'
              }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
      {/* Background Decorative Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-16 h-16 sm:w-32 sm:h-32 bg-orange-100 rounded-full opacity-20 blur-xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-12 h-12 sm:w-24 sm:h-24 bg-orange-200 rounded-full opacity-30 blur-lg"></div>
      </div>
    </div>
  );
};

export default PopularCategories;