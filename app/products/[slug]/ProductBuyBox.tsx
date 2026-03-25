"use client";

import React, { useState } from "react";
import { createPortal } from "react-dom";
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
    Minus,
    Plus,
    ArrowRightLeft,
    X,
    ChevronRight,
    Smartphone,
    Percent,
    Clock,
    Info,
} from "lucide-react";
import Image from "next/image";
import { cn } from "@/lib/utils";

import { useRouter } from "next/navigation";
import type { BasketProduct, ProductDetails } from "@/app/types/ProductDetailsTypes";
import dynamic from "next/dynamic";

const ProductCoupons = dynamic(() => import("./ProductCoupons"), { ssr: false });
const ShareDialog = dynamic(() => import("./ShareDialog"), { ssr: false });
const PreOrderDialog = dynamic(() => import("./PreOrderDialog"), { ssr: false });
const ProductEmiDialog = dynamic(() => import("./ProductEmiDialog"), { ssr: false });
const EmiWidget = dynamic(() => import("./EmiWidget"), { ssr: false });

import useSWR from "swr";
import type { CategorySlug_ID } from "@/app/types/category";
import { parseHighlights } from "@/app/CommonVue/highlights";
import { useShallow } from "zustand/react/shallow";
import { useCartStore } from "@/app/context/CartContext";
import { useAuthStore } from "@/app/context/AuthContext";


interface ProductBuyBoxProps {
    product: ProductDetails;
    selectedVariant: any | null;
    selectedAttributes: Record<string, string>;
    setSelectedAttributes: React.Dispatch<React.SetStateAction<Record<string, string>>>;
    availableAttributes: Record<string, string[]>;
    quantity: number;
    setQuantity: (qty: number) => void;
    allVariantImages: Array<{ url: string; thumb: string; isDefault: boolean; color?: string }>;
}

