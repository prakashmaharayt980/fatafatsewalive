import React from 'react';
import { Metadata } from 'next';
import RemoteServices from '../api/remoteservice';
import BlogListingClient from './components/BlogListingClient';
import { Article } from '../types/Blogtypes';
import { getBlogPageData } from '@/app/api/CachedHelper/getInitialData';
import { getBannerData } from '../api/CachedHelper/getBannerData';
import BannerFetcher from '../CommonVue/BannerFetcher';
import { BannerItem } from '../types/BannerTypes';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://fatafatsewa.com';

export const metadata: Metadata = {
    title: 'Latest Tech News, Reviews & Buying Guides | Fatafat Sewa Blog',
    description: 'Discover the latest technology news, in-depth product reviews, expert buying guides, and exclusive deals. Stay updated with Fatafat Sewa\'s comprehensive tech blog.',
    keywords: ['tech news', 'product reviews', 'buying guides', 'technology blog', 'gadget reviews', 'Nepal tech news'],
    authors: [{ name: 'Fatafat Sewa' }],
    alternates: {
        canonical: `${SITE_URL}/blogs`,
    },
    openGraph: {
        title: 'Latest Tech News, Reviews & Buying Guides | Fatafat Sewa',
        description: 'Your source for technology news, reviews, and expert buying guides.',
        url: `${SITE_URL}/blogs`,
        siteName: 'Fatafat Sewa',
        locale: 'en_US',
        type: 'website',
    },
    twitter: {
        card: 'summary_large_image',
        title: 'Latest Tech News & Reviews | Fatafat Sewa Blog',
        description: 'Technology news, reviews, and buying guides.',
    },
    robots: {
        index: true,
        follow: true,
        googleBot: {
            index: true,
            follow: true,
            'max-video-preview': -1,
            'max-image-preview': 'large',
            'max-snippet': -1,
        },
    },
};

export default async function BlogPage() {
    // Fetch cached data (banner, deals, latest articles — all cached for 1 hour)
    const { bannerData, dealProducts, latestArticles } = await getBlogPageData();

    // Fetch only non-cached data in parallel
    const [categoriesResult, trendingResult] = await Promise.allSettled([
        RemoteServices.getBlogCategories(),
        RemoteServices.searchProducts({ search: 'smartphones', page: 1, per_page: 10 }),
    ]);

    // Use cached latestArticles directly
    const articles: Article[] = latestArticles;

    // Derive brand articles from cached latestArticles (no duplicate fetch)
    const brandArticles: Article[] = [...latestArticles].reverse().slice(0, 4);

    // Process categories
    let categories: any[] = categoriesResult.status === 'fulfilled'
        ? categoriesResult.value.data || []
        : [];
    if (!categories.find((c: any) => c.slug === 'all' || c.title === 'All')) {
        categories.unshift({ id: 'all', title: 'All', slug: 'all' });
    }

    // Process trending products
    const trendingProducts = trendingResult.status === 'fulfilled'
        ? (trendingResult.value.data || []).slice(0, 6)
        : [];

    // Generate JSON-LD structured data
    const jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'Blog',
        name: 'Fatafat Sewa Tech Blog',
        description: 'Latest technology news, reviews, and buying guides',
        url: `${SITE_URL}/blogs`,
        publisher: {
            '@type': 'Organization',
            name: 'Fatafat Sewa',
            url: SITE_URL,
        },
        blogPost: articles.slice(0, 10).map((article) => ({
            '@type': 'BlogPosting',
            headline: article.title,
            description: article.short_desc || article.title,
            image: article.thumbnail_image?.full,
            datePublished: article.publish_date,
            author: {
                '@type': 'Person',
                name: article.author,
            },
            url: `${SITE_URL}/blogs/${article.slug}`,
        })),
    };

    // Use API-fetched categories (already has 'All' prepended above)

    const SectionOne = (
        <BannerFetcher
            slug="home-banner-fourth-test"
            variant="footer"
            fetchAction={getBannerData}
            className="mt-4"
        />
    );

    return (
        <>
            {/* Structured Data */}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />
            <BlogListingClient
                articles={articles}
                bannerData={bannerData}
                brandArticles={brandArticles}
                categories={categories}
                dealProducts={dealProducts}
                trendingProducts={trendingProducts}
                SectionOne={SectionOne}
            />
        </>
    );
}
