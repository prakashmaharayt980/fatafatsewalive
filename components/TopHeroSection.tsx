import React from 'react';
import BannerCarouselServer from './BannerCarouselServer';
import BasketSectionServer from './BasketSectionServer';

interface TopHeroSectionProps {
  slug: string;
  title: string;
  imgSlug?: string;
}

export default async function TopHeroSection({ slug, title, imgSlug }: TopHeroSectionProps) {
  return (
    <div className="flex flex-col space-y-0">
      <BannerCarouselServer />
      <div className="mt-[-10px] relative z-20">
        <BasketSectionServer slug={slug} title={title} imgSlug={imgSlug} />
      </div>
    </div>
  );
}
