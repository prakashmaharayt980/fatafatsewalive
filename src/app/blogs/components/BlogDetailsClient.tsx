'use client';

import React, { useMemo, useState, useEffect, useRef, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import parse from 'html-react-parser';
import { ChevronRight, Clock, User, Calendar, List, ArrowUpRight, BookOpen } from 'lucide-react';

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



    return (
        <div className="min-h-screen bg-gray-50 font-sans">



            {/* ═══ Single Container ═══ */}
            <div className="max-w-8xl mx-auto px-2 sm:px-4 lg:px-8">

                {/* Breadcrumb */}


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
                            <div className="prose prose-lg prose-neutral max-w-none
                                text-[var(--colour-text2)]
                                leading-relaxed
                                prose-headings:font-bold prose-headings:text-[var(--colour-text2)] prose-headings:tracking-tight
                                prose-h2:text-xl prose-h2:mt-8 prose-h2:mb-3 prose-h2:border-l-4 prose-h2:border-[var(--colour-fsP1)] prose-h2:pl-3
                                prose-h3:text-lg prose-h3:mt-6 prose-h3:mb-2
                                prose-p:text-[15px] prose-p:leading-[1.8] prose-p:mb-4 prose-p:text-[var(--colour-text2)]
                                prose-a:text-[var(--colour-fsP2)] prose-a:font-semibold prose-a:no-underline hover:prose-a:underline
                                prose-img:rounded-lg prose-img:border prose-img:border-gray-100
                                prose-strong:text-[var(--colour-text2)] prose-strong:font-bold
                                prose-ul:text-[14px] prose-ol:text-[14px]
                                prose-li:mb-1 prose-li:text-[var(--colour-text2)]
                                prose-blockquote:border-l-[var(--colour-fsP1)] prose-blockquote:bg-gray-50 prose-blockquote:rounded-r-lg prose-blockquote:py-1 prose-blockquote:px-4
                                prose-table:text-[13px]
                                prose-th:bg-gray-50 prose-th:text-[var(--colour-text2)]
                                prose-td:border-gray-100 prose-th:border-gray-100
                                prose-code:text-[var(--colour-fsP2)] prose-code:bg-gray-50 prose-code:px-1 prose-code:rounded
                            ">
                                <div className="min-h-[200px]">
                                    <ParsedContent description={article.content} className="" />
                                </div>
                            </div>
                        </article>

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


                {/* ─── More from Author ─── */}
                {authorArticles.length > 0 && (
                    <LazyLoadSection>
                        <section>
                            <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-2.5">
                                    <div className="w-1 h-6 bg-[var(--colour-fsP1)] rounded-full" />
                                    <h2 className="text-base sm:text-lg font-bold text-[var(--colour-text2)]">More from {article.author}</h2>
                                </div>
                                <Link href="/blogs" className="text-xs font-semibold text-[var(--colour-fsP2)] hover:text-[var(--colour-fsP1)] transition-colors flex items-center gap-1">
                                    View All <span className="text-sm">→</span>
                                </Link>
                            </div>
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
                            <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-2.5">
                                    <div className="w-1 h-6 bg-[var(--colour-fsP2)] rounded-full" />
                                    <h2 className="text-base sm:text-lg font-bold text-[var(--colour-text2)]">{article.category?.title || 'Related'} Products</h2>
                                </div>
                                <Link href={`/products`} className="text-xs font-semibold text-[var(--colour-fsP2)] hover:text-[var(--colour-fsP1)] transition-colors flex items-center gap-1">
                                    View All <span className="text-sm">→</span>
                                </Link>
                            </div>
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
                        <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2.5">
                                <div className="w-1 h-6 bg-red-500 rounded-full" />
                                <h2 className="text-base sm:text-lg font-bold text-[var(--colour-text2)]">YouTube Content</h2>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5">
                            {[
                                { id: 'dQw4w9WgXcQ', title: 'Samsung Galaxy S25 Ultra Review: The Best Phone of 2026?', channel: 'Fatafat Sewa', views: '45K', date: '2 days ago', category: 'Smartphone' },
                                { id: 'ScMzIvxBSi4', title: 'iPhone 17 Pro Max vs Galaxy S25 Ultra Camera Test', channel: 'Fatafat Sewa', views: '32K', date: '5 days ago', category: 'Comparison' },
                                { id: '2Vv-BfVoq4g', title: 'Top 5 Budget Laptops Under Rs. 80,000 in Nepal', channel: 'Fatafat Sewa', views: '28K', date: '1 week ago', category: 'Laptops' },
                                { id: 'jNQXAC9IVRw', title: 'Best TWS Earbuds Under Rs. 5000 — Ranked!', channel: 'Fatafat Sewa', views: '19K', date: '3 days ago', category: 'Audio' },
                            ].map((video, idx) => (
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
