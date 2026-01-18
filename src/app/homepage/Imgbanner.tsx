import React, { useState, useEffect, useCallback, useMemo } from 'react';

import Image from 'next/image';
import { BannerItem } from '../types/BannerTypes';

import Link from 'next/link';

interface BannerProps {
    mainBanner?: BannerItem;
    sideBanner?: BannerItem;
}

const Imgbanner = ({ mainBanner, sideBanner }: BannerProps) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isAutoPlaying, setIsAutoPlaying] = useState(true);
    const [imageLoading, setImageLoading] = useState(true);

    // Filter banner data by slug and get images
    const mainImages = useMemo(() => {
        if (!mainBanner?.images) return [];

        // Sort images by order and map to display format
        return mainBanner.images
            .sort((a, b) => a.order - b.order)
            .map((img) => ({
                id: img.id,
                name: img.content || 'Banner Image',
                default: img.image.banner || img.image.full,
                original: img.image.full,
                preview: img.image.thumb,
                thumbnail: img.image.thumb,
                link: img.link,
                is_default: img.order === 0,
            }));
    }, [mainBanner]);

    const sideImages = useMemo(() => {
        if (!sideBanner?.images) return [];

        return sideBanner.images
            .sort((a, b) => a.order - b.order)
            .map((img) => ({
                id: img.id,
                name: img.content || 'Side Banner Image',
                default: img.image.banner || img.image.full,
                link: img.link,
            }));
    }, [sideBanner]);

    // Memoize slide navigation functions
    const nextSlide = useCallback(() => {
        if (mainImages.length === 0) return;
        setCurrentIndex((prevIndex) =>
            prevIndex === mainImages.length - 1 ? 0 : prevIndex + 1
        );
    }, [mainImages.length]);

    const prevSlide = useCallback(() => {
        if (mainImages.length === 0) return;
        setCurrentIndex((prevIndex) =>
            prevIndex === 0 ? mainImages.length - 1 : prevIndex - 1
        );
    }, [mainImages.length]);

    const goToSlide = useCallback((index: number) => {
        setCurrentIndex(index);
    }, []);


    // Handle keyboard navigation
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'ArrowLeft') prevSlide();
            if (e.key === 'ArrowRight') nextSlide();
            if (e.key === ' ') {
                e.preventDefault();
                setIsAutoPlaying(prev => !prev);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [nextSlide, prevSlide]);

    // Auto-play functionality
    useEffect(() => {
        if (!isAutoPlaying || mainImages.length === 0) return;

        const interval = setInterval(nextSlide, 5000);
        return () => clearInterval(interval);
    }, [isAutoPlaying, nextSlide, mainImages.length]);

    return (
        <div className="w-full bg-gradient-to-br from-gray-50 to-white overflow-hidden m-0 p-0 sm:px-4">
            {/* Main Banner Section */}
            <div className="flex flex-col lg:flex-row gap-0 sm:gap-6 mb-2 sm:mb-8">
                {/* Main Carousel - 50% width */}
                <div className="flex-1 lg:w-1/2">
                    <div
                        className="relative group"
                        onMouseEnter={() => setIsAutoPlaying(false)}
                        onMouseLeave={() => setIsAutoPlaying(true)}
                    >
                        {/* Image Container with Enhanced Styling */}
                        <div className="relative h-50 sm:h-80 md:h-100 lg:h-[28rem] rounded-none sm:rounded-2xl overflow-hidden">
                            <div
                                className="flex transition-transform duration-700 ease-out h-full"
                                style={{ transform: `translateX(-${currentIndex * 100}%)` }}
                                role="region"
                                aria-label="Image carousel"
                            >
                                {mainImages.map((image, index) => (
                                    <div
                                        key={`${image.name}-${index}`}
                                        className="w-full flex-shrink-0 relative"
                                        aria-hidden={currentIndex !== index}
                                    >
                                        <Image
                                            src={image.default}
                                            alt={image.name}
                                            fill
                                            className="w-full h-full object-fill transition-transform duration-700"
                                            onLoad={() => setImageLoading(false)}
                                            priority
                                        // quality={100}
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Dots Indicator */}
                        {/* <div className="flex justify-center space-x-2 py-2 sm:py-3 bg-gray-50" role="tablist">
                            {images.map((_, index) => (
                                <button
                                    key={index}
                                    onClick={() => goToSlide(index)}
                                    className={`w-2 h-2 rounded-full transition-all duration-200 ${index === currentIndex
                                        ? 'bg-blue-600 scale-125'
                                        : 'bg-gray-300 hover:bg-gray-400'
                                        }`}
                                    aria-label={`Go to slide ${index + 1}`}
                                    aria-selected={index === currentIndex}
                                    role="tab"
                                />
                            ))}
                        </div> */}
                    </div>
                </div>

                {/* Side Images Grid - 50% width, Hidden on Mobile */}
                {sideImages.length >= 3 && (
                    <div className="hidden lg:flex lg:w-1/2 lg:flex-col gap-4">
                        {/* Top image - Full width, 50% height */}
                        <div className="relative group cursor-pointer h-1/2">
                            <Link href={sideImages[0].link || '#'} className="relative block h-full rounded-xl overflow-hidden shadow-lg">
                                <Image
                                    src={sideImages[0]?.default || ''}
                                    alt={sideImages[0]?.name || 'Banner Image'}
                                    fill
                                    className="w-full h-full  object-fill transition-transform duration-500 group-hover:scale-105"
                                    priority
                                // quality={100}
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                <div className="absolute bottom-3 left-3 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                    <p className="text-sm font-medium drop-shadow-lg">{sideImages[0]?.name}</p>
                                </div>
                            </Link>
                        </div>

                        {/* Bottom two images - Each 50% width, remaining 50% height */}
                        <div className="flex gap-4 h-1/2">
                            <div className="relative group cursor-pointer w-1/2">
                                <Link href={sideImages[1].link || '#'} className="relative block h-full rounded-xl overflow-hidden shadow-lg">
                                    <Image
                                        src={sideImages[1]?.default || ''}
                                        alt={sideImages[1]?.name || 'Banner Image'}
                                        fill
                                        className="w-full h-full  object-fill transition-transform duration-500 group-hover:scale-105"
                                        priority
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                    <div className="absolute bottom-3 left-3 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                        <p className="text-sm font-medium drop-shadow-lg">{sideImages[1]?.name}</p>
                                    </div>
                                </Link>
                            </div>

                            <div className="relative group cursor-pointer w-1/2">
                                <Link href={sideImages[2].link || '#'} className="relative block h-full rounded-xl overflow-hidden shadow-lg">
                                    <Image
                                        src={sideImages[2]?.default || ''}
                                        alt={sideImages[2]?.name || 'Banner Image'}
                                        fill
                                        className="w-full h-full  object-fill transition-transform duration-500 group-hover:scale-105"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                    <div className="absolute bottom-3 left-3 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                        <p className="text-sm font-medium drop-shadow-lg">{sideImages[2]?.name}</p>
                                    </div>
                                </Link>
                            </div>
                        </div>
                    </div>
                )}

            </div>
        </div>


    );
};

export default Imgbanner;