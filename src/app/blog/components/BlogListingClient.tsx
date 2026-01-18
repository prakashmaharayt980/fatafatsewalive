'use client';

import React, { useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import useSWR from 'swr';
import BlogSidebar from './BlogSidebar';
import { Article } from '../../types/Blogtypes';
import { formatDate, stripHtml } from '../../CommonVue/datetime';
import imglogo from '../../assets/logoimg.png';
import Imgbanner from '../../homepage/Imgbanner';
import TwoImageBanner from '../../homepage/Banner2';
import OfferBanner from '../../homepage/OfferBanner';
import CategoryProductStrip from './CategoryProductStrip';
import LazyLoadSection from '@/components/LazyLoadSection';
import { BannerTypes } from '../../types/BannerTypes';

interface BlogListingClientProps {
    initialArticles: Article[];
    initialBannerData: BannerTypes;
    initialBrandArticles: Article[];
}

export default function BlogListingClient({ initialArticles, initialBannerData, initialBrandArticles }: BlogListingClientProps) {

    // Filter Logic
    const [activeFilter, setActiveFilter] = React.useState('All');
    const categories = ['All', 'News', 'Reviews', 'Buying Guides', 'Deals'];

    // Main Articles Data (Hydrated from Server)
    const { data: articles } = useSWR<Article[]>('blog-full-list', null, {
        fallbackData: initialArticles,
        revalidateOnFocus: false
    });

    // Banner Data (Hydrated)
    const { data: bannerData } = useSWR<BannerTypes>('banner-data', null, {
        fallbackData: initialBannerData,
        revalidateOnFocus: false
    });

    // Brand Articles (Hydrated)
    const { data: brandArticles } = useSWR<Article[]>('blog-brands', null, {
        fallbackData: initialBrandArticles,
        revalidateOnFocus: false
    });

    const filteredArticles = useMemo(() => {
        if (!articles) return [];
        if (activeFilter === 'All') return articles;
        return articles.filter(a => a.category?.title?.includes(activeFilter) || a.category?.slug?.includes(activeFilter.toLowerCase()));
    }, [articles, activeFilter]);

    const featuredPost = useMemo(() => filteredArticles?.[0], [filteredArticles]);
    const secondaryPost = useMemo(() => filteredArticles?.[1], [filteredArticles]);
    const gridPosts = useMemo(() => filteredArticles?.slice(2) || [], [filteredArticles]);

    return (
        <div className="min-h-screen bg-[#F9FAFB] font-sans selection:bg-blue-100 selection:text-blue-900 pb-20">

            {/* Banner Section - Full Width */}
            <div className="pt-8 px-2 md:px-4 max-w-[1600px] mx-auto mb-8">
                <Imgbanner
                    mainBanner={bannerData?.data?.[0]}
                    sideBanner={bannerData?.data?.[1]}
                />
            </div>

            {/* Category Filter Bar */}
            <div className="container mx-auto px-4 md:px-6 lg:px-8 max-w-[1600px] mb-8">
                <div className="flex flex-wrap gap-2 md:gap-4 border-b border-gray-100 pb-4">
                    {categories.map((cat) => (
                        <button
                            key={cat}
                            onClick={() => setActiveFilter(cat)}
                            className={`px-4 py-2 rounded-full text-sm font-bold transition-all duration-200 ${activeFilter === cat
                                ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30'
                                : 'bg-white text-gray-500 hover:bg-gray-50 hover:text-gray-900 border border-gray-100'
                                }`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>
            </div>

            <div className="container mx-auto px-4 md:px-6 lg:px-8 max-w-[1600px]">
                <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">

                    {/* Main Content (Articles) */}
                    <div className="lg:w-3/4 space-y-12">

                        {/* Featured Article - Large Card */}
                        {featuredPost && (
                            <Link href={`/blog/${featuredPost.slug}`} className="group block">
                                <article className="bg-white rounded-3xl overflow-hidden shadow-[0_10px_30px_rgba(0,0,0,0.04)] border border-gray-100 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
                                    <div className="relative aspect-[16/9] w-full bg-gray-100 overflow-hidden">
                                        <Image
                                            src={featuredPost.thumbnail_image?.full || imglogo.src}
                                            alt={featuredPost.title}
                                            fill
                                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 75vw, 66vw"
                                            className="object-cover transition-transform duration-700 group-hover:scale-105"
                                            priority
                                        />
                                        <div className="absolute top-4 left-4 bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide">
                                            {featuredPost.category?.title || 'Featured'}
                                        </div>
                                    </div>
                                    <div className="p-6 md:p-8">
                                        <div className="flex items-center gap-3 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                                            <span>{featuredPost.author}</span>
                                            <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                                            <span>{formatDate(featuredPost.publish_date)}</span>
                                        </div>
                                        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4 font-heading group-hover:text-blue-600 transition-colors">
                                            {featuredPost.title}
                                        </h2>
                                        <p className="text-gray-500 line-clamp-3 leading-relaxed mb-4">
                                            {featuredPost.short_desc || stripHtml(featuredPost.content)}
                                        </p>
                                        <span className="inline-flex items-center text-blue-600 font-bold hover:underline">
                                            Read Review
                                            <svg className="w-4 h-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                                        </span>
                                    </div>
                                </article>
                            </Link>
                        )}

                        {/* Recent Posts - Mixed Layout */}
                        <div className="space-y-8">
                            <h3 className="text-xl font-bold text-gray-900 border-l-4 border-blue-600 pl-3">Latest News</h3>

                            {/* Index 1: Secondary Full Width Post */}
                            {secondaryPost && (
                                <Link href={`/blog/${secondaryPost.slug}`} className="group relative block bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-md transition-all">
                                    <div className="flex flex-col md:flex-row h-full">
                                        <div className="md:w-1/2 relative min-h-[240px] md:min-h-[300px]">
                                            <Image
                                                src={secondaryPost.thumbnail_image?.full || imglogo.src}
                                                alt={secondaryPost.title}
                                                fill
                                                sizes="(max-width: 768px) 100vw, 50vw"
                                                className="object-cover transition-transform duration-500 group-hover:scale-105"
                                            />
                                        </div>
                                        <div className="md:w-1/2 p-6 md:p-8 flex flex-col justify-center">
                                            <div className="text-sm font-bold text-blue-600 uppercase mb-3">{secondaryPost.category?.title}</div>
                                            <h4 className="text-2xl font-bold text-gray-900 mb-3 font-heading leading-tight group-hover:text-blue-600 transition-colors">
                                                {secondaryPost.title}
                                            </h4>
                                            <p className="text-gray-500 text-base line-clamp-3 mb-4 leading-relaxed">
                                                {secondaryPost.short_desc || stripHtml(secondaryPost.content)}
                                            </p>
                                            <span className="text-sm text-gray-400 font-medium">{formatDate(secondaryPost.publish_date)}</span>
                                        </div>
                                    </div>
                                </Link>
                            )}

                            {/* Index 2+: Grid Layout (Col-2) */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
                                {gridPosts.map((post) => (
                                    <Link href={`/blog/${post.slug}`} key={post.id} className="group flex flex-col bg-white rounded-2xl border border-gray-100 shadow-[0_4px_20px_rgba(0,0,0,0.02)] hover:shadow-[0_10px_40px_rgba(0,0,0,0.08)] transition-all hover:-translate-y-1 h-full">
                                        <div className="relative w-full aspect-[4/3] overflow-hidden rounded-t-2xl bg-gray-100">
                                            <Image
                                                src={post.thumbnail_image?.thumb || post.thumbnail_image?.full || imglogo.src}
                                                alt={post.title}
                                                fill
                                                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 33vw, 25vw"
                                                className="object-cover transition-transform duration-500 group-hover:scale-110"
                                            />
                                            <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-xl text-xs font-bold text-gray-900 uppercase shadow-sm">
                                                {post.category?.title}
                                            </div>
                                        </div>
                                        <div className="p-6 flex flex-col flex-1">
                                            <h4 className="text-xl font-bold text-gray-900 mb-3 font-heading leading-tight group-hover:text-blue-600 transition-colors line-clamp-2">
                                                {post.title}
                                            </h4>
                                            <p className="text-gray-500 text-sm line-clamp-3 mb-4 flex-1 leading-relaxed">
                                                {post.short_desc || stripHtml(post.content)}
                                            </p>
                                            <div className="flex items-center gap-3 text-xs text-gray-400 font-medium mt-auto">
                                                <span>{formatDate(post.publish_date)}</span>
                                                <span>•</span>
                                                <span>{post.author}</span>
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </div>

                        {/* Mid-Page Banner Grid */}
                        <div className="py-8">
                            <TwoImageBanner data={bannerData?.data?.[2]} />
                        </div>

                        {/* Product Strip - Smartphones */}
                        <LazyLoadSection delay={200}>
                            <CategoryProductStrip categorySlug="smartphones" categoryTitle="Smartphones" />
                        </LazyLoadSection>

                        {/* Brand Updates Section (Different Layout) */}
                        <div className="py-8">
                            <LazyLoadSection delay={200}>
                                <div className="flex items-center justify-between mb-6">
                                    <h3 className="text-xl font-bold text-gray-900">Brand Updates</h3>
                                    <Link href="#" className="text-sm font-semibold text-blue-600 hover:underline">View All</Link>
                                </div>

                                {/* Horizontal Scroll Layout for Brand Updates */}
                                <div className="flex overflow-x-auto gap-4 pb-4 scrollbar-hide snap-x snap-mandatory">
                                    {brandArticles?.map((post) => (
                                        <Link href={`/blog/${post.slug}`} key={post.id} className="min-w-[260px] md:min-w-[300px] snap-center group relative rounded-2xl overflow-hidden aspect-[4/5]">
                                            <Image
                                                src={post.thumbnail_image?.full || imglogo.src}
                                                alt={post.title}
                                                fill
                                                sizes="(max-width: 768px) 50vw, 20vw"
                                                className="object-cover transition-transform duration-700 group-hover:scale-110"
                                            />
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent p-6 flex flex-col justify-end">
                                                <span className="inline-block bg-blue-600 text-white text-[10px] font-bold px-2 py-1 rounded max-w-fit mb-2">
                                                    {post.category?.title}
                                                </span>
                                                <h4 className="text-lg font-bold text-white leading-tight mb-2 group-hover:text-blue-300 transition-colors">
                                                    {post.title}
                                                </h4>
                                                <p className="text-gray-300 text-xs line-clamp-2">
                                                    {formatDate(post.publish_date)}
                                                </p>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            </LazyLoadSection>
                        </div>

                        {/* Deal/Offer Banner */}
                        <div className="py-8">
                            <OfferBanner />
                        </div>

                    </div>

                    {/* Right Sidebar */}
                    <aside className="w-full lg:w-1/4 mt-8 lg:mt-0">
                        <BlogSidebar />
                    </aside>
                </div>
            </div>
        </div >
    );
}
