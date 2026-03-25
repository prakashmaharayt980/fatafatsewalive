// ProductPageClient.tsx
"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { ChevronsRight, ChevronRight } from "lucide-react";
import Link from "next/link";
import ProductMainImage from "./ProductMainImage";
import ProductBuyBox from "./ProductBuyBox";

import dynamic from "next/dynamic";
import { useInView } from "react-intersection-observer";

const MoreDetailsProduct = dynamic(() => import("./MoreDetailsProduct"), {
    ssr: false,
    loading: () => (
        <div className="animate-pulse space-y-4 p-6">
            <div className="h-6 bg-gray-100 rounded-lg w-1/3" />
            <div className="h-4 bg-gray-100 rounded-lg w-full" />
            <div className="h-4 bg-gray-100 rounded-lg w-5/6" />
            <div className="h-4 bg-gray-100 rounded-lg w-4/6" />
        </div>
    ),
});
import ProductSidebar from "./ProductSidebar";

import { useCartStore } from "@/app/context/CartContext";
import { trackViewContent } from "@/lib/Analytic";
import LazySection from "@/components/LazySection";
import { getCategoryProducts } from "@/app/api/services/category.service";
import { decorateProduct } from "@/app/api/utils/productDecorator";
import SkeletonCard from "@/app/skeleton/SkeletonCard";

const BasketCard = dynamic(() => import("@/app/homepage/BasketCard"), { ssr: false });
const LazyCompareProducts = dynamic(() => import("./LazyCompareProducts"), { ssr: false });

