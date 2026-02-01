'use client';

import React, { useState, useEffect, useRef } from 'react';
import { ChevronRight } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useInView } from 'react-intersection-observer';
import useSWR from 'swr';
import Image from 'next/image';
import ProductCard from '../products/ProductCard';
import SkeltonCard from './SkeltonCard';
import { cn } from '@/lib/utils';
import { CategorySlug_ID } from '@/app/types/CategoryTypes';
import { CategoryService } from '../api/services/category.service';

interface BasketCardwithImageProps {
  title?: string;
  slug: string;
  id: string;
  imageUrl?: string;
}

const fetcher = async (id: string) => {
  const response = await CategoryService.getCategoryProducts({ id });
  return response;
};

const BasketCardwithImage = ({ title, slug, id, imageUrl }: BasketCardwithImageProps) => {
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
    inView ? id : null,
    fetcher,
    {
      dedupingInterval: 60000,
      revalidateOnFocus: false,
    }
  );

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Loading state
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

  // No data yet
  if (!productList) {
    return <div ref={ref} className="min-h-[200px] bg-white" />;
  }

  // Responsive logic
  const isMobile = windowWidth < 640;
  const itemsPerPage = isMobile ? 2 : 4;
  const totalPages = productList?.meta.total;

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

  const handleDotClick = (index: number) => {
    scrollToPage(index);
  };

  return (
    <div ref={ref} className="w-full my-8">
      <div className="flex flex-col md:flex-row gap-4 h-auto items-stretch">

        {/* Banner Image Side */}
        {imageUrl && (
          <div className="hidden md:block w-full md:w-1/5 min-w-[220px] relative rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow group cursor-pointer shrink-0">
            <Image
              src={imageUrl}
              alt={title || 'Category Banner'}
              fill
              className="object-cover transition-transform duration-700 group-hover:scale-105"
              sizes="(max-width: 1024px) 30vw, 20vw"
            />
            <div className="absolute inset-0 bg-black/5 group-hover:bg-transparent transition-colors duration-300" />
          </div>
        )}

        {/* Content Side */}
        <div className={cn(
          "flex-1 flex flex-col bg-white rounded-xl overflow-hidden",
          imageUrl ? "w-full md:w-4/5" : "w-full"
        )}>
          {/* Header - Clean & Minimal */}
          <div className="flex items-center justify-between px-2 sm:px-0 mb-5">
            <div className="flex items-center gap-3 mx-3">
              {/* Vertical accent bar */}
              <div className="w-1 h-7 bg-slate-800 rounded-full" />
              <h2 className="text-lg sm:text-xl  font-semibold text-slate-800 tracking-tight">
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

          {/* Product Grid */}
          <div className="flex-1 overflow-visible py-2 px-0 relative pb-8">
            <div
              ref={scrollContainerRef}
              className={cn(
                'flex overflow-x-auto overflow-y-visible scrollbar-hide h-full items-start',
                'gap-3 sm:gap-4 px-2'
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
                  className={cn('flex-shrink-0 h-full', 'w-[calc(50%-8px)] sm:w-[calc(33.333%-12px)] md:w-[calc(25%-12px)]')}
                >
                  <ProductCard product={product} index={index} />
                </div>
              ))}
            </div>

            {/* Navigation Dots */}
            {totalPages > 1 && (
              <div className="absolute bottom-0 left-0 right-0 flex justify-center pointer-events-none mt-4">
                <div className="flex gap-1.5 p-1.5 pointer-events-auto">
                  {[...Array(Math.min(totalPages, 5))].map((_, index) => (
                    <button
                      key={index}
                      onClick={() => handleDotClick(index)}
                      className="group p-3 cursor-pointer focus:outline-none"
                      aria-label={`Go to page ${index + 1}`}
                    >
                      <div
                        className={cn(
                          'h-1.5 rounded-full transition-all duration-300',
                          index === activeDot
                            ? 'bg-slate-800 w-5'
                            : 'bg-slate-200 group-hover:bg-slate-300 w-1.5'
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