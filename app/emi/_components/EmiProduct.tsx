"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { Drawer, DrawerContent, DrawerDescription, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";
import { Check, Eye, Loader2, RefreshCw, Search, Smartphone, X } from "lucide-react";
import { fetchSearchProducts } from "@/app/emi/actions";
import type { ProductDetails } from "@/app/types/ProductDetailsTypes";
import { useContextEmi } from "./emiContext";
import { parseHighlights } from "@/app/CommonVue/highlights";

interface Props {
    chooseProduct: (col: string) => void;
    onProductChange: (product: ProductDetails) => void;
    product: ProductDetails | null;
    selectedVariant?: string;
}

interface SearchProduct {
    id: number;
    name: string;
    slug: string;
    price: number;
    quantity: number;
    emi_enabled?: boolean;
    thumb?: { url: string | null; alt_text?: string | null };
    highlights?: string | null;
    brand?: { name: string } | null;
    sku?: string | null;
    pre_order?: { available: boolean; price: number | null };
    short_desc?: string | null;
    categories?: any[];
}

interface State {
    selectItems: SearchProduct[];
    searchQuery: string;
    isDrawerOpen: boolean;
    loading: boolean;
}

const getPrice = (p: any): number => {
    if (!p) return 0;
    if (typeof p === "number") return p;
    return p.current ?? 0;
};

const getOriginalPrice = (p: any): number | null => {
    if (!p || typeof p === "number") return null;
    return p.original_price ?? null;
};

const getProductImage = (product: ProductDetails | any): string => {
    if (!product) return "";
    if (typeof product.image === "string") return product.image;
    // Check nested url properties first, then thumb objects, then direct arrays
    return (
        product.image?.full ?? 
        product.image?.url ??
        product.image?.thumb ?? 
        product.thumb?.url ?? 
        product.thumb ??
        product.images?.[0]?.url ?? 
        product.images?.[0]?.thumb ?? 
        ""
    );
};

const labelCls = "text-[10px] font-bold text-(--colour-fsP2) uppercase tracking-widest";
const noBar = "[&::-webkit-scrollbar]:w-0 [scrollbar-width:none]";

