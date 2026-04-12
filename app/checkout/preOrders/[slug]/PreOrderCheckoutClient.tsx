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
import RecipientStep from '../../steps/RecipientStep';
import PreOrderPaymentStep from './steps/PreOrderPaymentStep';
import PreOrderSummary from './PreOrderSummary';
import CheckoutFaq from '../../CheckoutFaq';
import NicAsiaPayment from '@/app/PaymentsBox/NicAsiaPayment';
import EeswaPayment from '@/app/PaymentsBox/EeswaPayment';
import { toast } from 'sonner';
import { useRouter, useSearchParams } from 'next/navigation';
import { OrderService } from '@/app/api/services/order.service';

interface Props {
    product: ProductDetails;
}

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

export default function PreOrderCheckoutClient({ product }: Props) {
    const { user, isLoading } = useAuthStore(useShallow(state => ({
        user: state.user,
        isLoading: state.isLoading,
    })));
    const router = useRouter();
    const searchParams = useSearchParams();
    const selectedColor = searchParams.get('selectedcolor');

    const variantImage = React.useMemo(() => {
        if (!selectedColor || !product) return null;
        if (product.variants) {
            const variant = product.variants.find(v =>
                v.attributes?.Color === selectedColor || v.attributes?.color === selectedColor
            );
            if (variant?.images?.[0]?.url) return variant.images[0].url;
        }
        if (product.images) {
            const img = product.images.find(i => i.color === selectedColor);
            if (img?.url) return img.url;
        }
        return null;
    }, [selectedColor, product]);

    const basePrice = typeof product.price === 'object' ? product.price.current : product.price;
    const productPrice: number = (product.pre_order?.price ?? basePrice) as number;
    const depositAmount = Math.min(productPrice, 5000);

    const [currentStep, setCurrentStep] = useState<PreOrderStep>(PRE_ORDER_STEPS.ADDRESS);
    const [checkoutState, setCheckoutState] = useState<CheckoutState>(initialCheckoutState);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [orderError, setOrderError] = useState<string | null>(null);
    const [processingPaymentOrder, setProcessingPaymentOrder] = useState<number | null>(null);

    const steps = Object.values(PRE_ORDER_STEPS) as PreOrderStep[];

    const goToStep = useCallback((step: PreOrderStep) => setCurrentStep(step), []);
    const nextStep = useCallback(() => {
        setCurrentStep(prev => Math.min(prev + 1, PRE_ORDER_STEPS.PAYMENT) as PreOrderStep);
    }, []);
    const prevStep = useCallback(() => {
        setCurrentStep(prev => Math.max(prev - 1, PRE_ORDER_STEPS.ADDRESS) as PreOrderStep);
    }, []);

    const handleAddressSelect = useCallback((address: ShippingAddress) => {
        setCheckoutState(prev => ({ ...prev, address }));
    }, []);
    const handleLocationPermissionChange = useCallback((granted: boolean) => {
        setCheckoutState(prev => ({ ...prev, locationPermissionGranted: granted }));
    }, []);
    const handleRecipientChange = useCallback((recipient: RecipientInfo) => {
        setCheckoutState(prev => ({ ...prev, recipient }));
    }, []);
    const handlePaymentMethodChange = useCallback((paymentMethod: string) => {
        setCheckoutState(prev => ({ ...prev, paymentMethod }));
    }, []);

    const handlePlaceOrder = async () => {
        try {
            setIsSubmitting(true);
            setOrderError(null);

            const productImage = variantImage ?? product.image?.full ?? product.thumb?.url ?? product.images?.[0]?.url ?? '';

            const formData = new FormData();
            formData.append('product_id', String(product.id));
            formData.append('product_name', product.name);
            formData.append('product_slug', product.slug);
            formData.append('product_image', productImage);
            formData.append('quantity', '1');
            formData.append('is_preorder', '1');
            formData.append('pre_order_price', String(productPrice));
            formData.append('deposit_amount', String(depositAmount));
            formData.append('order_total', String(productPrice));
            if (selectedColor) formData.append('selected_color', selectedColor);
            if (product.categories?.[0]?.title) formData.append('category', product.categories[0].title);

            formData.append('shipping_address[id]', String(checkoutState.address?.id ?? ''));
            formData.append('shipping_address[first_name]', checkoutState.address?.contact_info?.first_name ?? user?.name ?? '');
            formData.append('shipping_address[last_name]', checkoutState.address?.contact_info?.last_name ?? '');
            formData.append('shipping_address[contact_number]', checkoutState.address?.contact_info?.contact_number ?? checkoutState.recipient.phone ?? '');
            formData.append('shipping_address[label]', checkoutState.address?.address.label ?? 'Home');
            formData.append('shipping_address[landmark]', checkoutState.address?.address.landmark ?? '');
            formData.append('shipping_address[city]', checkoutState.address?.address.city ?? '');
            formData.append('shipping_address[district]', checkoutState.address?.address.district ?? '');
            formData.append('shipping_address[province]', checkoutState.address?.address.province ?? '');
            formData.append('shipping_address[country]', checkoutState.address?.address.country ?? 'Nepal');
            formData.append('shipping_address[is_default]', checkoutState.address?.address.is_default ? '1' : '0');
            formData.append('shipping_address[geo][lat]', String(checkoutState.address?.geo?.lat ?? ''));
            formData.append('shipping_address[geo][lng]', String(checkoutState.address?.geo?.lng ?? ''));

            formData.append('payment[type]', checkoutState.paymentMethod.toLowerCase().replace(/\s+/g, '_'));
            formData.append('payment[total]', String(depositAmount));

            formData.append('recipient[type]', checkoutState.recipient.type);
            formData.append('recipient[phone]', checkoutState.recipient.phone ?? '');
            formData.append('recipient[name]', checkoutState.recipient.type === 'gift'
                ? (checkoutState.recipient.name ?? '')
                : (user?.name ?? ''));
            if (checkoutState.recipient.message) formData.append('recipient[message]', checkoutState.recipient.message);

            const res = await OrderService.CreatePreOrder(formData);

            if (res?.data) {
                const orderData = res.data;

                if (orderData?.order?.payment_type === 'nic-asia') {
                    setIsSubmitting(false);
                    setProcessingPaymentOrder(orderData.order.id);
                    return;
                }
                if (orderData?.order?.payment_type?.includes('esewa')) {
                    setIsSubmitting(false);
                    setProcessingPaymentOrder(orderData.order.id);
                    return;
                }

                setIsSubmitting(false);
                toast.success('Pre-order placed successfully!');
                router.push('/checkout/Successpage');
            } else {
                setIsSubmitting(false);
                setOrderError('Pre-order could not be placed. Please try again.');
            }
        } catch (error: any) {
            setIsSubmitting(false);
            setOrderError(error?.message ?? 'Something went wrong. Please try again.');
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="flex flex-col items-center gap-3 bg-white border border-gray-200 rounded-xl px-10 py-8">
                    <div className="w-10 h-10 border-2 border-gray-200 border-t-(--colour-fsP2) rounded-full animate-spin" />
                    <p className="text-sm text-gray-500 font-medium">Loading checkout...</p>
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
                        error={orderError}
                        onClearError={() => setOrderError(null)}
                    />
                );
            default:
                return null;
        }
    };

    return (
        <>
            <div className="bg-gray-50 min-h-screen py-3 sm:py-5">
                <div className="max-w-6xl mx-auto px-3 sm:px-5 lg:px-6">

                    {/* Breadcrumb */}
                    <nav className="flex items-center gap-1 text-xs mb-3 overflow-x-auto scrollbar-hide bg-white border border-gray-200 rounded-lg px-3 py-2">
                        <Link href="/" className="text-(--colour-fsP2) hover:underline whitespace-nowrap font-medium">Home</Link>
                        <ChevronRight className="w-3 h-3 text-gray-400 shrink-0" />
                        <Link href={`/product-details/${product.slug}`} className="text-(--colour-fsP2) hover:underline whitespace-nowrap font-medium truncate max-w-40">{product.name}</Link>
                        <ChevronRight className="w-3 h-3 text-gray-400 shrink-0" />
                        <span className="text-gray-700 font-semibold whitespace-nowrap">Pre-Order</span>
                        {currentStep > PRE_ORDER_STEPS.ADDRESS && (
                            <>
                                <ChevronRight className="w-3 h-3 text-gray-400 shrink-0" />
                                <span className="text-(--colour-fsP2) font-medium whitespace-nowrap">{STEP_LABELS[currentStep]}</span>
                            </>
                        )}
                    </nav>

                    {/* Step Progress */}
                    <div className="w-full py-8 px-2 sm:px-0">
                        <div className="relative w-full">
                            <div className="absolute top-1.75 left-0 w-full h-0.5 bg-gray-200 z-0 rounded-full" />
                            <div
                                className="absolute top-1.75 left-0 h-0.5 bg-(--colour-fsP2) z-0 transition-all duration-500 ease-out rounded-full shadow-sm"
                                style={{ width: `${(currentStep / (steps.length - 1)) * 100}%` }}
                            />
                            <div className="relative z-10 flex justify-between w-full">
                                {steps.map((step, idx) => {
                                    const isPastOrActive = step <= currentStep;
                                    const isActive = step === currentStep;
                                    const isFirst = idx === 0;
                                    const isLast = idx === steps.length - 1;
                                    const canClick = step < currentStep;
                                    return (
                                        <div key={step} className="flex flex-col relative group">
                                            <button
                                                onClick={() => canClick && goToStep(step)}
                                                disabled={!canClick}
                                                className={`w-4 h-4 rounded-full border-2 transition-all duration-300 bg-white relative z-20 mx-auto ${isPastOrActive ? 'border-(--colour-fsP2) bg-(--colour-fsP2) scale-110 shadow-md shadow-blue-200' : 'border-gray-300 hover:border-gray-400'} ${canClick ? 'cursor-pointer' : 'cursor-default'}`}
                                                aria-label={STEP_LABELS[step]}
                                            />
                                            <div className={`absolute top-8 w-16 sm:w-20 ${isFirst ? 'left-0 text-left' : isLast ? 'right-0 text-right' : 'left-1/2 -translate-x-1/2 text-center'}`}>
                                                <span className={`text-[9px] sm:text-[10px] font-bold uppercase tracking-wider transition-colors duration-300 block leading-tight ${isActive ? 'text-(--colour-fsP2)' : isPastOrActive ? 'text-(--colour-fsP2) opacity-80' : 'text-gray-400'}`}>
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

                        {/* Mobile summary */}
                        <div className="lg:hidden">
                            <PreOrderSummary
                                product={product}
                                depositAmount={depositAmount}
                                productPrice={productPrice}
                                currentStep={currentStep}
                                selectedAddress={checkoutState.address}
                                selectedColor={selectedColor ?? undefined}
                                variantImage={variantImage ?? undefined}
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
                                    selectedColor={selectedColor ?? undefined}
                                    variantImage={variantImage ?? undefined}
                                />
                            </div>
                        </div>
                    </div>

                    <CheckoutFaq type="preorder" />
                </div>
            </div>

            {isSubmitting && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl px-10 py-8 flex flex-col items-center gap-4 shadow-xl border border-gray-100 mx-4">
                        <div className="w-12 h-12 border-[3px] border-gray-200 border-t-(--colour-fsP2) rounded-full animate-spin" />
                        <div className="text-center">
                            <p className="text-base font-bold text-gray-900">Placing your pre-order...</p>
                            <p className="text-xs text-gray-400 mt-1">Please don't close this window</p>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
