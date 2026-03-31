'use client';

import { useCallback } from 'react';
import dynamic from 'next/dynamic';
import LazySection from './LazySection';
import SkeletonCard from '@/app/skeleton/SkeletonCard';
import { getRandomBasketProducts } from '@/app/api/utils/productFetchers';
import { getBannerBySlug } from '@/app/api/services/misc.service';
import { decorateProduct } from '@/app/api/utils/productDecorator';

const BasketCard = dynamic(() => import('@/app/homepage/BasketCard'), { ssr: true });
const BasketCardwithImage = dynamic(() => import('@/app/homepage/BasketCardwithImage'), { ssr: true });

interface Props {
  slug: string;
  title: string;
  imgSlug?: string;
  isFirstSection?: boolean;
  sectionIndex?: number;
}

interface FetchResult {
  products: any;
  bannerUrl?: string;
}

export default function BasketSectionClient({ slug, title, imgSlug, isFirstSection = false, sectionIndex = 0 }: Props) {
  const rootMargin = sectionIndex === 0 ? '100px' : '0px';

  const fetcher = useCallback(async (): Promise<FetchResult> => {
    const [prodRes, bannerRes] = await Promise.allSettled([
      getRandomBasketProducts(slug),
      imgSlug ? getBannerBySlug(imgSlug).then(r => r.data) : null,
    ]);

    const productsData = prodRes.status === 'fulfilled' ? prodRes.value : null;
    const bannerData = bannerRes.status === 'fulfilled' ? bannerRes.value : null;
    const bannerUrl = bannerData?.images?.[0]?.url;

    const innerData = productsData?.data ?? productsData;
    const rawProducts = innerData?.products ?? [];
    const products = rawProducts.map((p: any, i: number) => decorateProduct(p, i));

    return {
      products: innerData ? { ...innerData, products } : null,
      bannerUrl,
    };
  }, [slug, imgSlug]);

  const render = useCallback(
    (data: FetchResult) => {
      if (!data.products) return null;
      return data.bannerUrl ? (
        <BasketCardwithImage title={title} slug={slug} imageUrl={data.bannerUrl} initialData={data.products} isFirstSection={isFirstSection} />
      ) : (
        <BasketCard title={title} slug={slug} initialData={data.products} isFirstSection={isFirstSection} />
      );
    },
    [title, slug, isFirstSection]
  );

  return <LazySection fallback={<SkeletonCard />} minHeight="400px" rootMargin={rootMargin} fetcher={fetcher} render={render} />;
}
