'use client';

import React, { useState, useCallback, useMemo, memo } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { ShoppingCart, Heart, Scale, Package, Plus, Star, Bookmark, Truck } from 'lucide-react';
import { useCartStore } from '@/app/context/CartContext';
import { useAuthStore } from '@/app/context/AuthContext';
import { useShallow } from 'zustand/react/shallow';
import { parseHighlights } from '@/app/CommonVue/highlights';
import type { ProductCardProps, ProductCardRowProps } from './interfaces';

// ─── Shared hook ──────────────────────────────────────────────────────────────

function useProductCard(product: ProductCardProps['product']) {
    const { isLoggedIn, user, triggerLoginAlert } = useAuthStore(
        useShallow((s) => ({
            isLoggedIn: s.isLoggedIn,
            user: s.user,
            triggerLoginAlert: s.triggerLoginAlert,
        }))
    );

    const {
        addToCart,
        addToWishlist,
        removeFromWishlist,
        wishlistItems,
        addToCompare,
        compareItems,
        removeFromCompare,
    } = useCartStore(
        useShallow((s) => ({
            addToCart: s.addToCart,
            addToWishlist: s.addToWishlist,
            removeFromWishlist: s.removeFromWishlist,
            wishlistItems: s.wishlistItems,
            addToCompare: s.addToCompare,
            compareItems: s.compareItems,
            removeFromCompare: s.removeFromCompare,
        }))
    );

    const router = useRouter();
    const [imageLoaded, setImageLoaded] = useState(false);
    const [imageError, setImageError] = useState(false);

    const isWishlisted = useMemo(
        () => wishlistItems.some((i) => i.id === product.id),
        [wishlistItems, product.id]
    );

    const isCompared = useMemo(
        () => compareItems?.some((i) => i.id === product.id) ?? false,
        [compareItems, product.id]
    );

    const ratingCount = useMemo(
        () => 20 + ((product.id % 1000) * 179) % 200,
        [product.id]
    );

    const originalPrice = product.basePrice ?? 0;
    const displayPrice = product.displayPrice ?? originalPrice.toLocaleString();
    const rating = product.rating ?? 0;
    const imageUrl = product.thumb?.url ?? null;

    // Coming Soon: price must be 0 AND pre_order.available must be true
    const isComing = originalPrice === 0 && product.pre_order?.available === true;

    // Parse highlights — sliced at render time (2 grid / 3 row)
    const highlights = useMemo(
        () => parseHighlights(product.highlights, 3),
        [product.highlights]
    );

    const handleCardClick = useCallback(
        () => router.push(`/products/${product.slug}`),
        [router, product.slug]
    );

    const handleAddToCart = useCallback(
        async (e: React.MouseEvent) => {
            e.stopPropagation();
            await addToCart(product.id, 1, { isLoggedIn }, triggerLoginAlert, product);
        },
        [addToCart, product, isLoggedIn, triggerLoginAlert]
    );

    const handleWishlist = useCallback(
        async (e: React.MouseEvent) => {
            e.stopPropagation();
            isWishlisted
                ? await removeFromWishlist(product.id)
                : await addToWishlist(product.id, user, triggerLoginAlert, product as any);
        },
        [isWishlisted, addToWishlist, removeFromWishlist, product, user, triggerLoginAlert]
    );

    const handleCompare = useCallback(
        (e: React.MouseEvent) => {
            e.stopPropagation();
            isCompared ? removeFromCompare(product.id) : addToCompare(product as any);
        },
        [isCompared, addToCompare, removeFromCompare, product]
    );

    return {
        imageLoaded, setImageLoaded,
        imageError, setImageError,
        isWishlisted, isCompared,
        originalPrice, displayPrice,
        rating, ratingCount,
        imageUrl, isComing, highlights,
        handleCardClick, handleAddToCart, handleWishlist, handleCompare,
    };
}

