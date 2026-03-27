import { Heart, Scale, Star } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";

import { parseHighlights } from "@/app/CommonVue/highlights";
import type { ProductCardProps } from "../ProductCard";
import type { BasketProduct } from "@/app/types/ProductDetailsTypes";
import { cn } from "@/lib/utils";
import { useShallow } from "zustand/react/shallow";
import { useCartStore } from "@/app/context/CartContext";
import { useAuthStore } from "@/app/context/AuthContext";

const BlogProductCard = ({
    product,
    priority = false,
    hidePrice = false,
    isEmi = false,
}: ProductCardProps & { isEmi?: boolean }) => {
    const router = useRouter();

    const { user, triggerLoginAlert } = useAuthStore(
        useShallow((state) => ({
            user: state.user,
            triggerLoginAlert: state.triggerLoginAlert,
        }))
    );

    const {
        addToWishlist,
        removeFromWishlist,
        wishlistItems,
        addToCompare,
        removeFromCompare,
        compareItems,
    } = useCartStore(
        useShallow((state) => ({
            addToWishlist: state.addToWishlist,
            removeFromWishlist: state.removeFromWishlist,
            wishlistItems: state.wishlistItems,
            addToCompare: state.addToCompare,
            removeFromCompare: state.removeFromCompare,
            compareItems: state.compareItems,
        }))
    );

    if (!product || !product.id) return null;

    const isWishlisted = wishlistItems.some((i) => i.id === product.id);
    const isCompared = compareItems.some((i) => i.id === product.id);

    // Price extraction
    const extractPrice = (p: any): number => {
        if (typeof p === "number") return p;
        if (typeof p === "string") return parseFloat(p) || 0;
        if (typeof p === "object" && p !== null) {
            const val = p.current ?? p.price ?? p.original_price ?? p.value ?? 0;
            return typeof val === "number" ? val : parseFloat(String(val)) || 0;
        }
        return 0;
    };

    const originalPrice =
        (product as any).basePrice ?? extractPrice(product.price);
    const discountedPrice =
        (product as any).discountedPriceVal ??
        extractPrice((product as any).discounted_price || product.price);
    const hasDiscount = originalPrice > discountedPrice;
    const discountPercent =
        (product as any).discountPercent ??
        (hasDiscount
            ? Math.round(((originalPrice - discountedPrice) / originalPrice) * 100)
            : 0);
    const displayPrice =
        (product as any).displayPrice ??
        (discountedPrice || originalPrice).toLocaleString();

    const imageUrl =
        product.thumb?.url ||
        (product as any).image?.thumb ||
        (product as any).image?.full ||
        (product as any).thumb_url ||
        "/images/placeholder.svg";

    const rating = product.average_rating || 0;
    const ratingCount = (product as any).rating_count || 0;
    const fullStars = Math.floor(rating);
    const hasHalf = rating - fullStars >= 0.5;

    const highlights = parseHighlights((product as any).highlights, 2);

    const handleProductClick = () => {
        if (!product.slug) return;
        router.push(`/products/${product.slug}`);
    };

    const handleWishlistClick = async (e: React.MouseEvent) => {
        e.stopPropagation();
        if (isWishlisted) {
            await removeFromWishlist(product.id);
        } else {
            await addToWishlist(
                product.id,
                user,
                triggerLoginAlert,
                product as unknown as BasketProduct
            );
        }
    };

    const handleCompareClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (isCompared) removeFromCompare(product.id);
        else addToCompare(product);
    };

    return (
        <div
            onClick={handleProductClick}
            className="group relative cursor-pointer flex flex-col bg-white h-full rounded-xl overflow-hidden border border-[var(--colour-border3)] hover:border-[var(--colour-fsP2)]/30 hover:shadow-md transition-all duration-200"
        >
            {/* ── Action buttons ── */}
            <div className="absolute top-2 right-2 z-20 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
                <button
                    onClick={handleWishlistClick}
                    aria-label="Wishlist"
                    className={cn(
                        "w-7 h-7 flex items-center justify-center rounded-full bg-white shadow-sm border border-[var(--colour-border3)] transition-colors",
                        isWishlisted
                            ? "text-red-500 border-red-200"
                            : "text-[var(--colour-text3)] hover:text-red-500"
                    )}
                >
                    <Heart
                        className={cn("w-3.5 h-3.5", isWishlisted && "fill-red-500")}
                    />
                </button>
                <button
                    onClick={handleCompareClick}
                    aria-label="Compare"
                    className={cn(
                        "w-7 h-7 flex items-center justify-center rounded-full bg-white shadow-sm border border-[var(--colour-border3)] transition-colors",
                        isCompared
                            ? "text-[var(--colour-fsP2)] border-[var(--colour-fsP2)]/30"
                            : "text-[var(--colour-text3)] hover:text-[var(--colour-fsP2)]"
                    )}
                >
                    <Scale
                        className={cn("w-3.5 h-3.5", isCompared && "fill-current")}
                    />
                </button>
            </div>

            {/* ── Discount badge ── */}
            {hasDiscount && discountPercent > 0 && (
                <span className="absolute top-2 left-2 z-10 text-[9px] font-bold text-white bg-[var(--colour-fsP1)] px-1.5 py-0.5 rounded-md">
                    -{discountPercent}%
                </span>
            )}

            {/* ── Image ── */}
            <div className="relative aspect-square w-full bg-[var(--colour-bg4)]">
                <Image
                    src={imageUrl}
                    alt={product.name || "Product"}
                    fill
                    className="object-contain p-3 mix-blend-multiply group-hover:scale-[1.04] transition-transform duration-300"
                    priority={priority}
                    sizes="(max-width: 640px) 50vw, 25vw"
                />
            </div>

            {/* ── Body ── */}
            <div className="flex flex-col gap-1 p-2.5 flex-grow">

                {/* Rating */}
                {ratingCount > 0 && (
                    <div className="flex items-center gap-1">
                        <div className="flex items-center gap-px">
                            {[...Array(5)].map((_, i) => (
                                <Star
                                    key={i}
                                    className={cn(
                                        "w-2.5 h-2.5",
                                        i < fullStars
                                            ? "text-amber-400 fill-amber-400"
                                            : i === fullStars && hasHalf
                                                ? "text-amber-400 fill-amber-200"
                                                : "text-gray-200 fill-gray-200"
                                    )}
                                />
                            ))}
                        </div>
                        <span className="text-[10px] text-[var(--colour-text3)]">
                            ({ratingCount})
                        </span>
                    </div>
                )}

                {/* Title */}
                <h3
                    className="text-[12px] font-semibold text-[var(--colour-text2)] leading-snug line-clamp-2 group-hover:text-[var(--colour-fsP2)] transition-colors"
                    title={product.name}
                >
                    {product.name}
                </h3>

                {/* Highlights — max 2, minimal pill */}
                {highlights.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                        {highlights.map((h, i) => (
                            <span
                                key={i}
                                className="text-[9px] text-[var(--colour-text3)] bg-[var(--colour-bg4)] px-1.5 py-0.5 rounded border border-[var(--colour-border3)] leading-none"
                            >
                                {h}
                            </span>
                        ))}
                    </div>
                )}

                {/* Price block */}
                {!hidePrice && (
                    <div className="mt-auto pt-2">
                        <div className="flex items-baseline gap-1.5 flex-wrap">
                            <span className="text-[13px] font-bold text-[var(--colour-text1)]">
                                Rs.&nbsp;{displayPrice}
                            </span>
                            {hasDiscount && (
                                <span className="text-[10px] text-[var(--colour-text3)] line-through">
                                    Rs.&nbsp;{originalPrice.toLocaleString()}
                                </span>
                            )}
                            {hasDiscount && (
                                <span className="text-[10px] font-semibold text-green-600 ml-auto">
                                    -{discountPercent}% off
                                </span>
                            )}
                        </div>
                        {isEmi && (
                            <p className="text-[10px] text-[var(--colour-fsP2)] font-medium mt-0.5">
                                EMI from Rs.&nbsp;{Math.round(discountedPrice / 18).toLocaleString()}/mo
                            </p>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default BlogProductCard;