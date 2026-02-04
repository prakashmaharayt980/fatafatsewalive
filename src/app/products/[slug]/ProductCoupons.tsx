"use client";

import React, { useState } from "react";
import { CheckCircle2, Ticket, Copy } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";


interface Coupon {
    code: string;
    description: string;
    discount_amount?: string;
    type: "flat" | "percent";

}

const MOCK_COUPONS: Coupon[] = [
    {
        code: "MASH20",
        description: "Extra 20% Off",
        type: "percent",

    },
    {
        code: "FATA15",
        description: "Extra 15% Off",
        type: "percent",

    }
];

export default function ProductCoupons() {
    const [copiedCode, setCopiedCode] = useState<string | null>(null);

    const handleCopy = (code: string) => {
        navigator.clipboard.writeText(code);
        setCopiedCode(code);
        toast.success("Coupon code copied!");
        setTimeout(() => setCopiedCode(null), 2000);
    };

    return (
        <div className="space-y-4 py-4">
            <div className="flex items-center gap-2 mb-2">
                <div className="p-1.5 rounded-md bg-[var(--colour-fsP2)]/10 text-[var(--colour-fsP2)]">
                    <Ticket className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide">Available Coupons</h3>
            </div>

            <div className="grid gap-3 grid-cols-1 sm:grid-cols-2">
                {MOCK_COUPONS.map((coupon, idx) => (
                    <div
                        key={idx}
                        className="group relative flex items-center bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden transition-all duration-300 hover:shadow-md hover:border-[var(--colour-fsP2)] hover:-translate-y-0.5"
                    >
                        {/* Left Side: Icon & Description */}
                        <div className="flex-1 flex items-center gap-3 p-3.5 min-w-0">
                            <div className="w-10 h-10 rounded-full bg-[var(--btnbg)]/30 flex items-center justify-center flex-shrink-0 text-[var(--colour-fsP2)]">
                                <Ticket className="w-5 h-5" />
                            </div>
                            <div className="min-w-0">
                                <p className="text-sm font-bold text-slate-800 leading-tight group-hover:text-[var(--colour-fsP2)] transition-colors">
                                    {coupon.description}
                                </p>
                                <p className="text-[11px] text-gray-500 mt-0.5 font-medium">Use code at checkout</p>
                            </div>
                        </div>

                        {/* Dashed Divider */}
                        <div className="relative w-4 flex flex-col items-center justify-center self-stretch overflow-hidden">
                            <div className="absolute top-[-6px] left-1/2 -translate-x-1/2 w-3 h-3 bg-white border border-slate-200 rounded-full z-10 box-border border-b-transparent border-l-transparent border-r-transparent shadow-[inset_0_1px_2px_rgba(0,0,0,0.05)]"></div>
                            <div className="h-full border-l-2 border-dashed border-gray-200 group-hover:border-[var(--colour-fsP2)]/30 transition-colors"></div>
                            <div className="absolute bottom-[-6px] left-1/2 -translate-x-1/2 w-3 h-3 bg-white border border-slate-200 rounded-full z-10 box-border border-t-transparent border-l-transparent border-r-transparent shadow-[inset_0_-1px_2px_rgba(0,0,0,0.05)]"></div>
                        </div>

                        {/* Right Side: Code & Action */}
                        <button
                            onClick={() => handleCopy(coupon.code)}
                            className="flex flex-col items-center justify-center px-5 py-3 bg-slate-50 hover:bg-[var(--btnbg)]/20 transition-colors self-stretch gap-1 min-w-[90px] border-l border-dashed border-gray-100"
                        >
                            <span className={cn(
                                "font-mono text-sm font-bold tracking-wider",
                                copiedCode === coupon.code ? "text-green-600" : "text-[var(--colour-fsP2)]"
                            )}>
                                {coupon.code}
                            </span>
                            <span className={cn(
                                "text-[10px] font-bold uppercase flex items-center gap-1 transition-colors",
                                copiedCode === coupon.code ? "text-green-600" : "text-gray-400 group-hover:text-[var(--colour-fsP2)]"
                            )}>
                                {copiedCode === coupon.code ? (
                                    <>Copied <CheckCircle2 className="w-3 h-3" /></>
                                ) : (
                                    <>Copy <Copy className="w-3 h-3" /></>
                                )}
                            </span>
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
}
