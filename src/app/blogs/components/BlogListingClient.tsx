'use client';

import React, { useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import useSWR from 'swr';
import { Article } from '../../types/Blogtypes';
import { formatDate, stripHtml } from '../../CommonVue/datetime';
import imglogo from '../../assets/logoimg.png';

import TwoImageBanner from '../../homepage/Banner2';
import CategoryProductStrip from './CategoryProductStrip';
import LazyLoadSection from '@/components/LazyLoadSection';
import { BannerTypes } from '../../types/BannerTypes';
import HeroBanner from './HeroBanner';
import BlogSidebar from './BlogSidebar';
import { Button } from '@/components/ui/button';
import BlogCard from './BlogCard';
import BannerFetcher from '@/app/components/BannerFetcher';
import CompareWidget from './CompareWidget';
import ProductDeals from './ProductDeals';
import BasketCard from '@/app/homepage/BasketCard';
import RelatedProducts from '@/app/products/[slug]/RelatedProducts';
import ProductWidget from './widgets/ProductWidget';
import BlogProductBasket from './BlogProductBasket';


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
        <div className="min-h-screen container mx-auto  bg-gray-50 font-sans selection:bg-[var(--colour-fsP2)]/10 selection:text-[var(--colour-fsP2)] w-full ">
            <div className=" w-full px-1 lg:px-2  pt-4">

                {/* Hero Banner */}
                <HeroBanner data={bannerData?.data?.[0]} />

                {/* Category Filter Bar - Sticky */}
                <div className="sticky top-20 z-10 bg-gray-50/95 backdrop-blur-sm py-5 mb-2 border-y border-gray-200">
                    <div className="flex flex-wrap items-center gap-3">
                        {categories.map((cat) => (
                            <Button
                                key={cat.id}
                                onClick={() => setActiveFilter(cat.title)}
                                className={` rounded text-sm font-bold transition-all duration-300 border ${activeFilter === cat.title
                                    ? 'bg-[var(--colour-fsP2)] text-white border-[var(--colour-fsP2)] shadow-md shadow-[var(--colour-fsP2)]/20'
                                    : 'bg-white text-gray-700 border-gray-200 hover:border-[var(--colour-fsP2)]/30 hover:bg-[var(--colour-fsP2)]/5'
                                    }`}
                            >
                                {cat.title}
                            </Button>
                        ))}
                    </div>
                </div>

                {/* Main Content Area with Sidebar */}
                <div className="flex flex-col lg:flex-row ">

                    {/* Main Blog Grid - 3/4 Width */}
                    <div className=" w-full space-y-12">

                        {/* Blog Articles Grid */}
                        <section id="blog-articles">


                            <div className='w-full flex gap-3 '>
                                <div className='w-3/4'>
                                    <div className="flex items-center justify-between mb-2">
                                        <h2 className="text-lg sm:text-xl md:text-2xl font-heading  text-[var(--colour-fsP2)]">
                                            {activeFilter === 'All' ? 'Latest Articles' : activeFilter}
                                        </h2>
                                        <span className="text-sm font-heading text-gray-500">
                                            {filteredArticles?.length} {filteredArticles?.length === 1 ? 'Article' : 'Articles'}
                                        </span>
                                    </div>
                                    <div className=" grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 shadow-xs">
                                        {filteredArticles?.length > 0 && (
                                            filteredArticles.map((post) => (
                                                <BlogCard key={post.id} post={post} />
                                            ))
                                        )}
                                    </div>
                                </div>
                                <div className="hidden lg:block  w-1/4 ">
                                    <ProductDeals />
                                </div>
                            </div>
                        </section>
                        <section id="blog-banner">


                        </section>

                        {/* <BasketCard title={'featured products'} slug={'featured-products'} id={'1'} /> */}
                        <div className='w-full flex gap-3'>
                            <div className='w-3/4'>
                                <BlogProductBasket

                                    title={`More from `}
                                    slug={'related-category'}
                                    id={'1'}

                                />
                            </div>
                            <div className='w-1/4'>
                                <ProductWidget />
                            </div>
                        </div>

                        {/* Brand Updates */}
                        <LazyLoadSection delay={300}>
                            <section>
                                <div className="flex items-center justify-between mb-6 pb-3 border-b-2 border-[var(--colour-fsP2)]/20">
                                    <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">Brand Updates</h2>
                                    <Link href="#" className="text-sm font-bold text-[var(--colour-fsP2)] hover:underline">
                                        View All →
                                    </Link>
                                </div>

                                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 gap-4 lg:gap-6">
                                    {brandArticles?.map((post) => (
                                        <Link
                                            href={`/blogs/${post.slug}`}
                                            key={post.id}
                                            className="group relative rounded-xl overflow-hidden aspect-[3/4] border border-gray-200 hover:shadow-xl hover:shadow-[var(--colour-fsP2)]/10 transition-all hover:border-[var(--colour-fsP2)]/40"
                                        >
                                            <Image
                                                src={post.thumbnail_image?.full || imglogo.src}
                                                alt={post.title}
                                                fill
                                                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                                                className="object-cover transition-transform duration-700 group-hover:scale-110"
                                                quality={75}
                                            />
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent p-4 flex flex-col justify-end">
                                                <h4 className="text-sm sm:text-base font-bold text-white leading-tight line-clamp-2 mb-1 group-hover:text-[var(--colour-yellow1)] transition-colors">
                                                    {post.title}
                                                </h4>
                                                <span className="text-xs text-gray-300">{formatDate(post.publish_date)}</span>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            </section>
                        </LazyLoadSection>
                    </div>

                    {/* Sidebar - 1/4 Width */}
                    {/* <aside className="lg:w-1/4">
                        <BlogSidebar />
                    </aside> */}

                </div>
            </div>
        </div >
    );
}
