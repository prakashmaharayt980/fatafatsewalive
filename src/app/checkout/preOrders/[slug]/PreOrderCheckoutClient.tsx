'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { ChevronRight, ChevronLeft } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/app/context/AuthContext';
import { ProductDetails } from '@/app/types/ProductDetailsTypes';

import {
    CheckoutState,
    CheckoutStep,
    initialCheckoutState,
    ShippingAddress,
    RecipientInfo,
} from '@/app/checkout/checkoutTypes';

import AddressStep from '@/app/checkout/steps/AddressStep';


import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import NicAsiaPayment from '@/app/PaymentsBox/NicAsiaPayment';
import EeswaPayment from '@/app/PaymentsBox/EeswaPayment';
import DepositStep from './steps/DepositStep';
import PreOrderPaymentStep from './steps/PreOrderPaymentStep';
import PreOrderSummary from './PreOrderSummary';
import PreOrderReceiptStep from './steps/PreOrderReceiptStep';
import RecipientStep from '../../steps/RecipientStep';

interface PreOrderCheckoutClientProps {
    product: ProductDetails;
}

// Step order: ADDRESS → DEPOSIT (Receipt) → PAYMENT
const PRE_ORDER_STEPS = {
    ADDRESS: 0,
    RECIPT: 1,
    DEPOSIT: 2,
    PAYMENT: 3,
} as const;

type PreOrderStep = (typeof PRE_ORDER_STEPS)[keyof typeof PRE_ORDER_STEPS];

const STEP_LABELS: Record<PreOrderStep, string> = {
    [PRE_ORDER_STEPS.ADDRESS]: 'Shipping',
    [PRE_ORDER_STEPS.RECIPT]: 'Receipt',
    [PRE_ORDER_STEPS.DEPOSIT]: 'Deposit',
    [PRE_ORDER_STEPS.PAYMENT]: 'Payment',
};

