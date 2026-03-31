import Image from 'next/image';
import Link from 'next/link';
import { Star, ShoppingCart, CheckCircle2 } from 'lucide-react';
import type { ProductDetails } from '../../types/ProductDetailsTypes';
import { parseHighlights } from '@/app/CommonVue/highlights';
import imglogo from '../../assets/logoimg.png';

interface BlogFastSaleProductCardsProps {
    product: ProductDetails;
    index?: number;
    layout?: 'horizontal' | 'vertical';
}

export default function BlogFastSaleProductCards({ 
    product, 
    index = 0, 
    layout = 'horizontal' 
}: BlogFastSaleProductCardsProps) {
    if (!product) return null;

    const extractPrice = (p: any): number => {
        if (typeof p === 'number') return p;
        if (typeof p === 'string') return parseInt(p) || 0;
        if (typeof p === 'object' && p !== null) return parseInt(String(p.current || p.price || 0)) || 0;
        return 0;
    };

    const originalPrice = (product as any).basePrice ?? extractPrice(product.price);
    const discountedPrice = (product as any).discountedPriceVal ?? extractPrice((product as any).discounted_price || product.price);
    const hasDiscount = originalPrice > discountedPrice;
    const discountPercent = (product as any).discountPercent ?? (hasDiscount ? Math.round(((originalPrice - discountedPrice) / originalPrice) * 100) : 0);
    const displayPrice = (product as any).displayPrice ?? (discountedPrice || originalPrice).toLocaleString();
    
    // Robust Image URL
    // Robust Image URL
    const imageUrl = product.thumb?.url || (product as any).image?.thumb || (product as any).image?.full || (product as any).thumb_url || imglogo.src;

    // Real Rating
    const rating = product.average_rating || 0;
    const fullStars = Math.floor(rating);
    const hasHalf = rating - fullStars >= 0.5;

    // Real Features from Highlights (Limit to 3)
    const highlights = parseHighlights(product.highlights, 3);

    if (layout === 'vertical') {
        return (
            <div className="group flex flex-col h-full bg-white rounded-xl border border-[var(--colour-border3)] overflow-hidden hover:shadow-xl transition-all duration-500 hover:-translate-y-1">
                {/* Top: Large Image Section */}
                <Link
                    href={`/product-details/${product.slug}`}
                    className="relative w-full aspect-square bg-[var(--colour-bg4)] border-b border-[var(--colour-border3)] p-4 flex items-center justify-center overflow-hidden transition-colors group-hover:bg-white"
                >
                    {hasDiscount && discountPercent > 0 && (
                        <div className="absolute top-0 left-0 z-10 bg-[var(--colour-fsP1)] text-white text-[10px] font-bold px-2.5 py-1 rounded-br-xl shadow-sm">
                            -{discountPercent}%
                        </div>
                    )}
                    <div className="relative w-full h-full">
                        <Image
                            src={imageUrl}
                            alt={product.name}
                            fill
                            className="object-contain transition-transform duration-700 group-hover:scale-110"
                            sizes="(max-width: 640px) 50vw, 200px"
                        />
                    </div>
                </Link>

                {/* Bottom: Information Section */}
                <div className="flex-1 flex flex-col p-4">
                    {/* Identity */}
                    <Link href={`/product-details/${product.slug}`} className="mb-2">
                        <h4 className="text-[13px] font-bold text-[var(--colour-text2)] leading-tight line-clamp-2 min-h-[2.5rem] group-hover:text-[var(--colour-fsP2)] transition-colors">
                            {product.name}
                        </h4>
                    </Link>

                    {/* Rating (Compact) */}
                    <div className="flex items-center gap-1.5 mb-3">
                        <div className="flex items-center gap-0.5">
                            {[...Array(5)].map((_, i) => (
                                <Star
                                    key={i}
                                    className={`w-3 h-3 ${i < fullStars
                                        ? 'text-amber-400 fill-amber-400'
                                        : i === fullStars && hasHalf
                                            ? 'text-amber-400 fill-amber-400/30'
                                            : 'text-gray-200 fill-gray-200'
                                        }`}
                                />
                            ))}
                        </div>
                        <span className="text-[10px] text-[var(--colour-text3)] font-bold">
                            {rating > 0 ? rating.toFixed(1) : 'New'}
                        </span>
                    </div>

                    {/* Highlights as Tags */}
                    <div className="flex flex-wrap gap-1 mb-3 mt-auto">
                        {highlights.map((h, i) => (
                            <span key={i} className="text-[9px] font-medium text-[var(--colour-text3)] bg-[var(--colour-bg4)] px-2 py-0.5 rounded-full border border-[var(--colour-border3)] line-clamp-1 whitespace-nowrap">
                                {h}
                            </span>
                        ))}
                    </div>

                    {/* Price & CTA */}
                    <div className="flex flex-col gap-2 mt-auto pt-3 border-t border-gray-50">
                        <div className="flex items-baseline justify-between">
                            <span className="text-[15px] font-black text-[var(--colour-fsP2)]">
                                Rs. {displayPrice}
                            </span>
                            {hasDiscount && (
                                <span className="text-[10px] text-[var(--colour-text3)] line-through">
                                    Rs. {originalPrice?.toLocaleString()}
                                </span>
                            )}
                        </div>
                        <Link
                            href={`/product-details/${product.slug}`}
                            className="w-full h-9 flex items-center justify-center gap-2 bg-[var(--colour-fsP2)] text-white text-[11px] font-bold rounded-lg hover:brightness-110 hover:shadow-lg transition-all active:scale-[0.98]"
                        >
                            <ShoppingCart className="w-3.5 h-3.5" />
                            Buy Now
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    // Default: Horizontal Layout (for sidebars)
    return (
        <div className="group bg-white rounded-lg border border-[var(--colour-border3)] overflow-hidden hover:shadow-lg transition-all duration-500 hover:-translate-y-1">
            {/* Top Area: Image + Key Info */}
            <div className="flex gap-4 p-4">
                {/* Product Image Container */}
                <Link
                    href={`/product-details/${product.slug}`}
                    className="relative w-24 h-24 sm:w-28 sm:h-28 flex-shrink-0 rounded-lg bg-[var(--colour-bg4)] border border-[var(--colour-border3)] p-2 transition-colors duration-300 group-hover:border-[var(--colour-fsP2)]/20"
                >
                    {hasDiscount && discountPercent > 0 && (
                        <div className="absolute top-0 left-0 z-10 bg-[var(--colour-fsP1)] text-white text-[9px] font-bold px-2 py-0.5 rounded-br-lg shadow-sm">
                            -{discountPercent}%
                        </div>
                    )}
                    <div className="relative w-full h-full">
                        <Image
                            src={imageUrl}
                            alt={product.name}
                            fill
                            className="object-contain transition-transform duration-500 group-hover:scale-110"
                            sizes="120px"
                        />
                    </div>
                </Link>

                {/* Right Side: Identity + Rating + Features */}
                <div className="flex-1 min-w-0 flex flex-col pt-0.5">
                    <Link href={`/product-details/${product.slug}`}>
                        <h4 className="text-[14px] font-bold text-[var(--colour-text2)] leading-tight line-clamp-2 group-hover:text-[var(--colour-fsP2)] transition-colors mb-2">
                            {product.name}
                        </h4>
                    </Link>

                    {/* Rating Section (only show if rating exists) */}
                    <div className="flex items-center gap-1.5 mb-2.5">
                        <div className="flex items-center gap-0.5">
                            {[...Array(5)].map((_, i) => (
                                <Star
                                    key={i}
                                    className={`w-3 h-3 ${i < fullStars
                                        ? 'text-amber-400 fill-amber-400'
                                        : i === fullStars && hasHalf
                                            ? 'text-amber-400 fill-amber-400/30'
                                            : 'text-gray-200 fill-gray-200'
                                        }`}
                                />
                            ))}
                        </div>
                        <span className="text-[11px] text-[var(--colour-text3)] font-bold">
                            {rating > 0 ? rating.toFixed(1) : 'New Arrival'}
                        </span>
                    </div>

                    {/* Quick Features List */}
                    <div className="space-y-1.5 mb-1.5 flex-1">
                        {highlights.map((feature, i) => (
                            <div key={i} className="flex items-start gap-1.5">
                                <CheckCircle2 className="w-3 h-3 text-[var(--colour-fsP2)]/60 mt-0.5 flex-shrink-0" />
                                <span className="text-[10px] text-[var(--colour-text3)] line-clamp-1 font-medium">
                                    {feature}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Bottom Bar: Price + CTA */}
            <div className="px-4 pb-4 pt-0">
                <div className="flex items-center justify-between mb-3 border-t border-gray-50 pt-3">
                    <div className="flex flex-col">
                        <span className="text-[16px] font-bold text-[var(--colour-text2)] leading-none">
                            Rs. {displayPrice}
                        </span>
                        {hasDiscount && (
                            <span className="text-[11px] text-[var(--colour-text3)] line-through mt-0.5">
                                Rs. {originalPrice?.toLocaleString()}
                            </span>
                        )}
                    </div>
                    
                    <Link
                        href={`/product-details/${product.slug}`}
                        className="flex items-center gap-2 bg-[var(--colour-fsP2)]/10 text-[var(--colour-fsP2)] hover:bg-[var(--colour-fsP2)] hover:text-white text-[11px] font-bold px-4 py-2 rounded-full transition-all duration-300"
                    >
                        Buy Now
                        <ShoppingCart className="w-3.5 h-3.5" />
                    </Link>
                </div>
            </div>
        </div>
    );
}