// ─── Sub-components ───────────────────────────────────────────────────────────

const Badge = ({
    children,
    variant = 'orange',
}: {
    children: React.ReactNode;
    variant?: 'blue' | 'purple' | 'orange';
}) => {
    const styles = {
        blue: 'bg-blue-50 text-blue-700',
        purple: 'bg-[#e8f0fb] text-[var(--colour-fsP2)]',
        orange: 'bg-orange-50 text-[var(--colour-fsP1)]',
    };
    return (
        <span className={cn('inline-block text-[10px] font-bold tracking-wide uppercase px-1.5 py-0.5 rounded', styles[variant])}>
            {children}
        </span>
    );
};

const RatingRow = ({ rating, count }: { rating: number; count: number }) => (
    <div className="flex items-center gap-1">
        <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
        <span className="text-[12px] font-bold text-gray-700">{rating.toFixed(1)}</span>
        <span className="text-[11px] text-gray-400">({count})</span>
    </div>
);

const FreeDelivery = () => (
    <div className="flex items-center gap-1 mt-0.5">
        <Truck className="w-3 h-3 shrink-0" style={{ color: 'var(--colour-fsP1)' }} />
        <span className="text-[10.5px] font-bold" style={{ color: 'var(--colour-fsP1)' }}>
            Free delivery
        </span>
    </div>
);


const IconButton = ({
    onClick,
    active = false,
    title,
    children,
    className,
}: {
    onClick: (e: React.MouseEvent) => void;
    active?: boolean;
    title?: string;
    children: React.ReactNode;
    className?: string;
}) => (
    <button
        onClick={onClick}
        title={title}
        aria-label={title}
        className={cn(
            'w-[30px] h-[30px] rounded-full border flex items-center justify-center transition-colors cursor-pointer bg-white',
            active
                ? 'border-[var(--colour-fsP2)] text-[var(--colour-fsP2)]'
                : 'border-gray-200 text-gray-400 hover:border-gray-300',
            className
        )}
    >
        {children}
    </button>
);

// ─── ProductCard (Grid) ───────────────────────────────────────────────────────

