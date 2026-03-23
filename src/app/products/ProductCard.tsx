import React from 'react';
import { cn } from "@/lib/utils";
import { Heart, Star, Scale } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { ProductDetails, ProductSummary, BasketProduct } from "@/app/types/ProductDetailsTypes";
import { trackViewContent } from "@/lib/Analytic";
import { trackProductClick } from "@/lib/analytics";
import { placeholderimg } from "../CommonVue/Image";
import { useShallow } from 'zustand/react/shallow';
import { useCartStore } from '../context/CartContext';
import { useAuthStore } from '../context/AuthContext';
export interface ProductCardProps {
    product: BasketProduct;
    index?: number;
    priority?: boolean;
    hidePrice?: boolean;
}

const ProductCard = ({ product, index, priority = false, hidePrice = false }: ProductCardProps) => {
    const { user, triggerLoginAlert } = useAuthStore(useShallow(state => ({
        user: state.user,
        triggerLoginAlert: state.triggerLoginAlert
    })));

    const {
        addToWishlist,
        wishlistItems,
        addToCompare,
        removeFromCompare,
        isInCompare
    } = useCartStore(useShallow(
        state => ({
            addToWishlist: state.addToWishlist,
            wishlistItems: state.wishlistItems,
            addToCompare: state.addToCompare,
            removeFromCompare: state.removeFromCompare,
            isInCompare: state.isInCompare
        })
    ));

    if (!product || !product.id) {
        return null;
    }

    const basePrice = typeof product.price === "object" ? Number((product.price as any).current || 0) : Number(product.price || 0);
    const discountedPriceVal = 'discounted_price' in product && product.discounted_price ? Number(product.discounted_price) : basePrice;    // --- Derived Values & Mocks ---
    const isNew = product.created_at ? (new Date().getTime() - new Date(product.created_at).getTime()) < (30 * 24 * 60 * 60 * 1000) : false;
    const isBestSeller = index !== undefined && index < 2;

    // Resolve Brand
    const brandName = product.brand?.name || "Brand Name";

    const rating = product.average_rating || 0;
    const ratingCount = product.rating_count || 0;

    const hasCoupon = false; // Disable mock coupons since we want real data
    const emiPrice = Math.round(basePrice / 12);

    const handleAddToWishlist = async (e: React.MouseEvent, productId: number) => {
        e.stopPropagation();
        await addToWishlist(productId, user, triggerLoginAlert, product as BasketProduct);
    };

    const handleCompareClick = (e: React.MouseEvent, productId: number) => {
        e.stopPropagation();
        const isIn = isInCompare(productId);
        if (isIn) {
            removeFromCompare(productId);
        } else {
            addToCompare(product);
        }
    };
    const discountPercent = discountedPriceVal < basePrice ? Math.round(((basePrice - discountedPriceVal) / basePrice) * 100) : 0;

    return (
        <div
            data-track={`product-card-${product.id}`}
            className="group relative w-full flex flex-col bg-white h-full shadow-sm hover:shadow-[0_0_20px_rgba(0,0,0,0.1)] hover:border-[var(--colour-fsP2)]/30 hover:-translate-y-1 transition-all duration-300 rounded-[12px] overflow-hidden border border-gray-100"
        >
            {/* Wishlist Button - Absolute Top Right */}
            <button
                className="absolute top-2 right-2 z-20 p-1.5 rounded-full bg-white/90 backdrop-blur-sm shadow-sm text-gray-400 hover:text-red-500 hover:scale-110 transition-all duration-200"
                onClick={(e) => handleAddToWishlist(e, product.id)}
                aria-label="Add to wishlist"
            >
                <Heart className={cn("h-4 w-4 stroke-[2.5]", wishlistItems.some(i => i.id === product.id) && "fill-red-500 text-red-500")} />
            </button>

            {/* Compare Button - Below Wishlist */}
            <button
                className={cn(
                    "absolute top-10 right-2 z-20 p-1.5 rounded-full bg-white/90 backdrop-blur-sm shadow-sm hover:scale-110 transition-all duration-200",
                    isInCompare(product.id) ? "text-[var(--colour-fsP2)]" : "text-gray-400 hover:text-[var(--colour-fsP2)]"
                )}
                onClick={(e) => handleCompareClick(e, product.id)}
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

                <div className="relative w-full h-full  ">
                    <Image
                        src={product.thumb?.url || placeholderimg}
                        alt={product.thumb?.alt_text || 'Product'}
                        fill
                        className="object-contain  mix-blend-multiply transition-transform duration-500 group-hover:scale-105"
                        priority={priority}
                        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
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
                                Rs. {(discountedPriceVal < basePrice ? discountedPriceVal : basePrice).toLocaleString()}
                            </span>
                        </div>

                        {(discountedPriceVal < basePrice) ? (
                            <div className="flex items-center gap-2 text-[14px]">
                                <span className="text-gray-500 line-through decoration-gray-500 font-medium">
                                    Rs. {basePrice.toLocaleString()}
                                </span>
                                <span className="text-[var(--colour-fsP2)] font-bold bg-blue-50 px-1 py-0.5 rounded-sm">
                                    {discountPercent}% OFF
                                </span>
                            </div>
                        ) : null}
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
                            EMI fr. Rs. {emiPrice?.toLocaleString()}
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