"use client";

import React from "react";
import Image from "next/image";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import {
    CalendarClock,
    BadgePercent,
    ShieldCheck,
    Truck,
    Banknote,
    CheckCircle2,
    ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

interface PreOrderDialogProps {
    isOpen: boolean;
    onClose: () => void;
    productName?: string;
    productImage?: string;
    productSlug?: string;
    selectedColor?: string;
}

const PRE_ORDER_PERKS = [
    {
        icon: BadgePercent,
        title: "Be the First to Know",
        description:
            "Get instant notifications the moment pre-order bookings open and the official price is announced.",
        color: "text-emerald-500",
        bg: "bg-emerald-50",
    },
    {
        icon: CalendarClock,
        title: "Guaranteed Allocation",
        description:
            "Early subscribers get priority queuing for stock dispatch once the product arrives.",
        color: "text-blue-500",
        bg: "bg-blue-50",
    },
    {
        icon: ShieldCheck,
        title: "No Commitment Required",
        description:
            "Stay informed without any upfront payment. You only pay when you decide to book after launch.",
        color: "text-purple-500",
        bg: "bg-purple-50",
    },
    {
        icon: Truck,
        title: "Early Bird Benefits",
        description:
            "Special launch-day offers and accessories might be included for our early subscribers.",
        color: "text-orange-500",
        bg: "bg-orange-50",
    },
];

const PreOrderDialog: React.FC<PreOrderDialogProps> = ({
    isOpen,
    onClose,
    productName,
    productImage,
    productSlug,
    selectedColor,
}) => {
    const router = useRouter();

    const handleProceed = () => {
        onClose();
        if (productSlug) {
            const url = selectedColor
                ? `/checkout/preOrders/${productSlug}?selectedcolor=${selectedColor}`
                : `/checkout/preOrders/${productSlug}`;
            router.push(url);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="w-[95vw] max-w-md sm:max-w-4xl bg-white p-0 overflow-y-auto overflow-x-hidden md:overflow-hidden gap-0 border-none rounded-xl md:rounded-2xl max-h-[90vh] md:max-h-none [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                <div className="grid grid-cols-1 md:grid-cols-5 h-full md:min-h-[500px]">
                    {/* LEFT PANEL: Product Preview */}
                    <div className="md:col-span-2 bg-slate-50 p-8 flex flex-col items-center justify-center text-center border-r border-slate-100 relative">
                        <div className="w-40 h-40 sm:w-48 sm:h-48 bg-white rounded-2xl shadow-sm border border-slate-200 flex items-center justify-center p-3 mb-6 relative overflow-hidden group">
                            {productImage ? (
                                <Image
                                    src={productImage}
                                    alt={productName || "Product"}
                                    fill
                                    sizes="(max-width: 768px) 160px, 200px"
                                    className="object-contain p-2 group-hover:scale-105 transition-transform duration-500"
                                />
                            ) : (
                                <CalendarClock className="w-12 h-12 text-slate-300" />
                            )}
                        </div>
                        <h3 className="font-bold text-slate-900 text-base leading-tight mb-2 line-clamp-3">
                            {productName}
                        </h3>

                        {selectedColor && (
                            <p className="text-xs font-bold text-[var(--colour-fsP2)] bg-blue-50 px-2 py-0.5 rounded-md mb-3 border border-blue-100/50 uppercase tracking-wider">
                                Color: {selectedColor}
                            </p>
                        )}

                        <div className="flex flex-wrap items-center justify-center gap-2 mt-1">
                            <div className="bg-amber-50 text-amber-700 text-[10px] font-bold px-3 py-1.5 rounded-full border border-amber-100 flex items-center gap-1.5 shadow-sm">
                                <CalendarClock className="w-3.5 h-3.5" />
                                COMING SOON
                            </div>
                        </div>

                        <div className="mt-auto w-full p-4 sm:p-6 border-t border-slate-100 space-y-4">
                            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-center">
                                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Deposit Amount</p>
                                <p className="text-2xl font-black text-slate-900">Rs. 5,000</p>
                            </div>

                            <Button
                                onClick={handleProceed}
                                className="w-full py-6 rounded-xl bg-[var(--colour-fsP2)] hover:bg-[var(--colour-fsP1)] text-white font-bold text-sm transition-all shadow-md group/btn"
                            >
                                Apply for Pre-Order
                                <ChevronRight className="w-4 h-4 ml-2 group-hover/btn:translate-x-1 transition-transform" />
                            </Button>
                        </div>
                    </div>

                    <div className="md:col-span-3 flex flex-col h-full max-h-[95vh] bg-white">
                        <div className="p-8 pb-4 shrink-0">
                            <DialogHeader className="text-left">
                                <div className="flex items-center gap-2 mb-2">
                                    <CalendarClock className="w-5 h-5 text-amber-600" />
                                    <span className="text-xs font-bold text-amber-600 uppercase tracking-wider">
                                        Coming Soon
                                    </span>
                                </div>
                                <DialogTitle className="text-2xl font-bold text-slate-900 leading-snug">
                                    Upcoming Launch
                                </DialogTitle>
                                <DialogDescription className="text-slate-500 text-base mt-2">
                                    This product is launching soon. Pre-order bookings will be available as soon as the price is officially announced.
                                </DialogDescription>
                            </DialogHeader>
                        </div>

                        <div className="px-8 py-4 overflow-y-auto flex-1 custom-scrollbar">
                            <div className="space-y-4">
                                {PRE_ORDER_PERKS.map((perk) => {
                                    const Icon = perk.icon;
                                    return (
                                        <div key={perk.title} className="flex items-start gap-3">
                                            <div className={`shrink-0 w-8 h-8 rounded-lg flex items-center justify-center ${perk.bg}`}>
                                                <Icon className={`w-4 h-4 ${perk.color}`} />
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-slate-800">{perk.title}</p>
                                                <p className="text-xs text-slate-500 leading-snug">{perk.description}</p>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>


                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default PreOrderDialog;
