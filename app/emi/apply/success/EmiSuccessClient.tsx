'use client';

import Link from 'next/link';
import Image from 'next/image';
import { CheckCircle2, CreditCard, Banknote, Calendar, Package, Store, ExternalLink } from 'lucide-react';
import { useEmiStore } from '@/app/emi/_components/emiContext';

export default function EmiSuccessClient() {
    const lastEmiSubmission = useEmiStore(s => s.lastEmiSubmission);

    if (!lastEmiSubmission) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
                <div className="bg-white border border-gray-200 rounded-2xl p-8 flex flex-col items-center gap-4 max-w-sm w-full text-center shadow-sm">
                    <div className="w-16 h-16 bg-gray-50 border border-gray-200 rounded-full flex items-center justify-center">
                        <Package className="w-8 h-8 text-gray-400" />
                    </div>
                    <div>
                        <h2 className="text-lg font-bold text-gray-900 mb-1">Application Not Found</h2>
                        <p className="text-sm text-gray-500">We couldn't find your EMI application. Please try again.</p>
                    </div>
                    <Link
                        href="/"
                        className="w-full h-11 flex items-center justify-center gap-2 bg-(--colour-fsP2) text-white font-bold rounded-xl text-sm hover:opacity-90 transition-opacity"
                    >
                        <Store className="w-4 h-4" />
                        Browse Products
                    </Link>
                </div>
            </div>
        );
    }

    const { product, emiData, selectedOption, selectedVariant, submittedAt } = lastEmiSubmission;

    const productImage = product?.images?.[0]?.url ?? product?.thumb?.url ?? product?.image?.full ?? null;
    const formattedDate = submittedAt
        ? new Date(submittedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
        : 'N/A';

    const isCreditCard = selectedOption?.toLowerCase().includes('credit');

    return (
        <div className="min-h-screen bg-gray-50 py-6 px-3 sm:px-4">
            <div className="max-w-2xl mx-auto space-y-4">

                {/* Success Header */}
                <div className="bg-white border border-gray-200 rounded-2xl p-6 text-center">
                    <div className="w-16 h-16 bg-(--colour-fsP2)/10 border-2 border-(--colour-fsP2)/20 rounded-full flex items-center justify-center mx-auto mb-4">
                        <CheckCircle2 className="w-9 h-9 text-(--colour-fsP2)" />
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900 mb-1">EMI Application Submitted!</h1>
                    <p className="text-sm text-gray-500">Your application is under review. We'll notify you once it's processed.</p>
                    <p className="text-xs text-gray-400 mt-2">Submitted on {formattedDate}</p>
                </div>

                {/* Product Card */}
                {product && (
                    <div className="bg-white border border-gray-200 rounded-2xl p-4">
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">Product</p>
                        <div className="flex items-center gap-4">
                            <div className="w-16 h-16 rounded-xl border border-gray-200 bg-gray-50 relative shrink-0 overflow-hidden">
                                {productImage ? (
                                    <Image src={productImage} alt={product.name ?? 'Product'} fill sizes="64px" className="object-contain p-1" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center">
                                        <Package className="w-6 h-6 text-gray-300" />
                                    </div>
                                )}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="font-bold text-gray-900 text-sm leading-snug line-clamp-2">{product.name}</p>
                                {selectedVariant && (
                                    <p className="text-[11px] text-(--colour-fsP2) font-semibold mt-1">{selectedVariant}</p>
                                )}
                                <p className="text-xs text-gray-500 mt-0.5">
                                    Price: <span className="font-bold text-gray-800">Rs. {(typeof product.price === 'object' ? product.price.current : product.price)?.toLocaleString()}</span>
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* EMI Breakdown */}
                <div className="bg-white border border-gray-200 rounded-2xl p-4">
                    <div className="flex items-center gap-2 mb-3">
                        {isCreditCard ? (
                            <CreditCard className="w-4 h-4 text-(--colour-fsP2)" />
                        ) : (
                            <Banknote className="w-4 h-4 text-(--colour-fsP2)" />
                        )}
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                            {isCreditCard ? 'Credit Card EMI' : 'Bank EMI'} Breakdown
                        </p>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div className="bg-gray-50 border border-gray-200 rounded-xl p-3">
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Monthly EMI</p>
                            <p className="text-xl font-black text-(--colour-fsP2)">Rs. {emiData?.paymentpermonth?.toLocaleString() ?? '—'}</p>
                        </div>
                        <div className="bg-gray-50 border border-gray-200 rounded-xl p-3">
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 flex items-center gap-1">
                                <Calendar className="w-3 h-3" /> Tenure
                            </p>
                            <p className="text-xl font-black text-gray-800">{emiData?.tenure ?? '—'} <span className="text-sm font-semibold text-gray-500">months</span></p>
                        </div>
                        <div className="bg-gray-50 border border-gray-200 rounded-xl p-3">
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Down Payment</p>
                            <p className="text-base font-bold text-gray-800">Rs. {emiData?.downPayment?.toLocaleString() ?? '—'}</p>
                        </div>
                        <div className="bg-gray-50 border border-gray-200 rounded-xl p-3">
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Finance Amount</p>
                            <p className="text-base font-bold text-gray-800">Rs. {emiData?.financeAmount?.toLocaleString() ?? '—'}</p>
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col sm:flex-row gap-3">
                    <Link
                        href="/profile?tab=emi"
                        className="flex-1 h-12 flex items-center justify-center gap-2 bg-(--colour-fsP2) text-white font-bold rounded-xl text-sm hover:opacity-90 transition-opacity"
                    >
                        <ExternalLink className="w-4 h-4" />
                        View & Track EMI Application
                    </Link>
                    <Link
                        href="/"
                        className="flex-1 h-12 flex items-center justify-center gap-2 bg-white border border-gray-200 text-gray-700 font-bold rounded-xl text-sm hover:border-gray-300 transition-colors"
                    >
                        <Store className="w-4 h-4" />
                        Continue Shopping
                    </Link>
                </div>

            </div>
        </div>
    );
}