export default function ProductEMIUI({ chooseProduct, onProductChange, product, selectedVariant }: Props) {
    const { setEmiContextInfo } = useContextEmi();
    const [state, setState] = useState<State>({
        selectItems: [],
        searchQuery: "",
        isDrawerOpen: false,
        loading: false,
    });

    const update = (u: Partial<State>) => setState(p => ({ ...p, ...u }));



    useEffect(() => {
        const timer = setTimeout(() => {
            const query = state.searchQuery.trim();
            if (!query) { update({ selectItems: [] }); return; }
            update({ loading: true });
            fetchSearchProducts({ search: query, emi: true })
                .then(res => update({ selectItems: res.data ?? [] }))
                .catch(console.error)
                .finally(() => update({ loading: false }));
        }, 450);
        return () => clearTimeout(timer);
    }, [state.searchQuery]);

    const handleProductSelect = (item: SearchProduct) => {
        onProductChange(item as unknown as ProductDetails);
        update({ isDrawerOpen: false, searchQuery: "", selectItems: [] });
    };

    const closeDrawer = () => update({ isDrawerOpen: false, searchQuery: "", selectItems: [] });

    const availableVariants = product?.variants?.filter(v => v.quantity > 0) ?? [];
    const uniqueColors = Array.from(new Set(availableVariants.map(v => v.attributes?.Color).filter(Boolean)));
    
    // Main display logic
    const baseProductImage = getProductImage(product);
    const matchedVariant = selectedVariant 
        ? product?.variants?.find(v => v.attributes?.Color === selectedVariant) 
        : undefined;
    
    // Variant info
    const productPrice = matchedVariant?.price ?? getPrice(product?.price);
    const originalPrice = getOriginalPrice(product?.price);

    // Final image for display
    const variantImg = matchedVariant ? getProductImage(matchedVariant) : "";
    const displayImage = variantImg || baseProductImage;

    const hasDiscount = originalPrice !== null && originalPrice > productPrice;
    const discountPct = hasDiscount ? Math.round(((originalPrice - productPrice) / originalPrice) * 100) : 0;
    
    const highlights = parseHighlights(
        product?.highlights ?? (product?.description?.highlights as string | undefined),
        4
    );

    return (
        <div className="w-full">
            <Drawer open={state.isDrawerOpen} onOpenChange={open => update({ isDrawerOpen: open })}>
                <DrawerContent className={`mx-auto flex h-[85vh] max-w-2xl flex-col overflow-hidden rounded-t-2xl bg-white p-0 ${noBar}`}>
                    <DrawerHeader className="sr-only">
                        <DrawerTitle>Search EMI Products</DrawerTitle>
                        <DrawerDescription>Only EMI-eligible products shown.</DrawerDescription>
                    </DrawerHeader>

                    <div className="p-4 bg-white border-b border-gray-100 shrink-0">
                        <div className="flex items-center gap-2 rounded-xl border border-gray-200 bg-gray-50 px-3 focus-within:ring-2 focus-within:ring-[var(--colour-fsP2)] focus-within:border-[var(--colour-fsP2)] transition-all">
                            <Search className="w-5 h-5 text-gray-400 shrink-0" />
                            <input
                                type="text"
                                placeholder="Search mobiles, laptops, tablets..."
                                value={state.searchQuery}
                                onChange={e => update({ searchQuery: e.target.value })}
                                className="w-full py-3 bg-transparent border-none focus:outline-none text-sm text-gray-800 placeholder:text-gray-400"
                                autoFocus
                            />
                            {state.loading ? (
                                <Loader2 size={16} className="animate-spin text-[var(--colour-fsP2)] shrink-0" />
                            ) : state.searchQuery ? (
                                <button onClick={() => update({ searchQuery: "", selectItems: [] })} className="text-gray-400 hover:text-gray-600">
                                    <X className="h-4 w-4" />
                                </button>
                            ) : (
                                <button onClick={closeDrawer} className="text-xs font-semibold text-[var(--colour-fsP2)]">
                                    Cancel
                                </button>
                            )}
                        </div>
                    </div>

                    <div className={`flex-1 min-h-0 overflow-y-auto bg-gray-50 ${noBar}`}>
                        {state.selectItems.length > 0 ? (
                            <div className="p-2">
                                {state.selectItems.map(item => {
                                    const itemPrice = getPrice(item.price);
                                    const itemOriginal = getOriginalPrice(item.price);
                                    const itemDiscount = itemOriginal !== null && itemOriginal > itemPrice;
                                    const img = item.thumb?.url ?? "";
                                    return (
                                        <button
                                            key={item.id}
                                            onClick={() => handleProductSelect(item)}
                                            className="group flex w-full items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white text-left transition-colors"
                                        >
                                            <div className="w-11 h-11 shrink-0 rounded-lg border border-gray-200 bg-white overflow-hidden">
                                                {img
                                                    ? <Image src={img} alt={item.name} width={44} height={44} className="object-contain p-1 w-full h-full" />
                                                    : <div className="w-full h-full flex items-center justify-center"><Smartphone size={16} className="text-gray-300" /></div>}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                {item.brand?.name && (
                                                    <p className={labelCls + " mb-0.5"}>{item.brand.name}</p>
                                                )}
                                                <p className="text-sm font-bold text-slate-900 truncate group-hover:text-(--colour-fsP2) transition-colors">
                                                    {item.name}
                                                </p>
                                                <div className="flex items-center gap-2 mt-0.5">
                                                    <span className="text-xs font-bold text-slate-800">
                                                        Rs. {itemPrice.toLocaleString()}
                                                    </span>
                                                    {itemDiscount && itemOriginal !== null && (
                                                        <span className="text-[10px] text-slate-400 line-through">
                                                            Rs. {itemOriginal.toLocaleString()}
                                                        </span>
                                                    )}
                                                    {item.emi_enabled && (
                                                        <span className="text-[9px] font-bold text-(--colour-fsP2) bg-blue-50 border border-blue-100 px-1.5 py-0.5 rounded uppercase tracking-widest">
                                                            EMI
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center h-full text-center gap-3">
                                <div className="w-12 h-12 rounded-xl border border-gray-200 bg-white flex items-center justify-center">
                                    {state.searchQuery
                                        ? <Search size={18} className="text-gray-400" />
                                        : <Smartphone size={18} className="text-gray-400" />}
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-slate-900">
                                        {state.searchQuery ? "No products found" : "Search EMI products"}
                                    </p>
                                    <p className="text-xs text-slate-500 mt-0.5">
                                        {state.searchQuery
                                            ? "Try a shorter name or different keyword."
                                            : "Search for the device you want to finance on EMI."}
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                </DrawerContent>
            </Drawer>

            {/* ── Product card ──────────────────────────────────────────────── */}
            {product ? (
                <div className="grid gap-5 lg:grid-cols-[200px_1fr] lg:items-start">
                    {/* Image */}
                    <div className="relative w-full max-w-[200px] mx-auto lg:mx-0 aspect-square rounded-xl border border-gray-200 bg-gray-50 overflow-hidden">
                        {displayImage
                            ? <Image src={displayImage} alt={product.name || "Product"} fill sizes="200px" className="object-contain p-4" priority />
                            : <div className="flex h-full w-full items-center justify-center text-xs text-slate-400">No image</div>}
                        <button
                            onClick={() => update({ isDrawerOpen: true })}
                            title="Change product"
                            className="absolute top-2 right-2 w-7 h-7 flex items-center justify-center rounded-lg border border-gray-200 bg-white text-slate-500 hover:border-(--colour-fsP2) hover:text-(--colour-fsP2) transition-colors"
                        >
                            <RefreshCw size={12} />
                        </button>
                    </div>

                    {/* Info */}
                    <div className="space-y-4">
                        <div>
                            <div className="flex flex-wrap items-center gap-1.5 mb-2">
                                {product.brand?.name && (
                                    <span className="inline-flex items-center text-[10px] font-bold px-2 py-0.5 rounded border text-(--colour-fsP2) bg-blue-50 border-blue-200 uppercase tracking-widest">
                                        {product.brand.name}
                                    </span>
                                )}
                                {product.emi_enabled && (
                                    <span className="inline-flex items-center text-[10px] font-bold px-2 py-0.5 rounded border text-emerald-700 bg-emerald-50 border-emerald-200 uppercase tracking-widest">
                                        EMI Eligible
                                    </span>
                                )}
                            </div>
                            <h2 className="text-base font-black text-slate-900">{product.name}</h2>
                            <div className="flex flex-wrap items-center gap-2 mt-2">
                                <span className="text-2xl font-black text-slate-900">
                                    Rs. {productPrice.toLocaleString()}
                                </span>
                                {hasDiscount && (
                                    <>
                                        <span className="text-sm text-slate-400 line-through">Rs. {originalPrice.toLocaleString()}</span>
                                        <span className="text-[10px] font-bold text-orange-600 bg-orange-50 border border-orange-200 px-2 py-0.5 rounded uppercase tracking-widest">
                                            {discountPct}% off
                                        </span>
                                    </>
                                )}
                            </div>
                        </div>

                        {/* Highlights */}
                        {highlights.length > 0 && (
                            <div className="flex flex-wrap gap-1.5">
                                {highlights.map(h => (
                                    <span key={h} className="text-[10px] font-semibold text-slate-600 bg-gray-100 border border-gray-200 px-2 py-0.5 rounded">
                                        {h}
                                    </span>
                                ))}
                            </div>
                        )}

                        {/* Variants */}
                        {uniqueColors.length > 0 && (
                            <div className="border border-gray-200 rounded-xl p-4 bg-gray-50">
                                <p className={labelCls + " mb-3"}>Choose Variant</p>
                                <div className="flex flex-wrap gap-2">
                                    {uniqueColors.map(color => {
                                        // Variant images live on the variant itself, not product.images
                                        const matchedV = product.variants?.find(
                                            (v) => v.attributes?.Color === color
                                        );
                                        const src = getProductImage(matchedV) || baseProductImage;
                                        const active = selectedVariant === color;
                                        return (
                                            <button
                                                key={color}
                                                onClick={() => {
                                                    chooseProduct(color);
                                                    setEmiContextInfo(prev => ({ ...prev, selectedVariant: color }));
                                                }}
                                                className={cn(
                                                    "flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-bold transition-colors",
                                                    active
                                                        ? "bg-(--colour-fsP2) border-(--colour-fsP2) text-white"
                                                        : "bg-white border-gray-200 text-slate-700 hover:border-(--colour-fsP2) hover:text-(--colour-fsP2)"
                                                )}
                                            >
                                                <span className="w-5 h-5 rounded border border-gray-200 overflow-hidden shrink-0">
                                                    <Image src={src} alt={color} width={20} height={20} className="object-cover w-full h-full" />
                                                </span>
                                                {color}
                                                {active && <Check size={11} className="stroke-2" />}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {/* Actions */}
                        <div className="flex flex-wrap gap-2">
                            <button
                                onClick={() => update({ isDrawerOpen: true })}
                                className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 text-xs font-bold text-slate-700 hover:border-(--colour-fsP2) hover:text-(--colour-fsP2) transition-colors"
                            >
                                <Search size={12} /> Change Product
                            </button>
                            <Link
                                href={`/product-details/${product.slug}`}
                                className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 text-xs font-bold text-slate-700 hover:border-(--colour-fsP2) hover:text-(--colour-fsP2) transition-colors"
                            >
                                <Eye size={12} /> View Details
                            </Link>
                        </div>
                    </div>
                </div>
            ) : (
                /* ── Empty: no product selected ── */
                <button
                    onClick={() => update({ isDrawerOpen: true })}
                    className="w-full flex flex-col items-center justify-center gap-3 py-10 border-2 border-dashed border-gray-200 rounded-xl hover:border-(--colour-fsP2)/50 hover:bg-gray-50 transition-colors text-center"
                >
                    <div className="w-10 h-10 rounded-xl border border-gray-200 bg-gray-50 flex items-center justify-center">
                        <Search size={16} className="text-(--colour-fsP2)" />
                    </div>
                    <div>
                        <p className="text-sm font-bold text-slate-900">Select a product</p>
                        <p className="text-xs text-slate-500 mt-0.5">Search EMI-eligible devices to get started</p>
                    </div>
                    <span className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-(--colour-fsP2) px-4 text-xs font-bold text-white">
                        <Search size={12} /> Search Products
                    </span>
                </button>
            )}
        </div>
    );
}
