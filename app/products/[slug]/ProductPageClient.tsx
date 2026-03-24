// ProductPageClient.tsx
"use client";

import React, { useState, useEffect, useMemo } from "react";
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

const ProductSidebar = dynamic(() => import("./ProductSidebar"), {
    ssr: false,
    loading: () => <div className="animate-pulse bg-gray-100 rounded-2xl h-[400px] w-full" />,
});

import { trackViewContent } from "@/lib/Analytic";
import LazySection from "@/components/LazySection";
import { getCategoryProducts } from "@/app/api/services/category.service";
import SkeletonCard from "@/app/skeleton/SkeletonCard";

const BasketCard = dynamic(() => import("@/app/homepage/BasketCard"), { ssr: false });
const LazyCompareProducts = dynamic(() => import("./LazyCompareProducts"), { ssr: false });
const EmiWidget = dynamic(() => import("./EmiWidget"), { ssr: false });

export default function ProductPageClient({ productDetails }: { productDetails: any }) {
    const [selectedImage, setSelectedImage] = useState<string>("");
    const [selectedAttributes, setSelectedAttributes] = useState<Record<string, string>>({});
    const [quantity, setQuantity] = useState<number>(1);

    const { ref: belowFoldRef, inView: isBelowFoldInView } = useInView({
        triggerOnce: true,
        rootMargin: "300px",
    });

    const relatedCategory = productDetails.categories?.[0] || ({} as any);

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

    const priceRange = useMemo(() => {
        const currentPrice = productDetails.price?.current || productDetails.discounted_price || productDetails.price;
        if (!currentPrice || typeof currentPrice !== 'number') return null;
        return { min: currentPrice * 0.8, max: currentPrice * 1.2 };
    }, [productDetails]);

    return (
        <div className="min-h-screen bg-[#f7f7f8] pb-16">
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

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-2.5 mb-5">
                    <div className="md:col-span-1 lg:col-span-4">
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
                        />
                    </div>
                    <div className="hidden lg:block lg:col-span-3">
                        <ProductSidebar product={productDetails} />
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
                                {relatedCategory.slug && (
                                    <LazySection
                                        fetcher={() => getCategoryProducts(relatedCategory.slug, { brand: productDetails.brand?.slug, per_page: 10 }).then(r => r.data)}
                                        render={(data) => (
                                            <BasketCard
                                                title={`More from ${productDetails.brand?.name || "Brand"}`}
                                                slug={relatedCategory.slug}
                                                initialData={data}
                                            />
                                        )}
                                        fallback={<SkeletonCard />}
                                        minHeight="400px"
                                    />
                                )}

                                <LazySection fallback={<SkeletonCard />} minHeight="600px">
                                    <LazyCompareProducts categorySlug={relatedCategory.slug} currentProductId={productDetails.id} />
                                </LazySection>

                                {priceRange && relatedCategory.slug && (
                                    <LazySection
                                        fetcher={() => getCategoryProducts(relatedCategory.slug, { min_price: priceRange.min, max_price: priceRange.max, per_page: 10 }).then(r => r.data)}
                                        render={(data) => (
                                            <BasketCard
                                                title="Similar Price Range"
                                                slug={relatedCategory.slug}
                                                initialData={data}
                                            />
                                        )}
                                        fallback={<SkeletonCard />}
                                        minHeight="400px"
                                    />
                                )}

                                <LazySection fallback={<div className="h-64 animate-pulse bg-gray-50 rounded-xl" />} minHeight="400px">
                                    <EmiWidget price={Number(productDetails.price?.current || productDetails.discounted_price || productDetails.price)} />
                                </LazySection>
                            </section>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}