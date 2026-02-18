'use client';

import React, { useState } from 'react';
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
import SectionHeader from './SectionHeader';
import FeaturedArticleCard from './FeaturedArticleCard';
import { YOUTUBE_VIDEOS } from './youtubeData';


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
                                    <SectionHeader
                                        title="Latest Articles"
                                        accentColor="var(--colour-fsP1)"
                                        rightElement={
                                            <span className="text-[11px] font-semibold text-[var(--colour-text3)] bg-[var(--colour-bg4)] px-3 py-1 rounded-full border border-[var(--colour-border3)]">
                                                {articles?.length} {articles?.length === 1 ? 'Article' : 'Articles'}
                                            </span>
                                        }
                                    />
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

                        {/* ═══ 3. Web Stories ═══ */}
                        <LazyLoadSection
                            fallback={<div className="h-[400px] bg-[var(--colour-bg4)] rounded-lg animate-pulse" />}
                        >
                            <section id="web-stories">
                                <SectionHeader title="Web Stories" accentColor="var(--colour-fsP2)" />

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
                        </LazyLoadSection>

                        {/* ═══ 4. Featured Stories — 5-Item Grid (Responsive) ═══ */}
                        <LazyLoadSection
                            fallback={<div className="h-[380px] bg-[var(--colour-bg4)] rounded-lg animate-pulse" />}
                        >
                            <section id="blogs-laptops">
                                <SectionHeader title="Mobile Phones" accentColor="var(--colour-yellow1)" linkHref="/blogs" linkText="More Stories" />

                                <div className="w-full">
                                    <BlogProductBasket
                                        title="More from "
                                        slug="related-category"
                                        id="1"
                                    />
                                </div>
                            </section>
                        </LazyLoadSection>

                        {/* ═══ 5. 5-Item Featured Grid + Banner ═══ */}
                        <LazyLoadSection
                            fallback={<div className="h-[400px] bg-[var(--colour-bg4)] rounded-lg animate-pulse" />}
                        >
                            <div className="flex flex-col gap-4">
                                {/* 5-Item CSS Grid — Responsive */}
                                <div
                                    className="hidden lg:grid gap-1"
                                    style={{
                                        gridTemplateColumns: 'repeat(5, 1fr)',
                                        gridTemplateRows: 'auto auto',
                                        gridTemplateAreas: `
                                        "hero hero side1 side2 side3"
                                        "bot1 bot2 side1 side2 side3"
                                    `,
                                    }}
                                >
                                    {articles?.[0] && <FeaturedArticleCard article={articles[0]} variant="hero" gridArea="hero" />}
                                    {articles?.[1] && <FeaturedArticleCard article={articles[1]} variant="compact" gridArea="bot1" />}
                                    {articles?.[2] && <FeaturedArticleCard article={articles[2]} variant="compact" gridArea="bot2" />}
                                    {articles?.[3] && <FeaturedArticleCard article={articles[3]} variant="tall" gridArea="side1" />}
                                    {articles?.[5] && <FeaturedArticleCard article={articles[5]} variant="tall" gridArea="side2" badgeColor="var(--colour-fsP1)" />}
                                    {articles?.[6] && <FeaturedArticleCard article={articles[6]} variant="tall" gridArea="side3" badgeColor="var(--colour-fsP1)" />}
                                </div>

                                {/* Mobile/Tablet fallback: simple 2-col grid */}
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-2 lg:hidden">
                                    {articles?.slice(0, 6).map((post) => (
                                        <FeaturedArticleCard key={post.id} article={post} variant="compact" />
                                    ))}
                                </div>
                            </div>
                        </LazyLoadSection>

                        {/* ═══ 6. Reviews Section ═══ */}
                        <LazyLoadSection
                            fallback={<div className="h-[300px] bg-[var(--colour-bg4)] rounded-lg animate-pulse" />}
                        >
                            <section id="reviews-section">
                                <SectionHeader title="Reviews" accentColor="var(--colour-fsP2)" linkHref="/blogs?category=reviews" />

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
                        </LazyLoadSection>


                        {/* ═══ 7. YouTube Content Section ═══ */}
                        <LazyLoadSection
                            fallback={<div className="h-[400px] bg-[var(--colour-bg4)] rounded-lg animate-pulse" />}
                        >
                            <section id="youtube-content">
                                {/* 80/20 Layout — responsive */}
                                <div className="flex flex-col-reverse lg:flex-row-reverse gap-3 border-t-2 pt-3 mt-1 border-[var(--colour-border3)]">

                                    {/* ─── Left: YouTube Grid ─── */}
                                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5 w-full lg:w-3/4">
                                        {YOUTUBE_VIDEOS.map((video, idx) => (
                                            <YouTubeVideoCard key={`${video.id}-${idx}`} video={video} />
                                        ))}
                                    </div>

                                    <div className="hidden lg:block w-full lg:w-1/4">
                                        <ProductDeals products={dealProducts} limit={4} title="Video Deals" />
                                    </div>
                                </div>
                            </section>
                        </LazyLoadSection>

                        {/* ═══ 8. Banner (lazy) ═══ */}
                        <LazyLoadSection
                            fallback={<div className="h-[200px] bg-[var(--colour-bg4)] rounded-lg animate-pulse" />}
                        >
                            <section id="blog-banner-2" className="relative">
                                {SectionOne}
                            </section>
                        </LazyLoadSection>

                        {/* ═══ 9. Compare Products ═══ */}
                        <LazyLoadSection
                            fallback={<div className="h-[200px] bg-[var(--colour-bg4)] rounded-lg animate-pulse" />}
                        >
                            <section id="blog-compare-products">
                                <BlogCompareProducts products={dealProducts} />
                            </section>
                        </LazyLoadSection>

                        {/* ═══ 10. Remaining Blog Cards ═══ */}
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
