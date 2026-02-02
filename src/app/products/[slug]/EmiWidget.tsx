"use client";

import React from "react";
import { Calculator, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export default function EmiWidget({ price }: { price: number }) {
    const emiPlans = [
        { months: 18, rate: "Rs. " + Math.round(price / 18).toLocaleString() },
        { months: 12, rate: "Rs. " + Math.round(price / 12).toLocaleString() },
        { months: 6, rate: "Rs. " + Math.round(price / 6).toLocaleString() },
    ];

    return (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
            <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-full bg-[var(--colour-fsP1)]/10 flex items-center justify-center text-[var(--colour-fsP1)]">
                    <Calculator className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-bold text-slate-800">EMI Plans</h3>
            </div>

            <div className="space-y-2">
                {emiPlans.map((plan, idx) => (
                    <div key={idx} className="flex items-center justify-between p-2.5 rounded-lg bg-gray-50 border border-gray-100">
                        <span className="text-xs font-semibold text-slate-600">{plan.months} Months</span>
                        <span className="text-sm font-bold text-[var(--colour-fsP2)]">{plan.rate}<span className="text-[10px] text-gray-400 font-medium">/mo</span></span>
                    </div>
                ))}
            </div>


        </div>
    );
}
