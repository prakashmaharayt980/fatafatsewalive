import React from 'react';
import { cn } from "@/lib/utils";
import { Heart, Star, Scale } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import type { BasketProduct } from "@/app/types/ProductDetailsTypes";
import { trackViewContent } from "@/lib/Analytic";
import { trackProductClick } from "@/lib/analytics";
import { placeholderimg } from "../CommonVue/Image";
import type { DecoratedProduct } from '../types/DecoratedProduct';
import { ProductCardSkeleton } from '../category/[slug]/components/Skeletons';

export interface ProductCardProps {
    product: DecoratedProduct;
    index?: number;
    priority?: boolean;
    isFirstSection?: boolean;
    hidePrice?: boolean;
    isWishlisted?: boolean;
    isCompared?: boolean;
    simple?: boolean;
    onWishlist?: (e: React.MouseEvent) => void;
    onCompare?: (e: React.MouseEvent) => void;
    onLoad?: () => void;
}

const ProductCard = ({
    product,
    index = 0,
    priority = false,
    isFirstSection = false,
    hidePrice = false,
    isWishlisted = false,
    isCompared = false,
    simple = false,
    onWishlist,
    onCompare,
    onLoad
}: ProductCardProps) => {

    if (!product || !product.id) {
        return <ProductCardSkeleton />;
    }

    const {
        basePrice,
        discountedPriceVal,
        discountPercent,
        emiPrice,
        isNew,
        isBestSeller,
        brandName,
        rating,
        ratingCount
    } = product;

    const hasCoupon = false;

    return (
        <div
            data-track={`product-card-${product.id}`}
            className="group relative w-full flex flex-col bg-white h-full shadow-sm hover:shadow-[0_0_20px_rgba(0,0,0,0.1)] hover:border-[var(--colour-fsP2)]/30 hover:-translate-y-1 transition-all duration-300 rounded-[12px] overflow-hidden border border-gray-100"
        >
            {/* Wishlist Button - Absolute Top Right */}
            <button
                className="absolute top-2 right-2 z-20 p-1.5 rounded-full bg-white/90 backdrop-blur-sm shadow-sm text-gray-400 hover:text-red-500 hover:scale-110 transition-all duration-200"
                onClick={onWishlist}
                aria-label="Add to wishlist"
            >
                <Heart className={cn("h-4 w-4 stroke-[2.5]", isWishlisted && "fill-red-500 text-red-500")} />
            </button>

            {/* Compare Button - Below Wishlist */}
            <button
                className={cn(
                    "absolute top-10 right-2 z-20 p-1.5 rounded-full bg-white/90 backdrop-blur-sm shadow-sm hover:scale-110 transition-all duration-200",
                    isCompared ? "text-[var(--colour-fsP2)]" : "text-gray-400 hover:text-[var(--colour-fsP2)]"
                )}
                onClick={onCompare}
                aria-label="Add to compare"
            >
                <Scale className="h-4 w-4 stroke-[2.5]" />
            </button>

            {/* Image Container - Aspect 5:4 */}
            <div className="relative w-full bg-white p-2 aspect-[2/2]">
                {/* Badges - Top Left */}
                <div className="absolute top-0 left-0 z-10 flex flex-col gap-1">
                    {/* Refined Best Seller Tag - Gold (Only if NOT New) */}
                    {isBestSeller && !isNew && (
                        <div className="bg-[#e9c10e] text-white text-[10px] font-bold px-3 py-1 rounded-tl-[10px] rounded-br-[10px] shadow-sm flex items-center gap-1 z-10">
                            <span>BESTSELLER</span>
                        </div>
                    )}
                    {/* New Tag - Green */}
                    {isNew && (
                        <div className="bg-[var(--colour-fsP2)] text-white text-[10px] font-bold px-3 py-1 rounded-tl-[10px] rounded-br-[10px] shadow-sm flex items-center gap-1 z-10">
                            <span>NEW</span>
                        </div>
                    )}
                </div>

                <div className="relative w-full h-full">
                    <Image
                        src={product.thumb?.url || placeholderimg}
                        alt={product.thumb?.alt_text || 'Product'}
                        fill
                        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 20vw"
                        className="object-contain transition-transform duration-500 group-hover:scale-105"
                        priority={isFirstSection && index < 2}
                        loading={isFirstSection && index < 2 ? undefined : 'lazy'}
                        onLoad={onLoad}
                    />
                </div>
            </div>

            {/* Content Container - Compact padding */}
            <div className="p-2 flex flex-col gap-0.5 flex-grow">
                {/* Brand Name */}
                <div className="flex justify-between items-start">
                    <div className="text-[11px] text-gray-700 font-bold uppercase tracking-wide">
                        {brandName}
                    </div>
                    {/* Ratings Row - Compact */}
                    {rating > 0 && (
                        <div className="flex items-center gap-1">
                            <div className="flex items-center gap-0.5 bg-[var(--colour-fsP2)] text-white px-1.5 py-0.5 rounded-[4px] shadow-sm">
                                <span className="text-[10px] font-extrabold">{rating}</span>
                                <Star className="w-2 h-2 fill-current" />
                            </div>
                            <span className="text-[10px] text-gray-600 font-medium">({ratingCount})</span>
                        </div>
                    )}
                </div>

                {/* Title */}
                <h3
                    className="text-[13px] sm:text-[14px] font-bold text-gray-800 leading-snug line-clamp-2 min-h-[2.6em] group-hover:text-[var(--colour-fsP2)] transition-colors mt-0.5"
                    title={product.name}
                >
                    <Link
                        href={`/products/${product.slug}`}
                        className="focus:outline-none"
                        onClick={() => {
                            trackViewContent(product);
                            trackProductClick({
                                id: product.id.toString(),
                                name: product.name,
                                price: basePrice,
                                category: 'category' in product ? 'category' : undefined,
                            });
                        }}
                    >
                        <span aria-hidden="true" className="absolute inset-0 z-10" />
                        {product.name}
                    </Link>
                </h3>

                {/* Price Section */}
                {!hidePrice && (
                    <div className="mt-1 space-y-0.5">
                        <div className="flex items-baseline gap-2">
                            <span className="text-base sm:text-lg font-extrabold text-[#1f2937]">
                                Rs. {product.displayPrice}
                            </span>
                        </div>

                    </div>
                )}

                {/* Coupon Badge - Green & Cutout style */}
                {hasCoupon && (
                    <div className="mt-1.5 flex items-center gap-3">
                        <div className="relative bg-green-50 border border-green-200 text-green-700 text-[10px] font-bold px-2 py-0.5 rounded-sm border-dashed flex items-center gap-1 w-fit">
                            <span className="w-1.5 h-1.5 rounded-full bg-white border border-green-200 absolute -left-1 top-1/2 -translate-y-1/2"></span>
                            Save Rs. 200 with Coupon
                            <span className="w-1.5 h-1.5 rounded-full bg-white border border-green-200 absolute -right-1 top-1/2 -translate-y-1/2"></span>
                        </div>
                        <div className="relative bg-green-50 border border-green-200 text-green-700 text-[10px] font-bold px-2 py-0.5 rounded-sm border-dashed flex items-center gap-1 w-fit">
                            <span className="w-1.5 h-1.5 rounded-full bg-white border border-green-200 absolute -left-1 top-1/2 -translate-y-1/2"></span>
                            Save Rs. 400 with Coupon
                            <span className="w-1.5 h-1.5 rounded-full bg-white border border-green-200 absolute -right-1 top-1/2 -translate-y-1/2"></span>
                        </div>
                    </div>
                )}

                {/* EMI & Delivery - Modified EMI Size */}
                <div className="flex flex-wrap gap-1 mt-1.5">
                    {/* EMI Calculation Badge - Increased Font Size */}
                    {product.emi_enabled ? (
                        <span className="inline-flex items-center text-[12px] font-semibold text-white bg-[#1967b3] px-1.5 py-0.5 rounded-sm shadow-sm">
                            EMI fr. Rs. {(emiPrice ?? 0).toLocaleString()}
                        </span>
                    ) : null}
                    <span className="inline-flex items-center text-[12px] font-semibold text-black bg-[#e9d26c] px-1.5 py-0.5 rounded-sm shadow-sm">
                        Fatafat Delivery
                    </span>
                </div>
            </div>
        </div>
    );
};
export default React.memo(ProductCard);