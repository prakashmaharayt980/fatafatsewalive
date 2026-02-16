import { cn } from "@/lib/utils";
import { Heart, Star, CreditCard, Truck, Zap, Gift } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useContextCart } from "@/app/checkout/CartContext1";

interface ProductCardProps {
    product: any;
    index?: number;
    priority?: boolean;
    hidePrice?: boolean;
}

const ProductCard = ({ product, index, priority = false, hidePrice = false }: ProductCardProps) => {
    const { addToWishlist } = useContextCart();

    if (!product || !product.id) {
        return null;
    }

    const originalPrice = typeof product.price === 'string' ? parseInt(product.price) : product.price;
    const discountedPrice = typeof product.discounted_price === 'string' ? parseInt(product.discounted_price) : product.discounted_price;
    const pricedisplay = originalPrice > discountedPrice ? discountedPrice : originalPrice;

    const discountPercent = originalPrice > discountedPrice
        ? Math.round(((originalPrice - discountedPrice) / originalPrice) * 100)
        : 0;

    // Calculate EMI (assuming 12 months for now)
    const emiPrice = Math.round(discountedPrice / 12);

    const productUrl = product?.slug ? `/products/${product.slug}` : '#';

    const imageUrl = product.image?.preview;

    // Mock Data for "Noon" style feel
    const rating = product.average_rating || 4.5;
    const ratingCount = product.rating_count || 120;
    const arrivalDate = "Tomorrow, Feb 4"; // Mock arrival
    const isBestSeller = true;
    const hasCoupon = true;
    const limitedTimeDeal = true;

    // Calculate if product is new (less than 1 month old)
    const isNew = product.created_at
        ? (new Date().getTime() - new Date(product.created_at).getTime()) < (30 * 24 * 60 * 60 * 1000)
        : false;

    return (
        <div
            className="group relative w-full flex flex-col bg-white h-full shadow-sm hover:shadow-[0_0_20px_rgba(0,0,0,0.1)] hover:border-[var(--colour-fsP2)]/30 hover:-translate-y-1 transition-all duration-300 rounded-[12px] overflow-hidden border border-gray-100"
        >
            {/* Wishlist Button - Absolute Top Right */}
            <button
                className="absolute top-2 right-2 z-20 p-1.5 rounded-full bg-white/90 backdrop-blur-sm shadow-sm text-gray-400 hover:text-red-500 hover:scale-110 transition-all duration-200"
                onClick={(e) => {
                    e.stopPropagation();
                    addToWishlist(product.id);
                }}
                aria-label="Add to wishlist"
            >
                <Heart className="h-4 w-4 stroke-[2.5]" />
            </button>

            {/* Image Container - Aspect 5:4 */}
            <div className="relative aspect-auto w-full bg-white p-2">
                {/* Badges - Top Left */}
                <div className="absolute top-0 left-0 z-10 flex flex-col gap-1">
                    {/* Refined Best Seller Tag - Gold (Only if NOT New) */}
                    {isBestSeller && !isNew && (
                        <div className="bg-[#e9c10e] text-white text-[10px] font-bold px-3 py-1 rounded-tl-[10px] rounded-br-[10px] shadow-sm flex items-center gap-1 z-10">
                            {/* <Zap className="w-3 h-3 fill-current" /> */}
                            <span>BESTSELLER</span>
                        </div>
                    )}
                    {/* New Tag - Green */}
                    {isNew && (
                        <div className="bg-[var(--colour-fsP2)] text-white text-[10px] font-bold px-3 py-1 rounded-tl-[10px] rounded-br-[10px] shadow-sm flex items-center gap-1 z-10">
                            {/* <Gift className="w-3 h-3 " /> */}
                            <span>NEW</span>
                        </div>
                    )}
                </div>

                <div className="relative w-full h-full ">
                    <Image
                        src={imageUrl || '/placeholder-product.png'}
                        alt={product.name || 'Product'}
                        width={500}
                        height={500}
                        className="object-contain  mix-blend-multiply transition-transform duration-500 group-hover:scale-105"
                        priority={priority}
                        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"

                    />
                </div>
            </div>

            {/* Content Container - Compact padding */}
            <div className="p-2 flex flex-col gap-0.5 flex-grow">
                {/* Brand Name */}
                <div className="flex justify-between items-start">
                    <div className="text-[11px] text-gray-700 font-bold uppercase tracking-wide">
                        {product.brand?.name || "Brand Name"}
                    </div>
                    {/* Ratings Row - Compact */}
                    <div className="flex items-center gap-1">
                        <div className="flex items-center gap-0.5 bg-[var(--colour-fsP2)] text-white px-1.5 py-0.5 rounded-[4px] shadow-sm">
                            <span className="text-[10px] font-extrabold">{rating}</span>
                            <Star className="w-2 h-2 fill-current" />
                        </div>
                        <span className="text-[10px] text-gray-600 font-medium">({ratingCount}) • 1.2k+ sold</span>
                    </div>
                </div>

                {/* Title */}
                <h3
                    className="text-[13px] sm:text-[14px] font-bold text-gray-800 leading-snug line-clamp-2 min-h-[2.6em] group-hover:text-[var(--colour-fsP2)] transition-colors mt-0.5"
                    title={product.name}
                >
                    <Link href={productUrl} className="focus:outline-none">
                        <span aria-hidden="true" className="absolute inset-0 z-10" />
                        {product.name}
                    </Link>
                </h3>

                {/* Price Section */}
                {!hidePrice && (
                    <div className="mt-1 space-y-0.5">
                        <div className="flex items-baseline gap-2">
                            <span className="text-base sm:text-lg font-extrabold text-[#1f2937]">
                                Rs. {(pricedisplay)?.toLocaleString()}
                            </span>
                        </div>

                        {(
                            <div className="flex items-center gap-2 text-[14px]">
                                <span className="text-gray-500 line-through decoration-gray-500 font-medium">
                                    Rs. {originalPrice?.toLocaleString()}
                                </span>
                                <span className="text-[var(--colour-fsP2)] font-bold bg-blue-50 px-1 py-0.5 rounded-sm">
                                    {discountPercent}% OFF
                                </span>
                            </div>
                        )}
                    </div>
                )}

                {/* Coupon Badge - Green & Cutout style */}
                {hasCoupon && (
                    <div className="mt-1.5 flex items-center gap-3">
                        <div className="relative bg-green-50 border border-green-200 text-green-700 text-[10px] font-bold px-2 py-0.5 rounded-sm border-dashed flex items-center gap-1 w-fit">
                            <span className="w-1.5 h-1.5 rounded-full bg-white border border-green-200 absolute -left-1 top-1/2 -translate-y-1/2"></span>
                            Save Rs. 200 with Coupon
                            <span className="w-1.5 h-1.5 rounded-full bg-white border border-green-200 absolute -right-1 top-1/2 -translate-y-1/2"></span>
                        </div>
                        <div className="relative bg-green-50 border border-green-200 text-green-700 text-[10px] font-bold px-2 py-0.5 rounded-sm border-dashed flex items-center gap-1 w-fit">
                            <span className="w-1.5 h-1.5 rounded-full bg-white border border-green-200 absolute -left-1 top-1/2 -translate-y-1/2"></span>
                            Save Rs. 400 with Coupon
                            <span className="w-1.5 h-1.5 rounded-full bg-white border border-green-200 absolute -right-1 top-1/2 -translate-y-1/2"></span>
                        </div>
                    </div>
                )}

                {/* EMI & Delivery - Modified EMI Size */}
                <div className="flex flex-wrap gap-1 mt-1.5">
                    {/* EMI Calculation Badge - Increased Font Size */}
                    <span className="inline-flex items-center text-[12px] font-semibold text-white bg-[#1967b3] px-1.5 py-0.5 rounded-sm shadow-sm">
                        {/* <CreditCard className="w-3 h-3 mr-1" /> */}
                        EMI fr. Rs. {emiPrice?.toLocaleString()}
                    </span>
                    <span className="inline-flex items-center text-[12px] font-semibold text-black bg-[#e9d26c] px-1.5 py-0.5 rounded-sm shadow-sm">
                        {/* <Truck className="w-3 h-3 mr-1" /> */}
                        Fatafat Delivery
                    </span>
                </div>


            </div>
        </div>
    );
};

export const ProductCardSkeleton = () => (
    <div className="bg-white rounded-[12px] overflow-hidden border border-gray-100 h-full card-shadow">
        <div className="aspect-square bg-gray-50 animate-pulse" />
        <div className="p-3 space-y-3">
            <div className="h-3 w-20 bg-gray-200 rounded animate-pulse" />
            <div className="h-5 w-full bg-gray-200 rounded animate-pulse" />
            <div className="h-5 w-3/4 bg-gray-200 rounded animate-pulse" />
            <div className="flex gap-2 pt-2">
                <div className="h-6 w-24 bg-gray-200 rounded animate-pulse" />
            </div>
            <div className="h-4 w-1/2 bg-gray-200 rounded animate-pulse mt-3" />
        </div>
    </div>
);

export default ProductCard;