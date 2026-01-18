'use client';
import React from 'react';
import { ShoppingCart, Plus, Minus, Trash2, ArrowRight, Heart } from 'lucide-react';
import {
  Drawer,

  DrawerContent,

  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer';


import Image from 'next/image';
import { useContextCart } from '../checkout/CartContext1';


const WishList = () => {
  const {
    isWishlistOpen,
    setIsWishlistOpen,
    wishlistItems,
    removeFromWishlist,
    addToCart
  } = useContextCart();

  const handleAddToCart = (product: any) => {
    addToCart(product.id, 1);
    // Optional: remove from wishlist after adding?
    // removeProduct(product.id);
  }






  return (
    <Drawer open={isWishlistOpen} onOpenChange={setIsWishlistOpen}  >
      <DrawerContent className="max-h-[40vh] max-w-5xl mx-auto border border-gray-200 rounded-xl overflow-hidden bg-white shadow-sm">
        <DrawerHeader className="text-center border-b border-gray-200 m-0 p-0 items-center py-1">
          <DrawerTitle className="flex items-center justify-center gap-1 sm:gap-2 text-lg sm:text-xl text-[var(--colour-fsP2)] font-semibold">
            <Heart className="w-4 sm:w-5 h-4 sm:h-5 text-[var(--colour-fsP1)]" />
            WishList
          </DrawerTitle>
        </DrawerHeader>

        <div className="px-2 sm:px-6 py-2 sm:py-4 overflow-y-auto flex-1">
          {/* Cart Items */}
          <div className="mb-3 sm:mb-6">
            <h3 className="font-medium text-gray-900 mb-2 sm:mb-3 text-sm sm:text-base">Items</h3>
            {wishlistItems.length === 0 ? (
              <div className="text-center py-4 sm:py-6 text-gray-500 text-sm">
                <Heart className="w-6 sm:w-8 h-6 sm:h-8 mx-auto mb-2 text-gray-400" />
                <p>Your Wishlist is empty</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {wishlistItems.map((item) => (
                  <div key={item.id} className="flex items-center justify-between py-2 sm:py-3 px-0 sm:px-1">
                    <div className="flex items-center gap-2 sm:gap-3 flex-1">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gray-50 rounded-md flex items-center justify-center">
                        <Image
                          src={item.image?.preview || item.image?.full || '/placeholder.png'}
                          alt={item.name}
                          width={48}
                          height={48}
                          className="w-10 h-10 sm:w-12 sm:h-12 object-cover rounded-md"
                        />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-xs sm:text-sm">{item.name}</h4>
                        <p className="text-[10px] sm:text-xs text-gray-500">Rs.{item.price} each</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 sm:gap-2">
                      <button
                        onClick={() => handleAddToCart(item)}
                        className="p-2 rounded-full hover:bg-gray-100 text-blue-600"
                        title="Add to Cart"
                      >
                        <ShoppingCart className="w-4 h-4 sm:w-5 sm:h-5" />
                      </button>
                      <button
                        onClick={() => removeFromWishlist(item.id)}
                        className="w-6 sm:w-7 h-6 sm:h-7 flex items-center justify-center text-gray-400 hover:text-red-500"
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
          <div className="flex items-center justify-between">
            <div className="text-left flex flex-row gap-2 sm:gap-4 items-center">
              {/* Footer content if needed */}
            </div>
            <div className="flex gap-2 sm:gap-3">
              <button
                onClick={() => setIsWishlistOpen(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
};

export default WishList;