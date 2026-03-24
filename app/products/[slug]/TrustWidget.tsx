"use client";

import { ShieldCheck, Truck, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";


export default function TrustWidget() {
    const items = [
        {
            icon: <ShieldCheck className="w-4 h-4 text-emerald-500" />,
            bg: "bg-emerald-50",
            title: "1 Year Warranty",
            desc: "Official Manufacturer Warranty",
        },
        {
            icon: <RotateCcw className="w-4 h-4 text-blue-500" />,
            bg: "bg-blue-50",
            title: "Insurance",
            desc: "1 Year Insurance above Rs.10,000",
        },
        {
            icon: <Truck className="w-4 h-4 text-[var(--colour-fsP1)]" />,
            bg: "bg-orange-50",
            title: "Free Shipping",
            desc: "All over Nepal",
        },
    ];

    return (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Service & Warranty</p>
            <div className="space-y-3">
                {items.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-3">
                        <span className={cn("w-8 h-8 rounded-xl flex items-center justify-center shrink-0", item.bg)}>
                            {item.icon}
                        </span>
                        <div>
                            <p className="text-[12px] font-bold text-slate-700 leading-none">{item.title}</p>
                            <p className="text-[10px] text-slate-400 mt-0.5 leading-tight">{item.desc}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}