const ProductBuyBox: React.FC<ProductBuyBoxProps> = ({
    product,
    selectedVariant,
    selectedAttributes,
    setSelectedAttributes,
    availableAttributes,
    quantity,
    setQuantity,
    allVariantImages,
}) => {
    const { isLoggedIn, user, triggerLoginAlert } = useAuthStore(useShallow(state => ({
        isLoggedIn: state.isLoggedIn,
        user: state.user,
        triggerLoginAlert: state.triggerLoginAlert
    })));

    const { addToCart, wishlistItems, addToWishlist, removeFromWishlist, addToCompare, removeFromCompare, compareItems } =
        useCartStore(
            useShallow((state) => ({
                addToCart: state.addToCart,
                wishlistItems: state.wishlistItems,
                addToWishlist: state.addToWishlist,
                removeFromWishlist: state.removeFromWishlist,
                addToCompare: state.addToCompare,
                removeFromCompare: state.removeFromCompare,
                compareItems: state.compareItems,
            }))
        );

    const router = useRouter();

    const baseCurrentPrice =
        typeof product.price === "object"
            ? (product.price as any).current
            : product.discounted_price || product.price;
    const baseOriginalPrice =
        typeof product.price === "object" ? (product.price as any).original_price : product.original_price;

    const currentPrice = selectedVariant?.discounted_price || selectedVariant?.price || baseCurrentPrice;
    const originalPrice = selectedVariant?.original_price || baseOriginalPrice;
    const currentStock = selectedVariant ? selectedVariant.quantity : product.quantity;
    const discountPercentage =
        originalPrice && originalPrice > currentPrice
            ? Math.round(((originalPrice - currentPrice) / originalPrice) * 100)
            : 0;

    const [isShareOpen, setIsShareOpen] = useState(false);
    const [isPreOrderOpen, setIsPreOrderOpen] = useState(false);
    const [isEmiDialogOpen, setIsEmiDialogOpen] = useState(false);

    // EMI calculations
    const emiPlans = [
        { months: 36, rate: Math.round(currentPrice / 36), label: "Super Saver", color: "text-blue-600", bg: "bg-blue-50", border: "border-blue-100" },
        { months: 24, rate: Math.round(currentPrice / 24), label: "Extended", color: "text-indigo-600", bg: "bg-indigo-50", border: "border-indigo-100" },
        { months: 18, rate: Math.round(currentPrice / 18), label: "Most Popular", color: "text-[var(--colour-fsP2)]", bg: "bg-orange-50", border: "border-orange-100" },
        { months: 12, rate: Math.round(currentPrice / 12), label: "Standard", color: "text-cyan-600", bg: "bg-cyan-50", border: "border-cyan-100" },
    ];
    const lowestEmi = emiPlans[0].rate; // 36 months = lowest EMI

    const isInWishlist = wishlistItems.some((item) => item.id === product.id);
    const isInCompare = compareItems.some((i) => i.id === product.id);

    const toggleWishlist = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        isInWishlist ? await removeFromWishlist(product.id) : await addToWishlist(product.id, user, triggerLoginAlert, product as unknown as BasketProduct);

    };

    const handleAddToCart = async () => {
        const selectedColor = selectedAttributes["Color"] || selectedAttributes["color"] || selectedVariant?.attributes?.Color || selectedVariant?.attributes?.color || selectedVariant?.color;
        await addToCart(product.id, quantity, { isLoggedIn }, triggerLoginAlert, product as unknown as BasketProduct, selectedColor);
    };

    const handleCompareToggle = () => {
        isInCompare ? removeFromCompare(product.id) : addToCompare(product as any);
    };

    const currentUrl = typeof window !== "undefined" ? window.location.href : "";

    const categorySlug = product.categories?.[0]?.slug;




    const highlights = parseHighlights(
        typeof product.description === "object"
            ? (product.description as any)?.highlights
            : product.highlights || ""
    );

    const stockStatus =
        currentStock === 0
            ? { label: "Out of Stock", color: "text-red-500", dot: "bg-red-400" }
            : currentStock <= 5
                ? { label: `Only ${currentStock} left`, color: "text-amber-600", dot: "bg-amber-400" }
                : { label: "In Stock", color: "text-emerald-600", dot: "bg-emerald-400" };

    return (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            {/* ── Header Section ── */}
            <div className="px-4 pt-4 pb-3 border-b border-gray-50">
                {/* Brand + Rating row */}
                <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2.5">
                        {product.brand && (
                            <span className="text-[11px] font-bold text-[var(--colour-fsP2)] uppercase tracking-widest">
                                {product.brand.name}
                            </span>
                        )}
                        {product.brand && product.average_rating > 0 && (
                            <span className="w-px h-3 bg-gray-200" />
                        )}
                        {product.average_rating > 0 && (
                            <button
                                onClick={() => document.getElementById("reviews")?.scrollIntoView({ behavior: "smooth" })}
                                className="flex items-center gap-1 text-xs text-amber-500 hover:text-amber-600 transition-colors cursor-pointer"
                            >
                                <Star className="w-3 h-3 fill-current" />
                                <span className="font-semibold">{product.average_rating}</span>
                                <span className="text-slate-500 font-normal">/ 5</span>
                            </button>
                        )}
                    </div>

                    {/* Action icons */}
                    <div className="flex items-center gap-1.5">
                        <button
                            onClick={toggleWishlist}
                            aria-label={isInWishlist ? "Remove from wishlist" : "Add to wishlist"}
                            className={cn(
                                "w-8 h-8 flex items-center justify-center rounded-xl transition-all cursor-pointer",
                                isInWishlist
                                    ? "bg-red-50 text-red-500"
                                    : "bg-gray-50 text-gray-400 hover:bg-red-50 hover:text-red-400"
                            )}
                        >
                            <Heart className={cn("w-4 h-4", isInWishlist && "fill-current")} />
                        </button>
                        <button
                            onClick={() => setIsShareOpen(true)}
                            aria-label="Share"
                            className="w-8 h-8 flex items-center justify-center rounded-xl bg-gray-50 text-gray-400 hover:bg-[var(--colour-fsP1)] hover:text-white transition-all cursor-pointer"
                        >
                            <Share2 className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                {/* Product Name */}
                <h1 className="text-xl sm:text-[22px] font-bold text-slate-900 leading-snug tracking-tight">
                    {product.name}
                </h1>
                {product.sku && (
                    <p className="mt-1 text-[11px] text-slate-500 font-medium tracking-wide">SKU: {product.sku}</p>
                )}
            </div>

            {/* ── Price Section ── */}
            <div className="px-4 py-3 border-b border-gray-50 bg-gray-50/40">
                <div className="flex items-end gap-3 flex-wrap">
                    <span className="text-3xl sm:text-[34px] font-bold text-slate-900 tracking-tight leading-none">
                        Rs.{currentPrice.toLocaleString()}
                    </span>
                    {originalPrice && originalPrice > currentPrice && (
                        <>
                            <span className="text-sm text-slate-500 line-through pb-0.5">
                                Rs.{originalPrice.toLocaleString()}
                            </span>
                            <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-200/80 px-2 py-0.5 rounded-lg pb-0.5">
                                −{discountPercentage}% OFF
                            </span>
                        </>
                    )}
                </div>


                {/* Stock status */}
                <div className="flex items-center gap-1.5 mt-2.5">
                    <span className={cn("w-1.5 h-1.5 rounded-full animate-pulse", stockStatus.dot)} />
                    <span className={cn("text-xs font-semibold", stockStatus.color)}>{stockStatus.label}</span>
                </div>
            </div>

            {/* ── Variants Section ── */}
            {Object.keys(availableAttributes).length > 0 && (
                <div className="px-4 py-3 border-b border-gray-50 space-y-3">
                    {Object.entries(availableAttributes).map(([attrName, options]) => {
                        const isColorAttr = attrName.toLowerCase() === "color";
                        return (
                            <div key={attrName}>
                                <div className="flex items-center gap-2 mb-2">
                                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">
                                        {attrName}
                                    </span>
                                    {selectedAttributes[attrName] && (
                                        <span className="text-xs font-semibold text-slate-800">
                                            {selectedAttributes[attrName]}
                                        </span>
                                    )}
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {options.map((optionValue, idx) => {
                                        const isSelected = selectedAttributes[attrName] === optionValue;
                                        const variantImage = isColorAttr
                                            ? allVariantImages.find((img) => img.color === optionValue)?.url ||
                                            product.thumb?.url
                                            : null;

                                        return (
                                            <button
                                                key={idx}
                                                onClick={() =>
                                                    setSelectedAttributes((prev) => ({
                                                        ...prev,
                                                        [attrName]: optionValue,
                                                    }))
                                                }
                                                className={cn(
                                                    "relative cursor-pointer rounded-xl transition-transform duration-150 border-2 border-gray-100 overflow-visible",
                                                    isColorAttr
                                                        ? "w-12 h-12 p-0.5"
                                                        : "px-3.5 py-1.5 text-sm font-semibold",
                                                    isSelected
                                                        ? "shadow-md shadow-orange-100 active:scale-95"
                                                        : "hover:border-gray-300 text-gray-600 active:scale-95"
                                                )}
                                                aria-label={`Select ${attrName}: ${optionValue}`}
                                            >
                                                {/* Composited border transition */}
                                                <div className={cn(
                                                    "absolute -inset-[2px] border-2 border-[var(--colour-fsP1)] rounded-xl transition-opacity duration-200 pointer-events-none z-10",
                                                    isSelected ? "opacity-100" : "opacity-0"
                                                )} />

                                                {isColorAttr && variantImage ? (
                                                    <div className="w-full h-full rounded-lg overflow-hidden bg-gray-50 relative">
                                                        <Image
                                                            src={variantImage}
                                                            alt={optionValue}
                                                            fill
                                                            className="object-cover"
                                                            sizes="48px"
                                                        />
                                                    </div>
                                                ) : (
                                                    <span>{optionValue}</span>
                                                )}
                                                {isSelected && isColorAttr && (
                                                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-[var(--colour-fsP1)] rounded-full flex items-center justify-center z-20">
                                                        <Check className="w-2.5 h-2.5 text-white" />
                                                    </span>
                                                )}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* ── Quantity + Actions ── */}
            <div className="px-4 py-3 space-y-2.5">
                {/* Quantity */}
                <div className="flex items-center gap-3">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Quantity</span>
                    <div className="flex items-center bg-gray-50 border border-gray-200 rounded-xl overflow-hidden">
                        <button
                            onClick={() => setQuantity(Math.max(1, quantity - 1))}
                            disabled={quantity <= 1}
                            aria-label="Decrease"
                            className="w-8 h-8 flex items-center justify-center text-gray-500 hover:text-[var(--colour-fsP1)] disabled:opacity-30 transition-colors cursor-pointer"
                        >
                            <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span
                            className="w-8 text-center text-sm font-bold text-slate-800"
                            aria-live="polite"
                            aria-label={`Quantity: ${quantity}`}
                        >
                            {quantity}
                        </span>
                        <button
                            onClick={() => setQuantity(Math.min(currentStock, quantity + 1))}
                            disabled={quantity >= currentStock}
                            aria-label="Increase"
                            className="w-8 h-8 flex items-center justify-center text-gray-500 hover:text-[var(--colour-fsP1)] disabled:opacity-30 transition-colors cursor-pointer"
                        >
                            <Plus className="w-3.5 h-3.5" />
                        </button>
                    </div>
                </div>

                {/* Main action row: Add to Cart | Pre-Order | Apply EMI */}
                <div className="grid grid-cols-3 gap-2">
                    <button
                        onClick={handleAddToCart}
                        disabled={currentStock === 0}
                        className="col-span-1 h-10 flex items-center justify-center gap-1.5 bg-[var(--colour-fsP2)] hover:bg-[var(--colour-fsP2)]/90 disabled:bg-gray-200 disabled:cursor-not-allowed text-white text-[11px] font-bold rounded-xl shadow-sm transition-transform active:scale-[0.98] cursor-pointer"
                    >
                        <ShoppingCart className="w-3.5 h-3.5 shrink-0" />
                        {currentStock === 0 ? "Out of Stock" : "Add to Cart"}
                    </button>

                    <button
                        onClick={() => setIsPreOrderOpen(true)}
                        className="col-span-1 h-10 flex items-center justify-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-white text-[11px] font-bold rounded-xl transition-transform active:scale-[0.98] cursor-pointer"
                    >
                        <CalendarClock className="w-3.5 h-3.5 shrink-0" />
                        Pre-Order
                    </button>

                    <button
                        onClick={() =>
                            router.push(
                                selectedVariant?.color
                                    ? `/emi/apply/${product.slug}?selectedcolor=${selectedVariant.color}`
                                    : `/emi/apply/${product.slug}`
                            )
                        }
                        className="col-span-1 h-10 flex items-center justify-center gap-1.5 bg-[var(--colour-fsP1)] hover:bg-[var(--colour-fsP1)]/90 text-white text-[11px] font-bold rounded-xl transition-transform active:scale-[0.98] cursor-pointer"
                    >
                        <CreditCard className="w-3.5 h-3.5 shrink-0" />
                        Apply EMI
                    </button>
                </div>

                {/* Compare */}
                <button
                    onClick={handleCompareToggle}
                    className={cn(
                        "w-full h-9 flex items-center justify-center gap-1.5 text-[11px] font-bold rounded-xl border transition-transform active:scale-[0.98] cursor-pointer",
                        isInCompare
                            ? "bg-[var(--colour-fsP2)]/5 border-[var(--colour-fsP2)] text-[var(--colour-fsP2)]"
                            : "bg-gray-50 border-gray-200 text-gray-600 hover:border-gray-300"
                    )}
                >
                    <Scale className="w-3.5 h-3.5 shrink-0" />
                    {isInCompare ? "Added to Compare" : "Compare"}
                </button>
            </div>

            {/* ── Coupons ── */}
            <div className="px-4 py-3 border-t border-gray-50">
                <ProductCoupons />

                {product.emi_enabled && (
                    <div className="mt-3">
                        <EmiWidget price={Number(currentPrice)} />
                    </div>
                )}
            </div>


            {/* ── Highlights ── */}
            {highlights.length > 0 && (
                <div className="px-4 pb-4 border-t border-gray-50 pt-3">
                    <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-3">Highlights</p>
                    <ul className="space-y-2">
                        {highlights.map((item, idx) => (
                            <li key={idx} className="flex items-start gap-2.5 text-sm text-slate-600 leading-snug">
                                <span className="w-4 h-4 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center shrink-0 mt-0.5">
                                    <Check className="w-2.5 h-2.5 text-emerald-500" />
                                </span>
                                {item}
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            {/* ── Free Gifts ── */}
            {/* {freeGifts.length > 0 && (
                <div className="mx-3 mb-3 rounded-xl border border-amber-100 bg-gradient-to-br from-amber-50/60 to-orange-50/40 p-3">
                    <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                            <Gift className="w-4 h-4 text-[var(--colour-fsP2)]" />
                            <span className="text-sm font-bold text-slate-800">Free Gifts Included</span>
                        </div>
                        <span className="text-[10px] font-bold text-[var(--colour-fsP2)] bg-white border border-[var(--colour-fsP2)]/20 px-2 py-0.5 rounded-lg">
                            Limited Offer
                        </span>
                    </div>

                    <div className="space-y-2.5">
                        {freeGifts.map((gift, i) => (
                            <div
                                key={i}
                                className="flex items-center gap-3 p-2.5 rounded-xl bg-white border border-white/80 shadow-sm"
                            >
                                <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-gray-50 border border-gray-100 shrink-0">
                                    {gift.image ? (
                                        <Image
                                            src={gift.image.thumb || gift.image.full}
                                            alt={gift.name}
                                            fill
                                            className="object-contain p-1"
                                        />
                                    ) : (
                                        <Gift className="w-5 h-5 text-gray-300 m-auto mt-3.5" />
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-semibold text-slate-800 truncate">{gift.name}</p>
                                    <p className="text-xs text-slate-400">Worth Rs.{gift.price.toLocaleString()}</p>
                                </div>
                                <span className="text-[10px] font-bold text-white bg-[var(--colour-fsP2)] px-2 py-0.5 rounded-lg shrink-0">
                                    FREE
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            )} */}

            {/* Dialogs */}
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
                selectedColor={selectedAttributes["Color"] || selectedAttributes["color"] || selectedVariant?.attributes?.Color || selectedVariant?.attributes?.color || selectedVariant?.color}
            />

            {/* ── EMI Details Dialog ── */}
            <ProductEmiDialog
                isOpen={isEmiDialogOpen}
                onClose={() => setIsEmiDialogOpen(false)}
                product={product}
                currentPrice={currentPrice}
                selectedVariant={selectedVariant}
            />
        </div>
    );
};

export default ProductBuyBox;