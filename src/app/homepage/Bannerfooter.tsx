'use client';

import React, { useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';

import { cn } from '@/lib/utils';
import { BannerItem } from '@/app/types/BannerTypes';

// import defaultImg from '../../../public/imgfile/ASUS-AD-JULY.webp';

interface TopBannerProps {
  data?: BannerItem;
}

const TopBanner = ({ data }: TopBannerProps) => {
  // Filter banner data by slug and get images
  const images = useMemo(() => {
    if (!data?.images) return [];

    return data.images
      .sort((a, b) => a.order - b.order)
      .map((img) => ({
        id: img.id,
        name: img.content || 'Banner Image',
        src: img.image.full,
        link: img.link,
      }));
  }, [data]);

  // Fallback image if no banner data
  const bannerImage = images[0] || { src: '', name: 'Top Banner', link: '' };

  const BannerContent = (
    <div
      className={cn(
        'w-full relative overflow-hidden rounded sm:rounded cursor-pointer group',
        'aspect-auto  ', // Responsive full-width banner ratios
        'transition-premium '
      )}
    >
      <Image
        src={bannerImage.src}
        alt={bannerImage.name}
        width={1600}
        height={240}
        className="object-contain w-full  transition-transform duration-700 "
        priority


      />

      {/* Subtle overlay on hover */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0  transition-opacity duration-300" />

      {/* Ads Indicator */}
      <div className="absolute top-2 right-2 bg-[var(--colour-fsP2)]/30  px-2 py-0.5 rounded text-[10px] font-medium text-black border border-white/10 z-10">
        Ads
      </div>
    </div>
  );

  return (
    <div className="w-full mx-auto px-2 sm:px-6 py-2 sm:py-6 animate-fade-in">
      {bannerImage.link ? (
        <Link href={bannerImage.link}>
          {BannerContent}
        </Link>
      ) : (
        BannerContent
      )}
    </div>
  );
};

export default TopBanner;