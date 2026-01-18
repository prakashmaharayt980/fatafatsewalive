'use client';

import React, { useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import useSWR from 'swr';
import FloatingNav from './components/FloatingNav';
import BlogSidebar from './components/BlogSidebar';
import RemoteServices from '../api/remoteservice';
import { Article } from '../types/Blogtypes';
import { formatDate, stripHtml } from '../CommonVue/datetime';
import imglogo from '../assets/logoimg.png';
import Imgbanner from '../homepage/Imgbanner';
import TwoImageBanner from '../homepage/Banner2';
import OfferBanner from '../homepage/OfferBanner';
import CategoryProductStrip from './components/CategoryProductStrip';
import { BannerTypes } from '../types/BannerTypes';

const fetcher = async (): Promise<Article[]> => {
    const res = await RemoteServices.Bloglist();
    // Ensure we return an array, handling potential API response structures
    return Array.isArray(res) ? res : res.data || [];
};

export default function BlogPage() {
    const { data: articles, isLoading } = useSWR<Article[]>('blog-full-list', fetcher, {
        dedupingInterval: 60000,
    });

    // Filter Logic
    const [activeFilter, setActiveFilter] = React.useState('All');
    const categories = ['All', 'News', 'Reviews', 'Buying Guides', 'Deals'];

    const filteredArticles = useMemo(() => {
        if (!articles) return [];
        if (activeFilter === 'All') return articles;
        // Simple filter based on category title matching. Adjust if category is an object with slug.
        return articles.filter(a => a.category?.title?.includes(activeFilter) || a.category?.slug?.includes(activeFilter.toLowerCase()));
    }, [articles, activeFilter]);

    const { data: bannerData } = useSWR<BannerTypes>('banner-data', () => RemoteServices.BannerDetails().then(res => ({ data: res.data, meta: res.meta })), {
        dedupingInterval: 60000,
    });

    const featuredPost = useMemo(() => filteredArticles?.[0], [filteredArticles]);
    const recentPosts = useMemo(() => filteredArticles?.slice(1) || [], [filteredArticles]);

    if (isLoading) return <BlogSkeleton />;

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
                                            src={featuredPost.thumbnail_image?.full || imglogo}
                                            alt={featuredPost.title}
                                            fill
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

                        {/* Recent Posts - List View (Small Thumbnails) */}
                        <div className="space-y-6">
                            <h3 className="text-xl font-bold text-gray-900 border-l-4 border-blue-600 pl-3">Latest News</h3>

                            <div className="flex flex-col gap-6">
                                {recentPosts.map((post) => (
                                    <Link href={`/blog/${post.slug}`} key={post.id} className="group flex flex-col sm:flex-row gap-4 sm:gap-6 bg-white p-4 rounded-2xl border border-gray-100 shadow-[0_4px_20px_rgba(0,0,0,0.02)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.06)] transition-all hover:-translate-y-1">
                                        {/* Thumbnail */}
                                        <div className="relative w-full sm:w-48 aspect-[16/10] sm:aspect-square flex-shrink-0 rounded-xl overflow-hidden bg-gray-100">
                                            <Image
                                                src={post.thumbnail_image?.thumb || post.thumbnail_image?.full || imglogo}
                                                alt={post.title}
                                                fill
                                                className="object-cover transition-transform duration-500 group-hover:scale-110"
                                            />
                                        </div>

                                        {/* Content */}
                                        <div className="flex-1 py-1">
                                            <div className="flex items-center gap-2 text-[10px] font-bold text-blue-600 uppercase tracking-wide mb-2">
                                                <span>{post.category?.title}</span>
                                            </div>
                                            <h4 className="text-lg md:text-xl font-bold text-gray-900 mb-2 font-heading leading-tight group-hover:text-blue-600 transition-colors">
                                            </h4>
                                            <p className="text-gray-500 text-sm line-clamp-2 mb-3">
                                                {post.short_desc || stripHtml(post.content)}
                                            </p>
                                            <div className="flex items-center gap-3 text-xs text-gray-400 font-medium">
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
                        <CategoryProductStrip categorySlug="smartphones" categoryTitle="Smartphones" />

                        {/* Deal/Offer Banner */}
                        <div className="py-8">
                            <OfferBanner />
                        </div>

                    </div>

                    {/* Right Sidebar */}
                    <aside className="lg:w-1/4">
                        <BlogSidebar />
                    </aside>
                </div>
            </div>
        </div >
    );
}

const BlogSkeleton = () => (
    <div className="min-h-screen bg-[#F9FAFB] pb-20">
        <div className="h-24 bg-white/50 mb-12"></div>
        <div className="container mx-auto px-4 max-w-7xl animate-pulse">
            <div className="h-12 w-64 bg-gray-200 rounded-full mx-auto mb-12"></div>
            <div className="flex flex-col lg:flex-row gap-12">
                <div className="lg:w-2/3 space-y-8">
                    <div className="aspect-[16/9] w-full bg-gray-200 rounded-3xl"></div>
                    <div className="space-y-4">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="h-32 w-full bg-gray-200 rounded-2xl"></div>
                        ))}
                    </div>
                </div>
                <div className="lg:w-1/3 h-96 bg-gray-200 rounded-3xl"></div>
            </div>
        </div>
    </div>
);
