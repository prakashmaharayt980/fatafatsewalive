// ProductPageClient.tsx
"use client";

import React, { useState, useEffect, useMemo } from "react";
import { ChevronRight } from "lucide-react";
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

import LazyBasketCardFetcher from "@/app/homepage/LazyBasketCardFetcher";

const ProductSidebar = dynamic(() => import("./ProductSidebar"), {
    ssr: false,
    loading: () => <div className="animate-pulse bg-gray-100 rounded-2xl h-[400px] w-full" />,
});

import { trackViewContent } from "@/lib/Analytic";
import LazyCompareProducts from "./LazyCompareProducts";

export default function ProductPageClient({ productDetails }: { productDetails: any }) {
    const [selectedImage, setSelectedImage] = useState<string>("");
    const [selectedAttributes, setSelectedAttributes] = useState<Record<string, string>>({});
    const [quantity, setQuantity] = useState<number>(1);

    const { ref: belowFoldRef, inView: isBelowFoldInView } = useInView({
        triggerOnce: true,
        rootMargin: "300px",
    });

    const relatedCategory = productDetails.categories?.[0] || ({} as any);

    /* ── Compute available attributes from variants ── */
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

    /* ── Resolve all deduplicated variant images ── */
    const allVariantImages = useMemo(() => {
        const images: Array<{ url: string; thumb: string; isDefault: boolean; color?: string }> = [];

        if (productDetails?.images) {
            productDetails.images.forEach((img: any) => {
                images.push({
                    url: img.url,
                    thumb: img.url,
                    isDefault: img.custom_properties?.is_default || false,
                    color: img.color || img.custom_properties?.color,
                });
            });
        }

        if (productDetails?.variants) {
            productDetails.variants.forEach((variant: any) => {
                if (variant.images && Array.isArray(variant.images)) {
                    variant.images.forEach((img: any) => {
                        images.push({
                            url: img.url,
                            thumb: img.url,
                            isDefault: false,
                            color: variant.attributes?.Color,
                        });
                    });
                }
            });
        }

        const uniqueMap = new Map();
        images.forEach((img) => {
            if (!uniqueMap.has(img.url)) uniqueMap.set(img.url, img);
        });
        return Array.from(uniqueMap.values());
    }, [productDetails]);

    /* ── Derive selected variant ── */
    const selectedVariant = useMemo(() => {
        if (!productDetails?.variants || productDetails.variants.length === 0) return null;
        return (
            productDetails.variants.find((variant: any) => {
                if (!variant.attributes) return false;
                return Object.entries(selectedAttributes).every(([k, v]) => variant.attributes[k] === v);
            }) ||
            productDetails.variants[0] ||
            null
        );
    }, [selectedAttributes, productDetails]);

    /* ── Init ── */
    useEffect(() => {
        if (!productDetails) return;
        trackViewContent(productDetails);

        const initialSelected: Record<string, string> = {};
        if (productDetails.variants?.length > 0) {
            const firstVariant = productDetails.variants[0];
            if (firstVariant.attributes) {
                Object.entries(firstVariant.attributes).forEach(([k, v]) => {
                    initialSelected[k] = v as string;
                });
            }
        }
        setSelectedAttributes(initialSelected);

        let initialImage = productDetails.thumb?.url || "";
        if (productDetails.variants?.length > 0) {
            const firstVar = productDetails.variants[0];
            if (firstVar.images?.length > 0) initialImage = firstVar.images[0].url;
        }
        if (initialImage) setSelectedImage(initialImage);
    }, [productDetails]);

    /* ── Auto-update image on variant change ── */
    useEffect(() => {
        if (selectedVariant?.images?.length > 0) {
            setSelectedImage(selectedVariant.images[0].url);
        } else if (selectedVariant?.attributes?.Color) {
            const matchedImg = allVariantImages.find((img) => img.color === selectedVariant.attributes.Color);
            if (matchedImg) setSelectedImage(matchedImg.url);
        }
    }, [selectedVariant, allVariantImages]);

    const priceRange =
        productDetails.price && typeof productDetails.price === "object"
            ? {
                min: (productDetails.price as any).current * 0.8,
                max: (productDetails.price as any).current * 1.2,
            }
            : null;

    return (
        <div className="min-h-screen bg-[#f7f7f8] pb-16">
            <div className="max-w-8xl mx-auto px-3 sm:px-4 lg:px-8 py-4">

                {/* ── Breadcrumb (SEO: nav + structured markup) ── */}
                <nav aria-label="Breadcrumb" className="flex items-center gap-1 text-xs mb-3 overflow-x-auto scrollbar-hide pb-1">
                    <Link href="/" className="text-[var(--colour-fsP2)] hover:text-[var(--colour-fsP1)] whitespace-nowrap font-medium transition-colors">
                        Home
                    </Link>
                    <ChevronRight className="w-3.5 h-3.5 text-gray-300 shrink-0" />
                    <Link
                        href={`/category/${productDetails.categories?.[0]?.slug || ""}`}
                        className="text-[var(--colour-fsP2)] hover:text-[var(--colour-fsP1)] whitespace-nowrap font-medium transition-colors"
                    >
                        {productDetails.categories?.[0]?.title || "Category"}
                    </Link>
                    <ChevronRight className="w-3.5 h-3.5 text-gray-300 shrink-0" />
                    <span className="text-slate-600 font-semibold truncate max-w-[200px] sm:max-w-xs">
                        {productDetails.name}
                    </span>
                </nav>

                {/* ── 3-Column Product Layout ── */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-2.5 mb-5">

                    {/* Col 1: Gallery — 4 cols */}
                    <div className="md:col-span-1 lg:col-span-4">
                        <ProductMainImage
                            selectedImage={selectedImage}
                            setSelectedImage={setSelectedImage}
                            productName={productDetails.name}
                            fallbackImage={productDetails.thumb?.url || ""}
                            productId={productDetails.id}
                            images={allVariantImages.map((img) => img.url)}
                            variantImages={selectedVariant?.images?.length > 0 ? selectedVariant.images.map((img: any) => img.url) : undefined}
                        />
                    </div>

                    {/* Col 2: Buy Box — 5 cols */}
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
                        />
                    </div>

                    {/* Col 3: Sidebar — 3 cols */}
                    <div className="hidden lg:block lg:col-span-3">
                        <ProductSidebar product={productDetails} />
                    </div>
                </div>

                {/* ── Below the fold: Details + Related ── */}
                <div ref={belowFoldRef}>
                    {isBelowFoldInView && (
                        <>
                            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm mb-5 overflow-hidden">
                                <MoreDetailsProduct
                                    productDescription={productDetails.description.description}
                                    keyFeatures={productDetails.attributes || {}}
                                    specifications={{}}
                                    productID={productDetails.id}
                                    product={productDetails}
                                    categoryId={relatedCategory.slug}
                                />
                            </div>

                            {relatedCategory.slug && (
                                <section className="space-y-6 mt-4">
                                    <LazyBasketCardFetcher
                                        title={`More from ${productDetails.brand?.name || "Brand"}`}
                                        slug={relatedCategory.slug}
                                        brandSlug={productDetails.brand?.slug}
                                    />
                                    {priceRange && (
                                        <LazyBasketCardFetcher
                                            title="Similar Price Range"
                                            slug={relatedCategory.slug}
                                            minPrice={priceRange.min}

                                        />
                                    )}
                                </section>
                            )}
                            {/* Compare Widget */}
                            {(
                                <LazyCompareProducts categorySlug={relatedCategory.slug} currentProductId={productDetails.id} />
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}