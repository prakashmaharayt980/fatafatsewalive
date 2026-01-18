'use client'

import Image from 'next/image';
import React from 'react';

export default function EmiProductDetails({ emiData, product, selectedVariant }: { emiData: any, product: any, selectedVariant?: string }) {
  if (!product) return null;

  return (
    <div className="w-full lg:w-96 flex-shrink-0">
      <div className="sticky top-8 space-y-6">
        {/* Product Card */}
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
          <div className="p-6 pb-0">
            <div className="aspect-square relative bg-gray-50 rounded-xl overflow-hidden mb-6">
              <Image
                src={product.image?.full || ''}
                alt={product.name || 'product summary'}
                fill
                className="object-contain p-4 transition-transform duration-500 hover:scale-105"
                priority
              />
            </div>
          </div>

          <div className="px-6 pb-6 border-b border-gray-100">
            <h3 className="text-lg font-bold text-gray-900 leading-tight mb-2">{product?.name}</h3>
            <div className="flex flex-col gap-1">
              <div className="flex items-baseline gap-2">
                <span className="text-xs text-gray-500 uppercase tracking-wide font-medium">Cash Price</span>
                <span className="text-xl font-bold text-gray-900">Rs {Number(product?.price || 0).toLocaleString()}</span>
              </div>
              {selectedVariant && (
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs text-gray-500 uppercase tracking-wide font-medium">Color:</span>
                  <span className="text-sm font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-100">{selectedVariant}</span>
                </div>
              )}
            </div>
          </div>

          <div className="p-6 bg-gray-50/50 space-y-4">
            <div className="flex justify-between items-center pb-4 border-b border-gray-200/50">
              <div className="space-y-1">
                <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Estimated EMI</p>
                <p className="text-2xl font-bold text-blue-600">
                  Rs. {emiData.paymentpermonth ? Math.round(emiData.paymentpermonth).toLocaleString() : '0'}
                  <span className="text-xs text-gray-400 font-normal ml-1">/mo</span>
                </p>
              </div>
              <div className="text-right space-y-1">
                <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Duration</p>
                <p className="text-lg font-bold text-gray-900">{emiData.tenure || 12} <span className="text-xs text-gray-500 font-normal">Mos</span></p>
              </div>
            </div>

            <div className="space-y-3 pt-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Down Payment</span>
                <span className="font-semibold text-gray-900">Rs. {Number(emiData.downPayment || 0).toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Loan Amount</span>
                <span className="font-semibold text-gray-900">Rs. {Number(emiData.financeAmount || 0).toLocaleString()}</span>
              </div>
            </div>
          </div>
          <div className="px-6 py-4 bg-gray-50 flex items-center gap-3 border-t border-gray-100">
            <div className="p-2 bg-blue-100/50 rounded-full text-blue-600">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            </div>
            <p className="text-xs text-gray-600 leading-tight">
              EMI calculated on bank's interest rate. Final approval subject to bank policies.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}