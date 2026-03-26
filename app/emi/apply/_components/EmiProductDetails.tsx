'use client'

import Image from 'next/image';
import React from 'react';
import { ShoppingBag } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import type { ProductData } from '@/app/types/ProductDetailsTypes';

interface EmiData {
  tenure: number;
  downPayment: number;
  financeAmount: number;
  paymentpermonth: number;
}

export default function EmiProductDetails({ emiData, product, selectedVariant }: { emiData: EmiData, product: ProductData, selectedVariant?: string }) {
  if (!product) return null;

  return (
    <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden sticky top-24">
      {/* Header */}
      <div className="bg-[var(--colour-fsP2)] p-4 text-white">
        <div className="flex items-center justify-between gap-3">
          <h3 className="font-bold text-base whitespace-nowrap">Order Summary</h3>
        </div>
      </div>

      <div className="p-5 space-y-5 bg-white">
        {/* Product Details */}
        <div className="flex gap-4">
          <div className="relative w-20 h-20 flex-shrink-0 overflow-hidden rounded-lg border border-gray-100 bg-gray-50">
            {product.thumb?.url || product.images?.[0]?.url ? (
              <Image
                src={product.thumb?.url || product.images?.[0]?.url || ''}
                alt={product.name || 'product'}
                fill
                sizes="80px"
                className="object-contain p-1"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-400">
                <ShoppingBag className="w-8 h-8 opacity-20" />
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0 flex flex-col justify-center gap-1">
            <p className="text-sm font-semibold text-gray-800 line-clamp-2">
              {product.name}
            </p>
            {selectedVariant && (
              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-white bg-[var(--colour-fsP2)] px-2.5 py-0.5 rounded-full w-fit">
                <span className="opacity-70">Color:</span> {selectedVariant}
              </span>
            )}
            <p className="text-sm font-bold text-[var(--colour-fsP2)]">
              Rs. {Number(typeof product.price === 'object' ? (product.price as any)?.current : product.price).toLocaleString()}
            </p>
          </div>
        </div>

        <Separator />

        {/* EMI Breakdown */}
        <div className="space-y-3">
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-600">Duration</span>
            <span className="font-semibold text-gray-900">{emiData.tenure || 12} Months</span>
          </div>

          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-600">Down Payment</span>
            <span className="font-semibold text-gray-900">Rs. {Number(emiData.downPayment || 0).toLocaleString()}</span>
          </div>

          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-600">Loan Amount</span>
            <span className="font-semibold text-gray-900">Rs. {Number(emiData.financeAmount || 0).toLocaleString()}</span>
          </div>

          <div className="pt-3 border-t border-gray-100 flex justify-between items-center">
            <span className="font-bold text-gray-800">Monthly EMI</span>
            <p className="text-xl font-bold text-[var(--colour-fsP2)]">
              Rs. {emiData.paymentpermonth ? Math.round(emiData.paymentpermonth).toLocaleString() : '0'}
            </p>
          </div>
        </div>

        <div className="bg-blue-50 rounded-lg p-3 text-xs font-medium text-blue-900 border border-blue-200">
          Final approval subject to bank policies.
        </div>
      </div>
    </div>
  );
}