"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  Drawer, DrawerContent, DrawerHeader,
  DrawerTitle, DrawerDescription,
} from "@/components/ui/drawer";
import {
  Search, X, Smartphone, Loader2, ChevronRight,
  Check, RefreshCw, Shield, ShoppingCart, Scale,
  Truck, Eye, Zap, Info,
} from "lucide-react";

import { useContextEmi } from "./emiContext";
import type { ProductDetails } from "@/app/types/ProductDetailsTypes";
import { ProductService } from "@/app/api/services/product.service";
import { useCartStore } from "@/app/context/CartContext";
import { useShallow } from "zustand/react/shallow";

interface ProductEMIUIProps {
  chooseProduct: (col: string) => void;
  setProductPrice: (price: number) => void;
  product: ProductDetails | null;
}

// ── helpers ───────────────────────────────────────────────────────────────────
const getPrice = (val: any) =>
  Number(typeof val === "object" ? val?.current : val) || 0;

export default function ProductEMIUI({
  chooseProduct,
  setProductPrice,
  product,
}: ProductEMIUIProps) {
  const [selectedColor, setSelectedColor] = useState("");
  const [selectItems, setSelectItems] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const { setEmiContextInfo } = useContextEmi();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedInsurance, setSelectedInsurance] = useState<string | null>(null);

  const { addToCompare, removeFromCompare, compareList, isInCompare } =
    useCartStore(
      useShallow((state) => ({
        addToCompare: state.addToCompare,
        removeFromCompare: state.removeFromCompare,
        compareList: state.compareItems,
        isInCompare: state.isInCompare,
      }))
    );

  const availableVariants =
    product?.variants?.filter((v) => v.quantity > 0) || [];
  const uniqueColors = Array.from(
    new Set(availableVariants.map((v) => v.attributes?.Color))
  ).filter(Boolean);

  // debounced search
  useEffect(() => {
    const id = setTimeout(() => {
      if (searchQuery.trim()) {
        setLoading(true);
        ProductService.searchProducts({ search: searchQuery.trim() })
          .then((res) => setSelectItems(res.data))
          .catch(console.error)
          .finally(() => setLoading(false));
      } else {
        setSelectItems([]);
      }
    }, 500);
    return () => clearTimeout(id);
  }, [searchQuery]);

  const handleProductSelect = async (slug: string) => {
    setLoading(true);
    try {
      const full = await ProductService.getProductBySlug(slug);
      if (full) {
        setEmiContextInfo((prev) => ({ ...prev, product: full as ProductDetails }));
        setProductPrice(getPrice(full.discounted_price) || getPrice(full.price));
        setIsDrawerOpen(false);
        setSearchQuery("");
        setSelectItems([]);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const closeDrawer = () => {
    setIsDrawerOpen(false);
    setSearchQuery("");
    setSelectItems([]);
  };

  const productPrice =
    getPrice(product?.discounted_price) || getPrice(product?.price);
  const originalPrice = getPrice(product?.price);
  const hasDiscount = originalPrice > productPrice && productPrice > 0;
  const discountPct = hasDiscount
    ? Math.round(((originalPrice - productPrice) / originalPrice) * 100)
    : 0;

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="w-full">

      {/* ── SEARCH DRAWER ─────────────────────────────────────────────── */}
      <Drawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
        <DrawerContent className="h-[82vh] max-w-2xl mx-auto rounded-t-2xl bg-white flex flex-col overflow-hidden p-0">

          {/* Header */}
          <DrawerHeader className="p-0 border-none shrink-0">
            <div className="flex items-center justify-between px-4 py-3.5 border-b border-slate-100">
              <DrawerTitle className="text-[14px] font-extrabold text-slate-800 flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-[var(--colour-fsP2)]/10 flex items-center justify-center">
                  <Search className="w-3.5 h-3.5 text-[var(--colour-fsP2)]" />
                </div>
                Search Products
              </DrawerTitle>
              <DrawerDescription className="sr-only">
                Find a product to calculate EMI.
              </DrawerDescription>
              <button
                onClick={closeDrawer}
                className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-colors"
              >
                <X className="w-3.5 h-3.5 text-slate-500" />
              </button>
            </div>

            {/* Search input */}
            <div className="px-4 py-3 border-b border-slate-100">
              <div className={cn(
                "flex items-center gap-2 bg-slate-50 border rounded-xl px-3 py-2.5 transition-all",
                "border-slate-200 focus-within:border-[var(--colour-fsP2)] focus-within:bg-white focus-within:ring-2 focus-within:ring-[var(--colour-fsP2)]/10"
              )}>
                <Search className="w-4 h-4 text-slate-400 shrink-0" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.stopPropagation()}
                  placeholder="Search mobiles, laptops, accessories…"
                  className="flex-1 bg-transparent border-none outline-none text-[13px] text-slate-800 placeholder-slate-400 font-medium"
                  autoFocus
                />
                {loading && (
                  <Loader2 className="w-4 h-4 text-[var(--colour-fsP2)] animate-spin shrink-0" />
                )}
                {searchQuery && !loading && (
                  <button
                    onClick={() => { setSearchQuery(""); setSelectItems([]); }}
                    className="w-5 h-5 rounded-full bg-slate-200 hover:bg-slate-300 flex items-center justify-center transition-colors shrink-0"
                  >
                    <X className="w-3 h-3 text-slate-500" />
                  </button>
                )}
              </div>
              {selectItems.length > 0 && (
                <p className="text-[11px] text-slate-400 mt-1.5 px-1">
                  {selectItems.length} result{selectItems.length !== 1 ? "s" : ""} found
                </p>
              )}
            </div>
          </DrawerHeader>

          {/* Results */}
          <div className="flex-1 overflow-y-auto px-4 py-3">
            {selectItems.length > 0 ? (
              <div className="space-y-1.5">
                {selectItems.map((item: any) => {
                  const itemPrice = getPrice(item.discounted_price) || getPrice(item.price);
                  const itemOriginal = getPrice(item.price);
                  const itemHasDiscount = itemOriginal > itemPrice && itemPrice > 0;
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleProductSelect(item.slug)}
                      className="w-full flex items-center gap-3 p-3 bg-white hover:bg-slate-50 rounded-xl border border-slate-100 hover:border-[var(--colour-fsP2)]/30 transition-all text-left group"
                    >
                      {/* Thumbnail */}
                      <div className="relative w-12 h-12 bg-slate-50 rounded-lg overflow-hidden shrink-0 border border-slate-100">
                        {item.image ? (
                          <Image
                            src={typeof item.image === "string" ? item.image : item.image?.thumb || ""}
                            alt={item.name}
                            fill
                            sizes="48px"
                            className="object-contain p-1 group-hover:scale-105 transition-transform"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Smartphone className="w-5 h-5 text-slate-300" />
                          </div>
                        )}
                      </div>
                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <p className="text-[13px] font-semibold text-slate-800 truncate group-hover:text-[var(--colour-fsP2)] transition-colors">
                          {item.name}
                        </p>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className="text-[12px] font-bold text-[var(--colour-fsP2)]">
                            Rs. {itemPrice.toLocaleString()}
                          </span>
                          {itemHasDiscount && (
                            <span className="text-[11px] text-slate-400 line-through">
                              Rs. {itemOriginal.toLocaleString()}
                            </span>
                          )}
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-[var(--colour-fsP2)] transition-colors shrink-0" />
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center py-12 text-center">
                <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center mb-3">
                  {searchQuery
                    ? <Search className="w-6 h-6 text-slate-400" />
                    : <Smartphone className="w-6 h-6 text-slate-400" />
                  }
                </div>
                <p className="text-[13px] font-bold text-slate-700">
                  {searchQuery ? "No results found" : "Search for a product"}
                </p>
                <p className="text-[11px] text-slate-400 mt-1 max-w-[200px]">
                  {searchQuery
                    ? "Try different keywords or check the spelling"
                    : "Type to search mobiles, laptops & more"}
                </p>
              </div>
            )}
          </div>

        </DrawerContent>
      </Drawer>

      {/* ── PRODUCT SELECTED ──────────────────────────────────────────── */}
      {product ? (
        <div className="bg-white">
          <div className="flex flex-col md:flex-row">

            {/* LEFT — image + info */}
            <div className="flex-1 p-4 md:p-5 space-y-4">

              {/* Image row */}
              <div className="flex gap-4 items-start">

                {/* Image */}
                <div className="relative w-40 h-40 sm:w-52 sm:h-52 shrink-0 bg-slate-50 rounded-xl border border-slate-100 p-2">
                  <Image
                    src={typeof product.image === "string" ? product.image : product.image?.full || ""}
                    alt={product.name || "Product"}
                    fill
                    sizes="(max-width:640px) 160px, 208px"
                    className="object-contain p-1"
                    priority
                  />
                  {/* Change product */}
                  <button
                    onClick={() => setIsDrawerOpen(true)}
                    className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-white border border-slate-200 shadow-sm hover:border-[var(--colour-fsP2)]/40 hover:text-[var(--colour-fsP2)] text-slate-400 flex items-center justify-center transition-colors"
                    title="Change Product"
                  >
                    <RefreshCw className="w-3 h-3" />
                  </button>
                  {product.emi_enabled === 1 && (
                    <span className="absolute bottom-2 left-2 text-[9px] font-bold bg-[var(--colour-fsP2)] text-white px-2 py-0.5 rounded-md">
                      EMI Available
                    </span>
                  )}
                </div>

                {/* Core info */}
                <div className="flex-1 min-w-0 space-y-2">
                  {product.brand?.name && (
                    <p className="text-[11px] font-bold text-[var(--colour-fsP2)] uppercase tracking-widest">
                      {product.brand.name}
                    </p>
                  )}
                  <h2 className="text-[15px] font-bold text-slate-800 leading-snug line-clamp-2">
                    {product.name}
                  </h2>

                  {/* Price */}
                  <div className="flex items-baseline gap-2 flex-wrap">
                    <span className="text-[20px] font-extrabold text-slate-900 tabular-nums">
                      Rs. {productPrice.toLocaleString()}
                    </span>
                    {hasDiscount && (
                      <>
                        <span className="text-[12px] text-slate-400 line-through tabular-nums">
                          Rs. {originalPrice.toLocaleString()}
                        </span>
                        <span className="text-[11px] font-bold text-[var(--colour-fsP2)] bg-[var(--colour-fsP2)]/8 px-1.5 py-0.5 rounded-md">
                          {discountPct}% OFF
                        </span>
                      </>
                    )}
                  </div>

                  {/* Colors */}
                  {uniqueColors.length > 0 && (
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                        Color
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {uniqueColors.map((color: any) => {
                          const ci = product.images?.find(
                            (img) => img.color === color || img.custom_properties?.color === color
                          );
                          const src = ci?.thumb || ci?.url || (typeof product.image === "string" ? product.image : product.image?.full || "");
                          const isSel = selectedColor === color;
                          return (
                            <button
                              key={color}
                              onClick={() => { setSelectedColor(color); chooseProduct(color); }}
                              title={color}
                              className={cn(
                                "relative w-9 h-9 rounded-lg border-2 overflow-hidden transition-all",
                                isSel
                                  ? "border-[var(--colour-fsP2)] shadow-sm"
                                  : "border-slate-200 hover:border-[var(--colour-fsP2)]/50"
                              )}
                            >
                              <Image src={src} alt={color} fill sizes="36px" className="object-cover" />
                              {isSel && (
                                <div className="absolute inset-0 bg-[var(--colour-fsP2)]/20 flex items-center justify-center">
                                  <div className="w-4 h-4 rounded-full bg-[var(--colour-fsP2)] flex items-center justify-center">
                                    <Check className="w-2.5 h-2.5 text-white" strokeWidth={3} />
                                  </div>
                                </div>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {(product as any).short_description && (
                    <p className="text-[11px] text-slate-500 leading-relaxed line-clamp-2">
                      {(product as any).short_description}
                    </p>
                  )}
                </div>
              </div>

              {/* Highlights */}
              {product.highlights && (
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1 mb-1.5">
                    <Zap className="w-3 h-3 text-amber-500" /> Highlights
                  </p>
                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1">
                    {product.highlights
                      .split(/[,\n]/).map(h => h.trim()).filter(Boolean).slice(0, 6)
                      .map((h, i) => (
                        <li key={i} className="flex items-start gap-1.5 text-[11px] text-slate-600">
                          <Check className="w-3 h-3 text-[var(--colour-fsP2)] mt-0.5 shrink-0" />
                          <span className="line-clamp-1">{h}</span>
                        </li>
                      ))}
                  </ul>
                </div>
              )}

              {/* Key specs */}
              {product.attributes?.product_attributes &&
                Object.keys(product.attributes.product_attributes).length > 0 && (
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1 mb-1.5">
                      <Info className="w-3 h-3 text-[var(--colour-fsP2)]" /> Key Specs
                    </p>
                    <div className="grid grid-cols-2 gap-1.5">
                      {Object.entries(product.attributes.product_attributes)
                        .slice(0, 4)
                        .map(([key, value]) => (
                          <div key={key} className="bg-slate-50 rounded-lg px-3 py-2 border border-slate-100">
                            <p className="text-[9px] font-semibold text-slate-400 uppercase tracking-wide">{key}</p>
                            <p className="text-[11px] font-bold text-slate-800 line-clamp-1 mt-0.5">{value as any}</p>
                          </div>
                        ))}
                    </div>
                  </div>
                )}

              {/* Bottom links */}
              <div className="flex items-center gap-3 pt-0.5">
                <Link href={`/products/${product.slug}`}
                  className="inline-flex items-center gap-1 text-[11px] font-semibold text-[var(--colour-fsP2)] hover:opacity-80 transition-opacity group/link">
                  <Eye className="w-3 h-3" />
                  View Details
                  <ChevronRight className="w-3 h-3 group-hover/link:translate-x-0.5 transition-transform" />
                </Link>
                <span className="text-slate-200">|</span>
                <button
                  onClick={() => setIsDrawerOpen(true)}
                  className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-500 hover:text-[var(--colour-fsP2)] transition-colors"
                >
                  <RefreshCw className="w-3 h-3" />
                  Change Product
                </button>
              </div>
            </div>

            {/* RIGHT — plans + actions */}
            <div className="w-full md:w-[320px] lg:w-[360px] border-t md:border-t-0 md:border-l border-slate-100 bg-slate-50/60 p-4 flex flex-col gap-3">

              {/* Protection plans */}
              <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
                <div className="flex items-center gap-2 px-3 py-2.5 border-b border-slate-100">
                  <Shield className="w-3.5 h-3.5 text-[var(--colour-fsP2)]" />
                  <span className="text-[11px] font-extrabold text-slate-700 uppercase tracking-wide">
                    Protection Plans
                  </span>
                </div>
                <div className="p-2 space-y-0.5">
                  {[
                    { key: "screen", label: "Screen Protection", desc: "1 yr accidental screen damage", pct: 0.03 },
                    { key: "warranty", label: "Extended Warranty", desc: "+1 yr manufacturer warranty", pct: 0.05 },
                    { key: "complete", label: "Complete Protection", desc: "Screen + warranty + accidental", pct: 0.08 },
                  ].map((plan) => (
                    <label
                      key={plan.key}
                      className={cn(
                        "flex items-center gap-2 px-2.5 py-1.5 rounded-lg cursor-pointer transition-all",
                        selectedInsurance === plan.key
                          ? "bg-[var(--colour-fsP2)]/6 border border-[var(--colour-fsP2)]/25"
                          : "hover:bg-slate-50 border border-transparent"
                      )}
                    >
                      <input
                        type="radio"
                        name="insurance"
                        checked={selectedInsurance === plan.key}
                        onChange={() =>
                          setSelectedInsurance((prev) =>
                            prev === plan.key ? null : plan.key
                          )
                        }
                        className="accent-[var(--colour-fsP2)] w-3 h-3 shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-[10px] font-bold text-slate-800 leading-tight">{plan.label}</p>
                        <p className="text-[9px] text-slate-400">{plan.desc}</p>
                      </div>
                      <span className="text-[10px] font-bold text-[var(--colour-fsP2)] whitespace-nowrap tabular-nums">
                        Rs. {Math.round(productPrice * plan.pct).toLocaleString()}
                      </span>
                    </label>
                  ))}
                </div>
                {selectedInsurance && (
                  <div className="px-3 pb-2.5">
                    <p className="text-[10px] font-semibold text-[var(--colour-fsP2)] flex items-center gap-1 bg-[var(--colour-fsP2)]/6 rounded-lg px-2.5 py-1.5">
                      <Check className="w-3 h-3" /> Plan included in your EMI
                    </p>
                  </div>
                )}
              </div>

              {/* Exchange */}
              <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
                <div className="flex items-center gap-2 px-3 py-2.5 border-b border-slate-100">
                  <RefreshCw className="w-3.5 h-3.5 text-amber-500" />
                  <span className="text-[11px] font-extrabold text-slate-700 uppercase tracking-wide">
                    Exchange Plan
                  </span>
                </div>
                <div className="p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[11px] font-bold text-slate-700">Trade-in your old device</p>
                      <p className="text-[10px] text-slate-400">Get value up to</p>
                    </div>
                    <span className="text-[15px] font-extrabold text-amber-500 tabular-nums">
                      Rs. {Math.round(productPrice * 0.15).toLocaleString()}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-500 flex items-center gap-1">
                    <Check className="w-3 h-3 text-amber-500 shrink-0" />
                    Instant evaluation · Free pickup · Reduce your EMI
                  </p>
                  <Link
                    href="/exchangeProducts"
                    className="flex items-center justify-center gap-1.5 w-full text-[11px] font-bold text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-lg py-1.5 transition-colors"
                  >
                    <RefreshCw className="w-3 h-3" />
                    Check Exchange Value
                    <ChevronRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>

              {/* CTA buttons */}
              <div className="flex gap-2 mt-auto">
                <Link
                  href={`/products/${product.slug}`}
                  className="flex-1 flex items-center justify-center gap-1.5 bg-[var(--colour-fsP2)] hover:bg-[var(--colour-fsP2)]/90 text-white font-bold text-[12px] py-2.5 rounded-lg shadow-sm transition-all"
                >
                  <ShoppingCart className="w-3.5 h-3.5" />
                  Buy Now
                </Link>
                <button
                  onClick={() => {
                    if (!product) return;
                    isInCompare(Number(product.id))
                      ? removeFromCompare(Number(product.id))
                      : addToCompare(product);
                  }}
                  className={cn(
                    "flex items-center justify-center gap-1 text-[12px] font-semibold py-2.5 px-3 rounded-lg border transition-all",
                    isInCompare(Number(product.id))
                      ? "border-[var(--colour-fsP2)] bg-[var(--colour-fsP2)]/5 text-[var(--colour-fsP2)]"
                      : "border-slate-200 bg-white text-slate-600 hover:border-[var(--colour-fsP2)]/40 hover:text-[var(--colour-fsP2)]"
                  )}
                >
                  <Scale className="w-3.5 h-3.5" />
                  {isInCompare(Number(product.id)) ? "Added" : "Compare"}
                </button>
                <Link
                  href={`/products/${product.slug}`}
                  className="flex items-center justify-center gap-1 text-[12px] font-semibold py-2.5 px-3 rounded-lg border border-slate-200 bg-white text-slate-600 hover:border-[var(--colour-fsP2)]/40 hover:text-[var(--colour-fsP2)] transition-all"
                >
                  <Eye className="w-3.5 h-3.5" />
                </Link>
              </div>

              {/* Delivery badge */}
              <div className="flex items-center gap-2 text-[10px] text-slate-500 font-medium bg-white rounded-lg px-3 py-2 border border-slate-100">
                <Truck className="w-3 h-3 text-[var(--colour-fsP2)] shrink-0" />
                Free delivery across Nepal ·{" "}
                <span className="text-[var(--colour-fsP2)] font-bold">Fatafat Delivery</span>
              </div>

            </div>
          </div>
        </div>

      ) : (
        /* ── EMPTY STATE ────────────────────────────────────────────── */
        <button
          onClick={() => setIsDrawerOpen(true)}
          className="w-full group flex flex-col items-center justify-center gap-4 py-12 px-6 text-center bg-white hover:bg-slate-50/80 transition-colors border-0"
        >
          <div className="w-14 h-14 bg-[var(--colour-fsP2)]/8 rounded-2xl flex items-center justify-center group-hover:bg-[var(--colour-fsP2)]/12 transition-colors">
            <Search className="w-6 h-6 text-[var(--colour-fsP2)]" />
          </div>
          <div>
            <h3 className="text-[15px] font-bold text-slate-800 mb-1">Select a Product</h3>
            <p className="text-[12px] text-slate-500 max-w-[240px] mx-auto">
              Search and select a product to calculate EMI options with live bank rates
            </p>
          </div>
          <span className="inline-flex items-center gap-1.5 text-[12px] font-bold text-white bg-[var(--colour-fsP2)] hover:bg-[var(--colour-fsP2)]/90 px-5 py-2 rounded-lg shadow-sm transition-colors">
            <Search className="w-3.5 h-3.5" />
            Search Products
          </span>
        </button>
      )}
    </div>
  );
}