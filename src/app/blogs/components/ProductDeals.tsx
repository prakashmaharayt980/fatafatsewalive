'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Zap, ArrowUpRight, ShoppingBasket } from 'lucide-react';
import { ProductDetails } from '../../types/ProductDetailsTypes';
import { formatPrice } from '@/app/category/[slug]/utils';
import { parseHighlights } from '@/app/CommonVue/highlights';

interface ProductDealsProps {
    products?: ProductDetails[];
    limit?: number;
    title?: string;
}

const ProductDeals = ({ products, limit = 8, title }: ProductDealsProps) => {
    if (!products || products.length === 0) return null;

    return (
        <div className="sticky top-24 overflow-hidden">
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
                {products.slice(0, limit).map((product, index) => {
                    const hasDiscount = product.price > (product.discounted_price || 0);
                    const discountPercent = hasDiscount
                        ? Math.round(((product.price - product.discounted_price) / product.price) * 100)
                        : 0;

                    return (
                        <Link
                            key={product.id}
                            href={`/products/${product.slug}`}
                            className="group relative flex gap-3 p-2.5 rounded-lg bg-white border border-[var(--colour-border3)] hover:border-[var(--colour-fsP2)]/40 hover:shadow-sm transition-all duration-200"
                        >
                            {/* Product Image */}
                            <div className="relative flex-shrink-0 w-[72px] h-[72px] rounded-md bg-[var(--colour-bg4)] overflow-hidden border border-[var(--colour-border3)]">
                                <Image
                                    src={product.image?.thumb || product.image?.full || '/placeholder.png'}
                                    alt={product.name}
                                    fill
                                    className="object-contain p-1.5 group-hover:scale-105 transition-transform duration-300"
                                    sizes="72px"
                                />
                                {hasDiscount && discountPercent > 0 && (
                                    <span className="absolute top-0.5 left-0.5 bg-[var(--colour-fsP1)] text-white text-[8px] font-bold px-1 py-0.5 rounded">
                                        -{discountPercent}%
                                    </span>
                                )}
                            </div>

                            {/* Info */}
                            <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
                                <div>
                                    <h4 className="text-[12px] font-semibold text-[var(--colour-text2)] leading-snug line-clamp-2 group-hover:text-[var(--colour-fsP2)] transition-colors">
                                        {product.name}
                                    </h4>

                                    {parseHighlights(product.highlights, 3).map((h, i) => (
                                        <p className="text-[10px] text-[var(--colour-text3)] line-clamp-1 mt-0.5">
                                            {h}
                                        </p>
                                    ))}
                                </div>
                                <div className="flex items-center justify-between mt-1">
                                    <div className="flex items-baseline gap-1.5">
                                        <span className="text-[13px] font-bold text-[var(--colour-fsP2)]">
                                            Rs. {formatPrice(product.discounted_price || product.price)}
                                        </span>
                                        {hasDiscount && (
                                            <span className="text-[9px] text-[var(--colour-text3)] line-through">
                                                Rs. {formatPrice(product.price)}
                                            </span>
                                        )}
                                    </div>
                                    <div className="w-5 h-5 rounded-full bg-[var(--colour-fsP2)]/10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                        <ArrowUpRight className="w-3 h-3 text-[var(--colour-fsP2)]" />
                                    </div>
                                </div>
                            </div>
                        </Link>
                    );
                })}
            </div>

            {/* View All */}
            <Link
                href="/category/smartphones?id=1"
                className="flex items-center justify-center gap-1.5 mt-3 py-2 text-[11px] font-semibold text-[var(--colour-fsP2)] bg-[var(--colour-fsP2)]/5 rounded-lg border border-[var(--colour-fsP2)]/15 hover:bg-[var(--colour-fsP2)]/10 transition-colors"
            >
                View All Deals <ArrowUpRight className="w-3 h-3" />
            </Link>
        </div>
    );
};

export default ProductDeals;
