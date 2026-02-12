'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { Check, Package, CreditCard, MapPin, Mail, Phone, User, MapPinHouse, PackageOpen, Store } from 'lucide-react';
import { trackPurchase } from '@/lib/Analytic';

// --- TYPES ---
interface Product {
    id: number;
    name: string;
    slug: string;
    sku: string;
    image: {
        full: string;
        thumb: string;
    };
}

interface OrderItem {
    id: number;
    order_id: number;
    product_id: number;
    quantity: number;
    price: number | null;
    product: Product;
}

interface ShippingAddress {
    id: number;
    full_name: string | null;
    phone: string | null;
    email: string | null;
    address: string | null;
    city: string | null;
    state: string | null;
    country: string | null;
    postal_code: string | null;
}

export interface OrderData {
    id: number;
    invoice_number: string;
    status: number;
    order_status: string;
    order_total: number;
    shipping_cost: number;
    payment_type: string;
    items: OrderItem[];
    shipping_address: ShippingAddress;
    created_at: string;
    discounts_total: number;
    discount_coupon: string;
}

interface SuccessClientProps {
    order: OrderData;
}

export default function SuccessClient({ order }: SuccessClientProps) {

    useEffect(() => {
        if (order) {
            // Track purchase
            const trackItems = order.items.map((item: any) => ({
                id: item.product.id,
                name: item.product.name,
                price: item.price || 0,
                quantity: item.quantity
            }));

            trackPurchase({
                orderNumber: order.invoice_number,
                total: order.order_total,
                items: trackItems
            });
        }
    }, [order]);

    // Format Date
    const formattedDate = new Date(order.created_at).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    return (
        <div className="min-h-screen p-3 sm:p-4 bg-gray-50 mt-8">
            <div className="max-w-7xl mx-auto bg-white rounded-lg p-4 sm:p-6 border border-gray-200">
                <div className="flex flex-col-reverse lg:grid lg:grid-cols-5 gap-3 sm:gap-6">
                    {/* Left Column */}
                    <div className="lg:col-span-2">
                        {/* Success Icon */}
                        <div className="flex justify-center mb-4">
                            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-[var(--colour-fsP2)] rounded-full flex items-center justify-center">
                                <Check className="w-8 h-8 sm:w-10 sm:h-10 text-white" strokeWidth={3} />
                            </div>
                        </div>

                        {/* Thank You Message */}
                        <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-[var(--colour-fsP2)] mb-2 text-center leading-tight">
                            Thank you for your <br /> Purchase!
                        </h1>

                        <p className="text-gray-600 text-center mb-4 sm:mb-6 text-xs sm:text-sm">
                            Your order has been placed successfully.<br /> We will notify you by email once your order has been shipped.
                        </p>

                        {/* Shipping Address */}
                        <div className="bg-gray-50 rounded-lg p-3 sm:p-4 mb-4 border border-gray-200">
                            <h2 className="text-base sm:text-lg font-bold text-[var(--colour-fsP2)] mb-3 flex items-center">
                                <MapPin className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-[var(--colour-fsP2)]" />
                                Shipping Details
                            </h2>

                            <div className="space-y-2 text-xs sm:text-sm">
                                {order.shipping_address.full_name && (
                                    <div className="flex items-start">
                                        <User className="w-3 h-3 sm:w-3.5 sm:h-3.5 mr-1.5 text-gray-500" />
                                        <span className="font-semibold text-gray-700 w-14 sm:w-16 shrink-0">Name</span>
                                        <span className="text-gray-900">{order.shipping_address.full_name}</span>
                                    </div>
                                )}

                                <div className="flex items-start">
                                    <MapPinHouse className="w-3 h-3 sm:w-3.5 sm:h-3.5 mr-1.5 text-gray-500" />
                                    <span className="font-semibold text-gray-700 w-14 sm:w-16 shrink-0">Address</span>
                                    <span className="text-gray-900">
                                        {[
                                            order.shipping_address.address,
                                            order.shipping_address.city,
                                            order.shipping_address.state,
                                            order.shipping_address.country,
                                            order.shipping_address.postal_code
                                        ].filter(Boolean).join(', ')}
                                    </span>
                                </div>

                                {order.shipping_address.phone && (
                                    <div className="flex items-center">
                                        <Phone className="w-3 h-3 sm:w-3.5 sm:h-3.5 mr-1.5 text-gray-500" />
                                        <span className="font-semibold text-gray-700 w-12 sm:w-14 shrink-0">Phone</span>
                                        <span className="text-gray-900">{order.shipping_address.phone}</span>
                                    </div>
                                )}

                                {order.shipping_address.email && (
                                    <div className="flex items-center">
                                        <Mail className="w-3 h-3 sm:w-3.5 sm:h-3.5 mr-1.5 text-gray-500" />
                                        <span className="font-semibold text-gray-700 w-12 sm:w-14 shrink-0">Email</span>
                                        <span className="text-gray-900">{order.shipping_address.email}</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex flex-col sm:flex-row justify-between gap-2 w-full">
                            <Link
                                href="/profile/orders"
                                className="w-full sm:w-fit px-3 sm:px-4 bg-[var(--colour-fsP2)] text-white font-semibold py-2 sm:py-3 rounded-lg flex items-center justify-center text-xs sm:text-sm"
                            >
                                <PackageOpen className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-2" strokeWidth={1.5} />
                                Track Your Order
                            </Link>
                            <Link
                                href="/"
                                className="w-full sm:w-fit px-3 sm:px-4 bg-white border border-[var(--colour-fsP2)] text-[var(--colour-fsP2)] font-semibold py-2 sm:py-3 rounded-lg flex items-center justify-center text-xs sm:text-sm"
                            >
                                <Store className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-2" strokeWidth={1.5} />
                                Continue Shopping
                            </Link>
                        </div>
                    </div>

                    {/* Right Column - Order Summary */}
                    <div className="lg:col-span-3">
                        <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-[var(--colour-fsP2)] mb-4">Order Summary</h2>

                        {/* Order Info */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4 sm:mb-5 pb-4 border-b border-gray-200">
                            <div>
                                <p className="text-xs text-gray-500 mb-0.5">Date</p>
                                <p className="font-semibold text-gray-700 text-sm">{formattedDate}</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 mb-0.5">Order Number</p>
                                <p className="font-semibold text-gray-700 text-sm">{order.invoice_number}</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 mb-0.5">Payment Method</p>
                                <div className="flex items-center">
                                    <CreditCard className="w-3 h-3 sm:w-3.5 sm:h-3.5 mr-1 text-gray-600" />
                                    <p className="font-semibold text-gray-700 text-sm capitalize">{order.payment_type?.replace(/_/g, ' ') || 'N/A'}</p>
                                </div>
                            </div>
                        </div>

                        {/* Order Items */}
                        <div className="space-y-3 mb-4 sm:mb-5 max-h-[400px] overflow-y-auto">
                            {order.items.map((item) => (
                                <div key={item.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                                    <div className="w-12 h-12 sm:w-16 sm:h-16 bg-white rounded-lg flex items-center justify-center overflow-hidden border border-gray-200 shrink-0">
                                        {item.product.image?.thumb ? (
                                            <img src={item.product.image.thumb} alt={item.product.name} className="w-full h-full object-cover" />
                                        ) : (
                                            <Package className="w-6 h-6 text-gray-400" />
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-semibold text-gray-900 text-sm truncate">{item.product.name}</h3>
                                        <p className="text-xs text-gray-600">Qty: {item.quantity}</p>
                                    </div>
                                    <div className="font-semibold text-base sm:text-lg text-[var(--colour-fsP2)] shrink-0">
                                        Rs {(item.price || 0).toLocaleString()}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Price Breakdown */}
                        <div className="space-y-2 my-4  pb-4 border-b border-gray-200">
                            <div className="flex justify-between text-gray-600 text-xs sm:text-sm">
                                <span>Sub Total</span>
                                <span className="font-semibold">Rs {(order.order_total).toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between text-green-600 text-xs sm:text-sm">
                                <span>Discount </span>
                                <span className="font-semibold">- Rs {(order.discounts_total).toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between text-gray-600 text-xs sm:text-sm">
                                <span>Discount Coupon </span>
                                <span className="font-semibold"> {(order.discount_coupon)}</span>
                            </div>


                        </div>

                        <div className="flex justify-between items-center text-sm sm:text-base">
                            <span className="font-bold text-gray-900">Total Paid</span>
                            <span className="font-bold text-[var(--colour-fsP2)] text-lg">Rs {order.order_total.toLocaleString()}</span>
                        </div>
                    </div>
                </div>

                <hr className="my-4 border-gray-200" />

                <p className="text-[var(--colour-fsP2)] text-center text-xs sm:text-sm">
                    If you have any problem or need to know more, contact our service number
                </p>
            </div>
        </div>
    );
}
