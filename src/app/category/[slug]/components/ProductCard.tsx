'use client';

import React, { useState, useCallback, useMemo, memo } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useContextCart } from '@/app/checkout/CartContext1';
import { Heart, ShoppingBag, Star, Package, Scale } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Product } from '../types';
import { calculateDiscount, formatPrice } from '../utils';

interface ProductCardProps {
    product: Product;
    index?: number;
    priority?: boolean;
}

const ProductCard = memo(({ product, index = 0, priority = false }: ProductCardProps) => {
    const { addToCart, addToWishlist, removeFromWishlist, wishlistItems, addToCompare, compareItems, removeFromCompare } = useContextCart();
    const [imageLoaded, setImageLoaded] = useState(false);
    const [imageError, setImageError] = useState(false);
    const router = useRouter();

    const isWishlisted = useMemo(() => wishlistItems.some(i => i.id === product.id), [wishlistItems, product.id]);
    const isCompared = useMemo(() => compareItems?.some(i => i.id === product.id) ?? false, [compareItems, product.id]);

    const discount = useMemo(
        () => calculateDiscount(product.price, product.discounted_price),
        [product.price, product.discounted_price]
    );

    const displayPrice = useMemo(
        () => formatPrice(product.discounted_price || product.price),
        [product.discounted_price, product.price]
    );

    const originalPrice = useMemo(
        () =>
            product.discounted_price && product.price !== product.discounted_price
                ? formatPrice(product.price)
                : null,
        [product.discounted_price, product.price]
    );

    // Dynamic Mock Data for Content Richness
    const hasCoupon = (index ?? 0) % 3 === 0; // Every 3rd item gets coupons
    const computedRatingCount = Math.floor(product.average_rating > 0 ? (product.rating_count || Math.random() * 200 + 20) : 0);
    const mockRating = product.average_rating || (index && index % 2 === 0 ? 4.5 : 0);
    const mockRatingCount = product.average_rating ? computedRatingCount : (index && index % 2 === 0 ? 128 : 0);

    const handleCardClick = useCallback(() => {
        router.push(`/products/${product.slug}`);
    }, [router, product.slug, product.id]);

    const handleAddToCart = useCallback(
        async (e: React.MouseEvent) => {
            e.stopPropagation();
            await addToCart(product.id, 1);
        },
        [addToCart, product.id]
    );

    const handleWishlist = useCallback(
        async (e: React.MouseEvent) => {
            e.stopPropagation();
            if (isWishlisted) {
                await removeFromWishlist(product.id);
            } else {
                await addToWishlist(product.id);
            }
        },
        [isWishlisted, addToWishlist, removeFromWishlist, product.id]
    );

    const handleCompare = useCallback(
        async (e: React.MouseEvent) => {
            e.stopPropagation();
            if (isCompared) {
                await removeFromCompare(product.id);
            } else {
                await addToCompare(product as any);
                const currentIds = compareItems?.map((i: any) => i.id) || [];
                const newIds = Array.from(new Set([...currentIds, product.id])).join(',');
                router.push(`/compare?ids=${newIds}`);
            }
        },
        [isCompared, addToCompare, removeFromCompare, product, compareItems, router]
    );

    const imageUrl = product.image?.preview || product.image?.full;

    return (
        <article
            className="group flex flex-col bg-white border border-gray-100 rounded-md hover:shadow-md transition-shadow duration-300 cursor-pointer overflow-hidden p-3 relative h-full"
            style={{ animationDelay: `${(index % 12) * 50}ms` }}
            onClick={handleCardClick}
            role="link"
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && handleCardClick()}
        >
            {/* Top Left Badges */}
            <div className="absolute top-3 left-3 z-10 flex flex-col gap-1">
                {(index ?? 0) < 2 && (
                    <span className="bg-[var(--colour-fsP1)] flex items-center gap-1 text-white text-[10px] uppercase font-bold px-1.5 py-0.5 rounded-sm tracking-tight shadow-sm">
                        express
                    </span>
                )}
            </div>

            {/* Top Right Wishlist & Compare Icons */}
            <div className="absolute top-3 right-3 z-20 flex flex-col gap-2">
                <button
                    onClick={handleWishlist}
                    className="w-8 h-8 rounded-full bg-white/80 hover:bg-white flex items-center justify-center text-gray-400 hover:text-red-500 transition-all duration-200 shadow-sm border border-gray-100"
                    aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
                >
                    <Heart className={cn("w-4.5 h-4.5 stroke-[1.5]", isWishlisted && "fill-red-500 text-red-500")} />
                </button>
                <button
                    onClick={handleCompare}
                    className={cn(
                        "w-8 h-8 rounded-full bg-white/80 hover:bg-white flex items-center justify-center transition-all duration-200 shadow-sm border border-gray-100",
                        isCompared ? "text-[var(--colour-fsP2)] border-[var(--colour-fsP2)]" : "text-gray-400 hover:text-[var(--colour-fsP2)]"
                    )}
                    title={isCompared ? "Remove from Compare" : "Compare"}
                >
                    <Scale className="w-4.5 h-4.5 stroke-[1.5]" />
                </button>
            </div>

            {/* Image Area */}
            <div className="relative w-full aspect-square mb-3 mt-6 bg-white">
                {!imageLoaded && !imageError && (
                    <div className="absolute inset-0 bg-gray-50 animate-pulse rounded" />
                )}
                {imageError && (
                    <div className="absolute inset-0 flex items-center justify-center bg-gray-50 rounded">
                        <Package className="w-8 h-8 text-gray-200" />
                    </div>
                )}
                {imageUrl && (
                    <Image
                        src={imageUrl}
                        alt={product.name}
                        fill
                        sizes="(max-width: 768px) 50vw, 33vw"
                        priority={priority}
                        onLoad={() => setImageLoaded(true)}
                        onError={() => setImageError(true)}
                        className={cn(
                            'object-contain mix-blend-multiply transition-transform duration-500 group-hover:scale-105',
                            imageLoaded ? 'opacity-100' : 'opacity-0'
                        )}
                    />
                )}

                {/* Add to Cart Button (The +) */}
                <button
                    onClick={handleAddToCart}
                    className="absolute -bottom-2 -right-2 w-10 h-10 bg-white border border-gray-100 rounded-full flex items-center justify-center shadow-[0_2px_8px_rgba(0,0,0,0.08)] hover:shadow-[0_4px_12px_rgba(0,0,0,0.12)] text-gray-700 hover:text-[var(--colour-fsP2)] transition-all duration-300 z-20 group/add"
                    title="Add to Cart"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="transition-transform group-hover/add:scale-110">
                        <line x1="12" y1="5" x2="12" y2="19"></line>
                        <line x1="5" y1="12" x2="19" y2="12"></line>
                    </svg>
                </button>
            </div>

            {/* Content Body */}
            <div className="flex flex-col flex-1 text-left relative z-10 bg-white">
                {/* Brand or Title */}
                <h3 className="text-gray-900 text-[13px] leading-relaxed line-clamp-2 min-h-[40px] font-medium mb-1.5 group-hover:text-[var(--colour-fsP2)] transition-colors">
                    {product.name}
                </h3>

                {/* Rating line */}
                {mockRating > 0 && (
                    <div className="flex items-center gap-1 mb-2">
                        <span className="text-[var(--colour-fsP2)] font-bold text-[12px] flex items-center">
                            {mockRating.toFixed(1)} <Star className="w-3 h-3 ml-0.5" />
                        </span>
                        <span className="text-gray-400 text-[11px]">({mockRatingCount})</span>
                    </div>
                )}

                {/* Price Line */}
                <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-gray-900 font-extrabold text-[16px] xl:text-[20px] leading-none tracking-tight">
                        Rs. {displayPrice}
                    </span>
                    {discount > 0 && (
                        <span className="text-[var(--colour-fsP1)] font-bold text-[11px] bg-orange-50 px-1 py-0.5 rounded-sm">
                            {discount}% OFF
                        </span>
                    )}
                </div>

                {/* Free Delivery / Original Price */}
                <div className="flex flex-col mt-auto pt-2">
                    {originalPrice && (
                        <span className="text-gray-400 text-[11px] line-through mb-0.5">Rs. {originalPrice}</span>
                    )}
                    <span className="text-gray-500 text-[11px] flex items-center font-medium">
                        <span className="w-3.5 h-3.5 mr-1.5 text-gray-400/80">
                            <svg fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 0 1-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 0 0-3.213-9.193 2.056 2.056 0 0 0-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 0 0-10.026 0 1.106 1.106 0 0 0-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" />
                            </svg>
                        </span>
                        Free Delivery
                    </span>
                </div>

                {/* Footer Badges */}
                {hasCoupon && (
                    <div className="flex mt-2">
                        <span className="text-[var(--colour-fsP2)] text-[10px] border border-[var(--colour-fsP2)]/30 bg-[var(--colour-fsP2)]/5 px-1.5 py-0.5 rounded-sm flex items-center">
                            10% cashback <span className="font-bold ml-1 text-[var(--colour-fsP1)] bg-[var(--colour-fsP1)]/10 px-1 rounded-sm">+1</span>
                        </span>
                    </div>
                )}
            </div>
        </article>
    );
});

