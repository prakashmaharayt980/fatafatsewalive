import { Heart, Star, Scale } from "lucide-react";
import Image from "next/image";
import { useRouter } from 'next/navigation';
import { useContextCart } from "@/app/checkout/CartContext1";
import { useCompare } from "@/app/context/CompareContext";
import { parseHighlights } from "@/app/CommonVue/highlights";
import { ProductCardProps } from "../ProductCard";
import { ProductDetails } from "@/app/types/ProductDetailsTypes";
import { cn } from "@/lib/utils";
// ...

const BlogProductCard = ({ product, index, priority = false, hidePrice = false }: ProductCardProps) => {
    const router = useRouter();
    const { addToWishlist } = useContextCart();
    const { addToCompare, removeFromCompare, compareList } = useCompare(); // Use CompareContext
    const compareItems = compareList; // Alias
    const isCompared = compareItems?.some(i => i.id === product.id);

    if (!product || !product.id) return null;

    const originalPrice = typeof product.price === 'string' ? parseInt(product.price) : product.price;
    const discountedPrice = typeof product.discounted_price === 'string' ? parseInt(product.discounted_price) : product.discounted_price;
    const hasDiscount = originalPrice > discountedPrice;
    const discountPercent = hasDiscount ? Math.round(((originalPrice - discountedPrice) / originalPrice) * 100) : 0;

    const imageUrl = product.image?.preview || product.image?.thumb || product.image?.full;

    // Mock rating data
    const rating = product.average_rating || (3.5 + Math.random() * 1.5);
    const ratingCount = product.rating_count || Math.floor(20 + Math.random() * 200);
    const fullStars = Math.floor(rating);
    const hasHalf = rating - fullStars >= 0.5;

    // Color variants (mock if not available)
    const colors = product.colors || ['#1e293b', '#dc2626', '#2563eb', '#f59e0b'];

    const handleProductClick = () => {
        if (!product.slug || !product.id) return;
        router.push(`/products/${product.slug}`);
    };

    return (
        <div
            onClick={handleProductClick}
            className="group relative cursor-pointer w-full flex flex-col bg-white h-full rounded-lg overflow-hidden border-2 border-[var(--colour-border3)] hover:border-[var(--colour-fsP2)]/40 hover:shadow-sm transition-all duration-250"
        >
            {/* Wishlist */}
            <button
                className="absolute top-2 right-2 z-20 p-1.5 rounded-full bg-white/90 backdrop-blur-sm shadow-sm text-[var(--colour-text3)] hover:text-red-500 hover:scale-110 transition-all duration-200"
                onClick={(e) => {
                    e.stopPropagation();
                    addToWishlist(Number(product.id));
                }}
                aria-label="Add to wishlist"
            >
                <Heart className="h-3.5 w-3.5 stroke-[2]" />
            </button>

            {/* Compare Button - Below Wishlist */}
            <button
                className={cn(
                    "absolute top-9 right-2 z-20 p-1.5 rounded-full bg-white/90 backdrop-blur-sm shadow-sm hover:scale-110 transition-all duration-200",
                    isCompared ? "text-[var(--colour-fsP2)]" : "text-[var(--colour-text3)] hover:text-[var(--colour-fsP2)]"
                )}
                onClick={(e) => {
                    e.stopPropagation();
                    if (isCompared) {
                        removeFromCompare(Number(product.id));
                    } else {
                        addToCompare(product as unknown as ProductDetails);
                    }
                }}
                aria-label="Compare"
            >
                <Scale className={cn("h-3.5 w-3.5 stroke-[2]", isCompared && "fill-current")} />
            </button>

            {/* Image */}
            <div className="relative aspect-square w-full bg-[var(--colour-bg4)] border-b border-[var(--colour-border3)]">
                {hasDiscount && discountPercent > 0 && (
                    <span className="absolute top-0 left-0 z-10 bg-[var(--colour-fsP1)] text-white text-[9px] font-bold px-2 py-0.5 rounded-br-lg">
                        -{discountPercent}%
                    </span>
                )}
                <Image
                    src={imageUrl || '/placeholder-product.png'}
                    alt={product.name || 'Product'}
                    fill
                    className="object-contain p-3 mix-blend-multiply group-hover:scale-105 transition-transform duration-300"
                    priority={priority}
                    sizes="(max-width: 640px) 50vw, 25vw"
                />
            </div>

            {/* Info */}
            <div className="p-2.5 flex flex-col gap-1.5 flex-grow">
                {/* Rating Stars */}
                <div className="flex items-center gap-1">
                    <div className="flex items-center">
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
                    </div>
                    <span className="text-[10px] text-[var(--colour-text3)] font-medium">
                        ({ratingCount})
                    </span>
                </div>

                {/* Title */}
                <h3
                    className="text-[12px] font-semibold text-[var(--colour-text2)] leading-snug line-clamp-2 group-hover:text-[var(--colour-fsP2)] transition-colors"
                    title={product.name}
                >
                    {product.name}
                </h3>

                {/* Highlights */}
                {parseHighlights(product.highlights, 3).length > 0 && (
                    <div className="flex flex-wrap gap-1">
                        {parseHighlights(product.highlights, 3).map((h, i) => (
                            <span key={i} className="text-[9px] text-[var(--colour-text3)] bg-[var(--colour-bg4)] px-1.5 py-0.5 rounded border border-[var(--colour-border3)]">
                                {h}
                            </span>
                        ))}
                    </div>
                )}

                {/* Price */}
                {!hidePrice && (
                    <div className="mt-auto pt-1 border-t border-[var(--colour-border3)]/50">
                        <div className="flex items-baseline gap-1.5">
                            <span className="text-[14px] font-bold text-[var(--colour-text2)]">
                                Rs. {(discountedPrice || originalPrice)?.toLocaleString()}
                            </span>
                            {hasDiscount && (
                                <span className="text-[10px] text-[var(--colour-text3)] line-through">
                                    Rs. {originalPrice?.toLocaleString()}
                                </span>
                            )}
                        </div>
                        {hasDiscount && (
                            <span className="inline-block mt-0.5 text-[9px] font-bold text-green-600 bg-green-50 px-1.5 py-0.5 rounded">
                                Save Rs. {(originalPrice - discountedPrice)?.toLocaleString()}
                            </span>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export const BlogProductCardSkeleton = () => (
    <div className="bg-white rounded-lg overflow-hidden border border-[var(--colour-border3)] h-full">
        <div className="aspect-square bg-[var(--colour-bg4)] animate-pulse" />
        <div className="p-2.5 space-y-2">
            <div className="flex gap-0.5">{[...Array(5)].map((_, i) => <div key={i} className="w-3 h-3 bg-gray-200 rounded-full animate-pulse" />)}</div>
            <div className="h-3 w-full bg-gray-200 rounded animate-pulse" />
            <div className="h-3 w-3/4 bg-gray-200 rounded animate-pulse" />
            <div className="flex gap-1">{[...Array(4)].map((_, i) => <div key={i} className="w-3 h-3 bg-gray-200 rounded-full animate-pulse" />)}</div>
            <div className="h-4 w-24 bg-gray-200 rounded animate-pulse mt-1" />
        </div>
    </div>
);

export default BlogProductCard;