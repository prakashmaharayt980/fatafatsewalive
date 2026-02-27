'use client';

import React, { useState, useEffect, useRef } from 'react';
import { ChevronRight } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useInView } from 'react-intersection-observer';
import useSWR from 'swr';
import ProductCard from '../products/ProductCard';
import SkeltonCard from '@/app/skeleton/SkeletonCard';
import { cn } from '@/lib/utils';
import { CategorySlug, CategorySlug_ID } from '@/app/types/CategoryTypes';
import { getCategoryProductsData } from '@/app/api/CachedHelper/getCategoryProductsData';

interface BasketCardProps {
  title?: string;
  slug: string;
  id: string;
  initialData?: CategorySlug_ID;
}

const fetcher = async (id: string) => {
  const response = await getCategoryProductsData(id);
  return response;
};

const BasketCard = ({ title, slug, id, initialData }: BasketCardProps) => {
  const router = useRouter();
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const { ref, inView } = useInView({
    threshold: 0.1,
    triggerOnce: true,
  });
  const [windowWidth, setWindowWidth] = useState(0);
  const [activeDot, setActiveDot] = useState(0);

  // Fetch data with SWR
  const { data: productList, error } = useSWR<CategorySlug_ID>(
    (initialData || inView) ? id : null,
    fetcher,
    {
      fallbackData: initialData,
      dedupingInterval: 3600000,
      revalidateOnFocus: false,
      revalidateOnMount: !initialData,
      revalidateOnReconnect: false
    }
  );

  const displayData = productList || initialData;


  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Loading state - Prioritize initialData to prevent double-loading flash
  const showSkeleton = !displayData && inView;

  if (showSkeleton) {
    return (
      <div ref={ref} className="w-full">
        <SkeltonCard />
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div ref={ref} className="w-full bg-white text-red-600 text-center p-4">
        Error loading products: {error.message}
      </div>
    );
  }

  // No data yet
  if (!displayData) {
    return <div ref={ref} className="min-h-[200px] bg-white" />;
  }

  // Empty products
  const products = displayData?.data || [];
  if (!products.length) {
    return (
      <div ref={ref} className="w-full bg-white text-gray-600 text-center p-4">
        No products found for this category.
      </div>
    );
  }

  // Responsive items per page
  const isMobile = windowWidth < 640;
  const itemsPerPage = isMobile ? 2 : 5;
  const totalPages = Math.ceil(products.length / itemsPerPage) || 1;

  // Scroll to specific page
  const scrollToPage = (pageIndex: number) => {
    if (scrollContainerRef.current) {
      const itemWidth = scrollContainerRef.current.children[0]?.getBoundingClientRect().width || 0;
      const gap = 16;
      const scrollDistance = pageIndex * itemsPerPage * (itemWidth + gap);

      scrollContainerRef.current.scrollTo({
        left: scrollDistance,
        behavior: 'smooth',
      });
      setActiveDot(pageIndex);
    }
  };

  // Handle dot click
  const handleDotClick = (index: number) => {
    scrollToPage(index);
  };

  return (
    <div ref={ref} className="w-full py-2 sm:py-3 bg-transparent">
      {/* Header Section - Clean & Minimal */}
      <div className="flex items-center justify-between px-4 sm:px-6 mb-3">
        <div className="flex items-center gap-3">
          {/* Vertical accent bar */}
          <div className="w-1 h-7 bg-slate-800 rounded-full" />
          <h2 className="text-lg sm:text-xl font-semibold text-slate-800 tracking-tight">
            {title}
          </h2>
        </div>

        <button
          onClick={() => router.push(`/category/${slug}`)}
          className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-[var(--colour-fsP2)] cursor-pointer hover:text-slate-900 hover:bg-slate-100 rounded-full transition-all duration-200 group"
        >
          View All
          <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
        </button>
      </div>

      {/* Product List */}
      <div className="relative group/list px-1 sm:px-6">
        <div
          ref={scrollContainerRef}
          className={cn(
            'flex overflow-x-auto overflow-y-visible scrollbar-hide snap-x',
            'pb-2 mt-2 pt-2',
            // Removed horizontal padding to ensure strict 20% width calculation
          )}
          style={{
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
            scrollBehavior: 'smooth',
          }}
        >
          {products.map((product, index) => (
            <div
              key={`${product.slug}-${index}`}
              className={cn(
                'flex-shrink-0 snap-start px-1 sm:px-1.5', // Added padding for spacing
                'w-1/2 sm:w-1/3 md:w-1/4 lg:w-1/5' // Strict percentage widths
              )}
            >
              <ProductCard product={product} priority={index < 5 ? true : false} index={index} />
            </div>
          ))}
        </div>

        {/* Navigation Dots */}
        {totalPages > 1 && (
          <div className="flex justify-center gap-3">
            {[...Array(isMobile ? Math.min(totalPages, 2) : totalPages)].map((_, index) => (
              <button
                key={index}
                onClick={() => handleDotClick(index)}
                className="group cursor-pointer focus:outline-none"
                aria-label={`Go to page ${index + 1}`}
              >
                <div
                  className={cn(
                    'h-2 rounded-full transition-all duration-300',
                    index === activeDot
                      ? 'bg-slate-300 w-6'
                      : 'bg-[var(--colour-fsP2)] group-hover:bg-slate-300 w-4'
                  )}
                />
              </button>
            ))}
          </div>
        )}
      </div>

      <style jsx>{`
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
};

export default BasketCard;