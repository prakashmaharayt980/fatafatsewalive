// ProductPageClient.tsx
"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import { ChevronRight, Scale, Share2, ShoppingBag, CreditCard } from "lucide-react";
import Link from "next/link";
import ProductMainImage from "./ProductMainImage";

import MoreDetailsProduct from "./MoreDetailsProduct";
import RelatedProducts from "./RelatedProducts";


import ProductBuyBox from "./ProductBuyBox";
import ProductSidebar from "./ProductSidebar";

import { useContextCart } from "@/app/checkout/CartContext1";
import { useRouter } from "next/navigation";
import { CustomVariantGroup, ProductDetails, ProductDisplayState } from "@/app/types/ProductDetailsTypes";

import { trackViewContent } from "@/lib/Analytic";

interface ProductPageClientProps {
    productDetails: ProductDetails;
}

export default function ProductPageClient({ productDetails }: ProductPageClientProps) {
    const [selectedImage, setSelectedImage] = useState<string>("");
    const [selectedVariant, setSelectedVariant] = useState<any>(null);
    const [quantity, setQuantity] = useState<number>(1);
    const [productDisplay, setProductDisplay] = useState<ProductDisplayState | null>(null);

    const relatedCategory = useMemo(() => {
        if (productDetails.related_products?.category) {
            return {
                id: String(productDetails.related_products.category.id),
                slug: productDetails.related_products.category.slug,
                name: productDetails.related_products.category.name,
            };
        }

        if (productDetails.categories && productDetails.categories.length > 0) {
            const firstCategory = productDetails.categories[0];
            return {
                id: String(firstCategory.id),
                slug: firstCategory.slug,
                name: firstCategory.title
            };
        }
        return { id: '', slug: '', name: '' };
    }, [productDetails]);

    // Calculate price range for "Similar Price" section (+/- 30%)
    const priceRange = useMemo(() => {
        const basePrice = productDetails.discounted_price || productDetails.price;
        if (!basePrice) return null;
        return {
            min: Math.floor(basePrice * 0.7),
            max: Math.ceil(basePrice * 1.3)
        };
    }, [productDetails.price, productDetails.discounted_price]);

    const { addToCart, compareItems } = useContextCart();
    const router = useRouter();

    // Track if BuyBox actions are visible (for desktop scroll bar)
    const buyBoxRef = useRef<HTMLDivElement>(null);
    const [isBuyBoxVisible, setIsBuyBoxVisible] = useState(true);

    useEffect(() => {
        const el = buyBoxRef.current;
        if (!el) return;
        const observer = new IntersectionObserver(
            ([entry]) => setIsBuyBoxVisible(entry.isIntersecting),
            { threshold: 0 }
        );
        observer.observe(el);
        return () => observer.disconnect();
    }, []);

    useEffect(() => {
        if (productDetails) {
            trackViewContent(productDetails);
            setSelectedImage(productDetails.image?.full);

            const managedVariants: CustomVariantGroup[] = productDetails.variants.map((variant) => {
                const variantColor = variant.attributes?.Color || "Default";
                const normalizedVariantColor = variantColor.toLowerCase().trim();

                // 1. Get images directly from the variant object
                const directVariantImages = [];
                if (variant.image?.full) {
                    directVariantImages.push({
                        url: variant.image.full,
                        thumb: variant.image.thumb || variant.image.full,
                        isDefault: true
                    });
                }

                // Check for 'images' array in variant (if it exists in API response)
                if ((variant as any).images && Array.isArray((variant as any).images)) {
                    (variant as any).images.forEach((img: any) => {
                        directVariantImages.push({
                            url: img.url,
                            thumb: img.thumb || img.url,
                            isDefault: false
                        });
                    });
                }

                // 2. Get images from global productDetails.images that match this variant's color
                const globalVariantImages = productDetails.images
                    ?.filter((img: any) => {
                        const imgColor = img.color || img.custom_properties?.color;
                        return imgColor && imgColor.toLowerCase().trim() === normalizedVariantColor;
                    })
                    .map((img: any) => ({
                        url: img.url,
                        thumb: img.thumb,
                        isDefault: img.custom_properties?.is_default || false
                    })) || [];

                // 3. Combine and Deduplicate by URL (Global FIRST to prioritize high quality)
                const allImages = [...globalVariantImages, ...directVariantImages];
                const uniqueImagesMap = new Map();
                allImages.forEach(img => {
                    if (!uniqueImagesMap.has(img.url)) {
                        uniqueImagesMap.set(img.url, img);
                    }
                });
                const variantImages = Array.from(uniqueImagesMap.values());

                // Sort: Default first
                variantImages.sort((a, b) => (b.isDefault === true ? 1 : 0) - (a.isDefault === true ? 1 : 0));

                return {
                    color: variantColor,
                    price: variant.price,
                    discounted_price: variant.discounted_price,
                    variantId: variant.id,
                    sku: variant.sku,
                    quantity: variant.quantity,
                    images: variantImages
                };
            });

            const uniqueManagedVariants = Array.from(new Map(managedVariants.map(v => [v.color, v])).values());

            setProductDisplay({
                mainImage: productDetails.image?.full,
                variantsByColor: uniqueManagedVariants
            });

            if (uniqueManagedVariants.length > 0) {
                setSelectedVariant(uniqueManagedVariants[0]);
                if (uniqueManagedVariants[0].images.length > 0) {
                    setSelectedImage(uniqueManagedVariants[0].images[0].url);
                }
            }
        }
    }, [productDetails]);

    // Show skeleton shell while client state initializes — prevents layout shift / CLS
    if (!productDisplay) {
        return (
            <div className="min-h-screen bg-gray-50 pb-20">
                <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    {/* Breadcrumb skeleton */}
                    <div className="flex gap-2 mb-6">
                        <div className="h-5 w-14 bg-gray-200 rounded animate-pulse" />
                        <div className="h-5 w-3 bg-gray-200 rounded animate-pulse" />
                        <div className="h-5 w-24 bg-gray-200 rounded animate-pulse" />
                        <div className="h-5 w-3 bg-gray-200 rounded animate-pulse" />
                        <div className="h-5 w-40 bg-gray-200 rounded animate-pulse" />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-4 md:gap-5 lg:gap-6">
                        {/* Image skeleton */}
                        <div className="md:col-span-1 lg:col-span-4">
                            <div className="w-full aspect-square max-h-[420px] bg-gray-200 rounded-2xl animate-pulse" />
                            <div className="flex gap-1.5 mt-2">
                                {[1, 2, 3, 4].map(i => <div key={i} className="w-14 h-14 bg-gray-200 rounded-lg animate-pulse" />)}
                            </div>
                        </div>
                        {/* BuyBox skeleton */}
                        <div className="md:col-span-1 lg:col-span-5">
                            <div className="bg-white rounded-2xl border border-gray-100 p-4 sm:p-6 space-y-4">
                                <div className="h-4 w-20 bg-gray-200 rounded animate-pulse" />
                                <div className="h-7 w-3/4 bg-gray-200 rounded animate-pulse" />
                                <div className="h-10 w-1/3 bg-gray-200 rounded animate-pulse" />
                                <div className="space-y-2">
                                    {[1, 2, 3].map(i => <div key={i} className="h-4 w-full bg-gray-100 rounded animate-pulse" />)}
                                </div>
                                <div className="flex gap-2 pt-2">
                                    <div className="h-11 flex-1 bg-gray-200 rounded-xl animate-pulse" />
                                    <div className="h-11 flex-1 bg-gray-200 rounded-xl animate-pulse" />
                                    <div className="h-11 flex-1 bg-gray-200 rounded-xl animate-pulse" />
                                </div>
                            </div>
                        </div>
                        {/* Sidebar skeleton */}
                        <div className="hidden lg:block lg:col-span-3">
                            <div className="bg-white rounded-2xl border border-gray-100 p-4 space-y-3">
                                <div className="h-5 w-28 bg-gray-200 rounded animate-pulse" />
                                <div className="w-full aspect-[16/9] bg-gray-200 rounded-xl animate-pulse" />
                                {[1, 2, 3].map(i => (
                                    <div key={i} className="flex gap-3">
                                        <div className="w-16 h-14 bg-gray-200 rounded-lg animate-pulse flex-shrink-0" />
                                        <div className="flex-1 space-y-2 py-1">
                                            <div className="h-3 w-full bg-gray-200 rounded animate-pulse" />
                                            <div className="h-3 w-2/3 bg-gray-200 rounded animate-pulse" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Build combined image list: ONLY images from `images[]` that match the selected color attribute.
    const globalImages = productDetails.images || [];
    const normalizedSelectedColor = selectedVariant?.color?.toLowerCase().trim() || "";

    // Get color-matched images from global images array (with full data for BuyBox)
    const colorMatchedGlobalImages = normalizedSelectedColor
        ? globalImages.filter((img: any) => {
            const imgColor = (img.color || img.custom_properties?.color || "").toLowerCase().trim();
            return imgColor === normalizedSelectedColor;
        })
        : [];

    // Get NEUTRAL images (no color assigned) to always show
    const neutralImages = globalImages.filter((img: any) => {
        const imgColor = (img.color || img.custom_properties?.color || "").toLowerCase().trim();
        return !imgColor;
    });

    // Images to show in gallery: ONLY color-matched from images[] array
    const colorMatchedUrls = colorMatchedGlobalImages.map((img: any) => img.url);
    const neutralUrls = neutralImages.map((img: any) => img.url);

    // Variant's own images
    const variantImageUrls = selectedVariant?.images?.map((i: any) => i.url) || [];

    // Build final list: variant images first, then color-matched global images (deduplicated)
    const seen = new Set<string>();
    const combinedImages: string[] = [];

    // If color-matched images exist, use ONLY those (strict mode)
    const hasColorImages = colorMatchedUrls.length > 0 || variantImageUrls.length > 0;

    let possibleImages: string[];
    if (normalizedSelectedColor) {
        // Strict: variant images + color-matched global images + neutral images
        possibleImages = [...variantImageUrls, ...colorMatchedUrls, ...neutralUrls];
    } else {
        // Fallback: no color data at all, show all images
        possibleImages = [
            ...variantImageUrls,
            productDetails.image?.full,
            ...globalImages.map((img: any) => img.url)
        ].filter(Boolean) as string[];
    }

    for (const url of possibleImages) {
        if (url && !seen.has(url)) {
            seen.add(url);
            combinedImages.push(url);
        }
    }

    // Color-matched image data to pass to BuyBox for thumbnail preview
    const colorImagesForBuyBox = colorMatchedGlobalImages.map((img: any) => ({
        url: img.url,
        thumb: img.thumb || img.url,
    }));

    return (
        <div className="min-h-screen bg-gray-50 pb-20">


            <div className="max-w-8xl mx-auto px-1 sm:px-2 lg:px-8 py-4">
                {/* Breadcrumb */}
                <nav className="flex items-center gap-1.5 text-sm mb-6 overflow-x-auto pb-1 scrollbar-hide">
                    <Link href="/" className="text-[var(--colour-fsP2)] hover:text-[var(--colour-fsP1)] whitespace-nowrap text-sm font-medium transition-colors">Home</Link>
                    <ChevronRight className="w-4 h-4 text-gray-400 flex-shrink-0" />
                    <Link href={`/category/${productDetails.categories?.[0]?.slug || ''}`} className="text-[var(--colour-fsP2)] hover:text-[var(--colour-fsP1)] whitespace-nowrap text-sm font-medium transition-colors">
                        {productDetails.categories?.[0]?.title || 'Category'}
                    </Link>
                    <ChevronRight className="w-4 h-4 text-gray-400 flex-shrink-0" />
                    <span className="text-slate-800 font-semibold truncate max-w-[180px] sm:max-w-[300px] text-sm">{productDetails.name}</span>
                </nav>

                {/* === MAIN CONTENT: 3-Column Layout (Gallery | Info | Sidebar) === */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-2 md:gap-3 lg:gap-3 mb-6">
                    {/* Column 1: Gallery (Image + Thumbs) - 3 cols */}
                    <div className="md:col-span-1 lg:col-span-3 relative">
                        <ProductMainImage
                            selectedImage={selectedImage}
                            setSelectedImage={setSelectedImage}
                            productName={productDetails.name}
                            fallbackImage={productDetails.image?.full}
                            productId={productDetails.id}
                            images={combinedImages}
                        />
                    </div>

                    {/* Column 2: Details + Actions - 6 cols */}
                    <div className="md:col-span-1 lg:col-span-6">
                        <ProductBuyBox
                            product={productDetails}
                            selectedVariant={selectedVariant}
                            setSelectedVariant={(v) => {
                                setSelectedVariant(v);
                                if (v.images?.length > 0) {
                                    setSelectedImage(v.images[0].url);
                                }
                            }}
                            productDisplay={productDisplay}
                            quantity={quantity}
                            setQuantity={setQuantity}
                            colorImages={colorImagesForBuyBox}
                            actionRef={buyBoxRef}
                        />
                    </div>

                    {/* Column 3: Sidebar (News, Compare, Deals) - 3 cols */}
                    <div className="hidden lg:block lg:col-span-3">
                        <ProductSidebar
                            product={productDetails}
                            relatedCategorySlug={relatedCategory.slug}
                            categoryId={relatedCategory.id}
                        />
                    </div>
                </div>

                {/* === BELOW ROW: Details, Specifications, Full Reviews === */}
                <div className="bg-white rounded shadow-sm border border-gray-100 px-2 py-3 sm:p-6 mb-8">
                    <MoreDetailsProduct
                        productDesciption={productDetails.description || productDetails.highlights || ''}
                        keyFeatures={productDetails.attributes?.product_attributes || {}}
                        specifications={{}}
                        productID={productDetails.id}
                        product={productDetails}
                        categoryId={relatedCategory.id}
                    />
                </div>

                {/* Related Products */}
                {relatedCategory.id && (
                    <section className="space-y-6">
                        <RelatedProducts
                            title={`More from ${productDetails.brand?.name || 'Brand'}`}
                            slug={relatedCategory.slug}
                            id={relatedCategory.id}
                            brandSlug={productDetails.brand?.slug}
                        />

                        {priceRange && (
                            <RelatedProducts
                                title="Similar Price Range"
                                slug={relatedCategory.slug}
                                id={relatedCategory.id}
                                minPrice={priceRange.min}
                                maxPrice={priceRange.max}
                            />
                        )}
                    </section>
                )}


            </div>


        </div>
    );
}