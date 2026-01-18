'use client';

import React, { useState, useEffect, useRef } from 'react';
import { ChevronRight } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useInView } from 'react-intersection-observer';
import useSWR from 'swr';
import ProductCard from '../product/ProductCard';
import SkeltonCard from './SkeltonCard';
import { cn } from '@/lib/utils';
import { CategorySlug_ID } from '@/app/types/CategoryTypes';
import RemoteServices from '../api/remoteservice';

interface BasketCardwithImageProps {
  title?: string;
  slug: string;
  id: string
}

const fetcher = async (id: string) => {
  const response = await RemoteServices.CategoryProduct_ID(id);
  return response; // Assuming RemoteServices.CategoriesSlug returns the data directly
};

const BasketCardwithImage = ({ title, slug, id }: BasketCardwithImageProps) => {
  const router = useRouter();
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const { ref, inView } = useInView({
    threshold: 0.1, // Trigger when 10% of the component is visible
    triggerOnce: true, // Only trigger once
  });
  const [windowWidth, setWindowWidth] = useState(0);
  const [activeDot, setActiveDot] = useState(0);

  // Fetch data with SWR only when component is in view
  const { data: productList, error } = useSWR<CategorySlug_ID>(
    inView ? id : null,
    fetcher,
    {
      dedupingInterval: 60000, // Cache for 60 seconds
      revalidateOnFocus: false, // Prevent refetch on window focus
    }
  );

  // Handle window resize for responsive behavior
  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    handleResize(); // Set initial width
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Loading state with skeleton UI
  if (!productList && inView) {
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

  // No data yet (before inView is true)
  if (!productList) {
    return <div ref={ref} className="min-h-[200px] bg-white" />;
  }

  // Responsive items per page
  const isMobile = windowWidth < 640;
  const itemsPerPage = isMobile ? 2 : 6; // 2 items on mobile, 6 on desktop
  const totalPages = productList?.meta.total

  // Scroll to specific page
  const scrollToPage = (pageIndex: number) => {
    if (scrollContainerRef.current) {
      const itemWidth = scrollContainerRef.current.children[0]?.getBoundingClientRect().width || 0;
      const gap = isMobile ? 16 : 8; // 16px gap on mobile, 8px on desktop
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
    <div ref={ref} className="w-full bg-white rounded-xl card-shadow overflow-visible my-4">
      <div className={cn('flex items-center justify-between py-3', 'px-4 sm:px-6')}>
        <h2 className={cn('text-xl font-bold text-slate-800', 'sm:text-2xl')}>{title}</h2>
        <button
          onClick={() => router.push(`/category/${slug}`)}
          className={cn(
            'flex items-center gap-2 rounded-lg text-sm font-semibold transition-all',
            'px-3 py-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50',
            'sm:text-base sm:px-4 sm:py-2'
          )}
        >
          <span>View More</span>
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      <hr className={cn('mx-4 border-t-2 border-orange-500')} />

      <div className={cn('py-3 pb-4', 'px-3 sm:px-6')}>
        <div
          ref={scrollContainerRef}
          className={cn(
            'flex overflow-x-auto overflow-y-visible scrollbar-hide',
            'gap-4 sm:gap-2'
          )}
          style={{
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
            scrollBehavior: 'smooth',
          }}
        >
          {productList.data && productList?.data.map((product, index) => (
            <div
              key={`${product.slug}-${index}`}
              className={cn('flex-shrink-0', 'w-[calc(50%-8px)] sm:w-[calc(33.333%-8px)] md:w-[calc(25%-8px)] lg:w-[calc(16.666%-8px)]')}
            >
              <ProductCard product={product} index={index} />
            </div>
          ))}
        </div>

        {totalPages > 1 && (
          <div className="flex justify-center mt-1 gap-2">
            {[...Array(totalPages)].map((_, index) => (
              <button
                key={index}
                onClick={() => handleDotClick(index)}
                className={cn(
                  'w-2 h-2 rounded-full transition-all duration-300 cursor-pointer',
                  index === activeDot ? 'bg-blue-600 w-4' : 'bg-gray-300 hover:bg-gray-400'
                )}
                aria-label={`Go to page ${index + 1}`}
              />
            ))}
          </div>
        )}
      </div>

      <style jsx>{`
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
          scroll-behavior: smooth;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide::-webkit-scrollbar-horizontal {
          display: none;
        }
        .scrollbar-hide::-webkit-scrollbar-vertical {
          display: none;
        }
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </div>
  );
};

export default BasketCardwithImage;