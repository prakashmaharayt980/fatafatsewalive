'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useInView } from 'react-intersection-observer';
import useSWR from 'swr';

import { cn } from '@/lib/utils';
import BlogProductCard from '@/app/product-details/ProductCards/blogProducts';
import { fetchCategoryProducts, fetchRandomBasketProducts } from '@/app/blogs/actions';
import type { BasketProduct } from '@/app/types/ProductDetailsTypes';

interface BlogProductBasketProps {
  title?: string;
  slug: string;
  id: string;
  brandSlug?: string;
  minPrice?: number;
  maxPrice?: number;
  data?: any[];
  random?: boolean;
  isEmi?: boolean;
}

const fetcher = async ({
  slug,
  brandSlug,
  minPrice,
  maxPrice,
  random,
}: {
  slug: string;
  brandSlug?: string;
  minPrice?: number;
  maxPrice?: number;
  random?: boolean;
}) => {
  if (random) return fetchRandomBasketProducts(slug, 6);
  return fetchCategoryProducts(slug, {
    brand: brandSlug,
    min_price: minPrice,
    max_price: maxPrice,
    per_page: 6,
  } as any);
};

/* ── Skeleton card ─────────────────────────────────────────── */
const CardSkeleton = () => (
  <div className="flex flex-col bg-white rounded-xl border border-[var(--colour-border3)] overflow-hidden animate-pulse">
    <div className="aspect-square bg-[var(--colour-bg4)]" />
    <div className="p-2.5 flex flex-col gap-2">
      <div className="h-2 w-2/3 rounded bg-[var(--colour-bg4)]" />
      <div className="h-2.5 w-full rounded bg-[var(--colour-bg4)]" />
      <div className="h-2.5 w-4/5 rounded bg-[var(--colour-bg4)]" />
      <div className="mt-1 h-3 w-1/2 rounded bg-[var(--colour-bg4)]" />
    </div>
  </div>
);

/* ── Main component ────────────────────────────────────────── */
const BlogProductBasket = ({
  title,
  slug,
  id,
  brandSlug,
  minPrice,
  maxPrice,
  data,
  random = true,
  isEmi = false,
}: BlogProductBasketProps) => {
  const router = useRouter();
  const { ref, inView } = useInView({ threshold: 0.05, triggerOnce: true });

  const { data: productList, error } = useSWR(
    inView && !data ? { slug, brandSlug, minPrice, maxPrice, random } : null,
    fetcher,
    { dedupingInterval: 60000, revalidateOnFocus: false }
  );

  const products: BasketProduct[] =
    data || productList?.data?.products || productList?.data || [];

  const isLoading = !data && !productList && !error && inView;
  const isEmpty = !isLoading && !error && products.length === 0;

  return (
    <section ref={ref} className="w-full">
      {/* Header */}
      {title && (
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-[var(--colour-text1)] tracking-tight">
            {title}
          </h2>
          <button
            onClick={() => router.push(`/category/${slug}`)}
            className="text-[11px] text-[var(--colour-text3)] hover:text-[var(--colour-fsP2)] transition-colors"
          >
            View all →
          </button>
        </div>
      )}

      {/* Loading skeletons */}
      {isLoading && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2.5">
          {Array.from({ length: 6 }).map((_, i) => <CardSkeleton key={i} />)}
        </div>
      )}

      {/* Error */}
      {error && (
        <p className="text-xs text-red-400 text-center py-6">
          Failed to load products.
        </p>
      )}

      {/* Empty */}
      {isEmpty && (
        <p className="text-xs text-[var(--colour-text3)] text-center py-6">
          No products found.
        </p>
      )}

      {/* Pre-visible placeholder */}
      {!inView && !data && (
        <div className="min-h-[200px]" />
      )}

      {/* Product grid */}
      {products.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2.5">
          {products.map((product, index) => (
            <BlogProductCard
              key={`${product.slug}-${index}`}
              product={product as any}
              index={index}
              isEmi={isEmi}
            />
          ))}
        </div>
      )}
    </section>
  );
};

export default BlogProductBasket;