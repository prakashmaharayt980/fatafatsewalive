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
    <div ref={ref} className="w-full bg-white py-8 sm:py-12 border-t border-gray-100">
      <div className="mx-auto px-2 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6 sm:mb-8 px-1 sm:px-0">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="w-1.5 h-6 sm:h-8 bg-[var(--colour-fsP1)] rounded-full shadow-sm" />
            <h2 className="text-lg sm:text-2xl font-bold text-slate-900 tracking-tight">
              {title}
            </h2>
          </div>
          <button
            onClick={() => router.push(`/category/${slug}`)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs sm:text-sm font-bold text-[var(--colour-fsP2)] bg-blue-50 hover:bg-blue-100 rounded-lg transition-all"
          >
            <span>View All</span>
            <ChevronRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </button>
        </div>

        <div className={cn('grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-5 lg:gap-6')}>
          {products.slice(0, 5).map((product, index) => (
            <div
              key={`${product.slug}-${index}`}
              className="w-full transform transition-all duration-300 hover:-translate-y-1"
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