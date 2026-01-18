"use client";

import React, { useMemo } from "react";
import { ShoppingBag, CreditCardIcon, Scale, Check, Heart, Share2, ShieldCheck } from "lucide-react";
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
  const { addToCart } = useContextCart();
  const { setEmiContextInfo } = useContextEmi();
  const router = useRouter();

  const handleColorSelect = (variantGroup: any) => {
    setSelectedVariant(variantGroup);
    if (variantGroup.images && variantGroup.images.length > 0) {
      setSelectedImage(variantGroup.images[0].url);
    }
  };

  // Determine current display values
  const currentPrice = selectedVariant?.discounted_price || product.discounted_price || product.price;
  const originalPrice = selectedVariant?.original_price || product.original_price;
  const currentStock = selectedVariant ? selectedVariant.quantity : product.quantity;
  const isPreOrder = product.pre_order === 1;

  const savings = originalPrice ? originalPrice - currentPrice : 0;
  const discountPercentage = originalPrice ? Math.round((savings / originalPrice) * 100) : 0;

  const ActionButtons = useMemo(
    () => [
      {
        name: isPreOrder ? "Pre-Order Now" : "Add to Cart",
        Icon: ShoppingBag,
        action: () => addToCart(product.id, quantity),
        className: "bg-[var(--colour-fsP1)] text-white hover:bg-blue-700",
        show: true,
      },
      {
        name: "Apply EMI",
        Icon: CreditCardIcon,
        action: () => {
          // Navigate to EMI page with slug and ID
          router.push(`/emi/applyemi?slug=${product.slug}&id=${product.id}`);
        },
        className: "bg-[var(--colour-fsP2)] text-white hover:bg-red-600",
        show: product.emi_enabled === 1,
      },
      {
        name: "Compare",
        Icon: Scale,
        action: () => {
          router.push(`/compare?ids=${product.id}`);
        },
        className: "bg-white hover:bg-gray-50 text-gray-700 border border-gray-200",
        show: true,
      },
    ],
    [product, quantity, addToCart, setEmiContextInfo, router, isPreOrder]
  );

  // Get compare items for smart navigation
  const { compareItems } = useContextCart();

  // Update Compare Action to use context
  const compareActionIndex = ActionButtons.findIndex(b => b.name === 'Compare');
  if (compareActionIndex !== -1) {
    ActionButtons[compareActionIndex].action = () => {
      const currentIds = compareItems?.map((i: any) => i.id) || [];
      const newIds = Array.from(new Set([...currentIds, product.id])).join(',');
      router.push(`/compare?ids=${newIds}`);
    };
    // Ensure cursor-pointer is explicit
    ActionButtons[compareActionIndex].className += " cursor-pointer";
  }

  return (
    <div className="w-full space-y-6 bg-white">
      {/* Header Section */}
      <div className="space-y-4">
        <div className="flex justify-between items-start gap-4">
          <div className="space-y-2">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 leading-tight">
              {product.name}
            </h1>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1">
                <span className="font-semibold text-gray-700">{product.average_rating || 0}</span>
                {renderRating(product.average_rating || 0, 16)}
                <span className="text-sm text-gray-500 ml-1">
                  ({product.reviews?.meta?.total || 0} reviews)
                </span>
              </div>
              <span className={cn(
                "text-xs font-semibold uppercase px-2 py-0.5 rounded",
                currentStock > 0 ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
              )}>
                {currentStock > 0 ? (isPreOrder ? "Pre-Order" : "In Stock") : "Out of Stock"}
              </span>
            </div>
          </div>

          {/* Share / Wishlist */}
          <div className="flex gap-2 shrink-0">
            <button className="p-2 rounded-full hover:bg-gray-100 text-gray-500 hover:text-red-500 transition-all cursor-pointer">
              <Heart className="w-5 h-5" />
            </button>
            <button className="p-2 rounded-full hover:bg-gray-100 text-gray-500 hover:text-blue-500 transition-all cursor-pointer">
              <Share2 className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Price Section - Standard */}
      <div className="py-4 border-b border-gray-100">
        <div className="flex items-baseline gap-3">
          <span className="text-3xl font-bold text-gray-900">
            Rs. {currentPrice.toLocaleString()}
          </span>
          {originalPrice && originalPrice > currentPrice && (
            <div className="flex items-center gap-2">
              <span className="text-lg text-gray-400 line-through">
                Rs. {originalPrice.toLocaleString()}
              </span>
              <span className="text-sm font-medium text-green-600">
                {discountPercentage}% OFF
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Selectors Grid */}
      <div className="space-y-5">
        {/* Managed Color Selection - New Design */}
        {productDisplay.variantsByColor.length > 0 && (
          <div className="space-y-2 pt-1">
            <div className="flex justify-between items-center">
              <label className="text-xs font-bold text-gray-900 uppercase tracking-wide">
                Color: {selectedVariant ? <span className="text-gray-600 font-normal capitalize ml-1">{selectedVariant.color}</span> : null}
              </label>
            </div>

            <div className="flex flex-wrap gap-3">
              {productDisplay.variantsByColor.map((vGroup) => {
                const isSelected = selectedVariant?.color === vGroup.color;
                const variantImage = vGroup.images?.[0]?.thumb || vGroup.images?.[0]?.url || product.image.thumb || product.image.full;

                return (
                  <button
                    key={vGroup.variantId}
                    onClick={() => handleColorSelect(vGroup)}
                    className="group flex flex-col items-center gap-1 focus:outline-none cursor-pointer"
                    title={vGroup.color}
                  >
                    <div className={cn(
                      "relative w-14 h-14 sm:w-12 sm:h-12 rounded-full overflow-hidden transition-all duration-200 border",
                      isSelected
                        ? "border-[var(--colour-fsP1)] ring-1 ring-[var(--colour-fsP1)] ring-offset-1 scale-110"
                        : "border-gray-200 hover:border-gray-300"
                    )}>
                      <Image
                        src={variantImage}
                        alt={vGroup.color}
                        fill
                        className="object-cover"
                      />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Quantity Selector */}
        <div className="space-y-2 pt-1">
          <label className="text-xs font-bold text-gray-900 uppercase tracking-wide">Quantity</label>
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="flex items-center border border-gray-200 rounded text-gray-600 h-10 sm:h-8 bg-white w-28 sm:w-24">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="w-8 h-full flex items-center justify-center hover:bg-gray-50 font-medium active:bg-gray-100 cursor-pointer"
              >−</button>
              <input
                type="number"
                min="1"
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                className="flex-1 w-full text-center border-none bg-transparent focus:ring-0 text-sm font-semibold p-0 appearance-none"
              />
              <button
                onClick={() => setQuantity(quantity + 1)}
                className="w-8 h-full flex items-center justify-center hover:bg-gray-50 font-medium active:bg-gray-100 cursor-pointer"
              >+</button>
            </div>
            {currentStock < 10 && currentStock > 0 && (
              <p className="text-orange-600 text-xs font-medium">
                {currentStock} items left
              </p>
            )}
          </div>
        </div>

        {/* Main Actions */}
        <div className="flex flex-col gap-3 pt-4">
          <div className="flex flex-col sm:flex-row gap-3 h-auto sm:h-12">
            <Button
              className="flex-1 h-12 sm:h-full text-sm sm:text-base font-bold rounded-xl bg-[var(--colour-fsP1)] hover:bg-blue-700 text-white shadow-md hover:shadow-lg transition-all cursor-pointer"
              onClick={() => addToCart(product.id, quantity)}
              disabled={currentStock <= 0}
            >
              <ShoppingBag className="w-5 h-5 mr-2" />
              {isPreOrder ? "Pre-Order Now" : "Add to Cart"}
            </Button>

            {product.emi_enabled === 1 && (
              <Button
                className="h-12 sm:h-full w-full sm:w-auto px-4 rounded-xl bg-[var(--colour-fsP2)] hover:bg-red-600 text-white font-bold text-sm sm:text-base cursor-pointer"
                onClick={() => {
                  setEmiContextInfo((prev) => ({ ...prev, product }));
                  localStorage.setItem("recent emi", JSON.stringify(product));
                  router.push(`/emi/applyemi?slug=${product.slug}&id=${product.id}`);
                }}
              >
                <CreditCardIcon className="w-5 h-5 mr-2" />
                Apply EMI
              </Button>
            )}

            <Button
              variant="outline"
              className="h-12 sm:h-full w-full sm:w-32 rounded-xl border-gray-200 hover:border-gray-300 hover:bg-gray-50 text-gray-700 font-bold text-sm sm:text-base cursor-pointer"
              onClick={() => {
                const currentIds = compareItems?.map((i: any) => i.id) || [];
                const newIds = Array.from(new Set([...currentIds, product.id])).join(',');
                router.push(`/compare?ids=${newIds}`);
              }}
            >
              <Scale className="w-5 h-5 mr-2" />
              Compare
            </Button>
          </div>
        </div>

        {/* Trust Badges / Highlights */}
        <div className="flex flex-wrap items-center justify-start gap-x-6 gap-y-3 pt-4">
          <div className="flex items-center gap-2 text-gray-500">
            <ShieldCheck className="w-4 h-4 text-[var(--colour-fsP1)]" />
            <span className="text-xs font-semibold">1 Year Warranty</span>
          </div>
          <div className="flex items-center gap-2 text-gray-500">
            <CreditCardIcon className="w-4 h-4 text-[var(--colour-fsP1)]" />
            <span className="text-xs font-semibold">Secure Payment</span>
          </div>
          <div className="flex items-center gap-2 text-gray-500">
            <Share2 className="w-4 h-4 text-[var(--colour-fsP1)]" />
            <span className="text-xs font-semibold">Easy Returns</span>
          </div>
        </div>

        {/* Payment Methods */}
        <div className="pt-2">
          <div className="flex flex-wrap justify-center gap-2 sm:gap-3">
            {PaymentMethodsOptions.map((method) => (
              <div key={method.name} className="h-6 w-10 sm:h-7 sm:w-12 relative bg-white rounded border border-gray-100 p-0.5">
                <Image src={method.img} alt={method.name} fill className="object-contain" />
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};

export default ProductInfo;