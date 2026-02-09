"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";
import { Search, X, Smartphone, Loader2, ChevronRight, Check, RefreshCw } from "lucide-react";
import RemoteServices from "@/app/api/remoteservice";
import { useContextEmi } from "./emiContext";
import { ProductDetails } from "@/app/types/ProductDetailsTypes";

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
        <DrawerContent className="h-[80vh] max-w-5xl mx-auto p-1  rounded-t-2xl bg-white flex flex-col">
          {/* Compact Header */}
          <DrawerHeader className="px-4 border-b border-gray-100">
            <DrawerTitle className="text-lg font-semibold text-[var(--colour-fsP2)] flex items-center gap-2">
              <Search className="w-4 h-4 text-[var(--colour-fsP2)]" />
              Search Products
            </DrawerTitle>
          </DrawerHeader>

          <div className="flex-1 flex flex-col p-2 gap-3 overflow-hidden">
            {/* Compact Search Input */}
            <div className="relative">
              <div className={cn(
                "flex items-center rounded-xl bg-gray-50 transition-all",
                "focus-within:bg-white focus-within:shadow-md focus-within:ring-2 focus-within:ring-[var(--colour-fsP2)]/20"
              )}>
                <Search className="ml-3 w-4 h-4 text-[var(--colour-fsP2)]" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.stopPropagation()}
                  placeholder="Search mobiles, laptops..."
                  className="w-full px-3 py-2.5 bg-transparent border-none focus:outline-none text-sm text-gray-900 placeholder-gray-400"
                  autoFocus
                />
                {searchQuery && (
                  <button
                    onClick={() => { setSearchQuery(""); setSelectItems([]); }}
                    className="mr-2 p-1 rounded-full bg-gray-200 hover:bg-gray-300 transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
                {loading && <Loader2 className="mr-3 h-4 w-4 text-[var(--colour-fsP2)] animate-spin" />}
              </div>
            </div>

            {/* Compact Results List */}
            <div className="flex-1 overflow-y-auto -mx-4 px-4 custom-scrollbar">
              {selectItems.length > 0 ? (
                <div className="space-y-2">
                  {selectItems.map((product: any) => (
                    <div
                      key={product.id}
                      onClick={() => handleProductSelect(product.slug)}
                      className="flex items-center gap-3 p-2.5 bg-gray-50 hover:bg-[var(--colour-fsP2)]/5 rounded-lg cursor-pointer transition-colors group border border-transparent hover:border-[var(--colour-fsP2)]/20"
                    >
                      <div className="relative w-12 h-12 bg-white rounded-md overflow-hidden flex-shrink-0">
                        {product.image && (product.image.thumb || typeof product.image === 'string') ? (
                          <Image
                            src={typeof product.image === 'string' ? product.image : product.image.thumb || ""}
                            alt={product.name}
                            fill
                            className="object-contain p-1"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-300">
                            <Smartphone className="w-5 h-5" />
                          </div>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-medium text-gray-900 truncate">
                          {product.name}
                        </h4>
                        <span className="text-xs font-bold text-[var(--colour-fsP2)]">
                          Rs {Number(product.price).toLocaleString()}
                        </span>
                      </div>

                      <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-[var(--colour-fsP2)]" />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-gray-400">
                  {searchQuery ? (
                    <>
                      <Search className="w-12 h-12 mb-3 stroke-[1.5]" />
                      <p className="text-sm font-medium">No products found</p>
                      <p className="text-xs mt-1">Try different keywords</p>
                    </>
                  ) : (
                    <>
                      <Smartphone className="w-12 h-12 mb-3 stroke-[1.5]" />
                      <p className="text-sm font-medium">Start searching</p>
                      <p className="text-xs mt-1">Find your product</p>
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
        <div className="flex flex-col md:flex-row gap-4 items-start">
          {/* Compact Product Image Card */}
          <div className="w-full md:w-4/5 bg-white p-4 rounded relative group ">
            <div className="relative w-full aspect-square max-w-[200px] mx-auto">
              <Image
                src={typeof product.image === 'string' ? product.image : product.image?.full || ""}
                alt={product.name || "Product"}
                fill
                className="object-contain"
                priority
                unoptimized
              />
            </div>
            <button
              onClick={() => setIsDrawerOpen(true)}
              className="absolute top-2 right-2 p-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-600 transition-colors"
              title="Change Product"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Compact Product Info */}
          <div className="w-full md:w-3/5 space-y-4">
            <div>
              <h2 className="text-lg font-bold text-gray-900 mb-1.5 leading-tight">
                {product.name}
              </h2>
              <div className="inline-flex items-center px-3 py-1.5 rounded-lg bg-[var(--colour-fsP2)]/10 text-[var(--colour-fsP2)] font-bold text-base">
                Rs. {(product.discounted_price || product.price).toLocaleString()}
              </div>
              {selectedColor && (
                <div className="mt-2 text-sm font-medium text-gray-600 bg-gray-100 px-3 py-1 rounded-full inline-block">
                  Selected Color: <span className="text-gray-900 font-bold">{selectedColor}</span>
                </div>
              )}
            </div>

            {/* Compact Color Selection */}
            {uniqueColors.length > 0 && (
              <div className="space-y-2">
                <label className="text-xs font-medium text-gray-600 uppercase tracking-wide">Colors</label>
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
                          "relative w-11 h-11 rounded-lg overflow-hidden transition-all border-2",
                          selectedColor === color
                            ? "border-[var(--colour-fsP2)] shadow-md shadow-[var(--colour-fsP2)]/20"
                            : "border-gray-200 hover:border-[var(--colour-fsP2)]/50"
                        )}>
                          <Image
                            src={variantImage}
                            alt={color}
                            fill
                            className="object-cover"
                            unoptimized
                          />
                          {selectedColor === color && (
                            <div className="absolute inset-0 bg-[var(--colour-fsP2)]/15 flex items-center justify-center">
                              <div className="w-5 h-5 rounded-full bg-[var(--colour-fsP2)] flex items-center justify-center shadow-sm">
                                <Check className="w-3 h-3 text-white" strokeWidth={3} />
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

            <Button
              variant="outline"
              size="sm"
              className="border-[var(--colour-fsP2)]/30 hover:bg-[var(--colour-fsP2)]/5 hover:border-[var(--colour-fsP2)]/50 text-[var(--colour-fsP2)] gap-1.5 text-sm font-medium"
              onClick={() => setIsDrawerOpen(true)}
            >
              <Search className="w-3.5 h-3.5" />
              Find Another Product
            </Button>
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