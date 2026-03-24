'use client';

import React, { useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowUpRight, ShoppingBasket, Scale, Star } from 'lucide-react';
import type { ProductData } from '../../types/ProductDetailsTypes';


import { cn } from '@/lib/utils';
import { useCartStore } from '@/app/context/CartContext';
import { useShallow } from 'zustand/react/shallow';

interface ProductDealsProps {
    products: ProductData[];
    limit?: number;
    title: string;
}

const ProductDeals = React.memo(({ products, limit = 8, title }: ProductDealsProps) => {
    const { compareList, addToCompare, removeFromCompare } = useCartStore(useShallow(state => ({
        compareList: state.compareItems,
        addToCompare: state.addToCompare,
        removeFromCompare: state.removeFromCompare
    })));

    const compareItems = compareList;

    // Memoize the sliced products with computed prices
    const displayProducts = useMemo(() => {
        if (!products || products.length === 0) return [];
        return products.slice(0, limit).map((product) => {
            const basePrice = typeof product.price === 'object'
                ? (product.price as any)?.original_price || (product.price as any)?.current || 0
                : Number(product.price || 0);
            const sellPrice = product.discounted_price
                || (typeof product.price === 'object' ? (product.price as any)?.current : Number(product.price || 0));
            const hasDiscount = basePrice > sellPrice;
            const discountPercent = hasDiscount
                ? Math.round(((basePrice - sellPrice) / basePrice) * 100)
                : 0;
            return { product, basePrice, sellPrice, hasDiscount, discountPercent };
        });
    }, [products, limit]);

    if (displayProducts.length === 0) return null;

    return (
        <div className="sticky top-24  overflow-hidden">
            {/* Header */}
            <div className="flex items-center gap-2 mb-3">
                <div className="w-7 h-7 rounded-lg bg-[var(--colour-fsP1)] flex items-center justify-center">
                    <ShoppingBasket className="w-3.5 h-3.5 text-white fill-white" />
                </div>
                <h3 className="text-sm font-bold text-[var(--colour-text2)] uppercase tracking-wide">
                    {title}
                </h3>
            </div>

            {/* Product Cards */}
            <div className="flex flex-col gap-2.5">
                {displayProducts.map(({ product, basePrice, sellPrice, hasDiscount, discountPercent }) => {
                    const brandName = product.brand?.name;
                    const rating = product.average_rating || 0;
                    const ratingCount = product.rating_count || 0;
                    const emiPrice = product.emi_enabled ? Math.round(basePrice / 12) : 0;

                    return (
                        <Link
                            key={product.id}
                            href={`/products/${product.slug}`}
                            className="group relative flex gap-3 p-2.5 rounded-lg bg-white border border-[var(--colour-border3)] hover:border-[var(--colour-fsP2)]/40 hover:shadow-sm transition-all duration-200"
                        >
                            {/* Product Image Container */}
                            <div className="relative flex-shrink-0 w-[72px] h-[72px] rounded-base bg-[var(--colour-bg4)] overflow-hidden border border-[var(--colour-border3)]">
                                <Image
                                    src={product.thumb?.url || '/placeholder.png'}
                                    alt={product.name}
                                    fill
                                    className="object-contain p-1.5 group-hover:scale-105 transition-transform duration-300"
                                    sizes="72px"
                                />
                                {hasDiscount && (
                                    <span className="absolute top-0.5 left-0.5 bg-[var(--colour-fsP1)] text-white text-[8px] font-bold px-1 py-0.5 rounded">
                                        -{discountPercent}%
                                    </span>
                                )}
                                {/* Compare Button */}
                                <button
                                    onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        const isIn = compareItems?.some(i => i.id === product.id);
                                        if (isIn) {
                                            removeFromCompare(product.id);
                                        } else {
                                            addToCompare(product as any);
                                        }
                                    }}
                                    className={cn(
                                        "absolute top-0.5 right-0.5 p-1 rounded-full shadow-sm transition-all duration-200 z-10",
                                        compareItems?.some(i => i.id === product.id)
                                            ? "bg-[var(--colour-fsP2)] text-white opacity-100"
                                            : "bg-white/90 text-gray-400 hover:text-[var(--colour-fsP2)] opacity-0 group-hover:opacity-100"
                                    )}
                                    title="Compare"
                                >
                                    <Scale className="w-3 h-3 stroke-[2.5]" />
                                </button>
                            </div>

                            {/* Content Side */}
                            <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
                                <div>
                                    {/* Brand + Rating Row */}
                                    <div className="flex items-center justify-between mb-0.5">
                                        {brandName && (
                                            <span className="text-[9px] text-gray-500 font-bold uppercase tracking-wide">
                                                {brandName}
                                            </span>
                                        )}
                                        {rating > 0 && (
                                            <div className="flex items-center gap-0.5">
                                                <div className="flex items-center gap-0.5 bg-[var(--colour-fsP2)] text-white px-1 py-[1px] rounded-[3px]">
                                                    <span className="text-[8px] font-extrabold">{rating}</span>
                                                    <Star className="w-2 h-2 fill-current" />
                                                </div>
                                                {ratingCount > 0 && (
                                                    <span className="text-[8px] text-gray-400">({ratingCount})</span>
                                                )}
                                            </div>
                                        )}
                                    </div>

                                    <h4 className="text-[12px] font-semibold text-[var(--colour-text2)] line-clamp-2 leading-tight group-hover:text-[var(--colour-fsP2)] transition-colors" title={product.name}>
                                        {product.name}
                                    </h4>
                                </div>

                                <div className="flex items-end justify-between mt-1">
                                    <div className="flex flex-col gap-0.5 leading-none">
                                        <div className="flex items-baseline gap-1.5">
                                            <span className="text-[13px] font-bold text-[var(--colour-fsP2)]">
                                                Rs. {sellPrice.toLocaleString()}
                                            </span>
                                            {hasDiscount && (
                                                <span className="text-[9px] text-[var(--colour-text3)] line-through">
                                                    Rs. {basePrice.toLocaleString()}
                                                </span>
                                            )}
                                        </div>
                                        {/* EMI Badge */}
                                        {emiPrice > 0 && (
                                            <span className="text-[8px] font-semibold text-white bg-[#1967b3] px-1 py-[1px] rounded-sm w-fit">
                                                EMI fr. Rs. {emiPrice.toLocaleString()}
                                            </span>
                                        )}
                                    </div>
                                    <div className="w-5 h-5 rounded-full bg-[var(--colour-fsP2)]/5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                        <ArrowUpRight className="w-3 h-3 text-[var(--colour-fsP2)]" />
                                    </div>
                                </div>
                            </div>
                        </Link>
                    );
                })}
            </div >

            {/* View All */}
            < Link
                href="/category/smartphones?id=1"
                className="flex items-center justify-center gap-1.5 mt-3 py-2 text-[11px] font-semibold text-[var(--colour-fsP2)] bg-[var(--colour-fsP2)]/5 rounded-lg border border-[var(--colour-fsP2)]/15 hover:bg-[var(--colour-fsP2)]/10 transition-colors"
            >
                View All Deals < ArrowUpRight className="w-3 h-3" />
            </Link >
        </div >
    );
});

ProductDeals.displayName = 'ProductDeals';
export default ProductDeals;
