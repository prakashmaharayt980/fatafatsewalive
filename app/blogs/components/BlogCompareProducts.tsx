'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Star } from 'lucide-react';
import type { ProductDetails } from '../../types/ProductDetailsTypes';
import imglogo from '../../assets/logoimg.png';
import SectionHeader from './SectionHeader';

interface BlogCompareProductsProps {
    products?: ProductDetails[];
}

function ProductSide({ product, side }: { product: ProductDetails; side: 'left' | 'right' }) {
    const extractPrice = (p: any): number => {
        if (typeof p === 'number') return p;
        if (typeof p === 'string') return parseInt(p) || 0;
        if (typeof p === 'object' && p !== null) return parseInt(String(p.current || p.price || 0)) || 0;
        return 0;
    };

    const price = extractPrice(product.price);
    const imgUrl = product.thumb?.url || product.image?.preview || product.image?.full || imglogo.src;
    const rating = product.average_rating || 0;

    return (
        <div className={`flex flex-col items-center gap-2 flex-1 ${side === 'left' ? 'pr-2 sm:pr-3' : 'pl-2 sm:pl-3'}`}>
            <Link href={`/product-details/${product.slug}`} className="relative w-full aspect-square flex items-center justify-center  bg-transparent rounded-xl p-2  transition-colors">
                <div className="relative w-full h-full">
                    <Image
                        src={imgUrl}
                        alt={product.name}
                        fill
                        className="object-contain transition-transform duration-300 "
                        sizes="(max-width: 640px) 40vw, 150px"
                    />
                </div>
            </Link>

            <div className="text-center space-y-0.5 w-full">
                <Link href={`/product-details/${product.slug}`}>
                    <p className="text-[var(--colour-text2)] font-semibold text-[11px] sm:text-[12px] leading-tight line-clamp-2 hover:text-[var(--colour-fsP2)] transition-colors">
                        {product.name}
                    </p>
                </Link>
                <p className="text-[var(--colour-fsP2)] font-bold text-[11px] sm:text-[13px]">
                    Rs. {price?.toLocaleString()}
                </p>
                {rating > 0 && (
                    <div className="flex items-center justify-center gap-0.5">
                        <Star className="w-2.5 h-2.5 text-amber-400 fill-amber-400" />
                        <span className="text-[10px] text-[var(--colour-text3)]">{rating.toFixed(1)}</span>
                    </div>
                )}
            </div>
        </div>
    );
}

function CompareCard({ left, right }: { left: ProductDetails; right: ProductDetails }) {
    const [hovered, setHovered] = useState(false);
    const category = left.categories?.[0]?.title || right.categories?.[0]?.title || 'Featured';

    return (
        <div
            className="group bg-white rounded-xl border border-[var(--colour-border3)] overflow-hidden transition-all duration-300 hover:shadow-md hover:-translate-y-0.5"
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
        >


            {/* Products Row */}
            <div className="relative flex items-center px-3 py-3">
                <ProductSide product={left} side="left" />

                {/* VS Badge */}
                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
                    <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center transition-all duration-300 ${hovered
                        ? 'bg-[var(--colour-fsP2)] shadow-sm'
                        : 'bg-[var(--colour-bg4)] border border-[var(--colour-border3)]'
                        }`}>
                        <span className={`text-[10px] font-black italic transition-colors ${hovered ? 'text-white' : 'text-[var(--colour-text3)]'}`}>
                            VS
                        </span>
                    </div>
                </div>

                <ProductSide product={right} side="right" />
            </div>

            {/* Compare Button */}
            <div className="px-3 pb-3">
                <Link
                    href={`/compare?slugs=${left.slug},${right.slug}`}

                    className={`flex items-center justify-center w-full py-2 rounded-lg text-[11px] font-semibold transition-all duration-200 ${hovered
                        ? 'bg-[var(--colour-fsP2)] text-white'
                        : 'bg-[var(--colour-bg4)] text-[var(--colour-text3)]'
                        }`}
                >
                    Compare Specs
                </Link>
            </div>
        </div>
    );
}

export default function BlogCompareProducts({ products }: BlogCompareProductsProps) {
    if (!products || products.length < 6) return null;

    const pairs: [ProductDetails, ProductDetails][] = [];
    // Only show 2 pairs (4 products total)
    for (let i = 0; i + 1 < products.length && pairs.length < 6; i += 2) {
        pairs.push([products[i], products[i + 1]]);
    }

    return (
        <section className="py-2">
            <SectionHeader
                title="Compare Products"
                accentColor="var(--colour-fsP1)"
                linkHref="/compare"
                linkText="View All"
            />

            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-3 mt-4 text-center items-center">
                {pairs.map(([left, right]) => (
                    <CompareCard key={`${left.id}-${right.id}`} left={left} right={right} />
                ))}
            </div>
        </section>
    );
}
