'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Article } from '../../types/Blogtypes';
import { formatDate } from '../../CommonVue/datetime';
import imglogo from '../../assets/logoimg.png';

type CardVariant = 'hero' | 'compact' | 'tall';

interface FeaturedArticleCardProps {
    article: Article;
    variant?: CardVariant;
    /** CSS grid-area name for positioned layouts */
    gridArea?: string;
    /** Category badge accent color */
    badgeColor?: string;
}

/**
 * Reusable featured article card for grid layouts.
 * Variants:
 * - `hero`    — Large card with author + date, used for the main hero slot
 * - `compact` — Smaller card with only category + title
 * - `tall`    — Tall side card with author + date
 */
export default function FeaturedArticleCard({
    article,
    variant = 'compact',
    gridArea,
    badgeColor = 'var(--colour-fsP2)',
}: FeaturedArticleCardProps) {
    const imgSrc = article.thumbnail_image?.full || imglogo.src;

    const isHero = variant === 'hero';
    const isTall = variant === 'tall';
    const showMeta = isHero || isTall;

    return (
        <Link
            href={`/blogs/${article.slug}`}
            className={`group relative rounded overflow-hidden border border-[var(--colour-border3)] hover:shadow-xs transition-all duration-300 ${isHero ? 'min-h-[220px]' : isTall ? '' : 'min-h-[160px]'
                }`}
            style={gridArea ? { gridArea } : undefined}
        >
            <Image
                src={imgSrc}
                alt={article.title}
                fill
                className="object-cover transition-transform duration-500"
                sizes={isHero ? '(max-width: 768px) 100vw, 50vw' : '25vw'}
            />

            {/* Dark gradient overlay */}
            <div className={`absolute inset-0 bg-gradient-to-t ${isHero
                    ? 'from-black/85 via-black/30 to-transparent'
                    : 'from-black/80 via-black/25 to-transparent'
                }`} />

            {/* Content */}
            <div className={`absolute bottom-0 left-0 right-0 ${isHero ? 'p-2 sm:p-3' : isTall ? 'p-3 sm:p-4' : 'p-3'
                }`}>
                {/* Category badge */}
                <span
                    className="inline-block text-white text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded mb-1"
                    style={{ backgroundColor: badgeColor }}
                >
                    {article.category?.title}
                </span>

                {/* Title */}
                {isHero ? (
                    <h3 className="text-base font-bold text-white leading-snug line-clamp-2 group-hover:text-[var(--colour-yellow1)] transition-colors">
                        {article.title}
                    </h3>
                ) : (
                    <h4 className={`font-bold text-white leading-snug group-hover:text-[var(--colour-fsP2)] transition-colors ${isTall ? 'text-sm line-clamp-3' : 'text-xs sm:text-sm line-clamp-2'
                        }`}>
                        {article.title}
                    </h4>
                )}

                {/* Author + Date (hero & tall only) */}
                {showMeta && (
                    <div className={`flex items-center gap-${isHero ? '2' : '1.5'} text-${isHero ? '[11px]' : '[10px]'} text-gray-300 ${isTall ? 'mt-1' : ''}`}>
                        <span className={isHero ? 'font-semibold text-white/90' : ''}>{article.author}</span>
                        <span className={`w-${isHero ? '1' : '0.5'} h-${isHero ? '1' : '0.5'} rounded-full bg-gray-400`} />
                        <span>{formatDate(article.publish_date)}</span>
                    </div>
                )}
            </div>
        </Link>
    );
}
