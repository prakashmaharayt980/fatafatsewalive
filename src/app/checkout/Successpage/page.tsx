'use client'

import React from 'react';
import { Check, Package, CreditCard, MapPin, Mail, Phone, User, MapPinHouse, PackageOpen, Store } from 'lucide-react';
import { Divider } from '@mui/material';
import { useRouter } from 'next/navigation';

export default function OrderConfirmation() {
    const router = useRouter();
    const orderDetails = {
        date: '02 May 2023',
        orderNumber: '024-125478956',
        paymentMethod: 'Mastercard',
        items: [
            {
                id: 1,
                name: 'All In One Chocolate Combo',
                pack: 'Medium',
                qty: 1,
                price: 50.00,
                image: '🍫'
            },
            {
                id: 2,
                name: 'Desire Of Hearts',
                pack: 'Large',
                qty: 1,
                price: 50.00,
                image: '💝'
            }
        ],
        subtotal: 100.00,
        shipping: 2.00,
        tax: 5.00,
        total: 107.00
    };

    const handlerouter = (path: string) => {
        router.push(path);
    };

    const billingInfo = {
        name: 'Jane Smith',
        address: '456 Oak St #3b, San Francisco, CA 94102, United States',
        phone: '+1 (415) 555-1234',
        email: 'jane.smith@email.com'
    };

    return (
        <div className="min-h-screen p-3 sm:p-4">
            <div className="max-w-7xl mx-auto bg-white/80 backdrop-blur-sm rounded-2xl shadow-2xl p-4 sm:p-6 border border-white/20">
                <div className="grid lg:grid-cols-5 gap-3 sm:gap-6">
                    {/* Left Column */}
                    <div className="lg:col-span-2">
                        {/* Success Icon */}
                        <div className="flex justify-center mb-4">
                            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-emerald-400 via-green-500 to-teal-500 rounded-full flex items-center justify-center shadow-lg">
                                <Check className="w-8 h-8 sm:w-10 sm:h-10 text-white" strokeWidth={3} />
                            </div>
                        </div>

                        {/* Thank You Message */}
                        <h1 className="text-lg sm:text-xl md:text-2xl font-black text-transparent bg-clip-text bg-[var(--colour-fsP2)] mb-2 text-center leading-tight">
                            Thank you for your <br /> Purchase!
                        </h1>

                        <p className="text-gray-600 text-center mb-4 sm:mb-6 text-xs sm:text-sm leading-relaxed">
                            Your order will be processed within 24 hours during working days.<br /> We will notify you by email once your order has been shipped.
                        </p>

                        {/* Billing Address */}
                        <div className="bg-gradient-to-br from-gray-50/50 to-gray-100/50 backdrop-blur rounded-xl p-3 sm:p-4 mb-4 border border-gray-200/50">
                            <h2 className="text-base sm:text-lg font-bold text-[var(--colour-fsP2)] mb-3 flex items-center">
                                <MapPin className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-[var(--colour-fsP1)]" />
                                Billing Address
                            </h2>

                            <div className="space-y-2 text-xs sm:text-sm">
                                <div className="flex items-start">
                                    <User className="w-3 h-3 sm:w-3.5 sm:h-3.5 mr-1.5 text-gray-500" />
                                    <span className="font-semibold text-gray-700 w-14 sm:w-16 shrink-0">Name</span>
                                    <span className="text-gray-900">{billingInfo.name}</span>
                                </div>

                                <div className="flex items-start">
                                    <MapPinHouse className="w-3 h-3 sm:w-3.5 sm:h-3.5 mr-1.5 text-gray-500" />
                                    <span className="font-semibold text-gray-700 w-14 sm:w-16 shrink-0">Address</span>
                                    <span className="text-gray-900 leading-snug">{billingInfo.address}</span>
                                </div>

                                <div className="flex items-center">
                                    <Phone className="w-3 h-3 sm:w-3.5 sm:h-3.5 mr-1.5 text-gray-500" />
                                    <span className="font-semibold text-gray-700 w-12 sm:w-14 shrink-0">Phone</span>
                                    <span className="text-gray-900">{billingInfo.phone}</span>
                                </div>

                                <div className="flex items-center">
                                    <Mail className="w-3 h-3 sm:w-3.5 sm:h-3.5 mr-1.5 text-gray-500" />
                                    <span className="font-semibold text-gray-700 w-12 sm:w-14 shrink-0">Email</span>
                                    <span className="text-gray-900">{billingInfo.email}</span>
                                </div>
                            </div>
                        </div>

                        {/* Track Order Button */}
                        <div className="flex flex-col sm:flex-row justify-between gap-2 w-full">
                            <button
                                onClick={() => handlerouter('/')}
                                className="w-full sm:w-fit px-3 sm:px-4 bg-[var(--colour-fsP2)] text-white font-bold py-2 sm:py-3 rounded-lg shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-[1.02] flex items-center justify-center text-xs sm:text-sm"
                            >
                                <PackageOpen className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-2 text-[var(--colour-fsP1)]" fill="white" strokeWidth={1} />
                                Track Your Order
                            </button>
                            <button
                                onClick={() => handlerouter('/')}
                                className="w-full sm:w-fit px-3 sm:px-4 bg-[var(--colour-fsP2)] text-white font-bold py-2 sm:py-3 rounded-lg shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-[1.02] flex items-center justify-center text-xs sm:text-sm"
                            >
                                <Store className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-2 text-[var(--colour-fsP1)]" fill="white" strokeWidth={1} />
                                Continue to Shopping
                            </button>
                        </div>
                    </div>

                    {/* Right Column - Order Summary */}
                    <div className="lg:col-span-3">
                        <h2 className="text-lg sm:text-xl md:text-2xl font-black text-[var(--colour-fsP2)] mb-4">Order Summary</h2>

                        {/* Order Info */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4 sm:mb-5 pb-4 border-b border-gray-200">
                            <div>
                                <p className="text-xs text-gray-500 mb-0.5">Date</p>
                                <p className="font-bold text-gray-700 text-sm">{orderDetails.date}</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 mb-0.5">Order Number</p>
                                <p className="font-bold text-gray-700 text-sm">{orderDetails.orderNumber}</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 mb-0.5">Payment Method</p>
                                <div className="flex items-center">
                                    <CreditCard className="w-3 h-3 sm:w-3.5 sm:h-3.5 mr-1 text-gray-600" />
                                    <p className="font-bold text-gray-700 text-sm">{orderDetails.paymentMethod}</p>
                                </div>
                            </div>
                        </div>

                        {/* Order Items */}
                        <div className="space-y-3 mb-4 sm:mb-5">
                            {orderDetails.items.map((item) => (
                                <div key={item.id} className="flex items-center gap-3 p-3 bg-gray-100 backdrop-blur rounded-xl border border-rose-100/50 hover:shadow-md transition-all duration-200">
                                    <div className="w-12 h-12 sm:w-16 sm:h-16 bg-white rounded-lg flex items-center justify-center text-2xl sm:text-3xl shadow-sm shrink-0">
                                        {item.image}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-bold text-gray-900 text-sm truncate">{item.name}</h3>
                                        <p className="text-xs text-gray-600">Pack: {item.pack}</p>
                                        <p className="text-xs text-gray-600">Qty: {item.qty}</p>
                                    </div>
                                    <div className="font-semibold text-base sm:text-lg text-gray-600 shrink-0">
                                        Rs {item.price.toFixed(2)}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Price Breakdown */}
                        <div className="space-y-2 mb-4 pb-4 border-b border-gray-200">
                            <div className="flex justify-between text-gray-600 text-xs sm:text-sm">
                                <span>Sub Total</span>
                                <span className="font-semibold">Rs {orderDetails.subtotal.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-gray-600 text-xs sm:text-sm">
                                <span>Shipping</span>
                                <span className="font-semibold">Rs {orderDetails.shipping.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-gray-600 text-xs sm:text-sm">
                                <span>Tax</span>
                                <span className="font-semibold">Rs {orderDetails.tax.toFixed(2)}</span>
                            </div>
                        </div>

                        <div className="flex justify-between items-center text-sm sm:text-base">
                            <span className="font-bold text-gray-900">Total Paid</span>
                            <span className="font-bold text-[var(--colour-fsP2)]">Rs {orderDetails.total.toFixed(2)}</span>
                        </div>
                    </div>
                </div>
                <Divider className="h-1 py-2" />
                <p className="text-[var(--colour-fsP1)] text-center pt-2 text-xs sm:text-sm leading-relaxed">
                    If you have any problem or need to know more, contact our service number
                </p>
            </div>
        </div>
    );
}