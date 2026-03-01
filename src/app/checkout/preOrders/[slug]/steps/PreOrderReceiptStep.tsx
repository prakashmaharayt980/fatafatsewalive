import React from 'react';
import { ChevronRight, ChevronLeft, MapPin } from 'lucide-react';
import { ProductDetails } from '@/app/types/ProductDetailsTypes';
import { ShippingAddress } from '@/app/checkout/checkoutTypes';
import Image from 'next/image';

interface PreOrderReceiptStepProps {
    product: ProductDetails;
    address: ShippingAddress | null;
    onNext: () => void;
    onBack: () => void;
}

export default function PreOrderReceiptStep({ product, address, onNext, onBack }: PreOrderReceiptStepProps) {
    const productPrice = product.discounted_price || product.price;

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden animate-in fade-in zoom-in-95 duration-300">
            {/* Header */}
            <div className="px-6 py-5 border-b border-gray-100 bg-(--colour-fsP2)">
                <h3 className="text-lg font-bold text-white leading-tight">Review Your Pre-Order</h3>
                <p className="text-white/70 text-xs mt-0.5">Please check delivery details before proceeding to deposit</p>
            </div>

            <div className="p-6 space-y-6">

                {/* Product Summary */}
                <div>
                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Item Details</h4>
                    <div className="flex gap-4 p-4 rounded-xl border border-gray-100 bg-gray-50/50">
                        <div className="w-16 h-16 rounded-xl bg-white border border-gray-200 relative shrink-0 overflow-hidden shadow-sm p-1">
                            {product.image?.full && (
                                <Image src={product.image.full} alt={product.name} fill className="object-contain" />
                            )}
                        </div>
                        <div className="flex-1 min-w-0 flex flex-col justify-center">
                            <p className="text-sm font-bold text-gray-900 leading-tight line-clamp-2 mb-1">{product.name}</p>
                            <p className="text-xs font-semibold text-(--colour-fsP2)">Rs. {productPrice.toLocaleString()}</p>
                        </div>
                    </div>
                </div>

                {/* Address Summary */}
                {address && (
                    <div>
                        <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Delivery Address</h4>
                        <div className="flex items-start gap-3 p-4 rounded-xl border border-blue-100 bg-blue-50/50">
                            <MapPin className="w-5 h-5 text-(--colour-fsP2) shrink-0 mt-0.5" />
                            <div>
                                <p className="text-sm font-semibold text-gray-900">{address.address}</p>
                                <p className="text-xs text-gray-600 mt-1">
                                    {address.city}{address.district ? `, ${address.district}` : ''}
                                </p>
                                <p className="text-xs text-gray-600">
                                    {address.province ? `${address.province}, ` : ''}{address.country || 'Nepal'}
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Navigation */}
                <div className="pt-2 border-t border-gray-100 flex items-center justify-between">
                    <button
                        type="button"
                        onClick={onBack}
                        className="flex items-center gap-1.5 text-sm font-semibold text-gray-500 hover:text-gray-800 transition-colors"
                    >
                        <ChevronLeft className="w-4 h-4" /> Back
                    </button>
                    <button
                        onClick={onNext}
                        className="h-12 px-8 bg-(--colour-fsP2) hover:bg-(--colour-fsP2)/90 text-white font-bold rounded-xl shadow-md transition-all active:scale-95 flex items-center gap-2"
                    >
                        Proceed to Deposit
                        <ChevronRight className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </div>
    );
}
