import { connection } from 'next/server';
import { getRandomBasketProducts } from '@/app/api/utils/productFetchers';
import { getBannerBySlug } from '@/app/api/services/misc.service';
import { decorateProduct } from '@/app/api/utils/productDecorator';
import BasketCard from '@/app/homepage/BasketCard';
import BasketCardwithImage from '@/app/homepage/BasketCardwithImage';

interface Props {
  slug: string;
  title: string;
  imgSlug?: string;
}

export default async function BasketSectionServer({ slug, title, imgSlug }: Props) {
  await connection();

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
  const initialData = innerData ? { ...innerData, products } : null;

  if (!initialData) return null;

  return bannerUrl ? (
    <BasketCardwithImage title={title} slug={slug} imageUrl={bannerUrl} initialData={initialData} />
  ) : (
    <BasketCard title={title} slug={slug} initialData={initialData} />
  );
}
