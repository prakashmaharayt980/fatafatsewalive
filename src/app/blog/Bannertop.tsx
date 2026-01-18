'use client';

import React, { useMemo } from 'react';
import Image from 'next/image';

import { cn } from '@/lib/utils';
import { BannerItem } from '@/app/types/BannerTypes';

import defaultImg from '../../../public/imgfile/ASUS-AD-JULY.webp';

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
        src: img.image.banner || img.image.full,
        link: img.link,
      }));
  }, [data]);

  // Fallback image if no banner data
  const bannerImage = images[0] || { src: defaultImg, name: 'Top Banner', link: '' };

  return (
    <div className={cn(
      'w-full flex flex-col max-h-40 sm:flex-row gap-4 sm:gap-2  py-2'
    )}>
      {/* Image 1 */}
      <div
        className={cn(
          'w-full  relative overflow-hidden rounded-lg  cursor-pointer',
          'transition-all duration-300 '
        )}
      >
        <Image
          src={bannerImage.src}
          alt={bannerImage.name}
          width={400}
          height={200}
          className="w-full h-auto object-cover transition-transform duration-300"
          priority
        />
      </div>

      <style jsx>{`
        .group:hover .image {
          transform: scale(1.05);
        }
      `}</style>
    </div>
  );
};

export default TopBanner;