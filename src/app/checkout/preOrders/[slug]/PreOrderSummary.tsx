'use client';

import React from 'react';
import Image from 'next/image';
import { ProductDetails } from '@/app/types/ProductDetailsTypes';
import { ShippingAddress } from '@/app/checkout/checkoutTypes';
import { CalendarClock, ShieldCheck, MapPin, Banknote, Clock } from 'lucide-react';

interface PreOrderSummaryProps {
    product: ProductDetails;
    depositAmount: number;
    productPrice: number;
    currentStep: number;
    selectedAddress: ShippingAddress | null;
}

export default function PreOrderSummary({
    product,
    depositAmount,
    productPrice,
    currentStep,
    selectedAddress,
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
                        {product.image?.full ? (
                            <Image src={product.image.full} alt={product.name} fill className="object-contain p-1" />
                        ) : (product as any).thumb?.url ? (
                            <Image src={(product as any).thumb.url} alt={product.name} fill className="object-contain p-1" />
                        ) : (
                            <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                                <CalendarClock className="w-6 h-6 text-gray-300" />
                            </div>
                        )}
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-gray-900 line-clamp-2 leading-tight">{product.name}</p>
                        {(product as any).sku && (
                            <p className="text-[10px] text-gray-400 font-medium mt-0.5">SKU: {(product as any).sku}</p>
                        )}
                        <div className="mt-1.5 inline-flex items-center gap-1 bg-(--colour-fsP2)/10 text-(--colour-fsP2) text-[10px] font-bold px-2 py-0.5 rounded border border-(--colour-fsP2)/20">
                            <ShieldCheck className="w-3 h-3" />
                            Guaranteed Allocation
                        </div>
                    </div>
                </div>
            </div>

            {/* Financials */}
            <div className="p-5 space-y-2.5">
                <div className="flex justify-between text-sm items-center">
                    <span className="text-gray-500">Estimated Price</span>
                    <span className="inline-flex items-center gap-1.5 bg-amber-50 border border-amber-200 text-amber-700 text-xs font-bold px-2.5 py-1 rounded-lg">
                        <Clock className="w-3 h-3" />
                        Coming Soon
                    </span>
                </div>
                <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Shipping</span>
                    <span className="font-semibold text-green-600">Free 🚚</span>
                </div>
                <div className="h-px bg-gray-100" />
                <div className="flex justify-between text-sm">
                    <span className="font-bold text-gray-800">Pre-Order Deposit</span>
                    <span className="font-bold text-gray-900">Rs. {depositAmount.toLocaleString()}</span>
                </div>
            </div>

            {/* Deposit Bar — simplified since price is coming soon */}
            <div className="px-5 pb-5">
                <div className="rounded-xl overflow-hidden border border-(--colour-fsP2)/20">
                    <div className="bg-(--colour-fsP2) px-4 py-3 flex items-center justify-between">
                        <div>
                            <p className="text-[10px] font-bold text-white/60 uppercase tracking-wider">To Pay Now</p>
                            <p className="text-2xl font-extrabold text-white">Rs. {depositAmount.toLocaleString()}</p>
                        </div>
                        <div className="text-right">
                            <p className="text-[10px] font-semibold text-white/70">Pre-Order Deposit</p>
                            <div className="flex items-center gap-1 justify-end mt-0.5">
                                <Banknote className="w-3 h-3 text-white/60" />
                                <p className="text-[10px] text-white/60">Digital payment</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-(--colour-fsP2)/5 px-4 py-3 flex justify-between items-center border-t border-(--colour-fsP2)/10">
                        <div>
                            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Remaining Balance</p>
                            <p className="text-sm font-semibold text-gray-600">To be announced</p>
                        </div>
                        <span className="inline-flex items-center gap-1 bg-amber-50 border border-amber-200 text-amber-600 text-[10px] font-bold px-2 py-0.5 rounded">
                            <Clock className="w-2.5 h-2.5" />
                            TBD
                        </span>
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
                                {selectedAddress.address}{selectedAddress.city ? `, ${selectedAddress.city}` : ''}
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
