'use client';

import { memo, useRef, useCallback, useMemo, useEffect } from 'react';
import { ChevronRight } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { trackCategoryClick } from '@/lib/analytics';
import ProductCard from '../product-details/ProductCard';
import SkeletonCard from '../skeleton/SkeletonCard';
import type { BasketProduct } from '../types/ProductDetailsTypes';
import { useBasketState, useStoreSelectors, usePagination, useScrollObserver } from './hooks/useBasketState';

interface Props {
  title?: string;
  slug: string;
  initialData?: { products?: any[] };
  isFirstSection?: boolean;
}

const BATCH_SIZE = 4;

const CardItem = memo(function CardItem({ product, index, isFirstSection, isWishlisted, isCompared, cart, auth }: {
  product: any;
  index: number;
  isFirstSection: boolean;
  isWishlisted: boolean;
  isCompared: boolean;
  cart: ReturnType<typeof useStoreSelectors>['cart'];
  auth: ReturnType<typeof useStoreSelectors>['auth'];
}) {
  return (
    <ProductCard
      product={product}
      isFirstSection={isFirstSection}
      simple
      index={index}
      isWishlisted={isWishlisted}
      isCompared={isCompared}
      onWishlist={() => cart.addToWishlist(product.id, auth.user, auth.triggerLoginAlert, product as BasketProduct)}
      onCompare={() => cart.isInCompare(product.id) ? cart.removeFromCompare(product.id) : cart.addToCompare(product)}
    />
  );
});

function BasketCard({ title, slug, initialData, isFirstSection = false }: Props) {
  const router = useRouter();
  const scrollRef = useRef<HTMLDivElement>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const itemWidthRef = useRef(0);

  const products = initialData?.products ?? [];
  const { state, updateState } = useBasketState(slug, products.length > 0);
  const { auth, cart } = useStoreSelectors();
  const { isMobile, itemsPerPage, totalPages } = usePagination(products.length, state.width);

  const visibleCountRef = useRef(state.visibleCount);
  visibleCountRef.current = state.visibleCount;
  const productsLengthRef = useRef(products.length);
  productsLengthRef.current = products.length;

  const loadMore = useCallback(() => {
    updateState({ visibleCount: Math.min(visibleCountRef.current + BATCH_SIZE, productsLengthRef.current) });
  }, [updateState]);

  useScrollObserver(scrollRef as React.RefObject<HTMLDivElement>, sentinelRef as React.RefObject<HTMLDivElement>, state.ready, state.visibleCount, products.length, loadMore);

  useEffect(() => { itemWidthRef.current = 0; }, [state.width]);

  const wishlistSet = useMemo(() => new Set(cart.wishlistItems.map((i: any) => i.id)), [cart.wishlistItems]);

  if (!state.ready || !products.length) return <SkeletonCard />;



  const visibleProducts = useMemo(() => products.slice(0, state.visibleCount), [products, state.visibleCount]);

  return (
    <div className="w-full py-2 sm:py-3 bg-transparent">
      <div className="flex  items-center justify-between px-4 sm:px-6 mb-3">
        <div className="flex items-center gap-3">
          <div className="w-1 h-7 bg-slate-800 rounded-full" />
          <h2 className="text-lg sm:text-xl font-semibold text-slate-800 tracking-tight">{title}</h2>
        </div>
        <button
          onClick={() => {
            trackCategoryClick(title ?? slug, 'view_all');
            router.push(`/category/${slug}`);
          }}
          className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-[var(--colour-fsP2)] cursor-pointer hover:text-slate-900 hover:bg-slate-100 rounded-full transition-all duration-200 group"
        >
          View All
          <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
        </button>
      </div>

      <div className="relative group/list px-1 sm:px-6">
        <div
          ref={scrollRef}
          className="flex overflow-x-auto overflow-y-visible scrollbar-hide snap-x pb-2 mt-2 pt-2"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none', scrollBehavior: 'smooth' }}
        >
          {visibleProducts.map((product: any, index: number) => (
            <div
              key={product.id}
              className="flex-shrink-0 snap-start px-1 sm:px-1.5 w-1/2 sm:w-1/3 md:w-1/4 lg:w-1/5"
            >
              <CardItem
                product={product}
                isFirstSection={isFirstSection}
                index={index}
                isWishlisted={wishlistSet.has(product.id)}
                isCompared={cart.isInCompare(product.id)}
                cart={cart}
                auth={auth}
              />
            </div>
          ))}
       
        </div>

        {/* {totalPages > 1 && (
          <div className="flex justify-center gap-3">
            {Array.from({ length: isMobile ? Math.min(totalPages, 2) : totalPages }, (_, i) => (
              <button
                key={i}
                onClick={() => scrollToPage(i)}
                className="group cursor-pointer focus:outline-none"
                aria-label={`Go to page ${i + 1}`}
              >
                <div
                  className={cn(
                    'h-2 rounded-full transition-all duration-300',
                    i === state.activeDot ? 'bg-slate-300 w-6' : 'bg-[var(--colour-fsP2)] group-hover:bg-slate-300 w-4'
                  )}
                />
              </button>
            ))}
          </div>
        )} */}
      </div>
    </div>
  );
}

export default memo(BasketCard);
