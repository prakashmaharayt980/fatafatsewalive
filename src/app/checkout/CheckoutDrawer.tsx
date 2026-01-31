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
      <DrawerContent className="max-h-[45vh] max-w-5xl mx-auto border border-gray-200 rounded-t-2xl overflow-hidden bg-white shadow-lg">
        <DrawerHeader className="text-center border-b border-gray-100 px-4 py-3">
          <DrawerTitle className="flex items-center justify-center gap-2 text-lg font-bold text-gray-900">
            <ShoppingCart className="w-5 h-5 text-[var(--colour-fsP1)]" />
            Your Cart
            {cartItems?.items?.length > 0 && (
              <span className="text-xs font-semibold bg-[var(--colour-fsP1)] text-white px-2 py-0.5 rounded-full">
                {cartItems.items.length}
              </span>
            )}
          </DrawerTitle>
        </DrawerHeader>

        <div className="px-4 sm:px-6 py-4 overflow-y-auto flex-1 scrollbar-thin scrollbar-thumb-gray-200">
          {cartItems?.items.length === 0 ? (
            <div className="text-center py-10 flex flex-col items-center justify-center space-y-3">
              <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center">
                <ShoppingCart className="w-8 h-8 text-gray-300" />
              </div>
              <p className="text-gray-500 text-sm font-medium">Your cart is empty</p>
              <button onClick={() => setIsCartOpen(false)} className="text-[var(--colour-fsP1)] text-sm font-semibold hover:underline">
                Continue Shopping
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {cartItems?.items.map((item) => (
                <div
                  key={item.id}
                  onClick={() => {
                    const slug = item.product.slug || item.product.id;
                    router.push(`/products/${slug}`);
                    setIsCartOpen(false);
                  }}
                  className="flex items-center gap-3 sm:gap-4 p-3 rounded-xl border border-gray-100 hover:border-gray-200 hover:bg-gray-50/50 transition-all cursor-pointer group"
                >
                  {/* Product Image */}
                  <div className="w-16 h-16 sm:w-20 sm:h-20 bg-white border border-gray-100 rounded-xl flex-shrink-0 overflow-hidden relative">
                    <Image
                      src={item.product.image.preview || '/placeholder.png'}
                      alt={item.product.name}
                      fill
                      sizes="80px"
                      className="object-contain p-1.5 group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>

                  {/* Product Details */}
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-sm text-gray-900 truncate pr-2 group-hover:text-[var(--colour-fsP1)] transition-colors">
                      {item.product.name}
                    </h4>
                    <p className="text-sm font-bold text-[var(--colour-fsP2)] mt-1">
                      Rs. {(Number(item.product.price) * item.quantity).toLocaleString()}
                    </p>
                  </div>

                  {/* Quantity + Delete */}
                  <div className="flex items-center gap-2 pl-2 flex-shrink-0">
                    <div className="flex items-center bg-gray-50 rounded-lg border border-gray-200 h-9">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          CartUpdateQuantity(item.id, item.quantity - 1);
                        }}
                        className="w-8 h-full flex items-center justify-center text-gray-500 hover:text-gray-800 hover:bg-gray-100 rounded-l-lg disabled:opacity-40"
                        disabled={item.quantity <= 1}
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="w-8 text-center text-sm font-bold text-gray-800 select-none">{item.quantity}</span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          addToCart(item.product.id, 1);
                        }}
                        className="w-8 h-full flex items-center justify-center text-gray-500 hover:text-gray-800 hover:bg-gray-100 rounded-r-lg"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteFromCart(item.id);
                      }}
                      className="w-9 h-9 flex items-center justify-center rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer Total */}
        {cartItems?.items?.length > 0 && (
          <div className="bg-gray-50 border-t border-gray-200 px-4 sm:px-6 py-3 sm:py-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 font-medium">Total</p>
                <p className="text-xl font-bold text-gray-900">Rs. {Number(cartItems?.cart_total).toLocaleString()}</p>
              </div>
              <button
                onClick={handlerouter}
                className="px-5 sm:px-7 py-2.5 sm:py-3 text-sm font-bold rounded-xl flex items-center gap-2 transition-all bg-[var(--colour-fsP1)] text-white hover:bg-blue-700 shadow-md shadow-blue-200"
              >
                Checkout <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </DrawerContent>
    </Drawer>
  );
};

export default CheckoutDrawer;