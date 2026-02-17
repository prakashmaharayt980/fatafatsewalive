import React from 'react';
import { Metadata } from 'next';
import RemoteServices from '../api/remoteservice';
import BlogListingClient from './components/BlogListingClient';
import { Article } from '../types/Blogtypes';
import { getBannerData } from '../api/CachedHelper/getBannerData';
import BannerFetcher from '../CommonVue/BannerFetcher';

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
    // Fetch all data in parallel on the server
    const [blogRes, brandRes, bannerResult, categoriesResult, dealsResult, trendingResult] = await Promise.allSettled([
        // 1. Main Blog List
        RemoteServices.getBlogList({ page: 1, per_page: 12 }),
        // 2. Brand Articles
        RemoteServices.getBlogList(),
        // 3. Banner Data
        RemoteServices.getBannerBySlug("blog-banner-test"),
        // 4. Categories
        RemoteServices.getBlogCategories(),
        // 5. Product Deals (was client-side in ProductDeals)
        RemoteServices.searchProducts({ search: 'Pro', page: 1, per_page: 10 }),
        // 6. Trending Products (was client-side in ProductWidget)
        RemoteServices.searchProducts({ search: 'smartphones', page: 1, per_page: 10 }),
    ]);

    // Process articles
    const articles: Article[] = blogRes.status === 'fulfilled'
        ? (Array.isArray(blogRes.value) ? blogRes.value : blogRes.value.data || [])
        : [];

    // Process brand articles
    const brandArticles: Article[] = brandRes.status === 'fulfilled'
        ? (Array.isArray(brandRes.value) ? brandRes.value : brandRes.value.data || []).reverse().slice(0, 4)
        : [];

    // Process banner
    const bannerData = bannerResult.status === 'fulfilled'
        ? bannerResult.value.data || undefined
        : undefined;

    // Process categories
    let categories: any[] = categoriesResult.status === 'fulfilled'
        ? categoriesResult.value.data || []
        : [];
    if (!categories.find((c: any) => c.slug === 'all' || c.title === 'All')) {
        categories.unshift({ id: 'all', title: 'All', slug: 'all' });
    }

    // Process deal products
    const dealProducts = dealsResult.status === 'fulfilled'
        ? dealsResult.value.data || []
        : [];

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

    const Categories = [
        {
            id: 'all',
            title: 'All',
            slug: 'all',
        },
        {
            id: 'news',
            title: 'News',
            slug: 'news',
        },
        {
            id: 'mobile',
            title: 'Mobile',
            slug: 'mobile',
        },
        {
            id: 'laptop',
            title: 'Laptop',
            slug: 'laptop',
        },
        {
            id: 'tablet',
            title: 'Tablet',
            slug: 'tablet',
        },
    ]

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
                categories={Categories}
                dealProducts={dealProducts}
                trendingProducts={trendingProducts}
                SectionOne={SectionOne}

            />
        </>
    );
}
