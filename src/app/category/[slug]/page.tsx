import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import RemoteServices from '@/app/api/remoteservice';
import { CategoryPageClient } from './components';
import {
    CategoryData,
    BrandData,
    CategoryProductsResponse,
    SearchParams,
} from './types';
import { parseSlugAndId, formatPageTitle, parseFiltersFromSearchParams, buildApiParams } from './utils';

// ============================================
// TYPES
// ============================================
interface PageProps {
    params: Promise<{ slug: string }>;
    searchParams: Promise<SearchParams>;
}

// ============================================
// DATA FETCHING FUNCTIONS
// ============================================
async function getCategoryData(slug: string): Promise<CategoryData | null> {
    try {
        const response = await RemoteServices.categoryProduct_slug(slug);
        return response?.data || null;
    } catch (error) {
        console.error('Error fetching category:', error);
        return null;
    }
}

async function getInitialProducts(
    categoryId: string,
    searchParams: SearchParams
): Promise<CategoryProductsResponse> {
    try {
        const filters = parseFiltersFromSearchParams(searchParams);
        const params = buildApiParams(
            {
                categories: filters.categories || [],
                brands: filters.brands || [],
                colors: filters.colors || [],
                sizes: filters.sizes || [],
                priceRange: filters.priceRange || [0, 100000],
                sortBy: filters.sortBy || 'default',
                inStock: filters.inStock || false,
                onSale: filters.onSale || false,
            },
            1
        );
        const queryString = new URLSearchParams(params).toString();
        const response = await RemoteServices.CategoryProduct_ID(
            categoryId
        );
        return response;
    } catch (error) {
        console.error('Error fetching products:', error);
        return { data: [], meta: { current_page: 1, per_page: 20, total: 0, last_page: 1 } };
    }
}

async function getCategories(): Promise<CategoryData[]> {
    try {
        const response = await RemoteServices.getCategoriesAll();
        return response?.data || [];
    } catch (error) {
        console.error('Error fetching categories:', error);
        return [];
    }
}

async function getBrands(): Promise<BrandData[]> {
    try {
        const response = await RemoteServices.getBrandsAll();
        return response?.data || [];
    } catch (error) {
        console.error('Error fetching brands:', error);
        return [];
    }
}

// ============================================
// METADATA GENERATION (SEO)
// ============================================
export async function generateMetadata({ params, searchParams }: PageProps): Promise<Metadata> {
    const resolvedParams = await params;
    const resolvedSearchParams = await searchParams;
    const { slug, id } = parseSlugAndId(resolvedParams.slug, resolvedSearchParams.id);

    // Fetch category data for metadata
    const category = await getCategoryData(slug);
    const title = formatPageTitle(slug);

    // Base URL for canonical
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://yoursite.com';
    const canonicalUrl = `${baseUrl}/category/${slug}`;

    // Build description
    const description = category?.description ||
        `Browse our collection of ${title}. Find the best deals on ${title.toLowerCase()} with free shipping and easy returns.`;

    // Build keywords
    const keywords = [
        title.toLowerCase(),
        'buy ' + title.toLowerCase(),
        title.toLowerCase() + ' online',
        'best ' + title.toLowerCase(),
        title.toLowerCase() + ' price',
        'shop ' + title.toLowerCase(),
    ];

    return {
        title: `${title} | Shop Online`,
        description,
        keywords: keywords.join(', '),
        openGraph: {
            title: `${title} | Shop Online`,
            description,
            url: canonicalUrl,
            siteName: 'Your Store Name',
            type: 'website',
            images: category?.image ? [
                {
                    url: category.image,
                    width: 1200,
                    height: 630,
                    alt: title,
                },
            ] : [],
        },
        twitter: {
            card: 'summary_large_image',
            title: `${title} | Shop Online`,
            description,
            images: category?.image ? [category.image] : [],
        },
        alternates: {
            canonical: canonicalUrl,
        },
        robots: {
            index: true,
            follow: true,
            'max-image-preview': 'large',
            'max-snippet': -1,
            'max-video-preview': -1,
        },
    };
}

