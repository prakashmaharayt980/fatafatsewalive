import { cn } from "@/lib/utils";
import { CheckCheck, Heart, Truck, ShoppingBasket, Scale } from "lucide-react";
import Image from "next/image";
import { useRouter } from 'next/navigation';
import { ProductDetails } from "@/app/types/ProductDetailsTypes";
import { useContextCart } from "@/app/checkout/CartContext1";
import { Button } from "@/components/ui/button";

interface ProductCardProps {
    product: any; // Using any to handle partial product data from different endpoints
    index?: number;
    priority?: boolean;
    hidePrice?: boolean;
}

const ProductCard = ({ product, index: _index, priority = false, hidePrice = false }: ProductCardProps) => {

    const router = useRouter();
    const { addToCart, compareItems, addToCompare } = useContextCart();

    // Early return if product or ID is missing
    if (!product || !product.id) {
        return null;
    }

    const originalPrice = typeof product.price === 'string' ? parseInt(product.price) : product.price;
    const discountedPrice = typeof product.discounted_price === 'string' ? parseInt(product.discounted_price) : product.discounted_price;

    const discountPercent = originalPrice > discountedPrice
        ? Math.round(((originalPrice - discountedPrice) / originalPrice) * 100)
        : 0;

    const handleProductClick = () => {
        if (!product.slug || !product.id) {
            console.warn('Missing slug or id');
            return;
        }
        router.push(`/product/${product.slug}?id=${product.id}`);
    };

    const handleAddToCart = (e: React.MouseEvent) => {
        e.stopPropagation();
        addToCart(product.id, 1);
    };

    const handleCompare = (e: React.MouseEvent) => {
        e.stopPropagation();
        addToCompare?.(product);
        const currentIds = compareItems?.map((i: any) => i.id) || [];
        const newIds = Array.from(new Set([...currentIds, product.id])).join(',');
        router.push(`/compare?ids=${newIds}`);
    };

    const imageUrl = product.image?.thumb || product.image?.preview || product.image?.full;

    return (
        <div
            onClick={handleProductClick}
            className="group relative cursor-pointer rounded-2xl bg-white border border-gray-100 hover:border-gray-200 transition-all duration-300 overflow-hidden hover:shadow-xl hover:shadow-gray-200/50 mb-2 sm:mb-4"
        >
            {/* Wishlist Heart - Premium Glass Effect */}
            <button
                className="absolute right-3 top-3 z-20 rounded-full p-2.5
                          transition-all duration-300 hover:scale-110 bg-white/80 backdrop-blur-md
                          shadow-sm hover:shadow-md text-gray-400 hover:text-red-500 
                          sm:opacity-0 sm:group-hover:opacity-100 sm:translate-x-4 sm:group-hover:translate-x-0"
                onClick={(e) => {
                    e.stopPropagation();
                    // Add wishlist logic here
                }}
            >
                <Heart className="h-4 w-4" />
            </button>

            {/* Product Image Container */}
            <div className="relative p-3">
                {/* Badges - Solid Colors */}
                <div className="absolute left-3 top-3 flex flex-col gap-2 z-10 w-full pr-10 items-start pointer-events-none">
                    {/* New Badge */}
                    <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-[10px] sm:text-xs font-bold bg-blue-600 text-white shadow-sm ring-1 ring-white/30">
                        NEW
                    </span>

                    {/* Discount Badge */}
                    {discountPercent > 0 && (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-[10px] sm:text-xs font-bold bg-red-600 text-white shadow-sm ring-1 ring-white/30">
                            -{discountPercent}%
                        </span>
                    )}

                    {/* Featured/Hot Badge */}
                    {product.is_featured === 1 && (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-[10px] sm:text-xs font-bold bg-amber-500 text-white shadow-sm ring-1 ring-white/30">
                            HOT
                        </span>
                    )}
                </div>

                <div className="relative aspect-square w-full rounded-xl overflow-hidden bg-gray-50">
                    {imageUrl ? (
                        <Image
                            src={imageUrl}
                            alt={product.name}
                            className="object-cover w-full h-full transition-transform duration-500 ease-out group-hover:scale-110"
                            fill
                            quality={90}
                            priority={priority}
                            sizes="(max-width: 640px) 150px, (max-width: 768px) 200px, 200px"
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-300">
                            <ShoppingBasket className="w-8 h-8 opacity-50" />
                        </div>
                    )}

                    {/* Desktop Overlay Buttons - Only show on hover for desktop */}
                    <div className="hidden sm:flex absolute inset-x-0 bottom-4 justify-between gap-2 opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 z-20 px-4">
                        <Button
                            size="sm"
                            className="flex-1 h-10 shadow-lg bg-white/90 backdrop-blur-md text-gray-900 hover:bg-[var(--colour-fsP1)] hover:text-white border border-gray-100/50 font-semibold rounded-xl transition-all duration-300 transform hover:-translate-y-1"
                            onClick={handleAddToCart}
                        >
                            <ShoppingBasket className="w-4 h-4 mr-2" />
                            Add to Cart
                        </Button>
                        <Button
                            size="icon"
                            className="h-10 w-10 shadow-lg bg-white/90 backdrop-blur-md text-gray-900 hover:bg-[var(--colour-fsP1)] hover:text-white border border-gray-100/50 rounded-xl transition-all duration-300 transform hover:-translate-y-1 cursor-pointer"
                            onClick={handleCompare}
                            title="Compare"
                        >
                            <Scale className="w-4 h-4" />
                        </Button>
                    </div>
                </div>
            </div>

            <div className="px-4 pb-4 pt-1 flex flex-col gap-1.5">
                <h3 className={cn(
                    "line-clamp-2 text-sm font-bold text-gray-800",
                    "group-hover:text-[var(--colour-fsP1)] transition-colors duration-300",
                    "leading-snug min-h-[2.5em]"
                )}>
                    {product.name}
                </h3>

                {/* Price Section */}
                {!hidePrice && (
                    <div className="flex items-baseline gap-2 mt-0.5">
                        {discountedPrice ? (
                            <>
                                <span className="text-base sm:text-lg font-extrabold text-gray-900">
                                    Rs {discountedPrice.toLocaleString()}
                                </span>
                                {originalPrice > discountedPrice && (
                                    <span className="text-xs text-gray-400 line-through font-medium">
                                        Rs {originalPrice.toLocaleString()}
                                    </span>
                                )}
                            </>
                        ) : (
                            <span className="text-base sm:text-lg font-extrabold text-gray-900">
                                Rs {originalPrice.toLocaleString()}
                            </span>
                        )}
                    </div>
                )}

                {/* Mobile Action Buttons - Always visible on mobile */}
                <div className="flex sm:hidden gap-2 mt-2">
                    <button
                        onClick={handleAddToCart}
                        className="flex-1 flex items-center justify-center gap-1 h-8 border border-gray-300 text-gray-700 text-xs font-medium rounded-lg hover:bg-gray-50 active:bg-gray-100 transition-colors"
                    >
                        <ShoppingBasket className="w-3.5 h-3.5" />
                        Add to Cart
                    </button>
                    <button
                        onClick={handleCompare}
                        className="flex items-center justify-center w-8 h-8 border border-gray-300 text-gray-500 rounded-lg hover:bg-gray-50 active:bg-gray-100 transition-colors"
                        title="Compare"
                    >
                        <Scale className="w-3.5 h-3.5" />
                    </button>
                </div>

                {/* Footer Badges - Enhanced Design */}
                <div className="flex flex-wrap items-center gap-2 sm:gap-3 mt-3 pt-3 border-t border-gray-100">
                    {product.emi_enabled !== 0 && (
                        <div className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm font-bold text-blue-700 bg-gradient-to-r from-blue-50 to-blue-100 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full border border-blue-200 shadow-sm hover:shadow-md transition-shadow duration-300">
                            <CheckCheck className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                            <span>EMI Available</span>
                        </div>
                    )}
                    <div className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm font-bold text-green-700 bg-gradient-to-r from-green-50 to-green-100 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full border border-green-200 shadow-sm hover:shadow-md transition-shadow duration-300">
                        <Truck className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                        <span>Free Delivery</span>
                    </div>
                </div>
            </div>
        </div>
    );
};


export const ProductCardSkeleton = () => (
    <div className="bg-white rounded-2xl overflow-hidden border border-gray-100">
        <div className="aspect-square bg-gradient-to-br from-gray-100 to-gray-200 animate-pulse" />
        <div className="p-4 space-y-3">
            <div className="h-3 w-20 bg-gray-200 rounded-full animate-pulse" />
            <div className="h-4 bg-gray-200 rounded-full animate-pulse" />
            <div className="h-5 w-24 bg-gray-200 rounded-full animate-pulse" />
        </div>
    </div>
);

export default ProductCard;