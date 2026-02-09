'use client'

import Image from 'next/image';
import React from 'react';
import { ShoppingBag } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

export default function EmiProductDetails({ emiData, product, selectedVariant }: { emiData: any, product: any, selectedVariant?: string }) {
  if (!product) return null;

  return (
    <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden sticky top-24">
      {/* Header */}
      <div className="bg-[var(--colour-fsP2)] p-4 text-white">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-base">Order Summary</h3>
          <span className="text-xs font-medium bg-white/20 px-2 py-1 rounded text-white/90">
            {product.name?.substring(0, 20)}...
          </span>
        </div>
      </div>

      <div className="p-5 space-y-5 bg-white">
        {/* Product Details */}
        <div className="flex gap-4">
          <div className="relative w-20 h-20 flex-shrink-0 overflow-hidden rounded-lg border border-gray-100 bg-gray-50">
            <Image
              src={product.image?.full || ''}
              alt={product.name || 'product'}
              fill
              className="object-contain p-1"
            />
          </div>
          <div className="flex-1 min-w-0 flex flex-col justify-center">
            <p className="text-sm font-semibold text-gray-800 line-clamp-2 mb-1">
              {product.name}
            </p>
            {selectedVariant && (
              <span className="text-xs font-medium text-gray-500 block">
                Color: <span className="text-gray-900">{selectedVariant}</span>
              </span>
            )}
            <p className="text-sm font-bold text-[var(--colour-fsP2)] mt-1">
              Rs. {Number(product.price).toLocaleString()}
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

        <div className="bg-blue-50/50 rounded-lg p-3 text-xs text-blue-800 border border-blue-100">
          Final approval subject to bank policies.
        </div>
      </div>
    </div>
  );
}