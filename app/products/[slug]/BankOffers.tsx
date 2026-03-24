"use client";

import React from "react";
import { BadgePercent, Banknote } from "lucide-react";

export default function BankOffers() {
    const offers = [
        {
            bank: "Nabil Bank",
            offer: "Get 10% off up to Rs. 1000 on Debit Credit Card",
            code: "NABIL10"
        },
        {
            bank: "Global IME",
            offer: "Flat Rs. 500 off on EMI transactions",
            code: "GLOBALEMI"
        }
    ];

    return (
        <div className="space-y-2 mt-3 pt-3 border-t border-gray-100">
            <div className="flex items-center gap-2 mb-1">
                <BadgePercent className="w-4 h-4 text-purple-600" />
                <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wide">Bank Offers</h3>
            </div>

            <div className="space-y-2">
                {offers.map((offer, idx) => (
                    <div key={idx} className="flex items-start gap-2.5 p-2 bg-purple-50/50 rounded-lg border border-purple-100">
                        <div className="mt-0.5">
                            <Banknote className="w-3.5 h-3.5 text-purple-600" />
                        </div>
                        <div>
                            <p className="text-[11px] sm:text-xs font-medium text-slate-700 leading-snug">
                                <span className="font-bold text-purple-900">{offer.bank}:</span> {offer.offer}
                            </p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
