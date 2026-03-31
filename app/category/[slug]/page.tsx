import type { Metadata } from 'next';
import type { ProductData } from '@/app/types/ProductDetailsTypes';

import { notFound } from 'next/navigation';
import { Suspense, cache } from 'react';

import dynamic from 'next/dynamic';
import { getBannerData } from '@/app/api/CachedHelper/getBannerData';
import { getCategoryBySlug, getCategoryProducts } from '@/app/api/services/category.service';
import { decorateProduct } from '@/app/api/utils/productDecorator';

interface PageProps {
    params: Promise<{ slug: string }>;
    searchParams: Promise<Record<string, string | string[] | undefined>>;
}

// ─── Server-side fetchers ─────────────────────────────────────────────────────

const getCachedCategoryBySlug = cache(async (slug: string) => {
    return getCategoryBySlug(slug)
        .then(res => res?.data ?? null)
        .catch(() => null);
});

async function getCategoryNavigation(slug: string) {
    const data = await getCachedCategoryBySlug(slug);
    return {
        children: data?.children ?? [],
        brands: data?.brands ?? [],
    };
}


/**
 * Builds the initial product fetch params from URL searchParams.
 * Only runs server-side on first load — subsequent fetches use the Server Action.
 */
function buildInitialParams(sp: Record<string, any>, sub_category?: string) {
    return {
        page: 1,
        per_page: 10,
        sort: sp.sort ?? 'newest',
        min_price: sp.min_price ? Number(sp.min_price) : undefined,
        max_price: sp.max_price ? Number(sp.max_price) : undefined,
        brand: sp.brand ?? undefined,
        category: sub_category ?? undefined,
        emi_enabled: sp.emi_enabled === 'true' ? true : undefined,
        pre_order: sp.pre_order === 'true' ? true : undefined,
        exchange_available: sp.exchange_available === 'true' ? true : undefined,
    };
}


async function getInitialProducts(slug: string, sp: Record<string, any>, sub_category?: string) {
    const params = buildInitialParams(sp, sub_category);
    try {
        const result = await getCategoryProducts(slug, params);
        if (result?.data?.products) {
            result.data.products = result.data.products.map((p: ProductData, index: number) => decorateProduct(p, index));
        }
        return result;
    } catch {
        return {
            data: { category: null, products: [] },
            meta: { current_page: 1, per_page: 10, total: 0, last_page: 1 },
        };
    }
}

// ─── Metadata ─────────────────────────────────────────────────────────────────

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { slug } = await params;
    const category = await getCachedCategoryBySlug(slug);
    const displayTitle = category?.title ?? category?.name ?? slug;
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://fatafatsewa.com';
    const canonicalUrl = `${baseUrl}/category/${slug}`;
    const description = category?.description ??
        `Browse our collection of ${displayTitle}. Find the best deals on ${displayTitle.toLowerCase()} with free shipping and easy returns.`;

    const ogImageUrl = category?.image ?? null;

    return {
        title: `${displayTitle} | Fatafat Sewa - Shop Online`,
        description,
        keywords: [
            displayTitle, `buy ${displayTitle}`, `${displayTitle} online`,
            `best ${displayTitle}`, `${displayTitle} price`,
        ],
        openGraph: {
            title: `${displayTitle} | Fatafat Sewa - Shop Online`,
            description,
            url: canonicalUrl,
            siteName: 'Fatafat Sewa',
            type: 'website',
            images: ogImageUrl ? [{ url: ogImageUrl, width: 1200, height: 630, alt: displayTitle }] : [],
        },
        twitter: {
            card: 'summary_large_image',
            title: `${displayTitle} | Fatafat Sewa - Shop Online`,
            description,
            images: ogImageUrl ? [ogImageUrl] : [],
        },
        alternates: { canonical: canonicalUrl },
        robots: {
            index: true, follow: true,
            'max-image-preview': 'large', 'max-snippet': -1, 'max-video-preview': -1,
        },
    };
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function CategoryPageSkeleton() {
    return (
        <div className="min-h-screen bg-[#f8fafc]">
            <div className="max-w-[1440px] mx-auto px-4 lg:px-8 py-8">
                <div className="h-8 w-52 bg-gray-200 rounded-lg animate-pulse mb-6" />
                <div className="flex gap-8">
                    <aside className="hidden lg:block w-72 shrink-0">
                        <div className="bg-white rounded-xl p-5 border border-gray-100 space-y-4">
                            {Array.from({ length: 4 }, (_, i) => (
                                <div key={i} className="space-y-2">
                                    <div className="h-3 w-20 bg-gray-200 rounded animate-pulse" />
                                    {Array.from({ length: 3 }, (_, j) => (
                                        <div key={j} className="h-8 bg-gray-100 rounded-lg animate-pulse"
                                            style={{ animationDelay: `${j * 80}ms` }} />
                                    ))}
                                </div>
                            ))}
                        </div>
                    </aside>
                    <main className="flex-1 grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
                        {Array.from({ length: 12 }, (_, i) => (
                            <div key={i} className="bg-white rounded-xl overflow-hidden border border-gray-100"
                                style={{ animationDelay: `${i * 40}ms` }}>
                                <div className="aspect-square bg-gray-100 animate-pulse" />
                                <div className="p-3 space-y-2">
                                    <div className="h-3 w-16 bg-gray-200 rounded animate-pulse" />
                                    <div className="h-4 bg-gray-200 rounded animate-pulse" />
                                    <div className="h-5 w-24 bg-gray-200 rounded animate-pulse" />
                                </div>
                            </div>
                        ))}
                    </main>
                </div>
            </div>
        </div>
    );
}

