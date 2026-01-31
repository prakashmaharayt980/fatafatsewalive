'use client';

import React, { useState, useEffect, useRef } from 'react';
import { ChevronRight } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useInView } from 'react-intersection-observer';
import useSWR from 'swr';
import ProductCard from '../ProductCard';
import SkeltonCard from '@/app/homepage/SkeltonCard';
import { cn } from '@/lib/utils';
import { CategorySlug_ID } from '@/app/types/CategoryTypes';
import RemoteServices, { CategoryService } from '@/app/api/remoteservice';

interface RelatedProductsProps {
  title?: string;
  slug: string;
  id: string;
  brandSlug?: string;
  minPrice?: number;
  maxPrice?: number;
}

const fetcher = async ({ id, brandSlug, minPrice, maxPrice }: { id: string; brandSlug?: string; minPrice?: number; maxPrice?: number }) => {
  const response = await CategoryService.getCategoryProducts({
    categories: id,
    brand: brandSlug,
    min_price: minPrice,
    max_price: maxPrice,
    per_page: 6
  } as any);
  return response;
};

const RelatedProducts = ({ title, slug, id, brandSlug, minPrice, maxPrice }: RelatedProductsProps) => {
  const router = useRouter();
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const { ref, inView } = useInView({
    threshold: 0.1,
    triggerOnce: true,
  });
  const [windowWidth, setWindowWidth] = useState(0);
  const [activeDot, setActiveDot] = useState(0);

  // Fetch data with SWR
  const { data: productList, error } = useSWR(
    inView ? { id, brandSlug, minPrice, maxPrice } : null,
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
      <div ref={ref} className="w-full bg-gray-50/50 py-6 sm:py-10 border-t border-gray-100">
        <div className="mx-auto px-2 sm:px-6 lg:px-8">
          <SkeltonCard />
        </div>
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

  // Empty products
  const products = productList?.data || [];
  if (!products.length) {
    return (
      <div ref={ref} className="w-full bg-white text-gray-600 text-center p-4">
        No products found for this category.
      </div>
    );
  }

  // Layout modes
  const isGrid = true; // Use grid layout for product page as requested

  return (
    <div ref={ref} className="w-full bg-gray-50/50 py-6 sm:py-10 border-t border-gray-100">
      <div className="mx-auto px-2 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-4 sm:mb-6 px-1 sm:px-0">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-1 h-6 sm:h-7 bg-[var(--colour-fsP2)] rounded-full" />
            <h2 className="text-base sm:text-xl font-bold text-slate-800 tracking-tight">
              {title}
            </h2>
          </div>
          <button
            onClick={() => router.push(`/category/${slug}`)}
            className="flex items-center gap-1 px-2 sm:px-3 py-1.5 text-xs sm:text-sm font-medium text-[var(--colour-fsP2)] hover:underline transition-all group"
          >
            <span>View All</span>
            <ChevronRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 transition-transform group-hover:translate-x-0.5" />
          </button>
        </div>

        <div className={cn('grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 sm:gap-4 lg:gap-6')}>
          {products.slice(0, 5).map((product, index) => (
            <div
              key={`${product.slug}-${index}`}
              className="w-full transform transition-all duration-300 hover:-translate-y-1 hover:shadow-lg rounded-xl sm:rounded-2xl bg-white"
            >
              <ProductCard product={product as any} index={index} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default RelatedProducts;