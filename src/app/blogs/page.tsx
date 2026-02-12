import React from 'react';
import { Metadata } from 'next';
import RemoteServices from '../api/remoteservice';
import BlogListingClient from './components/BlogListingClient';
import { Article } from '../types/Blogtypes';
import BannerFetcher from '../components/BannerFetcher';
import TwoImageBanner from '../homepage/Banner2';

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
    // 1. Fetch Main Blog List
    const blogRes = await RemoteServices.getBlogList({ page: 1, per_page: 12 });
    const articles: Article[] = Array.isArray(blogRes) ? blogRes : blogRes.data || [];

    // 2. Fetch Banner Data
    // Handling error gracefully or ensuring API response structure matches
    let bannerData = { data: [], meta: {} };
    try {
        const bannerRes = await RemoteServices.getBannerSlug("blog-banner-test");
        bannerData = { data: bannerRes.data || [], meta: bannerRes.meta || {} };
    } catch (e) {
        console.error("Banner fetch failed", e);
    }

    // 3. Fetch Brand Articles
    // Reusing Bloglist fetch logic for now, slicing first 4 reversed as per previous logic
    const brandRes = await RemoteServices.getBlogList();
    const brandArticles: Article[] = (Array.isArray(brandRes) ? brandRes : brandRes.data || [])
        .reverse()
        .slice(0, 4);

    // 4. Fetch Categories
    let categories: any[] = [];
    try {
        const catRes = await RemoteServices.getBlogCategories();
        categories = catRes.data || [];
        // Ensure "All" is present if not returned
        if (!categories.find((c: any) => c.slug === 'all' || c.title === 'All')) {
            categories.unshift({ id: 'all', title: 'All', slug: 'all' });
        }
    } catch (e) {
        console.error("Category fetch failed", e);
        // Fallback default
        categories = [{ id: 'all', title: 'All', slug: 'all' }];
    }

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

    return (
        <>
            {/* Structured Data */}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />
            <BlogListingClient
                initialArticles={articles}
                initialBannerData={bannerData as any}
                initialBrandArticles={brandArticles}
                categories={categories}
            />
        </>
    );
}
