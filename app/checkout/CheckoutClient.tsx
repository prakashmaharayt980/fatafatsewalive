'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { ChevronRight, Loader2, ShoppingBag } from 'lucide-react';
import Link from 'next/link';


import { useAuthStore } from '../context/AuthContext';

import { trackInitiateCheckout } from '@/lib/Analytic';
import {
    CHECKOUT_STEPS,
    initialCheckoutState,
    isStepComplete,
    STEP_LABELS,
} from './checkoutTypes';
import type {
    CheckoutState,
    CheckoutStep,
    ShippingAddress,
    RecipientInfo,
    DeliverySelection,
} from './checkoutTypes';

// Step Components
import StepProgress from './steps/StepProgress';
import AddressStep from './steps/AddressStep';
import RecipientStep from './steps/RecipientStep';
import PaymentStep from './steps/PaymentStep';
import CheckoutProduct from './CheckoutProduct';
import NicAsiaPayment from '../PaymentsBox/NicAsiaPayment';
import EeswaPayment from '../PaymentsBox/EeswaPayment';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { OrderService } from '../api/services/order.service';
import { useCartStore } from '../context/CartContext';
import { useShallow } from 'zustand/react/shallow';
import CheckoutFaq from './CheckoutFaq';
import EmiFaq from '../emi/apply/_components/EmiFaq';
import { CartService } from '../api/services/cart.service';


