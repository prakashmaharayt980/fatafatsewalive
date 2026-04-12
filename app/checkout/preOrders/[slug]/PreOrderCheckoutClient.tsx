'use client';

import React, { useState, useCallback } from 'react';
import { ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { useAuthStore } from '@/app/context/AuthContext';
import { useShallow } from 'zustand/react/shallow';

import type { ProductDetails } from '@/app/types/ProductDetailsTypes';

import {
    type CheckoutState,
    type CheckoutStep,
    initialCheckoutState,
    type ShippingAddress,
    type RecipientInfo,
} from '@/app/checkout/checkoutTypes';

import AddressStep from '@/app/checkout/steps/AddressStep';


import { toast } from 'sonner';
import { useRouter, useSearchParams } from 'next/navigation';
import NicAsiaPayment from '@/app/PaymentsBox/NicAsiaPayment';
import EeswaPayment from '@/app/PaymentsBox/EeswaPayment';
import PreOrderPaymentStep from './steps/PreOrderPaymentStep';
import PreOrderSummary from './PreOrderSummary';
import RecipientStep from '../../steps/RecipientStep';
import CheckoutFaq from '../../CheckoutFaq';

interface PreOrderCheckoutClientProps {
    product: ProductDetails;
}

// Step order: ADDRESS → RECIPIENT → PAYMENT
const PRE_ORDER_STEPS = {
    ADDRESS: 0,
    RECIPIENT: 1,
    PAYMENT: 2,
} as const;

type PreOrderStep = (typeof PRE_ORDER_STEPS)[keyof typeof PRE_ORDER_STEPS];

const STEP_LABELS: Record<PreOrderStep, string> = {
    [PRE_ORDER_STEPS.ADDRESS]: 'Shipping',
    [PRE_ORDER_STEPS.RECIPIENT]: 'Recipient',
    [PRE_ORDER_STEPS.PAYMENT]: 'Payment',
};

export default function PreOrderCheckoutClient({ product }: PreOrderCheckoutClientProps) {
    const { user, isLoading } = useAuthStore(useShallow(state => ({
        user: state.user,
        isLoading: state.isLoading,
    })));
    const userInfo = user;
    const router = useRouter();
    const searchParams = useSearchParams();
    const selectedColor = searchParams.get('selectedcolor');

    // Find the variant image for the selected color
    const variantImage = React.useMemo(() => {
        if (!selectedColor || !product) return null;
        
        // Check variants
        if (product.variants) {
            const variant = product.variants.find(v => 
                v.attributes?.Color === selectedColor || v.attributes?.color === selectedColor
            );
            if (variant?.images?.[0]?.url) return variant.images[0].url;
        }
        
        // Check product images with color property
        if (product.images) {
            const img = product.images.find(i => i.color === selectedColor);
            if (img?.url) return img.url;
        }

        return null;
    }, [selectedColor, product]);

    const [currentStep, setCurrentStep] = useState<PreOrderStep>(PRE_ORDER_STEPS.ADDRESS);
    const [checkoutState, setCheckoutState] = useState<CheckoutState>(initialCheckoutState);
    const [depositAmount] = useState<number>(5000);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [processingPaymentOrder, setProcessingPaymentOrder] = useState<number | null>(null);

    const basePrice = typeof product.price === 'object' ? product.price.current : product.price;
    const productPrice = product.pre_order_price ?? basePrice;

    // Guest mode — no login required to browse/fill form
    // Login is enforced only on submit via PreOrderPaymentStep

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
            const productImage = variantImage ?? product.image?.full ?? product.thumb?.url ?? product.images?.[0]?.url ?? '';
            const payload = {
                full_name: userInfo?.name,
                products: [{
                    product_id: product.id,
                    quantity: 1,
                    is_preorder: true,
                    product_name: product.name,
                    product_image: productImage,
                    selected_color: selectedColor ?? undefined,
                    slug: product.slug,
                    category: product.categories?.[0]?.title ?? undefined,
                    price: productPrice,
                }],
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

    // No auth gate — guests can proceed freely
    // Login is enforced only on submit (PreOrderPaymentStep)

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

            case PRE_ORDER_STEPS.RECIPIENT:
                return (
                    <RecipientStep
                        state={{ ...checkoutState, currentStep: 0 as CheckoutStep }}
                        onRecipientChange={handleRecipientChange}
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

    const steps = [PRE_ORDER_STEPS.ADDRESS, PRE_ORDER_STEPS.RECIPIENT, PRE_ORDER_STEPS.PAYMENT] as PreOrderStep[];

    return (
        <div className="bg-gray-50 min-h-screen py-3 sm:py-5">
            <div className="max-w-6xl mx-auto px-3 sm:px-5 lg:px-6">

                {/* Breadcrumb — same style as CheckoutClient */}
                <nav className="flex items-center gap-1 text-xs mb-3 overflow-x-auto scrollbar-hide">
                    <Link href="/" className="text-[var(--colour-fsP2)] hover:underline whitespace-nowrap font-medium">Home</Link>
                    <ChevronRight className="w-3 h-3 text-gray-400 shrink-0" />
                    <Link href={`/product-details/${product.slug}`} className="text-[var(--colour-fsP2)] hover:underline whitespace-nowrap font-medium truncate max-w-[160px]">{product.name}</Link>
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
                            selectedColor={selectedColor || undefined}
                            variantImage={variantImage || undefined}
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
                                selectedColor={selectedColor || undefined}
                                variantImage={variantImage || undefined}
                            />
                        </div>
                    </div>

                </div>
                <CheckoutFaq type="preorder" />
            </div>
        </div>
    );
}
