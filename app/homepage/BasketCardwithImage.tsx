'use client';

import { memo, useRef, useMemo, useCallback } from 'react';
import { ChevronRight, ArrowRight } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { trackCategoryClick } from '@/lib/analytics';
import ProductCard from '../product-details/ProductCard';
import useSWR from 'swr';
import { getRandomBasketProducts } from '@/app/api/utils/productFetchers';
import { getBannerData } from '@/app/api/CachedHelper/getBannerData';
import { decorateProduct } from '@/app/api/utils/productDecorator';
import SkeletonCard from '../skeleton/SkeletonCard';
import type { BasketProduct } from '../types/ProductDetailsTypes';
import { useBasketState, useStoreSelectors, usePagination, useScrollObserver } from './hooks/useBasketState';


interface Props {
  title?: string;
  slug: string;
  imageUrl?: string;
  imgSlug?: string;
  initialData?: { products?: any[] };
  isFirstSection?: boolean;
}

function BasketCardwithImage({ title, slug, imageUrl, imgSlug, initialData, isFirstSection = false }: Props) {
  const router = useRouter();
  const scrollRef = useRef<HTMLDivElement>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);

  const hasInitialData = Array.isArray(initialData?.products) && initialData!.products.length > 0;

  const { data: swrData, isLoading: swrLoading } = useSWR(
    hasInitialData ? null : ['basketImage', slug, imgSlug],
    async ([_, s, iSlug]) => {
      const [prodRes, bannerRes] = await Promise.allSettled([
        getRandomBasketProducts(s),
        iSlug ? getBannerData(iSlug) : Promise.resolve(null)
      ]);

      const innerData = prodRes.status === 'fulfilled' ? ((prodRes.value as any)?.data ?? prodRes.value) : null;
      const rawProducts = innerData?.products ?? [];
      const decorated = rawProducts.map((p: any, index: number) => decorateProduct(p, index));

      const bannerData = bannerRes.status === 'fulfilled' ? (bannerRes.value?.data ?? bannerRes.value) : null;
      const bannerUrl = bannerData?.images?.[0]?.url;

      return { products: decorated, bannerUrl };
    },
    { revalidateOnFocus: false }
  );

  const products = useMemo(() => {
    if (hasInitialData && initialData?.products) {
      return initialData.products.map((p: any, index: number) => decorateProduct(p, index));
    }
    return swrData?.products ?? [];
  }, [hasInitialData, initialData?.products, swrData]);

  const finalImageUrl = swrData?.bannerUrl ?? imageUrl;
  const isLoading = hasInitialData ? false : swrLoading;

  const { state, updateState } = useBasketState(slug, products.length > 0);
  const { auth, cart, wishlistSet } = useStoreSelectors();


  const BATCH_SIZE = 4;
  const visibleCountRef = useRef(state.visibleCount);
  visibleCountRef.current = state.visibleCount;
  const productsLengthRef = useRef(products.length);
  productsLengthRef.current = products.length;

  const loadMore = useCallback(() => {
    updateState({ visibleCount: Math.min(visibleCountRef.current + BATCH_SIZE, productsLengthRef.current) });
  }, [updateState]);

  useScrollObserver(scrollRef as React.RefObject<HTMLDivElement>, sentinelRef as React.RefObject<HTMLDivElement>, state.ready, state.visibleCount, products.length, loadMore);

  const visibleProducts = useMemo(() => products.slice(0, state.visibleCount), [products, state.visibleCount]);

  if (isLoading || !state.ready || !products.length) return <SkeletonCard withBanner />;



  const goToCategory = () => {
    trackCategoryClick(title ?? slug, 'view_all');
    router.push(`/category/${slug}`);
  };

  return (
    <section className="w-full my-6 group/section">
      <div className="flex flex-col md:flex-row gap-4 h-auto items-stretch min-h-[460px]">
        {finalImageUrl && (
          <div
            onClick={() => {
              trackCategoryClick(title ?? slug, 'banner_side');
              router.push(`/category/${slug}`);
            }}
            className="hidden md:flex w-full md:w-1/5 min-w-[220px] relative rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-500 group/banner cursor-pointer shrink-0"
          >
            <Image
              src={finalImageUrl}
              alt={title ?? 'Category'}
              fill
              className="object-cover transition-transform duration-1000"
              sizes="(max-width: 1024px) 30vw, 20vw"
            />
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

        <div className={cn(
          'flex-1 flex flex-col bg-white overflow-hidden px-2 border-none',
          finalImageUrl ? 'w-full md:w-4/5' : 'w-full'
        )}>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="w-1 h-7 bg-slate-800 rounded-full" />
              <h2 className="text-lg sm:text-xl font-semibold text-slate-800 tracking-tight">{title}</h2>
            </div>
            <button
              onClick={goToCategory}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-[var(--colour-fsP2)] cursor-pointer hover:text-slate-900 hover:bg-slate-100 rounded-full transition-all duration-200 group"
            >
              View All
              <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
            </button>
          </div>

          <div className="flex-1 px-0 relative pb-6 pt-4">
            <div
              ref={scrollRef}
              className="flex overflow-x-auto scrollbar-hide h-full items-start snap-x snap-mandatory gap-4 px-4 sm:px-6"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none', scrollBehavior: 'smooth' }}
            >
              {visibleProducts.map((product: any, index: number) => (
                <div
                  key={product.id}
                  className="shrink-0 snap-start w-[calc(50%-8px)] sm:w-[calc(33.333%-11px)] md:w-[calc(25%-12px)]"
                >
                  <ProductCard
                    product={product}
                    index={index}
                    simple
                    isWishlisted={wishlistSet.has(product.id)}
                    isCompared={cart.isInCompare(product.id)}
                    onWishlist={() => cart.addToWishlist(product.id, auth.user, auth.triggerLoginAlert, product as BasketProduct)}
                    onCompare={() => cart.isInCompare(product.id) ? cart.removeFromCompare(product.id) : cart.addToCompare(product)}
                  />
                </div>
              ))}
              {/* Intersection Observer Sentinel */}
              {state.visibleCount < products.length && (
                <div ref={sentinelRef} className="shrink-0 w-4 h-full" aria-hidden="true" />
              )}
            </div>


          </div>
        </div>
      </div>
    </section>
  );
}

export default memo(BasketCardwithImage);
