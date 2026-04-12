'use client';

import React from 'react';
import Image from 'next/image';
import type { ProductDetails } from '@/app/types/ProductDetailsTypes';
import { type ShippingAddress } from '@/app/checkout/checkoutTypes';
import { CalendarClock, MapPin, Clock } from 'lucide-react';

interface PreOrderSummaryProps {
    product: ProductDetails;
    depositAmount: number;
    productPrice: number;
    currentStep: number;
    selectedAddress: ShippingAddress | null;
    selectedColor?: string;
    variantImage?: string;
}

export default function PreOrderSummary({
    product,
    depositAmount,
    productPrice,
    currentStep,
    selectedAddress,
    selectedColor,
    variantImage,
}: PreOrderSummaryProps) {

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">

            {/* Product Header with Image */}
            <div className="p-5 border-b border-gray-100 bg-gray-50/60">
                <div className="flex items-center gap-2 mb-3">
                    <CalendarClock className="w-4 h-4 text-(--colour-fsP2)" />
                    <span className="text-xs font-bold text-(--colour-fsP2) uppercase tracking-wider">Pre-Order Summary</span>
                </div>
                <div className="flex gap-3">
                    <div className="w-20 h-20 rounded-xl bg-white border border-gray-200 relative shrink-0 overflow-hidden shadow-sm">
                        {variantImage ? (
                            <Image src={variantImage} alt={product.name} fill sizes="80px" className="object-contain p-1" />
                        ) : product.image?.full ? (
                            <Image src={product.image.full} alt={product.name} fill sizes="80px" className="object-contain p-1" />
                        ) : (product as any).thumb?.url ? (
                            <Image src={(product as any).thumb.url} alt={product.name} fill sizes="80px" className="object-contain p-1" />
                        ) : (
                            <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                                <CalendarClock className="w-6 h-6 text-gray-300" />
                            </div>
                        )}
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-gray-900 line-clamp-2 leading-tight">{product.name}</p>

                        {selectedColor && (
                            <p className="inline-block mt-1 text-[10px] font-bold text-[var(--colour-fsP2)] bg-blue-50 px-1.5 py-0.5 rounded border border-blue-100/30 uppercase tracking-wider">
                                Color: {selectedColor}
                            </p>
                        )}

                        <div className="mt-2 pt-1.5 border-t border-gray-100 flex items-center justify-between">
                            <p className="text-[12px] font-medium text-gray-500">
                                1 <span className="text-[10px] mx-0.5">×</span> Rs. {productPrice.toLocaleString()}
                            </p>
                            <p className="text-[13px] font-black text-gray-900">
                                Rs. {productPrice.toLocaleString()}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Financials */}
            <div className="p-6 space-y-4">
                <div className="flex justify-between items-center">
                    <span className="text-gray-500 text-sm font-medium">Product Price</span>
                    {product.pre_order?.price ? (
                        <span className="text-sm font-bold text-gray-900">Rs. {productPrice.toLocaleString()}</span>
                    ) : (
                        <span className="inline-flex items-center gap-1.5 bg-amber-50 border border-amber-200 text-amber-700 text-[11px] font-bold px-3 py-1 rounded-full">
                            <Clock className="w-3.5 h-3.5" />
                            Coming Soon
                        </span>
                    )}
                </div>
                <div className="flex justify-between items-center">
                    <span className="text-gray-500 text-sm font-medium">Shipping</span>
                    <span className="font-bold text-emerald-600 text-sm italic">FREE DELIVERY</span>
                </div>

                <div className="pt-4 border-t border-dashed border-gray-200">
                    <div className="flex justify-between items-center bg-blue-50/50 p-4 rounded-xl border border-blue-100/50">
                        <div>
                            <p className="text-[10px] font-bold text-blue-600 uppercase tracking-widest mb-0.5">Deposit Amount</p>
                            <span className="text-gray-500 text-[10px] font-medium leading-none">To secure your allocation</span>
                        </div>
                        <span className="text-xl font-black text-(--colour-fsP2)">Rs. {depositAmount.toLocaleString()}</span>
                    </div>
                </div>
            </div>

            {/* Address Preview — shown after address step */}
            {selectedAddress && currentStep >= 1 && (
                <div className="px-5 pb-5">
                    <div className="flex items-start gap-3 bg-green-50 border border-green-100 rounded-xl px-3 py-3">
                        <MapPin className="w-4 h-4 text-green-600 shrink-0 mt-0.5" />
                        <div>
                            <p className="text-[10px] font-bold text-green-700 uppercase tracking-wider mb-0.5">Delivery To</p>
                            <p className="text-xs text-gray-700 leading-snug">
                                {selectedAddress.address?.landmark || selectedAddress.address?.city}{selectedAddress.address?.city ? `, ${selectedAddress.address.city}` : ''}
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
