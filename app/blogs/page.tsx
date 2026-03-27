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

export default async function BlogPage({ searchParams }: { searchParams: Promise<{ category?: string, q?: string }> }) {
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

    // ─── Server-Side Article Filtering (Performance Optimization) ───
    // This removes redundant high-cost calculations from the client's JS bundle
    const reviewArticles = allArticles.filter(a => a.category?.slug === 'news' || a.title?.toLowerCase().includes('news')).slice(0, 9);
    const guideArticles = allArticles.filter(a => a.category?.slug === 'buying-guides' || a.title?.toLowerCase().includes('guide')).slice(0, 5);
    const newsArticles = allArticles.filter(a => a.category?.slug === 'tech-news' || a.category?.slug === 'news').slice(0, 8);
    const initialStories = allArticles.filter(a => a.category?.slug === 'web-stories').slice(0, 10);
    const brandArticles = latestArticles?.slice(0, 4) || allArticles.slice(0, 4);

    // ─── Category Processing ───
    const derivedCategories = Array.from(
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

    let categories: any[] = categoriesResponse?.success ? categoriesResponse.data : derivedCategories;
    if (!categories.find((c: any) => c.slug === 'all' || c.title === 'All')) {
        categories.unshift({ id: 'all', title: 'All', slug: 'all' });
    }

    const trendingProducts = trendingProductsResponse?.data?.products?.slice(0, 6) || [];

    // SEO Structured Data
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

export const revalidate = 60;
