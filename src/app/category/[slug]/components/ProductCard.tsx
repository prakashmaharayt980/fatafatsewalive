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
            className="group bg-white rounded-2xl overflow-hidden transition-all duration-500 hover:shadow-2xl hover:shadow-gray-200/50 hover:-translate-y-1 border border-gray-100 hover:border-[var(--colour-fsP2)]/30 cursor-pointer animate-fadeInUp"
            style={{ animationDelay: `${(index % 12) * 50}ms` }}
            onClick={handleCardClick}
            role="link"
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && handleCardClick()}
        >
            {/* Image Container */}
            <div className="relative aspect-square overflow-hidden bg-gray-50">
                {!imageLoaded && !imageError && (
                    <div className="absolute inset-0 bg-gradient-to-br from-gray-100 via-gray-50 to-gray-100 animate-pulse" />
                )}

                {imageError && (
                    <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
                        <Package size={48} className="text-gray-300" />
                    </div>
                )}

                {imageUrl && (
                    <Image
                        src={imageUrl}
                        alt={product.name}
                        fill
                        sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
                        priority={priority}
                        onLoad={() => setImageLoaded(true)}
                        onError={() => setImageError(true)}
                        className={cn(
                            'object-cover transition-all duration-700 group-hover:scale-110',
                            imageLoaded ? 'opacity-100' : 'opacity-0'
                        )}
                    />
                )}

                {/* Hover Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300">
                    <div className="absolute bottom-4 left-4 right-4 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300 flex flex-col gap-2">
                        <div className="flex gap-2">
                            <button
                                onClick={handleAddToCart}
                                className="flex-1 bg-white text-gray-900 py-2.5 rounded-xl font-semibold text-sm hover:bg-[var(--colour-fsP2)] hover:text-white transition-all duration-200 flex items-center justify-center gap-2 shadow-lg cursor-pointer"
                            >
                                <ShoppingBag size={16} />
                                <span>Add</span>
                            </button>
                            <button
                                onClick={handleCompare}
                                className={cn(
                                    "w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-200 shadow-lg cursor-pointer",
                                    isCompared ? "bg-[var(--colour-fsP2)] text-white" : "bg-white text-gray-900 hover:bg-[var(--colour-fsP2)] hover:text-white"
                                )}
                                title={isCompared ? "Remove from Compare" : "Compare"}
                            >
                                <Scale size={18} />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Wishlist Button */}
                <button
                    onClick={handleWishlist}
                    className={cn(
                        'absolute top-3 right-3 w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 shadow-lg backdrop-blur-sm cursor-pointer',
                        isWishlisted
                            ? 'bg-red-500 text-white scale-110'
                            : 'bg-white/90 text-gray-600 hover:text-red-500 hover:scale-105'
                    )}
                    aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
                >
                    <Heart size={18} className={isWishlisted ? 'fill-current' : ''} />
                </button>

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
            <div className="p-2.5 sm:p-4">
                {product.average_rating > 0 && (
                    <div className="flex items-center gap-1 mb-2">
                        {[...Array(5)].map((_, i) => (
                            <Star
                                key={i}
                                size={14}
                                className={cn(
                                    'transition-colors',
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

                <h3 className="font-medium text-gray-900 text-sm line-clamp-2 mb-2 group-hover:text-[var(--colour-fsP2)] transition-colors duration-200 min-h-[40px]">
                    {product.name}
                </h3>

                <div className="flex items-baseline gap-2 flex-wrap">
                    <span className="text-lg font-bold text-gray-900">Rs. {displayPrice}</span>
                    {originalPrice && (
                        <span className="text-sm text-gray-400 line-through">
                            Rs. {originalPrice}
                        </span>
                    )}
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
