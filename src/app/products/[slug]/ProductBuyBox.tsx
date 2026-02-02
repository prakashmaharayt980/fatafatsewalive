"use client";

import React, { useMemo } from "react";
import { ShoppingBag, CreditCard, Scale, Star, Check } from "lucide-react";
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

    // Parse highlights: split by "|" into bullet points
    const highlightBullets = useMemo(() => {
        if (!product.highlights) return [];
        return product.highlights
            .split("|")
            .map((item) => item.trim())
            .filter((item) => item.length > 0);
    }, [product.highlights]);

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-6 space-y-3">

            {/* 1. HEADER: Brand, Title, Share */}
            <div className="space-y-1">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        {product.brand && (
                            <span className="text-xs font-bold text-[var(--colour-fsP2)] uppercase tracking-wide bg-orange-50 rounded-full">
                                {product.brand.name}
                            </span>
                        )}
                        {product.average_rating > 0 && (
                            <div className="flex items-center gap-1 text-xs font-medium text-amber-500">
                                <Star className="w-3.5 h-3.5 fill-current" />
                                <span>{product.average_rating}</span>
                                <span className="text-gray-400">/ 5</span>
                            </div>
                        )}
                    </div>
                </div>

                <h1 className="text-xl sm:text-2xl font-bold text-slate-900 leading-snug">
                    {product.name}
                </h1>
                {product.sku && (
                    <p className="text-xs text-slate-500">SKU: {product.sku}</p>
                )}
            </div>

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

                {/* COUPONS */}
                <ProductCoupons />
            </div>

            {/* HIGHLIGHTS (pipe-separated → bullets) */}
            {highlightBullets.length > 0 && (
                <div className="pt-1">
                    <ul className="space-y-1.5">
                        {highlightBullets.map((item, idx) => (
                            <li key={idx} className="flex items-start gap-2 text-[13px] text-slate-600 leading-snug">
                                <Check className="w-3.5 h-3.5 mt-0.5 text-[var(--colour-fsP2)] flex-shrink-0" />
                                <span>{item}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            {/* 4. VARIANTS (Color) with color-matched images */}
            {productDisplay.variantsByColor.length > 0 && (
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

                    {/* Color-matched image thumbnails from global images */}
                    {colorImages.length > 1 && (
                        <div className="flex gap-1.5 pt-1 overflow-x-auto scrollbar-hide">
                            {colorImages.slice(0, 5).map((img, idx) => (
                                <div
                                    key={idx}
                                    className="w-10 h-10 rounded-md overflow-hidden bg-gray-50 relative flex-shrink-0 border border-gray-100"
                                >
                                    <Image
                                        src={img.thumb || img.url}
                                        alt={`${selectedVariant?.color} view ${idx + 1}`}
                                        fill
                                        className="object-cover"
                                        sizes="40px"
                                    />
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

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
                <div className="flex items-center flex-wrap sm:flex-nowrap gap-2">
                    <Button
                        className="flex-1 h-11 bg-[var(--colour-fsP2)] hover:opacity-90 text-white font-bold rounded-xl text-xs sm:text-sm disabled:opacity-50 transition-all active:scale-[0.98] group"
                        onClick={() => addToCart(product.id, quantity)}
                        disabled={currentStock === 0}
                    >
                        <ShoppingBag className="w-4 h-4 mr-1.5 group-hover:animate-bounce" />
                        {currentStock === 0 ? 'Out of Stock' : 'Add to Cart'}
                    </Button>
                    {product.emi_enabled === 1 && (
                        <Button
                            className="flex-1 h-11 bg-[#1f7a4d] hover:opacity-90 text-white font-bold rounded-xl text-xs sm:text-sm transition-all active:scale-[0.98]"
                            onClick={() => router.push(`/emi/applyemi?product=${product.id}`)}
                        >
                            <CreditCard className="w-4 h-4 mr-1.5" />
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

        </div>
    );
};

export default ProductBuyBox;
