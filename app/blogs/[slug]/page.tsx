import { Suspense } from 'react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { getBlogBySlug, getBlogList } from '../../api/services/blog.service';
import BlogDetailsClient from '../components/BlogDetailsClient';
import type { Article } from '../../types/Blogtypes';
import imglogo from '../../assets/logoimg.png';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://fatafatsewa.com';

interface PageProps {
    params: Promise<{ slug: string }>;
}

interface ArticleResponse {
    article: Article;
    related: Article[];
}

const getArticleWithRelated = async (slug: string): Promise<ArticleResponse | null> => {
    try {
        const res = await getBlogBySlug(slug);
        if (!res?.data) return null;
        return {
            article: res.data,
            related: res.related ?? [],
        };
    } catch {
        return null;
    }
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { slug } = await params;
    const res = await getArticleWithRelated(slug);
    const article = res?.article;

    if (!article) {
        return {
            title: 'Article Not Found | Fatafat Sewa',
            description: 'The requested article could not be found.',
        };
    }

    const articleUrl = `${SITE_URL}/blogs/${slug}`;
    const imageUrl = article.thumb?.url ?? article.thumbnail_image?.full ?? imglogo.src;

    return {
        title: `${article.title} | Fatafat Sewa Blog`,
        description: article.short_desc || article.title,
        keywords: article.category?.title ? [article.category.title, 'tech review', 'buying guide'] : undefined,
        authors: [{ name: article.author }],
        alternates: { canonical: articleUrl },
        openGraph: {
            title: article.title,
            description: article.short_desc || article.title,
            url: articleUrl,
            siteName: 'Fatafat Sewa',
            images: [{ url: imageUrl, width: 1200, height: 630, alt: article.title }],
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
            googleBot: { index: true, follow: true, 'max-video-preview': -1, 'max-image-preview': 'large', 'max-snippet': -1 },
        },
    };
}

async function BlogPostPageContent({ params }: PageProps) {
    const { slug } = await params;
    const result = await getArticleWithRelated(slug);

    if (!result) return notFound();

    const { article, related: relatedArticles } = result;

    const listRes = await getBlogList({ page: 1, per_page: 10, sort: 'desc' });
    const latestArticles: Article[] = listRes?.data ?? listRes ?? [];
    const authorArticles = latestArticles
        .filter((a: Article) => a.id !== article.id && a.author === article.author)
        .slice(0, 6);

    const jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'BlogPosting',
        headline: article.title,
        description: article.short_desc || article.title,
        image: article.thumb?.url ?? imglogo.src,
        datePublished: article.publish_date,
        dateModified: article.publish_date,
        author: { '@type': 'Person', name: article.author },
        publisher: {
            '@type': 'Organization',
            name: 'Fatafat Sewa',
            url: SITE_URL,
            logo: { '@type': 'ImageObject', url: `${SITE_URL}/logo.png` },
        },
        mainEntityOfPage: { '@type': 'WebPage', '@id': `${SITE_URL}/blogs/${slug}` },
    };

    const breadcrumbJsonLd = {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
            { '@type': 'ListItem', position: 2, name: 'Blog', item: `${SITE_URL}/blogs` },
            { '@type': 'ListItem', position: 3, name: article.title, item: `${SITE_URL}/blogs/${slug}` },
        ],
    };

    return (
        <>
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
            <BlogDetailsClient article={article} relatedArticles={relatedArticles} authorArticles={authorArticles} />
        </>
    );
}

export default function BlogPostPage(props: PageProps) {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="w-10 h-10 border-4 border-[var(--colour-fsP2)] border-t-transparent rounded-full animate-spin" />
            </div>
        }>
            <BlogPostPageContent {...props} />
        </Suspense>
    );
}
