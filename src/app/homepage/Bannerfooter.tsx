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
        'w-full relative overflow-hidden rounded sm:rounded-xl cursor-pointer group',
        'aspect-[16/9] sm:aspect-[16/2] ', // Responsive full-width banner ratios
        'transition-premium hover-premium shadow-premium-sm'
      )}
    >
      <Image
        src={bannerImage.src}
        alt={bannerImage.name}
        fill
        className="object-fill w-full  transition-transform duration-700 "
        priority
        unoptimized={true}

      />

      {/* Subtle overlay on hover */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0  transition-opacity duration-300" />
    </div>
  );

  return (
    <div className="w-full mx-auto px-2 sm:px-6 py-2 sm:py-6 animate-fade-in-premium">
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