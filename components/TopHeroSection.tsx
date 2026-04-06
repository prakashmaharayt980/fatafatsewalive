import { Suspense } from 'react';
import BannerCarouselServer from './BannerCarouselServer';
import BasketCard from '@/app/homepage/BasketCard';


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
        {slug && <BasketCard slug={slug} title={title} />}
      </div>
    </div>
  );
}
