"use client";

import React from "react";
import Image from "next/image";
import { PaymentMethodsOptions } from "@/app/CommonVue/Payment";
import { deliveypartnerDetails } from "@/app/CommonVue/deliveypartner";
import { Truck, Building2, Wallet, Globe, CreditCard } from "lucide-react";


import { allPartners } from "@/app/CommonVue/Partners";

function SectionLabel({ icon, label }: { icon: React.ReactNode; label: string }) {
    return (
        <div className="flex items-center gap-1.5 mb-2.5">
            <span className="text-[var(--colour-fsP2)]">{icon}</span>
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{label}</span>
        </div>
    );
}

export default function PartnersWidget() {
    const nepalPayments = PaymentMethodsOptions.filter((p) =>
        ["Connect Ips", "Esewa", "Khalti"].includes(p.name)
    );
    const intlPayments = PaymentMethodsOptions.filter((p) =>
        ["Visa", "Mastercard"].includes(p.name)
    );

    const bankLogos = Object.values(allPartners.banks).slice(0, 8);

    return (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 space-y-4">
            {/* Delivery */}
            <div>
                <SectionLabel icon={<Truck className="w-3.5 h-3.5" />} label="Delivery Partners" />
                <div className="grid grid-cols-4 gap-2">
                    {deliveypartnerDetails.map((p, i) => (
                        <div
                            key={i}
                            title={p.description}
                            className="aspect-[3/2] relative bg-gray-50 border border-gray-100 rounded-xl overflow-hidden hover:border-[var(--colour-fsP2)]/30 transition-colors"
                        >
                            <Image
                                src={p.img} alt={p.name}
                                fill
                                className="object-contain p-2"
                                sizes="64px"

                            />

                        </div>



                    ))}
                </div>
            </div>

            <div className="h-px bg-gray-50" />

            {/* Banking */}
            <div>
                <SectionLabel icon={<Building2 className="w-3.5 h-3.5" />} label="Banking Partners" />
                <div className="grid grid-cols-4 gap-2">
                    {bankLogos.map((src, i) => (
                        <div
                            key={i}
                            className="aspect-[3/2] relative bg-gray-50 border border-gray-100 rounded-xl overflow-hidden hover:border-[var(--colour-fsP2)]/30 transition-colors"
                        >
                            <Image
                                src={src}
                                alt={`Bank ${i + 1}`}
                                fill
                                className="object-contain p-2"
                                sizes="64px"
                            />
                        </div>
                    ))}
                </div>
            </div>

            <div className="h-px bg-gray-50" />

            {/* Payment */}
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <SectionLabel icon={<Wallet className="w-3.5 h-3.5" />} label="Nepal Payment" />
                    <div className="flex flex-wrap gap-1.5">
                        {nepalPayments.map((item, i) => (
                            <div
                                key={i}
                                title={item.name}
                                className="relative w-12 h-8 bg-gray-50 border border-gray-100 rounded-lg overflow-hidden hover:border-[var(--colour-fsP2)]/30 transition-colors"
                            >
                                <Image src={item.img} alt={item.name} fill sizes="48px" className="object-contain p-1.5" />
                            </div>
                        ))}
                    </div>
                </div>
                <div>
                    <SectionLabel icon={<Globe className="w-3.5 h-3.5" />} label="Intl. Payment" />
                    <div className="flex flex-wrap gap-1.5">
                        {intlPayments.map((item, i) => (
                            <div
                                key={i}
                                title={item.name}
                                className="relative w-12 h-8 bg-gray-50 border border-gray-100 rounded-lg overflow-hidden hover:border-[var(--colour-fsP2)]/30 transition-colors"
                            >
                                <Image src={item.img} alt={item.name} fill sizes="48px" className="object-contain p-1.5" />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}