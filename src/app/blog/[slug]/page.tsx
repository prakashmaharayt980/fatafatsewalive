import React from 'react';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import RemoteServices from '../../api/remoteservice';
import BlogDetailsClient from '../components/BlogDetailsClient';
import { Article } from '../../types/Blogtypes';
import { ProductDetails } from '../../types/ProductDetailsTypes';
import imglogo from '../../assets/logoimg.png';

interface PageProps {
    params: Promise<{ slug: string }>;
}

// Data Fetching Helper
const getArticleData = async (slug: string) => {
    try {
        const blogRes = await RemoteServices.getBlogList();
        const articles: Article[] = Array.isArray(blogRes) ? blogRes : blogRes.data || [];
        const article = articles.find((a) => a.slug === slug);
        return article;
    } catch (e) {
        console.error("Failed to fetch article", e);
        return null;
    }
}

// Dynamic Metadata
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { slug } = await params;
    const article = await getArticleData(slug);

    if (!article) {
        return {
            title: 'Article Not Found',
        }
    }

    return {
        title: article.title,
        description: article.short_desc || article.title,
        openGraph: {
            title: article.title,
            description: article.short_desc || article.title,
            images: [article.thumbnail_image?.full || imglogo.src],
            type: 'article',
            publishedTime: article.publish_date,
            authors: [article.author],
        },
    };
}

export default async function BlogPostPage({ params }: PageProps) {
    const { slug } = await params;
    const article = await getArticleData(slug);

    if (!article) {
        return notFound();
    }

    // Fetch related product if category exists
    let relatedProduct: ProductDetails | undefined = undefined;
    if (article.category?.title) {
        try {
            const productRes = await RemoteServices.searchProducts({ search: article.category.title });
            const products = productRes.data || [];
            if (products.length > 0) {
                relatedProduct = products[0];
            }
        } catch (e) {
            console.error("Failed to fetch related product", e);
        }
    }

    return (
        <BlogDetailsClient
            article={article}
            relatedProduct={relatedProduct}
        />
    );
}
