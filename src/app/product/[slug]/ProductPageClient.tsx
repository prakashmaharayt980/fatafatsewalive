// ProductPageClient.tsx
"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Star, ChevronRight, Scale, Share2 } from "lucide-react";
import Link from "next/link";
import ImageGallery from "./ImageGallery";
import ProductInfo from "./ProductInfo";
import MoreDetailsProduct from "./MoreDetailsProduct";
import RelatedProducts from "./RelatedProducts";
import RelatedComparison from "./RelatedComparison";
import RelatedNews from "./RelatedNews";
import OurArticles from "@/app/homepage/OurArticles";
import SkeltonCard from "@/app/homepage/SkeltonCard";
import SkeltonBanner from "@/app/homepage/SkeltonBanner";
import LazyLoadSection from "@/components/LazyLoadSection";
import { cn } from "@/lib/utils";
import { useContextCart } from "@/app/checkout/CartContext1";
import { useRouter } from "next/navigation";
import { CustomVariantGroup, ProductDetails, ProductDisplayState } from "@/app/types/ProductDetailsTypes";

interface ProductPageClientProps {
    productDetails: ProductDetails;
}

export default function ProductPageClient({ productDetails }: ProductPageClientProps) {
    const [selectedImage, setSelectedImage] = useState<string>("");
    const [selectedVariant, setSelectedVariant] = useState<any>(null);
    const [quantity, setQuantity] = useState<number>(1);
    const [productDisplay, setProductDisplay] = useState<ProductDisplayState | null>(null);

    const relatedCategory = useMemo(() => {
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

    const renderRating = (rating: number, size = 12) => (
        <div className="flex items-center space-x-0.5">
            {[...Array(5)].map((_, i) => (
                <Star
                    key={i}
                    size={size}
                    className={cn(
                        i < Math.floor(rating)
                            ? "text-amber-400 fill-amber-400"
                            : "text-gray-300"
                    )}
                />
            ))}
        </div>
    );

    useEffect(() => {
        if (productDetails) {
            setSelectedImage(productDetails.image?.full);

            const managedVariants: CustomVariantGroup[] = productDetails.variants.map((variant) => {
                const variantColor = variant.attributes?.Color;
                let variantImages = productDetails.images
                    .filter((img: any) => {
                        const imgColor = img.color || img.custom_properties?.color;
                        return imgColor === variantColor;
                    })
                    .map((img: any) => ({
                        url: img.url,
                        thumb: img.thumb,
                        isDefault: img.custom_properties?.is_default || false
                    }));

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

    if (!productDisplay) return null;

    return (
        <div className="min-h-screen bg-gray-50 pb-24 sm:pb-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                {/* Breadcrumb */}
                <nav className="flex items-center gap-1.5 text-sm text-gray-500 mb-4 overflow-x-auto pb-1 scrollbar-hide">
                    <Link href="/" className="hover:text-[var(--colour-fsP1)] whitespace-nowrap text-xs">Home</Link>
                    <ChevronRight className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                    <Link href={`/category/${productDetails.categories?.[0]?.slug || ''}`} className="hover:text-[var(--colour-fsP1)] whitespace-nowrap text-xs">
                        {productDetails.categories?.[0]?.title || 'Category'}
                    </Link>
                    <ChevronRight className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                    <span className="text-gray-700 font-medium truncate max-w-[150px] sm:max-w-[250px] text-xs">{productDetails.name}</span>
                </nav>

                {/* Product Title Row */}
                <div className="flex items-start justify-between gap-4 mb-6">
                    <h1 className="text-xl sm:text-2xl font-bold text-slate-900 leading-tight">{productDetails.name}</h1>
                    <div className="flex items-center gap-2 flex-shrink-0">
                        <button
                            onClick={() => {
                                const currentIds = compareItems?.map((i: any) => i.id) || [];
                                const newIds = Array.from(new Set([...currentIds, productDetails.id])).join(',');
                                router.push(`/compare?ids=${newIds}`);
                            }}
                            className="flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-[var(--colour-fsP2)] transition-colors"
                        >
                            <Scale className="w-4 h-4" />
                            <span className="hidden sm:inline">Compare</span>
                        </button>
                        <button className="flex items-center text-slate-500 hover:text-[var(--colour-fsP2)] transition-colors">
                            <Share2 className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                {/* Main Content - 3 Column Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    {/* Left Column - Image Gallery */}
                    <div className="lg:col-span-4">
                        <div className="lg:sticky lg:top-20">
                            <ImageGallery
                                product={productDetails}
                                images={selectedVariant?.images?.map((i: any) => i.url) || []}
                                selectedImage={selectedImage}
                                setSelectedImage={setSelectedImage}
                            />
                        </div>
                    </div>

                    {/* Middle Column - Product Info */}
                    <div className="lg:col-span-5">
                        <ProductInfo
                            product={productDetails}
                            productDisplay={productDisplay}
                            selectedVariant={selectedVariant}
                            setSelectedVariant={setSelectedVariant}
                            selectedImage={selectedImage}
                            setSelectedImage={setSelectedImage}
                            quantity={quantity}
                            setQuantity={setQuantity}
                            renderRating={renderRating}
                        />

                        {/* Product Description Preview */}
                        {productDetails.description && (
                            <div className="mt-6 pt-5 border-t border-gray-200">
                                <p className="text-sm text-slate-600 leading-relaxed line-clamp-3">
                                    {productDetails.description?.replace(/<[^>]*>/g, '').slice(0, 200)}...
                                </p>
                                <a href="#specifications" className="text-xs font-semibold text-[var(--colour-fsP2)] hover:underline mt-2 inline-block">
                                    Read more
                                </a>
                            </div>
                        )}
                    </div>

                    {/* Right Column - Sidebar */}
                    <div className="lg:col-span-3 space-y-4">
                        <RelatedNews productName={productDetails.name} />
                        <RelatedComparison
                            currentProduct={productDetails}
                            categoryId={relatedCategory.id}
                        />
                    </div>
                </div>

                {/* Product Details Section */}
                <div className="mt-10">
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
                    <section className="mt-10 space-y-8">
                        {/* Same Brand */}
                        <LazyLoadSection fallback={<SkeltonCard />}>
                            <RelatedProducts
                                title={`More from ${productDetails.brand?.name || 'Brand'}`}
                                slug={relatedCategory.slug}
                                id={relatedCategory.id}
                                brandSlug={productDetails.brand?.slug}
                            />
                        </LazyLoadSection>

                        {/* Similar Price Range */}
                        {priceRange && (
                            <LazyLoadSection fallback={<SkeltonCard />}>
                                <RelatedProducts
                                    title="Similar Price Range"
                                    slug={relatedCategory.slug}
                                    id={relatedCategory.id}
                                    minPrice={priceRange.min}
                                    maxPrice={priceRange.max}
                                />
                            </LazyLoadSection>
                        )}

                        {/* General Related */}
                        <LazyLoadSection fallback={<SkeltonCard />}>
                            <RelatedProducts
                                title="Related Products"
                                slug={relatedCategory.slug}
                                id={relatedCategory.id}
                            />
                        </LazyLoadSection>
                    </section>
                )}

                {/* Blog Section */}
                <aside className="mt-12 pt-8 border-t border-gray-200">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-lg font-bold text-gray-900">Latest from Blog</h2>
                        <Link href="/blog" className="text-xs font-medium text-[var(--colour-fsP2)] hover:underline flex items-center gap-1">
                            View All <ChevronRight className="w-3.5 h-3.5" />
                        </Link>
                    </div>
                    <LazyLoadSection fallback={<SkeltonBanner />}>
                        <OurArticles blogpage="product-page" />
                    </LazyLoadSection>
                </aside>
            </div>

            {/* Mobile Sticky Bottom Bar */}
            <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 sm:hidden pb-[env(safe-area-inset-bottom)]">
                <div className="flex items-center gap-3 px-4 py-3">
                    <div className="flex-1 min-w-0">
                        <p className="text-xs text-slate-500 truncate">{productDetails.name}</p>
                        <p className="text-base font-bold text-[var(--colour-fsP2)]">
                            Rs. {(selectedVariant?.discounted_price || productDetails.discounted_price || productDetails.price).toLocaleString()}
                        </p>
                    </div>
                    <button
                        className="px-5 py-2.5 bg-[var(--colour-fsP1)] text-white font-bold text-sm rounded-lg flex-shrink-0"
                        onClick={() => addToCart(productDetails.id, quantity)}
                    >
                        Add to Cart
                    </button>
                </div>
            </div>
        </div>
    );
}