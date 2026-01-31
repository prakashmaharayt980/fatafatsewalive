'use client';

import React, { useState, useEffect } from 'react';
import { ChevronDown, ChevronUp, Calendar } from 'lucide-react';
import { useContextCart } from './CartContext1';
import Image from 'next/image';
import { PaymentMethodsOptions } from '../CommonVue/Payment';
import AddressSelectionUI from './AddressSectionUi';
import CheckoutProduct from './CheckoutProduct';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
// import { useRouter } from 'next/navigation'; // Not currently used directly for nav but maybe later
import RemoteServices from '../api/remoteservice';
import { useAuth } from '../context/AuthContext';
// import { toast } from 'sonner';

export default function CheckoutClient() {
    const [address, setAddress] = useState({
        street: '',
        city: '',
        state: '',
        zipCode: '',
        country: '',
    });
    const { cartItems } = useContextCart();
    const { authState, isLoading, triggerLoginAlert } = useAuth();
    const userInfo = authState.user;
    // const router = useRouter();

    // Protect the route
    useEffect(() => {
        if (!isLoading && !authState.user) {
            triggerLoginAlert();
        }
    }, [isLoading, authState.user, triggerLoginAlert]);

    const [openSections, setOpenSections] = useState({
        address: true,
        customer: false,
        paymentmethod: false,
        deliveryDate: false,
    });

    const subtotal = cartItems?.cart_total || 0;

    const [selectedMethod, setSelectedMethod] = useState<number | null>(null);
    const [submittedvaluelist, setsubmittedvaluelist] = useState({
        paymentmethod: '',
        address: address,
        receiverNO: '',
        promoCode: '',
        productsID: cartItems?.items || [],
        totalpayment: cartItems?.cart_total || 0,
        appliedPromo: null as { code: string; discount: number } | null,
        deliveryDate: '',
    });

    // --- Distance & Shipping Logic ---
    const FATAFAT_LOCATION = { lat: 27.7172, lng: 85.3240 }; // Kathmandu (Approx)

    const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
        const R = 6371; // km
        const dLat = (lat2 - lat1) * (Math.PI / 180);
        const dLon = (lon2 - lon1) * (Math.PI / 180);
        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * (Math.PI / 180)) *
            Math.cos(lat2 * (Math.PI / 180)) *
            Math.sin(dLon / 2) *
            Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    };

    const [shippingCost, setShippingCost] = useState(0);
    const [distance, setDistance] = useState<number | null>(null);

    // Recalculate shipping when address changes (if it has coordinates)
    useEffect(() => {
        // Note: The Address interface from AddressSectionUi currently doesn't strictly enforce lat/lng 
        // being passed back in the main object, but we might rely on the user "saving" it.
        // However, AddressSelectionUI mostly passes back the object.
        // If we want precise distance, we need the stored address to have coordinates.
        // Current Address interface in AddressSectionUi doesn't show lat/lng columns.
        // FALLBACK: Use city/district for rough estimate OR request user to "Pinpoint" which is in GoogleMapAddress.
        // Let's check: AddressSectionUi passes `selectedAddress`.
        // If we can't get lat/lng, we default to standard shipping.

        // For MOCK/DEMO purposes as requested:
        // If user is selecting a saved address, we simulate distance.
        if (submittedvaluelist.address) {
            // Ideally: const { lat, lng } = submittedvaluelist.address;
            // Mocking distance for now based on city to show dynamic change
            const city = (submittedvaluelist.address as any).city || '';
            let mockDist = 5;
            if (city.toLowerCase().includes("kathmandu")) mockDist = 3;
            else if (city.toLowerCase().includes("lalitpur")) mockDist = 7;
            else if (city.toLowerCase().includes("bhaktapur")) mockDist = 12;
            else mockDist = 500; // Out of valley

            setDistance(mockDist);

            if (mockDist < 5) setShippingCost(0); // Free delivery close by
            else if (mockDist < 10) setShippingCost(50);
            else if (mockDist < 20) setShippingCost(100);
            else setShippingCost(150); // Standard far delivery
        }
    }, [submittedvaluelist.address]);


    // --- Payment Handler ---
    // eSewa Test Credentials
    // SCD: EPAYTEST
    // URL: https://rc-epay.esewa.com.np/api/epay/main/v2/form (Use V2 or V1? User said UAT)
    // Standard UAT Form: https://uat.esewa.com.np/epay/main

    const handlePayment = async (orderId: string, amount: number) => {
        const paymentMethodName = submittedvaluelist.paymentmethod.toLowerCase();

        if (paymentMethodName.includes('esewa')) {
            // Create hidden form and submit
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

            const form = document.createElement("form");
            form.setAttribute("method", "POST");
            form.setAttribute("action", "https://uat.esewa.com.np/epay/main");

            for (const key in params) {
                const hiddenField = document.createElement("input");
                hiddenField.setAttribute("type", "hidden");
                hiddenField.setAttribute("name", key);
                hiddenField.setAttribute("value", (params as any)[key]);
                form.appendChild(hiddenField);
            }
            document.body.appendChild(form);
            form.submit();
        }
        else if (paymentMethodName.includes('khalti')) {
            // Khalti logic (usually requires client-side SDK or redirection)
            alert("Khalti Test Mode Integration: Redirecting to mock success.");
            // Mock success
            window.location.href = `/checkout/Successpage?oid=${orderId}`;
        }
        else {
            // Cash on Delivery or others
            window.location.href = `/checkout/Successpage?oid=${orderId}`;
        }
    };


    const handlesubmit = () => {
        try {
            const currentItems = cartItems?.items || [];
            // Total = Cart + Shipping - Promo
            const finalTotal = subtotal + shippingCost - (submittedvaluelist.appliedPromo?.discount || 0);

            setsubmittedvaluelist((prev) => ({ ...prev, productsID: currentItems }));

            const payload = {
                phone: submittedvaluelist.receiverNO || userInfo?.phone,
                full_name: userInfo?.name,
                // Only pass product IDs with quantities, not full product objects
                products: currentItems.map((item: any) => ({
                    product_id: item.product?.id || item.id,
                    quantity: item.quantity || 1
                })),
                shipping_address_id: (submittedvaluelist.address as any).id,
                total_amount: finalTotal,
                payment_type: submittedvaluelist.paymentmethod.toLowerCase().replace(/\s+/g, '_'),
                promo_code: submittedvaluelist.appliedPromo?.code || null,
                delivery_date: submittedvaluelist.deliveryDate,
                shipping_cost: shippingCost,
            };

            console.log('Submitting Order Payload:', payload);

            RemoteServices.CreateOrder(payload).then((res) => {
                console.log('Order Response:', res);
                if (res?.id || res?.data?.id) {
                    const oid = res.id || res.data.id;
                    handlePayment(oid, finalTotal);
                }
            });

        } catch (error) {
            console.log('Order Error', error);
        }
    };

    const isAddressComplete =
        submittedvaluelist.address && Object.keys(submittedvaluelist.address).length > 0; // Better check needed usually

    const sectionStatus = {
        address: isAddressComplete,
        customer: submittedvaluelist.receiverNO.trim() !== '',
        paymentmethod: submittedvaluelist.paymentmethod !== '',
        deliveryDate: submittedvaluelist.deliveryDate !== '',
    };

    // Sync receiverNO with address contact if available
    useEffect(() => {
        if (submittedvaluelist.address && (submittedvaluelist.address as any).phone) {
            setsubmittedvaluelist(prev => ({ ...prev, receiverNO: (submittedvaluelist.address as any).phone }));
        }
    }, [submittedvaluelist.address]);

    // Payment method options
    const PaymentMethodsOption = [
        ...PaymentMethodsOptions,
        {
            name: 'Cash on Delivery',
            img: '/imgfile/handshakeIcon.webp',
            id: 6,
            description: 'Pay on delivery',
        },
    ];

    const handleApplyPromo = () => {
        // Mock Promo Logic
        const code = submittedvaluelist.promoCode.trim().toUpperCase();

        if (!code) return;

        // Simulate API check
        if (code === 'SAVE10') {
            const discountAmount = Math.round(subtotal * 0.10); // 10%
            setsubmittedvaluelist((prev) => ({
                ...prev,
                appliedPromo: { code: 'SAVE10', discount: discountAmount },
            }));
            // toast.success("Coupon Applied: SAVE10 (10% Off)");
        }
        else if (code === 'FLAT500') {
            setsubmittedvaluelist((prev) => ({
                ...prev,
                appliedPromo: { code: 'FLAT500', discount: 500 },
            }));
        }
        else {
            alert('Invalid promo code');
            setsubmittedvaluelist(prev => ({ ...prev, appliedPromo: null }));
        }
    };

    const [minDate, setMinDate] = useState('');
    useEffect(() => {
        setMinDate(new Date().toISOString().split('T')[0]);
    }, []);

    const handleMethodSelect = (method: any) => {
        setSelectedMethod(method.id);
        setsubmittedvaluelist((prev) => ({ ...prev, paymentmethod: method.name }));
    };

    const toggleSection = (section: string) => {
        setOpenSections((prev: any) => ({
            ...prev,
            [section]: !prev[section],
        }));
    };

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--colour-fsP1)]"></div>
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

    const steps = [
        { key: 'address', label: 'Address', done: sectionStatus.address },
        { key: 'deliveryDate', label: 'Delivery', done: sectionStatus.deliveryDate },
        { key: 'paymentmethod', label: 'Payment', done: sectionStatus.paymentmethod },
    ];

    return (
        <div className="bg-gray-50 py-4 sm:py-8 min-h-screen">
            <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
                {/* Header & Stepper */}
                <div className="mb-6 sm:mb-8">
                    <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">Checkout</h1>

                    {/* Progress Stepper */}
                    <div className="flex items-center gap-1 sm:gap-2 bg-white rounded-xl p-3 sm:p-4 border border-gray-100 shadow-sm">
                        {steps.map((step, idx) => (
                            <div key={step.key} className="flex items-center flex-1">
                                <div className="flex items-center gap-2 flex-1">
                                    <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs sm:text-sm font-bold flex-shrink-0 transition-colors ${
                                        step.done
                                            ? 'bg-green-500 text-white'
                                            : 'bg-gray-100 text-gray-500'
                                    }`}>
                                        {step.done ? '✓' : idx + 1}
                                    </div>
                                    <span className={`text-xs sm:text-sm font-medium hidden sm:block ${step.done ? 'text-green-700' : 'text-gray-500'}`}>
                                        {step.label}
                                    </span>
                                </div>
                                {idx < steps.length - 1 && (
                                    <div className={`h-0.5 flex-1 mx-2 rounded-full transition-colors ${step.done ? 'bg-green-400' : 'bg-gray-200'}`} />
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                <div className="flex flex-col lg:flex-row lg:gap-8">
                    {/* LEFT COLUMN: Main Details */}
                    <div className="flex-1 space-y-4 sm:space-y-5">
                        {/* 1. Shipping Address */}
                        <section className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                            <button
                                onClick={() => toggleSection('address')}
                                className="w-full p-4 sm:p-5 border-b border-gray-100 flex items-center justify-between hover:bg-gray-50/50 transition-colors"
                            >
                                <div className="flex items-center gap-3">
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm transition-colors ${
                                        sectionStatus.address ? 'bg-green-500 text-white' : 'bg-blue-50 text-blue-600'
                                    }`}>
                                        {sectionStatus.address ? '✓' : '1'}
                                    </div>
                                    <div className="text-left">
                                        <h2 className="text-base sm:text-lg font-bold text-gray-900">Shipping Address</h2>
                                        {submittedvaluelist.address && !openSections.address && (
                                            <p className="text-xs text-gray-500 mt-0.5 truncate max-w-[250px]">
                                                {(submittedvaluelist.address as any)?.full_name}, {(submittedvaluelist.address as any)?.city}
                                            </p>
                                        )}
                                    </div>
                                </div>
                                {openSections.address ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
                            </button>

                            {openSections.address && (
                                <div className="p-4 sm:p-5">
                                    <AddressSelectionUI setsubmittedvaluelist={setsubmittedvaluelist} />
                                </div>
                            )}
                        </section>

                        {/* 2. Delivery Date */}
                        <section className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                            <button
                                onClick={() => toggleSection('deliveryDate')}
                                className="w-full p-4 sm:p-5 border-b border-gray-100 flex items-center justify-between hover:bg-gray-50/50 transition-colors"
                            >
                                <div className="flex items-center gap-3">
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm transition-colors ${
                                        sectionStatus.deliveryDate ? 'bg-green-500 text-white' : 'bg-blue-50 text-blue-600'
                                    }`}>
                                        {sectionStatus.deliveryDate ? '✓' : '2'}
                                    </div>
                                    <div className="text-left">
                                        <h2 className="text-base sm:text-lg font-bold text-gray-900">Delivery Preference</h2>
                                        {submittedvaluelist.deliveryDate && !openSections.deliveryDate && (
                                            <p className="text-xs text-gray-500 mt-0.5">{submittedvaluelist.deliveryDate}</p>
                                        )}
                                    </div>
                                </div>
                                {openSections.deliveryDate ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
                            </button>

                            {openSections.deliveryDate && (
                                <div className="p-4 sm:p-5">
                                    <div className="flex flex-col gap-3">
                                        <label className="text-sm font-semibold text-gray-700">Preferred Delivery Date</label>
                                        <div className="relative">
                                            <Input
                                                type="date"
                                                min={minDate}
                                                value={submittedvaluelist.deliveryDate}
                                                onChange={(e) => setsubmittedvaluelist(prev => ({ ...prev, deliveryDate: e.target.value }))}
                                                className="pl-10 h-11 border-gray-200 rounded-lg"
                                            />
                                            <Calendar className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                        </div>
                                        <p className="text-xs text-gray-500">Select when you'd like to receive your order.</p>
                                    </div>
                                </div>
                            )}
                        </section>

                        {/* 3. Payment Method */}
                        <section className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                            <button
                                onClick={() => toggleSection('paymentmethod')}
                                className="w-full p-4 sm:p-5 border-b border-gray-100 flex items-center justify-between hover:bg-gray-50/50 transition-colors"
                            >
                                <div className="flex items-center gap-3">
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm transition-colors ${
                                        sectionStatus.paymentmethod ? 'bg-green-500 text-white' : 'bg-blue-50 text-blue-600'
                                    }`}>
                                        {sectionStatus.paymentmethod ? '✓' : '3'}
                                    </div>
                                    <div className="text-left">
                                        <h2 className="text-base sm:text-lg font-bold text-gray-900">Payment Method</h2>
                                        {submittedvaluelist.paymentmethod && !openSections.paymentmethod && (
                                            <p className="text-xs text-gray-500 mt-0.5">{submittedvaluelist.paymentmethod}</p>
                                        )}
                                    </div>
                                </div>
                                {openSections.paymentmethod ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
                            </button>

                            {openSections.paymentmethod && (
                                <div className="p-4 sm:p-5">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        {PaymentMethodsOption.map((method) => (
                                            <label
                                                key={method.id}
                                                className={`relative flex items-center p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 hover:shadow-sm ${selectedMethod === method.id
                                                    ? 'border-blue-600 bg-blue-50/50'
                                                    : 'border-gray-200 bg-white hover:border-blue-200'
                                                    }`}
                                            >
                                                <input
                                                    type="radio"
                                                    name="payment"
                                                    value={method.id}
                                                    checked={selectedMethod === method.id}
                                                    onChange={() => handleMethodSelect(method)}
                                                    className="sr-only"
                                                />

                                                <div className="flex items-center gap-3 w-full">
                                                    <div className="relative w-10 h-7 flex-shrink-0 bg-gray-50 rounded p-0.5">
                                                        <Image
                                                            src={method.img}
                                                            alt={method.name}
                                                            fill
                                                            sizes="40px"
                                                            className="object-contain"
                                                        />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="font-semibold text-sm text-gray-900">{method.name}</div>
                                                        <div className="text-xs text-gray-500 mt-0.5">{method.description}</div>
                                                    </div>

                                                    <div
                                                        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors ${selectedMethod === method.id
                                                            ? 'border-blue-600 bg-blue-600'
                                                            : 'border-gray-300'
                                                            }`}
                                                    >
                                                        {selectedMethod === method.id && (
                                                            <div className="w-2 h-2 rounded-full bg-white" />
                                                        )}
                                                    </div>
                                                </div>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </section>
                    </div>

                    {/* RIGHT COLUMN: Order Summary (Sticky) */}
                    <div className="lg:w-[400px] lg:flex-shrink-0 mt-5 lg:mt-0">
                        <div className="lg:sticky lg:top-8 space-y-4">
                            <CheckoutProduct
                                setsubmittedvaluelist={setsubmittedvaluelist}
                                submittedvaluelist={submittedvaluelist}
                                handleApplyPromo={handleApplyPromo}
                            />

                            {/* Shipping Info */}
                            {shippingCost > 0 && (
                                <div className="flex items-center justify-between bg-white rounded-xl border border-gray-100 p-4 text-sm">
                                    <span className="text-gray-600">Shipping</span>
                                    <span className="font-semibold text-gray-900">Rs. {shippingCost.toFixed(2)}</span>
                                </div>
                            )}

                            <Button
                                onClick={handlesubmit}
                                size="lg"
                                disabled={!sectionStatus.address || !sectionStatus.paymentmethod}
                                className="w-full bg-[var(--colour-fsP2)] hover:bg-[var(--colour-fsP1)] text-white shadow-lg shadow-blue-200 transition-all duration-200 h-13 text-base font-bold rounded-xl disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Place Order <span className="mx-1.5 opacity-60">•</span> Rs. {(subtotal + shippingCost).toLocaleString()}
                            </Button>

                            <div className="text-center text-xs text-gray-500 flex items-center justify-center gap-1.5">
                                <div className="w-2 h-2 rounded-full bg-green-500"></div>
                                Secure SSL Encrypted Transaction
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
