'use client';

import React, { useMemo, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Article } from '../../types/Blogtypes';
import { formatDate } from '../../CommonVue/datetime';
import imglogo from '../../assets/logoimg.png';

import LazyLoadSection from '@/components/LazyLoadSection';
import { BannerItem } from '../../types/BannerTypes';
import HeroBanner from './HeroBanner';

import BlogCard from './BlogCard';
import ProductDeals from './ProductDeals';

import BlogProductBasket from './BlogProductBasket';
import { ProductDetails } from '../../types/ProductDetailsTypes';
import StoryViewer from './StoryViewer';
import BlogFastSaleProductCards from '@/app/products/ProductCards/BlogFastSaleProductCards';
import { Star } from 'lucide-react';
import YouTubeVideoCard from './YouTubeVideoCard';
import BlogCompareProducts from './BlogCompareProducts';


interface BlogListingClientProps {
    articles: Article[];
    bannerData?: BannerItem;
    brandArticles: Article[];
    categories: any[];
    dealProducts?: ProductDetails[];
    trendingProducts?: any[];
    SectionOne?: React.ReactNode;
}

export default function BlogListingClient({
    articles,
    bannerData,
    brandArticles,
    categories,
    dealProducts,
    trendingProducts,
    SectionOne,
}: BlogListingClientProps) {

    const [storyViewerOpen, setStoryViewerOpen] = useState(false);
    const [storyStartIndex, setStoryStartIndex] = useState(0);
    const webStories = articles?.slice(0, 10) || [];

    const openStory = (idx: number) => {
        setStoryStartIndex(idx);
        setStoryViewerOpen(true);
    };

    return (
        <>
            {/* Story Viewer Dialog */}
            {storyViewerOpen && webStories.length > 0 && (
                <StoryViewer
                    stories={webStories}
                    initialIndex={storyStartIndex}
                    onClose={() => setStoryViewerOpen(false)}
                />
            )}
            <div className="min-h-screen max-w-8xl mx-auto bg-[var(--colour-bg4)] w-full">
                <div className="w-full px-3 sm:px-5 lg:px-6 pt-4 pb-16">

                    {/* ─── Hero Banner ─── */}
                    <HeroBanner data={bannerData} />


                    {/* ─── Main Content ─── */}
                    <div className="space-y-4 mt-4">

                        {/* ═══ 1. Blog Grid + ProductDeals Sidebar ═══ */}
                        <section id="blog-articles">
                            <div className="flex flex-col lg:flex-row gap-5">
                                <div className="w-full lg:w-3/4">
                                    {/* Section Header */}
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="flex items-center gap-2.5">
                                            <div className="w-1 h-6 bg-[var(--colour-fsP1)] rounded-full" />
                                            <h2 className="text-base sm:text-lg font-bold text-[var(--colour-text2)]">
                                                Latest Articles
                                            </h2>
                                        </div>
                                        <span className="text-[11px] font-semibold text-[var(--colour-text3)] bg-[var(--colour-bg4)] px-3 py-1 rounded-full border border-[var(--colour-border3)]">
                                            {articles?.length} {articles?.length === 1 ? 'Article' : 'Articles'}
                                        </span>
                                    </div>
                                    {/* Blog Cards Grid */}
                                    <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
                                        {articles?.length > 0 && articles.slice(0, 12).map((post) => (
                                            <BlogCard key={post.id} post={post} />
                                        ))}
                                    </div>
                                </div>
                                <div className="hidden lg:block w-full lg:w-1/4">
                                    <ProductDeals products={dealProducts} limit={8} title="Latest Deals" />
                                </div>
                            </div>
                        </section>

                        {/* ═══ 2. Banner Section ═══ */}
                        <section id="blog-banner" className="relative">
                            {SectionOne}
                        </section>
                        {/* ═══ 5. Web Stories ═══ */}
                        <section id="web-stories">
                            {/* Header with Category Tabs */}
                            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
                                <div className="flex items-center gap-2.5">
                                    <div className="w-1 h-6 bg-[var(--colour-fsP2)] rounded-full" />
                                    <h2 className="text-base sm:text-lg font-bold text-[var(--colour-text2)]">Web Stories</h2>
                                </div>

                            </div>

                            {/* Stories Grid — 5 cols, 2 rows */}
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2.5">
                                {webStories.map((post, idx) => (
                                    <div
                                        key={post.id}
                                        onClick={() => openStory(idx)}
                                        className="group relative rounded overflow-hidden aspect-[9/16] border border-[var(--colour-border3)] hover:shadow-lg transition-all duration-300 cursor-pointer"
                                    >
                                        <Image
                                            src={post.thumbnail_image?.full}
                                            alt={post.title}
                                            fill
                                            className="object-contain transition-transform duration-500 group-hover:scale-[1.03]"
                                            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
                                            quality={75}
                                        />
                                        {/* Dark gradient overlay */}
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/10" />

                                        {/* Content */}
                                        <div className="absolute bottom-0 left-0 right-0 p-3 flex flex-col items-center text-center gap-1.5">
                                            <h4 className="text-[13px] font-bold text-white leading-snug line-clamp-2 group-hover:text-[var(--colour-yellow1)] transition-colors">
                                                {post.title}
                                            </h4>
                                            {/* Story Count Badge */}
                                            <span className="inline-flex items-center gap-1 bg-[var(--colour-fsP2)] text-white text-[9px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full">
                                                <svg className="w-2.5 h-2.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                                    <rect x="2" y="2" width="20" height="20" rx="2" />
                                                    <path d="M7 2v20M17 2v20" />
                                                </svg>
                                                {Math.floor(5 + Math.random() * 15)} Stories
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>

                        {/* ═══ 3. Featured Stories — 5-Item Grid ═══ */}
                        <section id="blogs-laptops">
                            {/* Section Header */}
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-2.5">
                                    <div className="w-1 h-6 bg-[var(--colour-yellow1)] rounded-full" />
                                    <h2 className="text-base sm:text-lg font-bold text-[var(--colour-text2)]">Mobile Phones </h2>
                                </div>
                                <Link href="/blogs" className="text-xs font-semibold text-[var(--colour-fsP2)] hover:text-[var(--colour-fsP1)] transition-colors flex items-center gap-1">
                                    More Stories <span className="text-sm">→</span>
                                </Link>
                            </div>

                            <div className="w-full ">
                                <BlogProductBasket
                                    title="More from "
                                    slug="related-category"
                                    id="1"
                                />
                            </div>
                        </section>

                        {/* ═══ 4. Products + Widget ═══ */}
                        <div className="flex flex-col  gap-4">


                            {/* 5-Item CSS Grid */}
                            <div
                                className="grid gap-1"
                                style={{
                                    gridTemplateColumns: 'repeat(5, 1fr)',
                                    gridTemplateRows: 'auto auto',
                                    gridTemplateAreas: `
                                    "hero hero side1 side2 side3"
                                    "bot1 bot2 side1 side2 side3"
                                `,
                                }}
                            >
                                {/* Item 1 — Hero (spans 2 cols, row 1) */}
                                {articles?.[0] && (
                                    <Link
                                        href={`/blogs/${articles[0].slug}`}
                                        className="group relative rounded overflow-hidden border border-[var(--colour-border3)] hover:shadow-xs transition-all duration-300 min-h-[220px]"
                                        style={{ gridArea: 'hero' }}
                                    >
                                        <Image
                                            src={articles[0].thumbnail_image?.full}
                                            alt={articles[0].title}
                                            fill
                                            className="object-cover transition-transform duration-500"
                                            sizes="(max-width: 768px) 100vw, 50vw"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />
                                        <div className="absolute bottom-0 left-0 right-0 p-2 sm:p-3s">
                                            <span className="inline-block bg-[var(--colour-fsP2)] text-white text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded mb-1">
                                                {articles[0].category?.title}
                                            </span>
                                            <h3 className="text-base  font-bold text-white leading-snug line-clamp-2  group-hover:text-[var(--colour-yellow1)] transition-colors">
                                                {articles[0].title}
                                            </h3>
                                            <div className="flex items-center gap-2 text-[11px] text-gray-300">
                                                <span className="font-semibold text-white/90">{articles[0].author}</span>
                                                <span className="w-1 h-1 rounded-full bg-gray-400" />
                                                <span>{formatDate(articles[0].publish_date)}</span>
                                            </div>
                                        </div>
                                    </Link>
                                )}

                                {/* Item 2 — Bottom Left */}
                                {articles?.[1] && (
                                    <Link
                                        href={`/blogs/${articles[1].slug}`}
                                        className="group relative rounded-lg overflow-hidden border border-[var(--colour-border3)] hover:shadow-md transition-all duration-300 min-h-[160px]"
                                        style={{ gridArea: 'bot1' }}
                                    >
                                        <Image
                                            src={articles[1].thumbnail_image?.full || imglogo.src}
                                            alt={articles[1].title}
                                            fill
                                            className="object-cover transition-transform duration-500 "
                                            sizes="25vw"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent" />
                                        <div className="absolute bottom-0 left-0 right-0 p-3">
                                            <span className="inline-block bg-[var(--colour-fsP2)] text-white text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded mb-1">
                                                {articles[1].category?.title}
                                            </span>
                                            <h4 className="text-xs sm:text-sm font-bold text-white leading-snug line-clamp-2 group-hover:text-[var(--colour-fsP2)] transition-colors">
                                                {articles[1].title}
                                            </h4>
                                        </div>
                                    </Link>
                                )}

                                {/* Item 3 — Bottom Right */}
                                {articles?.[2] && (
                                    <Link
                                        href={`/blogs/${articles[2].slug}`}
                                        className="group relative rounded overflow-hidden border border-[var(--colour-border3)] hover:shadow-xs transition-all duration-300 min-h-[160px]"
                                        style={{ gridArea: 'bot2' }}
                                    >
                                        <Image
                                            src={articles[2].thumbnail_image?.full || imglogo.src}
                                            alt={articles[2].title}
                                            fill
                                            className="object-cover transition-transform duration-500 "
                                            sizes="25vw"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent" />
                                        <div className="absolute bottom-0 left-0 right-0 p-3">
                                            <span className="inline-block bg-[var(--colour-fsP2)] text-white text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded mb-1">
                                                {articles[2].category?.title}
                                            </span>
                                            <h4 className="text-xs sm:text-sm font-bold text-white leading-snug line-clamp-2 group-hover:text-[var(--colour-fsP2)] transition-colors">
                                                {articles[2].title}
                                            </h4>
                                        </div>
                                    </Link>
                                )}

                                {/* Item 4 — Tall Right Side 1 (spans 2 rows) */}
                                {articles?.[3] && (
                                    <Link
                                        href={`/blogs/${articles[3].slug}`}
                                        className="group relative rounded overflow-hidden border border-[var(--colour-border3)] hover:shadow-xs transition-all duration-300"
                                        style={{ gridArea: 'side1' }}
                                    >
                                        <Image
                                            src={articles[3].thumbnail_image?.full || imglogo.src}
                                            alt={articles[3].title}
                                            fill
                                            className="object-cover transition-transform duration-500 "
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-transparent" />
                                        <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-4">
                                            <span className="inline-block bg-[var(--colour-fsP2)] text-white text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded mb-1.5">
                                                {articles[3].category?.title}
                                            </span>
                                            <h4 className="text-sm font-bold text-white leading-snug line-clamp-3 group-hover:text-[var(--colour-fsP2)] transition-colors">
                                                {articles[3].title}
                                            </h4>
                                            <div className="flex items-center gap-1.5 text-[10px] text-gray-300 mt-1">
                                                <span>{articles[3].author}</span>
                                                <span className="w-0.5 h-0.5 rounded-full bg-gray-400" />
                                                <span>{formatDate(articles[3].publish_date)}</span>
                                            </div>
                                        </div>
                                    </Link>
                                )}

                                {/* Item 5 — Tall Right Side 2 (spans 2 rows) */}
                                {articles?.[5] && (
                                    <Link
                                        href={`/blogs/${articles[5].slug}`}
                                        className="group relative rounded overflow-hidden border border-[var(--colour-border3)] hover:shadow-xs transition-all duration-300"
                                        style={{ gridArea: 'side2' }}
                                    >
                                        <Image
                                            src={articles[5].thumbnail_image?.full || imglogo.src}
                                            alt={articles[5].title}
                                            fill
                                            className="object-cover transition-transform duration-500 "

                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-transparent" />
                                        <div className="absolute bottom-0 left-0 right-0 p-3 ">
                                            <span className="inline-block bg-[var(--colour-fsP1)] text-white text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded mb-1.5">
                                                {articles[5].category?.title}
                                            </span>
                                            <h4 className="text-sm font-bold text-white leading-snug line-clamp-3 group-hover:text-[var(--colour-fsP2)]/80 transition-colors">
                                                {articles[5].title}
                                            </h4>
                                            <div className="flex items-center gap-1.5 text-[10px] text-gray-300 mt-1">
                                                <span>{articles[5].author}</span>
                                                <span className="w-0.5 h-0.5 rounded-full bg-gray-400" />
                                                <span>{formatDate(articles[5].publish_date)}</span>
                                            </div>
                                        </div>
                                    </Link>
                                )}

                                {/* Item 5 — Tall Right Side 2 (spans 2 rows) */}
                                {articles?.[6] && (
                                    <Link
                                        href={`/blogs/${articles[6].slug}`}
                                        className="group relative rounded overflow-hidden border border-[var(--colour-border3)] hover:shadow-xs transition-all duration-300"
                                        style={{ gridArea: 'side3' }}
                                    >
                                        <Image
                                            src={articles[6].thumbnail_image?.full || imglogo.src}
                                            alt={articles[6].title}
                                            fill
                                            className="object-cover transition-transform duration-500 "

                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-transparent" />
                                        <div className="absolute bottom-0 left-0 right-0 p-3 ">
                                            <span className="inline-block bg-[var(--colour-fsP1)] text-white text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded mb-1.5">
                                                {articles[6].category?.title}
                                            </span>
                                            <h4 className="text-sm font-bold text-white leading-snug line-clamp-3 group-hover:text-[var(--colour-fsP2)]/80 transition-colors">
                                                {articles[6].title}
                                            </h4>
                                            <div className="flex items-center gap-1.5 text-[10px] text-gray-300 mt-1">
                                                <span>{articles[6].author}</span>
                                                <span className="w-0.5 h-0.5 rounded-full bg-gray-400" />
                                                <span>{formatDate(articles[6].publish_date)}</span>
                                            </div>
                                        </div>
                                    </Link>
                                )}
                            </div>


                            {SectionOne}
                        </div>

                        <section id="reviews-section">
                            {/* Section Header */}
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-2.5">
                                    <div className="w-1 h-6 bg-[var(--colour-fsP2)] rounded-full" />
                                    <h2 className="text-base sm:text-lg font-bold text-[var(--colour-text2)]">Reviews</h2>
                                </div>
                                <Link href="/blogs?category=reviews" className="text-xs font-semibold text-[var(--colour-fsP2)] hover:text-[var(--colour-fsP1)] transition-colors flex items-center gap-1">
                                    View All <span className="text-sm">→</span>
                                </Link>
                            </div>

                            {/* 3-Column Layout */}
                            <div className="grid grid-cols-1 lg:grid-cols-[3fr_2fr_2fr] gap-3">

                                {/* ─── Left: 3×3 Review Grid ─── */}
                                <div className="grid grid-cols-3 gap-2">
                                    {articles?.slice(0, 6).map((post) => (
                                        <BlogCard key={post.id} post={post} />
                                    ))}
                                </div>

                                {/* ─── Center: Top Picks (2 Product Cards) ─── */}
                                <div className="flex flex-col gap-2.5 my-auto">

                                    {dealProducts?.slice(0, 2).map((product, idx) => (
                                        <BlogFastSaleProductCards key={product.id || idx} product={product} index={idx} />
                                    ))}
                                </div>

                                {/* ─── Right: Vertical Stack with Stars ─── */}
                                <div className="flex flex-col gap-1 ">
                                    {articles?.slice(0, 6).map((post, idx) => {
                                        const mockRating = (4.0 + (idx * 0.2)).toFixed(1);
                                        const stars = Math.floor(parseFloat(mockRating));
                                        return (
                                            <Link
                                                key={post.id}
                                                href={`/blogs/${post.slug}`}
                                                className="group flex gap-2.5 p-2 rounded-sm border border-[var(--colour-border3)] bg-white hover:shadow-sm hover:border-[var(--colour-fsP2)]/30 transition-all duration-300"
                                            >
                                                {/* Thumbnail */}
                                                <div className="relative w-16 h-16 sm:w-20 sm:h-20 flex-shrink-0 rounded-sm overflow-hidden bg-[var(--colour-bg4)]">
                                                    <Image
                                                        src={post.thumbnail_image?.full || imglogo.src}
                                                        alt={post.title}
                                                        fill
                                                        className="object-cover transition-transform duration-500 "
                                                        sizes="80px"

                                                    />
                                                </div>
                                                {/* Info */}
                                                <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
                                                    <h4 className="text-[11px] sm:text-[12px] font-semibold text-[var(--colour-text2)] leading-snug line-clamp-2 group-hover:text-[var(--colour-fsP2)] transition-colors">
                                                        {post.title}
                                                    </h4>


                                                    {/* Stars + Date */}
                                                    <div className="flex items-center justify-between ">
                                                        <div className="flex items-center gap-0.5">
                                                            {[...Array(5)].map((_, i) => (
                                                                <Star
                                                                    key={i}
                                                                    className={`w-2.5 h-2.5 ${i < stars
                                                                        ? 'text-amber-400 fill-amber-400'
                                                                        : 'text-gray-200 fill-gray-200'
                                                                        }`}
                                                                />
                                                            ))}
                                                            <span className="text-[9px] text-[var(--colour-text3)] ml-1 font-semibold">
                                                                {mockRating}
                                                            </span>
                                                        </div>
                                                        <div className="flex flex-col items-end gap-0.5">
                                                            <span className="text-[9px]  font-semibold text-[var(--colour-text2)] leading-snug line-clamp-2 group-hover:text-[var(--colour-fsP2)] transition-colors">
                                                                {post.author}
                                                            </span>
                                                            <span className="text-[9px] text-[var(--colour-text3)]">

                                                                {formatDate(post.publish_date)}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </Link>
                                        );
                                    })}
                                </div>
                            </div>

                        </section>


                        {/* ═══ YouTube Content Section ═══ */}
                        <LazyLoadSection
                            fallback={<div className="h-[400px] bg-[var(--colour-bg4)] rounded-lg animate-pulse" />}
                        >
                            <section id="youtube-content">
                                {/* 80/20 Layout */}
                                <div className="flex flex-col-reverse lg:flex-row-reverse gap-3 border-t-2 pt-3 mt-1 border-[var(--colour-border3)]">

                                    {/* ─── Left: 4-col YouTube Grid (80%) ─── */}
                                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5 w-3/4">
                                        {[
                                            { id: 'dQw4w9WgXcQ', title: 'Samsung Galaxy S25 Ultra Review: The Best Phone of 2026?', channel: 'Fatafat Sewa', views: '45K', date: '2 days ago', category: 'Smartphone' },
                                            { id: 'ScMzIvxBSi4', title: 'iPhone 17 Pro Max vs Galaxy S25 Ultra Camera Test', channel: 'Fatafat Sewa', views: '32K', date: '5 days ago', category: 'Comparison' },
                                            { id: '2Vv-BfVoq4g', title: 'Top 5 Budget Laptops Under Rs. 80,000 in Nepal', channel: 'Fatafat Sewa', views: '28K', date: '1 week ago', category: 'Laptops' },
                                            { id: 'jNQXAC9IVRw', title: 'Best TWS Earbuds Under Rs. 5000 — Ranked!', channel: 'Fatafat Sewa', views: '19K', date: '3 days ago', category: 'Audio' },
                                            { id: 'M7lc1UVf-VE', title: 'OnePlus 13 Complete Review After 30 Days of Use', channel: 'Fatafat Sewa', views: '61K', date: '4 days ago', category: 'Smartphone' },
                                            { id: 'L_jWHffIx5E', title: 'Smartwatch Showdown: Galaxy Watch 7 vs Apple Watch', channel: 'Fatafat Sewa', views: '14K', date: '6 days ago', category: 'Wearables' },
                                            { id: 'YE7VzlLtp-4', title: 'Gaming Laptop Guide 2026: What to Buy & Avoid', channel: 'Fatafat Sewa', views: '22K', date: '1 week ago', category: 'Gaming' },
                                            { id: 'dQw4w9WgXcQ', title: 'Xiaomi 15 Ultra Camera vs iPhone 17 Pro Blind Test', channel: 'Fatafat Sewa', views: '38K', date: '2 days ago', category: 'Camera' },
                                            { id: 'M7lc1UVf-VE', title: 'OnePlus 13 Complete Review After 30 Days of Use', channel: 'Fatafat Sewa', views: '61K', date: '4 days ago', category: 'Smartphone' },
                                            { id: 'L_jWHffIx5E', title: 'Smartwatch Showdown: Galaxy Watch 7 vs Apple Watch', channel: 'Fatafat Sewa', views: '14K', date: '6 days ago', category: 'Wearables' },
                                            { id: 'YE7VzlLtp-4', title: 'Gaming Laptop Guide 2026: What to Buy & Avoid', channel: 'Fatafat Sewa', views: '22K', date: '1 week ago', category: 'Gaming' },
                                            { id: 'dQw4w9WgXcQ', title: 'Xiaomi 15 Ultra Camera vs iPhone 17 Pro Blind Test', channel: 'Fatafat Sewa', views: '38K', date: '2 days ago', category: 'Camera' },
                                        ].map((video, idx) => (
                                            <YouTubeVideoCard key={`${video.id}-${idx}`} video={video} />
                                        ))}
                                    </div>

                                    <div className="hidden lg:block w-full lg:w-1/4">
                                        <ProductDeals products={dealProducts} limit={4} title="Video Deals" />
                                    </div>
                                </div>
                            </section>
                        </LazyLoadSection>
                        <LazyLoadSection
                            fallback={<div className="h-[200px] bg-[var(--colour-bg4)] rounded-lg animate-pulse" />}
                        >
                            <section id="blog-banner" className="relative">
                                {SectionOne}
                            </section>
                        </LazyLoadSection>
                        <section id="blog-compare-products">
                            <BlogCompareProducts products={dealProducts} />
                        </section>

                        <LazyLoadSection
                            fallback={
                                <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-5 gap-3 sm:gap-4">
                                    {[...Array(10)].map((_, i) => (
                                        <div key={i} className="h-[260px] bg-[var(--colour-bg4)] rounded-xl animate-pulse" />
                                    ))}
                                </div>
                            }
                        >
                            <section id="blogs-remaining">
                                <div className="w-full">
                                    {/* Blog Cards Grid */}
                                    <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3 sm:gap-4">
                                        {articles?.length > 0 && articles.slice(0, 10).map((post) => (
                                            <BlogCard key={post.id} post={post} />
                                        ))}
                                    </div>
                                </div>
                            </section>
                        </LazyLoadSection>

                    </div>
                </div>
            </div>
        </>
    );
}
