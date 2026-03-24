'use client';

import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { ChevronRight } from 'lucide-react';
import { useRouter } from 'next/navigation';
import ProductCard from '../products/ProductCard';
import { cn } from '@/lib/utils';
import { trackCategoryClick } from '@/lib/analytics';
import { useAuthStore } from '../context/AuthContext';
import { useCartStore } from '../context/CartContext';
import { useShallow } from 'zustand/react/shallow';
import type { BasketProduct } from '../types/ProductDetailsTypes';
import SkeletonCard from '../skeleton/SkeletonCard';

interface BasketCardProps {
  title?: string;
  slug: string;
  initialData?: any;
  isFirstSection?: boolean;
}

// How many products to render up front
const INITIAL_VISIBLE = 5;
// How many to add each time the sentinel is crossed
const BATCH_SIZE = 4;

// Module-level set to remember which sections have already been fully loaded
const loadedSections = new Set<string>();

const BasketCard = ({ title, slug, initialData, isFirstSection = false }: BasketCardProps) => {
  const router = useRouter();
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const [windowWidth, setWindowWidth] = useState(0);
  const [activeDot, setActiveDot] = useState(0);
  const [imagesLoaded, setImagesLoaded] = useState(0);
  // isFirstSection=true → start ready immediately (SSR data already present, no delay)
  // Otherwise, check if this section was previously loaded in the same session
  const [isReady, setIsReady] = useState(() => isFirstSection || loadedSections.has(slug));
  // How many products are currently injected into the DOM
  const [visibleCount, setVisibleCount] = useState(INITIAL_VISIBLE);

  const { user, triggerLoginAlert } = useAuthStore(useShallow(state => ({
    user: state.user,
    triggerLoginAlert: state.triggerLoginAlert
  })));

  const {
    addToWishlist,
    wishlistItems,
    addToCompare,
    removeFromCompare,
    isInCompare
  } = useCartStore(useShallow(
    state => ({
      addToWishlist: state.addToWishlist,
      wishlistItems: state.wishlistItems,
      addToCompare: state.addToCompare,
      removeFromCompare: state.removeFromCompare,
      isInCompare: state.isInCompare
    })
  ));

  // Handle window resize with a throttled approach
  useEffect(() => {
    setWindowWidth(window.innerWidth);
    let timeoutId: NodeJS.Timeout;
    const handleResize = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        setWindowWidth(window.innerWidth);
      }, 150);
    };
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      clearTimeout(timeoutId);
    };
  }, []);

  const products = initialData?.products || [];

  const { itemsPerPage, totalPages, isMobile } = useMemo(() => {
    const isMob = windowWidth > 0 && windowWidth < 640;
    const ipp = isMob ? 2 : 5;
    const tp = Math.ceil((products.length || 0) / ipp) || 1;
    return { isMobile: isMob, itemsPerPage: ipp, totalPages: tp };
  }, [windowWidth, products.length]);

  const handleImageLoad = useCallback(() => setImagesLoaded(prev => prev + 1), []);

  // Readiness gate — show content once first batch of images load.
  // Fallback: 100ms if images are cached (cached images may not fire onLoad).
  // isFirstSection = true skips delay entirely (products pre-rendered via SSR).
  useEffect(() => {
    if (isReady || !products.length) return;
    const fallbackMs = isFirstSection ? 0 : 100;
    const timer = setTimeout(() => {
      setIsReady(true);
      loadedSections.add(slug);
    }, fallbackMs);
    return () => clearTimeout(timer);
  }, [isReady, slug, products.length, isFirstSection]);

  useEffect(() => {
    if (!isReady && products.length > 0 && imagesLoaded >= Math.min(products.length, itemsPerPage)) {
      setIsReady(true);
      loadedSections.add(slug);
    }
  }, [imagesLoaded, products.length, itemsPerPage, isReady, slug]);

  // ── IntersectionObserver: expand DOM as user scrolls right ─────────────────
  useEffect(() => {
    if (!isReady || visibleCount >= products.length) return;
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setVisibleCount(prev => Math.min(prev + BATCH_SIZE, products.length));
        }
      },
      {
        root: scrollContainerRef.current, // scroll container is the viewport
        threshold: 0.1,
      }
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [isReady, visibleCount, products.length]);

  if (!isReady || !products.length) return <SkeletonCard />;

  // Scroll to specific dot page
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
    // When the user navigates forward, pre-reveal enough products
    const neededForPage = (index + 1) * itemsPerPage;
    if (neededForPage > visibleCount) {
      setVisibleCount(Math.min(neededForPage + BATCH_SIZE, products.length));
    }
  };

  // Only slice the products that are currently in the DOM
  const visibleProducts = products.slice(0, visibleCount);

  return (
    <div className="w-full py-2 sm:py-3 bg-transparent">
      {/* Header */}
      <div className="flex items-center justify-between px-4 sm:px-6 mb-3">
        <div className="flex items-center gap-3">
          <div className="w-1 h-7 bg-slate-800 rounded-full" />
          <h2 className="text-lg sm:text-xl font-semibold text-slate-800 tracking-tight">
            {title}
          </h2>
        </div>

        <button
          onClick={() => {
            trackCategoryClick(title || slug, 'view_all');
            router.push(`/category/${slug}`);
          }}
          className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-[var(--colour-fsP2)] cursor-pointer hover:text-slate-900 hover:bg-slate-100 rounded-full transition-all duration-200 group"
        >
          View All
          <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
        </button>
      </div>

      {/* Product list */}
      <div className="relative group/list px-1 sm:px-6">
        <div
          ref={scrollContainerRef}
          className={cn(
            'flex overflow-x-auto overflow-y-visible scrollbar-hide snap-x',
            'pb-2 mt-2 pt-2',
          )}
          style={{
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
            scrollBehavior: 'smooth',
          }}
        >
          {visibleProducts.map((product: any, index: number) => {
            const isWishlisted = wishlistItems.some(i => i.id === product.id);
            const isCompared = isInCompare(product.id);

            return (
              <div
                key={`${product.slug}-${index}`}
                className={cn(
                  'flex-shrink-0 snap-start px-1 sm:px-1.5',
                  'w-1/2 sm:w-1/3 md:w-1/4 lg:w-1/5'
                )}
              >
                <ProductCard
                  product={product}
                  isFirstSection={isFirstSection}
                  simple={true}
                  index={index}
                  isWishlisted={isWishlisted}
                  isCompared={isCompared}
                  onLoad={handleImageLoad}
                  onWishlist={() => addToWishlist(product.id, user, triggerLoginAlert, product as BasketProduct)}
                  onCompare={() => {
                    if (isCompared) {
                      removeFromCompare(product.id);
                    } else {
                      addToCompare(product);
                    }
                  }}
                />
              </div>
            );
          })}

          {/* Sentinel — observed to trigger the next batch of products */}
          {visibleCount < products.length && (
            <div
              ref={sentinelRef}
              className="flex-shrink-0 w-8 self-stretch"
              aria-hidden="true"
            />
          )}
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
    </div>
  );
};

export default React.memo(BasketCard);