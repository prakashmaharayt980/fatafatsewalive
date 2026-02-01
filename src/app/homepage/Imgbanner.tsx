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
    const showSideImages = sideImages.length >= 3;

    return (
        <section className="w-full px-3 py-4 sm:px-4 sm:py-5 md:px-6 md:py-6 lg:px-8">
            <div className=" mx-auto">
                {/* Main Container - Responsive Flex Layout */}
                <div className="flex flex-col lg:flex-row gap-3 sm:gap-4">

                    {/* Main Carousel */}
                    <div className={`w-full ${showSideImages ? 'lg:w-[60%]' : 'lg:w-full'}`}>
                        <div
                            className="relative group overflow-hidden rounded-lg sm:rounded-xl md:rounded-2xl bg-gray-100"
                            onMouseEnter={() => setIsAutoPlaying(false)}
                            onMouseLeave={() => setIsAutoPlaying(true)}
                            onTouchStart={onTouchStart}
                            onTouchMove={onTouchMove}
                            onTouchEnd={onTouchEnd}
                        >
                            {/* Aspect Ratio Container - Responsive heights */}
                            <div className="relative w-full aspect-[16/9] sm:aspect-[16/8] md:aspect-[16/7] lg:aspect-[16/9]">
                                {/* Slides Container */}
                                <div
                                    className="absolute inset-0 flex transition-transform duration-500 ease-out"
                                    style={{ transform: `translateX(-${currentIndex * 100}%)` }}
                                >
                                    {mainImages.map((image, index) => (
                                        <div
                                            key={`main-${image.id}-${index}`}
                                            className="relative w-full h-full flex-shrink-0"
                                        >
                                            <Link
                                                href={image.link || '#'}
                                                className="block w-full h-full"
                                                aria-label={image.name}
                                            >
                                                <Image
                                                    src={image.default}
                                                    alt={image.name}
                                                    fill
                                                    className="object-fill"
                                                    priority={index === 0}
                                                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 100vw, 60vw"
                                                    quality={100}
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

                                {/* Dots Indicator */}
                                {mainImages.length > 1 && (
                                    <div className="absolute bottom-2  left-1/2 -translate-x-1/2 flex gap-1.5 sm:gap-2 p-1.5 sm:p-2 rounded-full bg-black/20 backdrop-blur-sm">
                                        {mainImages.map((_, index) => (
                                            <button
                                                key={`dot-${index}`}
                                                onClick={() => goToSlide(index)}
                                                className={`rounded-full transition-all duration-300 ${index === currentIndex
                                                    ? 'bg-white w-4 sm:w-5 md:w-6 h-1.5 sm:h-2'
                                                    : 'bg-white/50 hover:bg-white/70 w-1.5 sm:w-2 h-1.5 sm:h-2'
                                                    }`}
                                                aria-label={`Go to slide ${index + 1}`}
                                                aria-current={index === currentIndex ? 'true' : 'false'}
                                            />
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Side Images Grid */}
                    {showSideImages && (
                        <div className="w-full lg:w-[40%]">
                            {/* Mobile/Tablet: Horizontal scroll */}
                            <div className="flex lg:hidden gap-2 sm:gap-3 overflow-x-auto pb-2 scrollbar-hide snap-x snap-mandatory">
                                {sideImages.slice(0, 3).map((image, index) => (
                                    <Link
                                        key={`side-mobile-${image.id}-${index}`}
                                        href={image.link || '#'}
                                        className="relative flex-shrink-0 w-[45%] sm:w-[32%] aspect-[4/3] snap-start rounded-lg sm:rounded-xl overflow-hidden"
                                    >
                                        <Image
                                            src={image.default}
                                            alt={image.name}
                                            fill
                                            className="object-fill transition-transform duration-300 hover:scale-105"
                                            sizes="(max-width: 640px) 45vw, 32vw"
                                            quality={100}
                                        />
                                    </Link>
                                ))}
                            </div>

                            {/* Desktop: Grid Layout */}
                            <div className="hidden lg:flex flex-col gap-3 h-full">
                                {/* Top Banner - Takes more space */}
                                <Link
                                    href={sideImages[0].link || '#'}
                                    className="relative flex-[1.2] rounded-xl overflow-hidden group"
                                >
                                    <Image
                                        src={sideImages[0].default}
                                        alt={sideImages[0].name}
                                        fill
                                        className="object-fill transition-transform duration-500 group-hover:scale-105"
                                        sizes="(max-width: 1024px) 0vw, 40vw"
                                        quality={80}
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                </Link>

                                {/* Bottom Two Banners */}
                                <div className="flex gap-3 flex-1">
                                    <Link
                                        href={sideImages[1].link || '#'}
                                        className="relative flex-1 rounded-xl overflow-hidden group"
                                    >
                                        <Image
                                            src={sideImages[1].default}
                                            alt={sideImages[1].name}
                                            fill
                                            className="object-fill transition-transform duration-500 group-hover:scale-105"
                                            sizes="(max-width: 1024px) 0vw, 20vw"
                                            quality={80}
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                    </Link>
                                    <Link
                                        href={sideImages[2].link || '#'}
                                        className="relative flex-1 rounded-xl overflow-hidden group"
                                    >
                                        <Image
                                            src={sideImages[2].default}
                                            alt={sideImages[2].name}
                                            fill
                                            className="object-fill transition-transform duration-500 group-hover:scale-105"
                                            sizes="(max-width: 1024px) 0vw, 20vw"
                                            quality={80}
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                    </Link>
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