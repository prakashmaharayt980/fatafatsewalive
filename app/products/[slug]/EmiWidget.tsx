"use client";

import React, { useState } from "react";
import { ChevronRight, CreditCard, ArrowRightLeft, Wrench, Circle, CheckCircle2, ShoppingCart, HandCoins } from "lucide-react";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";

export default function EmiWidget({ price }: { price: number }) {
    const router = useRouter();

    const emiPlans = [
        { months: 36, rate: Math.round(price / 36), label: "Super Saver" },
        { months: 24, rate: Math.round(price / 24), label: "Extended" },
        { months: 18, rate: Math.round(price / 18), label: "Popular" },
        { months: 12, rate: Math.round(price / 12), label: "Standard" },
    ];

    return (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 space-y-3">
            {/* Exchange */}
            <div className="rounded-xl border border-gray-100 p-3 group hover:border-[var(--colour-fsP2)]/40 transition-colors">
                <div className="flex items-center gap-2 mb-2.5">
                    <ArrowRightLeft className="w-3.5 h-3.5 text-[var(--colour-fsP2)]" />
                    <span className="text-xs font-bold text-slate-700">Exchange Product</span>
                </div>
                <button
                    onClick={() => router.push("/ExchangeProducts")}
                    className="w-full h-8 text-[11px] font-bold text-[var(--colour-fsP2)] bg-[var(--colour-fsP2)]/5 hover:bg-[var(--colour-fsP2)] hover:text-white border border-[var(--colour-fsP2)]/20 rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                    <ArrowRightLeft className="w-3 h-3" />
                    Choose Product to Exchange
                </button>
                <div className="flex items-center gap-1.5 mt-2">
                    <HandCoins className="w-3.5 h-3.5 text-[var(--colour-fsP2)]" />
                    <span className="text-[10px] font-semibold text-slate-500">Estimated exchange amount applied at checkout</span>
                </div>
            </div>

            <div className="h-px bg-gray-50" />

            {/* EMI Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-[var(--colour-fsP2)]/10 flex items-center justify-center text-[var(--colour-fsP2)]">
                        <CreditCard className="w-3.5 h-3.5" />
                    </div>
                    <div>
                        <p className="text-xs font-bold text-slate-800 leading-none">No Cost EMI</p>
                        <p className="text-[10px] text-slate-400 mt-0.5">Zero downpayment</p>
                    </div>
                </div>
                <span className="text-[10px] font-bold text-white bg-[var(--colour-fsP2)] px-2 py-0.5 rounded-full">
                    0% Interest
                </span>
            </div>

            <div className="h-px bg-gray-50" />

            {/* Plans */}
            <div className="space-y-1.5">
                {emiPlans.map((plan, idx) => (
                    <div
                        key={idx}
                        className="group flex items-center justify-between px-3 py-2 rounded-lg border border-gray-100 hover:border-[var(--colour-fsP2)]/30 hover:bg-orange-50/30 transition-all cursor-pointer"
                    >
                        <div className="flex items-center gap-2.5">
                            <span className="w-8 h-8 rounded-lg bg-gray-50 border border-gray-100 flex items-center justify-center text-xs font-bold text-[var(--colour-fsP2)] group-hover:bg-[var(--colour-fsP2)]/10 transition-colors">
                                {plan.months}
                            </span>
                            <div>
                                <p className="text-[11px] font-bold text-slate-700 leading-none">months</p>
                                <p className="text-[10px] text-slate-400 mt-0.5">{plan.label}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="text-right">
                                <p className="text-[10px] text-slate-400 leading-none">/ month</p>
                                <p className="text-sm font-extrabold text-slate-800 group-hover:text-[var(--colour-fsP2)] transition-colors leading-tight">
                                    Rs.{plan.rate.toLocaleString()}
                                </p>
                            </div>
                            <ChevronRight className="w-3.5 h-3.5 text-gray-300 group-hover:text-[var(--colour-fsP2)] transition-colors" />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}