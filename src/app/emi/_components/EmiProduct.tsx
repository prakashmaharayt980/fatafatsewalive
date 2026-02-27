"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";
import { Search, X, Smartphone, Loader2, ChevronRight, Check, RefreshCw, Shield, ShoppingCart, Scale, Truck, Eye, Zap, Info } from "lucide-react";
import RemoteServices from "@/app/api/remoteservice";
import { useContextEmi } from "./emiContext";
import { ProductDetails } from "@/app/types/ProductDetailsTypes";
import { useCompare } from "@/app/context/CompareContext";

interface ProductEMIUIProps {
  chooseProduct: (col: string) => void;
  setProductPrice: (price: number) => void;
  product: ProductDetails | null;
}

export default function ProductEMIUI({ chooseProduct, setProductPrice, product }: ProductEMIUIProps) {
  const [selectedColor, setSelectedColor] = useState<string>("");
  const [selectItems, setSelectItems] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const { setEmiContextInfo } = useContextEmi();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedInsurance, setSelectedInsurance] = useState<string | null>(null);
  const { addToCompare, removeFromCompare, compareList } = useCompare();
  const isInCompare = compareList?.some(i => i.id === Number(product?.id));

  // Filter available variants (quantity > 0)
  const availableVariants = product?.variants?.filter((variant) => variant.quantity > 0) || [];

  // Get unique colors
  const uniqueColors = Array.from(new Set(availableVariants.map((v) => v.attributes?.Color))).filter(Boolean);

  // Fetch products based on search query
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (searchQuery.trim()) {
        setLoading(true);
        RemoteServices.searchProducts({ search: searchQuery.trim() })
          .then((res) => {
            setSelectItems(res.data);
          })
          .catch((e) => console.log("error", e))
          .finally(() => setLoading(false));
      } else {
        setSelectItems([]);
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  const handleProductSelect = async (productSlug: string) => {
    setLoading(true);
    try {
      const fullProduct = await RemoteServices.getProductBySlug(productSlug);
      if (fullProduct) {
        setEmiContextInfo((prev) => ({
          ...prev,
          product: fullProduct as ProductDetails
        }));
        setProductPrice(Number(fullProduct.discounted_price || fullProduct.price));
        setIsDrawerOpen(false);
        setSearchQuery("");
        setSelectItems([]);
      }
    } catch (error) {
      console.error("Failed to fetch full product details", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full">
      {/* Drawer for Product Search */}
      <Drawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
        <DrawerContent className="h-[80vh] max-w-5xl mx-auto py-0 rounded-t-2xl bg-[var(--colour-bg4)] flex flex-col overflow-hidden">
          {/* Themed Header */}
          <DrawerHeader className="m-0 py-0 px-0 border-none bg-gradient-to-r from-[var(--colour-fsP2)] to-[#1565C0]">
            <div className=" px-5 py-3.5 flex items-center justify-between">
              <DrawerTitle className="text-base font-bold text-white flex items-center gap-2.5">
                <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center backdrop-blur-sm">
                  <Search className="w-4 h-4 text-white" />
                </div>
                Search Products for EMI
              </DrawerTitle>
              <button onClick={() => setIsDrawerOpen(false)} className="w-8 h-8 rounded-lg bg-white/15 hover:bg-white/25 flex items-center justify-center transition-colors">
                <X className="w-4 h-4 text-white" />
              </button>
            </div>
          </DrawerHeader>

          <div className="flex-1 flex flex-col px-4 pt-4 pb-2 gap-3 overflow-hidden">
            {/* Themed Search Input */}
            <div className="relative">
              <div className={cn(
                "flex items-center rounded-xl bg-white border-2 transition-all shadow-sm",
                "border-[var(--colour-fsP2)]/20 focus-within:border-[var(--colour-fsP2)] focus-within:shadow-md focus-within:ring-3 focus-within:ring-[var(--colour-fsP2)]/10"
              )}>
                <Search className="ml-3.5 w-4.5 h-4.5 text-[var(--colour-fsP2)]" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.stopPropagation()}
                  placeholder="Search mobiles, laptops, accessories..."
                  className="w-full px-3 py-3 bg-transparent border-none focus:outline-none text-sm text-gray-900 placeholder-gray-400 font-medium"
                  autoFocus
                />
                {searchQuery && (
                  <button
                    onClick={() => { setSearchQuery(""); setSelectItems([]); }}
                    className="mr-2 p-1.5 rounded-full bg-[var(--colour-fsP2)]/10 hover:bg-[var(--colour-fsP2)]/20 text-[var(--colour-fsP2)] transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
                {loading && <Loader2 className="mr-3.5 h-4 w-4 text-[var(--colour-fsP2)] animate-spin" />}
              </div>
            </div>

            {/* Results Count */}
            {selectItems.length > 0 && (
              <p className="text-xs font-semibold text-[var(--colour-text3)] px-1">
                {selectItems.length} product{selectItems.length > 1 ? 's' : ''} found
              </p>
            )}

            {/* Results List */}
            <div className="flex-1 overflow-y-auto custom-scrollbar">
              {selectItems.length > 0 ? (
                <div className="space-y-2">
                  {selectItems.map((product: any) => {
                    const hasDiscount = product.discounted_price && Number(product.discounted_price) < Number(product.price)
                    return (
                      <div
                        key={product.id}
                        onClick={() => handleProductSelect(product.slug)}
                        className="flex items-center gap-3.5 p-3 bg-white hover:bg-blue-50/60 rounded-xl cursor-pointer transition-all group border border-[var(--colour-border3)] hover:border-[var(--colour-fsP2)]/40 hover:shadow-sm"
                      >
                        <div className="relative w-14 h-14 bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg overflow-hidden flex-shrink-0 border border-gray-100">
                          {product.image && (product.image.thumb || typeof product.image === 'string') ? (
                            <Image
                              src={typeof product.image === 'string' ? product.image : product.image.thumb || ""}
                              alt={product.name}
                              fill
                              className="object-contain p-1.5 group-hover:scale-110 transition-transform"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-300">
                              <Smartphone className="w-6 h-6" />
                            </div>
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-semibold text-[var(--colour-text2)] truncate group-hover:text-[var(--colour-fsP2)] transition-colors">
                            {product.name}
                          </h4>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-sm font-bold text-[var(--colour-fsP2)]">
                              Rs. {Number(hasDiscount ? product.discounted_price : product.price).toLocaleString()}
                            </span>
                            {hasDiscount && (
                              <span className="text-[11px] text-[var(--colour-text3)] line-through">
                                Rs. {Number(product.price).toLocaleString()}
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="w-8 h-8 rounded-lg bg-[var(--colour-fsP2)]/8 group-hover:bg-[var(--colour-fsP2)] flex items-center justify-center transition-all shrink-0">
                          <ChevronRight className="w-4 h-4 text-[var(--colour-fsP2)] group-hover:text-white transition-colors" />
                        </div>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center">
                  {searchQuery ? (
                    <>
                      <div className="w-16 h-16 bg-[var(--colour-fsP2)]/10 rounded-full flex items-center justify-center mb-4">
                        <Search className="w-7 h-7 text-[var(--colour-fsP2)] stroke-[1.5]" />
                      </div>
                      <p className="text-sm font-bold text-[var(--colour-text2)]">No products found</p>
                      <p className="text-xs text-[var(--colour-text3)] mt-1">Try different keywords or check spelling</p>
                    </>
                  ) : (
                    <>
                      <div className="w-16 h-16 bg-[var(--colour-fsP2)]/10 rounded-full flex items-center justify-center mb-4">
                        <Smartphone className="w-7 h-7 text-[var(--colour-fsP2)] stroke-[1.5]" />
                      </div>
                      <p className="text-sm font-bold text-[var(--colour-text2)]">Find your product</p>
                      <p className="text-xs text-[var(--colour-text3)] mt-1 max-w-[200px] text-center">Search for any product to calculate EMI options</p>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </DrawerContent>
      </Drawer>

      {/* Main Content Area */}
      {product ? (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="flex flex-col md:flex-row">

            {/* ── LEFT: Product Image + Info ── */}
            <div className="flex-1 p-5 md:p-6 space-y-5">

              {/* Top row: Image + Core Info */}
              <div className="flex gap-5 items-start">
                {/* Product Image - Larger */}
                <div className="relative w-44 h-44 sm:w-60 sm:h-60 shrink-0 bg-gradient-to-br from-gray-50 to-gray-100/50 rounded-xl p-3 border border-gray-100">
                  <Image
                    src={typeof product.image === 'string' ? product.image : product.image?.full || ""}
                    alt={product.name || "Product"}
                    fill
                    className="object-contain p-2"
                    priority

                  />
                  <button
                    onClick={() => setIsDrawerOpen(true)}
                    className="absolute -top-1.5 -right-1.5 p-1.5 rounded-full bg-white border border-gray-200 shadow-sm hover:bg-gray-50 text-gray-400 hover:text-[var(--colour-fsP2)] transition-colors"
                    title="Change Product"
                  >
                    <RefreshCw className="w-3 h-3" />
                  </button>
                  {product.emi_enabled === 1 && (
                    <span className="absolute bottom-2 left-2 text-[9px] font-bold bg-emerald-500 text-white px-2 py-0.5 rounded-md">
                      EMI Available
                    </span>
                  )}
                </div>

                {/* Product Info */}
                <div className="flex-1 min-w-0 space-y-2.5">
                  {/* Brand */}
                  {product.brand?.name && (
                    <span className="text-[12px] font-bold text-[var(--colour-fsP2)] uppercase tracking-wider">
                      {product.brand.name}
                    </span>
                  )}

                  {/* Name */}
                  <h2 className="text-base sm:text-lg font-bold text-gray-900 leading-snug line-clamp-2">
                    {product.name}
                  </h2>

                  {/* Price Section */}
                  <div className="flex items-baseline gap-2 flex-wrap">
                    <span className="text-xl font-extrabold text-gray-900">
                      Rs. {(product.discounted_price || product.price).toLocaleString()}
                    </span>
                    {product.price && product.discounted_price && product.discounted_price < product.price && (
                      <>
                        <span className="text-sm text-gray-400 line-through">
                          Rs. {product.price.toLocaleString()}
                        </span>
                        <span className="text-[12px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-md">
                          {Math.round(((product.price - product.discounted_price) / product.price) * 100)}% OFF
                        </span>
                      </>
                    )}
                  </div>

                  {/* Color Swatches */}
                  {uniqueColors.length > 0 && (
                    <div className="space-y-1.5">
                      <label className="text-[12px] font-semibold text-gray-500 uppercase tracking-wider">Colors</label>
                      <div className="flex flex-wrap gap-2">
                        {uniqueColors.map((color: any) => {
                          const colorImage = product.images?.find((img) => img.color === color || img.custom_properties?.color === color);
                          const variantImage = colorImage?.thumb || colorImage?.url || (typeof product.image === 'string' ? product.image : product.image?.full || "");

                          return (
                            <button
                              key={color}
                              onClick={() => {
                                setSelectedColor(color);
                                chooseProduct(color);
                              }}
                              className="relative focus:outline-none group/color"
                              title={color}
                            >
                              <div className={cn(
                                "relative w-10 h-10 rounded-lg overflow-hidden transition-all border-2",
                                selectedColor === color
                                  ? "border-[var(--colour-fsP2)] shadow-md shadow-[var(--colour-fsP2)]/20 scale-105"
                                  : "border-gray-200 hover:border-[var(--colour-fsP2)]/50"
                              )}>
                                <Image
                                  src={variantImage}
                                  alt={color}
                                  fill
                                  className="object-cover"

                                />
                                {selectedColor === color && (
                                  <div className="absolute inset-0 bg-[var(--colour-fsP2)]/15 flex items-center justify-center">
                                    <div className="w-4 h-4 rounded-full bg-[var(--colour-fsP2)] flex items-center justify-center">
                                      <Check className="w-2.5 h-2.5 text-white" strokeWidth={3} />
                                    </div>
                                  </div>
                                )}
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Short Description */}
                  {product.short_description && (
                    <p className="text-[12px] text-gray-500 leading-relaxed line-clamp-2">
                      {product.short_description}
                    </p>
                  )}
                </div>
              </div>

              {/* Highlights */}
              {product.highlights && (
                <div className="space-y-2">
                  <h4 className="text-[12px] font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
                    <Zap className="w-3 h-3 text-amber-500" /> Highlights
                  </h4>
                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1">
                    {product.highlights
                      .split(/[,\n]/)
                      .map(h => h.trim())
                      .filter(Boolean)
                      .slice(0, 6)
                      .map((highlight, i) => (
                        <li key={i} className="flex items-start gap-1.5 text-[11px] text-gray-600">
                          <Check className="w-3 h-3 text-emerald-500 mt-0.5 shrink-0" />
                          <span className="line-clamp-1">{highlight}</span>
                        </li>
                      ))}
                  </ul>
                </div>
              )}

              {/* Key Specifications */}
              {product.attributes?.product_attributes && Object.keys(product.attributes.product_attributes).length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-[12px] font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
                    <Info className="w-3 h-3 text-[var(--colour-fsP2)]" /> Key Specifications
                  </h4>
                  <div className="grid grid-cols-2 gap-2">
                    {Object.entries(product.attributes.product_attributes)
                      .slice(0, 4)
                      .map(([key, value]) => (
                        <div key={key} className="bg-gray-50 rounded-lg px-3 py-2 border border-gray-100">
                          <p className="text-[9px] font-semibold text-gray-400 uppercase tracking-wide">{key}</p>
                          <p className="text-[11px] font-bold text-gray-800 line-clamp-1 mt-0.5">{value}</p>
                        </div>
                      ))}
                  </div>
                </div>
              )}



              {/* Bottom Actions */}
              <div className="flex items-center gap-3 pt-1">
                <Link
                  href={`/products/${product.slug}`}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--colour-fsP2)] hover:text-[var(--colour-fsP2)]/80 transition-colors group/link"
                >
                  <Eye className="w-3.5 h-3.5" />
                  View Full Details
                  <ChevronRight className="w-3 h-3 group-hover/link:translate-x-0.5 transition-transform" />
                </Link>
                <span className="text-gray-200">|</span>
                <button
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-[var(--colour-fsP2)] transition-colors"
                  onClick={() => setIsDrawerOpen(true)}
                >
                  <RefreshCw className="w-3 h-3" />
                  Change Product
                </button>
              </div>
            </div>

            {/* ── RIGHT: Plans + Actions ── */}
            <div className="w-full md:w-[340px] lg:w-[380px] border-t md:border-t-0 md:border-l border-gray-100 bg-gray-50/50 p-4 md:p-5 flex flex-col gap-3">

              {/* Protection Plans Card */}
              <div className="bg-white rounded-xl border border-[var(--colour-fsP2)]/15 shadow-sm overflow-hidden">
                <div className="bg-gradient-to-r from-[var(--colour-fsP2)] to-[#1a5fb4] px-3 py-2 flex items-center gap-2">
                  <Shield className="w-3.5 h-3.5 text-white" />
                  <h4 className="text-[12px] font-bold text-white tracking-wider uppercase">Protection Plans</h4>
                </div>
                <div className="p-2 space-y-0.5">
                  {[
                    { key: 'screen', label: 'Screen Protection', desc: '1 yr accidental screen damage', pct: 0.03 },
                    { key: 'warranty', label: 'Extended Warranty', desc: '+1 yr manufacturer warranty', pct: 0.05 },
                    { key: 'complete', label: 'Complete Protection', desc: 'Screen + warranty + accidental', pct: 0.08 },
                  ].map(plan => (
                    <label
                      key={plan.key}
                      className={cn(
                        "flex items-center gap-2 px-2.5 py-1.5 rounded-lg cursor-pointer transition-all",
                        selectedInsurance === plan.key
                          ? "bg-[var(--colour-fsP2)]/8 border border-[var(--colour-fsP2)]/30"
                          : "hover:bg-gray-50 border border-transparent"
                      )}
                    >
                      <input
                        type="radio"
                        name="insurance"
                        checked={selectedInsurance === plan.key}
                        onChange={() => setSelectedInsurance(prev => prev === plan.key ? null : plan.key)}
                        className="accent-[var(--colour-fsP2)] w-3 h-3 shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-[10px] font-bold text-gray-800 leading-tight">{plan.label}</p>
                        <p className="text-[9px] text-gray-400">{plan.desc}</p>
                      </div>
                      <span className="text-[10px] font-bold text-[var(--colour-fsP2)] whitespace-nowrap">
                        Rs. {Math.round((product?.discounted_price || product?.price || 0) * plan.pct).toLocaleString()}
                      </span>
                    </label>
                  ))}
                </div>
                {selectedInsurance && (
                  <div className="px-3 pb-2">
                    <p className="text-[9px] text-emerald-600 font-semibold flex items-center gap-1 bg-emerald-50 rounded-md px-2 py-1">
                      <Check className="w-2.5 h-2.5" /> Plan included in your EMI
                    </p>
                  </div>
                )}
              </div>

              {/* Exchange Plan Card */}
              <div className="bg-white rounded-xl border border-amber-200/60 shadow-sm overflow-hidden">
                <div className="bg-gradient-to-r from-amber-500 to-orange-500 px-3 py-2 flex items-center gap-2">
                  <RefreshCw className="w-3.5 h-3.5 text-white" />
                  <h4 className="text-[10px] font-bold text-white tracking-wider uppercase">Exchange Plan</h4>
                </div>
                <div className="p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[10px] font-bold text-gray-800">Trade-in your old device</p>
                      <p className="text-[9px] text-gray-400">Get value up to</p>
                    </div>
                    <span className="text-sm font-extrabold text-amber-600">
                      Rs. {Math.round((product?.discounted_price || product?.price || 0) * 0.15).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[9px] text-gray-500">
                    <Check className="w-2.5 h-2.5 text-amber-500" />
                    <span>Instant evaluation · Free pickup · Reduce your EMI</span>
                  </div>
                  <Link
                    href="/exchangeProducts"
                    className="flex items-center justify-center gap-1.5 w-full text-[10px] font-bold text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-lg py-1.5 transition-colors"
                  >
                    <RefreshCw className="w-3 h-3" />
                    Check Exchange Value
                    <ChevronRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>

              {/* Action Buttons — grouped */}
              <div className="flex gap-2 mt-auto">
                <Link
                  href={`/products/${product?.slug}`}
                  className="flex-1 flex items-center justify-center gap-1.5 bg-[var(--colour-fsP2)] hover:bg-[var(--colour-fsP2)]/90 text-white font-bold text-xs py-2.5 rounded-lg shadow-sm shadow-[var(--colour-fsP2)]/20 hover:shadow-md transition-all"
                >
                  <ShoppingCart className="w-3.5 h-3.5" /> Buy Now
                </Link>
                <button
                  onClick={() => {
                    if (!product) return;
                    const isIn = compareList?.some(i => i.id === Number(product.id));
                    if (isIn) removeFromCompare(Number(product.id));
                    else addToCompare(product);
                  }}
                  className={cn(
                    "flex items-center justify-center gap-1 text-xs font-semibold py-2.5 px-3.5 rounded-lg border transition-all",
                    isInCompare
                      ? "border-[var(--colour-fsP2)] bg-[var(--colour-fsP2)]/5 text-[var(--colour-fsP2)]"
                      : "border-gray-200 bg-white text-gray-600 hover:border-[var(--colour-fsP2)]/40 hover:text-[var(--colour-fsP2)]"
                  )}
                >
                  <Scale className="w-3.5 h-3.5" />
                  {isInCompare ? 'Added' : 'Compare'}
                </button>
                <Link
                  href={`/products/${product?.slug}`}
                  className="flex items-center justify-center gap-1 text-xs font-semibold py-2.5 px-3.5 rounded-lg border border-gray-200 bg-white text-gray-600 hover:border-[var(--colour-fsP2)]/40 hover:text-[var(--colour-fsP2)] transition-all"
                >
                  <Eye className="w-3.5 h-3.5" />
                  Details
                </Link>
              </div>

              {/* Delivery */}
              <div className="flex items-center gap-2 text-[10px] text-gray-500 font-medium bg-emerald-50/50 rounded-lg px-2.5 py-1.5 border border-emerald-100">
                <Truck className="w-3 h-3 text-emerald-500 shrink-0" />
                <span>Free delivery across Nepal · <span className="text-emerald-600 font-semibold">Fatafat Delivery</span></span>
              </div>
            </div>

          </div>
        </div>
      ) : (

        <div
          onClick={() => setIsDrawerOpen(true)}
          className="group overflow-hidden  border-none cursor-pointer   hover:shadow-[var(--colour-fsP2)]/10 transition-all duration-300 min-h-[240px] flex flex-col items-center justify-center p-6 text-center border border-[var(--colour-fsP2)]/20 hover:border-[var(--colour-fsP2)]/40"
        >
          <div className="w-16 h-16 bg-[var(--colour-fsP2)]/10 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 group-hover:bg-[var(--colour-fsP2)]/15 transition-all">
            <Search className="w-7 h-7 text-[var(--colour-fsP2)]" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-1.5">Select a Product</h3>
          <p className="text-sm text-gray-500 max-w-xs mx-auto mb-5">
            Search and select to calculate EMI details with bank rates
          </p>
          <Button className="bg-[var(--colour-fsP2)] hover:bg-[var(--colour-fsP2)]/90 text-white rounded-lg px-6 py-2 font-semibold shadow-md shadow-[var(--colour-fsP2)]/25 hover:shadow-lg hover:shadow-[var(--colour-fsP2)]/30 text-sm transition-all">
            Search Products
          </Button>
        </div>
      )}

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 5px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background-color: #e2e8f0;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background-color: #cbd5e1;
        }
      `}</style>
    </div>
  );
}