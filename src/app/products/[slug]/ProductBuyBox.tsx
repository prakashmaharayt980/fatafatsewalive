"use client";

import React from "react";
import {
    ShoppingCart,
    CreditCard,
    Scale,
    Star,
    Check,
    Share2,
    Gift,
    Heart,
    CalendarClock,
    TrendingUp,
} from "lucide-react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { useContextCart } from "@/app/checkout/CartContext1";
import { useCompare } from "@/app/context/CompareContext";
import { useRouter } from "next/navigation";
import { ProductDetails, ProductDisplayState } from "@/app/types/ProductDetailsTypes";
import ProductCoupons from "./ProductCoupons";
import ShareDialog from "./ShareDialog";
import ReviewDialog from "./ReviewDialog";
import PreOrderDialog from "./PreOrderDialog";
import StockInvestmentDialog from "./StockInvestmentDialog";
import useSWR from 'swr';
import { CategoryService } from "@/app/api/services/category.service";
import { CategorySlug_ID } from '@/app/types/CategoryTypes';
import { parseHighlights } from "@/app/CommonVue/highlights";

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
    actionRef?: React.Ref<HTMLDivElement>;
}

const ProductBuyBox: React.FC<ProductBuyBoxProps> = ({
    product,
    selectedVariant,
    setSelectedVariant,
    productDisplay,
    quantity,
    setQuantity,
    colorImages = [],
    actionRef,
}) => {
    const { addToCart, wishlistItems, addToWishlist, removeFromWishlist } = useContextCart();
    const { addToCompare, removeFromCompare, compareList } = useCompare();
    const router = useRouter();

    const currentPrice = selectedVariant?.discounted_price || product.discounted_price || product.price;
    const originalPrice = selectedVariant?.original_price || product.original_price;
    const currentStock = selectedVariant ? selectedVariant.quantity : product.quantity;
    const discountPercentage = originalPrice ? Math.round(((originalPrice - currentPrice) / originalPrice) * 100) : 0;

    const isCompare = compareList?.some(p => p.id === product.id);

    const [isShareOpen, setIsShareOpen] = React.useState(false);
    const [isReviewOpen, setIsReviewOpen] = React.useState(false);
    const [isPreOrderOpen, setIsPreOrderOpen] = React.useState(false);
    const [isStockInvestOpen, setIsStockInvestOpen] = React.useState(false);
    const isInWishlist = wishlistItems.some((item) => item.id === product.id);

    const toggleWishlist = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (isInWishlist) {
            removeFromWishlist(product.id);
        } else {
            addToWishlist(product.id);

        }
    };

    const currentUrl = typeof window !== 'undefined' ? window.location.href : '';


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

    const handleroute = (paths: string) => {
        router.push(paths);
    }

    return (
        <div className="bg-white rounded shadow-sm border border-gray-100 p-4 sm:p-6 space-y-3">

            {/* 1. HEADER: Brand, Title, Share */}
            <div className="space-y-1">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        {product.brand && (
                            <span className="text-xs font-bold text-(--colour-fsP2) uppercase tracking-wide bg-orange-50 rounded-full px-2 py-0.5">
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
                            aria-label={isInWishlist ? "Remove from wishlist" : "Add to wishlist"}
                            className={cn(
                                "w-8 h-8 flex items-center justify-center rounded-full transition-all shadow-sm",
                                isInWishlist ? "bg-red-50 text-red-500" : "bg-gray-50 text-gray-400 hover:bg-red-50 hover:text-red-500"
                            )}
                        >
                            <Heart className={cn("w-4 h-4", isInWishlist && "fill-current")} />
                        </button>
                        <button
                            onClick={() => setIsShareOpen(true)}
                            aria-label="Share this product"
                            className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-50 text-gray-400 hover:bg-(--colour-fsP1) hover:text-white transition-all shadow-sm"
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
                    <p className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight leading-none">
                        Rs. {currentPrice.toLocaleString()}
                    </p>
                    {originalPrice && originalPrice > currentPrice && (
                        <>
                            <span className="text-sm text-slate-500 line-through">Rs. {originalPrice.toLocaleString()}</span>
                            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">-{discountPercentage}% OFF</span>
                        </>
                    )}
                </div>
            </div>




            {/* 4. VARIANTS (Color) with color-matched images */}
            {
                productDisplay.variantsByColor.length > 0 && (
                    <div className="space-y-2 pt-1">
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-bold text-(--colour-fsP2) uppercase">
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
                                                ? "border-(--colour-fsP1) shadow-md shadow-orange-100"
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
                                            <div className="absolute -top-1 -right-1 w-4 h-4 bg-(--colour-fsP1) rounded-full flex items-center justify-center">
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
            {/* ACTIONS - Quantity & Cart */}
            <div className="space-y-4">
                {/* Quantity Selector */}
                <div className="flex items-center gap-3">
                    <span className="text-sm font-medium text-gray-700">Quantity</span>
                    <div className="flex items-center gap-2 bg-gray-50 rounded-lg px-2 py-1.5 border border-gray-200">
                        <button
                            onClick={() => setQuantity(Math.max(1, quantity - 1))}
                            aria-label="Decrease quantity"
                            className="w-8 h-8 flex items-center justify-center bg-white rounded-md shadow-sm text-gray-600 hover:text-gray-800 hover:bg-gray-50 transition-all active:scale-95 disabled:opacity-40"
                            disabled={quantity <= 1}
                        >
                            −
                        </button>
                        <span className="min-w-10 text-center font-semibold text-gray-800" aria-live="polite" aria-label={`Quantity: ${quantity}`}>
                            {quantity}
                        </span>
                        <button
                            onClick={() => setQuantity(Math.min(currentStock, quantity + 1))}
                            aria-label="Increase quantity"
                            className="w-8 h-8 flex items-center justify-center bg-white rounded-md shadow-sm text-gray-600 hover:text-gray-800 hover:bg-gray-50 transition-all active:scale-95 disabled:opacity-40"
                            disabled={quantity >= currentStock}
                        >
                            +
                        </button>
                    </div>
                    {currentStock > 0 && currentStock <= 5 && (
                        <span className="text-xs text-red-600 font-medium">
                            Only {currentStock} left!
                        </span>
                    )}
                </div>

                {/* Action Buttons — object-style config */}
                {(() => {
                    const isInCompare = compareList?.some((i) => i.id === product.id);

                    type ActionButton = {
                        id: string;
                        label: string;
                        icon: React.ElementType;
                        colSpan: string;
                        className: string;
                        onClick: () => void;
                        disabled?: boolean;
                        show?: boolean;
                    };

                    const actionButtons: ActionButton[] = [
                        {
                            id: "add-to-cart",
                            label: currentStock === 0 ? "Out of Stock" : "Add to Cart",
                            icon: ShoppingCart,
                            colSpan: "col-span-3 sm:col-span-1",
                            className:
                                "bg-(--colour-fsP2) hover:bg-(--colour-fsP2)/90 text-white shadow hover:shadow-md disabled:bg-gray-300 disabled:cursor-not-allowed",
                            onClick: () => addToCart(product.id, quantity),
                            disabled: currentStock === 0,
                        },
                        {
                            id: "pre-order",
                            label: "Pre-Order",
                            icon: CalendarClock,
                            colSpan: "col-span-3 sm:col-span-1",
                            className:
                                "bg-blue-600 hover:bg-blue-700 text-white shadow hover:shadow-md",
                            onClick: () => setIsPreOrderOpen(true),
                        },

                        {
                            id: "apply-emi",
                            label: "Apply EMI",
                            icon: CreditCard,
                            colSpan: "col-span-3 sm:col-span-1",
                            className:
                                "bg-(--colour-fsP1) hover:bg-(--colour-fsP1)/90 text-white shadow hover:shadow-md",
                            onClick: () =>
                                handleroute(
                                    selectedVariant?.color
                                        ? `/emi/apply/${product.slug}?selectedcolor=${selectedVariant.color}`
                                        : `/emi/apply/${product.slug}`
                                ),
                            show: product.emi_enabled === 1,
                        },
                        {
                            id: "compare",
                            label: isInCompare ? "Added" : "Compare",
                            icon: Scale,
                            colSpan: "col-span-3 sm:col-span-1",
                            className: isInCompare
                                ? "bg-white text-(--colour-fsP2) border border-(--colour-fsP2) hover:bg-(--colour-fsP2)/5"
                                : "bg-gray-200 hover:bg-gray-300 text-black border border-gray-300",
                            onClick: () => {
                                if (isInCompare) removeFromCompare(product.id);
                                else addToCompare(product);
                            },
                        },
                    ];

                    return (
                        <div ref={actionRef} className="grid grid-cols-3 gap-3">
                            {actionButtons
                                .filter((btn) => btn.show !== false)
                                .map(({ id, label, icon: Icon, colSpan, className, onClick, disabled }) => (
                                    <button
                                        key={id}
                                        title={id}
                                        onClick={onClick}
                                        disabled={disabled}
                                        className={cn(
                                            colSpan,
                                            "cursor-pointer px-3 py-2 font-medium rounded transition-all active:scale-[0.98] flex items-center justify-center gap-2 text-sm",
                                            className
                                        )}
                                    >
                                        <Icon className="w-4 h-4 shrink-0" />
                                        {label}
                                    </button>
                                ))}
                        </div>
                    );
                })()}
            </div>

            {/* SECTIONS MOVED BELOW ACTION BUTTONS */}

            {/* COUPONS */}
            <div className="pt-2">
                <ProductCoupons />
            </div>



            {/* HIGHLIGHTS */}
            {
                parseHighlights(product.highlights).length > 0 && (
                    <div className="pt-4 border-t border-gray-100">
                        <ul className="space-y-2.5">
                            {parseHighlights(product.highlights).map((item, idx) => (
                                <li key={idx} className="flex items-start gap-3 text-sm text-slate-600">
                                    <Check className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                                    <span className="leading-snug">{item}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                )
            }

            {/* FREE GIFTS SECTION (Real Data) - REDESIGNED */}
            {
                freeGifts.length > 0 && (
                    <div className="mt-4 border-t border-gray-100 pt-5">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2">
                                <div className="bg-(--colour-fsP2)/10 p-1.5 rounded-lg text-(--colour-fsP2)">
                                    <Gift className="w-4 h-4" />
                                </div>
                                <h2 className="text-sm font-bold text-slate-900">Free Gifts Included</h2>
                            </div>
                            <span className="text-[10px] font-bold text-(--colour-fsP2) bg-(--colour-fsP2)/5 px-2 py-1 rounded-md border border-(--colour-fsP2)/10">Limited Offer</span>
                        </div>

                        <div className="space-y-3">
                            {freeGifts.map((gift, i) => (
                                <div key={i} className="flex items-center gap-4 p-3 rounded-xl border border-slate-100 bg-white shadow-[0_2px_8px_-2px_rgba(0,0,0,0.05)] hover:border-(--colour-fsP2)/30 transition-all group relative overflow-hidden">
                                    <div className="absolute top-0 right-0 w-16 h-16 bg-(--colour-fsP2)/5 rounded-bl-[40px] -mr-8 -mt-8 z-0"></div>

                                    <div className="w-16 h-16 bg-slate-50 rounded-lg flex items-center justify-center shrink-0 border border-slate-100 relative overflow-hidden z-10">
                                        {gift.image ? (
                                            <Image src={gift.image.thumb || gift.image.full} alt={gift.name} fill className="object-cover" />
                                        ) : (
                                            <Gift className="w-7 h-7 text-slate-300" />
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0 z-10">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="bg-(--colour-fsP2) text-white text-[9px] font-bold px-1.5 py-0.5 rounded-sm uppercase tracking-wider shadow-sm">Free</span>
                                            <span className="text-[11px] text-slate-500 line-through font-medium">Rs. {gift.price.toLocaleString()}</span>
                                        </div>
                                        <p className="text-sm font-bold text-slate-800 truncate group-hover:text-(--colour-fsP2) transition-colors">{gift.name}</p>
                                        <p className="text-[10px] text-slate-500 font-medium">Worth Rs. {gift.price.toLocaleString()}</p>
                                    </div>
                                    <div className="mr-1 z-10">
                                        <div className="w-7 h-7 rounded-full bg-(--colour-fsP2)/10 flex items-center justify-center text-(--colour-fsP2) border border-(--colour-fsP2)/10">
                                            <Check className="w-4 h-4" />
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

            <PreOrderDialog
                isOpen={isPreOrderOpen}
                onClose={() => setIsPreOrderOpen(false)}
                productName={product.name}
                productImage={product.image?.full}
                productPrice={currentPrice}
                productSlug={product.slug}
            />

            <StockInvestmentDialog
                isOpen={isStockInvestOpen}
                onClose={() => setIsStockInvestOpen(false)}
                productName={product.name}
                productImage={product.image?.full}
                productPrice={currentPrice}
            />
        </div>
    );
};

export default ProductBuyBox;
