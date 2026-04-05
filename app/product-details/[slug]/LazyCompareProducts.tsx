'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { fetchCategoryProducts } from '@/app/product-details/actions';
import { ChevronRight, Scale } from 'lucide-react';
import { decorateProduct } from '@/app/api/utils/productDecorator';
import type { DecoratedProduct } from '@/app/types/DecoratedProduct';

interface LazyCompareProductsProps {
    categorySlug?: string;
    currentProductId?: number;
}

function ProductSide({ product }: { product: DecoratedProduct }) {
    const imgUrl = product.thumb?.url || '/svgfile/no-image.svg';
    const discountPct = product.discountPercent ?? 0;

    return (
        <div className="flex flex-col items-center gap-2 flex-1 min-w-0">
            {/* Image tile — theme blue highlight bg with hover lift */}
            <Link
                href={`/product-details/${product.slug}`}
                className="relative w-full aspect-[4/3] rounded-xl overflow-hidden flex items-center justify-center transition-transform duration-300 hover:-translate-y-0.5"
            >
                <Image
                    src={imgUrl}
                    alt={product.name}
                    width={110}
                    height={110}
                    className="object-contain w-[85%] h-[85%] transition-transform duration-500 group-hover:scale-105 drop-shadow-sm"
                />
                {/* Discount badge */}
                {discountPct > 0 && (
                    <span className="absolute top-1.5 left-1.5 bg-red-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full shadow-sm">
                        -{discountPct}%
                    </span>
                )}
            </Link>

            {/* Brand */}
            <span className="text-[9.5px] font-bold text-[var(--colour-fsP2)] uppercase tracking-wider truncate w-full text-center">
                {product.brandName}
            </span>

            {/* Name */}
            <Link href={`/product-details/${product.slug}`} className="w-full px-0.5">
                <p className="text-slate-700 text-[11px] font-semibold text-center leading-snug line-clamp-2 hover:text-[var(--colour-fsP2)] transition-colors">
                    {product.name}
                </p>
            </Link>

            {/* Price */}
            <div className="flex flex-col items-center gap-0.5">
                <span className="text-sm font-extrabold text-slate-900">
                    Rs.&nbsp;{product.displayPrice}
                </span>
                {discountPct > 0 && product.basePrice !== product.discountedPriceVal && (
                    <span className="text-[10px] text-slate-400 line-through">
                        Rs.&nbsp;{(product.basePrice ?? 0).toLocaleString()}
                    </span>
                )}
            </div>
        </div>
    );
}

function CompareCard({ left, right }: { left: DecoratedProduct; right: DecoratedProduct }) {
    return (
        <div className="group bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:border-[var(--colour-fsP2)]/20 transition-all duration-200 overflow-hidden">
            {/* Products row */}
            <div className="flex items-stretch gap-1 px-3 pt-4 pb-3">
                <ProductSide product={left} />

                {/* VS divider */}
                <div className="flex flex-col items-center justify-center gap-1.5 shrink-0 px-1.5">
                    <div className="w-px flex-1 bg-gray-100 group-hover:bg-[var(--colour-fsP2)]/20 transition-colors" />
                    <div className="w-7 h-7 rounded-full bg-[#EBF3FC] border-2 border-[var(--colour-fsP2)]/20 group-hover:border-[var(--colour-fsP2)]/50 flex items-center justify-center transition-colors shrink-0">
                        <span className="text-[8px] font-black uppercase text-[var(--colour-fsP2)]">VS</span>
                    </div>
                    <div className="w-px flex-1 bg-gray-100 group-hover:bg-[var(--colour-fsP2)]/20 transition-colors" />
                </div>

                <ProductSide product={right} />
            </div>

            {/* CTA */}
            <div className="px-3 pb-3 pt-1">
                <Link
                    href={`/compare?slugs=${left.slug},${right.slug}`}
                
                    className="block w-full py-2 rounded-xl text-[10.5px] font-bold uppercase tracking-wider text-center text-[var(--colour-fsP2)] bg-[#EBF3FC] hover:bg-[var(--colour-fsP2)] hover:text-white transition-all duration-200"
                >
                    Compare Now
                </Link>
            </div>
        </div>
    );
}

export default function LazyCompareProducts({ categorySlug, currentProductId }: LazyCompareProductsProps) {
    const [data, setData] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (!categorySlug) {
            setIsLoading(false);
            return;
        }

        setIsLoading(true);
        fetchCategoryProducts(categorySlug, { per_page: 10, min_price: 100 })
            .then((res) => {
                if (res?.data) setData(res.data);
            })
            .catch((error: any) => {
                if (error?.response?.status !== 404) {
                    console.error('Failed to fetch compare products:', error);
                }
            })
            .finally(() => setIsLoading(false));
    }, [categorySlug, currentProductId]);

    const productList = (data?.products ?? []).map((p: any, idx: number) => decorateProduct(p, idx));
    const filteredProducts = currentProductId
        ? productList.filter((p: DecoratedProduct) => p.id !== currentProductId)
        : productList;

    const pairs: [DecoratedProduct, DecoratedProduct][] = [];
    for (let i = 0; i + 1 < filteredProducts.length && pairs.length < 4; i += 2) {
        pairs.push([filteredProducts[i], filteredProducts[i + 1]]);
    }

    if (isLoading || pairs.length === 0) return null;

    return (
        <div className="w-full sm:px-4">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2.5">
                    <div className="w-1 h-7 bg-slate-800 rounded-full" />
                    <div className="w-7 h-7 rounded-lg bg-[#EBF3FC] flex items-center justify-center">
                        <Scale className="w-3.5 h-3.5 text-[var(--colour-fsP2)]" />
                    </div>
                    <h2 className="text-base sm:text-lg font-bold text-slate-800 tracking-tight">
                        Compare Similar Products
                    </h2>
                </div>

                <Link
                    href={`/compare?ids=${currentProductId}`}
                    className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-[var(--colour-fsP2)] hover:bg-[#EBF3FC] rounded-full transition-colors group"
                >
                    View All
                    <ChevronRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
                </Link>
            </div>

            {/* Cards grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:px-4">
                {pairs.map(([left, right]) => (
                    <CompareCard key={`${left.id}-${right.id}`} left={left} right={right} />
                ))}
            </div>
        </div>
    );
}