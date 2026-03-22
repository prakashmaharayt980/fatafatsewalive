'use client';

import React, { useState, useEffect, useRef } from 'react';
import { ChevronRight } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import ProductCard from '../products/ProductCard';
import SkeltonCard from '@/app/skeleton/SkeletonCard';
import { cn } from '@/lib/utils';
import { trackCategoryClick } from '@/lib/analytics';

interface BasketCardwithImageProps {
  title?: string;
  slug: string;
  imageUrl?: string;
  initialData?: any; // the 'data' object from /v1/categories/[slug]/products Endpoint
}

const BasketCardwithImage = ({ title, slug, imageUrl, initialData }: BasketCardwithImageProps) => {
  const router = useRouter();
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [windowWidth, setWindowWidth] = useState(0);
  const [activeDot, setActiveDot] = useState(0);

  const productList = initialData;
  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // No data yet
  if (!productList) {
    return (
      <div className="w-full">
        <SkeltonCard />
      </div>
    );
  }

  // Responsive logic
  const getItemsPerPage = () => {
    if (windowWidth >= 768) return 4;
    if (windowWidth >= 640) return 3;
    return 2;
  };

  const itemsPerPage = getItemsPerPage();
  const totalPages = Math.ceil((productList?.products?.length || 0) / itemsPerPage) || 1;

  const scrollToPage = (pageIndex: number) => {
    if (scrollContainerRef.current) {
      const itemWidth = scrollContainerRef.current.children[0]?.getBoundingClientRect().width || 0;
      const gap = windowWidth >= 640 ? 16 : 8; // sm:gap-4 is 16px, gap-2 is 8px inline
      const scrollDistance = pageIndex * itemsPerPage * (itemWidth + gap);

      scrollContainerRef.current.scrollTo({
        left: scrollDistance,
        behavior: 'smooth',
      });
      setActiveDot(pageIndex);
    }
  };

  const handleDotClick = (index: number) => {
    scrollToPage(index);
  };

  return (
    <div className="w-full my-4">
      <div className="flex flex-col md:flex-row gap-4 h-auto items-stretch">

        {/* Banner Image Side */}
        {imageUrl && (
          <div className="hidden md:block w-full md:w-1/5 min-w-[200px] aspect-9/16 relative rounded-xl overflow-hidden shadow-sm hover:shadow-[0_4px_12px_rgba(0,0,0,0.05)] transition-all duration-300 group cursor-pointer shrink-0">
            <Image
              src={imageUrl}
              alt={title || 'Category Banner'}
              fill
              className="object-cover w-full h-full transition-transform duration-700 p-0 m-0 group-hover:scale-105"
              sizes="(max-width: 1024px) 30vw, 20vw"
            />
            <div className="absolute inset-0 group-hover:bg-black/5 transition-colors duration-300" />
          </div>
        )}

        {/* Content Side */}
        <div className={cn(
          "flex-1 flex flex-col bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100/50",
          imageUrl ? "w-full md:w-4/5" : "w-full"
        )}>
          {/* Header - Clean & Minimal */}
          <div className="flex items-center justify-between px-3 sm:px-4 py-3 sm:py-4 mb-1 border-b border-gray-50">
            <div className="flex items-center gap-3">
              {/* Vertical accent bar */}
              <div className="w-1.5 h-6 bg-(--colour-fsP1) rounded-full shadow-sm" />
              <h2 className="text-lg sm:text-xl font-bold text-gray-800 tracking-tight">
                {title}
              </h2>
            </div>

            <button
              onClick={() => {
                trackCategoryClick(title || slug, 'view_all');
                router.push(`/category/${slug}`);
              }}
              className="flex items-center gap-1.5 px-4 py-1.5 text-sm font-semibold text-(--colour-fsP1) cursor-pointer hover:bg-(--colour-fsP1)/10 rounded-full transition-all duration-200 group"
            >
              View All
              <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
            </button>
          </div>

          {/* Product Grid */}
          <div className="flex-1 overflow-visible px-0 relative pb-5">
            <div
              ref={scrollContainerRef}
              className={cn(
                'flex overflow-x-auto overflow-y-visible scrollbar-hide h-full items-start',
                'gap-2 sm:gap-4 px-3 pt-3 sm:px-4 sm:pt-4'
              )}
              style={{
                scrollbarWidth: 'none',
                msOverflowStyle: 'none',
                scrollBehavior: 'smooth',
              }}
            >
              {productList?.products && productList.products.map((product: any, index: number) => (
                <div
                  key={`${product.slug}-${index}`}
                  className={cn('shrink-0 h-full', 'w-[calc(50%-4px)] sm:w-[calc(33.333%-11px)] md:w-[calc(25%-12px)]')}
                >
                  <ProductCard product={product} index={index} />
                </div>
              ))}
            </div>

            {/* Navigation Dots */}
            {totalPages > 1 && (
              <div className="absolute bottom-0 left-0 right-0 flex justify-center pointer-events-none pb-1">
                <div className="flex gap-2 pointer-events-auto items-center">
                  {[...Array(Math.min(totalPages, 5))].map((_, index) => (
                    <button
                      key={index}
                      onClick={() => handleDotClick(index)}
                      className="group cursor-pointer focus:outline-none p-1"
                      aria-label={`Go to page ${index + 1}`}
                    >
                      <div
                        className={cn(
                          'h-1.5 rounded-full transition-all duration-300',
                          index === activeDot
                            ? 'bg-(--colour-fsP1) w-6'
                            : 'bg-gray-200 group-hover:bg-gray-300 w-1.5'
                        )}
                      />
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
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
      `}</style>
    </div>
  );
};

export default BasketCardwithImage;