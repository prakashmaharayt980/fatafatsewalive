import React from 'react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';


import { getBlogBySlug } from '../../api/services/blog.service';
import BlogDetailsClient from '../components/BlogDetailsClient';
import type { Article } from '../../types/Blogtypes';
import imglogo from '../../assets/logoimg.png';
import { getBlogPageData } from '@/app/api/CachedHelper/getInitialData';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://fatafatsewa.com';

interface PageProps {
    params: Promise<{ slug: string }>;
}

// Optimized Data Fetcher — Returns full response for article + related items
const getArticleResponse = async (slug: string) => {
    try {
        const response = await getBlogBySlug(slug);
        // Robust extraction: Handle { data: {...}, related: [...] } or direct {...}
        if (!response) return null;
        
        const data = response.data || response;
        const related = response.related || [];
        
        return {
            data,
            related,
            raw: response
        };
    } catch (e) {
        console.error(`Failed to fetch blog response for slug: ${slug}`, e);
        return null;
    }
}

// Dynamic Metadata with Enhanced SEO
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { slug } = await params;
    const response = await getArticleResponse(slug);
    const article = response?.data;

    if (!article) {
        return {
            title: 'Article Not Found | Fatafat Sewa',
            description: 'The requested article could not be found.',
        }
    }

    const articleUrl = `${SITE_URL}/blogs/${slug}`;
    const imageUrl = article.thumb?.url || article.thumbnail_image?.full || imglogo.src;

    return {
        title: `${article.title} | Fatafat Sewa Blog`,
        description: article.short_desc || article.title,
        keywords: article.category?.title ? [article.category.title, 'tech review', 'buying guide'] : undefined,
        authors: [{ name: article.author }],
        alternates: {
            canonical: articleUrl,
        },
        openGraph: {
            title: article.title,
            description: article.short_desc || article.title,
            url: articleUrl,
            siteName: 'Fatafat Sewa',
            images: [
                {
                    url: imageUrl,
                    width: 1200,
                    height: 630,
                    alt: article.title,
                }
            ],
            locale: 'en_US',
            type: 'article',
            publishedTime: article.publish_date,
            modifiedTime: article.publish_date,
            authors: [article.author],
            section: article.category?.title,
        },
        twitter: {
            card: 'summary_large_image',
            title: article.title,
            description: article.short_desc || article.title,
            images: [imageUrl],
            creator: '@fatafatsewa',
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
}

export default async function BlogPostPage({ params }: PageProps) {
    const { slug } = await params;
    const response = await getArticleResponse(slug);
    const article = response?.data;

    if (!article) {
        return notFound();
    }

    // Use related articles already present in the single response
    const relatedArticles: Article[] = response?.related || [];

    // Fetch cached author/latest data for the sidebar
    const { latestArticles } = await getBlogPageData();
    const authorArticles = (latestArticles || [])
        .filter((a: Article) => a.id !== article.id && a.author === article.author)
        .slice(0, 6);

    // Generate JSON-LD structured data for article
    const jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'BlogPosting',
        headline: article.title,
        description: article.short_desc || article.title,
        image: article.thumb?.url || imglogo.src,
        datePublished: article.publish_date,
        dateModified: article.publish_date,
        author: {
            '@type': 'Person',
            name: article.author,
        },
        publisher: {
            '@type': 'Organization',
            name: 'Fatafat Sewa',
            url: SITE_URL,
            logo: {
                '@type': 'ImageObject',
                url: `${SITE_URL}/logo.png`,
            },
        },
        mainEntityOfPage: {
            '@type': 'WebPage',
            '@id': `${SITE_URL}/blogs/${slug}`,
        },
    };

    // Breadcrumb structured data
    const breadcrumbJsonLd = {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
            {
                '@type': 'ListItem',
                position: 1,
                name: 'Home',
                item: SITE_URL,
            },
            {
                '@type': 'ListItem',
                position: 2,
                name: 'Blog',
                item: `${SITE_URL}/blogs`,
            },
            {
                '@type': 'ListItem',
                position: 3,
                name: article.title,
                item: `${SITE_URL}/blogs/${slug}`,
            },
        ],
    };

    return (
        <>
            {/* Article Structured Data */}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />
            {/* Breadcrumb Structured Data */}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
            />
            {/* Removed redundant sr-only H1 to avoid confusion with BlogDetailsClient's H1 */}
            <BlogDetailsClient
                article={article}
                relatedArticles={relatedArticles}
                authorArticles={authorArticles}
            />
        </>
    );
}
