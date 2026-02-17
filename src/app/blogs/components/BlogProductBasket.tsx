'use client';

import React, { useState, useEffect, useRef } from 'react';
import { ChevronRight } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useInView } from 'react-intersection-observer';
import useSWR from 'swr';

import SkeltonCard from '@/app/homepage/SkeltonCard';
import { cn } from '@/lib/utils';
import { CategorySlug_ID } from '@/app/types/CategoryTypes';
import RemoteServices, { CategoryService } from '@/app/api/remoteservice';
import BlogProductCard from '@/app/products/ProductCards/blogProducts';
import SkeltonBasket from '@/app/skeleton/skelettonBasket';

interface BlogProductBasketProps {
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

const BlogProductBasket = ({ title, slug, id, brandSlug, minPrice, maxPrice }: BlogProductBasketProps) => {
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
          <SkeltonBasket />
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


  return (
    <div ref={ref} className="w-full bg-white py-1 sm:py-1 border-t border-gray-100">
      <div className={cn('grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-2')}>
        {products.slice(0, 6).map((product, index) => (
          <div
            key={`${product.slug}-${index}`}
            className="w-full transform transition-all duration-300 hover:-translate-y-1"
          >
            <BlogProductCard product={product as any} index={index} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default BlogProductBasket;