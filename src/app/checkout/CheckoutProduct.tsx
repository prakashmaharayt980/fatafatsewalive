'use client'

import Image from 'next/image';
import React, { Dispatch, SetStateAction } from 'react';
import { useContextCart } from './CartContext1';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ShoppingBag, Tag, Ticket, X } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { CheckoutState } from './checkoutTypes';

interface CheckoutProduct {
  setsubmittedvaluelist: Dispatch<SetStateAction<CheckoutProduct['submittedvaluelist']>>;
  submittedvaluelist: {
    promoCode: string;
    totalpayment: number;
    appliedPromo: { code: string; discount: number } | null;
    paymentmethod: string;
    address: any;
    receiverNO: string;
    productsID: any[];
  };
  handleApplyPromo: () => void;
  Stepstate: CheckoutState
}

export default function CheckoutProduct({
  setsubmittedvaluelist,
  submittedvaluelist,
  handleApplyPromo,
  Stepstate
}: CheckoutProduct) {
  const { cartItems } = useContextCart();
  const items = cartItems?.items || [];

  const subtotal = cartItems?.cart_total || 0;
  const promoDiscount = submittedvaluelist.appliedPromo ? (submittedvaluelist.appliedPromo.discount) : 0;
  const totalPayable = subtotal - promoDiscount;

  if (items.length === 0) {
    return (
      <div className="bg-white rounded-3xl shadow-[var(--shadow-premium-sm)] border border-gray-100 p-10 text-center sticky top-24">
        <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-5 motion-safe:animate-bounce-slow">
          <ShoppingBag className="w-10 h-10 text-[var(--colour-fsP2)]" />
        </div>
        <h3 className="text-gray-900 text-lg font-bold mb-2">Cart is empty</h3>
        <p className="text-gray-500 text-sm">Add amazing items to your cart<br />to see them here!</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow shadow-blue-900/5 border border-white overflow-hidden sticky top-24">



      <div className="p-2 space-y-4 bg-white">
        {/* Products List - Enhanced Size */}
        <div className="space-y-6 max-h-[450px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent">
          {items.map((item, index) => {
            const product = item.product;
            const price = Number(product.price);
            const quantity = item.quantity || 1;
            const itemTotal = price * quantity;

            return (
              <div key={item.id || index} className="flex gap-4 group">
                {/* Image - Increased Size & Aspect Ratio */}
                <div className="relative w-20 h-20 sm:w-28 sm:h-28 flex-shrink-0 overflow-hidden rounded-2xl border border-gray-100 bg-gray-50 shadow-sm group-hover:shadow-md transition-all duration-300">
                  <Image
                    src={product.image?.thumb || product.image?.full}
                    alt={product.name || 'Product'}
                    fill
                    className="object-contain  group-hover:scale-110 transition-transform duration-500 ease-in-out"

                  />
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0 py-1 flex flex-col justify-between">
                  <div>
                    <p className="text-sm sm:text-base font-bold text-gray-800 line-clamp-2 leading-tight group-hover:text-[var(--colour-fsP2)] transition-colors">
                      {product.name || 'Unnamed Product'}
                    </p>
                    {/* Optional: Add variants here if available */}
                  </div>

                  <div className="flex items-end justify-between mt-auto">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-gray-500 bg-gray-100 px-2.5 py-1 rounded-lg">
                        Qty: {quantity}
                      </span>
                      <span className="text-xs text-gray-400">x Rs. {price.toLocaleString()}</span>
                    </div>
                    <span className="text-sm font-bold text-[var(--colour-fsP2)]">
                      Rs. {itemTotal.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <Separator className="bg-dashed border-t border-gray-200" />

        {/* Promo Code Section - Ticket Style */}
        {Stepstate.currentStep !== 2 && (
          <div className="space-y-3">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
              <Ticket className="w-3 h-3" /> Have a Promo Code?
            </label>

            {submittedvaluelist.appliedPromo ? (
              <div className="relative bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-xl p-4 flex items-center justify-between overflow-hidden group">
                <div className="absolute right-0 top-0 w-16 h-16 bg-emerald-500/10 rounded-full blur-xl -mr-8 -mt-8"></div>

                <div className="relative flex items-center gap-3">
                  <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm text-emerald-600">
                    <Tag className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-bold text-emerald-700 text-sm">{submittedvaluelist.appliedPromo.code}</p>
                    <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-wide">Discount Applied</p>
                  </div>
                </div>

                <button
                  onClick={() => setsubmittedvaluelist((prev) => ({ ...prev, promoCode: '', appliedPromo: null }))}
                  className="relative z-10 w-8 h-8 flex items-center justify-center rounded-full bg-white hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors shadow-sm"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Tag className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    value={submittedvaluelist.promoCode}
                    onChange={(e) => setsubmittedvaluelist((prev) => ({ ...prev, promoCode: e.target.value }))}
                    placeholder="Enter discount code"
                    className="pl-10 h-10 bg-gray-50 border-gray-200 focus:bg-white focus:border-[var(--colour-fsP2)] focus:ring-[var(--colour-fsP2)] rounded text-sm transition-all"
                  />
                </div>
                <Button
                  onClick={handleApplyPromo}
                  disabled={!submittedvaluelist.promoCode}
                  className="h-10 px-4 bg-[var(--colour-fsP2)] hover:bg-blue-700 text-white rounded font-bold shadow-lg shadow-blue-200 transition-all disabled:opacity-50 disabled:shadow-none active:scale-95"
                >
                  Apply
                </Button>
              </div>
            )}
          </div>

        )}

        {/* Breakdown Panel */}
        <div className="bg-gray-50 rounded-2xl p-5 space-y-3 border border-gray-100">
          <div className="flex justify-between text-sm text-gray-600 font-medium">
            <span>Subtotal</span>
            <span className="text-gray-900">Rs. {subtotal.toLocaleString()}</span>
          </div>

          <div className="flex justify-between text-sm items-center font-medium">
            <span className="text-gray-600">Shipping Fee</span>
            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">
              FREE DELIVERY
            </span>
          </div>

          {submittedvaluelist.appliedPromo && (
            <div className="flex justify-between text-sm text-emerald-600 font-bold">
              <span className="flex items-center gap-1"><Ticket className="w-3 h-3" /> Discount</span>
              <span>- Rs. {promoDiscount.toLocaleString()}</span>
            </div>
          )}

          <div className="border-t border-gray-200 pt-3 mt-2">
            <div className="flex justify-between items-end">
              <div>
                <span className="text-sm font-bold text-gray-700 block">Total</span>
                <span className="text-[10px] text-gray-400 font-medium uppercase tracking-wide">Incl. Taxes</span>
              </div>
              <span className="text-2xl font-black text-[var(--colour-fsP2)]">
                Rs. {totalPayable.toLocaleString()}
              </span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}