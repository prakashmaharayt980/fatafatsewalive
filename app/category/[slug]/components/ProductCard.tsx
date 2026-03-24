'use client';

import React, { useState, useCallback, useMemo, memo } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { ShoppingCart, Heart, Eye, ArrowLeftRight, Scale, Package, Plus, Star } from 'lucide-react';
import NextImage from 'next/image';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { BasketProduct } from '@/app/types/ProductDetailsTypes';
import { useCartStore } from '@/app/context/CartContext';
import { useAuthStore } from '@/app/context/AuthContext';
import { useShallow } from 'zustand/react/shallow';
import type { ProductCardProps, ProductCardRowProps } from './interfaces';

// ─── Shared hook ─────────────────────────────────────────────────────────────

function useProductCard(product: ProductCardProps['product']) {
    const { isLoggedIn, user, triggerLoginAlert } = useAuthStore(useShallow(state => ({
        isLoggedIn: state.isLoggedIn,
        user: state.user,
        triggerLoginAlert: state.triggerLoginAlert
    })));

    const {
        addToCart, addToWishlist, removeFromWishlist, wishlistItems,
        addToCompare, compareItems, removeFromCompare,
    } = useCartStore(useShallow(state => ({
        addToCart: state.addToCart,
        addToWishlist: state.addToWishlist,
        removeFromWishlist: state.removeFromWishlist,
        wishlistItems: state.wishlistItems,
        addToCompare: state.addToCompare,
        compareItems: state.compareItems,
        removeFromCompare: state.removeFromCompare,
    })));

    const router = useRouter();
    const [imageLoaded, setImageLoaded] = useState(false);
    const [imageError, setImageError] = useState(false);

    const isWishlisted = useMemo(() => wishlistItems.some(i => i.id === product.id), [wishlistItems, product.id]);
    const isCompared = useMemo(() => compareItems?.some(i => i.id === product.id) ?? false, [compareItems, product.id]);

    const originalPrice = product.basePrice || 0;
    const discountedPriceVal = product.discountedPriceVal || originalPrice;
    const displayPrice = product.displayPrice || originalPrice.toLocaleString();
    const discount = product.discountPercent || 0;
    const rating = product.rating || 0;
    const imageUrl = product.thumb?.url || null;

    const handleCardClick = useCallback(() => router.push(`/products/${product.slug}`), [router, product.slug]);

    const handleAddToCart = useCallback(async (e: React.MouseEvent) => {
        e.stopPropagation();
        await addToCart(product.id, 1, { isLoggedIn }, triggerLoginAlert, product);
    }, [addToCart, product, isLoggedIn, triggerLoginAlert]);

    const handleWishlist = useCallback(async (e: React.MouseEvent) => {
        e.stopPropagation();
        isWishlisted
            ? await removeFromWishlist(product.id)
            : await addToWishlist(product.id, user, triggerLoginAlert, product as any);
    }, [isWishlisted, addToWishlist, removeFromWishlist, product, user, triggerLoginAlert]);


    const handleCompare = useCallback(async (e: React.MouseEvent) => {
        e.stopPropagation();
        isCompared ? removeFromCompare(product.id) : addToCompare(product as any);
    }, [isCompared, addToCompare, removeFromCompare, product]);

    return {
        imageLoaded, setImageLoaded, imageError, setImageError,
        isWishlisted, isCompared,
        originalPrice, discountedPriceVal, displayPrice, discount, rating,
        imageUrl,
        handleCardClick, handleAddToCart, handleWishlist, handleCompare,
        product,
    };
}

// ─── Badge ────────────────────────────────────────────────────────────────────

const Tag = ({ children, color = 'orange' }: { children: React.ReactNode; color?: 'orange' | 'purple' | 'blue' }) => {
    const colors = {
        orange: 'bg-orange-500 text-white',
        purple: 'bg-[var(--colour-fsP2)] text-white',
        blue: 'bg-blue-500 text-white',
    };
    return (
        <span className={cn('text-[9px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded-sm', colors[color])}>
            {children}
        </span>
    );
};

// ─── Image Block ──────────────────────────────────────────────────────────────

const ProductImage = ({
    imageUrl, imageLoaded, imageError, name, altText, priority,
    onLoad, onError,
}: {
    imageUrl: string | null; imageLoaded: boolean; imageError: boolean;
    name: string; altText?: string; priority?: boolean;
    onLoad: () => void; onError: () => void;
}) => (
    <div className="relative w-full aspect-square bg-gray-50 rounded-md overflow-hidden">
        {!imageLoaded && !imageError && (
            <div className="absolute inset-0 bg-gray-100 animate-pulse" />
        )}
        {imageError && (
            <div className="absolute inset-0 flex items-center justify-center">
                <Package className="w-8 h-8 text-gray-300" />
            </div>
        )}
        {imageUrl && (
            <Image
                src={imageUrl}
                alt={altText || name}
                fill
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 20vw"
                priority={priority}
                onLoad={onLoad}
                onError={onError}
                className={cn(
                    'object-contain mix-blend-multiply transition-all duration-500 group-hover:scale-[1.04]',
                    imageLoaded ? 'opacity-100' : 'opacity-0'
                )}
            />
        )}
    </div>
);