ProductCard.displayName = 'ProductCard';

export default ProductCard;

// ============================================
// PRODUCT CARD ROW (List View)
// ============================================
interface ProductCardRowProps {
    product: Product;
    index?: number;
    priority?: boolean;
}

export const ProductCardRow = memo(({ product, index = 0, priority = false }: ProductCardRowProps) => {
    const { addToCart, addToWishlist, removeFromWishlist, wishlistItems, addToCompare, compareItems, removeFromCompare } = useContextCart();
    const [imageLoaded, setImageLoaded] = useState(false);
    const [imageError, setImageError] = useState(false);
    const router = useRouter();

    const isWishlisted = useMemo(() => wishlistItems.some(i => i.id === product.id), [wishlistItems, product.id]);
    const isCompared = useMemo(() => compareItems?.some(i => i.id === product.id) ?? false, [compareItems, product.id]);

    const discount = useMemo(
        () => calculateDiscount(product.price, product.discounted_price),
        [product.price, product.discounted_price]
    );

    const displayPrice = useMemo(
        () => formatPrice(product.discounted_price || product.price),
        [product.discounted_price, product.price]
    );

    const originalPrice = useMemo(
        () =>
            product.discounted_price && product.price !== product.discounted_price
                ? formatPrice(product.price)
                : null,
        [product.discounted_price, product.price]
    );

    const highlights = useMemo(() => {
        if (!product.highlights) return [];
        return product.highlights
            .split(/[,;\n]+/)
            .map(h => h.trim())
            .filter(Boolean)
            .slice(0, 4);
    }, [product.highlights]);

    const handleCardClick = useCallback(() => {
        router.push(`/products/${product.slug}`);
    }, [router, product.slug, product.id]);

    const handleAddToCart = useCallback(
        async (e: React.MouseEvent) => {
            e.stopPropagation();
            await addToCart(product.id, 1);
        },
        [addToCart, product.id]
    );

    const handleWishlist = useCallback(
        async (e: React.MouseEvent) => {
            e.stopPropagation();
            if (isWishlisted) {
                await removeFromWishlist(product.id);
            } else {
                await addToWishlist(product.id);
            }
        },
        [isWishlisted, addToWishlist, removeFromWishlist, product.id]
    );

    const handleCompare = useCallback(
        async (e: React.MouseEvent) => {
            e.stopPropagation();
            if (isCompared) {
                await removeFromCompare(product.id);
            } else {
                await addToCompare(product as any);
                const currentIds = compareItems?.map((i: any) => i.id) || [];
                const newIds = Array.from(new Set([...currentIds, product.id])).join(',');
                router.push(`/compare?ids=${newIds}`);
            }
        },
        [isCompared, addToCompare, removeFromCompare, product, compareItems, router]
    );

    const imageUrl = product.image?.preview || product.image?.full;

    return (
        <article
            className="group flex flex-col sm:flex-row bg-white border border-gray-100 rounded-md hover:shadow-md transition-shadow duration-300 cursor-pointer overflow-hidden p-3 relative h-full gap-4"
            style={{ animationDelay: `${(index % 12) * 50}ms` }}
            onClick={handleCardClick}
            role="link"
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && handleCardClick()}
        >
            {/* Top Left Badges */}
            <div className="absolute top-3 left-3 z-10 flex flex-col gap-1">
                {(index ?? 0) < 2 && (
                    <span className="bg-[var(--colour-fsP1)] flex items-center gap-1 text-white text-[10px] uppercase font-bold px-1.5 py-0.5 rounded-sm tracking-tight shadow-sm">
                        express
                    </span>
                )}
            </div>

            {/* Top Right Wishlist Icons */}
            <div className="absolute top-3 right-3 z-20 flex flex-col sm:flex-row gap-2">
                <button
                    onClick={handleWishlist}
                    className="w-8 h-8 rounded-full bg-white/80 hover:bg-white flex items-center justify-center text-gray-400 hover:text-red-500 transition-all duration-200 shadow-sm border border-gray-100"
                    aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
                >
                    <Heart className={cn("w-4.5 h-4.5 stroke-[1.5]", isWishlisted && "fill-red-500 text-red-500")} />
                </button>
            </div>

            {/* Image Area */}
            <div className="relative w-full sm:w-40 aspect-square sm:aspect-auto sm:h-40 shrink-0 bg-white">
                {!imageLoaded && !imageError && (
                    <div className="absolute inset-0 bg-gray-50 animate-pulse rounded" />
                )}
                {imageError && (
                    <div className="absolute inset-0 flex items-center justify-center bg-gray-50 rounded">
                        <Package className="w-8 h-8 text-gray-200" />
                    </div>
                )}
                {imageUrl && (
                    <Image
                        src={imageUrl}
                        alt={product.name}
                        fill
                        sizes="(max-width: 640px) 100vw, 160px"
                        priority={priority}
                        onLoad={() => setImageLoaded(true)}
                        onError={() => setImageError(true)}
                        className={cn(
                            'object-contain mix-blend-multiply transition-transform duration-500 group-hover:scale-105',
                            imageLoaded ? 'opacity-100' : 'opacity-0'
                        )}
                    />
                )}
            </div>

            {/* Content Body */}
            <div className="flex flex-col flex-1 text-left relative z-10 bg-white justify-between">
                <div>
                    {/* Brand or Title */}
                    <h3 className="text-gray-900 text-[15px] leading-relaxed line-clamp-2 font-medium mb-2 group-hover:text-[var(--colour-fsP2)] transition-colors pr-8">
                        {product.name}
                    </h3>

                    {/* Rating line */}
                    {product.average_rating > 0 && (
                        <div className="flex items-center gap-1 mb-2">
                            <span className="text-[var(--colour-fsP2)] font-bold text-[12px] flex items-center">
                                {product.average_rating.toFixed(1)} <Star className="w-3 h-3 ml-0.5" />
                            </span>
                            <span className="text-gray-400 text-[11px]">({product.rating_count || 128})</span>
                        </div>
                    )}

                    {/* Highlights */}
                    {highlights.length > 0 && (
                        <ul className="hidden sm:flex flex-col gap-x-3 gap-y-1 mb-3">
                            {highlights.map((h, i) => (
                                <li key={i} className="flex items-center gap-1 text-[11px] text-gray-500 bg-gray-50 px-2 py-0.5 rounded-sm">
                                    <span className="w-1 h-1 rounded-full bg-gray-300 flex-shrink-0" />
                                    <span className="line-clamp-1">{h}</span>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>

                <div className="flex items-end justify-between mt-4">
                    <div className="flex flex-col">
                        {/* Price Line */}
                        <div className="flex items-center gap-2 mb-0.5">
                            <span className="text-gray-900 font-extrabold text-[18px] xl:text-[22px] leading-none tracking-tight">
                                Rs. {displayPrice}
                            </span>
                            {discount > 0 && (
                                <span className="text-[var(--colour-fsP1)] font-bold text-[11px] bg-orange-50 px-1 py-0.5 rounded-sm">
                                    {discount}% OFF
                                </span>
                            )}
                        </div>

                        {/* Free Delivery / Original Price */}
                        <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 mt-1.5 border-t border-gray-50 pt-1.5">
                            {originalPrice && (
                                <span className="text-gray-400 text-[11px] line-through">Rs. {originalPrice}</span>
                            )}
                            <span className="text-gray-500 text-[11px] flex items-center font-medium">
                                <span className="w-3.5 h-3.5 mr-1.5 text-gray-400/80">
                                    <svg fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 0 1-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 0 0-3.213-9.193 2.056 2.056 0 0 0-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 0 0-10.026 0 1.106 1.106 0 0 0-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" />
                                    </svg>
                                </span>
                                Free Delivery
                            </span>
                        </div>
                    </div>

                    <div className="flex items-center gap-2.5">
                        <button
                            onClick={handleCompare}
                            className={cn(
                                "w-10 h-10 rounded-full border bg-white flex items-center justify-center transition-all duration-200 cursor-pointer shadow-sm",
                                isCompared
                                    ? "text-[var(--colour-fsP2)] border-[var(--colour-fsP2)]"
                                    : "text-gray-400 border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                            )}
                            title={isCompared ? "Remove from Compare" : "Compare"}
                        >
                            <Scale className="w-4.5 h-4.5 stroke-[1.5]" />
                        </button>
                        <button
                            onClick={handleAddToCart}
                            className="bg-[var(--colour-fsP2)] text-white px-5 py-2 h-10 rounded-full font-medium text-[13px] hover:opacity-90 transition-all duration-200 flex items-center gap-1.5 cursor-pointer shadow-md"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                <line x1="12" y1="5" x2="12" y2="19"></line>
                                <line x1="5" y1="12" x2="19" y2="12"></line>
                            </svg>
                            <span className="hidden sm:inline tracking-wide font-semibold">Add to Cart</span>
                        </button>
                    </div>
                </div>
            </div>
        </article>
    );
});

ProductCardRow.displayName = 'ProductCardRow';

// ============================================
// SKELETON COMPONENT
// ============================================
export const ProductCardSkeleton = memo(() => (
    <div className="bg-white rounded-2xl overflow-hidden border border-gray-100">
        <div className="aspect-square bg-gradient-to-br from-gray-100 to-gray-200 animate-pulse" />
        <div className="p-4 space-y-3">
            <div className="h-3 w-20 bg-gray-200 rounded-full animate-pulse" />
            <div className="h-4 bg-gray-200 rounded-full animate-pulse" />
            <div className="h-5 w-24 bg-gray-200 rounded-full animate-pulse" />
        </div>
    </div>
));

ProductCardSkeleton.displayName = 'ProductCardSkeleton';

export const ProductCardRowSkeleton = memo(() => (
    <div className="bg-white rounded-2xl overflow-hidden border border-gray-100">
        <div className="flex flex-col sm:flex-row">
            <div className="w-full sm:w-48 aspect-square sm:aspect-auto sm:h-48 bg-gradient-to-br from-gray-100 to-gray-200 animate-pulse" />
            <div className="flex-1 p-4 space-y-3">
                <div className="h-3 w-20 bg-gray-200 rounded-full animate-pulse" />
                <div className="h-4 bg-gray-200 rounded-full animate-pulse w-3/4" />
                <div className="h-3 bg-gray-100 rounded-full animate-pulse w-1/2" />
                <div className="h-5 w-24 bg-gray-200 rounded-full animate-pulse mt-4" />
            </div>
        </div>
    </div>
));

ProductCardRowSkeleton.displayName = 'ProductCardRowSkeleton';
