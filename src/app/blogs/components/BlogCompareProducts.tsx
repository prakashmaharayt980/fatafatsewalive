'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ProductDetails } from '../../types/ProductDetailsTypes';

interface BlogCompareProductsProps {
    products?: ProductDetails[];
}



function ProductSide({ product, side }: { product: ProductDetails; side: 'left' | 'right' }) {
    const imgUrl = product.image?.preview || product.image?.thumb || product.image?.full;
    const price = product.discounted_price < product.price ? product.discounted_price : product.price;
    const category = product.categories?.[0]?.title || 'Product';
    const rating = product.average_rating || (3.5 + Math.random() * 1.5);

    return (
        <div className={`flex flex-col items-center gap-2 flex-1 ${side === 'left' ? 'pr-3' : 'pl-3'}`}>


            {/* Image */}
            <Link href={`/products/${product.slug}`} className="relative w-28 h-32 flex items-center justify-center group/img">
                <Image
                    src={imgUrl}
                    alt={product.name}
                    width={112}
                    height={128}
                    className="object-contain drop-shadow-lg transition-transform duration-500 group-hover/img:scale-110"
                />
            </Link>

            {/* Name */}
            <Link href={`/products/${product.slug}`}>
                <p className="text-[var(--colour-text2)] font-semibold text-[12px] text-center leading-snug line-clamp-2 max-w-[120px] hover:text-[var(--colour-fsP2)] transition-colors">
                    {product.name}
                </p>
            </Link>

            {/* Price */}
            <span className="text-[13px] font-bold text-[var(--colour-text2)]">
                Rs. {price?.toLocaleString()}
            </span>

        </div>
    );
}

function CompareCard({ left, right }: { left: ProductDetails; right: ProductDetails }) {
    const [hovered, setHovered] = useState(false);
    const category = left.categories?.[0]?.title || right.categories?.[0]?.title || 'Products';

    return (
        <div
            className="group bg-white rounded-lg border border-[var(--colour-border3)] overflow-hidden cursor-pointer transition-all duration-300 hover:shadow-md hover:-translate-y-0.5"
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
        >
            {/* Category */}
            <div className="text-center pt-3 pb-1.5">
                <span className="text-[12px] font-bold uppercase  text-[var(--colour-fsP2)]">{category}</span>
            </div>

            {/* Products */}
            <div className="flex items-stretch px-3 pb-3">
                <ProductSide product={left} side="left" />

                {/* VS */}
                <div className="flex flex-col items-center justify-center gap-1 shrink-0">
                    <div className="w-px h-10 bg-[var(--colour-border3)]" />
                    <div className={`w-10 h-10 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${hovered
                        ? 'border-[var(--colour-fsP2)] bg-[var(--colour-fsP2)]/10 scale-110'
                        : 'border-[var(--colour-border3)] bg-[var(--colour-bg4)]'
                        }`}>
                        <span className={`text-[9px] font-black uppercase transition-colors ${hovered ? 'text-[var(--colour-fsP2)]' : 'text-[var(--colour-text3)]'
                            }`}>VS</span>
                    </div>
                    <div className="w-px h-10 bg-[var(--colour-border3)]" />
                </div>

                <ProductSide product={right} side="right" />
            </div>

            {/* Compare Button */}
            <div className="px-3 pb-3">
                <Link
                    href={`/compare?ids=${left.id},${right.id}`}
                    className={`block w-full py-2 rounded-lg text-[10px] font-bold uppercase tracking-wider text-center transition-all duration-300 ${hovered
                        ? 'bg-[var(--colour-fsP2)] text-white shadow-sm'
                        : 'bg-[var(--colour-bg4)] text-[var(--colour-text3)] border border-[var(--colour-border3)]'
                        }`}
                >
                    Compare Now
                </Link>
            </div>
        </div>
    );
}

export default function BlogCompareProducts({ products }: BlogCompareProductsProps) {
    if (!products || products.length < 2) return null;

    // Pair products: [0,1], [2,3], [4,5], [6,7]
    const pairs: [ProductDetails, ProductDetails][] = [];
    for (let i = 0; i + 1 < products.length && pairs.length < 4; i += 2) {
        pairs.push([products[i], products[i + 1]]);
    }

    return (
        <div>
            {/* Header */}
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2.5">
                    <div className="w-1 h-6 bg-[var(--colour-fsP1)] rounded-full" />
                    <h2 className="text-base sm:text-lg font-bold text-[var(--colour-text2)]">Compare Products</h2>
                </div>
                <Link href="/compare" className="text-xs font-semibold text-[var(--colour-fsP2)] hover:text-[var(--colour-fsP1)] transition-colors flex items-center gap-1">
                    View All <span className="text-sm">→</span>
                </Link>
            </div>

            {/* Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5">
                {pairs.map(([left, right], idx) => (
                    <CompareCard key={`${left.id}-${right.id}`} left={left} right={right} />
                ))}
            </div>
        </div>
    );
}