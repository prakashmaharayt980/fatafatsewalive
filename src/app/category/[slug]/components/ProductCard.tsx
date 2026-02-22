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
            className="group relative bg-white rounded-[12px] h-full overflow-hidden transition-all duration-300 hover:shadow-[0_0_20px_rgba(0,0,0,0.1)] hover:-translate-y-1 border border-gray-100 hover:border-[var(--colour-fsP2)]/30 cursor-pointer animate-fadeInUp flex flex-col"
            style={{ animationDelay: `${(index % 12) * 50}ms` }}
            onClick={handleCardClick}
            role="link"
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && handleCardClick()}
        >
            {/* Wishlist Button - Top Right */}
            <button
                onClick={handleWishlist}
                className={cn(
                    'absolute top-2 right-2 z-20 p-1.5 rounded-full bg-white/90 backdrop-blur-sm shadow-sm hover:scale-110 transition-all duration-200 cursor-pointer',
                    isWishlisted ? 'text-red-500 fill-red-500 scale-110' : 'text-gray-400 hover:text-red-500'
                )}
                aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
            >
                <Heart className={cn("h-4 w-4 stroke-[2.5]", isWishlisted && "fill-red-500 text-red-500")} />
            </button>

            {/* Compare Button - Below Wishlist */}
            <button
                onClick={handleCompare}
                className={cn(
                    "absolute top-10 right-2 z-20 p-1.5 rounded-full bg-white/90 backdrop-blur-sm shadow-sm hover:scale-110 transition-all duration-200 cursor-pointer",
                    isCompared ? "text-[var(--colour-fsP2)]" : "text-gray-400 hover:text-[var(--colour-fsP2)]"
                )}
                title={isCompared ? "Remove from Compare" : "Compare"}
            >
                <Scale className="h-4 w-4 stroke-[2.5]" />
            </button>
            {/* Image Container */}
            <div className="relative aspect-square w-full overflow-hidden bg-white">
                {!imageLoaded && !imageError && (
                    <div className="absolute inset-0 bg-gray-50 animate-pulse" />
                )}

                {imageError && (
                    <div className="absolute inset-0 flex items-center justify-center bg-gray-50">
                        <Package size={48} className="text-gray-300" />
                    </div>
                )}

                {imageUrl && (
                    <div className="relative w-full h-full">
                        <Image
                            src={imageUrl}
                            alt={product.name}
                            fill
                            sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
                            priority={priority}
                            onLoad={() => setImageLoaded(true)}
                            onError={() => setImageError(true)}
                            className={cn(
                                'object-contain mix-blend-multiply transition-transform duration-500 group-hover:scale-105',
                                imageLoaded ? 'opacity-100' : 'opacity-0'
                            )}
                        />
                    </div>
                )}



                {/* Badges */}
                <div className="absolute top-3 left-3 flex flex-col gap-2">
                    {discount > 0 && (
                        <span className="bg-[var(--colour-fsP2)] text-white text-xs font-bold px-2.5 py-1 rounded-full shadow-lg">
                            -{discount}%
                        </span>
                    )}
                </div>
            </div>

            {/* Product Info */}
            <div className="p-2.5 sm:p-3 flex flex-col h-full">
                <h3 className="font-regular text-gray-800 text-[12px] sm:text-[13px] leading-[1.35] line-clamp-2 mb-1.5 group-hover:text-[var(--colour-fsP2)] transition-colors duration-200 min-h-[34px]">
                    {product.name}
                </h3>

                {/* Feature Tags */}
                <div className="flex flex-wrap gap-1 mb-2">
                    {product.quantity > 0 && (
                        <span className="text-[10px] md:text-[11px] font-medium px-1.5 py-0.5 rounded bg-green-50 text-green-700 border border-green-100">
                            In Stock
                        </span>
                    )}
                    {product.emi_enabled === 1 && (
                        <span className="text-[10px] md:text-[11px] font-medium px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-100">
                            EMI Available
                        </span>
                    )}
                    {/* Add promotional highlight if applicable - generic implementation */}
                    {(
                        <span className="text-[10px] md:text-[11px] font-medium px-1.5 py-0.5 rounded bg-orange-50 text-orange-700 border border-orange-100">
                            Exchange Offer
                        </span>
                    )}
                    {(
                        <span className="text-[9px] md:text-[10px] font-semibold px-1.5 py-0.5 rounded bg-purple-50 text-purple-700 border border-purple-100">
                            Insurance
                        </span>
                    )}
                </div>

                <div className="flex flex-col mt-auto pt-1 space-y-1.5">
                    <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                        <span className="text-[15px] sm:text-[16px] font-extrabold text-[#1f2937]">Rs. {displayPrice}</span>
                        {(
                            <span className="text-[12px] text-gray-400 line-through decoration-gray-400 font-medium">
                                Rs. {originalPrice}
                            </span>
                        )}
                        {(
                            <span className="text-[var(--colour-fsP2)] font-bold bg-blue-50/50 px-1 py-0.5 rounded text-[10px] ml-auto sm:ml-1">
                                {discount}% OFF
                            </span>
                        )}
                    </div>

                    {/* Mock Coupons */}
                    {hasCoupon && (
                        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-0.5">
                            <div className="relative shrink-0 bg-green-50/80 border border-green-200/60 text-green-700 text-[9px] font-bold px-1.5 py-0.5 rounded-sm border-dashed flex items-center gap-1 w-fit">
                                <span className="w-1 h-1 rounded-full bg-white border border-green-200/60 absolute -left-[2.5px] top-1/2 -translate-y-1/2"></span>
                                Save Rs. 200
                                <span className="w-1 h-1 rounded-full bg-white border border-green-200/60 absolute -right-[2.5px] top-1/2 -translate-y-1/2"></span>
                            </div>
                            <div className="relative shrink-0 bg-blue-50/80 border border-blue-200/60 text-[var(--colour-fsP2)] text-[9px] font-bold px-1.5 py-0.5 rounded-sm border-dashed flex items-center gap-1 w-fit">
                                <span className="w-1 h-1 rounded-full bg-white border border-blue-200/60 absolute -left-[2.5px] top-1/2 -translate-y-1/2"></span>
                                Free Delivery
                                <span className="w-1 h-1 rounded-full bg-white border border-blue-200/60 absolute -right-[2.5px] top-1/2 -translate-y-1/2"></span>
                            </div>
                        </div>
                    )}

                    {/* Ratings Section */}
                    {mockRating > 0 && (
                        <div className="flex items-center gap-1">
                            <div className="flex items-center gap-[2px] bg-[var(--colour-fsP2)] text-white px-1 py-[2px] rounded-sm shadow-sm">
                                <span className="text-[9px] font-bold leading-none">{mockRating.toFixed(1)}</span>
                                <Star className="w-2 h-2 fill-current" />
                            </div>
                            <span className="text-[9px] text-gray-500 font-medium tracking-tight">({mockRatingCount})</span>
                        </div>
                    )}

                    {/* Add to Cart button */}
                    <button
                        onClick={handleAddToCart}
                        className="w-full bg-[var(--colour-fsP2)] text-white py-1.5 rounded-md font-bold text-[12px] hover:bg-blue-700 transition-colors duration-200 flex items-center justify-center gap-1.5 cursor-pointer mt-1 opacity-90 group-hover:opacity-100 shadow-sm"
                    >
                        <ShoppingBag size={13} />
                        <span>Add to Cart</span>
                    </button>
                </div>
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
            className="group bg-white rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-xl hover:shadow-gray-200/50 border border-gray-100 hover:border-[var(--colour-fsP2)]/30 cursor-pointer animate-fadeInUp"
            style={{ animationDelay: `${(index % 12) * 50}ms` }}
            onClick={handleCardClick}
            role="link"
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && handleCardClick()}
        >
            <div className="flex flex-col sm:flex-row">
                {/* Image */}
                <div className="relative w-full sm:w-40 md:w-48 aspect-square sm:aspect-auto sm:h-48 flex-shrink-0 overflow-hidden bg-gray-50">
                    {!imageLoaded && !imageError && (
                        <div className="absolute inset-0 bg-gradient-to-br from-gray-100 via-gray-50 to-gray-100 animate-pulse" />
                    )}
                    {imageError && (
                        <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
                            <Package size={36} className="text-gray-300" />
                        </div>
                    )}
                    {imageUrl && (
                        <Image
                            src={imageUrl}
                            alt={product.name}
                            fill
                            sizes="(max-width: 640px) 100vw, 192px"
                            priority={priority}
                            onLoad={() => setImageLoaded(true)}
                            onError={() => setImageError(true)}
                            className={cn(
                                'object-cover transition-all duration-500 group-hover:scale-105',
                                imageLoaded ? 'opacity-100' : 'opacity-0'
                            )}
                        />
                    )}

                    {/* Badges */}
                    <div className="absolute top-2 left-2 flex flex-col gap-1.5">
                        {discount > 0 && (
                            <span className="bg-[var(--colour-fsP2)] text-white text-xs font-bold px-2 py-0.5 rounded-full shadow">
                                -{discount}%
                            </span>
                        )}
                    </div>

                    {/* Wishlist */}
                    <button
                        onClick={handleWishlist}
                        className={cn(
                            'absolute top-2 right-2 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 shadow backdrop-blur-sm cursor-pointer',
                            isWishlisted
                                ? 'bg-red-500 text-white scale-110'
                                : 'bg-white/90 text-gray-600 hover:text-red-500 hover:scale-105'
                        )}
                        aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
                    >
                        <Heart size={14} className={isWishlisted ? 'fill-current' : ''} />
                    </button>
                </div>

                {/* Details */}
                <div className="flex-1 p-3 sm:p-4 flex flex-col justify-between min-w-0">
                    <div>
                        {/* Rating */}
                        {product.average_rating > 0 && (
                            <div className="flex items-center gap-1 mb-1.5">
                                {[...Array(5)].map((_, i) => (
                                    <Star
                                        key={i}
                                        size={12}
                                        className={cn(
                                            i < Math.floor(product.average_rating)
                                                ? 'text-amber-400 fill-amber-400'
                                                : 'text-gray-200'
                                        )}
                                    />
                                ))}
                                <span className="text-xs text-gray-500 ml-1">
                                    ({product.average_rating.toFixed(1)})
                                </span>
                            </div>
                        )}

                        {/* Name */}
                        <h3 className="font-medium text-gray-900 text-sm sm:text-base line-clamp-2 mb-2 group-hover:text-[var(--colour-fsP2)] transition-colors duration-200">
                            {product.name}
                        </h3>

                        {/* Highlights */}
                        {highlights.length > 0 && (
                            <ul className="hidden sm:block space-y-1 mb-3">
                                {highlights.map((h, i) => (
                                    <li key={i} className="flex items-start gap-1.5 text-xs text-gray-500">
                                        <span className="w-1 h-1 rounded-full bg-[var(--colour-fsP2)] mt-1.5 flex-shrink-0" />
                                        <span className="line-clamp-1">{h}</span>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>

                    {/* Price + Actions */}
                    <div className="flex items-center justify-between gap-3 mt-auto">
                        <div className="flex items-baseline gap-2 flex-wrap">
                            <span className="text-lg font-bold text-gray-900">Rs. {displayPrice}</span>
                            {originalPrice && (
                                <span className="text-sm text-gray-400 line-through">
                                    Rs. {originalPrice}
                                </span>
                            )}
                        </div>

                        <div className="flex items-center gap-2 flex-shrink-0">
                            <button
                                onClick={handleCompare}
                                className={cn(
                                    "w-9 h-9 rounded-lg flex items-center justify-center transition-all duration-200 border cursor-pointer",
                                    isCompared
                                        ? "bg-[var(--colour-fsP2)] text-white border-[var(--colour-fsP2)]"
                                        : "bg-white text-gray-500 border-gray-200 hover:border-[var(--colour-fsP2)] hover:text-[var(--colour-fsP2)]"
                                )}
                                title={isCompared ? "Remove from Compare" : "Compare"}
                            >
                                <Scale size={15} />
                            </button>
                            <button
                                onClick={handleAddToCart}
                                className="bg-[var(--colour-fsP2)] text-white px-4 py-2 rounded-lg font-medium text-sm hover:opacity-90 transition-all duration-200 flex items-center gap-1.5 cursor-pointer shadow-sm"
                            >
                                <ShoppingBag size={14} />
                                <span className="hidden md:inline">Add to Cart</span>
                                <span className="md:hidden">Add</span>
                            </button>
                        </div>
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
