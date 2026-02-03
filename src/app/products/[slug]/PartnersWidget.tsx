"use client";

import React from "react";
import Image from "next/image";
import { PaymentMethodsOptions } from "@/app/CommonVue/Payment";
import { deliveypartnerDetails } from "@/app/CommonVue/deliveypartner";

export default function PartnersWidget() {
    // Split payment methods
    const nepalPayments = PaymentMethodsOptions.filter(p =>
        ["Connect Ips", "Esewa", "Khalti"].includes(p.name)
    );
    const intlPayments = PaymentMethodsOptions.filter(p =>
        ["Visa", "Mastercard"].includes(p.name)
    );

    return (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-6">

            {/* Delivery Partners */}
            <div>
                <h3 className="text-[11px] font-bold text-[var(--colour-fsP1)] uppercase tracking-wider mb-3 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[var(--colour-fsP1)]"></span>
                    Delivery Partners
                </h3>
                <div className="flex flex-wrap gap-3">
                    {deliveypartnerDetails.map((p, i) => (
                        <div
                            key={i}
                            className="h-10 pr-3 pl-2 bg-white border border-gray-100 rounded-lg flex items-center justify-center gap-2 shadow-sm hover:border-[var(--colour-fsP1)] hover:shadow-md transition-all cursor-default group"
                            title={p.description}
                        >
                            <div className="relative w-7 h-7 rounded-full bg-gray-50 overflow-hidden shrink-0 group-hover:scale-110 transition-transform">
                                <Image src={p.img} alt={p.name} fill className="object-cover" />
                            </div>
                            <span className="text-xs font-bold text-slate-700 leading-none group-hover:text-[var(--colour-fsP1)] transition-colors">{p.name}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Banking Partners */}
            <div>
                <h3 className="text-[11px] font-bold text-amber-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
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
                        <div key={i} className="aspect-[3/2] relative bg-white border border-gray-100 rounded-lg shadow-sm overflow-hidden hover:border-amber-500/50 hover:shadow-md hover:scale-105 transition-all duration-300">
                            <Image
                                src={src}
                                alt={`Bank Partners ${i + 1}`}
                                fill
                                className="object-contain p-2"
                                sizes="64px"
                            />
                        </div>
                    ))}
                </div>
            </div>

            {/* Payment Options (Split) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {/* Nepal Payment */}
                <div>
                    <h3 className="text-[11px] font-bold text-[var(--colour-fsP1)] uppercase tracking-wider mb-3 flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-[var(--colour-fsP1)]"></span>
                        Nepal Payment
                    </h3>
                    <div className="flex flex-wrap gap-2.5">
                        {nepalPayments.map((Item, index) => (
                            <div
                                key={index}
                                className="relative w-12 h-9 flex items-center justify-center bg-white rounded-md border border-gray-100 shadow-sm hover:border-[var(--colour-fsP1)] hover:shadow-md hover:scale-105 transition-all cursor-pointer"
                                title={Item.name}
                            >
                                <Image
                                    src={Item.img}
                                    alt={Item.name}
                                    fill
                                    className="object-contain p-1"
                                />
                            </div>
                        ))}
                    </div>
                </div>

                {/* International Payment */}
                <div>
                    <h3 className="text-[11px] font-bold text-amber-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                        Intl. Payment
                    </h3>
                    <div className="flex flex-wrap gap-2.5">
                        {intlPayments.map((Item, index) => (
                            <div
                                key={index}
                                className="relative w-12 h-9 flex items-center justify-center bg-white rounded-md border border-gray-100 shadow-sm hover:border-amber-500 hover:shadow-md hover:scale-105 transition-all cursor-pointer"
                                title={Item.name}
                            >
                                <Image
                                    src={Item.img}
                                    alt={Item.name}
                                    fill
                                    className="object-contain p-1"
                                />
                            </div>
                        ))}
                    </div>
                </div>
            </div>

        </div>
    );
}
