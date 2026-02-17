'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Star, ShoppingCart, ThumbsUp, ThumbsDown } from 'lucide-react';
import { ProductDetails } from '../../types/ProductDetailsTypes';
import { parseHighlights } from '@/app/CommonVue/highlights';

interface BlogFastSaleProductCardsProps {
    product: ProductDetails;
    index?: number;
}

export default function BlogFastSaleProductCards({ product, index = 0 }: BlogFastSaleProductCardsProps) {
    if (!product) return null;

    const originalPrice = typeof product.price === 'string' ? parseInt(product.price) : product.price;
    const discountedPrice = typeof product.discounted_price === 'string' ? parseInt(product.discounted_price) : product.discounted_price;
    const hasDiscount = originalPrice > discountedPrice;
    const discountPercent = hasDiscount ? Math.round(((originalPrice - discountedPrice) / originalPrice) * 100) : 0;
    const imageUrl = product.image?.preview

    // Mock rating
    const rating = product.average_rating || (4.0 + Math.random() * 0.8);
    const fullStars = Math.floor(rating);
    const hasHalf = rating - fullStars >= 0.5;

    // Highlights as specs
    const highlights = parseHighlights(product.highlights);

    // Mock pros and cons from highlights
    const mockPros = [
        highlights[0] || 'Great performance',
        highlights[1] || 'Premium build quality',
        highlights[2] || 'Good battery life',
        highlights[3] || 'Good battery life',
        highlights[4] || 'Good battery life',
    ];
    const mockCons = [
        'Limited color options',
        highlights[2] ? `Could improve ${highlights[2].toLowerCase()}` : 'Average battery life',
        highlights[3] ? `Could improve ${highlights[3].toLowerCase()}` : 'Average battery life',
        highlights[4] ? `Could improve ${highlights[4].toLowerCase()}` : 'Average battery life',
    ];

    return (
        <div className="group bg-white rounded-sm border border-[var(--colour-border3)] overflow-hidden hover:shadow-md transition-all duration-300">
            {/* Top: Image + Quick Info */}
            <div className="flex gap-3 p-3">
                {/* Product Image */}
                <Link
                    href={`/products/${product.slug}`}
                    className="relative w-24 h-24 sm:w-28 sm:h-28 flex-shrink-0 rounded-lg bg-[var(--colour-bg4)] border border-[var(--colour-border3)] overflow-hidden"
                >
                    {hasDiscount && discountPercent > 0 && (
                        <span className="absolute top-0 left-0 z-10 bg-[var(--colour-fsP1)] text-white text-[8px] font-bold px-1.5 py-0.5 rounded-br-lg">
                            -{discountPercent}%
                        </span>
                    )}
                    <Image
                        src={imageUrl}
                        alt={product.name}
                        fill
                        className="object-contain p-2 mix-blend-multiply group-hover:scale-105 transition-transform duration-300"
                        sizes="120px"
                    />
                </Link>

                {/* Info */}
                <div className="flex-1 min-w-0 flex flex-col">
                    <Link href={`/products/${product.slug}`}>
                        <h4 className="text-[12px] sm:text-[13px] font-bold text-[var(--colour-text2)] leading-snug line-clamp-2 group-hover:text-[var(--colour-fsP2)] transition-colors">
                            {product.name}
                        </h4>
                    </Link>

                    {/* Stars */}
                    <div className="flex items-center gap-1 mt-1">
                        {[...Array(5)].map((_, i) => (
                            <Star
                                key={i}
                                className={`w-3 h-3 ${i < fullStars
                                    ? 'text-amber-400 fill-amber-400'
                                    : i === fullStars && hasHalf
                                        ? 'text-amber-400 fill-amber-400/50'
                                        : 'text-gray-200 fill-gray-200'
                                    }`}
                            />
                        ))}
                        <span className="text-[10px] text-[var(--colour-text3)] ml-0.5 font-semibold">
                            {rating.toFixed(1)}
                        </span>
                    </div>
                    <div className="mt-auto pt-1.5">
                        {parseHighlights(product.highlights, 3).length > 0 && (
                            <div className="flex flex-wrap gap-1">
                                {parseHighlights(product.highlights, 3).map((h, i) => (
                                    <span key={i} className="text-[9px] text-[var(--colour-text3)] bg-[var(--colour-bg4)] px-1.5 py-0.5 rounded border border-[var(--colour-border3)]">
                                        {h}
                                    </span>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Price */}
                    <div className="mt-auto ">
                        <div className="flex items-baseline gap-1.5">
                            <span className="text-[14px] font-bold text-[var(--colour-text2)]">
                                Rs. {(discountedPrice < originalPrice ? discountedPrice : originalPrice)?.toLocaleString()}
                            </span>
                            {hasDiscount && (
                                <span className="text-[10px] text-[var(--colour-text3)] line-through">
                                    Rs. {originalPrice?.toLocaleString()}
                                </span>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Pros & Cons */}
            <div className="grid grid-cols-2 gap-2 px-3 pb-2">
                {/* Pros */}
                <div>
                    <div className="flex items-center gap-1 mb-1">
                        <ThumbsUp className="w-3 h-3 text-green-500" />
                        <span className="text-[9px] font-bold text-green-600 uppercase tracking-wider">Pros</span>
                    </div>
                    {mockPros.map((pro, i) => (
                        <p key={i} className="text-[10px] text-[var(--colour-text3)] leading-relaxed flex items-start gap-1">
                            <span className="text-green-400 mt-[3px] flex-shrink-0">✓</span>
                            <span className="line-clamp-1">{pro}</span>
                        </p>
                    ))}
                </div>
                {/* Cons */}
                <div>
                    <div className="flex items-center gap-1 mb-1">
                        <ThumbsDown className="w-3 h-3 text-red-400" />
                        <span className="text-[9px] font-bold text-red-500 uppercase tracking-wider">Cons</span>
                    </div>
                    {mockCons.map((con, i) => (
                        <p key={i} className="text-[10px] text-[var(--colour-text3)] leading-relaxed flex items-start gap-1">
                            <span className="text-red-300 mt-[3px] flex-shrink-0">✗</span>
                            <span className="line-clamp-1">{con}</span>
                        </p>
                    ))}
                </div>
            </div>

            {/* Buy Now Button */}
            <div className="px-3 pb-3">
                <Link
                    href={`/products/${product.slug}`}
                    className="w-full flex items-center justify-center gap-1.5 bg-[var(--colour-fsP2)] text-white text-[11px] font-semibold py-2 rounded-lg hover:brightness-110 transition-all active:scale-[0.98]"
                >
                    <ShoppingCart className="w-3.5 h-3.5" />
                    Buy Now
                </Link>
            </div>
        </div>
    );
}
