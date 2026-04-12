import { Suspense } from 'react';
import type { Metadata } from 'next';
import BlogListingClient from './components/BlogListingClient';
import type { Article } from '../types/Blogtypes';
import { getBannerData } from '@/app/api/CachedHelper/getBannerData';
import TopBanner from '@/app/homepage/Bannerfooter';
import { getBlogList } from '../api/services/blog.service';
import { getCachedBlogCategories } from '../api/utils/categoryCache';
import BlogSkeleton from './components/BlogSkeleton';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://fatafatsewa.com';

type SearchParams = Promise<{ category?: string; q?: string }>;

export async function generateMetadata({ searchParams }: { searchParams: SearchParams }): Promise<Metadata> {
    const { category, q } = await searchParams;
    const categoryLabel = category ? category.charAt(0).toUpperCase() + category.slice(1).replace(/-/g, ' ') : '';

    const title = q
        ? `Search: "${q}" | Fatafat Sewa Blog`
        : categoryLabel && categoryLabel !== 'All'
            ? `${categoryLabel} – Tech Reviews & News | Fatafat Sewa`
            : 'Tech News, Reviews & Buying Guides | Fatafat Sewa Blog';

    const description = 'Expert tech reviews, buying guides, and the latest gadget news for Nepal. Compare prices on mobiles, laptops, cameras, and more at Fatafat Sewa.';

    return {
        title,
        description,
        keywords: ['tech reviews nepal', 'mobile price nepal', 'laptop price nepal', 'gadget buying guide', 'fatafat sewa blog'],
        alternates: { canonical: `${SITE_URL}/blogs` },
        openGraph: {
            title,
            description,
            url: `${SITE_URL}/blogs`,
            siteName: 'Fatafat Sewa',
            type: 'website',
            images: [{ url: `${SITE_URL}/logo.png`, width: 1200, height: 630, alt: 'Fatafat Sewa Blog' }],
        },
        twitter: {
            card: 'summary_large_image',
            title,
            description,
            creator: '@fatafatsewa',
        },
        robots: { index: true, follow: true },
    };
}

async function BlogPageContent({ searchParams }: { searchParams: SearchParams }) {
    const { category, q } = await searchParams;

    // All fetches in parallel — no sequential waterfalls
    const [categoriesRes, blogListRes, heroBannerData, footerBannerRes] = await Promise.all([
        getCachedBlogCategories(),
        getBlogList({
            category: category && category !== 'all' ? category : undefined,
            search: q ?? undefined,
            per_page: 12,
            sort: 'desc',
        }),
        getBannerData('blog-banner-test'),
        getBannerData('home-banner-fourth-test'),
    ]);

    const categories: any[] = categoriesRes?.success ? categoriesRes.data : [];
    if (!categories.find((c: any) => c.slug === 'all' || c.title === 'All')) {
        categories.unshift({ id: 'all', title: 'All', slug: 'all' });
    }

    const allArticles: Article[] = blogListRes?.data ?? blogListRes ?? [];
    const footerBannerData = footerBannerRes?.data ?? footerBannerRes;

    const jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'Blog',
        name: 'Fatafat Sewa Tech Blog',
        description: 'Latest technology news, reviews, and buying guides for Nepal',
        url: `${SITE_URL}/blogs`,
        publisher: { '@type': 'Organization', name: 'Fatafat Sewa', url: SITE_URL },
        blogPost: allArticles.slice(0, 10).map((a) => ({
            '@type': 'BlogPosting',
            headline: a.title,
            image: a.thumb?.url ?? a.thumbnail_image?.full,
            datePublished: a.publish_date,
            author: { '@type': 'Person', name: a.author },
            url: `${SITE_URL}/blogs/${a.slug}`,
        })),
    };

    return (
        <>
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
            <BlogListingClient
                articles={allArticles}
                categories={categories}
                SectionOne={footerBannerData ? <div className="mt-4 w-full"><TopBanner data={footerBannerData} /></div> : null}
                heroBannerData={heroBannerData}
            />
        </>
    );
}

export default function BlogPage(props: { searchParams: SearchParams }) {
    return (
        <Suspense fallback={<BlogSkeleton />}>
            <BlogPageContent {...props} />
        </Suspense>
    );
}
