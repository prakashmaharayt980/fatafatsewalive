"use client";

import React from "react";
import Image from "next/image";

// import nepalcanmove from "./deliveryCompany/nepalcan-move.png";
import { PaymentMethodsOptions } from "@/app/CommonVue/Payment";
import { deliveypartnerDetails } from "@/app/CommonVue/deliveypartner";

export default function PartnersWidget() {




    return (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 space-y-5">

            {/* Delivery Partners */}
            <div>
                <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2.5">Delivery Partners</h3>
                <div className="flex flex-wrap gap-2.5">
                    {deliveypartnerDetails.map((p, i) => (
                        <div
                            key={i}
                            className="h-9 pr-3 pl-1.5 bg-white border border-gray-100 rounded-lg flex items-center justify-center gap-2 shadow-sm hover:border-[var(--colour-fsP1)]/30 hover:shadow-md transition-all cursor-default"
                            title={p.description}
                        >
                            <div className="relative w-6 h-6 rounded-full bg-gray-50 overflow-hidden shrink-0">
                                <Image src={p.img} alt={p.name} fill className="object-cover" />
                            </div>
                            <span className="text-[10px] sm:text-xs font-bold text-slate-700 leading-none">{p.name}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Banking Partners */}
            <div>
                <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2.5">Banking Partners</h3>
                <div className="grid grid-cols-4 gap-2.5">
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
                        <div key={i} className="aspect-[3/2] relative bg-white border border-gray-100 rounded-lg shadow-sm overflow-hidden hover:border-[var(--colour-fsP1)]/30 hover:shadow-md hover:scale-105 transition-all duration-300">
                            <Image
                                src={src}
                                alt={`Bank Partners ${i + 1}`}
                                fill
                                className="object-contain p-1.5"
                                sizes="64px"
                            />
                        </div>
                    ))}
                </div>
            </div>

            {/* Payment Partners */}
            <div>
                <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2.5">Payment Partners</h3>
                <div className="grid grid-cols-4 gap-2.5">
                    {PaymentMethodsOptions.map((Item, index) => (
                        <div
                            key={index}
                            className="
                                       relative
                                       aspect-[3/2]
                                       flex items-center justify-center
                                       bg-white
                                       rounded-lg
                                       border border-gray-100
                                       shadow-sm
                                       grayscale opacity-80
                                       hover:grayscale-0 hover:opacity-100 hover:scale-105 hover:border-[var(--colour-fsP1)]/30 hover:shadow-md
                                       transition-all duration-300
                                       cursor-pointer
                                     "
                            title={Item.name}
                        >
                            <Image
                                src={Item.img}
                                alt={Item.name || "Payment Method"}
                                fill
                                className="object-contain p-1.5"
                            />
                        </div>
                    ))}
                </div>
            </div>

        </div>
    );
}
