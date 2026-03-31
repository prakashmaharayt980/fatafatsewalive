"use client";

import React from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { X, CreditCard, Percent, Clock, Info, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";

interface ProductEmiDialogProps {
    isOpen: boolean;
    onClose: () => void;
    product: any;
    currentPrice: number;
    selectedVariant: any;
}

const ProductEmiDialog: React.FC<ProductEmiDialogProps> = ({
    isOpen,
    onClose,
    product,
    currentPrice,
    selectedVariant,
}) => {
    const router = useRouter();

    // EMI mapping logic
    const emiPlans = [
        { months: 36, rate: Math.round(currentPrice / 36), label: "Super Saver", color: "text-blue-600", bg: "bg-blue-50", border: "border-blue-100" },
        { months: 24, rate: Math.round(currentPrice / 24), label: "Extended", color: "text-indigo-600", bg: "bg-indigo-50", border: "border-indigo-100" },
        { months: 18, rate: Math.round(currentPrice / 18), label: "Most Popular", color: "text-[var(--colour-fsP2)]", bg: "bg-orange-50", border: "border-orange-100" },
        { months: 12, rate: Math.round(currentPrice / 12), label: "Standard", color: "text-cyan-600", bg: "bg-cyan-50", border: "border-cyan-100" },
    ];

    if (!isOpen) return null;

    return createPortal(
        <div
            className="fixed inset-0 z-[9999] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-150"
            onClick={onClose}
        >
            <div
                className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[85vh] overflow-y-auto animate-in zoom-in-95 slide-in-from-bottom-4 duration-200"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Dialog Header */}
                <div className="sticky top-0 bg-white z-10 px-5 pt-5 pb-3 border-b border-gray-100">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[var(--colour-fsP2)] to-[var(--colour-fsP1)] flex items-center justify-center shadow-sm">
                                <CreditCard className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <h3 className="text-base font-bold text-slate-900">EMI Plans</h3>
                                <p className="text-[11px] text-slate-500">No Cost EMI • 0% Interest</p>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 transition-colors cursor-pointer"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                {/* Product summary */}
                <div className="px-5 py-3 bg-gray-50/60 border-b border-gray-100">
                    <div className="flex items-center gap-3">
                        {product.thumb?.url && (
                            <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-white border border-gray-100 shrink-0">
                                <Image src={product.thumb.url} alt={product.name} fill className="object-contain p-1" sizes="48px" />
                            </div>
                        )}
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-slate-800 truncate">{product.name}</p>
                            <p className="text-lg font-bold text-slate-900">Rs.{currentPrice.toLocaleString()}</p>
                        </div>
                    </div>
                </div>

                {/* EMI Plans List */}
                <div className="px-5 py-4 space-y-2.5">
                    <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-3">Choose Your Plan</p>
                    {emiPlans.map((plan, idx) => (
                        <div
                            key={idx}
                            className={cn(
                                "group relative flex items-center gap-3 p-3 rounded-xl border transition-all duration-200 cursor-pointer hover:shadow-md",
                                plan.border, plan.bg,
                                "hover:border-[var(--colour-fsP2)]/40"
                            )}
                            onClick={() => {
                                onClose();
                                router.push(
                                    selectedVariant?.color
                                        ? `/emi/apply/${product.slug}?selectedcolor=${selectedVariant.color}&months=${plan.months}`
                                        : `/emi/apply/${product.slug}?months=${plan.months}`
                                );
                            }}
                        >
                            {/* Tenure badge */}
                            <div className={cn("w-11 h-11 rounded-xl flex flex-col items-center justify-center shrink-0", plan.bg, "border", plan.border)}>
                                <span className={cn("text-base font-extrabold leading-none", plan.color)}>{plan.months}</span>
                                <span className="text-[8px] font-bold text-slate-500 uppercase">mo</span>
                            </div>

                            {/* Info */}
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                    <span className="text-sm font-bold text-slate-800">{plan.label}</span>
                                    {idx === 2 && (
                                        <span className="text-[9px] font-bold text-white bg-[var(--colour-fsP2)] px-1.5 py-0.5 rounded-md">POPULAR</span>
                                    )}
                                </div>
                                <div className="flex items-baseline gap-1 mt-0.5">
                                    <span className="text-[10px] text-slate-500">Rs.</span>
                                    <span className="text-base font-extrabold text-slate-900 group-hover:text-[var(--colour-fsP2)] transition-colors">
                                        {plan.rate.toLocaleString()}
                                    </span>
                                    <span className="text-[10px] text-slate-500">/month</span>
                                </div>
                            </div>

                            {/* Arrow */}
                            <div className="w-7 h-7 rounded-full bg-white border border-gray-100 flex items-center justify-center shrink-0 group-hover:bg-[var(--colour-fsP2)] group-hover:border-[var(--colour-fsP2)] group-hover:text-white text-slate-300 transition-all shadow-sm">
                                <ChevronRight className="w-3.5 h-3.5" />
                            </div>
                        </div>
                    ))}
                </div>

                {/* Footer benefits */}
                <div className="px-5 pb-5 pt-2 border-t border-gray-100">
                    <div className="grid grid-cols-3 gap-2 mt-3">
                        <div className="flex flex-col items-center gap-1.5 text-center">
                            <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center">
                                <Percent className="w-3.5 h-3.5 text-emerald-600" />
                            </div>
                            <span className="text-[10px] font-semibold text-slate-600">0% Interest</span>
                        </div>
                        <div className="flex flex-col items-center gap-1.5 text-center">
                            <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
                                <Clock className="w-3.5 h-3.5 text-blue-600" />
                            </div>
                            <span className="text-[10px] font-semibold text-slate-600">Quick Approval</span>
                        </div>
                        <div className="flex flex-col items-center gap-1.5 text-center">
                            <div className="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center">
                                <Info className="w-3.5 h-3.5 text-purple-600" />
                            </div>
                            <span className="text-[10px] font-semibold text-slate-600">No Hidden Fees</span>
                        </div>
                    </div>

                    <button
                        onClick={() => {
                            onClose();
                            router.push(
                                selectedVariant?.color
                                    ? `/emi/apply/${product.slug}?selectedcolor=${selectedVariant.color}`
                                    : `/emi/apply/${product.slug}`
                            );
                        }}
                        className="w-full mt-4 h-11 bg-[var(--colour-fsP1)] hover:bg-[var(--colour-fsP1)]/90 text-white font-bold text-sm rounded-xl flex items-center justify-center gap-2 transition-all active:scale-[0.98] cursor-pointer shadow-sm"
                    >
                        <CreditCard className="w-4 h-4" />
                        Apply for EMI
                    </button>
                </div>
            </div>
        </div>,
        document.body
    );
};

export default ProductEmiDialog;
