"use client";

import React, { useMemo } from "react";
import { ShoppingBag, CreditCard, Scale, Star, Check, Share2, Gift } from "lucide-react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { useContextCart } from "@/app/checkout/CartContext1";
import { PaymentMethodsOptions } from "@/app/CommonVue/Payment";
import { useRouter } from "next/navigation";
import { ProductDetails, ProductDisplayState } from "@/app/types/ProductDetailsTypes";
import { Button } from "@/components/ui/button";
import IconRenderer from "@/app/CommonVue/CustomIconImg";
import ProductCoupons from "./ProductCoupons";
import BankOffers from "./BankOffers";
import ShareDialog from "./ShareDialog";
import ReviewDialog from "./ReviewDialog";
import { Heart } from "lucide-react";
import useSWR from 'swr';
import { CategoryService } from "@/app/api/services/category.service";
import { CategorySlug_ID } from '@/app/types/CategoryTypes';

const fetchCategoryProducts = async (id: string) => {
    const response = await CategoryService.getCategoryProducts({ id });
    return response;
};

interface ProductBuyBoxProps {
    product: ProductDetails;
    selectedVariant: any | null;
    setSelectedVariant: (variant: any) => void;
    productDisplay: ProductDisplayState;
    quantity: number;
    setQuantity: (qty: number) => void;
    colorImages?: Array<{ url: string; thumb: string }>;
}

