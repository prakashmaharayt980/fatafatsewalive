// ProductInfo.tsx
"use client";

import React from "react";
import { ShoppingBag, CreditCard, Scale, Star, Monitor, Cpu, Camera, Battery, HardDrive, MemoryStick, ChevronRight, Truck, ShieldCheck, RotateCcw } from "lucide-react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { useContextCart } from "@/app/checkout/CartContext1";
import { PaymentMethodsOptions } from "@/app/CommonVue/Payment";
import { useRouter } from "next/navigation";
import { useContextEmi } from "@/app/emi/emiContext";
import { ProductDetails, ProductDisplayState } from "@/app/types/ProductDetailsTypes";
import { Button } from "@/components/ui/button";

interface ProductInfoProps {
  product: ProductDetails;
  selectedVariant: any | null;
  setSelectedVariant: (variant: any) => void;
  selectedImage: string;
  setSelectedImage: (image: string) => void;
  quantity: number;
  setQuantity: (qty: number) => void;
  renderRating: (rating: number, size?: number) => React.ReactElement;
  productDisplay: ProductDisplayState;
}

const ProductInfo: React.FC<ProductInfoProps> = ({
  product,
  selectedVariant,
  setSelectedVariant,
  setSelectedImage,
  quantity,
  setQuantity,
  renderRating,
  productDisplay,
}) => {
  const { addToCart, compareItems } = useContextCart();
  const { setEmiContextInfo } = useContextEmi();
  const router = useRouter();

  const handleColorSelect = (variantGroup: any) => {
    setSelectedVariant(variantGroup);
    if (variantGroup.images && variantGroup.images.length > 0) {
      setSelectedImage(variantGroup.images[0].url);
    }
  };

  const currentPrice = selectedVariant?.discounted_price || product.discounted_price || product.price;
  const originalPrice = selectedVariant?.original_price || product.original_price;
  const currentStock = selectedVariant ? selectedVariant.quantity : product.quantity;
  const isPreOrder = product.pre_order === 1;
  const discountPercentage = originalPrice ? Math.round(((originalPrice - currentPrice) / originalPrice) * 100) : 0;

  // Key Specs from product attributes
  const keySpecs = [
    { icon: Monitor, label: "Display", value: product.attributes?.product_attributes?.Display || "N/A" },
    { icon: Cpu, label: "Chipset", value: product.attributes?.product_attributes?.Processor || product.attributes?.product_attributes?.Chipset || "N/A" },
    { icon: Camera, label: "Camera", value: product.attributes?.product_attributes?.Camera || "N/A" },
    { icon: Battery, label: "Battery", value: product.attributes?.product_attributes?.Battery || "N/A" },
    { icon: MemoryStick, label: "RAM", value: product.attributes?.product_attributes?.RAM || "N/A" },
    { icon: HardDrive, label: "Storage", value: product.attributes?.product_attributes?.Storage || "N/A" },
  ];

  // Storage Variants (mock - replace with actual data)
  const storageVariants = [
    { label: "12GB + 256GB", active: true },
    { label: "12GB + 512GB", active: false },
    { label: "12GB + 1TB", active: false },
  ];

  return (
    <div className="w-full space-y-4">
      {/* Price & Rating Row */}
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1.5">
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">
            Rs. {currentPrice.toLocaleString()}
          </h2>
          {product.sku && (
            <span className="inline-block px-2 py-0.5 bg-slate-700 text-white text-[10px] font-medium rounded">
              Model: {product.sku}
            </span>
          )}
        </div>

        {/* Rating Badge */}
        <div className="flex items-center gap-2 bg-amber-50 px-3 py-2 rounded-lg border border-amber-100">
          <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
          <div className="text-right">
            <p className="text-base font-bold text-slate-900">
              {product.average_rating || 4.0}<span className="text-slate-400 font-normal text-sm">/5</span>
            </p>
            <p className="text-[9px] text-slate-500">Expert Review</p>
          </div>
        </div>
      </div>

      {/* Key Specs Card - Dark Theme */}
      <div className="bg-slate-800 rounded-xl p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold text-white">Key Specs</h3>
          <button className="text-xs font-medium text-cyan-400 hover:underline flex items-center gap-0.5">
            See full specs <ChevronRight className="w-3 h-3" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {keySpecs.map((spec, idx) => (
            <div key={idx} className="flex items-start gap-2">
              <spec.icon className="w-4 h-4 text-slate-400 mt-0.5 flex-shrink-0" />
              <div className="min-w-0">
                <p className="text-[9px] text-slate-500 uppercase">{spec.label}</p>
                <p className="text-[11px] font-semibold text-white truncate">{spec.value}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Available Variants - Dark Theme */}
      <div className="bg-slate-800 rounded-xl p-4">
        <h3 className="text-sm font-bold text-white mb-3">Available Variants</h3>
        <div className="flex flex-wrap gap-2">
          {storageVariants.map((variant, idx) => (
            <button
              key={idx}
              className={cn(
                "px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all",
                variant.active
                  ? "border-cyan-400 bg-cyan-400/10 text-cyan-400"
                  : "border-slate-600 text-slate-400 hover:border-slate-500"
              )}
            >
              {variant.label}
            </button>
          ))}
        </div>
      </div>

      {/* Stock Status */}
      {currentStock > 0 ? (
        <div className="flex items-center gap-2 text-sm">
          <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
          <span className="text-slate-600">In Stock ({currentStock} available)</span>
        </div>
      ) : (
        <div className="flex items-center gap-2 text-sm">
          <div className="w-2 h-2 bg-red-500 rounded-full"></div>
          <span className="text-slate-600">Out of Stock</span>
        </div>
      )}

      {/* EMI & Buy Section - Dark Theme */}
      <div className="bg-slate-800 rounded-xl p-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-6">
            {product.emi_enabled === 1 && (
              <div>
                <span className="text-[9px] text-slate-500 uppercase">EMI</span>
                <p className="text-sm font-bold text-white">
                  Rs. {Math.round(currentPrice / 12).toLocaleString()}<span className="text-slate-400 font-normal text-xs">/mo</span>
                </p>
              </div>
            )}
            <div>
              <span className="text-[9px] text-slate-500 uppercase">Price</span>
              <p className="text-lg font-bold text-white">Rs. {currentPrice.toLocaleString()}</p>
            </div>
          </div>

          <Button
            className="px-6 h-10 bg-cyan-500 hover:bg-cyan-600 text-white font-bold text-sm rounded-lg"
            onClick={() => addToCart(product.id, quantity)}
          >
            Buy Now
          </Button>
        </div>
        <p className="text-[9px] text-slate-600 mt-2">
          (Affiliate links may earn us a commission)
        </p>
      </div>

      {/* Color Selection */}
      {productDisplay.variantsByColor.length > 0 && (
        <div className="space-y-2 pt-2">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold text-slate-900">Color:</h3>
            {selectedVariant && (
              <span className="text-sm text-slate-500 capitalize">{selectedVariant.color}</span>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            {productDisplay.variantsByColor.map((vGroup) => {
              const isSelected = selectedVariant?.color === vGroup.color;
              const variantImage = vGroup.images?.[0]?.thumb || product.image.thumb;

              return (
                <button
                  key={vGroup.variantId}
                  onClick={() => handleColorSelect(vGroup)}
                  className={cn(
                    "relative w-12 h-12 rounded-lg overflow-hidden border-2 transition-all",
                    isSelected
                      ? "border-[var(--colour-fsP2)] ring-2 ring-[var(--colour-fsP2)]/20"
                      : "border-gray-200 hover:border-gray-300"
                  )}
                >
                  <Image src={variantImage} alt={vGroup.color} fill className="object-cover" />
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Quantity & Action Buttons */}
      <div className="space-y-3">
        {/* Quantity Selector */}
        <div className="flex items-center gap-3">
          <span className="text-sm font-bold text-slate-700">Quantity:</span>
          <div className="flex items-center border border-gray-200 rounded-lg">
            <button
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              className="w-9 h-9 flex items-center justify-center text-slate-600 hover:bg-gray-50 font-bold"
              disabled={quantity <= 1}
            >
              -
            </button>
            <span className="w-12 text-center text-sm font-bold text-slate-800">{quantity}</span>
            <button
              onClick={() => setQuantity(Math.min(currentStock, quantity + 1))}
              className="w-9 h-9 flex items-center justify-center text-slate-600 hover:bg-gray-50 font-bold"
              disabled={quantity >= currentStock}
            >
              +
            </button>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <Button
            className="flex-1 h-11 bg-[var(--colour-fsP1)] hover:bg-orange-600 text-white font-bold rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={() => addToCart(product.id, quantity)}
            disabled={currentStock === 0}
          >
            <ShoppingBag className="w-4 h-4 mr-2" />
            {currentStock === 0 ? 'Out of Stock' : 'Add to Cart'}
          </Button>

          {product.emi_enabled === 1 && currentStock > 0 && (
            <Button
              className="flex-1 h-11 bg-[var(--colour-fsP2)] hover:bg-blue-700 text-white font-bold rounded-lg"
              onClick={() => router.push(`/emi/applyemi?slug=${product.slug}&id=${product.id}`)}
            >
              <CreditCard className="w-4 h-4 mr-2" />
              Apply EMI
            </Button>
          )}

          <Button
            variant="outline"
            className="h-11 w-11 p-0 border-2 border-gray-200 text-gray-600 rounded-lg hover:border-gray-300 hover:bg-gray-50"
            onClick={() => {
              const currentIds = compareItems?.map((i: any) => i.id) || [];
              const newIds = Array.from(new Set([...currentIds, product.id])).join(',');
              router.push(`/compare?ids=${newIds}`);
            }}
          >
            <Scale className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Trust Badges */}
      <div className="grid grid-cols-3 gap-2 pt-3 border-t border-gray-100">
        {[
          { icon: Truck, label: "Free Delivery" },
          { icon: ShieldCheck, label: "Warranty" },
          { icon: RotateCcw, label: "Easy Returns" },
        ].map((badge, idx) => (
          <div key={idx} className="flex flex-col items-center text-center p-2 bg-gray-50 rounded-lg">
            <badge.icon className="w-4 h-4 text-[var(--colour-fsP2)] mb-1" />
            <span className="text-[10px] font-semibold text-gray-600">{badge.label}</span>
          </div>
        ))}
      </div>

      {/* Payment Methods */}
      <div className="pt-3 border-t border-gray-100">
        <p className="text-[9px] font-bold text-gray-400 uppercase mb-2">Secured Payment</p>
        <div className="flex flex-wrap gap-1.5">
          {PaymentMethodsOptions.slice(0, 6).map((method) => (
            <div key={method.name} className="h-6 w-10 relative bg-white rounded border border-gray-200">
              <Image src={method.img} alt={method.name} fill className="object-contain p-0.5" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProductInfo;