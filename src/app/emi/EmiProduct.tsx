"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";
// import { CreditCard, Search, X } from "lucide-react"; // X not exported from here usually
import { CreditCard, Search, X, Smartphone, Loader2, ChevronRight, Check } from "lucide-react";
import RemoteServices from "../api/remoteservice";
import emptyboxIcon from '../../../public/svgfile/emptybox.png'
import { useContextEmi } from "./emiContext";
import { ProductDetails } from "../types/ProductDetailsTypes";

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
        <DrawerContent className="h-[85vh] max-w-4xl mx-auto rounded-t-3xl bg-white flex flex-col">

          {/* Header */}
          <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-white rounded-t-3xl">
            <DrawerTitle className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <Search className="w-5 h-5 text-gray-500" />
              Search Products
            </DrawerTitle>
            {/* Close button usually handled by Drawer overlay, but nice to have explicit one if needed, relying on default behavior for now */}
          </div>

          <div className="flex-1 flex flex-col p-4 gap-4 overflow-hidden bg-gray-50/50">
            {/* Search Input - Updated to match Header & Fix Space Key */}
            {/* Search Input - Sleek & Premium Design */}
            <div className="relative w-full max-w-2xl mx-auto group">
              <div className={cn(
                "flex items-center rounded-2xl bg-gray-100 transition-all duration-300 overflow-hidden",
                "focus-within:bg-white focus-within:shadow-[0_4px_20px_rgba(0,0,0,0.08)] focus-within:ring-1 focus-within:ring-gray-200"
              )}>
                <div className="pl-4 text-gray-400 group-focus-within:text-[var(--colour-fsP1)] transition-colors">
                  <Search className="w-5 h-5" />
                </div>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.stopPropagation()}
                  placeholder="Search for mobiles, laptops..."
                  className="w-full px-4 py-4 bg-transparent border-none focus:outline-none text-base font-medium text-gray-900 placeholder-gray-400"
                  autoFocus
                />
                {searchQuery && (
                  <button
                    onClick={() => { setSearchQuery(""); setSelectItems([]); }}
                    className="pr-4 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <div className="bg-gray-200 hover:bg-gray-300 rounded-full p-1 transition-colors">
                      <X className="w-4 h-4" />
                    </div>
                  </button>
                )}
                {loading && (
                  <div className="pr-4">
                    <Loader2 className="h-5 w-5 text-[var(--colour-fsP1)] animate-spin" />
                  </div>
                )}
              </div>
            </div>

            {/* Results List */}
            <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar mt-4">
              {selectItems.length > 0 ? (
                <div className="grid grid-cols-1 gap-3">
                  {selectItems.map((product: any) => (
                    <div
                      key={product.id}
                      onClick={() => handleProductSelect(product.slug)}
                      className="flex items-center gap-4 p-3 bg-white rounded-xl hover:shadow-md cursor-pointer transition-all duration-200 group"
                    >
                      <div className="relative w-16 h-16 bg-gray-50 rounded-lg overflow-hidden flex-shrink-0">
                        {product.image && (product.image.thumb || typeof product.image === 'string') ? (
                          <div className="relative w-full h-full">
                            <Image
                              src={typeof product.image === 'string' ? product.image : product.image.thumb || ""}
                              alt={product.name}
                              fill
                              className="object-contain p-1 group-hover:scale-110 transition-transform duration-300"
                            />
                          </div>
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-300">
                            <Smartphone className="w-6 h-6" />
                          </div>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-gray-900 truncate group-hover:text-[var(--colour-fsP1)] transition-colors">
                          {product.name}
                        </h4>
                        <div className="flex items-baseline gap-2 mt-1">
                          <span className="text-sm font-bold text-gray-500">Rs {Number(product.price).toLocaleString()}</span>
                        </div>
                      </div>

                      <div className="p-2 text-gray-300 group-hover:text-[var(--colour-fsP1)] transition-colors">
                        <ChevronRight className="w-5 h-5" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-gray-400 opacity-60">
                  {searchQuery ? (
                    <>
                      <Search className="w-16 h-16 mb-4 stroke-1" />
                      <p className="text-lg font-medium">No products found</p>
                      <p className="text-sm">Try searching for something else</p>
                    </>
                  ) : (
                    <>
                      <Smartphone className="w-16 h-16 mb-4 stroke-1" />
                      <p className="text-lg font-medium">Start typing to search</p>
                      <p className="text-sm">Find mobiles, laptops, and more</p>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Footer space if needed, or simple padding */}
          {/* <div className="h-4 bg-gray-50/50 rounded-b-3xl"></div> */}
        </DrawerContent>
      </Drawer>

      {/* Main Content Area */}
      {product ? (
        <div className="flex flex-col md:flex-row gap-6 items-start">
          {/* Product Image Card */}
          <div className="w-full md:w-1/3 bg-white p-6 rounded-2xl flex items-center justify-center relative group">
            <div className="relative w-48 h-48 sm:w-64 sm:h-64">
              <Image
                src={typeof product.image === 'string' ? product.image : product.image?.full || ""}
                alt={product.name || "Product Image"}
                fill
                className="object-contain transition-transform duration-500 group-hover:scale-110"
                priority
              />
            </div>
            <div className="absolute top-4 right-4">
              <Button
                size="icon"
                variant="ghost"
                className="rounded-full bg-gray-50 hover:bg-gray-100 text-gray-500"
                onClick={() => setIsDrawerOpen(true)}
                title="Change Product"
              >
                <RefreshCcw className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Product Info */}
          <div className="w-full md:w-2/3 space-y-6 px-4 sm:px-0">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                {product.name}
              </h2>
              <div className="inline-flex items-center px-3 py-1 rounded-full bg-blue-50 text-[var(--colour-fsP1)] font-bold text-lg">
                Rs. {(product.discounted_price || product.price).toLocaleString()}
              </div>
            </div>

            {/* Color Selection */}
            {uniqueColors.length > 0 && (
              <div className="space-y-3">
                <label className="text-sm font-medium text-gray-700">Available Colors:</label>
                <div className="flex flex-wrap gap-2">
                  <div className="flex flex-wrap gap-3">
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
                          className="group flex flex-col items-center gap-1 focus:outline-none relative"
                          title={color}
                        >
                          <div className={cn(
                            "relative w-10 h-10 sm:w-12 sm:h-12 rounded-full overflow-hidden transition-all duration-200 border",
                            selectedColor === color
                              ? "border-[var(--colour-fsP1)] ring-1 ring-[var(--colour-fsP1)] ring-offset-1" // removed scale to keep layout stable, relying on ring/icon
                              : "border-gray-200 hover:border-gray-300"
                          )}>
                            <Image
                              src={variantImage}
                              alt={color}
                              fill
                              className="object-cover"
                            />
                            {/* Selected Overlay */}
                            {selectedColor === color && (
                              <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                                <Check className="w-5 h-5 text-white drop-shadow-md" strokeWidth={3} />
                              </div>
                            )}
                          </div>
                        </button>
                      )
                    })}
                  </div>
                </div>
              </div>
            )}

            <Button
              variant="outline"
              className="w-full sm:w-auto border-gray-200 hover:bg-gray-50 text-gray-700 gap-2"
              onClick={() => setIsDrawerOpen(true)}
            >
              <Search className="w-4 h-4" />
              Find Another Product
            </Button>
          </div>
        </div>
      ) : (
        /* Empty State */
        <div
          onClick={() => setIsDrawerOpen(true)}
          className="group cursor-pointer bg-white rounded-2xl hover:bg-[var(--colour-fsP1)]/5 transition-all duration-300 min-h-[300px] flex flex-col items-center justify-center p-8 text-center relative overflow-hidden"
        >
          <div className="w-24 h-24 bg-blue-50 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
            <Search className="w-10 h-10 text-[var(--colour-fsP1)]" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">Select a Product</h3>
          <p className="text-gray-500 max-w-sm mx-auto mb-8">
            Search and select a product to calculate exact monthly details, including down payments and bank interest rates.
          </p>
          <Button className="bg-[var(--colour-fsP1)] hover:bg-blue-700 text-white rounded-full px-8 py-6 font-semibold shadow-lg shadow-blue-200 group-hover:shadow-blue-300 transition-all">
            Search Products
          </Button>

          {/* Decoration */}
          <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-gray-50 rounded-full blur-3xl group-hover:bg-blue-100 transition-colors"></div>
        </div>
      )}

      <style jsx global>{`
            .custom-scrollbar::-webkit-scrollbar {
            width: 6px;
            }
            .custom-scrollbar::-webkit-scrollbar-track {
            background: transparent;
            }
            .custom-scrollbar::-webkit-scrollbar-thumb {
            background-color: #e2e8f0;
            border-radius: 20px;
            }
        `}</style>
    </div>
  );
}

// Add RefreshCcw import since it was used but not imported in previous view options
function RefreshCcw(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
      <path d="M3 3v5h5" />
      <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" />
      <path d="M16 16h5v5" />
    </svg>
  )
}