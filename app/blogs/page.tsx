import React, { Suspense } from 'react';
import type { Metadata } from 'next';
import BlogListingClient from './components/BlogListingClient';
import type { Article } from '../types/Blogtypes';
import { getBannerData } from '@/app/api/CachedHelper/getBannerData';
import TopBanner from '@/app/homepage/Bannerfooter';
import { getCategoryProducts } from '../api/services/category.service';
import { getBlogList } from '../api/services/blog.service';
import { getCachedBlogCategories } from '../api/utils/categoryCache';
import { getRandomBasketProducts, getRandomBlogList } from '@/app/api/utils/productFetchers';
import BlogSkeleton from './components/BlogSkeleton';

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

async function BlogPageContent({ searchParams }: { searchParams: Promise<{ category?: string, q?: string }> }) {
    const resolvedParams = await searchParams;
    const activeCategory = resolvedParams.category;
    const searchQuery = resolvedParams.q;

    // Fetch primary data
    const heroBannerData = await getBannerData('blog-banner-test');

    // Fetch dynamic data in parallel directly with the random fetcher (single chain)
    let categoriesResponse: any = null;
    let blogListResponse: any = null;
    let cameraDealsResponse: any = null;

    try {
        const [categoriesRes, blogListRes, cameraRes] = await Promise.all([
            getCachedBlogCategories(),
            getBlogList({
                category: activeCategory !== 'all' ? activeCategory : undefined,
                search: searchQuery || undefined,
                per_page: 12,
                sort: 'desc',
            }),
            getRandomBasketProducts('dslr-camera-price-in-nepal', 5)
        ]);
        categoriesResponse = categoriesRes;
        blogListResponse = blogListRes;
        cameraDealsResponse = cameraRes;
    } catch (e) {
        console.error("Critical fetch failure in BlogPage", e);
    }

    const categories: any[] = categoriesResponse?.success ? categoriesResponse.data : [];
    if (!categories.find((c: any) => c.slug === 'all' || c.title === 'All')) {
        categories.unshift({ id: 'all', title: 'All', slug: 'all' });
    }

    const allArticles: Article[] = blogListResponse?.data || blogListResponse || [];

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


    let footerBannerData = null;
    try {
        const res = await getBannerData('home-banner-fourth-test');
        footerBannerData = res?.data ?? res;
    } catch (e) { }

    const SectionOne = (
        <div className="mt-4 w-full">
            {footerBannerData && <TopBanner data={footerBannerData} />}
        </div>
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
                heroBannerData={heroBannerData}
                cameraDeals={cameraDealsResponse?.products}
            />
        </>
    );
}

export default function BlogPage(props: { searchParams: Promise<{ category?: string, q?: string }> }) {
    return (
        <Suspense fallback={<BlogSkeleton />}>
            <BlogPageContent {...props} />
        </Suspense>
    );
}