export default function PreOrderCheckoutClient({ product }: PreOrderCheckoutClientProps) {
    const { authState, isLoading, triggerLoginAlert } = useAuth();
    const userInfo = authState.user;
    const router = useRouter();

    const [currentStep, setCurrentStep] = useState<PreOrderStep>(PRE_ORDER_STEPS.ADDRESS);
    const [checkoutState, setCheckoutState] = useState<CheckoutState>(initialCheckoutState);
    const [depositAmount, setDepositAmount] = useState<number>(5000);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [processingPaymentOrder, setProcessingPaymentOrder] = useState<number | null>(null);

    const productPrice = product.discounted_price || product.price;
    const isFullPaymentRequired = productPrice <= 5000;

    useEffect(() => {
        setDepositAmount(isFullPaymentRequired ? productPrice : 5000);
    }, [isFullPaymentRequired, productPrice]);

    useEffect(() => {
        if (!isLoading && authState.isLoggedIn === false) {
            triggerLoginAlert();
        }
    }, [isLoading, authState.isLoggedIn, triggerLoginAlert]);

    const goToStep = useCallback((step: PreOrderStep) => setCurrentStep(step), []);
    const nextStep = useCallback(() => {
        if (currentStep < PRE_ORDER_STEPS.PAYMENT) setCurrentStep((prev) => (prev + 1) as PreOrderStep);
    }, [currentStep]);
    const prevStep = useCallback(() => {
        if (currentStep > PRE_ORDER_STEPS.ADDRESS) setCurrentStep((prev) => (prev - 1) as PreOrderStep);
    }, [currentStep]);

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

    const handlePlaceOrder = async () => {
        try {
            setIsSubmitting(true);
            const payload = {
                full_name: userInfo?.name,
                products: [{ product_id: product.id, quantity: 1, is_preorder: true }],
                shipping_address_id: checkoutState.address?.id,
                total_amount: depositAmount,
                order_total: productPrice,
                payment_type: checkoutState.paymentMethod.toLowerCase().replace(/\s+/g, '_'),
            };

            // Mock — replace with actual API later
            await new Promise((resolve) => setTimeout(resolve, 1500));
            const mockId = 99999 + Math.floor(Math.random() * 1000);

            if (payload.payment_type === 'nic-asia') {
                setProcessingPaymentOrder(mockId);
                setIsSubmitting(false);
                return;
            }

            toast.success('Pre-order placed successfully!');
            router.push(`/checkout/Successpage/${mockId}`);
        } catch (error) {
            console.error('Pre-order Error', error);
            toast.error('Failed to place pre-order');
            setIsSubmitting(false);
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="w-10 h-10 border-2 border-gray-200 border-t-[var(--colour-fsP2)] rounded-full animate-spin" />
            </div>
        );
    }

    if (authState.isLoggedIn === false) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <p className="text-gray-600 font-medium mb-3">Please log in to continue booking.</p>
                    <Link href="/" className="text-sm text-[var(--colour-fsP2)] font-semibold hover:underline">← Back to Home</Link>
                </div>
            </div>
        );
    }

    const renderStep = () => {
        switch (currentStep) {
            case PRE_ORDER_STEPS.ADDRESS:
                return (
                    <AddressStep
                        state={{ ...checkoutState, currentStep: 0 as CheckoutStep }}
                        onAddressSelect={handleAddressSelect}
                        onLocationPermissionChange={handleLocationPermissionChange}
                        onNext={nextStep}
                    />
                );

            case PRE_ORDER_STEPS.RECIPT:
                return (
                    <RecipientStep
                        state={{ ...checkoutState, currentStep: 0 as CheckoutStep }}
                        onRecipientChange={handleRecipientChange}
                        onNext={nextStep}
                        onBack={prevStep}
                    />
                );

            case PRE_ORDER_STEPS.DEPOSIT:
                return (
                    <DepositStep
                        productPrice={productPrice}
                        depositAmount={depositAmount}
                        setDepositAmount={setDepositAmount}
                        isFullPaymentRequired={isFullPaymentRequired}
                        onNext={nextStep}
                        onBack={prevStep}
                    />
                );

            case PRE_ORDER_STEPS.PAYMENT:
                if (processingPaymentOrder) {
                    if (checkoutState.paymentMethod.toLowerCase().includes('esewa')) {
                        return <EeswaPayment orderId={processingPaymentOrder} amount={depositAmount} />;
                    }
                    return <NicAsiaPayment orderId={processingPaymentOrder} />;
                }
                return (
                    <PreOrderPaymentStep
                        paymentMethod={checkoutState.paymentMethod}
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

    const steps = [PRE_ORDER_STEPS.ADDRESS, PRE_ORDER_STEPS.RECIPT, PRE_ORDER_STEPS.DEPOSIT, PRE_ORDER_STEPS.PAYMENT] as PreOrderStep[];

    return (
        <div className="bg-gray-50 min-h-screen py-3 sm:py-5">
            <div className="max-w-6xl mx-auto px-3 sm:px-5 lg:px-6">

                {/* Breadcrumb — same style as CheckoutClient */}
                <nav className="flex items-center gap-1 text-xs mb-3 overflow-x-auto scrollbar-hide">
                    <Link href="/" className="text-[var(--colour-fsP2)] hover:underline whitespace-nowrap font-medium">Home</Link>
                    <ChevronRight className="w-3 h-3 text-gray-400 shrink-0" />
                    <Link href={`/products/${product.slug}`} className="text-[var(--colour-fsP2)] hover:underline whitespace-nowrap font-medium truncate max-w-[160px]">{product.name}</Link>
                    <ChevronRight className="w-3 h-3 text-gray-400 shrink-0" />
                    <span className="text-gray-700 font-semibold whitespace-nowrap">Pre-Order</span>
                    {currentStep > 0 && (
                        <>
                            <ChevronRight className="w-3 h-3 text-gray-400 shrink-0" />
                            <span className="text-[var(--colour-fsP2)] font-medium whitespace-nowrap">
                                {STEP_LABELS[currentStep]}
                            </span>
                        </>
                    )}
                </nav>

                {/* Step Progress — same visual pattern as StepProgress.tsx */}
                <div className="mb-4 w-full py-6 px-2 sm:px-0">
                    <div className="relative w-full">
                        {/* Background line */}
                        <div className="absolute top-[7px] left-0 w-full h-[2px] bg-gray-200 z-0 rounded-full" />
                        {/* Active progress line */}
                        <div
                            className="absolute top-[7px] left-0 h-[2px] bg-[var(--colour-fsP2)] z-0 transition-all duration-500 ease-out rounded-full shadow-sm"
                            style={{ width: `${(currentStep / (steps.length - 1)) * 100}%` }}
                        />
                        <div className="relative z-10 flex justify-between w-full">
                            {steps.map((step, idx) => {
                                const isCompleted = step < currentStep;
                                const isActive = step === currentStep;
                                const isFirst = idx === 0;
                                const isLast = idx === steps.length - 1;
                                const canClick = step < currentStep;
                                return (
                                    <div key={step} className="flex flex-col relative group">
                                        <button
                                            onClick={() => canClick && goToStep(step)}
                                            disabled={!canClick}
                                            className={`w-4 h-4 rounded-full border-2 transition-all duration-300 bg-white relative z-20 mx-auto
                                                ${isCompleted || isActive
                                                    ? 'border-[var(--colour-fsP2)] bg-[var(--colour-fsP2)] scale-110 shadow-md shadow-blue-200'
                                                    : 'border-gray-300 hover:border-gray-400'
                                                }
                                                ${canClick ? 'cursor-pointer' : 'cursor-default'}`}
                                            aria-label={STEP_LABELS[step]}
                                        />
                                        <div className={`absolute top-8 w-32
                                            ${isFirst ? 'left-0 text-left' : isLast ? 'right-0 text-right' : 'left-1/2 -translate-x-1/2 text-center'}`}
                                        >
                                            <span className={`text-[10px] sm:text-xs font-bold uppercase tracking-wider transition-colors duration-300 block leading-tight
                                                ${isActive
                                                    ? 'text-[var(--colour-fsP2)] scale-105'
                                                    : isCompleted
                                                        ? 'text-[var(--colour-fsP2)] opacity-80'
                                                        : 'text-gray-400'
                                                }`}
                                            >
                                                {STEP_LABELS[step]}
                                            </span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                    <div className="h-10 sm:h-8" />
                </div>

                {/* Two Column Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-4 items-start">

                    {/* Right column shown first on mobile */}
                    <div className="lg:hidden">
                        <PreOrderSummary
                            product={product}
                            depositAmount={depositAmount}
                            productPrice={productPrice}
                            currentStep={currentStep}
                            selectedAddress={checkoutState.address}
                        />
                    </div>

                    {/* Left Column — Steps */}
                    <div className="min-w-0">
                        {renderStep()}
                    </div>

                    {/* Right Column — Sticky Summary */}
                    <div className="hidden lg:block">
                        <div className="sticky top-20">
                            <PreOrderSummary
                                product={product}
                                depositAmount={depositAmount}
                                productPrice={productPrice}
                                currentStep={currentStep}
                                selectedAddress={checkoutState.address}
                            />
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}
