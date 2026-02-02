'use client';

import React, { useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import useSWR from 'swr';
import BlogSidebar from './BlogSidebar';
import { Article } from '../../types/Blogtypes';
import { formatDate, stripHtml } from '../../CommonVue/datetime';
import imglogo from '../../assets/logoimg.png';

import TwoImageBanner from '../../homepage/Banner2';
import OfferBanner from '../../homepage/OfferBanner';
import CategoryProductStrip from './CategoryProductStrip';
import LazyLoadSection from '@/components/LazyLoadSection';
import { BannerTypes } from '../../types/BannerTypes';

interface BlogListingClientProps {
    initialArticles: Article[];
    initialBannerData: BannerTypes;
    initialBrandArticles: Article[];
    categories: any[];
}

export default function BlogListingClient({ initialArticles, initialBannerData, initialBrandArticles, categories }: BlogListingClientProps) {

    // Filter Logic
    const [activeFilter, setActiveFilter] = React.useState('All');


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
        return articles.filter(a => a.category?.title === activeFilter || a.category?.slug === activeFilter.toLowerCase());
    }, [articles, activeFilter]);

    return (
        <div className="min-h-screen bg-[#F9FAFB] font-sans selection:bg-blue-100 selection:text-blue-900 pb-20">
            <div className="container mx-auto px-4 md:px-6 lg:px-8 max-w-[1600px] pt-8">

                <h1 className="text-3xl font-bold text-gray-900 mb-6 font-heading">Latest Tech Insights</h1>

                {/* Filter Bar - Modern & Sticky */}
                <div className="sticky top-20 z-10 bg-[#F9FAFB]/95 backdrop-blur-sm py-4 mb-6 border-b border-gray-200">
                    <div className="flex flex-wrap items-center gap-3">
                        {categories.map((cat) => (
                            <button
                                key={cat.id}
                                onClick={() => setActiveFilter(cat.title)}
                                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-300 border ${activeFilter === cat.title
                                    ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                                    : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                                    }`}
                            >
                                {cat.title}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="flex flex-col lg:flex-row gap-8 lg:gap-10">

                    {/* Main Content (Articles) */}
                    <div className="lg:w-3/4 space-y-8">

                        {/* Layout: Compact Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filteredArticles?.map((post) => (
                                <Link href={`/blogs/${post.slug}`} key={post.id} className="group bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-300 flex flex-col h-full hover:border-blue-200">
                                    <div className="relative aspect-[16/10] w-full bg-gray-100 overflow-hidden">
                                        <Image
                                            src={post.thumbnail_image?.full || imglogo.src}
                                            alt={post.title}
                                            fill
                                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                            className="object-cover transition-transform duration-500 group-hover:scale-105"
                                            quality={75}
                                        />
                                        <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-md px-2.5 py-1 rounded-md text-[10px] font-bold text-gray-900 uppercase tracking-widest border border-gray-100/50 shadow-sm">
                                            {post.category?.title}
                                        </div>
                                    </div>
                                    <div className="p-5 flex flex-col flex-1">
                                        <div className="flex items-center gap-2 text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-2">
                                            <span>{formatDate(post.publish_date)}</span>
                                            <span className="w-0.5 h-3 bg-gray-300"></span>
                                            <span>{post.author}</span>
                                        </div>
                                        <h3 className="text-lg font-bold text-gray-900 mb-2 font-heading leading-snug group-hover:text-blue-600 transition-colors line-clamp-2">
                                            {post.title}
                                        </h3>
                                        <p className="text-gray-500 text-sm line-clamp-2 leading-relaxed mb-4 flex-1">
                                            {post.short_desc || stripHtml(post.content)}
                                        </p>
                                        <div className="mt-auto pt-4 border-t border-gray-50 flex items-center justify-between text-xs font-medium">
                                            <span className="text-gray-400">Read more</span>
                                            <span className="text-blue-600 group-hover:underline">&rarr;</span>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>

                        {filteredArticles?.length === 0 && (
                            <div className="text-center py-20 bg-white rounded-xl border border-dashed border-gray-300">
                                <p className="text-gray-500 text-lg">No articles found in this category.</p>
                                <button onClick={() => setActiveFilter('All')} className="text-blue-600 font-bold mt-2 hover:underline">View All Articles</button>
                            </div>
                        )}

                        {/* Mid-Page Banner (Compacted) */}
                        <div className="py-4">
                            <TwoImageBanner data={bannerData?.data?.[2]} />
                        </div>

                        {/* Brand Updates (Compacted) */}
                        <LazyLoadSection delay={200}>
                            <div className="flex items-center justify-between mb-4 border-b border-gray-200 pb-2">
                                <h3 className="text-lg font-bold text-gray-900">Brand Updates</h3>
                                <Link href="#" className="text-xs font-bold text-blue-600 hover:bg-blue-50 px-3 py-1 rounded-lg transition-colors">VIEW ALL</Link>
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                {brandArticles?.map((post) => (
                                    <Link href={`/blogs/${post.slug}`} key={post.id} className="group relative rounded-xl overflow-hidden aspect-[3/4] border border-gray-100 hover:shadow-md transition-all">
                                        <Image
                                            src={post.thumbnail_image?.full || imglogo.src}
                                            alt={post.title}
                                            fill
                                            sizes="(max-width: 768px) 50vw, 25vw"
                                            className="object-cover transition-transform duration-700 group-hover:scale-110"
                                            quality={70}
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent p-4 flex flex-col justify-end">
                                            <h4 className="text-sm font-bold text-white leading-tight line-clamp-2 mb-1 group-hover:text-blue-300 transition-colors">
                                                {post.title}
                                            </h4>
                                            <span className="text-xs text-gray-300">{formatDate(post.publish_date)}</span>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </LazyLoadSection>

                        {/* Product Strip */}
                        <LazyLoadSection delay={200}>
                            <div className="pt-8">
                                <CategoryProductStrip categorySlug="smartphones" categoryTitle="Explore Smartphones" />
                            </div>
                        </LazyLoadSection>

                    </div>

                    {/* Right Sidebar */}
                    <aside className="w-full lg:w-1/4">
                        <BlogSidebar />
                    </aside>
                </div>
            </div>
        </div >
    );
}
