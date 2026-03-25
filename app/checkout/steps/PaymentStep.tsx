'use client';

import React from 'react';
import { Wallet, Check, Shield, CircleDollarSign, ChevronLeft, Loader2, ShoppingBag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import type { CheckoutState } from '../checkoutTypes';
import { PaymentMethodsOptions } from '../../CommonVue/Payment';
import { useAuthStore } from '@/app/context/AuthContext';
import { useShallow } from 'zustand/react/shallow';
import handshakeIcon from '@/public/imgfile/handshakeIcon.webp';


interface PaymentStepProps {
    state: CheckoutState;
    onPaymentMethodChange: (method: string) => void;
    onPlaceOrder: () => void;
    onBack: () => void;
    isSubmitting: boolean;
}

// Combine all methods into one structured list
const allPaymentMethods = [
    ...PaymentMethodsOptions.map(m => ({ ...m, type: 'Digital Wallet' })),
    {
        name: 'Cash on Delivery',
        img: handshakeIcon,
        id: 99,
        description: 'Pay cash upon receiving your order',
        type: 'Cash'
    },
];

export default function PaymentStep({ state, onPaymentMethodChange, onPlaceOrder, onBack, isSubmitting }: PaymentStepProps) {
    const { paymentMethod } = state;
    const { isLoggedIn, triggerLoginAlert } = useAuthStore(useShallow(state => ({
        isLoggedIn: state.isLoggedIn,
        triggerLoginAlert: state.triggerLoginAlert
    })));


    const isComplete = paymentMethod !== '';

    return (
        <div className="animate-fade-in-premium space-y-6">
            <div className="bg-white rounded-2xl shadow-[var(--shadow-premium-sm)] border border-gray-100 overflow-hidden">
                {/* Header */}
                <div className="p-4 border-b border-gray-100 bg-gradient-to-r from-white to-blue-50/20">
                    <div className="flex items-center gap-3">
                        <Wallet className="w-5 h-5 text-[var(--colour-fsP2)]" />
                        <div>
                            <h3 className="text-lg font-bold text-gray-900 leading-none">Payment Method</h3>
                            <p className="text-[11px] text-gray-500 mt-1">Select a secure payment option to proceed</p>
                        </div>
                    </div>
                </div>

                <div className="p-4 space-y-4 max-h-[55vh] overflow-y-auto">
                    {/* Unified Grid Layout */}
                    <div className="grid gap-3 sm:grid-cols-2">
                        {allPaymentMethods.map((method) => {
                            const isSelected = paymentMethod === method.name;
                            const isRecommended = ['Esewa', 'Khalti'].includes(method.name);

                            return (
                                <button
                                    key={method.id}
                                    onClick={() => onPaymentMethodChange(method.name)}
                                    className={`relative p-3 rounded-xl border-2 text-left transition-all duration-200 group overflow-hidden ${isSelected
                                        ? 'border-[var(--colour-fsP2)] bg-blue-50/40 shadow-sm'
                                        : 'border-gray-50 bg-white hover:border-gray-200'
                                        }`}
                                >
                                    {/* Recommended Badge */}
                                    {isRecommended && (
                                        <div className="absolute top-0 right-0 bg-[var(--colour-fsP1)] text-white text-[9px] font-extrabold px-2 py-0.5 rounded-bl-lg z-10 tracking-widest uppercase">
                                            BEST
                                        </div>
                                    )}

                                    <div className="flex items-center gap-3">
                                        {/* Logo Container */}
                                        <div className={`relative w-12 h-12 rounded-lg flex items-center justify-center p-1.5 transition-colors border flex-shrink-0 ${isSelected ? 'bg-white border-blue-100 shadow-sm' : 'bg-gray-50 border-gray-100'
                                            }`}>
                                            <Image
                                                src={method.img}
                                                alt={method.name}
                                                fill
                                                sizes="48px"
                                                className="object-contain p-0.5"
                                            />
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between gap-1 mb-0.5">
                                                <h4 className={`font-bold text-[13px] line-clamp-1 ${isSelected ? 'text-[var(--colour-fsP2)]' : 'text-gray-900'}`}>
                                                    {method.name}
                                                </h4>
                                                {isSelected && (
                                                    <div className="w-4 h-4 rounded-full bg-[var(--colour-fsP2)] flex items-center justify-center shrink-0 shadow-sm">
                                                        <Check className="w-2.5 h-2.5 text-white" strokeWidth={4} />
                                                    </div>
                                                )}
                                            </div>
                                            <p className="text-[10px] text-gray-500 line-clamp-2 leading-tight">
                                                {method.description}
                                            </p>
                                        </div>
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Navigation Buttons */}
            <div className="flex flex-col-reverse sm:flex-row justify-between gap-3 pt-2">
                <Button
                    onClick={onBack}
                    variant="outline"
                    className="h-10 px-5 border-gray-200 text-gray-600 font-bold rounded-xl hover:bg-gray-50 text-[13px]"
                    disabled={isSubmitting}
                >
                    <ChevronLeft className="w-4 h-4 mr-1" />
                    Back
                </Button>
                <Button
                    onClick={onPlaceOrder}
                    disabled={!isComplete || isSubmitting}
                    className="flex-1 sm:flex-none h-10 px-8 bg-[var(--colour-fsP2)] hover:bg-[var(--colour-fsP1)] text-white font-extrabold rounded-xl shadow-md shadow-blue-100 transition-all hover:translate-y-[-1px] active:translate-y-[1px] disabled:opacity-50 disabled:cursor-not-allowed text-[13px] flex items-center justify-center gap-2"
                >
                    {isSubmitting ? (
                        <>
                            <Loader2 className="w-4 h-4 animate-spin text-white" />
                            Processing Order...
                        </>
                    ) : (
                        <>
                            <ShoppingBag className="w-4 h-4" />
                            Place Order
                        </>
                    )}
                </Button>
            </div>
        </div>
    );
}
