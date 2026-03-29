import React from 'react';
import type { Metadata } from 'next';
import BlogListingClient from './components/BlogListingClient';
import type { Article } from '../types/Blogtypes';
import { getBlogPageData } from '@/app/api/CachedHelper/getInitialData';
import { getBannerData } from '@/app/api/CachedHelper/getBannerData';
import BannerSectionServer from '@/components/BannerSectionServer';
import { getCategoryProducts } from '../api/services/category.service';
import { getBlogCategories, getBlogList } from '../api/services/blog.service';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://fatafatsewa.com';

export async function generateMetadata({ searchParams }: { searchParams: Promise<{ category?: string, q?: string }> }): Promise<Metadata> {
    const resolvedParams = await searchParams;
    const categoryName = resolvedParams.category ? resolvedParams.category.charAt(0).toUpperCase() + resolvedParams.category.slice(1).replace(/-/g, ' ') : '';
    const query = resolvedParams.q;

    let title = 'Latest Tech News, Reviews & Buying Guides | Fatafat Sewa Blog';
    if (categoryName && categoryName !== 'All') title = `${categoryName} - Tech News & Reviews | Fatafat Sewa Blog`;
    if (query) title = `Search results for "${query}" | Fatafat Sewa Blog`;

    return {
        title,
        description: 'Discover the latest technology news, in-depth product reviews, expert buying guides, and exclusive deals. Stay updated with Fatafat Sewa\'s tech community.',
        alternates: { canonical: `${SITE_URL}/blogs` },
        openGraph: {
            title,
            description: 'Your source for technology news, reviews, and expert buying guides.',
            url: `${SITE_URL}/blogs`,
            type: 'website',
        },
    };
}

import { Suspense } from 'react';

async function BlogPageContent({ searchParams }: { searchParams: Promise<{ category?: string, q?: string }> }) {
    const resolvedParams = await searchParams;
    const activeCategory = resolvedParams.category;
    const searchQuery = resolvedParams.q;

    // Fetch primary data
    const { latestArticles } = await getBlogPageData();
    const heroBannerData = await getBannerData('blog-banner-test');

    // Fetch dynamic data in parallel
    let categoriesResponse = null;
    let trendingProductsResponse = null;
    let blogListResponse = null;

    try {
        [categoriesResponse, trendingProductsResponse, blogListResponse] = await Promise.all([
            getBlogCategories(),
            getCategoryProducts('mobile-price-in-nepal', { per_page: 10, page: 1 }),
            getBlogList({
                category: activeCategory !== 'all' ? activeCategory : undefined,
                search: searchQuery || undefined,
                per_page: 30
            })
        ]);
    } catch (e) {
        console.error("Critical fetch failure in BlogPage", e);
    }

    const allArticles: Article[] = blogListResponse?.data || latestArticles || [];

    // ─── Server-Side Article Filtering ───
    const developedCategories = Array.from(
        new Map(
            (latestArticles || [])
                .filter((a: Article) => a.category)
                .map((a: Article) => [a.category.id || a.category.slug, {
                    id: a.category.id || a.category.slug,
                    title: a.category.title || (a.category as any).name,
                    slug: a.category.slug,
                    blogs_count: 0,
                    status: true
                }])
        ).values()
    );

    let categories: any[] = categoriesResponse?.success ? categoriesResponse.data : developedCategories;
    if (!categories.find((c: any) => c.slug === 'all' || c.title === 'All')) {
        categories.unshift({ id: 'all', title: 'All', slug: 'all' });
    }

    const jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'Blog',
        name: 'Fatafat Sewa Tech Blog',
        description: 'Latest technology news, reviews, and buying guides',
        publisher: { '@type': 'Organization', name: 'Fatafat Sewa', url: SITE_URL },
        blogPost: allArticles.slice(0, 10).map((article) => ({
            '@type': 'BlogPosting',
            headline: article.title,
            image: article.thumb?.url || article.thumbnail_image?.full,
            datePublished: article.publish_date,
            author: { '@type': 'Person', name: article.author },
            url: `${SITE_URL}/blogs/${article.slug}`,
        })),
    };

    const SectionOne = (
        <BannerSectionServer
            slug="home-banner-fourth-test"
            type="Bannerfooter"
            className="mt-4"
        />
    );

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />
            <BlogListingClient
                articles={allArticles}
                categories={categories}
                SectionOne={SectionOne}
            />
        </>
    );
}

export default function BlogPage(props: { searchParams: Promise<{ category?: string, q?: string }> }) {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center space-y-4">
                    <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
                    <p className="text-gray-500 font-medium">Loading blog articles...</p>
                </div>
            </div>
        }>
            <BlogPageContent {...props} />
        </Suspense>
    );
}



