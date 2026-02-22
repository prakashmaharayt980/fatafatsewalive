'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Image from 'next/image';
import { CategoryData } from '../types';

interface CategoryBannerProps {
    category: CategoryData | null;
    bannerData?: {
        images: Array<{
            id: string;
            image: { full: string };
            link?: string;
            order: number;
        }>;
    };
}

export default function CategoryBanner({ category, bannerData }: CategoryBannerProps) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isAutoPlaying, setIsAutoPlaying] = useState(true);

    // Parse slides: if bannerData.images exists, use it. Otherwise fallback to category.image.
    const slides = useMemo(() => {
        const imageList = [];

        // Priority 1: Dynamic Banner Data
        if (bannerData?.images && bannerData.images.length > 0) {
            return bannerData.images
                .sort((a: any, b: any) => a.order - b.order)
                .map((img: any) => ({
                    id: img.id.toString(),
                    src: img.image.full,
                    link: img.link || '#'
                }));
        }

        // Priority 2: Fallback to static category image if dynamic banner is empty
        if (category?.image) {
            imageList.push({
                id: 'main',
                src: category.image,
                link: '#'
            });
        }

        return imageList;
    }, [category, bannerData]);

    const nextSlide = useCallback(() => {
        if (slides.length <= 1) return;
        setCurrentIndex((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
    }, [slides.length]);

    const prevSlide = useCallback(() => {
        if (slides.length <= 1) return;
        setCurrentIndex((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
    }, [slides.length]);

    // Auto-scroll logic every 5 seconds
    useEffect(() => {
        if (!isAutoPlaying || slides.length <= 1) return;

        const interval = setInterval(nextSlide, 5000);
        return () => clearInterval(interval);
    }, [isAutoPlaying, nextSlide, slides.length]);

    if (!slides || slides.length === 0) {
        return null; // Return nothing if there is no category banner image
    }

    return (
        <div className="w-full mb-8" aria-label="Category Promotions">
            <div
                className="relative overflow-hidden rounded border border-gray-100 bg-white group shadow-xs"
                onMouseEnter={() => setIsAutoPlaying(false)}
                onMouseLeave={() => setIsAutoPlaying(true)}
            >
                {/* Responsive Height Container */}
                <div className="relative w-full  min-h-[300px] aspect-auto ">
                    {/* Slides Container */}
                    <div
                        className="absolute p-0 m-0 inset-0 flex transition-transform duration-700 ease-in-out "
                        style={{ transform: `translateX(-${currentIndex * 100}%)` }}
                    >
                        {slides.map((slide, index) => (
                            <div
                                key={`slide-${slide.id}-${index}`}
                                className="relative w-full h-full flex-shrink-0 "
                            >
                                <Image
                                    src={slide.src}
                                    alt={`${category?.title || 'Category'} Banner ${index + 1}`}
                                    fill
                                    className="object-contain"
                                    priority={index === 0} // Preload ONLY the first image
                                    sizes="(max-width: 768px) 100vw"
                                    unoptimized={true} // Banners often need unoptimized to prevent huge CPU spikes or preserve GIFs
                                />
                            </div>
                        ))}
                    </div>

                    {/* Navigation Arrows */}
                    {slides.length > 1 && (
                        <>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    prevSlide();
                                }}
                                className="hidden sm:flex absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 items-center justify-center rounded-full bg-black/20 hover:bg-black/50 backdrop-blur-sm text-white opacity-0 group-hover:opacity-100 transition-all duration-300 z-10"
                                aria-label="Previous banner"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                                </svg>
                            </button>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    nextSlide();
                                }}
                                className="hidden sm:flex absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 items-center justify-center rounded-full bg-black/20 hover:bg-black/50 backdrop-blur-sm text-white opacity-0 group-hover:opacity-100 transition-all duration-300 z-10"
                                aria-label="Next banner"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                                </svg>
                            </button>

                            {/* Pagination Dots */}
                            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
                                {slides.map((_, dotIndex) => (
                                    <button
                                        key={`dot-${dotIndex}`}
                                        onClick={() => setCurrentIndex(dotIndex)}
                                        className={`w-2 h-2 rounded-full transition-all duration-300 ${currentIndex === dotIndex ? 'bg-white w-4' : 'bg-white/50 hover:bg-white'}`}
                                        aria-label={`Go to slide ${dotIndex + 1}`}
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
