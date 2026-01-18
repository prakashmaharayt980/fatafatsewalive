'use client';
import React from 'react';
import { ShoppingCart, Plus, Minus, Trash2, ArrowRight } from 'lucide-react';
import {
  Drawer,

  DrawerContent,

  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer';

import { useContextCart } from './CartContext1';
import Image from 'next/image';
import { useRouter } from 'next/navigation';


const CheckoutDrawer = () => {
  const {
    cartItems,
    isCartOpen,
    setIsCartOpen,
    addToCart,
    deleteFromCart,
    CartUpdateQuantity


  } = useContextCart();
  const router = useRouter();




  const handlerouter = () => {
    router.push('/checkout');
    setIsCartOpen(false);
  }



  return (
    <Drawer open={isCartOpen} onOpenChange={setIsCartOpen}  >
      <DrawerContent className="max-h-[40vh] max-w-5xl mx-auto border border-gray-200 rounded-xl overflow-hidden bg-white shadow-sm">
        <DrawerHeader className="text-center border-b border-gray-200 m-0 p-0 items-center py-1">
          <DrawerTitle className="flex items-center justify-center gap-1 sm:gap-2 text-lg sm:text-xl text-[var(--colour-fsP2)] font-semibold">
            <ShoppingCart className="w-4 sm:w-5 h-4 sm:h-5 text-[var(--colour-fsP1)]" />
            Cart
          </DrawerTitle>
        </DrawerHeader>

        <div className="px-3 sm:px-6 py-4 overflow-y-auto flex-1 scrollbar-thin scrollbar-thumb-gray-200">
          {/* Cart Items */}
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-900 text-sm uppercase tracking-wide opacity-80 mb-4">Your Items</h3>
            {cartItems?.items.length === 0 ? (
              <div className="text-center py-10 flex flex-col items-center justify-center space-y-3">
                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center">
                  <ShoppingCart className="w-8 h-8 text-gray-300" />
                </div>
                <p className="text-gray-500 text-sm font-medium">Your cart is currently empty</p>
                <button onClick={() => setIsCartOpen(false)} className="text-[var(--colour-fsP1)] text-xs font-semibold hover:underline">
                  Continue Shopping
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {cartItems?.items.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => {
                      const slug = item.product.slug || item.product.id; // Fallback to ID if slug missing
                      router.push(`/product/${slug}?id=${item.product.id}`);
                      setIsCartOpen(false);
                    }}
                    className="flex items-center justify-between p-2.5 rounded-xl border border-transparent hover:border-gray-100 hover:bg-gray-50/80 transition-all cursor-pointer group"
                  >
                    <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
                      <div className="w-12 h-12 sm:w-16 sm:h-16 bg-white border border-gray-100 rounded-lg flex-shrink-0 flex items-center justify-center overflow-hidden">
                        <Image
                          src={item.product.image.preview || '/placeholder.png'}
                          alt={item.product.name}
                          width={64}
                          height={64}
                          className="w-full h-full object-contain p-1 group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-sm text-gray-900 truncate pr-2 group-hover:text-[var(--colour-fsP1)] transition-colors">
                          {item.product.name}
                        </h4>
                        <p className="text-xs text-gray-500 font-medium mt-0.5">Rs. {Number(item.product.price).toLocaleString()}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 sm:gap-3 pl-2">
                      <div className="flex items-center bg-white rounded-lg border border-gray-200 shadow-sm h-8">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            CartUpdateQuantity(item.id, item.quantity - 1);
                          }}
                          className="w-7 h-full flex items-center justify-center text-gray-500 hover:text-gray-800 hover:bg-gray-50 rounded-l-lg disabled:opacity-50"
                          disabled={item.quantity <= 1}
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="w-7 text-center text-xs font-semibold text-gray-700 select-none">{item.quantity}</span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            addToCart(item.product.id, 1);
                          }}
                          className="w-7 h-full flex items-center justify-center text-gray-500 hover:text-gray-800 hover:bg-gray-50 rounded-r-lg"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteFromCart(item.id);
                        }}
                        className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                        title="Remove Item"
                      >
                        <Trash2 className="w-4 h-4" />
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
              <div className="text-base sm:text-xl text-[var(--colour-fsP1)] font-medium">Total:</div>
              <div className="text-base sm:text-xl font-bold text-[var(--colour-fsP2)]">Rs. {cartItems?.cart_total}</div>
            </div>
            <div className="flex gap-2 sm:gap-3">
              <button
                onClick={handlerouter}
                className="px-3 sm:px-6 py-1.5 sm:py-2 text-sm sm:text-base font-medium rounded-lg flex items-center gap-1 sm:gap-2 transition-colors bg-[var(--colour-fsP1)] text-white hover:bg-blue-700"
              >
                Proceed To Checkout <ArrowRight className="w-3 sm:w-4 h-3 sm:h-4" />
              </button>
            </div>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
};

export default CheckoutDrawer;