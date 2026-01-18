"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Star, ChevronRight, ShoppingBasket, CreditCard, Scale } from "lucide-react";
import { useInView } from "react-intersection-observer";
import Link from "next/link";
import ImageGallery from "./ImageGallery";
import ProductInfo from "./ProductInfo";
import MoreDetailsProduct from "./MoreDetailsProduct";
import RelatedProducts from "./RelatedProducts";
import SimilarCompare from "./SimilarCompare";
import ProductKeySpecs from "./ProductKeySpecs";
import OurArticles from "@/app/homepage/OurArticles";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { useContextCart } from "@/app/checkout/CartContext1";
import { useRouter } from "next/navigation";
import { useContextEmi } from "@/app/emi/emiContext";
import { CustomVariantGroup, ProductDetails, ProductDisplayState } from "@/app/types/ProductDetailsTypes";

interface ProductPageClientProps {
    productDetails: ProductDetails;
}

export default function ProductPageClient({ productDetails }: ProductPageClientProps) {
    const [selectedImage, setSelectedImage] = useState<string>("");
    const [selectedVariant, setSelectedVariant] = useState<any>(null);
    const [quantity, setQuantity] = useState<number>(1);
    const [productDisplay, setProductDisplay] = useState<ProductDisplayState | null>(null)
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

    const { addToCart, compareItems } = useContextCart();
    const { setEmiContextInfo, addToCompare } = useContextEmi(); // Assuming addToCompare is here or similar
    const router = useRouter();

    const { ref: mainProductRef, inView: isMainVisible } = useInView({
        initialInView: true,
        rootMargin: "-200px 0px 0px 0px",
    });

    const handlerouter = (path: string) => {
        router.push(path);
    };

    // Helper function to normalize specifications/attributes format
    const normalizeData = (data: any): Record<string, string> => {
        if (!data) return {};
        if (typeof data === 'object' && !Array.isArray(data)) {
            if ('items' in data || 'title' in data) {
                const result: Record<string, string> = {};
                if (Array.isArray(data)) {
                    data.forEach((group: any) => {
                        if (group.items && Array.isArray(group.items)) {
                            group.items.forEach((item: any) => {
                                if (item.name && item.content) {
                                    result[item.name] = item.content;
                                }
                            });
                        }
                    });
                } else if (data.items && Array.isArray(data.items)) {
                    data.items.forEach((item: any) => {
                        if (item.name && item.content) {
                            result[item.name] = item.content;
                        }
                    });
                }
                return result;
            }
            const result: Record<string, string> = {};
            Object.entries(data).forEach(([key, value]) => {
                if (typeof value === 'string') {
                    result[key] = value;
                } else if (value !== null && value !== undefined) {
                    result[key] = String(value);
                }
            });
            return result;
        }
        return {};
    };

    useEffect(() => {
        if (productDetails) {
            // Initialize state from props
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

    const renderRating = (rating: number, size = 12) => (
        <div className="flex items-center space-x-1" aria-label={`${rating} out of 5 stars`}>
            {[...Array(5)].map((_, i) => (
                <Star
                    key={i}
                    size={size}
                    className={`transition-all duration-200 ${i < Math.floor(rating)
                        ? "text-yellow-400 fill-yellow-400 drop-shadow-sm"
                        : "text-gray-300 hover:text-yellow-200"
                        }`}
                    aria-hidden="true"
                />
            ))}
        </div>
    );

    if (!productDisplay) return null; // Should not happen if productDetails is provided but good for Type Safety state init

    return (
        <div className="min-h-screen h-full bg-gradient-to-br from-gray-50 to-white pb-20">
            {/* Sticky Bottom Bar */}
            <div
                className={`fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-lg shadow-[0_-4px_20px_-5px_rgba(0,0,0,0.15)] border-t border-slate-100 transform transition-all duration-300 ${!isMainVisible ? "translate-y-0 opacity-100" : "translate-y-full opacity-0"
                    }`}
            >
                <div className="max-w-7xl mx-auto px-3 sm:px-4 py-2.5 sm:py-3">
                    {/* Mobile Layout */}
                    <div className="flex items-center gap-3">
                        {/* Product Info */}
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                            <div className="w-11 h-11 sm:w-12 sm:h-12 relative rounded-lg overflow-hidden bg-white border border-slate-100 flex-shrink-0">
                                {selectedImage ? (
                                    <Image
                                        src={selectedImage}
                                        alt={productDetails.name}
                                        fill
                                        className="object-contain p-1"
                                    />
                                ) : (
                                    <div className="w-full h-full bg-gray-50 flex items-center justify-center">
                                        <ShoppingBasket className="w-4 h-4 text-gray-300" />
                                    </div>
                                )}
                            </div>
                            <div className="min-w-0 hidden sm:block">
                                <h3 className="text-xs sm:text-sm font-semibold truncate text-slate-800 max-w-[150px] lg:max-w-[250px]">{productDetails.name}</h3>
                                <p className="text-blue-600 font-bold text-sm">
                                    Rs {(selectedVariant?.discounted_price || productDetails.discounted_price || productDetails.price).toLocaleString()}
                                </p>
                            </div>
                            {/* Mobile only price */}
                            <div className="sm:hidden">
                                <p className="text-blue-600 font-bold text-sm">
                                    Rs {(selectedVariant?.discounted_price || productDetails.discounted_price || productDetails.price).toLocaleString()}
                                </p>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center gap-2">
                            {/* Compare button - hidden on very small screens */}
                            <button
                                className="hidden sm:flex items-center justify-center w-10 h-10 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300 transition-all"
                                onClick={() => {
                                    const currentIds = compareItems?.map((i: any) => i.id) || [];
                                    const newIds = Array.from(new Set([...currentIds, productDetails.id])).join(',');
                                    router.push(`/compare?ids=${newIds}`);
                                }}
                                title="Compare"
                            >
                                <Scale className="w-4 h-4" />
                            </button>

                            {/* EMI button - if enabled */}
                            {productDetails.emi_enabled === 1 && (
                                <button
                                    className="hidden xs:flex items-center justify-center gap-1.5 px-3 h-10 rounded-lg bg-[var(--colour-fsP2)] text-white font-semibold text-xs hover:bg-red-600 transition-all"
                                    onClick={() => {
                                        router.push(`/emi/applyemi?slug=${productDetails.slug}&id=${productDetails.id}`);
                                    }}
                                >
                                    <CreditCard className="w-3.5 h-3.5" />
                                    <span className="hidden sm:inline">EMI</span>
                                </button>
                            )}

                            {/* Add to Cart - main action */}
                            <button
                                className={cn(
                                    "flex items-center justify-center gap-1.5 px-4 sm:px-5 h-10 sm:h-11",
                                    "rounded-lg font-bold text-xs sm:text-sm transition-all",
                                    "bg-blue-600 text-white shadow-md shadow-blue-200 hover:bg-blue-700 hover:shadow-lg"
                                )}
                                onClick={() => addToCart(productDetails.id, quantity)}
                            >
                                <ShoppingBasket className="w-4 h-4" />
                                <span>Add to Cart</span>
                            </button>
                        </div>
                    </div>
                </div>
                <div className="h-[env(safe-area-inset-bottom)] bg-white"></div>
            </div>

            <div className="max-w-7xl mx-auto px-2 sm:px-4 md:px-6 lg:px-8 py-2 sm:py-4">
                {/* Breadcrumb */}
                <div className=" mx-auto mb-8">
                    <nav className="flex items-center space-x-2 text-sm text-gray-500 animate-in slide-in-from-left-4 duration-500">
                        <Link
                            href="/"
                            className="hover:text-[var(--colour-fsP1)] transition-colors font-medium "
                        >
                            Home
                        </Link>
                        <ChevronRight className="w-4 h-4 text-gray-300" />
                        <Link
                            href={`/category/${productDetails.categories?.[0]?.slug || ''}`} // Safety check
                            className="hover:text-[var(--colour-fsP1)] transition-colors font-medium"
                        >
                            {productDetails.categories?.map((category) => category.title).join(" ") || 'Category'}
                        </Link>
                        <ChevronRight className="w-4 h-4 text-gray-300" />
                        <span className="text-gray-900 font-semibold truncate max-w-xs">
                            {productDetails.name}
                        </span>
                    </nav>

                    {/* Main Product Section - 2:1 Layout */}
                    <div
                        ref={mainProductRef}
                        className="grid grid-cols-1 lg:grid-cols-5 gap-6 lg:gap-10 m-4 animate-in fade-in duration-700"
                    >
                        {/* Left Column: Image Gallery (3/5 width) */}
                        <div className="lg:col-span-3">
                            <ImageGallery
                                product={productDetails}
                                images={selectedVariant?.images?.map((i: any) => i.url) || []}
                                selectedImage={selectedImage}
                                setSelectedImage={setSelectedImage}
                            />
                        </div>
                        {/* Right Column: Sticky Sidebar (2/5 width) */}
                        <div className="lg:col-span-2">
                            <div className="lg:sticky lg:top-24 space-y-4">
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

                            </div>
                        </div>
                    </div>
                </div>

                {/* Product Highlights */}
                {productDetails.highlights && (
                    <div className="mt-12 animate-in slide-in-from-bottom-8 duration-700 delay-100">
                        <div className="max-w-2xl">
                            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                                <Star className="w-5 h-5 text-gray-900 fill-current" />
                                Product Highlights
                            </h3>
                            <div className="space-y-2">
                                {productDetails.highlights.split("|").map((highlight, index) => (
                                    <div key={`highlight-${index}`} className="flex items-start gap-3 py-1">
                                        <div className="mt-2 w-1.5 h-1.5 rounded-full bg-gray-900 shrink-0" />
                                        <span className="text-sm font-medium text-gray-600 leading-relaxed">{highlight.trim()}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Product Details Tabs */}
            <div className="max-w-7xl mx-auto mb-16 animate-in slide-in-from-bottom-8 duration-700 delay-200">
                <MoreDetailsProduct
                    productDesciption={productDetails.description || productDetails.highlights}
                    keyFeatures={normalizeData(productDetails.attributes?.product_attributes)}
                    specifications={{}}
                    productID={productDetails.id}
                    product={productDetails}
                    categoryId={relatedCategory.id}
                />
            </div>

            {/* Similar Compare */}
            {relatedCategory.id && (
                <SimilarCompare currentProduct={productDetails} categoryId={relatedCategory.id} />
            )}

            {/* Lazy-Loaded Related Products */}
            <section className="max-w-7xl mx-auto space-y-12 animate-in slide-in-from-bottom-8 duration-700 delay-300" aria-label="Related Products">
                {relatedCategory && relatedCategory.id && (
                    <>
                        <div className="relative">
                            {/* <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent" /> */}
                            <RelatedProducts
                                title={`More from ${productDetails.brand?.name || 'Brand'}`}
                                slug={relatedCategory.slug}
                                id={relatedCategory.id}

                            />
                        </div>
                        <RelatedProducts
                            title="Products Related to this"
                            slug={relatedCategory.slug}
                            id={relatedCategory.id}
                        />
                    </>
                )}
            </section>

            {/* Blog Section */}
            <aside className="max-w-7xl mx-auto mt-16 pt-8" aria-label="Related Articles">
                <div className="flex items-center justify-between mb-8 px-4">
                    <h2 className="text-2xl font-bold text-gray-900 border-l-4 border-[var(--colour-fsP1)] pl-3">Latest from our Blog</h2>
                    <Link href="/blog" className="text-blue-600 text-sm font-medium hover:underline flex items-center gap-1 group">
                        View All <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </Link>
                </div>
                <OurArticles blogpage="product-page" />
            </aside>
        </div>
    );
}
