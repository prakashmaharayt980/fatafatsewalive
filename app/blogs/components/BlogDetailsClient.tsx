'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ChevronRight, Clock, User, Calendar, List, Share2 } from 'lucide-react';

import type { Article } from '../../types/Blogtypes';
import type { ProductDetails } from '../../types/ProductDetailsTypes';
import type { BannerItem } from '@/app/types/BannerTypes';
import { formatDate } from '../../CommonVue/datetime';
import imglogo from '../../assets/logoimg.png';
import { getRandomBasketProducts } from '@/app/api/utils/productFetchers';

import BlogCard from './BlogCard';
import BlogCompareProducts from './BlogCompareProducts';
import BlogProductBasket from './BlogProductBasket';
import HeroBanner from './HeroBanner';
import ParsedContent, { extractTocItems, type TocItem } from '@/app/product-details/ParsedContent';
import ProductDeals from './ProductDeals';
import LazySection from '@/components/LazySection';
import SectionHeader from './SectionHeader';

interface Props {
    article: Article;
    relatedArticles?: Article[];
    authorArticles?: Article[];
    dealProducts?: ProductDetails[];
    bannerData?: BannerItem;
}

export default function BlogDetailsClient({ article, relatedArticles = [], authorArticles = [], dealProducts = [], bannerData }: Props) {
    if (!article) return null;

    const heroImage = article?.thumb?.url ?? article?.thumbnail_image?.full ?? imglogo.src;
    const readTime = article?.reading_time ?? '5 min read';

    const cameraDealsFetcher = React.useMemo(() => () => getRandomBasketProducts('dslr-camera-price-in-nepal', 8), []);

    const [tocItems] = useState<TocItem[]>(() => extractTocItems(article.content));
    const [activeId, setActiveId] = useState(() => tocItems[0]?.id ?? '');
    const [tocOpen, setTocOpen] = useState(false);
    const observerRef = useRef<IntersectionObserver | null>(null);
    const rafRef = useRef<number>(0);
    const navRef = useRef<HTMLElement>(null);
    const visibleIds = useRef(new Set<string>());

    // IntersectionObserver — track ALL visible headings, pick topmost (stable, no bounce)
    useEffect(() => {
        if (tocItems.length === 0) return;
        visibleIds.current = new Set();

        rafRef.current = requestAnimationFrame(() => {
            observerRef.current?.disconnect();
            observerRef.current = new IntersectionObserver(
                (entries) => {
                    entries.forEach(e => {
                        if (e.isIntersecting) visibleIds.current.add(e.target.id);
                        else visibleIds.current.delete(e.target.id);
                    });
                    const first = tocItems.find(item => visibleIds.current.has(item.id));
                    if (first) setActiveId(first.id);
                },
                { rootMargin: '-80px 0px -65% 0px', threshold: 0 }
            );
            tocItems.forEach(({ id }) => {
                const el = document.getElementById(id);
                if (el) observerRef.current?.observe(el);
            });
        });

        return () => {
            cancelAnimationFrame(rafRef.current);
            observerRef.current?.disconnect();
        };
    }, [tocItems]);

    // Instant scroll — no smooth animation
    const scrollToHeading = useCallback((id: string) => {
        const el = document.getElementById(id);
        if (!el) return;
        window.scrollTo({ top: el.getBoundingClientRect().top + window.pageYOffset - 100 });
        setActiveId(id);
    }, []);

    const handleShare = useCallback(() => {
        if (navigator.share) {
            navigator.share({ title: article.title, text: article.short_desc ?? article.title, url: window.location.href });
        } else {
            navigator.clipboard.writeText(window.location.href);
        }
    }, [article.title, article.short_desc]);

    return (
        <div className="min-h-screen bg-white font-sans">
            <div className="max-w-8xl mx-auto px-2 sm:px-4 lg:px-8">

                {/* Mobile TOC */}
                {tocItems.length > 0 && (
                    <div className="lg:hidden mb-4 relative z-10 px-2 pt-4">
                        <button
                            onClick={() => setTocOpen(v => !v)}
                            className="flex items-center justify-between w-full bg-white border border-gray-200 rounded-lg px-4 py-3 text-sm font-semibold text-gray-800"
                        >
                            <span className="flex items-center gap-2">
                                <List className="w-4 h-4 text-[var(--colour-fsP2)]" />
                                Table of Contents
                            </span>
                            <span className="text-[11px] font-medium text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">{tocItems.length}</span>
                        </button>
                        {tocOpen && (
                            <div className="absolute top-full left-2 right-2 mt-1 bg-white border border-gray-200 shadow-md rounded-lg p-2 max-h-[55vh] overflow-y-auto">
                                <nav className="flex flex-col gap-0.5">
                                    {tocItems.map((item) => (
                                        <button
                                            key={item.id}
                                            onClick={() => { scrollToHeading(item.id); setTocOpen(false); }}
                                            className={`text-left text-[13px] py-2 px-3 rounded-md ${item.level === 3 ? 'pl-6' : ''} ${
                                                activeId === item.id
                                                    ? 'text-[var(--colour-fsP1)] font-semibold'
                                                    : 'text-gray-600 hover:text-gray-900'
                                            }`}
                                        >
                                            {item.text}
                                        </button>
                                    ))}
                                </nav>
                            </div>
                        )}
                    </div>
                )}

                {/* 3-Column Layout */}
                <div className="flex flex-col lg:flex-row gap-3 pb-16">

                    {/* Left: Sticky TOC */}
                    {tocItems.length > 0 && (
                        <aside className="hidden lg:block w-[260px] shrink-0">
                            <div className="sticky top-28 pb-1">
                                <p className="text-[11px] font-bold text-[var(--colour-fsP2)] uppercase tracking-widest mb-3 px-1">
                                    Contents
                                </p>
                                <nav ref={navRef} className="flex flex-col overflow-y-auto max-h-[calc(100vh-130px)] custom-scrollbar">
                                    {tocItems.map((item, idx) => (
                                        <button
                                            key={item.id}
                                            data-id={item.id}
                                            onClick={() => scrollToHeading(item.id)}
                                            className={`group flex items-start gap-2 text-left py-1.5 px-2 border-l-2 leading-snug ${
                                                item.level === 3 ? 'ml-3' : ''
                                            } ${
                                                activeId === item.id
                                                    ? 'border-[var(--colour-fsP1)] text-[var(--colour-fsP1)] font-semibold'
                                                    : 'border-transparent text-gray-500 hover:text-gray-800 hover:border-gray-300'
                                            }`}
                                        >
                                            <span className={`shrink-0 text-[10px] font-bold mt-0.5 w-4 text-right ${activeId === item.id ? 'text-[var(--colour-fsP1)]' : 'text-gray-300 group-hover:text-gray-400'}`}>
                                                {idx + 1}
                                            </span>
                                            <span className="text-[12px]">{item.text}</span>
                                        </button>
                                    ))}
                                </nav>
                            </div>
                        </aside>
                    )}

                    {/* Center: Article */}
                    <main className="flex-1 min-w-0">
                        <nav className="flex items-center font-semibold gap-1.5 text-sm py-4 overflow-x-auto scrollbar-hide px-1" aria-label="Breadcrumb">
                            <Link href="/" className="text-[var(--colour-fsP2)] hover:text-[var(--colour-fsP1)] whitespace-nowrap transition-colors">Home</Link>
                            <ChevronRight className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                            <Link href="/blogs" className="text-[var(--colour-fsP2)] hover:text-[var(--colour-fsP1)] whitespace-nowrap transition-colors">Blog</Link>
                            {article.category?.title && (
                                <>
                                    <ChevronRight className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                                    <Link href={`/blogs?category=${article.category.slug}`} className="text-[var(--colour-fsP2)] hover:text-[var(--colour-fsP1)] whitespace-nowrap transition-colors">
                                        {article.category.title}
                                    </Link>
                                </>
                            )}
                            <ChevronRight className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                            <span className="text-slate-700 truncate max-w-[180px] sm:max-w-[320px]">{article.title}</span>
                        </nav>

                        <header className="mb-6 px-1 sm:px-0">
                            {article.category?.title && (
                                <div className="flex justify-center mb-3">
                                    <Link
                                        href={`/blogs?category=${article.category.slug}`}
                                        className="inline-block bg-[var(--colour-fsP1)]/10 text-[var(--colour-fsP1)] px-3 py-0.5 rounded-full text-[10px] font-bold tracking-widest uppercase hover:bg-[var(--colour-fsP1)]/20 transition-colors"
                                    >
                                        {article.category.title}
                                    </Link>
                                </div>
                            )}

                            <h1 className="text-2xl lg:text-[1.75rem] font-extrabold text-center text-gray-900 leading-tight tracking-tight mb-4">
                                {article.title}
                            </h1>

                            <div className="flex flex-wrap items-center justify-center gap-3 text-[11px] text-gray-500 mb-5">
                                <div className="flex items-center gap-1.5">
                                    <div className="w-5 h-5 rounded-full bg-[var(--colour-fsP1)] flex items-center justify-center">
                                        <User className="w-2.5 h-2.5 text-white" />
                                    </div>
                                    <span className="font-semibold text-gray-700">{article.author}</span>
                                </div>
                                <span className="text-gray-200">|</span>
                                <div className="flex items-center gap-1">
                                    <Calendar className="w-3 h-3" />
                                    <span>{formatDate(article.publish_date)}</span>
                                </div>
                                <span className="text-gray-200">|</span>
                                <div className="flex items-center gap-1">
                                    <Clock className="w-3 h-3" />
                                    <span>{readTime}</span>
                                </div>
                                <button
                                    onClick={handleShare}
                                    className="flex items-center gap-1 text-[var(--colour-fsP2)] hover:text-[var(--colour-fsP1)] transition-colors"
                                    aria-label="Share article"
                                >
                                    <Share2 className="w-3 h-3" />
                                    <span>Share</span>
                                </button>
                            </div>

                            <div className="relative w-full aspect-video rounded-lg overflow-hidden bg-gray-100 border border-gray-100">
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

                        <article className="bg-white rounded-lg border border-gray-100 p-4 sm:p-6 md:p-8">
                            <ParsedContent description={article.content} />
                        </article>
                    </main>

                    {/* Right: Sidebar */}
                    <aside className="w-full lg:w-72 shrink-0 sm:pt-6 space-y-6">
                        <LazySection
                            fetcher={cameraDealsFetcher}
                            render={(data) => {
                                const products = (data as any)?.products ?? (Array.isArray(data) ? data : []).slice(0, 8);
                                return <ProductDeals products={products} title="Camera Deals" slug="dslr-camera-price-in-nepal" />;
                            }}
                            fallback={<div className="h-[500px] w-full bg-gray-100 rounded-lg animate-pulse" />}
                        />
                    </aside>
                </div>
            </div>

            {/* Full-width sections */}
            <div className="max-w-8xl mx-auto px-2 sm:px-4 lg:px-8 space-y-6 pb-16">

                {relatedArticles.length > 0 && (
                    <LazySection fallback={<div className="h-[220px] bg-gray-100 rounded-lg animate-pulse" />}>
                        <section>
                            <SectionHeader
                                title="Related Articles"
                                accentColor="var(--colour-fsP2)"
                                linkHref={`/blogs?category=${article.category?.slug}`}
                                linkText="More"
                            />
                            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                                {relatedArticles.map((post) => (
                                    <BlogCard key={post.id} post={post} />
                                ))}
                            </div>
                        </section>
                    </LazySection>
                )}

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

                {article.category?.id && (
                    <LazySection>
                        <section>
                            <SectionHeader
                                title={`${article.category?.title ?? 'Related'} Products`}
                                accentColor="var(--colour-fsP2)"
                                linkHref="/products"
                            />
                            <BlogProductBasket
                                title={article.category?.title ?? 'Products'}
                                slug={article.category?.slug ?? ''}
                                id={String(article.category?.id ?? '')}
                            />
                        </section>
                    </LazySection>
                )}

                {bannerData && (
                    <LazySection>
                        <section><HeroBanner data={bannerData} /></section>
                    </LazySection>
                )}

                {dealProducts.length >= 2 && (
                    <LazySection>
                        <section><BlogCompareProducts products={dealProducts} /></section>
                    </LazySection>
                )}
            </div>
        </div>
    );
}
