'use client';

import React, { useMemo, useState, useEffect, useRef, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import parse from 'html-react-parser';
import { ChevronRight, Clock, User, Calendar, List, ArrowUpRight, BookOpen, Tag, TrendingUp, Zap, ShieldCheck, Star, ArrowRight } from 'lucide-react';

import type { Article } from '../../types/Blogtypes';
import type { ProductDetails } from '../../types/ProductDetailsTypes';
import type { BannerItem } from '@/app/types/BannerTypes';
import { formatDate } from '../../CommonVue/datetime';
import imglogo from '../../assets/logoimg.png';
import { getRandomBasketProducts } from '@/app/api/utils/productFetchers';

import BlogCard from './BlogCard';
import BlogCompareProducts from './BlogCompareProducts';
import BlogProductBasket from './BlogProductBasket';
import YouTubeVideoCard from './YouTubeVideoCard';
import HeroBanner from './HeroBanner';
import ParsedContent from '@/app/product-details/ParsedContent';
import ProductDeals from './ProductDeals';
import LazySection from '@/components/LazySection';
import SectionHeader from './SectionHeader';
import FeaturedArticleCard from './FeaturedArticleCard';
import { YOUTUBE_VIDEOS_SHORT } from './youtubeData';

interface BlogDetailsClientProps {
    article: Article;
    relatedArticles?: Article[];
    authorArticles?: Article[];
    dealProducts?: ProductDetails[];
    bannerData?: BannerItem;
}

interface TocItem {
    id: string;
    text: string;
    level: number;
}

export default function BlogDetailsClient({ article, relatedArticles = [], authorArticles = [], dealProducts = [], bannerData }: BlogDetailsClientProps) {
    if (!article) return null;

    const heroImage = article?.thumb?.url || article?.thumbnail_image?.full || imglogo.src;
    const readTime = article?.reading_time || '5 min read';

    // Helper to ensure clean array from varying API shapes
    const ensureArray = (data: any) => {
        if (!data) return [];
        if (Array.isArray(data)) return data;
        return data.data?.products || data.data?.data || data.products || data.data || [];
    };

    // Camera Deals Sidebar Fetcher (matching listing focus)
    const cameraDealsFetcher = React.useMemo(() => () => getRandomBasketProducts('dslr-camera-price-in-nepal', 8), []);

    // ── Parse TOC headings (Targeting H2 and H3) ──
    const tocItems = useMemo<TocItem[]>(() => {
        const regex = /<h([23])[^>]*>(.*?)<\/h[23]>/gi;
        const items: TocItem[] = [];
        let match;
        while ((match = regex.exec(article.content)) !== null) {
            const level = parseInt(match[1]);
            const text = match[2].replace(/<[^>]*>/g, '').trim();
            if (text) {
                // Generate a robust ID
                const id = text
                    .toLowerCase()
                    .replace(/[^a-z0-9]+/g, '-')
                    .replace(/(^-|-$)/g, '');

                // Avoid duplicate IDs
                let finalId = id;
                let counter = 1;
                while (items.find(i => i.id === finalId)) {
                    finalId = `${id}-${counter++}`;
                }

                items.push({ id: finalId, text, level });
            }
        }
        return items;
    }, [article.content]);

    // ── Inject IDs into headings with more robust matching ──
    const processedContent = useMemo(() => {
        let content = article.content;
        tocItems.forEach((item) => {
            // Match the heading tag and its immediate content, even if it has nested tags
            // We use a more flexible regex that allows for some variation in whitespace/tags
            const escapedText = item.text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            const regex = new RegExp(`(<h${item.level}[^>]*>)(?=.*${escapedText})`, 'i');
            content = content.replace(regex, `$1<span id="${item.id}" class="toc-anchor"></span>`);
        });
        return content;
    }, [article.content, tocItems]);

    // ── Active heading tracking ──
    const [activeId, setActiveId] = useState<string>('');
    const observerRef = useRef<IntersectionObserver | null>(null);
    const navRef = useRef<HTMLElement>(null);

    // Auto-scroll TOC sidebar to keep active item in view
    useEffect(() => {
        if (!activeId || !navRef.current) return;
        const activeItem = navRef.current.querySelector(`[data-id="${activeId}"]`);
        if (activeItem) {
            activeItem.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'nearest' });
        }
    }, [activeId]);

    useEffect(() => {
        if (tocItems.length === 0) return;

        const handleObserver = (entries: IntersectionObserverEntry[]) => {
            // Find the first intersecting entry
            const visibleEntry = entries.find(entry => entry.isIntersecting);
            if (visibleEntry) {
                setActiveId(visibleEntry.target.id);
            }
        };

        const timeout = setTimeout(() => {
            observerRef.current = new IntersectionObserver(handleObserver, {
                rootMargin: '-100px 0px -60% 0px',
                threshold: 0
            });

            tocItems.forEach((item) => {
                const el = document.getElementById(item.id);
                if (el) observerRef.current?.observe(el);
            });
        }, 500);

        return () => {
            clearTimeout(timeout);
            observerRef.current?.disconnect();
        };
    }, [tocItems]);

    const scrollToHeading = useCallback((id: string) => {
        const el = document.getElementById(id);
        if (el) {
            const yOffset = -100; // Offset for sticky header
            const y = el.getBoundingClientRect().top + window.pageYOffset + yOffset;
            window.scrollTo({ top: y, behavior: 'smooth' });
            setActiveId(id);
        }
    }, []);

    // Scroll to top on mount
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    const [tocOpen, setTocOpen] = useState(false);


    // Derive category-specific articles for "Trending in [Category]"
    const trendingInCategory = (relatedArticles || [])
        .filter(a => a.category?.slug === article.category?.slug && a.id !== article.id)
        .slice(0, 6);


    const handleShare = useCallback(() => {
        if (navigator.share) {
            navigator.share({
                title: article.title,
                text: article.short_desc || article.title,
                url: window.location.href,
            });
        } else {
            navigator.clipboard.writeText(window.location.href);
        }
    }, [article]);

    return (
        <div className="min-h-screen bg-gray-50 font-sans">

            {/* ═══ Single Container ═══ */}
            <div className="max-w-8xl mx-auto px-2 sm:px-4 lg:px-8">

                {/* Mobile TOC */}
                {tocItems.length > 0 && (
                    <div className="lg:hidden mb-6 relative z-10 block w-full px-2">
                        <button
                            onClick={() => setTocOpen(!tocOpen)}
                            className="flex items-center justify-between w-full bg-white border border-gray-200 rounded-lg px-4 py-3 text-sm font-bold text-gray-800 transition-colors"
                        >
                            <span className="flex items-center gap-2">
                                <List className="w-5 h-5 text-[var(--colour-fsP2)]" />
                                Table of Contents
                            </span>
                            <span className="bg-gray-100 text-gray-600 px-2.5 py-0.5 rounded-full text-xs">{tocItems.length}</span>
                        </button>
                        {tocOpen && (
                            <div className="absolute top-full left-2 right-2 mt-2 bg-white border border-gray-200 shadow-lg rounded-lg p-2 max-h-[60vh] overflow-y-auto custom-scrollbar">
                                <nav className="flex flex-col">
                                    {tocItems.map((item) => (
                                        <button
                                            key={item.id}
                                            onClick={() => { scrollToHeading(item.id); setTocOpen(false); }}
                                            className={`block w-full text-left text-[14px] py-2.5 px-3 rounded-md transition-colors ${item.level === 2 ? 'pl-6' : ''
                                                } ${activeId === item.id
                                                    ? 'bg-[var(--colour-fsP1)]/10 text-[var(--colour-fsP1)] font-semibold'
                                                    : 'text-gray-600 hover:bg-gray-50 hover:text-[var(--colour-fsP2)]'}`}
                                        >
                                            {item.text}
                                        </button>
                                    ))}
                                </nav>
                            </div>
                        )}
                    </div>
                )}

                {/* ══════════ 3-Column Layout ══════════ */}
                <div className="flex flex-col lg:flex-row gap-3 pb-16">

                    {/* ─── Left: Sticky TOC ─── */}
                    {tocItems.length > 0 && (
                        <aside className="hidden lg:block w-[280px] shrink-0">
                            <div className="sticky top-30 pt-10 pb-1">
                                <h3 className="text-[13px] font-bold text-[var(--colour-fsP2)] uppercase tracking-wider mb-4">
                                    Table of Contents
                                </h3>
                                <nav ref={navRef} className="flex flex-col border-none border-gray-200 overflow-y-auto max-h-[calc(100vh-110px)] custom-scrollbar">
                                    {tocItems.map((item) => (
                                        <button
                                            key={item.id}
                                            data-id={item.id}
                                            onClick={() => scrollToHeading(item.id)}
                                            className={`flex items-start text-left text-[12.5px] py-1.5 pl-1  border-l-2 transition-colors leading-relaxed ${item.level === 2 ? '' : ''
                                                } ${activeId === item.id
                                                    ? 'border-[var(--colour-fsP1)] text-[var(--colour-fsP1)] bg-[var(--colour-fsP1)]/5'
                                                    : 'border-transparent text-gray-600 hover:text-[var(--colour-fsP2)] hover:bg-[var(--colour-fsP2)]/5 hover:border-[var(--colour-fsP2)]'
                                                }`}
                                        >
                                            {item.text}
                                        </button>
                                    ))}
                                </nav>
                            </div>
                        </aside>
                    )}

                    {/* ─── Center: Header + Article ─── */}
                    <main className="flex-1 min-w-0">
                        <nav className="flex items-center font-bold gap-1.5 text-sm py-4 overflow-x-auto scrollbar-hide px-6" aria-label="Breadcrumb">
                            <Link href="/" className="text-[var(--colour-fsP2)] hover:text-[var(--colour-fsP1)] whitespace-nowrap transition-colors">Home</Link>
                            <ChevronRight className="w-4 h-4 text-gray-400 flex-shrink-0" />
                            <Link href="/blogs" className="text-[var(--colour-fsP2)] hover:text-[var(--colour-fsP1)] whitespace-nowrap transition-colors">Blog</Link>
                            {article.category?.title && (
                                <>
                                    <ChevronRight className="w-4 h-4 text-gray-400 flex-shrink-0" />
                                    <Link href={`/blogs?category=${article.category.slug}`} className="text-[var(--colour-fsP2)] hover:text-[var(--colour-fsP1)] whitespace-nowrap  transition-colors">
                                        {article.category.title}
                                    </Link>
                                </>
                            )}
                            <ChevronRight className="w-4 h-4 text-gray-400 flex-shrink-0" />
                            <span className="text-slate-800 font-semibold truncate max-w-[200px] sm:max-w-[350px]">{article.title}</span>
                        </nav>

                        {/* Header Section */}
                        <header className="mb-8 px-2 sm:px-0">

                            <h1 className="text-2xl  lg:text-3xl font-extrabold text-center text-gray-900 leading-[1.2] tracking-tight mb-6">
                                {article.title}
                            </h1>


                            <div className="flex flex-wrap items-center justify-center gap-2.5 text-[11px] text-[var(--colour-text3)] mb-4">

                                <Link
                                    href={`/blogs?category=${article.category?.slug}`}
                                    className="inline-block bg-[var(--colour-fsP1)]/10 text-[var(--colour-fsP1)] px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wide uppercase m-0 hover:bg-[var(--colour-fsP1)]/20 transition-colors"
                                >
                                    {article.category?.title || 'Article'}
                                </Link>
                                <div className="flex items-center gap-1.5">
                                    <div className="w-5 h-5 rounded-full bg-[var(--colour-fsP1)] flex items-center justify-center">
                                        <User className="w-2.5 h-2.5 text-white" />
                                    </div>
                                    <span className="font-semibold text-[var(--colour-text2)]">{article.author}</span>
                                </div>
                                <span className="text-gray-300">|</span>
                                <div className="flex items-center gap-1">
                                    <Calendar className="w-3 h-3" />
                                    <span>{formatDate(article.publish_date)}</span>
                                </div>
                                <span className="text-gray-300">|</span>
                                <div className="flex items-center gap-1">
                                    <Clock className="w-3 h-3" />
                                    <span>{readTime}</span>
                                </div>
                            </div>

                            <div className="relative w-full aspect-[16/9] rounded overflow-hidden bg-[var(--colour-bg4)] border border-gray-100 shadow-sm">
                                <Image
                                    src={heroImage}
                                    alt={article.title}
                                    fill
                                    sizes="(max-width: 768px) 100vw, 768px"
                                    className="object-contain"
                                    priority
                                />
                            </div>
                        </header>

                        {/* Article Prose */}
                        <article className="bg-white rounded-lg border border-gray-100 p-4 sm:p-6 md:p-8">
                            <div className="min-h-[200px]">
                                <ParsedContent description={processedContent} className="" />
                            </div>

                        </article>



                    </main>

                    {/* ─── Right: Sidebar Widgets ─── */}
                    <aside className="w-full lg:w-72 shrink-0 sm:pt-6 space-y-6">
                        <LazySection
                            fetcher={cameraDealsFetcher}
                            render={(data) => {
                                const products = (data as any)?.products || (Array.isArray(data) ? data : []).slice(0, 8);
                                return <ProductDeals products={products} title="Camera Deals" slug="dslr-camera-price-in-nepal" />;
                            }}
                            fallback={<div className="h-[500px] w-full bg-gray-100 rounded-lg animate-pulse" />}
                        />
                    </aside>
                </div>
            </div>

            {/* ══════════ Full-Width Sections Below Article ══════════ */}
            <div className="max-w-8xl mx-auto px-2 sm:px-4 lg:px-8 space-y-6 pb-16">

                {/* ─── Related Articles (FeaturedArticleCard grid) ─── */}
                {relatedArticles.length > 0 && (
                    <LazySection
                        fallback={<div className="h-[300px] bg-gray-100 rounded-lg animate-pulse" />}
                    >
                        <section>
                            <SectionHeader
                                title="Related Articles"
                                accentColor="var(--colour-fsP2)"
                                linkHref={`/blogs?category=${article.category?.slug}`}
                                linkText="More"
                            />
                            {/* Responsive grid: 2 cols mobile → 3 tablet → 5 desktop */}
                            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
                                {relatedArticles.slice(0, 10).map((post) => (
                                    <FeaturedArticleCard
                                        key={post.id}
                                        article={post}
                                        variant="compact"
                                        badgeColor={post.category?.id === article.category?.id ? 'var(--colour-fsP2)' : 'var(--colour-fsP1)'}
                                    />
                                ))}
                            </div>
                        </section>
                    </LazySection>
                )}



                {/* ─── Trending in [Category] ─── */}
                {trendingInCategory.length > 2 && (
                    <LazySection
                        fallback={<div className="h-[250px] bg-gray-100 rounded-lg animate-pulse" />}
                    >
                        <section>
                            <SectionHeader
                                title={`Trending in ${article.category?.title || 'Tech'}`}
                                accentColor="var(--colour-yellow1)"
                                linkHref={`/blogs?category=${article.category?.slug}`}
                                linkText="View All"
                                rightElement={
                                    <span className="text-[10px] font-semibold text-[var(--colour-text3)] bg-[var(--colour-bg4)] px-2 py-0.5 rounded-full flex items-center gap-1">
                                        <TrendingUp className="w-3 h-3" /> {trendingInCategory.length} articles
                                    </span>
                                }
                            />
                            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                                {trendingInCategory.map((post) => (
                                    <BlogCard key={post.id} post={post} />
                                ))}
                            </div>
                        </section>
                    </LazySection>
                )}

                {/* ─── More from Author ─── */}
                {authorArticles.length > 0 && (
                    <LazySection>
                        <section>
                            <SectionHeader
                                title={`More from ${article.author}`}
                                accentColor="var(--colour-fsP1)"
                                linkHref="/blogs"
                            />
                            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                                {authorArticles.map((post) => (
                                    <BlogCard key={post.id} post={post} />
                                ))}
                            </div>
                        </section>
                    </LazySection>
                )}


                {/* ─── Product Basket ─── */}
                {article.category?.id && (
                    <LazySection>
                        <section>
                            <SectionHeader
                                title={`${article.category?.title || 'Related'} Products`}
                                accentColor="var(--colour-fsP2)"
                                linkHref="/products"
                            />
                            <BlogProductBasket
                                title={article.category?.title || 'Products'}
                                slug={article.category?.slug || ''}
                                id={String(article.category?.id || '')}
                            />
                        </section>
                    </LazySection>
                )}

                {/* ─── Banner ─── */}
                {bannerData && (
                    <LazySection>
                        <section>
                            <HeroBanner data={bannerData} />
                        </section>
                    </LazySection>
                )}

                {/* ─── YouTube Content ─── */}
                {/* <LazySection>
                    <section>
                        <SectionHeader title="YouTube Content" accentColor="#ef4444" />
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5">
                            {YOUTUBE_VIDEOS_SHORT.map((video, idx) => (
                                <YouTubeVideoCard key={`${video.id}-${idx}`} video={video} />
                            ))}
                        </div>
                    </section>
                </LazySection> */}

                {/* ─── Compare Products ─── */}
                {dealProducts.length >= 2 && (
                    <LazySection>
                        <section>
                            <BlogCompareProducts products={dealProducts} />
                        </section>
                    </LazySection>
                )}

            </div>
        </div>
    );
}
