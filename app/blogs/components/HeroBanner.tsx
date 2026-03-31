'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import type { BannerItem } from '@/app/types/BannerTypes';
import { imglist } from '@/app/CommonVue/Image';

interface HeroBannerProps {
    data?: BannerItem;
}

export default function HeroBanner({ data }: HeroBannerProps) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isAutoPlaying, setIsAutoPlaying] = useState(true);

    // Process slides from banner data passed via props
    const slides = useMemo(() => {
        if (!data?.images || data.images.length === 0) {
            return [{
                id: '1',
                name: 'Latest Tech Insights & News',
                src: imglist.img1,
                link: '#',
            }];
        }

        return data.images
            .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
            .map((img) => ({
                id: img.id.toString(),
                name: img.content || 'Banner Image',
                src: img.url || img.image?.full || imglist.img1,
                link: img.link || '#',
            }));
    }, [data]);

    // Auto-slide functionality
    const nextSlide = useCallback(() => {
        if (slides.length === 0) return;
        setCurrentIndex((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
    }, [slides.length]);

    const prevSlide = useCallback(() => {
        if (slides.length === 0) return;
        setCurrentIndex((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
    }, [slides.length]);

    // Auto-play effect
    useEffect(() => {
        if (!isAutoPlaying || slides.length <= 1) return;

        const interval = setInterval(nextSlide, 5000);
        return () => clearInterval(interval);
    }, [isAutoPlaying, nextSlide, slides.length]);

    return (
        <div className="w-full mb-2">
            <div
                className="relative overflow-hidden rounded border border-gray-200 group"
                onMouseEnter={() => setIsAutoPlaying(false)}
                onMouseLeave={() => setIsAutoPlaying(true)}
            >
                {/* Responsive Height Container */}
                <div className="relative w-full  min-h-[300px] aspect-auto">

                    {/* Slides Container */}
                    <div
                        className="absolute inset-0 flex transition-transform duration-500 ease-out"
                        style={{ transform: `translateX(-${currentIndex * 100}%)` }}
                    >
                        {slides.map((slide, index) => (
                            <div
                                key={`slide-${slide.id}-${index}`}
                                className="relative w-full h-full flex-shrink-0"
                            >
                                <Link
                                    href={slide.link}
                                    className="block w-full h-full"
                                    aria-label={slide.name}
                                >
                                    <div className="relative w-full h-full bg-gradient-to-br from-[var(--colour-fsP2)]/5 to-gray-50">
                                        <Image
                                            src={slide.src}
                                            alt={slide.name}
                                            fill
                                            className={'object-contain '}
                                            priority={true}
                                        />
                                    </div>
                                </Link>
                            </div>
                        ))}
                    </div>

                    {/* Navigation Arrows */}
                    {slides.length > 1 && (
                        <>
                            <button
                                onClick={(e) => { e.stopPropagation(); prevSlide(); }}
                                className="hidden sm:flex absolute left-4 top-1/2 -translate-y-1/2 w-9 h-9 items-center justify-center rounded-full bg-black/30 hover:bg-black/50 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10"
                                aria-label="Previous slide"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                                </svg>
                            </button>
                            <button
                                onClick={(e) => { e.stopPropagation(); nextSlide(); }}
                                className="hidden sm:flex absolute right-4 top-1/2 -translate-y-1/2 w-9 h-9 items-center justify-center rounded-full bg-black/30 hover:bg-black/50 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10"
                                aria-label="Next slide"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                                </svg>
                            </button>

                            {/* Dot indicators */}
                            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 z-10">
                                {slides.map((_, i) => (
                                    <button
                                        key={i}
                                        onClick={(e) => { e.stopPropagation(); setCurrentIndex(i); }}
                                        aria-label={`Go to slide ${i + 1}`}
                                        className={[
                                            'rounded-full transition-all duration-300',
                                            i === currentIndex
                                                ? 'w-5 h-1.5 bg-white'
                                                : 'w-1.5 h-1.5 bg-white/50 hover:bg-white/80',
                                        ].join(' ')}
                                    />
                                ))}
                            </div>
                        </>
                    )}

                </div>
            </div>
        </div>
    );
}