/* ── Extracted Helper Components ── */
const ProductCarouselSection = ({
    title,
    fetcher,
    slug
}: {
    title: string;
    fetcher: () => Promise<any>;
    slug: string;
}) => (
    <LazySection
        fetcher={async () => {
            const resData = await fetcher();
            // Category products API returns { products: [...] } or just an array
            const products = resData?.products || (Array.isArray(resData) ? resData : []);
            const decoratedProducts = products.map((p: any, idx: number) => decorateProduct(p, idx));
            return { products: decoratedProducts };
        }}
        render={(data: any) => (
            <BasketCard
                title={title}
                slug={slug}
                initialData={data}
            />
        )}
        fallback={<SkeletonCard />}
        minHeight="400px"
    />
);
export default function ProductPageClient({ productDetails }: { productDetails: any }) {
    const [selectedImage, setSelectedImage] = useState<string>("");
    const [selectedAttributes, setSelectedAttributes] = useState<Record<string, string>>({});
    const [quantity, setQuantity] = useState<number>(1);
    const relatedCategory = productDetails.categories?.[0] || ({} as any);

    const priceRange = useMemo(() => {
        const currentPrice = productDetails.price?.current || productDetails.discounted_price || productDetails.price;
        if (!currentPrice || typeof currentPrice !== 'number') return null;
        return { min: currentPrice * 0.8, max: currentPrice * 1.2 };
    }, [productDetails]);

    const moreFromBrandFetcher = useCallback(() => 
        getCategoryProducts(relatedCategory.slug, { brand: productDetails.brand?.slug, per_page: 10 }).then(r => r.data),
        [relatedCategory.slug, productDetails.brand?.slug]
    );

    const similarPriceFetcher = useCallback(() => 
        priceRange ? getCategoryProducts(relatedCategory.slug, { min_price: priceRange.min, per_page: 10 }).then(r => r.data) : Promise.resolve([]),
        [relatedCategory.slug, priceRange]
    );

    const { ref: belowFoldRef, inView: isBelowFoldInView } = useInView({
        triggerOnce: true,
        rootMargin: "300px",
    });

    /* ── Compute style/attributes helpers ── */
    const availableAttributes = useMemo(() => {
        if (!productDetails?.variants) return {};
        const attrs: Record<string, Set<string>> = {};
        productDetails.variants.forEach((variant: any) => {
            if (variant.attributes) {
                Object.entries(variant.attributes).forEach(([key, val]) => {
                    if (!attrs[key]) attrs[key] = new Set<string>();
                    attrs[key].add(val as string);
                });
            }
        });
        const result: Record<string, string[]> = {};
        Object.keys(attrs).forEach((key) => {
            result[key] = Array.from(attrs[key]);
        });
        return result;
    }, [productDetails]);

    const allVariantImages = useMemo(() => {
        const images: Array<{ url: string; thumb: string; isDefault: boolean; color?: string }> = [];
        if (productDetails?.images) {
            productDetails.images.forEach((img: any) => {
                images.push({ url: img.url, thumb: img.url, isDefault: img.custom_properties?.is_default || false, color: img.color });
            });
        }
        if (productDetails?.variants) {
            productDetails.variants.forEach((variant: any) => {
                if (variant.images) {
                    variant.images.forEach((img: any) => images.push({ url: img.url, thumb: img.url, isDefault: false, color: variant.attributes?.Color }));
                }
            });
        }
        const unique = new Map();
        images.forEach(img => { if (!unique.has(img.url)) unique.set(img.url, img); });
        return Array.from(unique.values());
    }, [productDetails]);

    const selectedVariant = useMemo(() => {
        if (!productDetails?.variants) return null;
        return productDetails.variants.find((v: any) =>
            Object.entries(selectedAttributes).every(([k, val]) => v.attributes?.[k] === val)
        ) || productDetails.variants[0];
    }, [selectedAttributes, productDetails]);

    useEffect(() => {
        if (!productDetails) return;
        trackViewContent(productDetails);
        const initialSelected: Record<string, string> = {};
        if (productDetails.variants?.[0]?.attributes) {
            Object.entries(productDetails.variants[0].attributes).forEach(([k, v]) => {
                initialSelected[k] = v as string;
            });
        }
        setSelectedAttributes(initialSelected);
        setSelectedImage(productDetails.thumb?.url || "");
    }, [productDetails]);

    // Update selected image when color attribute changes
    useEffect(() => {
        const selectedColor = selectedAttributes["Color"] || selectedAttributes["color"];
        if (selectedColor) {
            const colorImage = allVariantImages.find(img => img.color === selectedColor);
            if (colorImage) {
                setSelectedImage(colorImage.url);
            }
        }
    }, [selectedAttributes, allVariantImages]);

    // priceRange was moved up

    return (
        <div className="min-h-screen bg-[#f7f7f8] pb-16">
            {/* inital render section on desktop  */}
            <div className="max-w-8xl mx-auto px-3 sm:px-4 lg:px-8 py-4">
                <nav aria-label="Breadcrumb" className="flex items-center gap-1 text-xs mb-3 overflow-x-auto scrollbar-hide">
                    <Link href="/" className="text-[var(--colour-fsP2)] hover:text-[var(--colour-fsP1)] whitespace-nowrap font-medium">Home</Link>
                    <ChevronsRight className="w-3.5 h-3.5 text-gray-300" />
                    <Link href={`/category/${relatedCategory.slug}`} className="text-[var(--colour-fsP2)] hover:text-[var(--colour-fsP1)] font-medium">
                        {relatedCategory.title || "Category"}
                    </Link>
                    <ChevronRight className="w-3.5 h-3.5 text-gray-300" />
                    <span className="text-slate-600 font-semibold truncate">{productDetails.name}</span>
                </nav>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-2 mb-8">
                    <div className="md:col-span-1 lg:col-span-4 min-w-0">
                        <ProductMainImage
                            selectedImage={selectedImage}
                            setSelectedImage={setSelectedImage}
                            productName={productDetails.name}
                            images={allVariantImages.map(img => img.url)}
                            productId={productDetails.id}
                            fallbackImage={productDetails.thumb?.url || ""}
                        />
                    </div>
                    <div className="md:col-span-1 lg:col-span-5">
                        <ProductBuyBox
                            product={productDetails}
                            selectedVariant={selectedVariant}
                            selectedAttributes={selectedAttributes}
                            setSelectedAttributes={setSelectedAttributes}
                            availableAttributes={availableAttributes}
                            quantity={quantity}
                            setQuantity={setQuantity}
                            allVariantImages={allVariantImages}
                            selectedImage={selectedImage}
                        />
                    </div>
                    {/* Sidebar: Responsive layout - at side on desktop, below on mobile */}
                    <div className="lg:col-span-3">
                        <ProductSidebar product={productDetails} trendingProducts={[]} />
                    </div>
                </div>

                <div ref={belowFoldRef}>
                    {isBelowFoldInView && (
                        <>
                            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm mb-5">
                                <MoreDetailsProduct
                                    productDescription={productDetails.description?.description}
                                    keyFeatures={productDetails.attributes || {}}
                                    productID={productDetails.id}
                                    product={productDetails}
                                    categoryId={relatedCategory.slug}
                                    specifications={{}}
                                />
                            </div>

                            <section className="space-y-6 mt-4">
                                {/* Deduplicated Section Component */}
                                {relatedCategory.slug && (
                                    <ProductCarouselSection
                                        title={`More from ${productDetails.brand?.name || "Brand"}`}
                                        slug={relatedCategory.slug}
                                        fetcher={moreFromBrandFetcher}
                                    />
                                )}

                                <LazyCompareProducts categorySlug={relatedCategory.slug} currentProductId={productDetails.id} />

                                {priceRange && relatedCategory.slug && (
                                    <ProductCarouselSection
                                        title="Similar Price Range"
                                        slug={relatedCategory.slug}
                                        fetcher={similarPriceFetcher}
                                    />
                                )}
                            </section>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}