"use client";

import React from "react";
import { ShieldCheck, Truck, RotateCcw } from "lucide-react";

export default function TrustWidget() {
    const items = [
        {
            icon: <ShieldCheck className="w-5 h-5 text-emerald-500" />,
            title: "1 Year Warranty",
            desc: "Official Manufacturer Warranty"
        },
        {
            icon: <RotateCcw className="w-5 h-5 text-blue-500" />,
            title: "7 Days Replacement",
            desc: "If manufacturing defect found"
        },
        {
            icon: <Truck className="w-5 h-5 text-[var(--colour-fsP1)]" />,
            title: "Free Shipping",
            desc: "All over Nepal"
        }
    ];

    return (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
            <h3 className="text-sm font-bold text-slate-800 mb-3 px-1">Service & Warranty</h3>
            <div className="space-y-4">
                {items.map((item, idx) => (
                    <div key={idx} className="flex gap-3">
                        <div className="mt-0.5 flex-shrink-0">{item.icon}</div>
                        <div>
                            <p className="text-xs font-bold text-slate-700">{item.title}</p>
                            <p className="text-[10px] text-gray-500 leading-tight">{item.desc}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
