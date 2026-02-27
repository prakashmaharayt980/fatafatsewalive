'use client';

import React, { useMemo } from 'react';
import Image from 'next/image';
import { CategoryData } from '../types';

interface BannerImage {
    id: string;
    image: { full: string };
    link?: string;
    order: number;
}

interface CategoryBannerProps {
    category: CategoryData | null;
    bannerData?: {
        images: BannerImage[];
    };
}

export default function CategoryBanner({ category, bannerData }: CategoryBannerProps) {
    // Sort all images by order
    const sorted = useMemo(() => {
        const imgs = bannerData?.images ?? [];
        return [...imgs].sort((a, b) => a.order - b.order);
    }, [bannerData]);

    // Fallback if no dynamic images exist
    if (sorted.length === 0) {
        if (!category?.image) return null;
        return (
            <section className="w-full mb-6 aria-label={`${category.title} promotion`}">
                <div className="relative w-full rounded-xl overflow-hidden" style={{ aspectRatio: '4/1' }}>
                    <Image
                        src={category.image}
                        alt={`${category.title} main banner`}
                        fill
                        className="object-contain "
                        priority
                        sizes="100vw"

                    />
                </div>
            </section>
        );
    }

    const categoryLabel = category?.title || 'Category';

    // We only take the first 3 images.
    // Left: image 0
    // Right Top: image 1
    // Right Bottom: image 2
    const leftImg = sorted[0];
    const topImg = sorted.length > 2 ? sorted[2] : null;
    const botImg = sorted.length > 3 ? sorted[3] : null;

    // Show right half if there's at least a second image
    const showRightHalf = !!topImg;

    return (
        <section
            className="w-full mb-6"
            aria-label={`${categoryLabel} banner promotions`}
        >
            {/* ═══ Row: 50/50 ═══ */}
            <div className="flex flex-col lg:flex-row gap-2.5 w-full">

                {/* ── LEFT: 50% width -> 1000×500 ── */}
                <div className={`flex-[1] min-w-0 ${!showRightHalf ? 'w-full' : ''}`}>
                    <a
                        href={leftImg.link || '#'}
                        className="relative w-full rounded-xl overflow-hidden block"
                        style={{ aspectRatio: showRightHalf ? '1000 / 500' : '1000 / 250' }} // If it's the only image, make it a wide banner
                        aria-label={`${categoryLabel} main promotion`}
                    >
                        <Image
                            src={leftImg.image.full}
                            alt={`${categoryLabel} main banner`}
                            fill
                            className="object-contain "
                            priority
                            sizes={showRightHalf ? "(max-width: 1024px) 100vw, 50vw" : "100vw"}

                        />
                    </a>
                </div>

                {/* ── RIGHT: 50% width -> two rows (top/bottom) ── */}
                {showRightHalf && (
                    <div className="hidden lg:flex flex-[1] min-w-0 flex-col  gap-0.5">

                        {/* TOP div: 1000×250 */}
                        <a
                            href={topImg.link || '#'}
                            className="relative w-full rounded-xl overflow-hidden block"
                            style={{ aspectRatio: '1000 / 250' }}
                            aria-label={`${categoryLabel} secondary promotion`}
                        >
                            <Image
                                src={topImg.image.full}
                                alt={`${categoryLabel} right top banner`}
                                fill
                                className="object-contain"
                                priority
                                sizes="(max-width: 1024px) 50vw, 25vw"

                            />
                        </a>

                        {/* BOTTOM div (if exists): 1000×250 */}
                        {botImg ? (
                            <a
                                href={botImg.link || '#'}
                                className="relative w-full rounded-xl overflow-hidden block"
                                style={{ aspectRatio: '1000 / 250' }}
                                aria-label={`${categoryLabel} third promotion`}
                            >
                                <Image
                                    src={botImg.image.full}
                                    alt={`${categoryLabel} right bottom banner`}
                                    fill
                                    className="object-contain"
                                    sizes="(max-width: 1024px) 50vw, 25vw"

                                />
                            </a>
                        ) : (
                            // Placeholder if only 2 images exist
                            <div className="relative w-full rounded-xl bg-gray-50 flex-1 border border-dashed border-gray-200" />
                        )}
                    </div>
                )}

            </div>
        </section>
    );
}