const ProductCard = memo(({ product, index = 0, priority = false }: ProductCardProps) => {
    const p = useProductCard(product);

    return (
        <div
            className="group relative flex flex-col bg-white border border-gray-100 rounded-2xl hover:border-gray-200 hover:shadow-[0_8px_32px_rgba(0,0,0,0.08)] transition-all duration-300 cursor-pointer overflow-hidden h-full"
            style={{ animationDelay: `${(index % 12) * 40}ms` }}
            onClick={p.handleCardClick}
            role="link"
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && p.handleCardClick()}
        >
            {/* Badges */}
            <div className="absolute top-2.5 left-2.5 z-10 flex flex-col gap-1">
                {product.isNew && <Badge variant="blue">New</Badge>}
                {product.emi_enabled && <Badge variant="purple">EMI</Badge>}
                {p.isComing && <Badge variant="orange">Coming Soon</Badge>}
            </div>

            {/* Hover actions */}
            <div className="absolute top-2.5 right-2.5 z-20 flex flex-col gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <IconButton
                    onClick={p.handleWishlist}
                    active={p.isWishlisted}
                    title={p.isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
                >
                    <Heart className={cn('w-3.5 h-3.5', p.isWishlisted && 'fill-current')} />
                </IconButton>
                <IconButton
                    onClick={p.handleCompare}
                    active={p.isCompared}
                    title={p.isCompared ? 'Remove from compare' : 'Compare'}
                >
                    <Scale className="w-3.5 h-3.5" />
                </IconButton>
            </div>

            {/* Image */}
            <div className="relative aspect-square w-full bg-gray-50 overflow-hidden">
                {!p.imageLoaded && !p.imageError && (
                    <div className="absolute inset-0 bg-gray-100 animate-pulse" />
                )}
                {p.imageError && (
                    <div className="absolute inset-0 flex items-center justify-center">
                        <Package className="w-8 h-8 text-gray-300" />
                    </div>
                )}
                {p.imageUrl && (
                    <Image
                        src={p.imageUrl}
                        alt={product.thumb?.alt_text || product.name}
                        fill
                        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 20vw"
                        priority={priority}
                        onLoad={() => p.setImageLoaded(true)}
                        onError={() => p.setImageError(true)}
                        className={cn(
                            'object-contain p-4 mix-blend-multiply transition-all duration-500 group-hover:scale-105',
                            p.imageLoaded ? 'opacity-100' : 'opacity-0'
                        )}
                    />
                )}
            </div>

            {/* Body */}
            <div className="flex flex-col flex-1 p-3.5 pt-3">
                {product.brand?.name && (
                    <p className="text-[10.5px] font-bold uppercase tracking-widest text-gray-400 truncate mb-1">
                        {product.brand.name}
                    </p>
                )}

                <h3 className="text-[14px] font-bold text-gray-800 leading-snug line-clamp-2 min-h-[38px] mb-1.5 group-hover:text-[var(--colour-fsP2)] transition-colors">
                    {product.name}
                </h3>

                {p.rating > 0 && <RatingRow rating={p.rating} count={p.ratingCount} />}

                {/* Highlights — max 2 in grid */}
                {p.highlights.length > 0 && (
                    <div className="flex flex-col gap-1 mt-2 mb-0.5">
                        {p.highlights.slice(0, 2).map((h, i) => (
                            <span key={i} className="text-[11px] text-gray-500 leading-snug line-clamp-1 border border-gray-200 rounded px-2 py-0.5">
                                {h}
                            </span>
                        ))}
                    </div>
                )}

                {/* Footer */}
                <div className="mt-auto pt-2.5 border-t border-gray-50 flex items-center justify-between">
                    <div>
                        {p.originalPrice > 0 ? (
                            <>
                                <p className="text-[18px] font-bold text-gray-900 tracking-tight">
                                    Rs. {p.displayPrice}
                                </p>
                                <FreeDelivery />
                            </>
                        ) : (
                            <p className="text-[15px] font-bold text-[var(--colour-fsP2)]">Coming Soon</p>
                        )}
                    </div>

                    <button
                        onClick={p.handleAddToCart}
                        title={p.isComing ? 'Pre-order' : 'Add to cart'}
                        className="w-8 h-8 rounded-full text-white flex items-center justify-center cursor-pointer shrink-0 shadow-sm transition-opacity"
                        style={{ background: 'var(--colour-fsP2)' }}
                        onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.85')}
                        onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
                    >
                        {p.isComing
                            ? <Bookmark className="w-3.5 h-3.5" />
                            : <Plus className="w-3.5 h-3.5 stroke-[3]" />
                        }
                    </button>
                </div>
            </div>
        </div>
    );
});
ProductCard.displayName = 'ProductCard';

export default ProductCard;

// ─── ProductCardRow (List) ────────────────────────────────────────────────────

