'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { useContextCart } from './CartContext1';
import RemoteServices from '../api/remoteservice';
import { useAuth } from '../context/AuthContext';
import {
    CheckoutState,
    CheckoutStep,
    CHECKOUT_STEPS,
    initialCheckoutState,
    ShippingAddress,
    RecipientInfo,
    DeliverySelection,
    isStepComplete,
    STEP_LABELS,
} from './checkoutTypes';

// Step Components
import StepProgress from './steps/StepProgress';
import AddressStep from './steps/AddressStep';
import RecipientStep from './steps/RecipientStep';
import DeliveryStep from './steps/DeliveryStep';
import PaymentStep from './steps/PaymentStep';
import OrderReviewStep from './steps/OrderReviewStep';
import CheckoutProduct from './CheckoutProduct';

export default function CheckoutClient() {
    const { cartItems } = useContextCart();
    const { authState, isLoading, triggerLoginAlert } = useAuth();
    const userInfo = authState.user;

    // Checkout state
    const [checkoutState, setCheckoutState] = useState<CheckoutState>(initialCheckoutState);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [shippingCost, setShippingCost] = useState(0);
    const [promoCode, setPromoCode] = useState('');
    const [appliedPromo, setAppliedPromo] = useState<{ code: string; discount: number } | null>(null);

    // Auth protection
    useEffect(() => {
        if (!isLoading && !authState.user) {
            triggerLoginAlert();
        }
    }, [isLoading, authState.user, triggerLoginAlert]);

    // Calculate shipping based on address
    useEffect(() => {
        // Free Shipping Policy - All over Nepal
        setShippingCost(0);
    }, [checkoutState.address]);

    // Navigation helpers
    const goToStep = useCallback((step: CheckoutStep) => {
        setCheckoutState((prev) => ({ ...prev, currentStep: step }));
    }, []);

    const nextStep = useCallback(() => {
        const { currentStep } = checkoutState;
        if (currentStep < CHECKOUT_STEPS.PAYMENT && isStepComplete(currentStep, checkoutState)) {
            setCheckoutState((prev) => ({ ...prev, currentStep: (currentStep + 1) as CheckoutStep }));
        }
    }, [checkoutState]);

    const prevStep = useCallback(() => {
        const { currentStep } = checkoutState;
        if (currentStep > CHECKOUT_STEPS.ADDRESS) {
            setCheckoutState((prev) => ({ ...prev, currentStep: (currentStep - 1) as CheckoutStep }));
        }
    }, [checkoutState]);

    // State update handlers
    const handleAddressSelect = useCallback((address: ShippingAddress) => {
        setCheckoutState((prev) => ({ ...prev, address }));
    }, []);

    const handleLocationPermissionChange = useCallback((granted: boolean) => {
        setCheckoutState((prev) => ({ ...prev, locationPermissionGranted: granted }));
    }, []);

    const handleRecipientChange = useCallback((recipient: RecipientInfo) => {
        setCheckoutState((prev) => ({ ...prev, recipient }));
    }, []);

    const handleDeliveryChange = useCallback((delivery: DeliverySelection) => {
        setCheckoutState((prev) => ({ ...prev, delivery }));
    }, []);

    const handlePaymentMethodChange = useCallback((paymentMethod: string) => {
        setCheckoutState((prev) => ({ ...prev, paymentMethod }));
    }, []);

    // Promo handling
    const handleApplyPromo = useCallback(() => {
        const code = promoCode.trim().toUpperCase();
        if (!code) return;

        const subtotal = cartItems?.cart_total || 0;
        if (code === 'SAVE10') {
            const discountAmount = Math.round(subtotal * 0.1);
            setAppliedPromo({ code: 'SAVE10', discount: discountAmount });
        } else if (code === 'FLAT500') {
            setAppliedPromo({ code: 'FLAT500', discount: 500 });
        } else {
            alert('Invalid promo code');
            setAppliedPromo(null);
        }
    }, [promoCode, cartItems]);

    // Payment handler
    const handlePayment = async (orderId: string, amount: number) => {
        const paymentMethodName = checkoutState.paymentMethod.toLowerCase();

        if (paymentMethodName.includes('esewa')) {
            const params = {
                amt: amount,
                psc: 0,
                pdc: 0,
                txAmt: 0,
                tAmt: amount,
                pid: orderId,
                scd: 'EPAYTEST',
                su: `${window.location.origin}/checkout/Successpage?oid=${orderId}`,
                fu: `${window.location.origin}/checkout/failed`,
            };

            const form = document.createElement('form');
            form.setAttribute('method', 'POST');
            form.setAttribute('action', 'https://uat.esewa.com.np/epay/main');

            for (const key in params) {
                const hiddenField = document.createElement('input');
                hiddenField.setAttribute('type', 'hidden');
                hiddenField.setAttribute('name', key);
                hiddenField.setAttribute('value', (params as any)[key]);
                form.appendChild(hiddenField);
            }
            document.body.appendChild(form);
            form.submit();
        } else if (paymentMethodName.includes('khalti')) {
            alert('Khalti Test Mode Integration: Redirecting to mock success.');
            window.location.href = `/checkout/Successpage?oid=${orderId}`;
        } else {
            window.location.href = `/checkout/Successpage?oid=${orderId}`;
        }
    };

    // Order submission
    const handlePlaceOrder = async () => {
        try {
            setIsSubmitting(true);
            const currentItems = cartItems?.items || [];
            const subtotal = cartItems?.cart_total || 0;
            const finalTotal = subtotal - (appliedPromo?.discount || 0);

            const payload = {

                full_name: userInfo?.name,
                products: currentItems.map((item: any) => ({
                    product_id: item.product?.id || item.id,
                    quantity: item.quantity || 1,
                })),
                shipping_address_id: checkoutState.address?.id,
                total_amount: finalTotal,
                payment_type: checkoutState.paymentMethod.toLowerCase().replace(/\s+/g, '_'),
                promo_code: appliedPromo?.code || null,

                recipient: {
                    self_phone: checkoutState.recipient.type === 'self' ? checkoutState.recipient.phone : null,
                    gift_recipient_name: checkoutState.recipient.type === 'gift' ? checkoutState.recipient.name : null,
                    gift_recipient_phone: checkoutState.recipient.type === 'gift' ? checkoutState.recipient.phone : null,
                    gift_message: checkoutState.recipient.type === 'gift' ? checkoutState.recipient.message : null,
                },



            };

            console.log('Submitting Order Payload:', payload);

            const res = await RemoteServices.CreateOrder(payload);
            console.log('Order Response:', res);
            if (res?.id || res?.data?.id) {
                const oid = res.id || res.data.id;
                await handlePayment(oid, finalTotal);
            }
        } catch (error) {
            console.error('Order Error', error);
            setIsSubmitting(false);
        }
    };

    // Loading state
    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--colour-fsP1)]" />
            </div>
        );
    }

    if (!authState.user) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <p>Please log in to continue.</p>
            </div>
        );
    }

    // Render current step
    const renderStep = () => {
        switch (checkoutState.currentStep) {
            case CHECKOUT_STEPS.ADDRESS:
                return (
                    <AddressStep
                        state={checkoutState}
                        onAddressSelect={handleAddressSelect}
                        onLocationPermissionChange={handleLocationPermissionChange}
                        onNext={nextStep}
                    />
                );
            case CHECKOUT_STEPS.RECIPIENT:
                return (
                    <RecipientStep
                        state={checkoutState}
                        onRecipientChange={handleRecipientChange}
                        onNext={nextStep}
                        onBack={prevStep}
                    />
                );

            case CHECKOUT_STEPS.PAYMENT:
                return (
                    <PaymentStep
                        state={checkoutState}
                        onPaymentMethodChange={handlePaymentMethodChange}
                        onPlaceOrder={handlePlaceOrder}
                        onBack={prevStep}
                        isSubmitting={isSubmitting}
                    />
                );

            default:
                return null;
        }
    };

    const subtotal = cartItems?.cart_total || 0;
    const discount = appliedPromo?.discount || 0;
    const total = subtotal + shippingCost - discount;

    return (
        <div className="bg-gray-50 py-4 sm:py-8 min-h-screen">
            <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
                {/* Breadcrumb Navigation */}
                <nav className="flex items-center gap-1.5 text-sm mb-4 overflow-x-auto pb-1 scrollbar-hide">
                    <Link href="/" className="text-[var(--colour-fsP2)] hover:text-[var(--colour-fsP1)] whitespace-nowrap text-sm font-medium transition-colors">
                        Home
                    </Link>
                    <ChevronRight className="w-4 h-4 text-gray-400 flex-shrink-0" />
                    <Link href="/cart" className="text-[var(--colour-fsP2)] hover:text-[var(--colour-fsP1)] whitespace-nowrap text-sm font-medium transition-colors">
                        Cart
                    </Link>
                    <ChevronRight className="w-4 h-4 text-gray-400 flex-shrink-0" />
                    <span className="text-slate-800 font-semibold text-sm">
                        Checkout
                    </span>
                    {checkoutState.currentStep > 0 && (
                        <>
                            <ChevronRight className="w-4 h-4 text-gray-400 flex-shrink-0" />
                            <span className="text-[var(--colour-fsP2)] font-medium text-sm">
                                {STEP_LABELS[checkoutState.currentStep]}
                            </span>
                        </>
                    )}
                </nav>

                {/* Header */}
                <div className="mb-4 sm:mb-6">

                    <StepProgress
                        currentStep={checkoutState.currentStep}
                        state={checkoutState}
                        onStepClick={goToStep}
                    />
                </div>

                {/* Two Column Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
                    {/* Left Column - Step Content */}
                    <div className="lg:col-span-2">
                        {renderStep()}
                    </div>

                    {/* Right Column - Order Summary (Sticky) */}
                    <div className="lg:col-span-1">
                        <div className="sticky top-24">
                            <CheckoutProduct
                                setsubmittedvaluelist={(updater: any) => {
                                    if (typeof updater === 'function') {
                                        const result = updater({ promoCode });
                                        if (result.promoCode !== undefined) {
                                            setPromoCode(result.promoCode);
                                        }
                                    }
                                }}
                                submittedvaluelist={{
                                    promoCode,
                                    appliedPromo,
                                    totalpayment: total,
                                    paymentmethod: checkoutState.paymentMethod,
                                    address: checkoutState.address,
                                    productsID: cartItems?.items || [],
                                    receiverNO: userInfo?.phone,

                                }}
                                handleApplyPromo={handleApplyPromo}
                            />


                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
