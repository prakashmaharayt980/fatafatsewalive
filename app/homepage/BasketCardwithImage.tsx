'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { ChevronRight, ArrowRight } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import ProductCard from '../products/ProductCard';
import { cn } from '@/lib/utils';
import { trackCategoryClick } from '@/lib/analytics';
import { useAuthStore } from '../context/AuthContext';
import { useCartStore } from '../context/CartContext';
import { useShallow } from 'zustand/react/shallow';
import type { BasketProduct } from '../types/ProductDetailsTypes';
import SkeletonCard from '../skeleton/SkeletonCard';

interface BasketCardwithImageProps {
  title?: string;
  slug: string;
  imageUrl?: string;
  initialData?: any;
  isFirstSection?: boolean;
}

const BasketCardwithImage = ({ title, slug, imageUrl, initialData, isFirstSection = false }: BasketCardwithImageProps) => {
  const router = useRouter();
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [windowWidth, setWindowWidth] = useState(0);
  const [activeDot, setActiveDot] = useState(0);

  const productList = initialData?.products || [];

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

  // Handle window resize with a throttled/debounced approach
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

  // Memoize responsive logic
  const { itemsPerPage, totalPages } = useMemo(() => {
    let ipp = 2;
    if (windowWidth >= 1024) ipp = 4;
    else if (windowWidth >= 768) ipp = 3;
    
    const tp = Math.ceil((productList.length || 0) / ipp) || 1;
    return { itemsPerPage: ipp, totalPages: tp };
  }, [windowWidth, productList.length]);

  if (!productList.length) return <SkeletonCard />;

  const scrollToPage = (pageIndex: number) => {
    if (scrollContainerRef.current) {
      const scrollDistance = pageIndex * scrollContainerRef.current.offsetWidth;
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
    <section className="w-full my-6 group/section">
      <div className="flex flex-col md:flex-row gap-4 h-auto items-stretch min-h-[460px]">

        {/* Banner Image Side - Desktop Only */}
        {imageUrl && (
          <div
            onClick={() => {
              trackCategoryClick(title || slug, 'banner_side');
              router.push(`/category/${slug}`);
            }}
            className="hidden md:flex w-full md:w-1/5 min-w-[220px] relative rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-500 group/banner cursor-pointer shrink-0"
          >
            <Image
              src={imageUrl}
              alt={title || 'Category'}
              fill
              className="object-cover transition-transform duration-1000 "
              sizes="(max-width: 1024px) 30vw, 20vw"
            />
            {/* Elegant Fade Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-80 group-hover/banner:opacity-50 transition-opacity duration-500" />

            <div className="absolute bottom-6 left-6 right-6 text-white transform translate-y-2 group-hover/banner:translate-y-0 transition-transform duration-500">
              <span className="text-xs font-bold uppercase tracking-widest text-white/70 mb-1 block">Collection</span>
              <h3 className="text-xl font-black mb-3 drop-shadow-lg leading-tight">{title}</h3>
              <div className="inline-flex items-center gap-2 text-sm font-bold bg-white/20 backdrop-blur-md px-3 py-1.5 rounded-full opacity-0 group-hover/banner:opacity-100 transition-opacity duration-300">
                Shop Now <ArrowRight className="w-4 h-4" />
              </div>
            </div>
          </div>
        )}

        {/* Content Side */}
        <div className={cn(
          "flex-1 flex flex-col bg-white overflow-hidden px-2  border-none",
          imageUrl ? "w-full md:w-4/5" : "w-full"
        )}>


          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              {/* Vertical accent bar */}
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

          {/* Product Grid Carousel */}
          <div className="flex-1 px-0 relative pb-6 pt-4">
            <div
              ref={scrollContainerRef}
              className={cn(
                'flex overflow-x-auto scrollbar-hide h-full items-start snap-x snap-mandatory',
                'gap-4 px-4 sm:px-6'
              )}
              style={{
                scrollbarWidth: 'none',
                msOverflowStyle: 'none',
                scrollBehavior: 'smooth',
              }}
            >
              {productList.map((product: any, index: number) => {
                const isWishlisted = wishlistItems.some(i => i.id === product.id);
                const isCompared = isInCompare(product.id);

                return (
                  <div
                    key={`${product.slug}-${index}`}
                    className={cn(
                      'shrink-0 snap-start',
                      'w-[calc(50%-8px)] sm:w-[calc(33.333%-11px)] md:w-[calc(25%-12px)]'
                    )}
                  >
                    <ProductCard 
                      product={product} 
                      simple={true}
                      index={index} 
                      isWishlisted={isWishlisted}
                      isCompared={isCompared}
                      onWishlist={() => addToWishlist(product.id, user, triggerLoginAlert, product as BasketProduct)}
                      onCompare={(e) => {
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
            </div>

            {/* Navigation Indicators */}
            {totalPages > 1 && (
              <div className="absolute bottom-1 left-0 right-0 flex justify-center pb-2 pointer-events-none">
                <div className="flex gap-2 pointer-events-auto items-center px-4 py-1.5 bg-gray-50/50 rounded-full backdrop-blur-sm">
                  {[...Array(Math.min(totalPages, 8))].map((_, index) => (
                    <button
                      key={index}
                      onClick={() => handleDotClick(index)}
                      className="group cursor-pointer focus:outline-none p-1"
                      aria-label={`Go to page ${index + 1}`}
                    >
                      <div
                        className={cn(
                          'h-1.5 rounded-full transition-all duration-500',
                          index === activeDot
                            ? 'bg-[var(--colour-fsP1)] w-8 shadow-sm'
                            : 'bg-gray-200 group-hover:bg-gray-400 w-1.5'
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
    </section>
  );
};

export default React.memo(BasketCardwithImage);