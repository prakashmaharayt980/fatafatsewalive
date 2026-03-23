"use client";
import React, { useCallback } from "react";
import { ShoppingCart, Trash2, Heart } from "lucide-react";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";

import Image from "next/image";
import { useShallow } from "zustand/react/shallow";
import { useCartStore } from "../context/CartContext";
import { useAuthStore } from "../context/AuthContext";


const WishList = () => {
  const { isLoggedIn, triggerLoginAlert } = useAuthStore(useShallow(state => ({
    isLoggedIn: state.isLoggedIn,
    triggerLoginAlert: state.triggerLoginAlert
  })));

  const {
    isWishlistOpen,
    setIsWishlistOpen,
    wishlistItems,
    removeFromWishlist,
    addToCart,
  } = useCartStore(
    useShallow((state) => ({
      isWishlistOpen: state.isWishlistOpen,
      setIsWishlistOpen: state.setIsWishlistOpen,
      wishlistItems: state.wishlistItems,
      removeFromWishlist: state.removeFromWishlist,
      addToCart: state.addToCart,
    }))
  );

  const handleAddToCart = useCallback(
    async (product: any) => {
      await addToCart(product.id, 1, { isLoggedIn }, triggerLoginAlert, product);

    },
    [addToCart, isLoggedIn, triggerLoginAlert]
  );

  const handleRemoveFromWishlist = useCallback(
    async (productId: number) => {
      await removeFromWishlist(productId);
    },
    [removeFromWishlist]
  );

  return (
    <Drawer open={isWishlistOpen} onOpenChange={setIsWishlistOpen}>
      <DrawerContent className="max-h-[40vh] max-w-5xl mx-auto border border-gray-200 rounded-xl overflow-hidden bg-white shadow-sm">
        <DrawerHeader className="text-center border-b border-gray-200 m-0 p-0 items-center py-1">
          <DrawerTitle className="flex items-center justify-center gap-1 sm:gap-2 text-lg sm:text-xl text-[var(--colour-fsP2)] font-semibold">
            <Heart className="w-4 sm:w-5 h-4 sm:h-5 text-[var(--colour-fsP1)]" />
            WishList
          </DrawerTitle>
        </DrawerHeader>

        <div className="px-2 sm:px-6 py-2 sm:py-4 overflow-y-auto flex-1">
          {/* Wishlist Items */}
          <div className="mb-3 sm:mb-6">
            <h3 className="font-medium text-gray-900 mb-2 sm:mb-3 text-sm sm:text-base">
              Items
            </h3>
            {wishlistItems.length === 0 ? (
              <div className="text-center py-4 sm:py-6 text-gray-500 text-sm">
                <Heart className="w-6 sm:w-8 h-6 sm:h-8 mx-auto mb-2 text-gray-400" />
                <p>Your Wishlist is empty</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {wishlistItems.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between py-2 sm:py-3 px-0 sm:px-1"
                  >
                    <div className="flex items-center gap-2 sm:gap-3 flex-1">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gray-50 rounded-md flex items-center justify-center overflow-hidden">
                        <Image
                          src={
                            item.thumb?.url ||
                      
                            "/placeholder.png"
                          }
                          alt={item.name}
                          width={48}
                          height={48}
                          className="w-10 h-10 sm:w-12 sm:h-12 object-contain"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-xs sm:text-sm truncate">
                          {item.name}
                        </h4>
                        <p className="text-[10px] sm:text-xs text-gray-500">
                          Rs.{" "}
                          {(item.discounted_price || item.price)?.toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
                      <button
                        onClick={() => handleAddToCart(item)}
                        className="p-2 rounded-full hover:bg-blue-100 text-blue-600 hover:text-blue-700 transition-colors"
                        title="Add to Cart"
                      >
                        <ShoppingCart className="w-4 h-4 sm:w-5 sm:h-5" />
                      </button>
                      <button
                        onClick={() => handleRemoveFromWishlist(item.id)}
                        className="w-6 sm:w-7 h-6 sm:h-7 flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
                      >
                        <Trash2 className="w-4 h-4 sm:w-5 sm:h-5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="w-full bg-white border-t border-gray-200 px-3 sm:px-6 py-2 sm:py-4">
          <div className="flex items-center justify-end">
            <button
              onClick={() => setIsWishlistOpen(false)}
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
};

export default WishList;