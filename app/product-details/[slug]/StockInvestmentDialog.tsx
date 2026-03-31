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
    TrendingUp,
    PackageCheck,
    ShieldCheck,
    BarChart3,
    BadgePercent,
    CheckCircle2,
    Coins,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface StockInvestmentDialogProps {
    isOpen: boolean;
    onClose: () => void;
    productName?: string;
    productImage?: string;
    productPrice?: number;
}

const INVESTMENT_PERKS = [
    {
        icon: TrendingUp,
        title: "Earn on Price Appreciation",
        description:
            "If the product's market price rises, you earn the difference. Your investment grows with the market.",
        color: "text-emerald-500",
        bg: "bg-emerald-50",
    },
    {
        icon: PackageCheck,
        title: "Stock Guaranteed",
        description:
            "Your invested units are reserved in our warehouse. You have priority access when you wish to receive them.",
        color: "text-blue-500",
        bg: "bg-blue-50",
    },
    {
        icon: BadgePercent,
        title: "Wholesale Pricing",
        description:
            "Invest in bulk quantities and unlock wholesale rates not available to regular customers.",
        color: "text-purple-500",
        bg: "bg-purple-50",
    },
    {
        icon: BarChart3,
        title: "Live Earnings Dashboard",
        description:
            "Track the current market value of your stock investment in real time from your dashboard.",
        color: "text-orange-500",
        bg: "bg-orange-50",
    },
    {
        icon: ShieldCheck,
        title: "Capital Protection",
        description:
            "Option to liquidate at any time. If prices fall, we guarantee a minimum return on your capital.",
        color: "text-teal-500",
        bg: "bg-teal-50",
    },
    {
        icon: Coins,
        title: "Dividend Rewards",
        description:
            "Earn loyalty points on every unit sold from your stock, redeemable as cash or discounts.",
        color: "text-amber-500",
        bg: "bg-amber-50",
    },
];

const StockInvestmentDialog: React.FC<StockInvestmentDialogProps> = ({
    isOpen,
    onClose,
    productName,
    productImage,
    productPrice,
}) => {
    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="w-[95vw] max-w-md sm:max-w-4xl bg-white p-0 overflow-y-auto overflow-x-hidden md:overflow-hidden gap-0 border-none rounded-xl md:rounded-2xl max-h-[90vh] md:max-h-none [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                <div className="grid grid-cols-1 md:grid-cols-5 h-full md:min-h-[400px]">
                    {/* LEFT PANEL: Product Preview */}
                    <div className="md:col-span-2 bg-slate-50 p-4 md:p-6 flex flex-col items-center justify-center text-center border-b md:border-b-0 md:border-r border-slate-100 relative shrink-0">
                        <div className="w-24 h-24 md:w-32 md:h-32 bg-white rounded-xl shadow-sm border border-slate-200 flex items-center justify-center p-2 mb-3 md:mb-4 relative overflow-hidden">
                            {productImage ? (
                                <Image
                                    src={productImage}
                                    alt={productName || "Product"}
                                    fill
                                    className="object-contain"
                                />
                            ) : (
                                <TrendingUp className="w-10 h-10 text-slate-300" />
                            )}
                        </div>
                        <h3 className="font-bold text-slate-900 text-sm leading-tight mb-1 line-clamp-2">
                            {productName}
                        </h3>
                        {productPrice && (
                            <div className="mt-2">
                                <p className="text-xs text-slate-500 mb-0.5">Invest From</p>
                                <p className="text-emerald-600 font-bold text-lg">
                                    Rs. {productPrice.toLocaleString()}
                                </p>
                            </div>
                        )}
                        <div className="mt-4 bg-emerald-50 text-emerald-700 text-[10px] font-bold px-3 py-1 rounded-full border border-emerald-100 flex items-center gap-1">
                            <TrendingUp className="w-3 h-3" />
                            UP TO 15% PROJECTED RETURNS
                        </div>
                        <div className=" pt-4 border-t border-slate-100 shrink-0 bg-gray-50/50">
                            {/* User requested note for stock investments */}
                            <div className="flex items-start gap-2 text-xs text-slate-600 mb-4 bg-emerald-50/50 p-3 rounded-lg border border-emerald-100/50">
                                <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                                <span>
                                    <strong className="text-slate-800">What is Stock Investment?</strong> This is a unique way to invest directly in physical products' stock. We manage the storage and sales, and you track your earnings live.
                                </span>
                            </div>
                            <Button
                                onClick={onClose}
                                className="w-full py-6 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm transition-all shadow-sm"
                            >
                                Start Your Investment
                            </Button>
                        </div>
                    </div>

                    {/* RIGHT PANEL: Info & Perks */}
                    <div className="md:col-span-3 flex flex-col h-full max-h-[85vh] md:max-h-[95vh]">
                        <div className="p-4 md:p-6 pb-2 shrink-0">
                            <DialogHeader className="text-left">
                                <div className="flex items-center gap-2 mb-1">
                                    <TrendingUp className="w-5 h-5 text-emerald-600" />
                                    <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">
                                        Stock Investment
                                    </span>
                                </div>
                                <DialogTitle className="text-lg md:text-xl font-bold text-slate-900 leading-snug">
                                    Invest in Product Stock
                                </DialogTitle>
                                <DialogDescription className="text-slate-500 text-xs md:text-sm mt-1">
                                    Buy physical inventory at wholesale rates and earn returns as it sells out on our marketplace.
                                </DialogDescription>
                            </DialogHeader>
                        </div>

                        <div className="px-4 md:px-6 py-2 overflow-y-auto flex-1 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                            <div className="space-y-4">
                                {INVESTMENT_PERKS.map((perk) => {
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

export default StockInvestmentDialog;
