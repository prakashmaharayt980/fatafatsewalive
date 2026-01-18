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
      <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
        <h3 className="text-xl font-bold text-gray-900 tracking-tight">Order Summary</h3>
        <Badge variant="secondary" className="font-semibold bg-white border border-gray-200 text-gray-700 shadow-sm px-3 py-1">
          {items.length} {items.length === 1 ? 'Item' : 'Items'}
        </Badge>
      </div>

      <div className="p-6 space-y-6">
        {/* Products List */}
        <div className="max-h-[400px] overflow-y-auto pr-2 space-y-4 scrollbar-thin scrollbar-thumb-gray-200">
          {items.map((item, index) => {
            const product = item.product;
            const price = Number(product.price);
            // API provides 'price' as number usually, but let's be safe as per previous fixes
            const quantity = item.quantity || 1;
            const itemTotal = price * quantity;

            return (
              <div key={item.id || index} className="flex gap-4 group">
                <div className="relative w-16 h-16 flex-shrink-0 overflow-hidden rounded-lg border border-gray-100 bg-gray-50">
                  <Image
                    src={product.image?.thumb || product.image?.full || '/placeholder-image.jpg'}
                    alt={product.name || 'Product'}
                    fill
                    sizes="64px"
                    className="object-contain p-1 transition-transform duration-300 group-hover:scale-105"
                  />
                </div>
                <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
                  <div>
                    <p className="text-sm font-medium text-gray-900 line-clamp-2 leading-tight" title={product.name}>
                      {product.name || 'Unnamed Product'}
                    </p>
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <div className="text-xs text-gray-500 bg-gray-50 px-2 py-0.5 rounded">Qty: {quantity}</div>
                    <div className="text-sm font-medium text-gray-900">Rs {itemTotal.toFixed(2)}</div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <Separator className="bg-gray-100" />

        {/* Promo Code Section */}
        <div>
          {submittedvaluelist.appliedPromo ? (
            <div className="flex items-center justify-between bg-green-50 border border-green-100 rounded-lg p-3">
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center text-green-600 font-bold text-xs">
                  %
                </div>
                <span className="text-sm font-medium text-green-700">{submittedvaluelist.appliedPromo.code} applied</span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setsubmittedvaluelist((prev) => ({ ...prev, promoCode: '', appliedPromo: null }))}
                className="h-8 px-2 text-red-500 hover:text-red-700 hover:bg-red-50"
              >
                Remove
              </Button>
            </div>
          ) : (
            <div className="flex gap-3">
              <Input
                value={submittedvaluelist.promoCode}
                onChange={(e) => setsubmittedvaluelist((prev) => ({ ...prev, promoCode: e.target.value }))}
                placeholder="Enter Promo Code"
                className="bg-gray-50 border-gray-200 focus:bg-white focus:border-[var(--colour-fsP1)] focus:ring-2 focus:ring-blue-50 transition-all h-12 text-base px-4 rounded-xl"
              />
              <Button
                onClick={handleApplyPromo}
                variant="outline"
                className="h-12 px-6 border-[var(--colour-fsP1)] text-[var(--colour-fsP1)] font-semibold hover:bg-blue-50 hover:text-[var(--colour-fsP1)] rounded-xl transition-all"
              >
                Apply
              </Button>
            </div>
          )}
        </div>

        <Separator className="bg-gray-100" />

        {/* Price Breakdown */}
        <div className="space-y-3">
          <div className="flex justify-between items-center text-sm text-gray-600">
            <span>Subtotal</span>
            <span className="font-medium text-gray-900">Rs {subtotal.toFixed(2)}</span>
          </div>
          {submittedvaluelist.appliedPromo && (
            <div className="flex justify-between items-center text-sm text-green-600">
              <span>Discount ({submittedvaluelist.appliedPromo.discount}%)</span>
              <span>- Rs {promoDiscount.toFixed(2)}</span>
            </div>
          )}

          <Separator className="bg-gray-100 my-2" />

          <div className="flex justify-between items-end pt-2">
            <span className="text-lg font-bold text-gray-900">Total Payable</span>
            <span className="text-2xl font-extrabold text-[var(--colour-fsP2)] leading-none">Rs {totalPayable.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {submittedvaluelist.appliedPromo && (
        <div className="bg-green-50 p-3 text-center text-sm text-green-700 border-t border-green-100 font-medium">
          You saved Rs {promoDiscount.toFixed(2)} on this order
        </div>
      )}
    </div>
  );
}