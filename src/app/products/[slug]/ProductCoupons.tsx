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
        type: "percent"
    },
    {
        code: "FATA15",
        description: "Extra 15% Off",
        type: "percent"
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
        <div className="space-y-3 py-3 border-t border-dashed border-gray-200">
            <div className="flex items-center gap-2 mb-1">
                <Ticket className="w-4 h-4 text-[var(--colour-fsP2)]" />
                <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wide">Available Coupons</h3>
            </div>

            <div className="flex flex-col gap-2.5">
                {MOCK_COUPONS.map((coupon, idx) => (
                    <div
                        key={idx}
                        className="group relative flex items-center bg-white border border-green-100 rounded-lg shadow-sm overflow-hidden transition-all hover:shadow-md hover:border-green-200"
                    >
                        {/* Left Side: Icon & Description */}
                        <div className="flex-1 flex items-center gap-3 p-3 min-w-0">
                            <div className="w-8 h-8 rounded-full bg-green-50 flex items-center justify-center flex-shrink-0 text-green-600">
                                <Ticket className="w-4 h-4" />
                            </div>
                            <div className="min-w-0">
                                <p className="text-sm font-bold text-slate-800 leading-tight">{coupon.description}</p>
                                <p className="text-[10px] text-gray-400 mt-0.5 font-medium">Use code at checkout</p>
                            </div>
                        </div>

                        {/* Dotted Separator with semi-circles */}
                        <div className="relative w-4 flex flex-col items-center justify-center self-stretch overflow-hidden">
                            <div className="absolute top-[-6px] left-1/2 -translate-x-1/2 w-3 h-3 bg-white border border-green-100 rounded-full z-10 box-border" style={{ borderTopColor: 'transparent', borderLeftColor: 'transparent', borderRightColor: 'transparent' }}></div>
                            <div className="h-full border-l-2 border-dashed border-gray-200"></div>
                            <div className="absolute bottom-[-6px] left-1/2 -translate-x-1/2 w-3 h-3 bg-white border border-green-100 rounded-full z-10 box-border" style={{ borderBottomColor: 'transparent', borderLeftColor: 'transparent', borderRightColor: 'transparent' }}></div>
                        </div>

                        {/* Right Side: Code & Action */}
                        <button
                            onClick={() => handleCopy(coupon.code)}
                            className="flex flex-col items-center justify-center px-4 py-2 bg-green-50/50 hover:bg-green-50 transition-colors self-stretch gap-1 min-w-[80px]"
                        >
                            <span className={cn(
                                "font-mono text-sm font-bold tracking-wider",
                                copiedCode === coupon.code ? "text-green-600" : "text-green-700"
                            )}>
                                {coupon.code}
                            </span>
                            <span className="text-[10px] font-bold text-green-600 uppercase flex items-center gap-1">
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
