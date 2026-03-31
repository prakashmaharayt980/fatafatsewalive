import { Suspense } from 'react';
import BannerCarouselServer from './BannerCarouselServer';
import BasketSectionServer from './BasketSectionServer';

interface Props {
  slug: string;
  title: string;
  imgSlug?: string;
}

export default async function TopHeroSection({ slug, title, imgSlug }: Props) {
  return (
    <div className="flex flex-col">
      <BannerCarouselServer />
      <div className="mt-[-10px] relative z-20">
        <Suspense fallback={<div className="min-h-[400px] w-full bg-gray-50/50 animate-pulse rounded-xl" />}>
          <BasketSectionServer slug={slug} title={title} imgSlug={imgSlug} />
        </Suspense>
      </div>
    </div>
  );
}
