'use client';

import React, { useEffect, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Check, Package, CreditCard, PackageOpen, Store, MapPin, Navigation } from 'lucide-react';
import { trackPurchase } from '@/lib/Analytic';
import { useCartStore } from '../../context/CartContext';
import { useShallow } from 'zustand/react/shallow';
import { APIProvider, Map, AdvancedMarker } from '@vis.gl/react-google-maps';

export default function SuccessClient() {
    const { lastOrderData } = useCartStore(useShallow(state => ({
        lastOrderData: state.lastOrderData
    })));

    // Destructure based on the pattern provided: { order, shipping_address, recipient }
    const orderData = lastOrderData?.order;
    const shippingAddress = lastOrderData?.shipping_address;
    const recipient = lastOrderData?.recipient;

    // Items extraction - fallback if items aren't directly in the order object
    const items = useMemo(() => orderData?.items ?? [], [orderData]);

    useEffect(() => {
        if (orderData) {
            // Track purchase
            const trackItems = items.map((item: any) => ({
                id: item.product?.id || item.product_id,
                name: item.product?.name || 'Product',
                price: item.price || 0,
                quantity: item.quantity
            }));

            trackPurchase({
                orderNumber: orderData.invoice_number,
                total: orderData.total || orderData.order_total,
                items: trackItems
            });
        }
    }, [orderData, items]);

    if (!orderData) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gray-50">
                <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 text-center max-w-md w-full">
                    <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Package className="w-8 h-8 text-blue-500" />
                    </div>
                    <h2 className="text-xl font-bold text-gray-900 mb-2">Order Not Found</h2>
                    <p className="text-gray-500 mb-6 font-medium">We couldn't retrieve your order details. If you just placed an order, it might still be processing.</p>
                    <Link
                        href="/"
                        className="inline-flex items-center justify-center px-6 py-3 bg-[var(--colour-fsP2)] text-white font-bold rounded-xl hover:opacity-90 transition-all w-full"
                    >
                        Return Home
                    </Link>
                </div>
            </div>
        );
    }

    // Format Date
    const formattedDate = orderData.created_at ? new Date(orderData.created_at).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    }) : 'N/A';

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

                        {/* recipient info if available */}
                        {recipient && (
                            <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100 mb-6">
                                <h3 className="text-sm font-bold text-[var(--colour-fsP2)] mb-2 flex items-center gap-2">
                                    <Check className="w-4 h-4" /> Recipient
                                </h3>
                                <p className="text-xs text-gray-700 font-medium">Name: {recipient.name}</p>
                                <p className="text-xs text-gray-700 font-medium tracking-wide mt-0.5">Phone: {recipient.phone}</p>
                            </div>
                        )}

                        {/* Action Buttons */}
                        <div className="flex flex-col sm:flex-row justify-between gap-3 w-full mt-6">
                            <Link
                                href="/profile?tab=orders"
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
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4 sm:mb-5 pb-4 border-b border-gray-200">
                            <div>
                                <p className="text-xs text-gray-500 mb-0.5 font-bold uppercase tracking-wider">Order Detail</p>
                                <p className="font-semibold text-gray-700 text-sm">{formattedDate}</p>
                                <p className="font-bold text-[var(--colour-fsP2)] text-sm mt-0.5">{orderData.order_no}</p>
                            </div>

                            <div>
                                <p className="text-xs text-gray-500 mb-0.5 font-bold uppercase tracking-wider">Payment Method</p>
                                <div className="flex items-center">
                                    <CreditCard className="w-3 h-3 sm:w-3.5 sm:h-3.5 mr-1 text-gray-600" />
                                    <p className="font-semibold text-gray-700 text-sm capitalize">{orderData.payment_type?.replace(/_/g, ' ') || 'N/A'}</p>
                                </div>
                                <p className="text-xs font-bold text-[var(--colour-fsP1)] mt-0.5">{orderData.order_status}</p>
                            </div>
                        </div>

                        {/* Shipping Address */}
                        {shippingAddress && (
                            <div className="mb-6 p-4 bg-gray-50 rounded-xl border border-gray-200">
                                <p className="text-xs text-gray-500 mb-2 font-bold uppercase tracking-wider">Shipping Address</p>
                                <p className="text-xs text-gray-600 font-medium mt-1 leading-relaxed">
                                    {shippingAddress.landmark}, {shippingAddress.city}<br />
                                    {shippingAddress.district}, {shippingAddress.province}, {shippingAddress.country}
                                </p>
                                {shippingAddress.lat && shippingAddress.lng && (
                                    <div className="mt-4 relative h-60 rounded-2xl overflow-hidden border border-gray-200 shadow-inner group">
                                        <APIProvider apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ''}>
                                            <Map
                                                mapId={process.env.NEXT_PUBLIC_MAP_ID ?? 'delivery-map'}
                                                defaultCenter={{
                                                    lat: parseFloat(shippingAddress.lat),
                                                    lng: parseFloat(shippingAddress.lng)
                                                }}
                                                defaultZoom={16}
                                                gestureHandling="greedy"
                                                disableDefaultUI={false}
                                                mapTypeControl={false}
                                                streetViewControl={false}
                                                className="w-full h-full"
                                            >
                                                <AdvancedMarker
                                                    position={{
                                                        lat: parseFloat(shippingAddress.lat),
                                                        lng: parseFloat(shippingAddress.lng)
                                                    }}
                                                    title="Delivery Location"
                                                >
                                                    <div className="flex flex-col items-center">
                                                        <div className="w-9 h-9 bg-[var(--colour-fsP2)] rounded-full border-4 border-white shadow-lg flex items-center justify-center">
                                                            <MapPin className="w-5 h-5 text-white" />
                                                        </div>
                                                        <div className="w-1 h-2 bg-[var(--colour-fsP2)] -mt-0.5 rounded-full" />
                                                    </div>
                                                </AdvancedMarker>
                                            </Map>
                                        </APIProvider>

                                        <a
                                            href={`https://www.google.com/maps/search/?api=1&query=${shippingAddress.lat},${shippingAddress.lng}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="absolute top-3 left-3 bg-white/95 backdrop-blur px-3 py-2 rounded-xl border border-gray-200 text-[10px] font-bold text-[var(--colour-fsP2)] shadow-sm hover:bg-white transition-all flex items-center gap-2 z-10"
                                        >
                                            <Navigation className="w-3.5 h-3.5" />
                                            Open in Google Maps
                                        </a>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Order Items */}
                        {items.length > 0 && (
                            <div className="space-y-3 mb-4 sm:mb-5 max-h-[400px] overflow-y-auto custom-scrollbar pr-1">
                                <p className="text-xs text-gray-500 mb-2 font-bold uppercase tracking-wider">Order Items</p>
                                {items.map((item: any) => (
                                    <div key={item.id} className="flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-100 shadow-sm hover:border-gray-200 transition-colors group">
                                        <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gray-50 rounded-lg flex items-center justify-center overflow-hidden border border-gray-200 shrink-0">
                                            {item.product?.thumb?.url || item.product?.image?.thumb ? (
                                                <Image
                                                    src={item.product?.thumb?.url || item.product?.image?.thumb}
                                                    alt={item.product?.name || 'Product'}
                                                    width={64}
                                                    height={64}
                                                    className="w-full h-full object-contain p-1 group-hover:scale-110 transition-transform"
                                                />
                                            ) : (
                                                <Package className="w-6 h-6 text-gray-300" />
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h3 className="font-bold text-gray-900 text-sm truncate">{item.product?.name || 'Product'}</h3>
                                            <p className="text-xs text-gray-500 font-medium">Quantity: {item.quantity}</p>
                                        </div>
                                        <div className="font-bold text-sm text-[var(--colour-fsP2)] shrink-0">
                                            Rs {(item.price || 0).toLocaleString()}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Price Breakdown */}
                        <div className="space-y-2.5 my-4 p-4 bg-gray-50 rounded-xl border border-gray-200">
                            <div className="flex justify-between text-gray-600 text-xs sm:text-sm font-medium">
                                <span>Sub Total</span>
                                <span className="font-bold">Rs {(orderData.order_total || orderData.total || 0).toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between text-slate-600 text-xs sm:text-sm font-medium">
                                <span>Shipping Cost</span>
                                <span className="font-bold text-green-600">{orderData.shipping_cost === 0 ? 'Free' : `Rs ${orderData.shipping_cost.toLocaleString()}`}</span>
                            </div>
                            {(orderData.discounts_total > 0 || orderData.discount_coupon) && (
                                <div className="pt-2 mt-2 border-t border-gray-200 space-y-1">
                                    {orderData.discounts_total > 0 && (
                                        <div className="flex justify-between text-green-600 text-xs sm:text-sm font-medium italic">
                                            <span>Total Discount</span>
                                            <span className="font-bold font-price italic">- Rs {orderData.discounts_total.toLocaleString()}</span>
                                        </div>
                                    )}
                                    {orderData.discount_coupon && (
                                        <div className="flex justify-between text-blue-600 text-xs sm:text-sm font-medium">
                                            <span>Coupon Applied</span>
                                            <span className="font-bold bg-blue-100 px-2 py-0.5 rounded text-[10px] sm:text-xs tracking-wider">{orderData.discount_coupon}</span>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        <div className="flex justify-between items-center p-4 bg-[var(--colour-fsP2)]/5 rounded-xl border border-[var(--colour-fsP2)]/20 shadow-inner">
                            <span className="font-black text-gray-900 text-sm uppercase tracking-widest">Total Paid</span>
                            <span className="font-black text-[var(--colour-fsP2)] text-xl sm:text-2xl">Rs {(orderData.total || orderData.order_total || 0).toLocaleString()}</span>
                        </div>
                    </div>
                </div>


            </div>
        </div>
    );
}

