'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowUpRight, ShoppingBasket, Star } from 'lucide-react';
import { parseHighlights } from '@/app/CommonVue/highlights';
import { placeholderimg } from '@/app/CommonVue/Image';

interface ProductDealsProps {
    products?: any[];
    title: string;
    slug?: string;
}

const ProductDeals = React.memo(({ products = [], title, slug = 'mobile-price-in-nepal' }: ProductDealsProps) => {


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
                {products.map((p: any) => {
                    const item = p.product || p; // Support both {product, sellPrice} and direct product
                    const brandName = item.brandName || item.brand?.name;

                    // Robust Data Logic (The "Func")
                    const rating = item.displayRating || item.average_rating || 0;
                    const ratingCount = item.displayRatingCount || item.rating_count || 0;
                    const imageUrl = item.thumb?.url || item.image?.thumb || placeholderimg;
                    const displayPrice = item.displayPrice || (item.discountedPriceVal ?? item.price)?.toLocaleString();
                    const highlights = parseHighlights(item.highlights, 2);

                    return (
                        <Link
                            key={item.id}
                            href={`/product-details/${item.slug}`}
                            className="group flex gap-3 p-2.5 rounded-xl bg-white border border-(--colour-border3) hover:border-(--colour-fsP2)/50 hover:shadow-[0_1px_6px_rgba(0,0,0,0.06)] transition-all duration-200"
                        >
                            <div className="relative flex-shrink-0 w-17 h-17 rounded-lg bg-(--colour-bg4) overflow-hidden border border-(--colour-border3)">

          {/* TODO: placeholderimg */}
                                <Image
                                    src={imageUrl }
                                    alt={item.name}
                                    fill
                                    className="object-contain p-1.5 group-hover:scale-[1.04] transition-transform duration-300"
                                    sizes="68px"
                                />
                            </div>

                            <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
                                <div>
                                    <div className="flex items-center justify-between mb-0.5">
                                        {brandName && (
                                            <span className="text-[9px] text-gray-400 font-semibold uppercase tracking-widest">
                                                {brandName}
                                            </span>
                                        )}
                                        {rating > 0 && (
                                            <div className="flex items-center gap-0.5">
                                                <div className="flex items-center gap-0.5 bg-(--colour-fsP2) text-white px-1 py-px rounded-[3px]">
                                                    <Star className="w-2 h-2 fill-current" />
                                                    <span className="text-[8px] font-bold">{rating}</span>
                                                </div>
                                                {ratingCount > 0 && (
                                                    <span className="text-[8px] text-gray-400">({ratingCount})</span>
                                                )}
                                            </div>
                                        )}
                                    </div>

                                    <h4 className="text-[12px] font-semibold text-(--colour-text2) line-clamp-1 leading-tight group-hover:text-(--colour-fsP2) transition-colors" title={item.name}>
                                        {item.name}
                                    </h4>

                                    {highlights.length > 0 && (
                                        <div className="flex flex-wrap gap-1 mt-1">
                                            {highlights.map((h, i) => (
                                                <span key={i} className="text-[8px] text-gray-400 bg-gray-50 border border-gray-100 px-1.5 py-0.5 rounded-sm truncate max-w-full">
                                                    {h}
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                <div className="flex items-center justify-between mt-1.5">
                                    <span className="text-[13px] font-bold text-(--colour-fsP2)">
                                        Rs. {displayPrice}
                                    </span>
                                    <ArrowUpRight className="w-3.5 h-3.5 text-gray-300 group-hover:text-(--colour-fsP2) transition-colors duration-200" />
                                </div>
                            </div>
                        </Link>
                    );
                })}
            </div >

            <Link
                href={`/category/${slug}`}
                className="flex items-center justify-center gap-1.5 mt-3 py-2 text-[11px] font-semibold text-[var(--colour-fsP2)] bg-[var(--colour-fsP2)]/5 rounded-lg border border-[var(--colour-fsP2)]/15 hover:bg-[var(--colour-fsP2)]/10 transition-colors"
            >
                View All {title} <ArrowUpRight className="w-3 h-3" />
            </Link>
        </div >
    );
});

ProductDeals.displayName = 'ProductDeals';
export default ProductDeals;
