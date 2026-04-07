'use client';

import React, { useMemo, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import type { Article } from '../../types/Blogtypes';
import imglogo from '../../assets/logoimg.png';

import LazySection from '@/components/LazySection';

import HeroBanner from './HeroBanner';
import BlogCard from './BlogCard';
import ProductDeals from './ProductDeals';
import BlogProductBasket from './BlogProductBasket';
import StoryViewer from './StoryViewer';

import BlogCompareProducts from './BlogCompareProducts';
import SectionHeader from './SectionHeader';
import FeaturedArticleCard from './FeaturedArticleCard';


import useSWR from 'swr';
import { getRandomBasketProducts, getRandomBlogList } from '@/app/api/utils/productFetchers';
import { getCategoryProducts } from '@/app/api/services/category.service';
import { getBlogCategories } from '@/app/api/services/blog.service';


interface BlogListingClientProps {
    articles: Article[];
    categories: any[];
    SectionOne?: React.ReactNode;
    heroBannerData?: any;
    cameraDeals?: any;
    initialWebStories?: any[];
    initialNews?: any[];
    initialGaming?: any[];
    initialLaptops?: any[];
}

export default function BlogListingClient({
    articles,
    categories,
    SectionOne,
    heroBannerData,
    cameraDeals,
    initialWebStories = [],
    initialNews = [],
    initialGaming = [],
    initialLaptops = [],
}: BlogListingClientProps) {

    const searchParams = useSearchParams();
    const activeCategory = searchParams.get('category') ?? 'all';
    const searchQuery = searchParams.get('q') ?? '';

    // ─── SWR Article Fetching ───
    const { data: swrArticles, isLoading } = useSWR(
        ['blogs', activeCategory, searchQuery],
        async ([_, cat, q]: [string, string, string]) => {
            // Only fetch if it's not the initial load or if parameters changed
            if (cat === (searchParams.get('category') ?? 'all') && q === (searchParams.get('q') ?? '')) {
                return articles;
            }
            const res = await getRandomBlogList({
                category: cat !== 'all' ? cat : undefined,
                search: q || undefined,
                per_page: 12
            });
            return ensureArray(res);
        },
        {
            fallbackData: articles,
            revalidateOnFocus: false,
            revalidateIfStale: false,
        }
    );

    const displayArticles = swrArticles ?? articles;

    const [storyViewerOpen, setStoryViewerOpen] = useState(false);
    const [storyStartIndex, setStoryStartIndex] = useState(0);

    const openStory = (idx: number) => {
        setStoryStartIndex(idx);
        setStoryViewerOpen(true);
    };

    // Helper to ensure we have a clean array of products/articles from varying API shapes
    const ensureArray = (data: any) => {
        if (!data) return [];
        if (Array.isArray(data)) return data;
        return data.data?.products || data.data?.data || data.products || data.data || [];
    };

    // Optimized Fetchers (using pre-fetched data where available)
    const emiFetcher = React.useMemo(() => () => getCategoryProducts('mobile-price-in-nepal', { page: 1, per_page: 5, emi_enabled: true, brand: 'iphone-price-in-nepal' }), []);
    const laptopsFetcher = React.useMemo(() => () => initialLaptops.length > 0 ? Promise.resolve({ products: initialLaptops }) : getRandomBasketProducts('laptop-price-in-nepal', 5), [initialLaptops]);
    const newsArticlesFetcher = React.useMemo(() => () => initialNews.length > 0 ? Promise.resolve(initialNews) : getRandomBlogList({ category: 'news', per_page: 6 }), [initialNews]);
    const featuredArticlesFetcher = React.useMemo(() => () => initialGaming.length > 0 ? Promise.resolve(initialGaming) : getRandomBlogList({ category: 'best-gaming-phones', per_page: 7 }), [initialGaming]);
    const remainingBlogsFetcher = React.useMemo(() => () => getRandomBlogList({ per_page: 15, sort: 'asc' }), []);

    // Helper for stories
    const webStoriesFetcher = React.useMemo(() => () => Promise.resolve(initialWebStories), [initialWebStories]);

    return (
        <>
            <main className="min-h-screen max-w-8xl mx-auto bg-(--colour-bg4) w-full">
                <h1 className="sr-only">Latest Tech News, Reviews & Buying Guides | Fatafat Sewa Blog</h1>
                <div className="w-full px-3 sm:px-5 lg:px-6 pt-4 pb-16">

                    {/* ─── Hero Banner: Now Instant from Server Prop ─── */}
                    {heroBannerData && <HeroBanner data={heroBannerData} />}

                    {/* ─── Category Navigation ─── */}
                    {categories?.length > 0 && (
                        <nav
                            id="blog-categories"
                            className="mt-4 mb-2 flex items-center gap-1.5 overflow-x-auto pb-2 no-scrollbar scroll-smooth"
                        >


                            {categories.filter((c: any) => c.status !== false).map((cat: any) => {
                                const isActive = cat.slug === activeCategory || (cat.slug === 'all' && activeCategory === 'all');
                                return (
                                    <Link
                                        key={cat.id}
                                        href={`/blogs?category=${cat.slug}`}
                                        className={[
                                            'shrink-0 flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-[12px] font-medium transition-all',
                                            isActive
                                                ? 'bg-(--colour-fsP2) text-white border border-(--colour-fsP2) shadow-sm'
                                                : 'bg-white text-(--colour-text2) border border-(--colour-border3) hover:border-(--colour-fsP2) hover:text-(--colour-fsP2)',
                                        ].join(' ')}
                                    >
                                        {(cat.thumbnail_image || cat.thumb?.url) && (
                                            <div className="relative w-3.5 h-3.5 rounded-full overflow-hidden shrink-0">
                                                <Image
                                                    src={cat.thumb?.url || cat.thumbnail_image?.thumb || imglogo.src}
                                                    alt={cat.title}
                                                    fill
                                                    className="object-cover"
                                                />
                                            </div>
                                        )}
                                        {cat.title}
                                    </Link>
                                );
                            })}
                        </nav>
                    )}


                    {/* ─── Main Content ─── */}
                    <div className="space-y-4">

                        {/* ═══ 1. Blog Grid + ProductDeals Sidebar ═══ */}
                        <section id="blog-articles">
                            <div className="flex flex-col lg:flex-row gap-5">
                                <div className="w-full lg:w-3/4">
                                    <SectionHeader
                                        title="Latest Articles"
                                        accentColor="var(--colour-fsP1)"
                                        rightElement={
                                            <span className="text-[11px] font-medium text-(--colour-text3)">
                                                {isLoading ? 'Loading...' : `${displayArticles?.length || 0} ${displayArticles?.length === 1 ? 'Article' : 'Articles'}`}
                                            </span>
                                        }
                                    />
                                    <div className={['grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 transition-opacity duration-300', isLoading ? 'opacity-50' : 'opacity-100'].join(' ')}>
                                        {displayArticles?.length > 0 ? (
                                            displayArticles.map((post: Article) => (
                                                <BlogCard key={post.id} post={post} />
                                            ))
                                        ) : !isLoading && (
                                            <div className="col-span-full py-20 text-center">
                                                <p className="text-gray-500 font-medium">No articles found in this category.</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <div className="hidden lg:block w-full lg:w-1/4">
                                    {cameraDeals.length > 0 ? (
                                        <ProductDeals
                                            products={cameraDeals}
                                            title="Camera Deals"
                                            slug="dslr-camera-price-in-nepal"
                                        />
                                    ) : (
                                        <div className="h-150 w-full bg-gray-100 rounded-xl animate-pulse" />
                                    )}
                                </div>
                            </div>
                        </section>

                        {/* ═══ 2. Banner Section ═══ */}
                        <section id="blog-banner" className="relative">
                            {SectionOne}
                        </section>


                        {/* ═══ 4. Smartwatch EMI Deals ═══ */}
                        <LazySection
                            fetcher={emiFetcher}
                            render={(data) => {
                                const finalProducts = ensureArray(data).slice(0, 5);
                                return (
                                    <section id="mobile-emi-deals">
                                        <SectionHeader
                                            title=" EMI Offer"
                                            accentColor="var(--colour-fsP1)"
                                            linkHref="/category/mobile-price-in-nepal"
                                            linkText="View More "
                                            rightElement={<span className="text-[14px] font-bold text-[var(--colour-fsP2)]  uppercase">0% Interest EMI</span>}
                                        />
                                        <div className="w-full">
                                            <BlogProductBasket
                                                slug="mobile-price-in-nepal"
                                                id="mobile-b-1"
                                                data={finalProducts}
                                                random={true}
                                                isEmi={true}
                                            />
                                        </div>
                                    </section>
                                );
                            }}
                            fallback={<div className="h-95 bg-(--colour-bg4) rounded-lg animate-pulse" />}
                        />

                        <LazySection
                            fetcher={webStoriesFetcher}
                            render={(data) => {
                                const categoryStories = data as any[];
                                if (!categoryStories || categoryStories.length === 0) return null;

                                const activeCategoryStories = categoryStories[storyStartIndex]?.stories || [];

                                return (
                                    <>
                                        {/* Story Viewer Dialog — only mounted when stories exist */}
                                        {storyViewerOpen && activeCategoryStories.length > 0 && (
                                            <StoryViewer
                                                isOpen={storyViewerOpen}
                                                webStories={activeCategoryStories}
                                                initialStoryIndex={0}
                                                onClose={() => setStoryViewerOpen(false)}
                                            />
                                        )}
                                        <section id="web-stories">
                                            <SectionHeader title="Web Stories based on your interest" accentColor="var(--colour-fsP2)" />

                                            {/* Stories Grid — 5 cols, 2 rows */}
                                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2.5">
                                                {categoryStories.map((item, idx: number) => {
                                                    const firstStory = item.stories[0];
                                                    if (!firstStory) return null;

                                                    return (
                                                        <div
                                                            key={item.category.id || idx}
                                                            onClick={() => openStory(idx)}
                                                            className="group relative rounded overflow-hidden aspect-9/16 border border-(--colour-border3) hover:shadow-lg transition-all duration-300 cursor-pointer"
                                                        >
                                                            <Image
                                                                src={firstStory.thumb?.url || imglogo.src}
                                                                alt={item.category.title}
                                                                fill
                                                                className="object-contain transition-transform duration-500 group-hover:scale-[1.03]"
                                                                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
                                                                quality={75}
                                                            />
                                                            {/* Dark gradient overlay */}
                                                            <div className="absolute inset-0 bg-linear-to-t from-black/90 via-black/40 to-black/10" />

                                                            <div className="absolute bottom-0 left-0 right-0 p-2.5 sm:p-4 flex flex-col items-center text-center gap-1">
                                                                <div className="text-[9px] sm:text-[10px] font-bold text-(--colour-yellow1) uppercase tracking-wider">
                                                                    {item.category.title}
                                                                </div>
                                                                <h4 className="text-[11px] sm:text-[13px] font-bold text-white leading-tight line-clamp-2 group-hover:text-(--colour-yellow1) transition-colors mt-0.5 mb-0.5">
                                                                    Top {item.stories.length} {item.category.title} Blogs
                                                                </h4>
                                                                {/* Story Count Badge */}
                                                                <span className="inline-flex items-center gap-1 bg-(--colour-fsP2)/90 text-white text-[9px] font-bold px-2 py-0.5 rounded-full mt-0.5">
                                                                    {item.stories.length} Stories
                                                                </span>
                                                            </div>
                                                        </div>
                                                    )
                                                })}
                                            </div>
                                        </section>
                                    </>
                                );
                            }}
                            fallback={<div className="h-100 bg-(--colour-bg4) rounded-lg animate-pulse" />}
                        />





                        {/* ═══ 5. Premium Laptops ═══ */}
                        <LazySection
                            fetcher={laptopsFetcher}
                            render={(data) => {
                                const finalProducts = ensureArray(data).slice(0, 5);
                                return (
                                    <section id="blog-laptops">
                                        <SectionHeader
                                            title="Premium Laptops"
                                            accentColor="var(--colour-yellow1)"
                                            linkHref="/category/laptop-price-in-nepal"
                                            linkText="View All Laptops"
                                        />
                                        <div className="w-full">
                                            <BlogProductBasket
                                                slug="laptop-price-in-nepal"
                                                data={finalProducts}
                                                id="laptop-b-1"
                                                random={true}
                                            />
                                        </div>
                                    </section>
                                );
                            }}
                            fallback={<div className="h-95 bg-(--colour-bg4) rounded-lg animate-pulse" />}
                        />

                        {/* ═══ 6. Featured Stories — 5-Item Grid (Responsive) ═══ */}
                        <LazySection
                            fetcher={featuredArticlesFetcher}
                            render={(data) => {
                                const featured = ensureArray(data).slice(0, 7);
                                if (!featured.length) return null;
                                return (
                                    <div className="flex flex-col gap-4">
                                        <SectionHeader title="Best Gaming Phones" accentColor="var(--colour-fsP2)" />
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
                                            {featured[0] && <FeaturedArticleCard article={featured[0]} variant="hero" gridArea="hero" imageFit="cover" />}
                                            {featured[1] && <FeaturedArticleCard article={featured[1]} variant="compact" gridArea="bot1" imageFit="cover" />}
                                            {featured[2] && <FeaturedArticleCard article={featured[2]} variant="compact" gridArea="bot2" imageFit="cover" />}
                                            {featured[3] && <FeaturedArticleCard article={featured[3]} variant="tall" gridArea="side1" />}
                                            {featured[4] && <FeaturedArticleCard article={featured[4]} variant="tall" gridArea="side2" badgeColor="var(--colour-fsP1)" />}
                                            {featured[5] && <FeaturedArticleCard article={featured[5]} variant="tall" gridArea="side3" badgeColor="var(--colour-fsP1)" />}
                                        </div>

                                        {/* Mobile/Tablet fallback: simple 2-col grid */}
                                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2 lg:hidden">
                                            {featured.map((post: any) => (
                                                <FeaturedArticleCard key={post.id} article={post} variant="compact" />
                                            ))}
                                        </div>
                                    </div>
                                );
                            }}
                            fallback={<div className="h-100 bg-(--colour-bg4) rounded-lg animate-pulse" />}
                        />

                        {/* ═══ 6. Compare Products (Repositioned) ═══ */}
                        <LazySection
                            fetcher={() => getRandomBasketProducts('drone-price-in-nepal', 8)}
                            render={(data) => (
                                <section id="blog-compare-products">
                                    <BlogCompareProducts products={ensureArray(data).slice(0, 8)} />
                                </section>
                            )}
                            fallback={<div className="h-50 bg-(--colour-bg4) rounded-lg animate-pulse" />}
                        />

                        {/* ═══ 7. Tech News Highlights ═══ */}
                        <LazySection
                            fetcher={newsArticlesFetcher}
                            render={(data) => {
                                const newsArray = ensureArray(data).slice(0, 6);
                                if (!newsArray.length) return null;
                                return (
                                    <section id="tech-news">
                                        <SectionHeader title="Latest Tech News" accentColor="var(--colour-fsP2)" />
                                        <div className="grid grid-cols-2 md:grid-cols-6 gap-3 sm:gap-1">
                                            {newsArray.map((post: any) => (
                                                <BlogCard key={post.id} post={post} />
                                            ))}
                                        </div>
                                    </section>
                                );
                            }}
                            fallback={<div className="h-75 bg-(--colour-bg4) rounded-lg animate-pulse" />}
                        />


                        {/* ═══ 8. YouTube Content Section ═══ */}
                        {/* <LazySection
                            fallback={<div className="h-100 bg-(--colour-bg4) rounded-lg animate-pulse" />}
                        >
                            <section id="youtube-content">
                                {/* 80/20 Layout — responsive */}
                        {/* <div className="flex flex-col-reverse lg:flex-row-reverse gap-3 border-t-2 pt-3 mt-1 border-(--colour-border3)">

                                    {/* ─── Left: YouTube Grid ─── */}
                        {/* <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5 w-full lg:w-3/4">
                                        {YOUTUBE_VIDEOS.map((video, idx) => (
                                            <YouTubeVideoCard key={`${video.id}-${idx}`} video={video} />
                                        ))}
                                    </div>

                                    <div className="hidden lg:block w-full lg:w-1/4">
                                        <LazySection
                                            fetcher={youtubeSidebarFetcher}
                                            render={(data) => {
                                                const products = (data as any)?.products || (Array.isArray(data) ? data : []).slice(0, 8);
                                                return <ProductDeals products={products} title="Speaker Highlights" slug="speaker-price-in-nepal" />;
                                            }}
                                            minHeight="400px"
                                            fallback={<div className="h-100 w-full bg-(--colour-bg4) rounded-lg animate-pulse" />}
                                        />
                                    </div> */}
                        {/* </div>
                            </section>
                        </LazySection> */}

                        {/* ═══ 9. Banner (lazy) ═══ */}
                        <section id="blog-banner-2" className="relative">
                            {SectionOne}
                        </section>

                        {/* ═══ 11. Remaining Blog Cards ═══ */}
                        <LazySection
                            fetcher={remainingBlogsFetcher}
                            render={(data) => {
                                const remainingArray = ensureArray(data);
                                if (!remainingArray.length) return null;
                                return (
                                    <section id="blogs-remaining">
                                        <div className="w-full mt-4">
                                            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3 sm:gap-4 transition-opacity duration-300 opacity-100">
                                                {remainingArray.map((post: Article) => (
                                                    <BlogCard key={post.id} post={post} />
                                                ))}
                                            </div>
                                        </div>
                                    </section>
                                );
                            }}
                            fallback={<div className="h-75 bg-(--colour-bg4) rounded-lg animate-pulse" />}
                        />

                    </div>
                </div>
            </main>
        </>
    );
}
