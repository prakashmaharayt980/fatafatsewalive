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
        src: img.image.banner || img.image.full,
        link: img.link || '#',
      }));
  }, [data]);

  return (
    <div className={cn(
      'w-full flex flex-col sm:flex-row gap-4 sm:gap-2 px-4 sm:px-6 py-4'
    )}>
      {images.map((img, idx) => (
        <Link
          key={img.id}
          href={img.link}
          className={cn(
            'w-full sm:w-1/2 relative overflow-hidden h-52 rounded-lg group cursor-pointer',
            'transition-all duration-300 hover:shadow-lg'
          )}
        >
          <Image
            src={img.src}
            alt={img.name}
            width={500}
            height={200}
            className="w-full  object-cover group-hover:scale-105 transition-transform duration-300"
            priority={idx === 0}
          />
        </Link>
      ))}

      <style jsx>{`
        .group:hover .image {
          transform: scale(1.05);
        }
      `}</style>
    </div>
  );
};

export default TwoImageBanner;