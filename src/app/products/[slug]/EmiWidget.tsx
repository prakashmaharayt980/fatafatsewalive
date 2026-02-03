"use client";

import React from "react";
import { Calculator, ChevronRight, Calendar, Wallet, Zap, CreditCard } from "lucide-react";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function EmiWidget({ price }: { price: number }) {
    const emiPlans = [
        { months: 36, rate: Math.round(price / 36), label: "Super Saver", color: "text-blue-600", bg: "bg-blue-50" },
        { months: 24, rate: Math.round(price / 24), label: "Extended", color: "text-indigo-600", bg: "bg-indigo-50" },
        { months: 18, rate: Math.round(price / 18), label: "Popular", color: "text-emerald-600", bg: "bg-emerald-50" },
        { months: 12, rate: Math.round(price / 12), label: "Standard", color: "text-amber-600", bg: "bg-amber-50" },
    ];

    const bankImages = [
        "/imgfile/bankingPartners1.png",
        "/imgfile/bankingPartners2.png",
        "/imgfile/bankingPartners3.png",
        "/imgfile/bankingPartners4.png",
        "/imgfile/bankingPartners5.png",
        "/imgfile/bankingPartners6.png",
    ];



    return (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-4 hover:shadow-md transition-shadow duration-300">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[var(--colour-fsP2)]/10 flex items-center justify-center text-[var(--colour-fsP2)] shadow-sm">
                        <CreditCard className="w-5 h-5" />
                    </div>
                    <div>
                        <h3 className="text-sm font-bold text-slate-900 leading-tight">No Cost EMI</h3>
                        <p className="text-[10px] text-slate-500 font-medium">Pay in easy installments</p>
                    </div>
                </div>
                <div className="text-[10px] font-bold text-[var(--colour-fsP2)] bg-[var(--colour-fsP2)]/5 px-2 py-1 rounded-full border border-[var(--colour-fsP2)]/10">
                    0% Interest
                </div>
            </div>

            {/* Plans Breakdown */}
            <div className="grid gap-2.5">
                {emiPlans.map((plan, idx) => (
                    <div
                        key={idx}
                        className="group relative flex items-center justify-between p-3 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-white hover:border-[var(--colour-fsP2)]/30 hover:shadow-sm transition-all duration-200 cursor-pointer overflow-hidden"
                    >
                        {/* Hover Highlight Bar */}
                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-[var(--colour-fsP2)] opacity-0 group-hover:opacity-100 transition-opacity" />

                        {/* Tenure Section */}
                        <div className="flex items-center gap-3 pl-2">
                            <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold transition-colors", plan.bg, plan.color)}>
                                {plan.months}
                            </div>
                            <div className="flex flex-col">
                                <span className="text-xs font-bold text-slate-700">Months</span>
                                <span className="text-[10px] font-medium text-slate-400">{plan.label}</span>
                            </div>
                        </div>

                        {/* Divider */}
                        <div className="h-6 w-px bg-slate-200/60 mx-2" />

                        {/* EMI Amount Section */}
                        <div className="flex items-center gap-3 flex-1 justify-between">
                            <div className="flex flex-col">
                                <span className="text-[10px] text-slate-400 font-medium">Monthly Pay</span>
                                <div className="flex items-baseline gap-0.5">
                                    <span className="text-xs font-bold text-slate-500">Rs.</span>
                                    <span className="text-sm font-extrabold text-slate-900 group-hover:text-[var(--colour-fsP2)] transition-colors">
                                        {plan.rate.toLocaleString()}
                                    </span>
                                </div>
                            </div>

                            <div className="w-6 h-6 rounded-full bg-white border border-slate-100 flex items-center justify-center text-slate-300 group-hover:bg-[var(--colour-fsP2)] group-hover:border-[var(--colour-fsP2)] group-hover:text-white transition-all shadow-sm">
                                <ChevronRight className="w-3.5 h-3.5" />
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Footer / Banks Hint */}
            <div className="pt-3 border-t border-dashed border-gray-100 flex items-center justify-between">
                <div className="flex -space-x-2 overflow-hidden py-0.5 pl-1">
                    {bankImages.map((src, i) => (
                        <Avatar key={i} className="inline-block h-8 w-8 rounded-full border-2 border-[var(--colour-fsP2)] bg-white shadow-sm ring-1 ring-slate-100">
                            <AvatarImage src={src} alt="Bank" className="object-cover " />
                            <AvatarFallback className="text-[8px] bg-slate-50">B</AvatarFallback>
                        </Avatar>
                    ))}
                    <div className="h-8 w-8 rounded-full border-2 border-[var(--colour-fsP2)] bg-slate-50 flex items-center justify-center text-[9px] font-bold text-[var(--colour-fsP2)] ring-1 ring-slate-200 z-10 relative shadow-sm">+4</div>
                </div>
                <span className="text-[12px] font-medium text-slate-400">Available on major banks</span>
            </div>
        </div>
    );
}
