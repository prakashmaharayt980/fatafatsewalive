'use client';

import React from 'react';
import { Wallet, Check, ChevronLeft, Loader2, ShoppingBag, AlertCircle, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import type { CheckoutState } from '../checkoutTypes';

import esewaImg from '@/public/imgfile/esewa.png';
import khaltiImg from '@/public/imgfile/khalti.webp';
import nicAsiaImg from '@/public/imgfile/bankingPartners11.png';
import handshakeIcon from '@/public/imgfile/handshakeIcon.webp';

interface Props {
    state: CheckoutState;
    onPaymentMethodChange: (method: string) => void;
    onPlaceOrder: () => void;
    onBack: () => void;
    isSubmitting: boolean;
    error?: string | null;
    onClearError?: () => void;
}

const PAYMENT_METHODS = [
    { id: 1, name: 'Esewa',            img: esewaImg,      description: 'You will be redirected to eSewa to complete your purchase.',        recommended: true  },
    { id: 2, name: 'Khalti',           img: khaltiImg,     description: 'You will be redirected to Khalti to complete your purchase.',       recommended: true  },
    { id: 3, name: 'Nic-Asia',         img: nicAsiaImg,    description: 'You will be redirected to NIC Asia to complete your purchase.',     recommended: false },
    { id: 4, name: 'Cash on Delivery', img: handshakeIcon, description: 'Pay cash upon receiving your order.',                               recommended: false },
];

export default function PaymentStep({ state, onPaymentMethodChange, onPlaceOrder, onBack, isSubmitting, error, onClearError }: Props) {
    const { paymentMethod } = state;
    const isComplete = paymentMethod !== '';

    return (
        <div className="animate-fade-in-premium space-y-6">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">

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
                    <div className="grid gap-3 sm:grid-cols-2">
                        {PAYMENT_METHODS.map(method => {
                            const isSelected = paymentMethod === method.name;
                            return (
                                <button
                                    key={method.id}
                                    onClick={() => onPaymentMethodChange(method.name)}
                                    className={`relative p-3 rounded-xl border-2 text-left transition-all duration-200 group overflow-hidden cursor-pointer ${
                                        isSelected
                                            ? 'border-[var(--colour-fsP2)] bg-blue-50/40 shadow-sm'
                                            : 'border-gray-100 bg-white hover:border-gray-200'
                                    }`}
                                >
                                    {method.recommended && (
                                        <div className="absolute top-0 right-0 bg-[var(--colour-fsP1)] text-white text-[9px] font-extrabold px-2 py-0.5 rounded-bl-lg z-10 tracking-widest uppercase">
                                            BEST
                                        </div>
                                    )}

                                    <div className="flex items-center gap-3">
                                        <div className={`relative w-12 h-12 rounded-lg flex items-center justify-center p-1.5 transition-colors border flex-shrink-0 ${
                                            isSelected ? 'bg-white border-blue-100 shadow-sm' : 'bg-gray-50 border-gray-100'
                                        }`}>
                                            <Image src={method.img} alt={method.name} fill sizes="48px" className="object-contain p-0.5" />
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

            {/* Error banner */}
            {error && (
                <div className="flex items-center gap-3 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span className="flex-1 font-medium">{error}</span>
                    <button onClick={onClearError} className="shrink-0 text-red-400 hover:text-red-600 cursor-pointer">
                        <X className="w-4 h-4" />
                    </button>
                </div>
            )}

            {/* Navigation */}
            <div className="flex flex-col-reverse sm:flex-row justify-between gap-3 pt-4 border-t border-gray-100">
                <Button
                    onClick={onBack}
                    variant="outline"
                    disabled={isSubmitting}
                    className="w-full sm:w-auto h-12 px-6 border border-gray-200 text-gray-500 font-bold rounded-xl hover:bg-gray-50 hover:text-gray-700 transition-all text-sm shadow-sm active:scale-95 cursor-pointer"
                >
                    <ChevronLeft className="w-4 h-4 mr-1.5" />
                    Back
                </Button>
                <Button
                    onClick={onPlaceOrder}
                    disabled={!isComplete || isSubmitting}
                    className="w-full sm:w-auto h-12 px-6 sm:px-10 bg-[var(--colour-fsP2)] hover:bg-blue-700 text-white font-extrabold rounded-xl shadow-lg shadow-blue-100/50 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed text-sm flex items-center justify-center gap-2 cursor-pointer"
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
