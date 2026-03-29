import { getRandomBasketProducts } from '@/app/api/utils/productFetchers';
import { getBannerBySlug } from '@/app/api/services/misc.service';
import { connection } from 'next/server';
import dynamic from 'next/dynamic';
const BasketCard = dynamic(() => import('@/app/homepage/BasketCard'), { ssr: true });
const BasketCardwithImage = dynamic(() => import('@/app/homepage/BasketCardwithImage'), { ssr: true });

import { decorateProduct } from '@/app/api/utils/productDecorator';

interface BasketSectionServerProps {
    slug: string;
    title: string;
    imgSlug?: string;
}

export default async function BasketSectionServer({ slug, title, imgSlug }: BasketSectionServerProps) {
    // Declares this component as dynamic for PPR
    await connection();
    
    const [prodRes, bannerRes] = await Promise.allSettled([
        getRandomBasketProducts(slug),
        imgSlug ? getBannerBySlug(imgSlug).then(res => res.data) : Promise.resolve(null)
    ]);

    const productsData = prodRes.status === 'fulfilled' ? prodRes.value : null;
    const bData = bannerRes.status === 'fulfilled' ? bannerRes.value : null;
    const bannerUrl = bData?.images?.[0]?.url;

    // Decorate products on server — API body is { data: { products: [...] } }
    const rawProducts = productsData?.data?.products || productsData?.products || [];
    const decoratedProducts = rawProducts.map((p: any, idx: number) => decorateProduct(p, idx));
    const innerData = productsData?.data || productsData;
    const initialData = innerData ? { ...innerData, products: decoratedProducts } : null;

    return bannerUrl ? (
        <BasketCardwithImage
            title={title}
            slug={slug}
            imageUrl={bannerUrl}
            initialData={initialData}
        />
    ) : (
        <BasketCard
            title={title}
            slug={slug}
            initialData={initialData}
        />
    );
}