const CategoryPageClient = dynamic(() => import('./components/CategoryPageClient'), {
    ssr: true,
    loading: () => <CategoryPageSkeleton />,
});

// ─── Structured data ──────────────────────────────────────────────────────────

function generateStructuredData(title: string, slug: string, products: any, category: any) {
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://fatafatsewa.com';
    return [
        {
            '@context': 'https://schema.org', '@type': 'BreadcrumbList',
            itemListElement: [
                { '@type': 'ListItem', position: 1, name: 'Home', item: baseUrl },
                { '@type': 'ListItem', position: 2, name: title, item: `${baseUrl}/category/${slug}` },
            ],
        },
        {
            '@context': 'https://schema.org', '@type': 'CollectionPage',
            name: title,
            description: category?.description ?? `Shop ${title} online`,
            url: `${baseUrl}/category/${slug}`,
            numberOfItems: products.meta?.total ?? 0,
            ...(category?.image && { image: category.image }),
        },
        {
            '@context': 'https://schema.org', '@type': 'ItemList',
            itemListElement: (products?.data?.products ?? []).slice(0, 10).map((product: any, index: number) => ({
                '@type': 'ListItem', position: index + 1,
                item: {
                    '@type': 'Product',
                    name: product.name,
                    url: `${baseUrl}/product-details/${product.slug}`,
                    image: product.image?.full ?? product.image?.preview,
                    offers: {
                        '@type': 'Offer',
                        price: product.discountedPriceVal ?? product.basePrice,
                        priceCurrency: 'NPR',
                        availability: product.quantity > 0
                            ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
                    },
                    ...(product.average_rating > 0 && {
                        aggregateRating: {
                            '@type': 'AggregateRating',
                            ratingValue: product.average_rating,
                            bestRating: 5,
                            reviewCount: 20 + ((product.id % 1000) * 179) % 200,
                        },
                    }),
                },
            })),
        },
    ];
}

// ─── Page ─────────────────────────────────────────────────────────────────────


async function CategoryPageContent({ params, searchParams }: PageProps) {
    const { slug } = await params;
    const sp = await searchParams;
    const sub_category = sp?.sub_category as string | undefined;

    if (!slug) notFound();

    const [initialProducts, navigationData, bannerData] = await Promise.all([
        getInitialProducts(slug, sp, sub_category),
        getCategoryNavigation(slug),
        getBannerData('blog-banner-test'),
    ]);

    const category = initialProducts?.data?.category ?? null;
    const displayTitle = category?.title ?? category?.name ?? slug;
    const structuredData = generateStructuredData(displayTitle, slug, initialProducts, category);

    const sortedBannerImages = bannerData?.images
        ? [...bannerData.images].sort((a: any, b: any) => a.order - b.order)
        : [];
    const preloadTopImage = sortedBannerImages[0]?.image?.full ?? null;
    const preloadPortraitImage = sortedBannerImages.length >= 2
        ? sortedBannerImages[sortedBannerImages.length - 1]?.image?.full : null;

    return (
        <>
            {structuredData.map((data, index) => (
                <script key={index} type="application/ld+json"
                    dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />
            ))}
            {preloadTopImage && (
                <link rel="preload" as="image" href={preloadTopImage} fetchPriority="high" />
            )}
            {preloadPortraitImage && (
                <link rel="preload" as="image" href={preloadPortraitImage} />
            )}
            <CategoryPageClient
                categoryId={slug}
                slug={slug}
                title={displayTitle}
                category={category}
                bannerData={bannerData}
                initialProducts={initialProducts}
                initialCategories={navigationData.children}
                initialBrands={navigationData.brands}
                sub_category={sub_category}
            />
        </>
    );
}

export default function CategoryPage(props: PageProps) {
    return (
        <Suspense fallback={<CategoryPageSkeleton />}>
            <CategoryPageContent {...props} />
        </Suspense>
    );
}