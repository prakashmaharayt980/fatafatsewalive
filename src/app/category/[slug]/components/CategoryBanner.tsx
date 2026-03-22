import React from 'react';
import Image from 'next/image';
import { CategoryData } from '../types';
import { CategoryBannerProps } from './interfaces';



export default function CategoryBanner({ category, bannerData }: CategoryBannerProps) {
    const sorted = [...(bannerData?.images ?? [])].sort((a, b) => a.order - b.order);

    if (sorted.length === 0) {
        if (!category?.image) return null;
        return (
            <section className="w-full mb-6" aria-label={`${category.title} promotion`}>
                <div className="relative w-full rounded-xl overflow-hidden" style={{ aspectRatio: '4/1' }}>
                    <Image
                        src={category.image}
                        alt={`${category.title} main banner`}
                        fill
                        className="object-contain"
                        priority
                        sizes="100vw"
                    />
                </div>
            </section>
        );
    }

    const categoryLabel = category?.title || 'Category';
    const leftImg = sorted[0];
    const topImg = sorted.length > 2 ? sorted[2] : null;
    const botImg = sorted.length > 3 ? sorted[3] : null;
    const showRightHalf = !!topImg;

    return (
        <section className="w-full mb-6" aria-label={`${categoryLabel} banner promotions`}>
            <div className="flex flex-col lg:flex-row gap-2.5 w-full">
                <div className={`flex-[1] min-w-0 ${!showRightHalf ? 'w-full' : ''}`}>
                    <a
                        href={leftImg.link || '#'}
                        className="relative w-full rounded-xl overflow-hidden block"
                        style={{ aspectRatio: showRightHalf ? '1000 / 500' : '1000 / 250' }}
                        aria-label={`${categoryLabel} main promotion`}
                    >
                        <Image
                            src={leftImg.url || leftImg.image?.full || ''}
                            alt={`${categoryLabel} main banner`}
                            fill
                            className="object-contain"
                            priority
                            sizes={showRightHalf ? '(max-width: 1024px) 100vw, 50vw' : '100vw'}
                        />
                    </a>
                </div>

                {showRightHalf && (
                    <div className="hidden lg:flex flex-[1] min-w-0 flex-col gap-0.5">
                        <a
                            href={topImg.link || '#'}
                            className="relative w-full rounded-xl overflow-hidden block"
                            style={{ aspectRatio: '1000 / 250' }}
                            aria-label={`${categoryLabel} secondary promotion`}
                        >
                            <Image
                                src={topImg.url || topImg.image?.full || ''}
                                alt={`${categoryLabel} right top banner`}
                                fill
                                className="object-contain"
                                priority
                                sizes="(max-width: 1024px) 50vw, 25vw"
                            />
                        </a>

                        {botImg ? (
                            <a
                                href={botImg.link || '#'}
                                className="relative w-full rounded-xl overflow-hidden block"
                                style={{ aspectRatio: '1000 / 250' }}
                                aria-label={`${categoryLabel} third promotion`}
                            >
                                <Image
                                    src={botImg.url || botImg.image?.full || ''}
                                    alt={`${categoryLabel} right bottom banner`}
                                    fill
                                    className="object-contain"
                                    sizes="(max-width: 1024px) 50vw, 25vw"
                                />
                            </a>
                        ) : (
                            <div className="relative w-full rounded-xl bg-gray-50 flex-1 border border-dashed border-gray-200" />
                        )}
                    </div>
                )}
            </div>
        </section>
    );
}
