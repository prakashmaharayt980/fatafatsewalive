'use client';

import React, { useState } from 'react';
import {
    MapPin, User, Truck, CreditCard, ChevronLeft, ShoppingBag, Check,
    Gift, EyeOff, Edit2, Clock, Loader2, ShieldCheck, ArrowRight, Package, AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { CheckoutState, RECIPIENT_TYPES, CHECKOUT_STEPS, CheckoutStep } from '../checkoutTypes';
import { useContextCart } from '../CartContext1';
import { checkoutReviewSchema } from '../checkoutValidation';
import * as yup from 'yup';

interface OrderReviewStepProps {
    state: CheckoutState;
    onGoToStep: (step: CheckoutStep) => void;
    onBack: () => void;
    onPlaceOrder: () => void;
    isSubmitting: boolean;
    shippingCost: number;
    discount: number;
}

export default function OrderReviewStep({
    state,
    onGoToStep,
    onBack,
    onPlaceOrder,
    isSubmitting,
    shippingCost,
    discount,
}: OrderReviewStepProps) {
    const { cartItems } = useContextCart();
    const { address, recipient, delivery, paymentMethod } = state;

    const [errors, setErrors] = useState<{ [key: string]: string | null }>({});

    const handleValidateAndPlaceOrder = async () => {
        try {
            await checkoutReviewSchema.validate(state, { abortEarly: false });
            setErrors({});
            onPlaceOrder();
        } catch (err) {
            if (err instanceof yup.ValidationError) {
                const newErrors: { [key: string]: string | null } = {};
                err.inner.forEach((error) => {
                    if (error.path) {
                        if (error.path.startsWith('address')) newErrors['address'] = error.message;
                        else if (error.path.startsWith('recipient')) newErrors['recipient'] = error.message;
                        else if (error.path.startsWith('delivery')) newErrors['delivery'] = error.message;
                        else if (error.path.startsWith('paymentMethod')) newErrors['payment'] = error.message;
                        else newErrors[error.path] = error.message;
                    }
                });
                setErrors(newErrors);

                // Scroll to first error
                const firstErrorKey = Object.keys(newErrors)[0];
                const element = document.getElementById(`well-${firstErrorKey}`);
                if (element) {
                    element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
            } else {
                console.error("Validation error:", err);
            }
        }
    };

    const ReviewWell = ({
        icon: Icon,
        title,
        step,
        children,
        errorId,
        errorMessage
    }: {
        icon: React.ElementType;
        title: string;
        step: CheckoutStep;
        children: React.ReactNode;
        errorId: string;
        errorMessage?: string | null;
    }) => (
        <div
            id={`well-${errorId}`}
            className={`p-5 rounded-xl h-full transition-all duration-300 ${errorMessage
                ? 'bg-red-50 border-2 border-red-500 shadow-md animate-pulse-short'
                : 'bg-gray-50 border-2 border-transparent'
                }`}
        >
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                    <Icon className={`w-4 h-4 ${errorMessage ? 'text-red-500' : 'text-[var(--colour-fsP2)]'}`} />
                    <span className={`font-extrabold text-xs uppercase tracking-wider ${errorMessage ? 'text-red-600' : 'text-[var(--colour-fsP2)]'}`}>
                        {title}
                    </span>
                </div>
                <button
                    onClick={() => onGoToStep(step)}
                    className="text-[10px] font-bold text-gray-400 hover:text-[var(--colour-fsP2)] flex items-center gap-1 transition-colors uppercase tracking-wide"
                >
                    Edit <Edit2 className="w-3 h-3" />
                </button>
            </div>

            <div>{children}</div>

            {errorMessage && (
                <div className="mt-3 pt-3 border-t border-red-200 flex items-start gap-2 text-red-600 animate-slide-down">
                    <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                    <span className="text-xs font-bold">{errorMessage}</span>
                </div>
            )}
        </div>
    );

    return (
        <div className="animate-fade-in-premium space-y-6">

            <div className="bg-white rounded-2xl shadow-[var(--shadow-premium-sm)] border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-100 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
                        <ShoppingBag className="w-5 h-5 text-[var(--colour-fsP2)]" />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-gray-900">Review Your Order</h3>
                        <p className="text-xs text-gray-500 font-medium">Please check your details before confirming</p>
                    </div>
                </div>

                <div className="p-6 space-y-6">

                    <div className="grid gap-4 lg:grid-cols-2">
                        {/* 1. Address Well */}
                        <ReviewWell
                            icon={MapPin}
                            title="Shipping To"
                            step={CHECKOUT_STEPS.ADDRESS}
                            errorId="address"
                            errorMessage={errors['address']}
                        >
                            {address ? (
                                <div className="space-y-1">

                                    <p className="text-sm text-gray-700 font-medium leading-relaxed">{address.address}</p>
                                    <div className="flex items-center gap-2 pt-1">
                                        <span className="text-[10px] font-bold text-gray-500 bg-white border border-gray-200 px-2 py-0.5 rounded uppercase">{address.label || 'Home'}</span>
                                        <span className="text-xs text-gray-500">{address.city}, {address.state}</span>
                                    </div>

                                </div>
                            ) : (
                                <p className="text-gray-400 text-sm italic">
                                    No address selected
                                </p>
                            )}
                        </ReviewWell>

                        {/* 2. Recipient Well */}
                        <ReviewWell
                            icon={User}
                            title="Recipient"
                            step={CHECKOUT_STEPS.RECIPIENT}
                            errorId="recipient"
                            errorMessage={errors['recipient']}
                        >
                            <div className="space-y-3">
                                {recipient.type === RECIPIENT_TYPES.SELF ? (
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-500">
                                            <User className="w-4 h-4" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-gray-900">Myself</p>
                                            <p className="text-[10px] font-bold text-gray-400 uppercase">Receiver</p>
                                        </div>
                                    </div>
                                ) : recipient.type === RECIPIENT_TYPES.GIFT ? (
                                    <div className="flex items-start gap-3">
                                        <div className="w-8 h-8 rounded-full bg-pink-50 border border-pink-100 flex items-center justify-center text-pink-500">
                                            <Gift className="w-4 h-4" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-gray-900">Gift for {recipient.name}</p>
                                            <p className="text-xs text-gray-500 font-mono">{recipient.phone}</p>
                                            {recipient.message && (
                                                <p className="text-xs text-gray-600 italic mt-1 bg-white p-2 rounded border border-gray-200">
                                                    "{recipient.message}"
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-gray-900 flex items-center justify-center text-white">
                                            <EyeOff className="w-4 h-4" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-gray-900">Anonymous</p>
                                            <p className="text-[10px] font-bold text-gray-400 uppercase">Hidden Sender</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </ReviewWell>

                        {/* 3. Delivery Well */}
                        <ReviewWell
                            icon={Truck}
                            title="Delivery"
                            step={CHECKOUT_STEPS.DELIVERY}
                            errorId="delivery"
                            errorMessage={errors['delivery']}
                        >
                            {delivery.partner ? (
                                <div className="flex items-center gap-4">
                                    <div className="relative w-12 h-12 rounded-lg bg-white border border-gray-200 p-1 flex-shrink-0">
                                        <Image
                                            src={delivery.partner.img}
                                            alt={delivery.partner.name}
                                            fill
                                            className="object-contain p-1"
                                        />
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-gray-900 leading-tight">{delivery.partner.name}</p>
                                        <div className="flex items-center gap-1.5 mt-0.5">
                                            <Clock className="w-3.5 h-3.5 text-gray-400" />
                                            <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">
                                                {delivery.partner.estimatedDays || 'Standard Shipping'}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <p className="text-gray-400 text-sm italic">
                                    No delivery method selected
                                </p>
                            )}
                        </ReviewWell>

                        {/* 4. Payment Well */}
                        <ReviewWell
                            icon={CreditCard}
                            title="Payment"
                            step={CHECKOUT_STEPS.PAYMENT}
                            errorId="payment"
                            errorMessage={errors['payment']}
                        >
                            {paymentMethod ? (
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="text-sm font-bold text-gray-900">{paymentMethod}</span>
                                        <span className="text-[10px] text-green-600 bg-green-50 px-1.5 py-0.5 rounded font-bold flex items-center gap-0.5 border border-green-100">
                                            <ShieldCheck className="w-3 h-3" /> SECURE
                                        </span>
                                    </div>
                                    <p className="text-xs text-gray-500 font-medium">Order will be processed securely</p>
                                </div>
                            ) : (
                                <p className="text-gray-400 text-sm italic">
                                    No payment method selected
                                </p>
                            )}
                        </ReviewWell>
                    </div>
                </div>
            </div>

            <div className="flex flex-col-reverse sm:flex-row justify-between gap-4 pt-6 border-t border-gray-100">
                <Button
                    onClick={onBack}
                    variant="outline"
                    className="h-12 px-6 border-gray-200 text-gray-700 font-bold rounded-xl hover:bg-gray-50 text-sm transition-all"
                >
                    <ChevronLeft className="w-4 h-4 mr-1" />
                    Back to Payment
                </Button>

                <Button
                    onClick={handleValidateAndPlaceOrder}
                    disabled={isSubmitting}
                    className="flex-1 sm:flex-none h-12 px-8 bg-[var(--colour-fsP2)] hover:bg-blue-700 text-white text-base font-bold rounded-xl shadow-lg shadow-blue-200 hover:shadow-xl transition-all active:scale-95 flex items-center justify-center gap-2"
                >
                    {isSubmitting ? (
                        <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            Processing...
                        </>
                    ) : (
                        <>
                            Place Order
                            <ArrowRight className="w-5 h-5 ml-1" />
                        </>
                    )}
                </Button>
            </div>
        </div >
    );
}
