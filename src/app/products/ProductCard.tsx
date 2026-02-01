import { cn } from "@/lib/utils";
import { Check, Heart, Truck, CreditCard } from "lucide-react";
import Image from "next/image";
import { useRouter } from 'next/navigation';
import { useContextCart } from "@/app/checkout/CartContext1";


interface ProductCardProps {
    product: any;
    index?: number;
    priority?: boolean;
    hidePrice?: boolean;
}

const ProductCard = ({ product, index: _index, priority = false, hidePrice = false }: ProductCardProps) => {
    const router = useRouter();
    const { addToCart, compareItems, addToCompare, addToWishlist } = useContextCart();

    if (!product || !product.id) {
        return null;
    }

    const originalPrice = typeof product.price === 'string' ? parseInt(product.price) : product.price;
    const discountedPrice = typeof product.discounted_price === 'string' ? parseInt(product.discounted_price) : product.discounted_price;

    const isNew = (() => {
        if (!product?.created_at) return false;
        const createdDate = new Date(product.created_at);
        if (Number.isNaN(createdDate.getTime())) return false;
        const now = Date.now();
        const thirtyDaysMs = 30 * 24 * 60 * 60 * 1000;
        return (now - createdDate.getTime()) <= thirtyDaysMs;
    })();

    const discountPercent = originalPrice > discountedPrice
        ? Math.round(((originalPrice - discountedPrice) / originalPrice) * 100)
        : 0;

    const handleProductClick = () => {
        if (!product.slug || !product.id) {
            console.warn('Missing slug or id');
            return;
        }
        router.push(`/products/${product.slug}`);
    };

    const handleAddToCart = (e: React.MouseEvent) => {
        e.stopPropagation();
        addToCart(product.id, 1);
    };

    const imageUrl = product.image?.preview

    return (
        <div
            onClick={handleProductClick}
            className="group relative cursor-pointer w-full flex flex-col bg-white hover:shadow-xl transition-all duration-300 rounded-xl overflow-hidden border border-gray-200 hover:border-blue-200"
        >
            {/* Image Container */}
            <div className="relative aspect-square w-full p-3 sm:p-5 bg-white group-hover:bg-gray-50/50 transition-colors">
                {/* Badges */}
                <div className="absolute top-2 sm:top-3 left-2 sm:left-3 z-10 flex flex-col gap-1">
                    {isNew && (
                        <span className="bg-emerald-600 text-white text-[8px] sm:text-[10px] font-bold px-1.5 sm:px-2 py-0.5 rounded tracking-wider uppercase shadow-sm">
                            New
                        </span>
                    )}
                    {discountPercent > 0 && (
                        <span className="bg-red-600 text-white text-[8px] sm:text-[10px] font-bold px-1.5 sm:px-2 py-0.5 rounded tracking-wider shadow-sm">
                            -{discountPercent}%
                        </span>
                    )}
                </div>

                {/* Wishlist Button */}
                <button
                    className="absolute top-2 sm:top-3 right-2 sm:right-3 z-20 w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center rounded-full bg-white shadow-sm text-gray-400 hover:text-red-500 hover:shadow-md transition-all duration-200"
                    onClick={(e) => {
                        e.stopPropagation();
                        addToWishlist(product.id);
                    }}
                >
                    <Heart className="h-3.5 w-3.5 sm:h-4 sm:w-4 hover:fill-current" />
                </button>

                {/* Product Image */}
                <div className="relative w-full h-full transition-transform duration-500 group-hover:scale-105">
                    <Image
                        src={imageUrl || '/placeholder-product.png'}
                        alt={product.name || 'Product'}
                        fill
                        className="object-contain mix-blend-normal"
                        priority={priority}
                        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                    />
                </div>
            </div>

            {/* Content Container */}
            <div className="p-2 sm:p-3 flex flex-col gap-1 sm:gap-1.5 flex-grow border-t border-gray-100">
                {/* Title */}
                <h3
                    className="text-xs sm:text-sm md:text-[15px] font-semibold text-slate-900 leading-snug line-clamp-2 group-hover:text-blue-700 transition-colors"
                    title={product.name}
                >
                    {product.name}
                </h3>

                {/* Stock Status */}
                <div className="flex items-center">
                    <span className="inline-flex items-center text-emerald-700 text-[10px] sm:text-xs font-medium bg-emerald-50 px-1.5 sm:px-2 py-0.5 rounded-full">
                        <Check className="w-2.5 h-2.5 sm:w-3 sm:h-3 mr-0.5 sm:mr-1 stroke-[2.5]" />
                        In Stock
                    </span>
                </div>

                {/* Price Section */}
                {!hidePrice && (
                    <div className="mt-auto pt-1 sm:pt-2">
                        <div className="flex items-baseline gap-1 sm:gap-2 flex-wrap">
                            <span className="text-sm sm:text-lg md:text-xl font-bold text-slate-900">
                                Rs. {(discountedPrice || originalPrice)?.toLocaleString()}
                            </span>
                            {discountPercent > 0 && (
                                <span className="text-[10px] sm:text-xs text-slate-400 line-through">
                                    Rs. {originalPrice?.toLocaleString()}
                                </span>
                            )}
                        </div>

                        {/* EMI & Delivery Tags - Fit Content Column on Mobile */}
                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-1 sm:gap-2 mt-1.5 sm:mt-2">
                            <span className="inline-flex items-center w-fit text-[9px] sm:text-[11px] font-bold text-white bg-[#1967b3] px-2 py-0.5 sm:py-1 rounded-full shadow-sm">
                                <CreditCard className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5 mr-1 flex-shrink-0" />
                                EMI
                            </span>
                            <span className="inline-flex items-center w-fit text-[9px] sm:text-[11px] font-bold text-white bg-[#1967b3] px-2 py-0.5 sm:py-1 rounded-full shadow-sm">
                                <Truck className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5 mr-1 flex-shrink-0" />
                                Free Delivery
                            </span>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export const ProductCardSkeleton = () => (
    <div className="bg-white rounded-xl overflow-hidden border border-gray-100">
        <div className="aspect-square bg-gradient-to-br from-gray-100 to-gray-200 animate-pulse" />
        <div className="p-2 sm:p-3 space-y-2">
            <div className="h-3 sm:h-4 w-full bg-gray-200 rounded animate-pulse" />
            <div className="h-3 sm:h-4 w-3/4 bg-gray-200 rounded animate-pulse" />
            <div className="h-2.5 sm:h-3 w-14 sm:w-16 bg-gray-200 rounded-full animate-pulse" />
            <div className="h-4 sm:h-5 w-20 sm:w-24 bg-gray-200 rounded animate-pulse" />
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-1 sm:gap-2 pt-1">
                <div className="h-5 w-12 bg-gray-200 rounded-full animate-pulse" />
                <div className="h-5 w-20 bg-gray-200 rounded-full animate-pulse" />
            </div>
        </div>
    </div>
);

export default ProductCard;