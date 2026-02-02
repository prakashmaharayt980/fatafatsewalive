'use client';

import React from 'react';
import parse from 'html-react-parser';
import ReadingProgress from '../components/ReadingProgress';
import HeroSection from '../components/HeroSection';
import LazyLoadSection from '@/components/LazyLoadSection';
import VerdictBox from '../components/VerdictBox';
import BlogSidebar from '../components/BlogSidebar';
import PriceSpecCard from '../components/PriceSpecCard';
import { Article } from '../../types/Blogtypes';
import { ProductDetails } from '../../types/ProductDetailsTypes';
import { formatDate } from '../../CommonVue/datetime';
import imglogo from '../../assets/logoimg.png';

interface BlogDetailsClientProps {
    article: Article;
    relatedProduct?: ProductDetails;
}

export default function BlogDetailsClient({ article, relatedProduct }: BlogDetailsClientProps) {
    if (!article) return null;

    // Helper to safely get image
    const heroImage = article?.thumbnail_image?.full || imglogo.src;

    return (
        <div className="min-h-screen bg-[#F9FAFB] font-sans selection:bg-blue-100 selection:text-blue-900 pb-20">
            <ReadingProgress />
            {/* Spacer for fixed nav */}
            <div className="h-8"></div>

            <HeroSection
                title={article.title}
                image={heroImage}
                category={article.category?.title || 'Review'}
                date={formatDate(article.publish_date)}
                author={article.author}
                readTime="5 min read" // Placeholder or calc from content length
            />

            <div className="container mx-auto px-4 md:px-6 lg:px-8 max-w-7xl">
                <div className="flex flex-col lg:flex-row gap-12 lg:gap-16">
                    {/* Main Content Column */}
                    <div className="lg:w-2/3">

                        {/* Verdict Box */}
                        {article.short_desc && (
                            <VerdictBox
                                verdict="Buy"
                                summary={article.short_desc}
                            />
                        )}

                        <div className="prose prose-lg prose-blue max-w-none text-gray-700 leading-loose prose-imgs:rounded-2xl prose-headings:font-heading prose-headings:font-bold prose-headings:text-gray-900">
                            {/* Content Rendering */}
                            {parse(article.content)}
                        </div>

                        {/* Disclaimer / Tags could go here */}
                        <div className="mt-12 pt-8 border-t border-gray-100">
                            <p className="text-sm text-gray-400 italic">
                                Published on {formatDate(article.publish_date)} by {article.author}
                            </p>
                        </div>
                    </div>

                    {/* Sidebar Column (GadgetByte Style) - Visible on all devices */}
                    <aside className="w-full lg:w-1/3 h-fit lg:sticky lg:top-24 mt-8 lg:mt-0">
                        <LazyLoadSection delay={100}>
                            {relatedProduct ? (
                                <PriceSpecCard product={relatedProduct} />
                            ) : (
                                <BlogSidebar />
                            )}
                        </LazyLoadSection>
                    </aside>
                </div>
            </div>
        </div>
    );
}