const ProductBuyBox: React.FC<ProductBuyBoxProps> = ({
    product,
    selectedVariant,
    setSelectedVariant,
    productDisplay,
    quantity,
    setQuantity,
    colorImages = [],
}) => {
    const { addToCart, compareItems } = useContextCart();
    const router = useRouter();

    const currentPrice = selectedVariant?.discounted_price || product.discounted_price || product.price;
    const originalPrice = selectedVariant?.original_price || product.original_price;
    const currentStock = selectedVariant ? selectedVariant.quantity : product.quantity;
    const discountPercentage = originalPrice ? Math.round(((originalPrice - currentPrice) / originalPrice) * 100) : 0;



    const [isShareOpen, setIsShareOpen] = React.useState(false);
    const [isReviewOpen, setIsReviewOpen] = React.useState(false);
    const { wishlistItems, addToWishlist, removeFromWishlist } = useContextCart();
    const isInWishlist = wishlistItems.some((item) => item.id === product.id);

    const toggleWishlist = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (isInWishlist) {
            removeFromWishlist(product.id);
        } else {
            addToWishlist(product.id);
            // Custom event for 'wishPot'
            if (typeof window !== 'undefined') {
                const event = new CustomEvent('wishPot', { detail: { product } });
                window.dispatchEvent(event);
            }
        }
    };

    const currentUrl = typeof window !== 'undefined' ? window.location.href : '';
    const highlightBullets = useMemo(() => {
        if (!product.highlights) return [];
        return product.highlights
            .split("|")
            .map((item) => item.trim())
            .filter((item) => item.length > 0);
    }, [product.highlights]);

    // Fetch related products for Free Gifts section based on the first category ID
    const categoryId = product.categories?.[0]?.id?.toString();
    const { data: categoryProducts } = useSWR<CategorySlug_ID>(
        categoryId ? categoryId : null,
        fetchCategoryProducts,
        {
            dedupingInterval: 60000,
            revalidateOnFocus: false,
        }
    );

    // Get the first 2 "gift" products from the category (excluding current product is typical, but for simplicity taking first 2)
    // In a real scenario you might have a dedicated "gifts" endpoint or flag
    const freeGifts = categoryProducts?.data?.slice(0, 2).map(p => ({
        name: p.name,
        price: p.price,
        image: p.image,
        reason: "BUNDLE" // Dynamic reason could be added if available
    })) || [];

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-6 space-y-3">

            {/* 1. HEADER: Brand, Title, Share */}
            <div className="space-y-1">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        {product.brand && (
                            <span className="text-xs font-bold text-[var(--colour-fsP2)] uppercase tracking-wide bg-orange-50 rounded-full px-2 py-0.5">
                                {product.brand.name}
                            </span>
                        )}
                        {product.average_rating > 0 && (
                            <button
                                onClick={() => setIsReviewOpen(true)}
                                className="flex items-center gap-1 text-xs font-medium text-amber-500 hover:text-amber-600 transition-colors cursor-pointer"
                            >
                                <Star className="w-3.5 h-3.5 fill-current" />
                                <span>{product.average_rating}</span>
                                <span className="text-gray-400">/ 5</span>
                                <span className="text-[10px] text-blue-500 ml-1 underline decoration-blue-200">View Reviews</span>
                            </button>
                        )}
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            onClick={toggleWishlist}
                            className={cn(
                                "w-8 h-8 flex items-center justify-center rounded-full transition-all shadow-sm",
                                isInWishlist ? "bg-red-50 text-red-500" : "bg-gray-50 text-gray-400 hover:bg-red-50 hover:text-red-500"
                            )}
                        >
                            <Heart className={cn("w-4 h-4", isInWishlist && "fill-current")} />
                        </button>
                        <button
                            onClick={() => setIsShareOpen(true)}
                            className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-50 text-gray-400 hover:bg-[var(--colour-fsP1)] hover:text-white transition-all shadow-sm"
                        >
                            <Share2 className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                <h1 className="text-xl sm:text-2xl font-bold text-slate-900 leading-snug">
                    {product.name}
                </h1>
                {product.sku && (
                    <p className="text-xs text-slate-500">SKU: {product.sku}</p>
                )}
            </div>

            {/* 2. PRICE (Moved here as it's typically always high up) */}
            <div>
                <div className="flex items-end gap-3 flex-wrap">
                    <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight leading-none">
                        Rs. {currentPrice.toLocaleString()}
                    </h2>
                    {(
                        <>
                            <span className="text-sm text-slate-400 line-through">Rs. {currentPrice.toLocaleString()}</span>
                            <span className="text-xs font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded-full border border-red-100">-{discountPercentage}% OFF</span>
                        </>
                    )}
                </div>
            </div>




            {/* 4. VARIANTS (Color) with color-matched images */}
            {
                productDisplay.variantsByColor.length > 0 && (
                    <div className="space-y-2 pt-1">
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-bold text-[var(--colour-fsP2)] uppercase">
                                Color: <span className="text-slate-500 font-normal">{selectedVariant?.color}</span>
                            </span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {productDisplay.variantsByColor.map((variant, idx) => {
                                const isSelected = selectedVariant?.color === variant.color;
                                const variantImage = variant.images?.[0]?.url || product.image?.full;

                                return (
                                    <div
                                        key={idx}
                                        onClick={() => setSelectedVariant(variant)}
                                        className={cn(
                                            "group relative cursor-pointer rounded-lg transition-all duration-200 p-0.5 border-2",
                                            isSelected
                                                ? "border-[var(--colour-fsP1)] shadow-md shadow-orange-100"
                                                : "border-gray-200 hover:border-gray-300"
                                        )}
                                    >
                                        <div className="w-14 h-14 rounded-md overflow-hidden bg-gray-50 relative">
                                            {variantImage && (
                                                <Image
                                                    src={variantImage}
                                                    alt={variant.color}
                                                    fill
                                                    className="object-cover"
                                                    sizes="56px"
                                                />
                                            )}
                                        </div>
                                        {isSelected && (
                                            <div className="absolute -top-1 -right-1 w-4 h-4 bg-[var(--colour-fsP1)] rounded-full flex items-center justify-center">
                                                <Check className="w-2.5 h-2.5 text-white" />
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>


                    </div>
                )
            }

            {/* 6. ACTIONS (Quantity & Cart) */}
            <div className="pt-2 space-y-3">
                {/* Quantity Selector */}
                <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-slate-600">Qty:</span>
                    <div className="flex items-center border border-gray-200 rounded-lg h-10 w-28 flex-shrink-0 bg-white overflow-hidden">
                        <button
                            onClick={() => setQuantity(Math.max(1, quantity - 1))}
                            className="flex-1 h-full flex items-center justify-center text-slate-400 hover:text-[var(--colour-fsP1)] hover:bg-orange-50 font-bold text-lg transition-colors"
                            disabled={quantity <= 1}
                        >
                            -
                        </button>
                        <span className="w-8 text-center text-sm font-bold text-slate-900">{quantity}</span>
                        <button
                            onClick={() => setQuantity(Math.min(currentStock, quantity + 1))}
                            className="flex-1 h-full flex items-center justify-center text-slate-400 hover:text-[var(--colour-fsP1)] hover:bg-orange-50 font-bold text-lg transition-colors"
                            disabled={quantity >= currentStock}
                        >
                            +
                        </button>
                    </div>
                    {currentStock > 0 && currentStock <= 5 && (
                        <span className="text-xs text-red-500 font-medium">Only {currentStock} left</span>
                    )}
                </div>

                {/* Add to Cart, Apply EMI, Compare — in one row */}
                <div className="grid grid-cols-2 gap-2 sm:flex sm:gap-3">
                    <Button
                        className="col-span-2 sm:flex-1 h-12 bg-[var(--colour-fsP2)] hover:bg-[var(--colour-fsP2)]/90 text-white font-bold rounded-xl text-sm shadow-md shadow-[var(--colour-fsP2)]/20 transition-all active:scale-[0.98] group"
                        onClick={() => addToCart(product.id, quantity)}
                        disabled={currentStock === 0}
                    >
                        <ShoppingBag className="w-5 h-5 mr-2 group-hover:animate-bounce" />
                        {currentStock === 0 ? 'Out of Stock' : 'Add to Cart'}
                    </Button>
                    {product.emi_enabled === 1 && (
                        <Button
                            className="h-12 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-sm shadow-md shadow-emerald-600/20 transition-all active:scale-[0.98]"
                            onClick={() => router.push(`/emi/applyemi?product=${product.id}`)}
                        >
                            <CreditCard className="w-5 h-5 mr-2" />
                            Apply EMI
                        </Button>
                    )}

                    <Button
                        variant="outline"
                        className="flex-1 h-11 border-[var(--colour-fsP2)]/30 hover:border-[var(--colour-fsP2)] hover:text-[var(--colour-fsP2)] hover:bg-[var(--colour-fsP2)]/5 text-[var(--colour-fsP2)] text-xs sm:text-sm font-semibold rounded-xl transition-all"
                        onClick={() => {
                            const ids = compareItems?.map((i: any) => i.id) || [];
                            const newIds = Array.from(new Set([...ids, product.id])).join(',');
                            router.push(`/compare?ids=${newIds}`);
                        }}
                    >
                        <Scale className="w-4 h-4 mr-1.5" /> Compare
                    </Button>
                </div>
            </div>

            {/* SECTIONS MOVED BELOW ACTION BUTTONS */}

            {/* COUPONS */}
            <div className="pt-2">
                <ProductCoupons />
            </div>

            {/* REFERRAL CODE GIFT */}
            <div className="pt-2">
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-indigo-100 rounded-xl p-3 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-indigo-600 shadow-sm shrink-0">
                        <Gift className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <h3 className="text-xs font-bold text-indigo-900 leading-tight">Have a Referral Code?</h3>
                        <p className="text-[10px] text-indigo-700/80 truncate">Enter code to unlock extra gifts</p>
                    </div>
                    <div className="flex bg-white rounded-lg border border-indigo-200 overflow-hidden h-8 w-28 shrink-0">
                        <input type="text" placeholder="CODE" className="w-full px-2 text-[10px] outline-none text-slate-700 font-bold placeholder:text-gray-300 uppercase" />
                    </div>
                </div>
            </div>

            {/* PARTNER GIFTS BANNER (Small Banner below) */}
            {freeGifts.length > 0 && (
                <div className="pt-2">
                    <div className="bg-slate-900 rounded-xl p-3 relative overflow-hidden group cursor-pointer">
                        <div className="absolute inset-0 bg-[url('/imgfile/pattern-geo.svg')] opacity-10"></div>
                        <div className="relative z-10 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                {/* Show first gift image as a teaser */}
                                <div className="w-10 h-10 bg-white/10 backdrop-blur-md rounded-lg flex items-center justify-center border border-white/20 overflow-hidden">
                                    {freeGifts[0].image ? (
                                        <Image src={freeGifts[0].image.thumb || freeGifts[0].image.full} alt="Partner Gift" width={32} height={32} className="object-cover" />
                                    ) : (
                                        <Gift className="w-5 h-5 text-white" />
                                    )}
                                </div>
                                <div>
                                    <h3 className="text-xs font-bold text-white leading-tight">Partner Exclusive Gift</h3>
                                    <p className="text-[10px] text-blue-200">Get {freeGifts[0].name.substring(0, 20)}... with this order</p>
                                </div>
                            </div>
                            <div className="bg-[var(--colour-fsP2)] text-white text-[10px] font-bold px-2 py-1 rounded-lg shadow-lg">
                                CLAIM
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* HIGHLIGHTS */}
            {
                highlightBullets.length > 0 && (
                    <div className="pt-2 border-t border-gray-100">
                        <ul className="space-y-2">
                            {highlightBullets.map((item, idx) => (
                                <li key={idx} className="flex items-start gap-2.5 text-sm text-slate-600 leading-relaxed">
                                    <div className="mt-1 w-4 h-4 rounded-full bg-emerald-50 flex items-center justify-center shrink-0">
                                        <Check className="w-2.5 h-2.5 text-emerald-600" />
                                    </div>
                                    <span>{item}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                )
            }

            {/* FREE GIFTS SECTION (Real Data) */}
            {
                freeGifts.length > 0 && (
                    <div className="relative overflow-hidden p-4 rounded-xl border border-[var(--colour-fsP2)]/20 shadow-sm mt-3 bg-gradient-to-br from-[var(--colour-fsP2)]/5 to-white">
                        <div className="absolute top-0 right-0 p-2 opacity-5 pointer-events-none">
                            <Gift className="w-24 h-24 text-[var(--colour-fsP2)]" />
                        </div>

                        <div className="relative z-10 flex items-center gap-2.5 mb-3">
                            <div className="w-8 h-8 rounded-full bg-[var(--colour-fsP2)]/10 flex items-center justify-center text-[var(--colour-fsP2)] shadow-inner">
                                <Gift className="w-4 h-4" />
                            </div>
                            <div>
                                <h3 className="text-sm font-bold text-[var(--colour-fsP2)] leading-tight">
                                    Free {product.categories?.[0]?.title || "Gifts"} Included
                                </h3>
                                <p className="text-[10px] text-[var(--colour-fsP2)]/70 font-medium">Exclusive limited time offer</p>
                            </div>
                        </div>

                        <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {freeGifts.map((gift, i) => (
                                <div key={i} className="flex gap-3 bg-white/80 backdrop-blur-sm p-2.5 rounded-xl border border-[var(--colour-fsP2)]/20 shadow-sm hover:shadow-md hover:border-[var(--colour-fsP2)]/40 transition-all group cursor-pointer" onClick={() => router.push(`/products/${product.slug}`)}>
                                    {/* Gift Image Placeholder */}
                                    <div className="w-12 h-12 bg-white rounded-lg flex-shrink-0 flex items-center justify-center border border-[var(--colour-fsP2)]/10 overflow-hidden group-hover:scale-105 transition-transform relative">
                                        {gift.image ? (
                                            <Image src={gift.image.thumb || gift.image.full} alt={gift.name} fill className="object-cover" />
                                        ) : (
                                            <Gift className="w-6 h-6 text-[var(--colour-fsP2)]" />
                                        )}
                                    </div>

                                    <div className="flex flex-col justify-center min-w-0 flex-1">
                                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-0.5">{gift.reason}</span>
                                        <h4 className="text-xs font-bold text-slate-800 leading-tight truncate group-hover:text-[var(--colour-fsP2)] transition-colors">{gift.name}</h4>
                                        <div className="mt-1 flex items-center gap-1.5">
                                            <span className="text-[10px] text-slate-400 line-through">Rs. {gift.price}</span>
                                            <span className="text-[10px] font-bold text-white bg-[var(--colour-fsP2)] px-1.5 py-0.5 rounded-md shadow-sm shadow-[var(--colour-fsP2)]/20">FREE</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )
            }



            <ShareDialog
                isOpen={isShareOpen}
                onClose={() => setIsShareOpen(false)}
                productUrl={currentUrl}
                productName={product.name}
                productImage={product.image?.full}
                productPrice={currentPrice}
            />
        </div >
    );
};

export default ProductBuyBox;
