"use client";

import React, { useState } from "react";
import { CheckCircle2, Ticket, Copy } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface Coupon {
    code: string;
    description: string;
    type: "flat" | "percent";
}

const MOCK_COUPONS: Coupon[] = [
    { code: "MASH20", description: "Extra 20% Off", type: "percent" },
    { code: "FATA15", description: "Extra 15% Off", type: "percent" },
];

export default function ProductCoupons() {
    const [copiedCode, setCopiedCode] = useState<string | null>(null);

    const handleCopy = (code: string) => {
        navigator.clipboard.writeText(code);
        setCopiedCode(code);
        toast.success("Coupon copied!");
        setTimeout(() => setCopiedCode(null), 2000);
    };

    return (
        <div>
            {/* Header */}
            <div className="flex items-center gap-1.5 mb-2.5">
                <Ticket className="w-3.5 h-3.5 text-[var(--colour-fsP2)]" />
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Coupons</span>
            </div>

            {/* Coupon list */}
            <div className="flex flex-col gap-2">
                {MOCK_COUPONS.map((coupon, idx) => (
                    <div
                        key={idx}
                        className="flex items-center gap-0 rounded-lg border border-dashed border-[var(--colour-fsP2)]/30 bg-orange-50/40 overflow-hidden"
                    >
                        {/* Description */}
                        <div className="flex-1 px-3 py-2 min-w-0">
                            <p className="text-[13px] font-semibold text-slate-700 leading-tight">{coupon.description}</p>
                            <p className="text-[11px] text-slate-400 mt-0.5">Apply at checkout</p>
                        </div>

                        {/* Divider notch */}
                        <div className="relative self-stretch w-px">
                            <div className="absolute inset-0 border-l border-dashed border-[var(--colour-fsP2)]/25" />
                            <div className="absolute -top-[6px] left-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-white border border-[var(--colour-fsP2)]/20" />
                            <div className="absolute -bottom-[6px] left-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-white border border-[var(--colour-fsP2)]/20" />
                        </div>

                        {/* Code + Copy */}
                        <button
                            onClick={() => handleCopy(coupon.code)}
                            className="flex items-center gap-2 px-3 py-2 shrink-0 cursor-pointer group"
                            aria-label={`Copy coupon ${coupon.code}`}
                        >
                            <span className={cn(
                                "font-mono text-[13px] font-bold tracking-widest",
                                copiedCode === coupon.code ? "text-emerald-600" : "text-[var(--colour-fsP2)]"
                            )}>
                                {coupon.code}
                            </span>
                            {copiedCode === coupon.code ? (
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                            ) : (
                                <Copy className="w-3.5 h-3.5 text-slate-300 group-hover:text-[var(--colour-fsP2)] transition-colors shrink-0" />
                            )}
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
}