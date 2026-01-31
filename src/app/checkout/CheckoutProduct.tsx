'use client'

import Image from 'next/image';
import React, { Dispatch, SetStateAction } from 'react';
import { useContextCart } from './CartContext1';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import RemoteServices from '../api/remoteservice';

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
}

export default function CheckoutProduct({
  setsubmittedvaluelist,
  submittedvaluelist,
  handleApplyPromo,
}: CheckoutProduct) {
  const { cartItems } = useContextCart();
  const items = cartItems?.items || [];

  if (items.length === 0) {
    return (
      <Card className="w-full shadow-sm border-gray-100 rounded-xl overflow-hidden bg-white">
        <CardHeader className="p-6 border-b border-gray-100">
          <h3 className="text-lg font-medium text-gray-900">Order Summary</h3>
        </CardHeader>
        <CardContent className="p-6 text-center text-gray-500 text-sm">
          Your cart is empty
        </CardContent>
      </Card>
    );
  }

  // Calculate totals for display if needed locally, though we trust cart_total from API usually.
  // But strictly speaking, the API returns cart_total.
  const subtotal = cartItems?.cart_total || 0;

  // Promo discount logic - assuming frontend calculation for display or API handled?
  // The user had placeholder logic: const promoDiscount = submittedvaluelist.appliedPromo ? subtotal * 0.1 : 0;
  // We will restore a basic display version.
  const promoDiscount = submittedvaluelist.appliedPromo ? (subtotal * (submittedvaluelist.appliedPromo.discount / 100)) : 0;
  const totalPayable = subtotal - promoDiscount; // Simple subtraction for display

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      {/* Header */}
      <div className="p-5 border-b border-gray-100 flex justify-between items-center">
        <h3 className="text-lg font-bold text-gray-900">Order Summary</h3>
        <Badge variant="secondary" className="font-semibold bg-gray-100 text-gray-700 px-2.5 py-1 text-xs">
          {items.length} {items.length === 1 ? 'Item' : 'Items'}
        </Badge>
      </div>

      <div className="p-5 space-y-5">
        {/* Products List */}
        <div className="max-h-[350px] overflow-y-auto pr-1 space-y-3 scrollbar-thin scrollbar-thumb-gray-200">
          {items.map((item, index) => {
            const product = item.product;
            const price = Number(product.price);
            const quantity = item.quantity || 1;
            const itemTotal = price * quantity;

            return (
              <div key={item.id || index} className="flex gap-3.5 p-3 rounded-xl bg-gray-50/50 border border-gray-100 group hover:border-gray-200 transition-colors">
                <div className="relative w-18 h-18 sm:w-20 sm:h-20 flex-shrink-0 overflow-hidden rounded-lg bg-white border border-gray-100">
                  <Image
                    src={product.image?.thumb || product.image?.full || '/placeholder-image.jpg'}
                    alt={product.name || 'Product'}
                    fill
                    sizes="80px"
                    className="object-contain p-1.5"
                  />
                </div>
                <div className="flex-1 min-w-0 flex flex-col justify-between">
                  <p className="text-sm font-semibold text-gray-900 line-clamp-2 leading-snug" title={product.name}>
                    {product.name || 'Unnamed Product'}
                  </p>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-xs text-gray-500 bg-white px-2 py-0.5 rounded border border-gray-100">
                      Qty: {quantity}
                    </span>
                    <span className="text-sm font-bold text-gray-900">Rs. {itemTotal.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <Separator className="bg-gray-100" />

        {/* Promo Code */}
        <div>
          {submittedvaluelist.appliedPromo ? (
            <div className="flex items-center justify-between bg-green-50 border border-green-100 rounded-xl p-3.5">
              <div className="flex items-center gap-2.5">
                <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center text-green-600 font-bold text-xs">
                  %
                </div>
                <span className="text-sm font-semibold text-green-700">{submittedvaluelist.appliedPromo.code} applied</span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setsubmittedvaluelist((prev) => ({ ...prev, promoCode: '', appliedPromo: null }))}
                className="h-8 px-3 text-red-500 hover:text-red-700 hover:bg-red-50 text-xs font-semibold"
              >
                Remove
              </Button>
            </div>
          ) : (
            <div className="flex gap-2.5">
              <Input
                value={submittedvaluelist.promoCode}
                onChange={(e) => setsubmittedvaluelist((prev) => ({ ...prev, promoCode: e.target.value }))}
                placeholder="Promo code"
                className="bg-gray-50 border-gray-200 focus:bg-white focus:border-[var(--colour-fsP1)] transition-all h-11 text-sm px-4 rounded-xl"
              />
              <Button
                onClick={handleApplyPromo}
                variant="outline"
                className="h-11 px-5 border-[var(--colour-fsP1)] text-[var(--colour-fsP1)] font-bold hover:bg-blue-50 rounded-xl transition-all text-sm"
              >
                Apply
              </Button>
            </div>
          )}
        </div>

        <Separator className="bg-gray-100" />

        {/* Price Breakdown */}
        <div className="space-y-2.5">
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-500">Subtotal</span>
            <span className="font-medium text-gray-800">Rs. {subtotal.toLocaleString()}</span>
          </div>
          {submittedvaluelist.appliedPromo && (
            <div className="flex justify-between items-center text-sm text-green-600">
              <span>Discount</span>
              <span className="font-semibold">- Rs. {promoDiscount.toLocaleString()}</span>
            </div>
          )}

          <div className="border-t border-gray-200 pt-3 mt-3">
            <div className="flex justify-between items-end">
              <span className="text-base font-bold text-gray-900">Total</span>
              <span className="text-2xl font-bold text-[var(--colour-fsP2)]">Rs. {totalPayable.toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>

      {submittedvaluelist.appliedPromo && (
        <div className="bg-green-50 px-5 py-3 text-center text-sm text-green-700 border-t border-green-100 font-semibold">
          You saved Rs. {promoDiscount.toLocaleString()} on this order
        </div>
      )}
    </div>
  );
}