// ============================================
// LOADING COMPONENT
// ============================================
function CategoryPageSkeleton() {
    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
            <div className="max-w-[1600px] mx-auto px-4 lg:px-8 py-8">
                {/* Header Skeleton */}
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <div className="h-8 w-48 bg-gray-200 rounded-lg animate-pulse" />
                        <div className="h-6 w-24 bg-gray-100 rounded-full animate-pulse" />
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-32 bg-gray-200 rounded-xl animate-pulse" />
                        <div className="h-10 w-44 bg-gray-200 rounded-xl animate-pulse" />
                    </div>
                </div>

                <div className="flex gap-8">
                    {/* Sidebar Skeleton */}
                    <aside className="hidden lg:block w-72 flex-shrink-0">
                        <div className="bg-white rounded-3xl p-6 space-y-6 border border-gray-100">
                            {[...Array(5)].map((_, i) => (
                                <div key={i} className="space-y-3">
                                    <div className="h-4 w-24 bg-gray-200 rounded-full animate-pulse" />
                                    {[...Array(4)].map((_, j) => (
                                        <div
                                            key={j}
                                            className="h-10 bg-gray-100 rounded-xl animate-pulse"
                                            style={{ animationDelay: `${j * 100}ms` }}
                                        />
                                    ))}
                                </div>
                            ))}
                        </div>
                    </aside>

                    {/* Grid Skeleton */}
                    <main className="flex-1 grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
                        {[...Array(12)].map((_, i) => (
                            <div key={i} className="bg-white rounded-2xl overflow-hidden border border-gray-100">
                                <div className="aspect-square bg-gradient-to-br from-gray-100 to-gray-200 animate-pulse" />
                                <div className="p-4 space-y-3">
                                    <div className="h-3 w-20 bg-gray-200 rounded-full animate-pulse" />
                                    <div className="h-4 bg-gray-200 rounded-full animate-pulse" />
                                    <div className="h-5 w-24 bg-gray-200 rounded-full animate-pulse" />
                                </div>
                            </div>
                        ))}
                    </main>
                </div>
            </div>
        </div>
    );
}

// ============================================
// STRUCTURED DATA (JSON-LD)
// ============================================
function generateStructuredData(
    title: string,
    slug: string,
    products: CategoryProductsResponse,
    category: CategoryData | null
) {
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://yoursite.com';

    // BreadcrumbList
    const breadcrumb = {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
            {
                '@type': 'ListItem',
                position: 1,
                name: 'Home',
                item: baseUrl,
            },
            {
                '@type': 'ListItem',
                position: 2,
                name: title,
                item: `${baseUrl}/category/${slug}`,
            },
        ],
    };

    // CollectionPage
    const collectionPage = {
        '@context': 'https://schema.org',
        '@type': 'CollectionPage',
        name: title,
        description: category?.description || `Shop ${title} online`,
        url: `${baseUrl}/category/${slug}`,
        numberOfItems: products.meta?.total || 0,
        ...(category?.image && { image: category.image }),
    };

    // ItemList for products
    const itemList = {
        '@context': 'https://schema.org',
        '@type': 'ItemList',
        itemListElement: (Array.isArray(products?.data) ? products.data : []).slice(0, 10).map((product, index) => ({
            '@type': 'ListItem',
            position: index + 1,
            item: {
                '@type': 'Product',
                name: product.name,
                url: `${baseUrl}/product/${product.slug}`,
                image: product.image?.full || product.image?.preview,
                offers: {
                    '@type': 'Offer',
                    price: product.discounted_price || product.price,
                    priceCurrency: 'NPR',
                    availability: product.quantity > 0
                        ? 'https://schema.org/InStock'
                        : 'https://schema.org/OutOfStock',
                },
                ...(product.average_rating > 0 && {
                    aggregateRating: {
                        '@type': 'AggregateRating',
                        ratingValue: product.average_rating,
                        bestRating: 5,
                    },
                }),
            },
        })),
    };

    return [breadcrumb, collectionPage, itemList];
}

// ============================================
// MAIN PAGE COMPONENT (SERVER)
// ============================================
export default async function CategoryPage({ params, searchParams }: PageProps) {
    // Resolve async params
    const resolvedParams = await params;
    const resolvedSearchParams = await searchParams;

    // Parse slug and ID
    const { slug, id } = parseSlugAndId(resolvedParams.slug, resolvedSearchParams.id);

    // Validate we have an ID
    if (!id) {
        notFound();
    }

    // Fetch all data in parallel for performance
    const [category, initialProducts, categories, brands] = await Promise.all([
        getCategoryData(slug),
        getInitialProducts(id, resolvedSearchParams),
        getCategories(),
        getBrands(),
    ]);

    // Format title
    const title = formatPageTitle(slug);

    // Generate structured data
    const structuredData = generateStructuredData(title, slug, initialProducts, category);

    // Build SWR fallback for hydration
    const fallback: Record<string, unknown> = {
        categories: { data: categories },
        brands: { data: brands },
    };

    return (
        <>
            {/* Structured Data (JSON-LD) */}
            {structuredData.map((data, index) => (
                <script
                    key={index}
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
                />
            ))}

            {/* Main Content */}
            <Suspense fallback={<CategoryPageSkeleton />}>
                <CategoryPageClient
                    categoryId={id}
                    slug={slug}
                    title={title}
                    initialProducts={initialProducts}
                    initialCategories={categories}
                    initialBrands={brands}
                    fallback={fallback}
                />
            </Suspense>
        </>
    );
}

// ============================================
// STATIC PARAMS GENERATION (Optional - for SSG)
// ============================================
// Uncomment if you want to pre-generate popular category pages
/*
export async function generateStaticParams() {
    try {
        const categories = await getCategories();
        return categories.slice(0, 20).map((category) => ({
            slug: `${category.slug}&id=${category.id}`,
        }));
    } catch {
        return [];
    }
}
*/

// ============================================
// REVALIDATION CONFIG
// ============================================
export const revalidate = 3600; // Revalidate every hour
export const dynamic = 'force-dynamic'; // Or 'force-static' for SSG