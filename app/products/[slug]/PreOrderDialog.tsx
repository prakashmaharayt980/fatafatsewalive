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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

interface PreOrderDialogProps {
    isOpen: boolean;
    onClose: () => void;
    productName?: string;
    productImage?: string;
    productPrice?: number;
    productSlug?: string;
}

const PRE_ORDER_PERKS = [
    {
        icon: BadgePercent,
        title: "Exclusive Early-Bird Price",
        description:
            "Lock in today's price. No price increase even if the market rate rises before delivery.",
        color: "text-emerald-500",
        bg: "bg-emerald-50",
    },
    {
        icon: CalendarClock,
        title: "Guaranteed First Delivery",
        description:
            "Pre-order customers receive their units before general stock becomes available to the public.",
        color: "text-blue-500",
        bg: "bg-blue-50",
    },
    {
        icon: ShieldCheck,
        title: "Fully Refundable Deposit",
        description:
            "A small deposit is required. If we can't deliver, you get a 100% refund — no questions asked.",
        color: "text-purple-500",
        bg: "bg-purple-50",
    },
    {
        icon: Truck,
        title: "Priority Shipping",
        description:
            "Your order is dispatched the moment stock arrives, ahead of regular orders.",
        color: "text-orange-500",
        bg: "bg-orange-50",
    },
    {
        icon: Banknote,
        title: "Flexible Payment",
        description:
            "Pay the deposit now and settle the remaining balance on delivery, or pay in full upfront.",
        color: "text-teal-500",
        bg: "bg-teal-50",
    },
];

const PreOrderDialog: React.FC<PreOrderDialogProps> = ({
    isOpen,
    onClose,
    productName,
    productImage,
    productPrice,
    productSlug,
}) => {
    const router = useRouter();

    const handleProceed = () => {
        onClose();
        if (productSlug) {
            router.push(`/checkout/preOrders/${productSlug}`);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="w-[95vw] max-w-md sm:max-w-4xl bg-white p-0 overflow-y-auto overflow-x-hidden md:overflow-hidden gap-0 border-none rounded-xl md:rounded-2xl max-h-[90vh] md:max-h-none [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                <div className="grid grid-cols-1 md:grid-cols-5 h-full md:min-h-[400px]">
                    {/* LEFT PANEL: Product Preview */}
                    <div className="md:col-span-2 bg-slate-50 p-6 flex flex-col items-center justify-center text-center border-r border-slate-100 relative">
                        <div className="w-32 h-32 bg-white rounded-xl shadow-sm border border-slate-200 flex items-center justify-center p-2 mb-4 relative overflow-hidden">
                            {productImage ? (
                                <Image
                                    src={productImage}
                                    alt={productName || "Product"}
                                    fill
                                    className="object-contain"
                                />
                            ) : (
                                <CalendarClock className="w-10 h-10 text-slate-300" />
                            )}
                        </div>
                        <h3 className="font-bold text-slate-900 text-sm leading-tight mb-1 line-clamp-2">
                            {productName}
                        </h3>
                        {productPrice && (
                            <div className="mt-2">
                                <p className="text-xs text-slate-500 mb-0.5">Price Locked At</p>
                                <p className="text-(--colour-fsP2) font-bold text-lg">
                                    Rs. {productPrice.toLocaleString()}
                                </p>
                            </div>
                        )}
                        <div className="mt-4 bg-blue-50 text-blue-700 text-[10px] font-bold px-3 py-1 rounded-full border border-blue-100 flex items-center gap-1">
                            <ShieldCheck className="w-3 h-3" />
                            GUARANTEED ALLOCATION
                        </div>
                        <div className="p-6 pt-4 border-t border-slate-100 shrink-0 bg-gray-50/50">
                            {/* User requested note for pre-orders */}
                            <div className="flex items-start gap-2 text-xs text-slate-600 mb-4 bg-blue-50/50 p-3 rounded-lg border border-blue-100/50">
                                <Banknote className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                                <span>
                                    <strong className="text-slate-800">Advanced Payment Note:</strong> A partial deposit amount is required to secure your pre-order. You can pay the remaining balance at the time of delivery.
                                </span>
                            </div>
                            <Button
                                onClick={handleProceed}
                                className="w-full py-6 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm transition-all shadow-sm"
                            >
                                Proceed with Pre-Order Booking
                            </Button>
                        </div>
                    </div>

                    {/* RIGHT PANEL: Info & Perks */}
                    <div className="md:col-span-3 flex flex-col h-full max-h-[95vh]">
                        <div className="p-6 pb-2 shrink-0">
                            <DialogHeader className="text-left">
                                <div className="flex items-center gap-2 mb-1">
                                    <CalendarClock className="w-5 h-5 text-blue-600" />
                                    <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">
                                        Pre-Order
                                    </span>
                                </div>
                                <DialogTitle className="text-xl font-bold text-slate-900 leading-snug">
                                    Reserve Before It Sells Out
                                </DialogTitle>
                                <DialogDescription className="text-slate-500 text-sm mt-1">
                                    Secure your unit today. Lock in the price before stock arrives.
                                </DialogDescription>
                            </DialogHeader>
                        </div>

                        <div className="px-6 py-2 overflow-y-auto flex-1 custom-scrollbar">
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
