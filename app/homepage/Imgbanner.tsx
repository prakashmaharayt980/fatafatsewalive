'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import type { BannerItem } from '../types/BannerTypes';
import { trackBannerClick } from '@/lib/analytics';

interface BannerProps {
  mainBanner?: BannerItem;
  sideBanner?: BannerItem;
}

const Imgbanner = ({ mainBanner, sideBanner }: BannerProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const mainImages = useMemo(() => {
    if (!mainBanner?.images) return [];
    return mainBanner.images
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
      .map((img) => ({
        id: img.id,
        name: img.alt_text || 'Fatafat Sewa Banner',
        src: img.url || img.image?.full || '',
        link: img.link,
      }));
  }, [mainBanner]);

  const sideImages = useMemo(() => {
    if (!sideBanner?.images) return [];
    return sideBanner.images
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
      .map((img) => ({
        id: img.id,
        name: img.alt_text || 'Fatafat Sewa Offer',
        src: img.url || img.image?.full || '',
        link: img.link,
      }));
  }, [sideBanner]);

  const nextSlide = useCallback(() => {
    if (!mainImages.length) return;
    setCurrentIndex((prev) => (prev === mainImages.length - 1 ? 0 : prev + 1));
  }, [mainImages.length]);

  const prevSlide = useCallback(() => {
    if (!mainImages.length) return;
    setCurrentIndex((prev) => (prev === 0 ? mainImages.length - 1 : prev - 1));
  }, [mainImages.length]);

  useEffect(() => {
    if (!isAutoPlaying || !mainImages.length) return;
    const interval = setInterval(nextSlide, 8000);
    return () => clearInterval(interval);
  }, [isAutoPlaying, nextSlide, mainImages.length]);

  return (
    <section className="w-full px-2 py-1 sm:px-3">
      <div className="flex flex-col lg:flex-row gap-2">
        {/* MAIN BANNER */}
        <div className="w-full lg:w-[58%]">
          <div
            className="relative overflow-hidden rounded bg-gray-100"
            onMouseEnter={() => setIsAutoPlaying(false)}
            onMouseLeave={() => setIsAutoPlaying(true)}
          >
            <div className="relative w-full aspect-[1920/700]">
              {/* Slider */}
              <div
                className="absolute inset-0 flex transition-transform duration-500 ease-out will-change-transform"
                style={{
                  transform: `translate3d(-${currentIndex * 100}%, 0, 0)`,
                }}
              >
                {mainImages.map((image, index) => (
                  <div key={image.id} className="relative w-full h-full flex-shrink-0">
                    <Link
                      href={image.link || '#'}
                      className="relative block w-full h-full"
                      onClick={() =>
                        trackBannerClick(
                          image.name,
                          'Main Carousel',
                          image.link || '#'
                        )
                      }
                    >
                      <Image
                        src={image.src}
                        alt={image.name}
                        fill
                        sizes="(max-width: 1024px) 100vw, 60vw"
                        className="object-cover"
                        priority={index === 0}
                        fetchPriority={index === 0 ? 'high' : 'auto'}
                      />
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* SIDE BANNERS */}
        {sideImages.length > 0 && (
          <div className="w-full lg:w-[42%] hidden lg:flex flex-col gap-2">
            {/* Top Side Banner */}
            <Link
              href={sideImages[0].link || '#'}
              className="relative flex-1 w-full rounded overflow-hidden group block"
              onClick={() =>
                trackBannerClick(
                  sideImages[0].name,
                  'Side Banner 1',
                  sideImages[0].link || '#'
                )
              }
            >
              <Image
                src={sideImages[0].src}
                alt={sideImages[0].name}
                fill
                sizes="(max-width: 1024px) 0vw, 42vw"
                priority
                fetchPriority="high"
                loading="eager"
                className="object-contain aspect-[4/1] rounded transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </Link>

            {/* Bottom Two side-by-side */}
            {sideImages.length > 1 && (
              <div className="flex gap-2 flex-1">
                {sideImages.slice(1, 3).map((image, idx) => (
                  <Link
                    key={image.id}
                    href={image.link || '#'}
                    className="relative flex-1 rounded overflow-hidden group block"
                    onClick={() =>
                      trackBannerClick(
                        image.name,
                        `Side Banner ${idx + 2}`,
                        image.link || '#'
                      )
                    }
                  >
                    <Image
                      src={image.src}
                      alt={image.name}
                      fill
                      sizes="(max-width: 1024px) 0vw, 21vw"
                      loading="lazy"
                      className="object-contain w-full aspect-[2/1] transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
};

export default Imgbanner;