export default function CheckoutClient() {
    const { cartItems, clearGuestData, setLastOrderData } = useCartStore(useShallow((state) => ({
        cartItems: state.cartItems,
        clearGuestData: state.clearGuestData,
        setLastOrderData: state.setLastOrderData
    })));
    const { user, isLoggedIn, isLoading, triggerLoginAlert } = useAuthStore(useShallow(state => ({
        user: state.user,
        isLoggedIn: state.isLoggedIn,
        isLoading: state.isLoading,
        triggerLoginAlert: state.triggerLoginAlert
    })));
    const userInfo = user;

    // Checkout state
    const [checkoutState, setCheckoutState] = useState<CheckoutState>(initialCheckoutState);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [shippingCost, setShippingCost] = useState(0);
    const [promoCode, setPromoCode] = useState('');
    const [appliedPromo, setAppliedPromo] = useState<{ code: string; discount: number } | null>(null);
    const [processingPaymentOrder, setProcessingPaymentOrder] = useState<number | null>(null);


    const router = useRouter();


    // Track Initiate Checkout
    useEffect(() => {
        if (cartItems && cartItems.items.length > 0) {
            trackInitiateCheckout(cartItems);
        }
    }, [cartItems]);


    useEffect(() => {

        setShippingCost(0);
    }, [checkoutState.address]);

    // Navigation helpers
    const goToStep = useCallback((step: CheckoutStep) => {
        setCheckoutState((prev) => ({ ...prev, currentStep: step }));
    }, []);

    // Order submission
    const handlePlaceOrder = useCallback(async () => {
        if (!isLoggedIn) {
            triggerLoginAlert();
            return;
        }

        try {
            setIsSubmitting(true);
            const currentItems = cartItems?.items || [];
            const subtotal = cartItems?.cart_total || 0;
            const finalTotal = subtotal - (appliedPromo?.discount || 0);

            const payload = {
                cart_id: cartItems?.id,
                shipping_address: {
                    id: checkoutState.address?.id,
                    label: checkoutState.address?.address.label,
                    landmark: checkoutState.address?.address.landmark,
                    city: checkoutState.address?.address.city,
                    district: checkoutState.address?.address.district,
                    province: checkoutState.address?.address.province,
                    country: checkoutState.address?.address.country,
                    is_default: checkoutState.address?.address.is_default,
                    geo: {
                        lat: checkoutState.address?.geo?.lat,
                        lng: checkoutState.address?.geo?.lng,
                    }
                },
                payment: {
                    type: checkoutState.paymentMethod.toLowerCase().replace(/\s+/g, '_'),
                    promo_code: appliedPromo?.code || null,
                    total: finalTotal,
                },
                recipient: {
                    type: checkoutState.recipient.type,
                    phone: checkoutState.recipient.phone,
                    name: userInfo?.name || checkoutState.recipient.name || '',
                    photos: {
                        sender: checkoutState.recipient.senderPhoto || null,
                        receiver: checkoutState.recipient.recipientPhoto || null,
                    },
                    message: checkoutState.recipient.message || null,
                }
            };




            await OrderService.CreateOrder(payload).then((res) => {

                if (res?.data) {
                    const orderData = res.data;
                    setLastOrderData(res.data);

                    if (orderData?.order?.order_status === 'Placed' && orderData?.order?.payment_type === 'nic-asia') {
                        setProcessingPaymentOrder(orderData.order.id);
                    }

                    if (orderData?.order?.order_status === 'Placed' && orderData?.order?.payment_type === 'cash_on_delivery') {
                        setIsSubmitting(false);
                        clearGuestData();
                        toast.success('Cash order placed successfully!');
                        router.push(`/checkout/Successpage`);
                    }


                }
            });
        } catch (error) {

            setIsSubmitting(false);
        }
    }, [cartItems, appliedPromo, checkoutState, userInfo, isLoggedIn, clearGuestData, router]);

    const nextStep = useCallback(() => {
        const { currentStep } = checkoutState;

        // Final Step (Payment) -> Place Order
        if (currentStep === CHECKOUT_STEPS.PAYMENT) {
            handlePlaceOrder();
            return;
        }

        if (isStepComplete(currentStep, checkoutState)) {
            setCheckoutState((prev) => ({ ...prev, currentStep: (currentStep + 1) as CheckoutStep }));
        }
    }, [checkoutState, handlePlaceOrder]);

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


    const handlePaymentMethodChange = useCallback((paymentMethod: string) => {
        setCheckoutState((prev) => ({ ...prev, paymentMethod }));
    }, []);

    // Promo handling
    const handleApplyPromo = useCallback(async () => {
        const code = promoCode.trim().toUpperCase();
        if (!code) return;


        const res = await CartService.PromoCodeUse({ code }).then(res => res.data);
        if (res?.success) {
            setAppliedPromo({ code: res.data.code, discount: res.data.discount });
        } else {
            alert(res?.message || 'Failed to apply promo code');
            setAppliedPromo(null);
        }
    }, [promoCode, cartItems]);



    // Loading state
    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="flex flex-col items-center gap-3 bg-white border border-gray-200 rounded-xl px-10 py-8">
                    <div className="w-10 h-10 border-2 border-gray-200 border-t-[var(--colour-fsP2)] rounded-full animate-spin" />
                    <p className="text-sm text-gray-500 font-medium">Loading checkout...</p>
                </div>
            </div>
        );
    }


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
                // If we are processing a NIC Asia or eSewa payment, show the loading component
                if (processingPaymentOrder) {
                    if (checkoutState.paymentMethod.toLowerCase().includes('esewa')) {
                        const subtotal = cartItems?.cart_total || 0;
                        const totalAmount = subtotal - (appliedPromo?.discount || 0);
                        return <EeswaPayment orderId={processingPaymentOrder} amount={totalAmount} />;
                    }
                    return <NicAsiaPayment orderId={processingPaymentOrder} />;
                }
                return (
                    <PaymentStep
                        state={checkoutState}
                        onPaymentMethodChange={handlePaymentMethodChange}
                        onPlaceOrder={nextStep}
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
        <>
            <div className="bg-gray-50 min-h-screen py-2 sm:py-5">
                <div className="max-w-7xl mx-auto px-3 sm:px-5 lg:px-6">

                    {/* Breadcrumb */}
                    <nav className="flex items-center gap-1 text-xs mb-3 overflow-x-auto scrollbar-hide bg-white border-none border-gray-200 rounded-lg px-3 py-2">
                        <Link href="/" className="text-[var(--colour-fsP2)] hover:underline whitespace-nowrap font-medium">Home</Link>
                        <ChevronRight className="w-3 h-3 text-gray-400 shrink-0" />
                        <span onClick={() => router.back()} className="text-[var(--colour-fsP2)] hover:underline whitespace-nowrap font-medium">{"Product-details"}</span>
                        <ChevronRight className="w-3 h-3 text-gray-400 shrink-0" />
                        <span className="text-gray-700 font-semibold whitespace-nowrap">Checkout</span>
                        {checkoutState.currentStep > 0 && (
                            <>
                                <ChevronRight className="w-3 h-3 text-gray-400 shrink-0" />
                                <span className="text-[var(--colour-fsP2)] font-medium whitespace-nowrap">
                                    {STEP_LABELS[checkoutState.currentStep]}
                                </span>
                            </>
                        )}
                    </nav>

                    {/* Step Progress */}
                    <StepProgress
                        currentStep={checkoutState.currentStep}
                        state={checkoutState}
                        onStepClick={goToStep}
                    />

                    {/* Two Column Layout */}
                    <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-3 lg:gap-4 items-start">

                        {/* Right Column — Collapsible Order Summary on mobile */}
                        <div className="lg:hidden">
                            <details className="group">
                                <summary className="flex items-center justify-between w-full bg-white rounded-xl border border-[var(--colour-fsP2)] px-4 py-3 cursor-pointer list-none select-none">
                                    <span className="text-sm font-bold text-gray-700 flex items-center gap-2">
                                        <ShoppingBag className="w-4 h-4 text-[var(--colour-fsP2)]" />
                                        Order Summary
                                    </span>
                                    <ChevronRight className="w-4 h-4 text-gray-400 transition-transform duration-200 group-open:rotate-90" />
                                </summary>
                                <div className="mt-2">
                                    <CheckoutProduct
                                        setsubmittedvaluelist={(updater: any) => {
                                            if (typeof updater === 'function') {
                                                const result = updater({ promoCode });
                                                if (result.promoCode !== undefined) setPromoCode(result.promoCode);
                                            }
                                        }}
                                        submittedvaluelist={{
                                            promoCode,
                                            appliedPromo,
                                            totalpayment: total,
                                            paymentmethod: checkoutState.paymentMethod,
                                            address: checkoutState.address,
                                            productsID: cartItems?.items || [],
                                            receiverNO: userInfo?.phone || '',
                                        }}
                                        handleApplyPromo={handleApplyPromo}
                                        Stepstate={checkoutState}
                                    />
                                </div>
                            </details>
                        </div>

                        {/* Left Column — Step Content */}
                        <div className="min-w-0">
                            {renderStep()}
                        </div>

                        {/* Right Column — Sticky on desktop */}
                        <div className="hidden lg:block">
                            <div className="sticky top-20">
                                <CheckoutProduct
                                    setsubmittedvaluelist={(updater: any) => {
                                        if (typeof updater === 'function') {
                                            const result = updater({ promoCode });
                                            if (result.promoCode !== undefined) setPromoCode(result.promoCode);
                                        }
                                    }}
                                    submittedvaluelist={{
                                        promoCode,
                                        appliedPromo,
                                        totalpayment: total,
                                        paymentmethod: checkoutState.paymentMethod,
                                        address: checkoutState.address,
                                        productsID: cartItems?.items || [],
                                        receiverNO: userInfo?.phone || '',
                                    }}
                                    handleApplyPromo={handleApplyPromo}
                                    Stepstate={checkoutState}
                                />
                            </div>
                        </div>

                    </div>

                    <EmiFaq params={{ type: 'brand' }} />
                </div>
            </div>

            {isSubmitting &&
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">

                </div>
            }
        </>
    );
}
