'use client';

import React, { useState, useEffect, useRef } from 'react';
import { ChevronRight } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useInView } from 'react-intersection-observer';
import useSWR from 'swr';
import ProductCard from '../ProductCard';
import { cn } from '@/lib/utils';
import { CategorySlug_ID } from '@/app/types/CategoryTypes';
import RemoteServices from '@/app/api/remoteservice';

interface RelatedProductsProps {
  title?: string;
  slug: string;
  id: string;
}

const fetcher = async (id: string) => {
  const response = await RemoteServices.CategoryProduct_ID(id);
  return response;
};

const RelatedProducts = ({ title, slug, id }: RelatedProductsProps) => {
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
      <div ref={ref} className="w-full bg-white">
        <div className="flex items-center justify-between p-4">
          <div className="h-6 w-32 bg-gray-200 rounded animate-pulse"></div>
          <div className="h-6 w-24 bg-gray-200 rounded animate-pulse"></div>
        </div>
        <hr className="mx-2 border-b-2 border-gray-200" />
        <div className="p-4">
          <div className="flex gap-4 overflow-x-hidden">
            {[...Array(6)].map((_, index) => (
              <div key={index} className="flex-shrink-0 w-[calc(16.666%-6px)]">
                <div className="bg-white rounded-lg p-2">
                  <div className="w-full h-40 bg-gray-200 rounded-lg animate-pulse"></div>
                  <div className="mt-2 h-4 w-3/4 bg-gray-200 rounded animate-pulse"></div>
                  <div className="mt-2 h-4 w-1/2 bg-gray-200 rounded animate-pulse"></div>
                  <div className="mt-2 h-6 w-1/3 bg-gray-200 rounded animate-pulse"></div>
                </div>
              </div>
            ))}
          </div>
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
    <div ref={ref} className="w-full bg-gray-50/50 py-12 border-t border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className={cn('flex items-center justify-between mb-8')}>
          <div>
            <h2 className={cn('text-2xl font-bold text-gray-900', 'sm:text-3xl tracking-tight')}>
              {title}
            </h2>
            <p className="text-gray-500 mt-2 text-sm uppercase tracking-widest font-medium">
              Curated just for you
            </p>
          </div>
          <button
            onClick={() => router.push(`/category/${slug}`)}
            className={cn(
              'group flex items-center gap-2 rounded-full border border-gray-200 bg-white shadow-sm transition-all hover:bg-gray-50 hover:shadow-md hover:border-blue-200',
              'px-4 py-2 text-sm font-semibold text-gray-700 hover:text-blue-600'
            )}
          >
            <span>View All</span>
            <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </button>
        </div>

        <div className={cn('grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6')}>
          {products.slice(0, 10).map((product, index) => (
            <div
              key={`${product.slug}-${index}`}
              className="w-full transform transition-all duration-300 hover:-translate-y-1 hover:shadow-xl rounded-2xl bg-white"
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