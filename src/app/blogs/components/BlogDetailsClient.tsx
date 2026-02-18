'use client';

import React, { useMemo, useState, useEffect, useRef, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import parse from 'html-react-parser';
import { ChevronRight, Clock, User, Calendar, List, ArrowUpRight, BookOpen, Share2, Tag, TrendingUp, Zap, ShieldCheck, Star, ArrowRight } from 'lucide-react';

import { Article } from '../../types/Blogtypes';
import { ProductDetails } from '../../types/ProductDetailsTypes';
import { BannerItem } from '@/app/types/BannerTypes';
import { formatDate } from '../../CommonVue/datetime';
import imglogo from '../../assets/logoimg.png';

import BlogCard from './BlogCard';
import BlogCompareProducts from './BlogCompareProducts';
import BlogProductBasket from './BlogProductBasket';
import YouTubeVideoCard from './YouTubeVideoCard';
import HeroBanner from './HeroBanner';
import ParsedContent from '@/app/products/ParsedContent';
import ProductDeals from './ProductDeals';
import LazyLoadSection from '@/components/LazyLoadSection';
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

    const heroImage = article?.thumbnail_image?.full || imglogo.src;
    const readTime = article?.reading_time || '5 min read';

    // ── Parse TOC headings ──
    const tocItems = useMemo<TocItem[]>(() => {
        const regex = /<h([23])[^>]*>(.*?)<\/h[23]>/gi;
        const items: TocItem[] = [];
        let match;
        while ((match = regex.exec(article.content)) !== null) {
            const level = parseInt(match[1]);
            const text = match[2].replace(/<[^>]*>/g, '').trim();
            if (text) {
                const id = text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
                items.push({ id, text, level });
            }
        }
        return items;
    }, [article.content]);

    // ── Inject IDs into headings ──
    const processedContent = useMemo(() => {
        let content = article.content;
        tocItems.forEach((item) => {
            const regex = new RegExp(`(<h[23][^>]*>)(${item.text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'i');
            content = content.replace(regex, `$1<span id="${item.id}"></span>$2`);
        });
        return content;
    }, [article.content, tocItems]);

    // ── Active heading tracking ──
    const [activeId, setActiveId] = useState<string>('');
    const observerRef = useRef<IntersectionObserver | null>(null);

    useEffect(() => {
        if (tocItems.length === 0) return;
        const timeout = setTimeout(() => {
            observerRef.current = new IntersectionObserver(
                (entries) => {
                    const visible = entries.filter((e) => e.isIntersecting);
                    if (visible.length > 0) setActiveId(visible[0].target.id);
                },
                { rootMargin: '-80px 0px -70% 0px', threshold: 0 }
            );
            tocItems.forEach((item) => {
                const el = document.getElementById(item.id);
                if (el) observerRef.current?.observe(el);
            });
        }, 300);
        return () => { clearTimeout(timeout); observerRef.current?.disconnect(); };
    }, [tocItems]);

    const scrollToHeading = useCallback((id: string) => {
        const el = document.getElementById(id);
        if (el) {
            const y = el.getBoundingClientRect().top + window.pageYOffset - 100;
            window.scrollTo({ top: y, behavior: 'smooth' });
        }
    }, []);

    // Scroll to top on mount
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    const [tocOpen, setTocOpen] = useState(false);

    // Derive next article to read
    const nextArticle = relatedArticles.length > 0 ? relatedArticles[0] : null;

    // Derive category-specific articles for "Trending in [Category]"
    const trendingInCategory = relatedArticles.filter(a => a.category?.id === article.category?.id).slice(0, 6);

    // Featured product from deals (the top-rated or first deal product)
    const featuredProduct = dealProducts.length > 0
        ? [...dealProducts].sort((a, b) => (b.average_rating || 0) - (a.average_rating || 0))[0]
        : null;

    // Share handler
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
                    <div className="lg:hidden mb-3">
                        <button
                            onClick={() => setTocOpen(!tocOpen)}
                            className="flex items-center gap-2 w-full bg-[var(--colour-fsP2)]/5 border border-[var(--colour-fsP2)]/20 rounded-lg px-4 py-3 text-sm font-semibold text-[var(--colour-fsP2)]"
                        >
                            <List className="w-4 h-4" />
                            Table of Contents
                            <span className="ml-auto text-[var(--colour-fsP2)]/60 text-xs">{tocItems.length}</span>
                        </button>
                        {tocOpen && (
                            <div className="bg-white border border-[var(--colour-fsP2)]/10 border-t-0 rounded-b-lg px-4 py-2">
                                {tocItems.map((item) => (
                                    <button
                                        key={item.id}
                                        onClick={() => { scrollToHeading(item.id); setTocOpen(false); }}
                                        className={`block w-full text-left text-[12px] py-1.5 border-l-2 pl-3 transition-colors ${item.level === 3 ? 'ml-3' : ''
                                            } ${activeId === item.id
                                                ? 'border-[var(--colour-fsP2)] text-[var(--colour-fsP2)] font-semibold'
                                                : 'border-transparent text-[var(--colour-text3)] hover:text-[var(--colour-fsP2)] hover:border-[var(--colour-fsP2)]/30'}`}
                                    >
                                        {item.text}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* ══════════ 3-Column Layout ══════════ */}
                <div className="flex flex-col lg:flex-row gap-3 pb-16">

                    {/* ─── Left: Sticky TOC ─── */}
                    {tocItems.length > 0 && (
                        <aside className="hidden lg:block w-44 shrink-0">
                            <div className="sticky top-10 pt-40">
                                <p className="text-[10px] font-semibold text-[var(--colour-text3)] uppercase tracking-wider mb-2">Contents</p>
                                <nav className="border-l border-gray-200 overflow-y-auto">
                                    {tocItems.map((item) => (
                                        <button
                                            key={item.id}
                                            onClick={() => scrollToHeading(item.id)}
                                            className={`block w-full text-left text-[10px] py-1 pl-2.5 -ml-px border-l-2 transition-colors leading-snug ${item.level === 3 ? 'pl-4' : ''
                                                } ${activeId === item.id
                                                    ? 'border-[var(--colour-fsP2)] text-[var(--colour-fsP2)] font-medium'
                                                    : 'border-transparent text-[var(--colour-text3)] hover:text-[var(--colour-text2)]'
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
                        <nav className="flex items-center gap-1.5 text-sm py-4 overflow-x-auto scrollbar-hide px-6" aria-label="Breadcrumb">
                            <Link href="/" className="text-[var(--colour-fsP2)] hover:text-[var(--colour-fsP1)] whitespace-nowrap transition-colors">Home</Link>
                            <ChevronRight className="w-4 h-4 text-gray-400 flex-shrink-0" />
                            <Link href="/blogs" className="text-[var(--colour-fsP2)] hover:text-[var(--colour-fsP1)] whitespace-nowrap transition-colors">Blog</Link>
                            {article.category?.title && (
                                <>
                                    <ChevronRight className="w-4 h-4 text-gray-400 flex-shrink-0" />
                                    <Link href={`/blogs?category=${article.category.slug}`} className="text-[var(--colour-fsP2)] hover:text-[var(--colour-fsP1)] whitespace-nowrap font-medium transition-colors">
                                        {article.category.title}
                                    </Link>
                                </>
                            )}
                            <ChevronRight className="w-4 h-4 text-gray-400 flex-shrink-0" />
                            <span className="text-slate-800 font-semibold truncate max-w-[200px] sm:max-w-[350px]">{article.title}</span>
                        </nav>

                        {/* Header Card */}
                        <header className=" rounded-xl bg-white  p-4 sm:p-6 mb-3 text-center">

                            <h1 className="text-lg md:text-xl lg:text-2xl font-extrabold text-[var(--colour-text2)] leading-snug tracking-tight mb-3 mx-auto">
                                {article.title}
                            </h1>

                            <div className="flex flex-wrap items-center justify-center gap-2.5 text-[11px] text-[var(--colour-text3)] mb-4">

                                <Link
                                    href={`/blogs?category=${article.category?.slug}`}
                                    className="inline-block bg-[var(--colour-fsP1)]/10 text-[var(--colour-fsP1)] px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wide uppercase mb-3 hover:bg-[var(--colour-fsP1)]/20 transition-colors"
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

                            <div className="relative w-full mx-auto aspect-[16/9] rounded-sm overflow-hidden bg-white border-none ">
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
                                <ParsedContent description={article.content} className="" />
                            </div>

                            {/* ─── Tags & Share Bar ─── */}
                            <div className="mt-8 pt-5 border-t border-gray-100">
                                <div className="flex flex-wrap items-center justify-between gap-3">
                                    {/* Tags */}
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <Tag className="w-3.5 h-3.5 text-[var(--colour-text3)]" />
                                        <Link
                                            href={`/blogs?category=${article.category?.slug}`}
                                            className="text-[10px] font-semibold uppercase tracking-wide bg-[var(--colour-bg4)] text-[var(--colour-text3)] px-2.5 py-1 rounded-full hover:bg-[var(--colour-fsP2)]/10 hover:text-[var(--colour-fsP2)] transition-colors"
                                        >
                                            {article.category?.title}
                                        </Link>
                                        <span className="text-[10px] font-semibold uppercase tracking-wide bg-[var(--colour-bg4)] text-[var(--colour-text3)] px-2.5 py-1 rounded-full">
                                            {readTime}
                                        </span>
                                    </div>

                                    {/* Share */}
                                    <button
                                        onClick={handleShare}
                                        className="flex items-center gap-1.5 text-[11px] font-semibold text-[var(--colour-fsP2)] hover:text-[var(--colour-fsP1)] transition-colors bg-[var(--colour-fsP2)]/5 hover:bg-[var(--colour-fsP2)]/10 px-3 py-1.5 rounded-full"
                                    >
                                        <Share2 className="w-3.5 h-3.5" />
                                        Share Article
                                    </button>
                                </div>
                            </div>
                        </article>

                        {/* ─── Read Next CTA (below article, before full-width sections) ─── */}
                        {nextArticle && (
                            <Link
                                href={`/blogs/${nextArticle.slug}`}
                                className="group mt-3 flex items-center gap-4 bg-gradient-to-r from-[var(--colour-fsP2)]/5 to-[var(--colour-fsP1)]/5 border border-[var(--colour-fsP2)]/15 rounded-xl p-4 hover:border-[var(--colour-fsP2)]/40 hover:shadow-md transition-all duration-300"
                            >
                                <div className="relative w-20 h-20 sm:w-24 sm:h-24 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100">
                                    <Image
                                        src={nextArticle.thumbnail_image?.full || imglogo.src}
                                        alt={nextArticle.title}
                                        fill
                                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                                        sizes="96px"
                                    />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--colour-fsP2)] mb-1 flex items-center gap-1">
                                        <BookOpen className="w-3 h-3" /> Read Next
                                    </p>
                                    <h4 className="text-sm sm:text-base font-bold text-[var(--colour-text2)] line-clamp-2 group-hover:text-[var(--colour-fsP2)] transition-colors leading-snug">
                                        {nextArticle.title}
                                    </h4>
                                    <p className="text-[11px] text-[var(--colour-text3)] mt-1 line-clamp-1">
                                        {nextArticle.short_desc || `By ${nextArticle.author} · ${formatDate(nextArticle.publish_date)}`}
                                    </p>
                                </div>
                                <ArrowRight className="w-5 h-5 text-[var(--colour-fsP2)] opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
                            </Link>
                        )}

                    </main>

                    {/* ─── Right: Product Deals ─── */}
                    {dealProducts.length > 0 && (
                        <aside className="w-full lg:w-72 shrink-0 sm:pt-10">
                            <ProductDeals products={dealProducts} limit={6} title="Top Deals" />
                        </aside>
                    )}
                </div>
            </div>

            {/* ══════════ Full-Width Sections Below Article ══════════ */}
            <div className="max-w-8xl mx-auto px-2 sm:px-4 lg:px-8 space-y-6 pb-16">

                {/* ─── Related Articles (FeaturedArticleCard grid) ─── */}
                {relatedArticles.length > 0 && (
                    <LazyLoadSection
                        fallback={<div className="h-[300px] bg-gray-100 rounded-lg animate-pulse" />}
                    >
                        <section>
                            <SectionHeader
                                title="Related Articles"
                                accentColor="var(--colour-fsP2)"
                                linkHref={`/blogs?category=${article.category?.slug}`}
                                linkText="More"
                            />
                            {/* Responsive grid: 2 cols mobile → 3 tablet → 4 desktop */}
                            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
                                {relatedArticles.slice(0, 8).map((post) => (
                                    <FeaturedArticleCard
                                        key={post.id}
                                        article={post}
                                        variant="compact"
                                        badgeColor={post.category?.id === article.category?.id ? 'var(--colour-fsP2)' : 'var(--colour-fsP1)'}
                                    />
                                ))}
                            </div>
                        </section>
                    </LazyLoadSection>
                )}

                {/* ─── Featured Product Spotlight ─── */}
                {featuredProduct && (
                    <LazyLoadSection
                        fallback={<div className="h-[200px] bg-gray-100 rounded-lg animate-pulse" />}
                    >
                        <section className="bg-white rounded-xl border border-gray-100 p-4 sm:p-5">
                            <SectionHeader title="Featured Product" accentColor="var(--colour-fsP1)" />
                            <div className="flex flex-col sm:flex-row gap-4 items-center">
                                {/* Product Image */}
                                <div className="relative w-32 h-32 sm:w-40 sm:h-40 flex-shrink-0 bg-[var(--colour-bg4)] rounded-xl overflow-hidden">
                                    <Image
                                        src={featuredProduct.image?.full || imglogo.src}
                                        alt={featuredProduct.name}
                                        fill
                                        className="object-contain p-3"
                                        sizes="160px"
                                    />
                                </div>

                                {/* Product Info */}
                                <div className="flex-1 min-w-0 text-center sm:text-left">
                                    <Link href={`/products/${featuredProduct.slug}`} className="group">
                                        <h4 className="text-sm sm:text-base font-bold text-[var(--colour-text2)] line-clamp-2 group-hover:text-[var(--colour-fsP2)] transition-colors">
                                            {featuredProduct.name}
                                        </h4>
                                    </Link>

                                    {/* Price */}
                                    <div className="flex items-baseline gap-2 mt-1.5 justify-center sm:justify-start">
                                        <span className="text-lg font-bold text-[var(--colour-fsP1)]">
                                            Rs. {featuredProduct.discounted_price?.toLocaleString()}
                                        </span>
                                        {featuredProduct.discounted_price < featuredProduct.price && (
                                            <span className="text-xs text-gray-400 line-through">
                                                Rs. {featuredProduct.price?.toLocaleString()}
                                            </span>
                                        )}
                                    </div>

                                    {/* Quick Specs */}
                                    <div className="flex flex-wrap gap-2 mt-2.5 justify-center sm:justify-start">
                                        {featuredProduct.brand?.name && (
                                            <span className="text-[10px] font-semibold bg-[var(--colour-bg4)] text-[var(--colour-text3)] px-2 py-0.5 rounded-full flex items-center gap-1">
                                                <Tag className="w-2.5 h-2.5" /> {featuredProduct.brand.name}
                                            </span>
                                        )}
                                        {featuredProduct.average_rating > 0 && (
                                            <span className="text-[10px] font-semibold bg-amber-50 text-amber-600 px-2 py-0.5 rounded-full flex items-center gap-1">
                                                <Star className="w-2.5 h-2.5 fill-amber-400" /> {featuredProduct.average_rating.toFixed(1)}
                                            </span>
                                        )}
                                        {featuredProduct.quantity > 0 && (
                                            <span className="text-[10px] font-semibold bg-green-50 text-green-600 px-2 py-0.5 rounded-full flex items-center gap-1">
                                                <ShieldCheck className="w-2.5 h-2.5" /> In Stock
                                            </span>
                                        )}
                                        {featuredProduct.emi_enabled === 1 && (
                                            <span className="text-[10px] font-semibold bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full flex items-center gap-1">
                                                <Zap className="w-2.5 h-2.5" /> EMI Available
                                            </span>
                                        )}
                                    </div>
                                </div>

                                {/* CTA */}
                                <Link
                                    href={`/products/${featuredProduct.slug}`}
                                    className="bg-[var(--colour-fsP1)] hover:bg-[var(--colour-fsP2)] text-white font-bold text-sm px-6 py-2.5 rounded-lg transition-colors flex items-center gap-1.5 flex-shrink-0"
                                >
                                    View Product <ArrowUpRight className="w-4 h-4" />
                                </Link>
                            </div>
                        </section>
                    </LazyLoadSection>
                )}

                {/* ─── Trending in [Category] ─── */}
                {trendingInCategory.length > 2 && (
                    <LazyLoadSection
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
                    </LazyLoadSection>
                )}

                {/* ─── More from Author ─── */}
                {authorArticles.length > 0 && (
                    <LazyLoadSection>
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
                    </LazyLoadSection>
                )}


                {/* ─── Product Basket ─── */}
                {article.category?.id && (
                    <LazyLoadSection>
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
                    </LazyLoadSection>
                )}

                {/* ─── Banner ─── */}
                {bannerData && (
                    <LazyLoadSection>
                        <section>
                            <HeroBanner data={bannerData} />
                        </section>
                    </LazyLoadSection>
                )}

                {/* ─── YouTube Content ─── */}
                <LazyLoadSection>
                    <section>
                        <SectionHeader title="YouTube Content" accentColor="#ef4444" />
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5">
                            {YOUTUBE_VIDEOS_SHORT.map((video, idx) => (
                                <YouTubeVideoCard key={`${video.id}-${idx}`} video={video} />
                            ))}
                        </div>
                    </section>
                </LazyLoadSection>

                {/* ─── Compare Products ─── */}
                {dealProducts.length >= 2 && (
                    <LazyLoadSection>
                        <section>
                            <BlogCompareProducts products={dealProducts} />
                        </section>
                    </LazyLoadSection>
                )}

            </div>
        </div>
    );
}
