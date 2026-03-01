'use client';

import React from 'react';
import { Wallet, Check, ChevronLeft, Loader2, ShoppingBag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { PaymentMethodsOptions } from '@/app/CommonVue/Payment';

// Notice: We strictly omit Cash on Delivery for Pre-orders
const allPaymentMethods = [
    ...PaymentMethodsOptions.map(m => ({ ...m, type: 'Digital Wallet' })),
];

interface PreOrderPaymentStepProps {
    paymentMethod: string;
    onPaymentMethodChange: (method: string) => void;
    onPlaceOrder: () => void;
    onBack: () => void;
    isSubmitting: boolean;
}

export default function PreOrderPaymentStep({
    paymentMethod,
    onPaymentMethodChange,
    onPlaceOrder,
    onBack,
    isSubmitting
}: PreOrderPaymentStepProps) {

    const isComplete = paymentMethod !== '';

    return (
        <div className="animate-in fade-in zoom-in-95 duration-300 space-y-6">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                {/* Header */}
                <div className="p-6 border-b border-gray-100 bg-white">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-(--colour-fsP2)/10 flex items-center justify-center">
                            <Wallet className="w-6 h-6 text-(--colour-fsP2)" />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-gray-900">Digital Payment</h3>
                            <p className="text-sm text-gray-500">Cash on delivery is not available for Pre-orders</p>
                        </div>
                    </div>
                </div>

                <div className="p-6 space-y-6 max-h-[55vh] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent">
                    <div className="grid gap-4 sm:grid-cols-2">
                        {allPaymentMethods.map((method) => {
                            const isSelected = paymentMethod === method.name;
                            const isRecommended = ['Esewa', 'Khalti'].includes(method.name);

                            return (
                                <button
                                    key={method.id}
                                    onClick={() => onPaymentMethodChange(method.name)}
                                    className={`relative p-4 rounded-xl border-2 text-left transition-all duration-300 group overflow-hidden ${isSelected
                                            ? 'border-(--colour-fsP2)/30 bg-(--colour-fsP2)/5'
                                            : 'border-gray-100 bg-white hover:border-gray-200 hover:shadow-md'
                                        }`}
                                >
                                    {isRecommended && (
                                        <div className="absolute top-0 right-0 bg-(--colour-fsP2) text-white text-[10px] font-bold px-2 py-0.5 rounded-bl-lg z-10">
                                            POPULAR
                                        </div>
                                    )}

                                    <div className="flex items-start gap-4 h-full">
                                        <div className={`relative w-14 h-14 rounded-lg flex items-center justify-center p-2 transition-colors border shrink-0 ${isSelected ? 'bg-white border-(--colour-fsP2)/20' : 'bg-gray-50 border-gray-100'
                                            }`}>
                                            <Image
                                                src={method.img}
                                                alt={method.name}
                                                fill
                                                sizes="56px"
                                                className="object-contain p-1"
                                            />
                                        </div>

                                        <div className="flex-1 min-w-0 pt-0.5 flex flex-col justify-between h-full">
                                            <div>
                                                <div className="flex items-center justify-between mb-1">
                                                    <h4 className={`font-bold text-sm ${isSelected ? 'text-(--colour-fsP2)' : 'text-gray-900'}`}>
                                                        {method.name}
                                                    </h4>
                                                    {isSelected && <Check className="w-5 h-5 text-(--colour-fsP2)" strokeWidth={3} />}
                                                </div>
                                                <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">
                                                    {method.description}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Navigation Buttons */}
            <div className="flex flex-col-reverse sm:flex-row justify-between gap-4 pt-6 border-t border-gray-100">
                <Button
                    onClick={onBack}
                    variant="outline"
                    className="h-11 px-6 border-gray-200 text-gray-700 font-bold rounded-xl hover:bg-gray-50 text-sm"
                    disabled={isSubmitting}
                >
                    <ChevronLeft className="w-4 h-4 mr-1" />
                    Back
                </Button>
                <Button
                    onClick={onPlaceOrder}
                    disabled={!isComplete || isSubmitting}
                    className="flex-1 sm:flex-none h-12 px-8 bg-(--colour-fsP2) hover:bg-(--colour-fsP2)/90 text-white font-bold rounded-xl shadow-md transition-all hover:shadow-lg active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed text-base flex items-center justify-center gap-2"
                >
                    {isSubmitting ? (
                        <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            Processing...
                        </>
                    ) : (
                        <>
                            <ShoppingBag className="w-5 h-5" />
                            Pre-order Now
                        </>
                    )}
                </Button>
            </div>
        </div>
    );
}
