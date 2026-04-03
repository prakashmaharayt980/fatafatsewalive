"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { Drawer, DrawerContent, DrawerDescription, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";
import { Check, Eye, Loader2, RefreshCw, Search, Smartphone, X } from "lucide-react";
import { fetchProductBySlug, fetchSearchProducts } from "@/app/emi/actions";
import type { ProductDetails } from "@/app/types/ProductDetailsTypes";
import { useContextEmi } from "./emiContext";

interface Props {
    chooseProduct:    (col: string) => void;
    setProductPrice:  (price: number) => void;
    onProductChange:  (product: ProductDetails) => void;
    product:          ProductDetails | null;
}

interface State {
    selectedColor: string;
    selectItems:   ProductDetails[];
    searchQuery:   string;
    isDrawerOpen:  boolean;
    loading:       boolean;
}

const getPrice = (value: number | { current: number } | null | undefined) => {
    if (typeof value === "object") return Number(value?.current ?? 0);
    return Number(value ?? 0);
};

const getDisplayPrice = (product: ProductDetails | null) => {
    if (!product) return 0;
    const discounted = getPrice(product.discounted_price);
    if (discounted > 0) return discounted;
    return getPrice(product.price);
};

const getProductImage = (product: ProductDetails | null) => {
    if (!product) return "";
    if (typeof product.image === "string") return product.image;
    return product.image?.full ?? product.image?.thumb ?? product.thumb?.url ?? product.images?.[0]?.url ?? "";
};

const labelCls = "text-[10px] font-bold text-(--colour-fsP2) uppercase tracking-widest";
const noBar    = "[&::-webkit-scrollbar]:w-0 [scrollbar-width:none]";

export default function ProductEMIUI({ chooseProduct, setProductPrice, onProductChange, product }: Props) {
    const { setEmiContextInfo } = useContextEmi();
    const [state, setState] = useState<State>({
        selectedColor: "",
        selectItems:   [],
        searchQuery:   "",
        isDrawerOpen:  false,
        loading:       false,
    });

    const update = (u: Partial<State>) => setState(p => ({ ...p, ...u }));

    useEffect(() => { update({ selectedColor: "" }); }, [product?.id]);

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

    const handleProductSelect = async (slug: string) => {
        update({ loading: true });
        try {
            const full = await fetchProductBySlug(slug);
            if (!full) return;
            setEmiContextInfo(prev => ({ ...prev, product: full as ProductDetails, selectedVariant: "" }));
            onProductChange(full as ProductDetails);
            setProductPrice(getDisplayPrice(full));
            update({ isDrawerOpen: false, searchQuery: "", selectItems: [], selectedColor: "" });
        } catch (error) {
            console.error(error);
        } finally {
            update({ loading: false });
        }
    };

    const closeDrawer = () => update({ isDrawerOpen: false, searchQuery: "", selectItems: [] });

    const availableVariants = product?.variants?.filter(v => v.quantity > 0) ?? [];
    const uniqueColors      = Array.from(new Set(availableVariants.map(v => v.attributes?.Color).filter(Boolean)));
    const productPrice      = getDisplayPrice(product);
    const originalPrice     = getPrice(product?.price);
    const hasDiscount       = originalPrice > productPrice && productPrice > 0;
    const discountPct       = hasDiscount ? Math.round(((originalPrice - productPrice) / originalPrice) * 100) : 0;
    const productImage      = getProductImage(product);
    const highlights        = (product?.highlights ?? product?.description?.highlights ?? "")
        .split(/[,\n]/).map(s => s.trim()).filter(Boolean).slice(0, 4);

    return (
        <div className="w-full">
            {/* ── Search Drawer ─────────────────────────────────────────────── */}
            <Drawer open={state.isDrawerOpen} onOpenChange={open => update({ isDrawerOpen: open })}>
                <DrawerContent className={`mx-auto flex h-[85vh] max-w-2xl flex-col overflow-hidden rounded-t-xl border border-gray-200 bg-white p-0 ${noBar}`}>

                    <DrawerHeader className="shrink-0 p-0">
                        {/* Header */}
                        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                            <div>
                                <DrawerTitle className="text-sm font-bold text-slate-900">
                                    Search EMI Products
                                </DrawerTitle>
                                <DrawerDescription className="text-xs text-slate-500 mt-0.5">
                                    Only EMI-eligible products shown.
                                </DrawerDescription>
                            </div>
                            <button
                                onClick={closeDrawer}
                                className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-slate-500 hover:border-(--colour-fsP2) hover:text-(--colour-fsP2) transition-colors"
                            >
                                <X size={14} />
                            </button>
                        </div>

                        {/* Search input */}
                        <div className="px-5 py-3 border-b border-gray-100">
                            <div className="flex items-center gap-2.5 h-10 px-3 border border-gray-200 rounded-lg bg-gray-50 focus-within:border-(--colour-fsP2) focus-within:bg-white transition-colors">
                                <Search size={13} className="text-slate-400 shrink-0" />
                                <input
                                    type="text"
                                    value={state.searchQuery}
                                    onChange={e => update({ searchQuery: e.target.value })}
                                    placeholder="Search mobiles, laptops, tablets..."
                                    className="flex-1 bg-transparent text-sm font-medium text-slate-900 placeholder:text-slate-400 outline-none"
                                    autoFocus
                                />
                                {state.loading
                                    ? <Loader2 size={13} className="animate-spin text-(--colour-fsP2) shrink-0" />
                                    : state.searchQuery
                                        ? <button onClick={() => update({ searchQuery: "", selectItems: [] })}><X size={13} className="text-slate-400 hover:text-slate-700" /></button>
                                        : null}
                            </div>
                        </div>
                    </DrawerHeader>

                    {/* Results */}
                    <div className={`flex-1 overflow-y-auto ${noBar} px-5 py-3`}>
                        {state.selectItems.length > 0 ? (
                            <div className="space-y-1">
                                {state.selectItems.map(item => {
                                    const itemPrice    = getDisplayPrice(item);
                                    const itemOriginal = getPrice(item.price);
                                    const itemDiscount = itemOriginal > itemPrice && itemPrice > 0;
                                    const img          = getProductImage(item);
                                    return (
                                        <button
                                            key={item.id}
                                            onClick={() => handleProductSelect(item.slug)}
                                            className="group flex w-full items-center gap-3 px-3 py-3 rounded-xl border border-transparent hover:border-gray-200 hover:bg-gray-50 text-left transition-colors"
                                        >
                                            <div className="w-12 h-12 shrink-0 rounded-lg border border-gray-200 bg-gray-50 overflow-hidden">
                                                {img
                                                    ? <Image src={img} alt={item.name} width={48} height={48} className="object-contain p-1 w-full h-full" />
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
                                                    {itemDiscount && (
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
                            <div className="flex flex-col items-center justify-center min-h-[220px] text-center gap-3">
                                <div className="w-12 h-12 rounded-xl border border-gray-200 bg-gray-50 flex items-center justify-center">
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
                        {productImage
                            ? <Image src={productImage} alt={product.name || "Product"} fill sizes="200px" className="object-contain p-4" priority />
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
                                        const imgForColor = product.images?.find(img => img.color === color || img.custom_properties?.color === color);
                                        const src         = imgForColor?.thumb ?? imgForColor?.url ?? productImage;
                                        const active      = state.selectedColor === color;
                                        return (
                                            <button
                                                key={color}
                                                onClick={() => {
                                                    update({ selectedColor: color });
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
