'use client';

import React, { useMemo } from 'react';
import useSWR from 'swr';
import parse from 'html-react-parser';
import { notFound, useParams } from 'next/navigation';
import FloatingNav from '../components/FloatingNav';
import ReadingProgress from '../components/ReadingProgress';
import HeroSection from '../components/HeroSection';
import VerdictBox from '../components/VerdictBox';
import BlogSidebar from '../components/BlogSidebar';
import RemoteServices from '../../api/remoteservice';
import { Article } from '../../types/Blogtypes';
import { ProductDetails } from '../../types/ProductDetailsTypes';
import { formatDate } from '../../CommonVue/datetime';
import imglogo from '../../assets/logoimg.png';
import PriceSpecCard from '../components/PriceSpecCard';

// Fetcher to get the full list (same as listing page to ensure cache hit)
const fetcher = async (): Promise<Article[]> => {
    const res = await RemoteServices.Bloglist();
    return Array.isArray(res) ? res : res.data || [];
};

export default function BlogPostPage() {
    const params = useParams();
    const slug = params?.slug as string;

    // 1. Fetch the list (should be fast/cached)
    const { data: articles, isLoading } = useSWR<Article[]>('blog-full-list', fetcher, {
        dedupingInterval: 60000,
    });

    // 2. Find the article by slug
    const article = useMemo(() => {
        if (!articles || !slug) return null;
        return articles.find((a) => a.slug === slug);
    }, [articles, slug]);

    // 3. Fetch related product (based on category)
    const { data: relatedProducts } = useSWR<ProductDetails[]>(
        article?.category?.title ? ['product-related', article.category.title] : null,
        () => RemoteServices.SerachProducts(article!.category!.title).then(res => res.data || []),
        { dedupingInterval: 60000 }
    );

    const relatedProduct = useMemo(() => relatedProducts?.[0], [relatedProducts]);

    if (isLoading) return <DetailSkeleton />;
    if (!article && !isLoading) return notFound();

    // Helper to safely get image
    const heroImage = article?.thumbnail_image?.full || imglogo.src;

    return (
        <div className="min-h-screen bg-[#F9FAFB] font-sans selection:bg-blue-100 selection:text-blue-900 pb-20">
            <ReadingProgress />
            {/* Spacer for fixed nav */}
            <div className="h-8"></div>

            <HeroSection
                title={article!.title}
                image={heroImage}
                category={article!.category?.title || 'Review'}
                date={formatDate(article!.publish_date)}
                author={article!.author}
                readTime="5 min read" // Placeholder or calc from content length
            />

            <div className="container mx-auto px-4 md:px-6 lg:px-8 max-w-7xl">
                <div className="flex flex-col lg:flex-row gap-12 lg:gap-16">
                    {/* Main Content Column */}
                    <div className="lg:w-2/3">

                        {/* Verdict Box - Only show if we had structured data for it, 
                for now we can't reliably extract it from raw HTML content unless verified 
                so we keep it as a placeholder or remove it if data is missing.
                Demonstrating usage if we had a short_desc used as a 'quick take' */}
                        {article!.short_desc && (
                            <VerdictBox
                                verdict="Buy" // Contextually hard for now without specific data field
                                summary={article!.short_desc}
                            />
                        )}

                        <div className="prose prose-lg prose-blue max-w-none text-gray-700 leading-loose prose-imgs:rounded-2xl prose-headings:font-heading prose-headings:font-bold prose-headings:text-gray-900">
                            {/* Content Rendering */}
                            {parse(article!.content)}
                        </div>

                        {/* Disclaimer / Tags could go here */}
                        <div className="mt-12 pt-8 border-t border-gray-100">
                            <p className="text-sm text-gray-400 italic">
                                Published on {formatDate(article!.publish_date)} by {article!.author}
                            </p>
                        </div>
                    </div>

                    {/* Sidebar Column (GadgetByte Style) */}
                    <aside className="lg:w-1/3 hidden lg:block h-fit sticky top-24">
                        {relatedProduct ? (
                            <PriceSpecCard product={relatedProduct} />
                        ) : (
                            <BlogSidebar />
                        )}
                    </aside>
                </div>
            </div>
        </div>
    );
}

const DetailSkeleton = () => (
    <div className="min-h-screen bg-[#F9FAFB] pb-20">
        <div className="h-96 bg-gray-200 animate-pulse mb-12"></div>
        <div className="container mx-auto px-4 max-w-7xl flex gap-12">
            <div className="w-2/3 space-y-6">
                <div className="h-8 w-3/4 bg-gray-200 rounded animate-pulse"></div>
                <div className="h-4 w-full bg-gray-200 rounded animate-pulse"></div>
                <div className="h-4 w-full bg-gray-200 rounded animate-pulse"></div>
                <div className="h-4 w-5/6 bg-gray-200 rounded animate-pulse"></div>
            </div>
            <div className="w-1/3 h-64 bg-gray-200 rounded animate-pulse"></div>
        </div>
    </div>
)
