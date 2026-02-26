import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { BannerItem } from '../types/BannerTypes';

interface BannerProps {
    mainBanner?: BannerItem;
    sideBanner?: BannerItem;
}

const Imgbanner = ({ mainBanner, sideBanner }: BannerProps) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isAutoPlaying, setIsAutoPlaying] = useState(true);
    const [touchStart, setTouchStart] = useState<number | null>(null);
    const [touchEnd, setTouchEnd] = useState<number | null>(null);

    // Minimum swipe distance for mobile
    const minSwipeDistance = 50;

    // Filter banner data by slug and get images
    const mainImages = useMemo(() => {
        if (!mainBanner?.images) return [];

        return mainBanner.images
            .sort((a, b) => a.order - b.order)
            .map((img) => ({
                id: img.id,
                name: img.content || 'Banner Image',
                default: img.image.full,
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
                default: img.image.full,
                link: img.link,
            }));
    }, [sideBanner]);

    // Slide navigation functions
    const nextSlide = useCallback(() => {
        if (mainImages.length === 0) return;
        setCurrentIndex((prev) => (prev === mainImages.length - 1 ? 0 : prev + 1));
    }, [mainImages.length]);

    const prevSlide = useCallback(() => {
        if (mainImages.length === 0) return;
        setCurrentIndex((prev) => (prev === 0 ? mainImages.length - 1 : prev - 1));
    }, [mainImages.length]);

    const goToSlide = useCallback((index: number) => {
        setCurrentIndex(index);
    }, []);

    // Touch handlers for mobile swipe
    const onTouchStart = (e: React.TouchEvent) => {
        setTouchEnd(null);
        setTouchStart(e.targetTouches[0].clientX);
    };

    const onTouchMove = (e: React.TouchEvent) => {
        setTouchEnd(e.targetTouches[0].clientX);
    };

    const onTouchEnd = () => {
        if (!touchStart || !touchEnd) return;
        const distance = touchStart - touchEnd;
        const isLeftSwipe = distance > minSwipeDistance;
        const isRightSwipe = distance < -minSwipeDistance;

        if (isLeftSwipe) nextSlide();
        if (isRightSwipe) prevSlide();
    };

    // Keyboard navigation
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (
                e.target instanceof HTMLInputElement ||
                e.target instanceof HTMLTextAreaElement
            ) {
                return;
            }

            if (e.key === 'ArrowLeft') prevSlide();
            if (e.key === 'ArrowRight') nextSlide();
            if (e.key === ' ') {
                e.preventDefault();
                setIsAutoPlaying((prev) => !prev);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [nextSlide, prevSlide]);

    // Auto-play
    useEffect(() => {
        if (!isAutoPlaying || mainImages.length === 0) return;

        const interval = setInterval(nextSlide, 5000);
        return () => clearInterval(interval);
    }, [isAutoPlaying, nextSlide, mainImages.length]);

    // Check if side images should be shown
    const showSideImages = sideImages.length >= 2;

    return (
        <section className="w-full px-3 py-4 sm:px-4 sm:py-4">
            <div className=" mx-auto">
                {/* Main Container - Responsive Flex Layout */}
                <div className="flex flex-col lg:flex-row gap-1 sm:gap-2">

                    {/* Main Carousel */}
                    <div className={`w-full ${showSideImages ? 'lg:w-[58%]' : 'lg:w-full'}`}>
                        <div
                            className="relative group overflow-hidden rounded sm:rounded md:rounded bg-gray-100"
                            onMouseEnter={() => setIsAutoPlaying(false)}
                            onMouseLeave={() => setIsAutoPlaying(true)}
                            onTouchStart={onTouchStart}
                            onTouchMove={onTouchMove}
                            onTouchEnd={onTouchEnd}
                        >
                            {/* Aspect Ratio Container - Responsive heights */}
                            <div className="relative w-full  aspect-[1920/700]   ">
                                {/* Slides Container */}
                                <div
                                    className="absolute inset-0 flex transition-transform duration-500 ease-out"
                                    style={{ transform: `translateX(-${currentIndex * 100}%)` }}
                                >
                                    {mainImages.map((image, index) => (
                                        <div key={image.id} className="relative w-full h-full flex-shrink-0">
                                            <Link
                                                href={image.link || '#'}
                                                className="block w-full h-full"
                                                data-track={`banner-main-${index}`}
                                            >
                                                <Image
                                                    src={image.default}
                                                    alt={image.name}
                                                    fill
                                                    priority={index === 0}
                                                    // sizes tells the browser exactly how much space it takes
                                                    sizes="(max-width: 768px) 100vw, (max-width: 1024px) 70vw, 60vw"
                                                    className="object-contain mx-auto" // Ensures no stretching
                                                />
                                            </Link>
                                        </div>
                                    ))}
                                </div>

                                {/* Navigation Arrows - Hidden on mobile, visible on hover for tablet/desktop */}
                                {mainImages.length > 1 && (
                                    <>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                prevSlide();
                                            }}
                                            className="hidden sm:flex absolute left-2 md:left-4 top-1/2 -translate-y-1/2 w-8 h-8 md:w-10 md:h-10 items-center justify-center rounded-full bg-black/30 hover:bg-black/50 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                                            aria-label="Previous slide"
                                        >
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                fill="none"
                                                viewBox="0 0 24 24"
                                                strokeWidth={2}
                                                stroke="currentColor"
                                                className="w-4 h-4 md:w-5 md:h-5"
                                            >
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                                            </svg>
                                        </button>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                nextSlide();
                                            }}
                                            className="hidden sm:flex absolute right-2 md:right-4 top-1/2 -translate-y-1/2 w-8 h-8 md:w-10 md:h-10 items-center justify-center rounded-full bg-black/30 hover:bg-black/50 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                                            aria-label="Next slide"
                                        >
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                fill="none"
                                                viewBox="0 0 24 24"
                                                strokeWidth={2}
                                                stroke="currentColor"
                                                className="w-4 h-4 md:w-5 md:h-5"
                                            >
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                                            </svg>
                                        </button>
                                    </>
                                )}


                            </div>
                        </div>
                    </div>

                    {showSideImages && (
                        <div className="w-full lg:w-[42%]">
                            {/* Desktop: Grid Layout */}
                            <div className="hidden lg:flex flex-col gap-1 h-full">
                                <Link
                                    href={sideImages[0].link || '#'}
                                    className="relative flex-1 w-full rounded overflow-hidden group"
                                    data-track="banner-side-0"
                                >
                                    <Image
                                        src={sideImages[0].default}
                                        alt={sideImages[0].name}
                                        fill
                                        sizes="(max-width: 1024px) 0vw, 42vw"
                                        priority
                                        className="object-contain aspect-4/1  rounded  transition-transform duration-500"
                                    />
                                    <div className="absolute inset-0  opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                </Link>

                                <div className="flex gap-1 flex-1 ">
                                    {
                                        sideImages.slice(1, 3).map((image, index) => (
                                            <Link
                                                key={`side-bottom-${image.id}-${index}`}
                                                href={image.link || '#'}
                                                className="relative flex-1 p-0 m-0 rounded overflow-hidden group"
                                                data-track={`banner-side-${index + 1}`}
                                            >
                                                <Image
                                                    src={image.default}
                                                    alt={image.name}
                                                    fill
                                                    className="object-contain w-full aspect-2/1 transition-transform duration-500"
                                                    sizes="(max-width: 1024px) 0vw, 21vw"
                                                    unoptimized={true}
                                                />
                                                <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                            </Link>
                                        ))
                                    }

                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Custom Scrollbar Hide Styles */}
            <style jsx global>{`
                .scrollbar-hide {
                    -ms-overflow-style: none;
                    scrollbar-width: none;
                }
                .scrollbar-hide::-webkit-scrollbar {
                    display: none;
                }
            `}</style>
        </section>
    );
};

export default Imgbanner;