// ─── Star Rating ──────────────────────────────────────────────────────────────

const RatingRow = ({ rating, count }: { rating: number; count: number }) => (
    <div className="flex items-center gap-1">
        <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
        <span className="text-[12px] font-semibold text-gray-700">{rating.toFixed(1)}</span>
        <span className="text-[11px] text-gray-400">({count})</span>
    </div>
);

// ─── ProductCard (Grid) ───────────────────────────────────────────────────────

const ProductCard = memo(({ product, index = 0, priority = false }: ProductCardProps) => {
    const p = useProductCard(product);
    // stable random count — use product.id as seed to avoid hydration mismatch
    const ratingCount = useMemo(() => {
        const seed = product.id % 1000;
        return 20 + (seed * 179) % 200;
    }, [product.id]);

    return (
        <article
            className="group flex flex-col bg-white border border-gray-100 rounded-xl hover:border-gray-200 hover:shadow-[0_4px_24px_rgba(0,0,0,0.07)] transition-all duration-300 cursor-pointer overflow-hidden relative h-full"
            style={{ animationDelay: `${(index % 12) * 40}ms` }}
            onClick={p.handleCardClick}
            role="link"
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && p.handleCardClick()}
        >
            {/* Top badges */}
            <div className="absolute top-2.5 left-2.5 z-10 flex flex-col gap-1">
                {product.isNew && <Tag color="blue">New</Tag>}
                {product.emi_enabled && <Tag color="purple">EMI</Tag>}
                {product.pre_order?.available && <Tag color="orange">Pre Order</Tag>}
            </div>

            {/* Action buttons */}
            <div className="absolute top-2.5 right-2.5 z-20 flex flex-col gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <button
                    onClick={p.handleWishlist}
                    className="w-7 h-7 rounded-full bg-white border border-gray-200 flex items-center justify-center shadow-sm hover:border-red-200 transition-colors cursor-pointer"
                    aria-label={p.isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
                >
                    <Heart className={cn('w-3.5 h-3.5', p.isWishlisted ? 'fill-red-500 text-red-500' : 'text-gray-400')} />
                </button>
                <button
                    onClick={p.handleCompare}
                    className={cn(
                        'w-7 h-7 rounded-full bg-white border flex items-center justify-center shadow-sm transition-colors cursor-pointer',
                        p.isCompared ? 'border-[var(--colour-fsP2)] text-[var(--colour-fsP2)]' : 'border-gray-200 text-gray-400 hover:border-gray-300'
                    )}
                    title={p.isCompared ? 'Remove from Compare' : 'Compare'}
                >
                    <Scale className="w-3.5 h-3.5" />
                </button>
            </div>

            {/* Image */}
            <div className="p-3 pb-0">
                <ProductImage
                    imageUrl={p.imageUrl}
                    imageLoaded={p.imageLoaded}
                    imageError={p.imageError}
                    name={product.name}
                    altText={product.thumb?.alt_text}
                    priority={priority}
                    onLoad={() => p.setImageLoaded(true)}
                    onError={() => p.setImageError(true)}
                />
            </div>

            {/* Info */}
            <div className="flex flex-col flex-1 p-3 pt-2.5">
                {product.brand?.name && (
                    <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-1 truncate">
                        {product.brand.name}
                    </p>
                )}
                <h3 className="text-[13px] font-medium text-gray-800 leading-snug line-clamp-2 min-h-[38px] mb-2 group-hover:text-[var(--colour-fsP2)] transition-colors">
                    {product.name}
                </h3>

                {p.rating > 0 && <RatingRow rating={p.rating} count={ratingCount} />}

                <div className="mt-auto pt-2">
                    {/* Price row */}
                    <div className="flex items-baseline gap-1.5 mb-1">
                        <span className="text-[17px] font-bold text-gray-900 tracking-tight">
                            Rs. {p.displayPrice}
                        </span>
                    </div>

                    {/* Bottom row: tags + cart */}
                    <div className="flex items-center justify-between pt-2 border-t border-gray-50">
                        <div className="flex flex-wrap gap-1">
                            <Tag color="orange">Free Delivery</Tag>
                            {product.pre_order?.available && p.originalPrice === 0 && (
                                <Tag color="blue">Coming Soon</Tag>
                            )}
                        </div>
                        <button
                            onClick={p.handleAddToCart}
                            className="w-7 h-7 rounded-full bg-[var(--colour-fsP2)] text-white flex items-center justify-center hover:opacity-90 transition-opacity shadow-sm cursor-pointer shrink-0"
                            title="Add to Cart"
                        >
                            <Plus className="w-[13px] h-[13px] stroke-[3]" />
                        </button>
                    </div>
                </div>
            </div>
        </article>
    );
});
ProductCard.displayName = 'ProductCard';

export default ProductCard;

