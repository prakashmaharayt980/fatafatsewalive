'use client';

import React, { useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';

import { cn } from '@/lib/utils';
import { imglist } from '@/app/CommonVue/Image';
import { BannerItem } from '@/app/types/BannerTypes';

interface TwoImageBannerProps {
  data?: BannerItem;
}

const TwoImageBanner = ({ data }: TwoImageBannerProps) => {
  // 1. Keep your logic for filtering and mapping data
  const images = useMemo(() => {
    if (!data?.images || data.images.length === 0) {
      // Default fallbacks if no data is provided
      return [
        { id: '1', name: 'Banner 1', src: imglist.img1, link: '#' },
        { id: '2', name: 'Banner 2', src: imglist.img2, link: '#' },
      ];
    }

    return data.images
      .sort((a, b) => a.order - b.order)
      .slice(0, 2) // Ensure it only takes two images for this specific UI
      .map((img) => ({
        id: img.id.toString(),
        name: img.content || 'Banner Image',
        src: img.image.full,
        link: img.link || '#',
      }));
  }, [data]);

  return (
    <div className="w-full px-4 sm:px-6 py-4">
      <div className={cn(
        'flex flex-row overflow-x-auto sm:grid sm:grid-cols-2 gap-4 pb-4 sm:pb-0 snap-x snap-mandatory scrollbar-hide'
      )}>
        {images.map((img, idx) => (
          <Link
            key={img.id}
            href={img.link}
            className={cn(
              'min-w-[90%] sm:min-w-0 flex-shrink-0 snap-center',
              'relative overflow-hidden rounded sm:rounded group cursor-pointer border-none', // Removed border
              'aspect-[24/9] sm:aspect-[4.9/1.8] ', // Standard Aspect Ratio
              'transition-all duration-300 ', // Attractive lift effect
              'shadow-sm hover:shadow-xl' // Stronger shadow on hover
            )}
          >
            <Image
              src={img.src}
              alt={img.name}
              fill
              className="object-fill transition-transform duration-700 " // Ensure object-cover for better fit
              priority={idx === 0}
              sizes="(max-width: 640px) 90vw, 50vw"
              unoptimized={true}
            />

            {/* Premium Overlay */}
            <div className="absolute inset-0 transition-opacity duration-300" />
          </Link>
        ))}
      </div>
    </div>
  );
};



export default TwoImageBanner;