"use client";

import React from "react";
import Image from "next/image";
import { PaymentMethodsOptions } from "@/app/CommonVue/Payment";
import { deliveypartnerDetails } from "@/app/CommonVue/deliveypartner";
import { Truck, Building2, Wallet, Globe, CreditCard } from "lucide-react";

export default function PartnersWidget() {
    // Split payment methods
    const nepalPayments = PaymentMethodsOptions.filter(p =>
        ["Connect Ips", "Esewa", "Khalti"].includes(p.name)
    );
    const intlPayments = PaymentMethodsOptions.filter(p =>
        ["Visa", "Mastercard"].includes(p.name)
    );

    return (
        <div className="bg-white rounded border border-blue-100 shadow-premium-sm p-6 space-y-2 relative overflow-hidden">
            {/* Background Decoration */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50/50 rounded-full blur-3xl -z-10 translate-x-12 -translate-y-12"></div>
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-indigo-50/50 rounded-full blur-3xl -z-10 -translate-x-12 translate-y-12"></div>

            {/* Delivery Partners */}
            <div>
                <h3 className="text-xs font-bold text-[var(--colour-fsP2)] uppercase tracking-wider mb-4 flex items-center gap-2">
                    <div className="p-1.5 rounded-full bg-blue-50 text-[var(--colour-fsP2)]">
                        <Truck className="w-3.5 h-3.5" />
                    </div>
                    Delivery Partners
                </h3>
                <div className="flex flex-wrap gap-3">
                    {deliveypartnerDetails.map((p, i) => (
                        <div
                            key={i}
                            className="h-11 pr-4 pl-3 bg-white border border-slate-100 rounded-xl flex items-center justify-center gap-3 shadow-sm hover:border-[var(--colour-fsP2)] hover:shadow-premium-md transition-all duration-300 cursor-default group hover:-translate-y-0.5"
                            title={p.description}
                        >
                            <div className="relative w-8 h-8 rounded bg-slate-50 overflow-hidden shrink-0 group-hover:scale-110 transition-transform duration-300 border border-slate-100">
                                <Image src={p.img} alt={p.name} fill className="object-contain" />
                            </div>
                            <span className="text-xs font-bold text-slate-700 group-hover:text-[var(--colour-fsP2)] transition-colors">{p.name}</span>
                        </div>
                    ))}
                </div>
            </div>

            <div className="h-px bg-gradient-to-r from-transparent via-slate-100 to-transparent"></div>

            {/* Banking Partners */}
            <div>
                <h3 className="text-xs font-bold text-[var(--colour-fsP2)] uppercase tracking-wider mb-4 flex items-center gap-2">
                    <div className="p-1.5 rounded-full bg-blue-50 text-[var(--colour-fsP2)]">
                        <Building2 className="w-3.5 h-3.5" />
                    </div>
                    Banking Partners
                </h3>
                <div className="grid grid-cols-4 sm:grid-cols-5 gap-3">
                    {[
                        "/imgfile/bankingPartners1.png",
                        "/imgfile/bankingPartners2.png",
                        "/imgfile/bankingPartners3.png",
                        "/imgfile/bankingPartners4.png",
                        "/imgfile/bankingPartners5.png",
                        "/imgfile/bankingPartners6.png",
                        "/imgfile/bankingPartners7.png",
                        "/imgfile/bankingPartners17.png"
                    ].map((src, i) => (
                        <div key={i} className="aspect-[3/2] relative bg-white border border-slate-100 rounded-xl shadow-sm overflow-hidden hover:border-[var(--colour-fsP2)] hover:shadow-premium-md hover:-translate-y-1 transition-all duration-300 group">
                            <Image
                                src={src}
                                alt={`Bank Partners ${i + 1}`}
                                fill
                                className="object-contain p-2.5 opacity-90 group-hover:opacity-100 transition-opacity"
                                sizes="64px"
                            />
                        </div>
                    ))}
                </div>
            </div>

            <div className="h-px bg-gradient-to-r from-transparent via-slate-100 to-transparent"></div>

            {/* Payment Options (Split) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                {/* Nepal Payment */}
                <div>
                    <h3 className="text-xs font-bold text-[var(--colour-fsP2)] uppercase tracking-wider mb-4 flex items-center gap-2">
                        <div className="p-1.5 rounded-full bg-blue-50 text-[var(--colour-fsP2)]">
                            <Wallet className="w-3.5 h-3.5" />
                        </div>
                        Nepal Payment
                    </h3>
                    <div className="flex flex-wrap gap-3">
                        {nepalPayments.map((Item, index) => (
                            <div
                                key={index}
                                className="relative w-14 h-10 flex items-center justify-center bg-white rounded-lg border border-slate-100 shadow-sm hover:border-[var(--colour-fsP2)] hover:shadow-premium-md hover:-translate-y-1 transition-all duration-300 cursor-pointer"
                                title={Item.name}
                            >
                                <Image
                                    src={Item.img}
                                    alt={Item.name}
                                    fill
                                    className="object-contain p-1.5"
                                />
                            </div>
                        ))}
                    </div>
                </div>

                {/* International Payment */}
                <div>
                    <h3 className="text-xs font-bold text-[var(--colour-fsP2)] uppercase tracking-wider mb-4 flex items-center gap-2">
                        <div className="p-1.5 rounded-full bg-blue-50 text-[var(--colour-fsP2)]">
                            <Globe className="w-3.5 h-3.5" />
                        </div>
                        Intl. Payment
                    </h3>
                    <div className="flex flex-wrap gap-3">
                        {intlPayments.map((Item, index) => (
                            <div
                                key={index}
                                className="relative w-14 h-10 flex items-center justify-center bg-white rounded-lg border border-slate-100 shadow-sm hover:border-[var(--colour-fsP2)] hover:shadow-premium-md hover:-translate-y-1 transition-all duration-300 cursor-pointer"
                                title={Item.name}
                            >
                                <Image
                                    src={Item.img}
                                    alt={Item.name}
                                    fill
                                    className="object-contain p-1.5"
                                />
                            </div>
                        ))}
                    </div>
                </div>
            </div>

        </div>
    );
}