// ─── ProductCardRow (List) ────────────────────────────────────────────────────

export const ProductCardRow = memo(({ product, index = 0, priority = false }: ProductCardRowProps) => {
    const p = useProductCard(product);
    const ratingCount = useMemo(() => {
        const seed = product.id % 1000;
        return 20 + (seed * 179) % 200;
    }, [product.id]);

    return (
        <article
            className="group flex flex-row bg-white border border-gray-100 rounded-xl hover:border-gray-200 hover:shadow-[0_4px_24px_rgba(0,0,0,0.07)] transition-all duration-300 cursor-pointer overflow-hidden"
            style={{ animationDelay: `${(index % 12) * 40}ms` }}
            onClick={p.handleCardClick}
            role="link"
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && p.handleCardClick()}
        >
            {/* Image column — explicit px size so next/image width+height works */}
            <div className="w-[110px] sm:w-[160px] shrink-0 p-2 relative">
                {/* Badges */}
                <div className="absolute top-3 left-3 z-10 flex flex-col gap-1">
                    {product.emi_enabled && <Tag color="purple">EMI</Tag>}
                    {product.pre_order?.available && <Tag color="orange">Pre Order</Tag>}
                    {(index ?? 0) < 2 && <Tag color="blue">Express</Tag>}
                </div>

                {/* Fixed-size image container — not fill, explicit w/h */}
                <div className="w-full h-[100px] sm:h-[150px] relative bg-gray-50 rounded-lg overflow-hidden flex items-center justify-center">
                    {!p.imageLoaded && !p.imageError && (
                        <div className="absolute inset-0 bg-gray-100 animate-pulse rounded-lg" />
                    )}
                    {p.imageError && (
                        <Package className="w-8 h-8 text-gray-300" />
                    )}
                    {p.imageUrl && (
                        <Image
                            src={p.imageUrl}
                            alt={product.thumb?.alt_text || product.name}
                            fill
                            sizes="(max-width: 640px) 110px, 160px"
                            priority={priority}
                            onLoad={() => p.setImageLoaded(true)}
                            onError={() => p.setImageError(true)}
                            className={cn(
                                'w-full h-full object-contain mix-blend-multiply transition-all duration-500 group-hover:scale-[1.04]',
                                p.imageLoaded ? 'opacity-100' : 'opacity-0'
                            )}
                        />
                    )}
                </div>
            </div>

            {/* Info column */}
            <div className="flex flex-col flex-1 p-2.5 sm:p-3 justify-between min-w-0">
                <div>
                    {product.brand?.name && (
                        <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-1 truncate">
                            {product.brand.name}
                        </p>
                    )}
                    <h3 className="text-[12px] sm:text-[14px] font-medium text-gray-800 leading-snug line-clamp-2 mb-1.5 group-hover:text-[var(--colour-fsP2)] transition-colors">
                        {product.name}
                    </h3>
                    {p.rating > 0 && <RatingRow rating={p.rating} count={ratingCount} />}
                </div>

                <div className="mt-2 pt-2 border-t border-gray-50">
                    {/* Price */}
                    <div className="flex items-baseline gap-1.5 mb-1 flex-wrap">
                        <span className="text-[15px] sm:text-[18px] font-bold text-gray-900 tracking-tight">
                            Rs. {p.displayPrice}
                        </span>
                    </div>

                    <div className="flex items-center justify-between gap-1 flex-wrap">
                        <div className="flex items-center gap-1.5 flex-wrap">
                            <Tag color="orange">Free Delivery</Tag>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-1.5 shrink-0">
                            <button
                                onClick={p.handleWishlist}
                                className="w-7 h-7 rounded-full bg-white border border-gray-200 flex items-center justify-center hover:border-red-200 transition-colors cursor-pointer shadow-sm"
                                aria-label={p.isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
                            >
                                <Heart className={cn('w-3.5 h-3.5', p.isWishlisted ? 'fill-red-500 text-red-500' : 'text-gray-400')} />
                            </button>
                            <button
                                onClick={p.handleCompare}
                                className={cn(
                                    'w-7 h-7 rounded-full border flex items-center justify-center transition-colors cursor-pointer shadow-sm bg-white',
                                    p.isCompared
                                        ? 'border-[var(--colour-fsP2)] text-[var(--colour-fsP2)]'
                                        : 'border-gray-200 text-gray-400 hover:border-gray-300'
                                )}
                                title={p.isCompared ? 'Remove from Compare' : 'Compare'}
                            >
                                <Scale className="w-3.5 h-3.5" />
                            </button>
                            <button
                                onClick={p.handleAddToCart}
                                className="h-7 px-2 sm:px-3 rounded-full bg-[var(--colour-fsP2)] text-white text-[11px] font-semibold flex items-center gap-1 hover:opacity-90 transition-opacity cursor-pointer shadow-sm whitespace-nowrap"
                            >
                                <ShoppingCart className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                                <span className="hidden sm:inline">Add to Cart</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </article>
    );
});
ProductCardRow.displayName = 'ProductCardRow';