export const ProductCardRow = memo(({ product, index = 0, priority = false }: ProductCardRowProps) => {
    const p = useProductCard(product);

    return (
        <div
            className="group flex flex-row bg-white border border-gray-100 rounded-2xl hover:border-gray-200 hover:shadow-[0_8px_32px_rgba(0,0,0,0.08)] transition-all duration-300 cursor-pointer overflow-hidden"
            style={{ animationDelay: `${(index % 12) * 40}ms` }}
            onClick={p.handleCardClick}
            role="link"
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && p.handleCardClick()}
        >
            {/* Image column */}
            <div className="relative w-[110px] sm:w-[150px] shrink-0 bg-gray-50">
                <div className="absolute top-2 left-2 z-10 flex flex-col gap-1">
                    {product.isNew && <Badge variant="blue">New</Badge>}
                    {product.emi_enabled && <Badge variant="purple">EMI</Badge>}
                    {p.isComing && <Badge variant="orange">Coming Soon</Badge>}
                </div>

                <div className="relative w-full h-full min-h-[110px] sm:min-h-[150px]">
                    {!p.imageLoaded && !p.imageError && (
                        <div className="absolute inset-0 bg-gray-100 animate-pulse" />
                    )}
                    {p.imageError && (
                        <div className="absolute inset-0 flex items-center justify-center">
                            <Package className="w-7 h-7 text-gray-300" />
                        </div>
                    )}
                    {p.imageUrl && (
                        <Image
                            src={p.imageUrl}
                            alt={product.thumb?.alt_text || product.name}
                            fill
                            sizes="(max-width: 640px) 110px, 150px"
                            priority={priority}
                            onLoad={() => p.setImageLoaded(true)}
                            onError={() => p.setImageError(true)}
                            className={cn(
                                'object-contain p-3 mix-blend-multiply transition-all duration-500 group-hover:scale-105',
                                p.imageLoaded ? 'opacity-100' : 'opacity-0'
                            )}
                        />
                    )}
                </div>
            </div>

            {/* Info column */}
            <div className="flex flex-col flex-1 p-3 sm:p-3.5 justify-between min-w-0">
                <div>
                    {product.brand?.name && (
                        <p className="text-[10.5px] font-bold uppercase tracking-widest text-gray-400 truncate mb-1">
                            {product.brand.name}
                        </p>
                    )}
                    <h3 className="text-[14px] sm:text-[15px] font-bold text-gray-800 leading-snug line-clamp-2 mb-1.5 group-hover:text-[var(--colour-fsP2)] transition-colors">
                        {product.name}
                    </h3>

                    {p.rating > 0 && <RatingRow rating={p.rating} count={p.ratingCount} />}

                    {/* Highlights — max 3 in row view */}
                    {p.highlights.length > 0 && (
                        <div className="flex flex-col gap-1 mt-2">
                            {p.highlights.slice(0, 3).map((h, i) => (
                                <span key={i} className="text-[11px] text-gray-500 leading-snug line-clamp-1 border border-gray-200 rounded px-2 py-0.5">
                                    {h}
                                </span>
                            ))}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="mt-2 pt-2 border-t border-gray-50 flex items-center justify-between flex-wrap gap-2">
                    <div>
                        {p.originalPrice > 0 ? (
                            <>
                                <p className="text-[16px] sm:text-[18px] font-bold text-gray-900 tracking-tight">
                                    Rs. {p.displayPrice}
                                </p>
                                <FreeDelivery />
                            </>
                        ) : (
                            <p className="text-[14px] font-bold text-[var(--colour-fsP2)]">Coming Soon</p>
                        )}
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                        <IconButton
                            onClick={p.handleWishlist}
                            active={p.isWishlisted}
                            title={p.isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
                        >
                            <Heart className={cn('w-3.5 h-3.5', p.isWishlisted && 'fill-current')} />
                        </IconButton>
                        <IconButton
                            onClick={p.handleCompare}
                            active={p.isCompared}
                            title={p.isCompared ? 'Remove from compare' : 'Compare'}
                        >
                            <Scale className="w-3.5 h-3.5" />
                        </IconButton>
                        <button
                            onClick={p.handleAddToCart}
                            className="h-8 px-3 rounded-full text-white text-[12px] font-bold flex items-center gap-1.5 cursor-pointer shadow-sm whitespace-nowrap transition-opacity"
                            style={{ background: 'var(--colour-fsP2)' }}
                            onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.85')}
                            onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
                        >
                            <ShoppingCart className="w-3.5 h-3.5" />
                            <span className="hidden sm:inline">
                                {p.isComing ? 'Pre-order' : 'Add to cart'}
                            </span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
});
ProductCardRow.displayName = 'ProductCardRow';