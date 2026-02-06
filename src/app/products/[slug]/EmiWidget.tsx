"use client";

import React, { useState } from "react";
import { ChevronRight, CreditCard, ArrowRightLeft, Wrench, Circle, CheckCircle2, ShoppingCart, HandCoins } from "lucide-react";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";

export default function EmiWidget({ price }: { price: number }) {
    const router = useRouter();

    const handleroute = (route: string) => {
        router.push(route);
    }
    const emiPlans = [
        { months: 36, rate: Math.round(price / 36), label: "Super Saver", color: "text-blue-600", bg: "bg-blue-50/50" },
        { months: 24, rate: Math.round(price / 24), label: "Extended", color: "text-indigo-600", bg: "bg-indigo-50/50" },
        { months: 18, rate: Math.round(price / 18), label: "Popular", color: "text-[var(--colour-fsP2)]", bg: "bg-blue-50/30" },
        { months: 12, rate: Math.round(price / 12), label: "Standard", color: "text-cyan-600", bg: "bg-cyan-50/50" },
    ];

    return (
        <div className="bg-white rounded border border-blue-100 shadow-premium-sm p-4 space-y-4 relative overflow-hidden group/widget hover:shadow-premium-md transition-all duration-300">
            {/* Header */}

            <div className="space-y-3">
                {/* Exchange Option */}
                <div
                    // onClick={() => setSelectedOption("exchange")}
                    className={cn(
                        "rounded-xl border p-3 cursor-pointer transition-all duration-200 relative overflow-hidden group/exchange",
                        "border-slate-200 hover:border-[var(--colour-fsP2)] hover:bg-slate-50"
                    )}
                >
                    <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-4">
                            <ShoppingCart className="w-4 h-4 text-slate-300" />
                            <span className="text-xs font-bold text-slate-800 group-hover/exchange:text-[var(--colour-fsP2)] transition-colors">Exchange Product</span>
                        </div>

                    </div>

                    {/* Collapsible Content - simplified for static, could be dynamic */}
                    <div className="pl-6 flex items-start gap-4 flex-col">
                        <button onClick={() => handleroute("/ExchangeProducts")} className="w-full text-xs font-bold text-[var(--colour-fsP2)] bg-white border border-[var(--colour-fsP2)]/20 hover:bg-[var(--colour-fsP2)] hover:text-white py-1.5 rounded-lg transition-all shadow-sm flex items-center justify-center gap-2">
                            <ArrowRightLeft className="w-3 h-3" />
                            Choose Product to Exchange
                        </button>
                        <div className="flex items-start gap-2">
                            <HandCoins className="w-4 h-4 text-[var(--colour-fsP2)]" />
                            <span className="text-[10px] font-bold text-black bg-[var(--colour-fsP2)]/20 px-1.5 py-0.5 rounded-md">Estimated Amount of Exchange</span>
                        </div>
                    </div>
                </div>

            </div>

            <div className="h-px bg-slate-100 w-full" />
            <div className="flex items-center justify-between pb-1">
                <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-[var(--colour-fsP2)]/10 flex items-center justify-center text-[var(--colour-fsP2)] shadow-sm">
                        <CreditCard className="w-4 h-4" />
                    </div>
                    <div>
                        <h3 className="text-sm font-bold text-slate-900 leading-tight">No Cost EMI</h3>
                        <p className="text-[10px] text-slate-500 font-semibold">Zero downpayment available</p>
                    </div>
                </div>
                <div className="text-[10px] font-bold text-white bg-[var(--colour-fsP2)] px-2 py-0.5 rounded-full shadow-sm">
                    0% Interest
                </div>
            </div>

            <div className="h-px bg-slate-100 w-full" />
            {/* Amazon-style Radio Selection Cards for Exchange/Repair */}



            {/* Plans Breakdown */}
            <div className="grid gap-4">
                {emiPlans.map((plan, idx) => (
                    <div
                        key={idx}
                        className="group relative flex items-center gap-2 justify-between p-2 rounded-lg border border-slate-100 bg-slate-50/30 hover:bg-white hover:border-[var(--colour-fsP2)]/30 hover:shadow-sm transition-all duration-200 cursor-pointer overflow-hidden"
                    >
                        {/* Hover Highlight Bar */}
                        <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-[var(--colour-fsP2)] opacity-0 group-hover:opacity-100 transition-opacity" />

                        {/* Tenure Section */}
                        <div className="flex items-center gap-2.5 pl-1.5">
                            <div className={cn("w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-colors", plan.bg, plan.color)}>
                                {plan.months}
                            </div>
                            <div className="flex flex-col">
                                <span className="text-xs font-bold text-slate-700 leading-none">Months</span>
                                <span className="text-[9px] font-semibold text-slate-400 leading-none mt-0.5">{plan.label}</span>
                            </div>
                        </div>

                        {/* Divider */}
                        <div className="h-5 w-px bg-slate-200/60 mx-1" />

                        {/* EMI Amount Section */}
                        <div className="flex items-center gap-3 flex-1 justify-between">
                            <div className="flex flex-col">
                                <span className="text-[9px] text-slate-400 font-semibold leading-none">Monthly Pay</span>
                                <div className="flex items-baseline gap-0.5 mt-0.5">
                                    <span className="text-[10px] font-bold text-slate-500">Rs.</span>
                                    <span className="text-sm font-extrabold text-slate-900 group-hover:text-[var(--colour-fsP2)] transition-colors leading-none">
                                        {plan.rate.toLocaleString()}
                                    </span>
                                </div>
                            </div>

                            <div className="w-5 h-5 rounded-full bg-white border border-slate-100 flex items-center justify-center text-slate-300 group-hover:bg-[var(--colour-fsP2)] group-hover:border-[var(--colour-fsP2)] group-hover:text-white transition-all shadow-sm">
                                <ChevronRight className="w-3 h-3" />
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="h-px bg-slate-100 w-full" />


        </div>
    );
}
