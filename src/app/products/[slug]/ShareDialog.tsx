"use client";

import React, { useState } from "react";
import { Copy, Check, Facebook, Twitter, Linkedin, Mail, Smartphone, Share2, Link } from "lucide-react";
import Image from "next/image";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface ShareDialogProps {
    isOpen: boolean;
    onClose: () => void;
    productUrl: string;
    productName: string;
    productImage?: string;
    productPrice?: number | string;
}

export default function ShareDialog({
    isOpen,
    onClose,
    productUrl,
    productName,
    productImage,
    productPrice
}: ShareDialogProps) {
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(productUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const shareLinks = [
        {
            name: "Facebook",
            icon: <Facebook className="w-5 h-5 fill-blue-600 text-blue-600" />,
            url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(productUrl)}`,
            color: "hover:bg-blue-50 border-blue-100/50"
        },
        {
            name: "Twitter",
            icon: <Twitter className="w-5 h-5 fill-sky-500 text-sky-500" />,
            url: `https://twitter.com/intent/tweet?text=${encodeURIComponent(productName)}&url=${encodeURIComponent(productUrl)}`,
            color: "hover:bg-sky-50 border-sky-100/50"
        },
        {
            name: "WhatsApp",
            icon: <Smartphone className="w-5 h-5 text-green-500" />,
            url: `https://wa.me/?text=${encodeURIComponent(productName + " " + productUrl)}`,
            color: "hover:bg-green-50 border-green-100/50"
        },
        {
            name: "Email",
            icon: <Mail className="w-5 h-5 text-gray-500" />,
            url: `mailto:?subject=${encodeURIComponent(productName)}&body=${encodeURIComponent(productUrl)}`,
            color: "hover:bg-gray-50 border-gray-100/50"
        },
    ];

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-2xl bg-white p-0 overflow-hidden gap-0">
                <div className="grid grid-cols-1 md:grid-cols-5 h-full">
                    {/* LEFT PANEL: Product Preview */}
                    <div className="md:col-span-2 bg-slate-50 p-6 flex flex-col items-center justify-center text-center border-r border-slate-100">
                        <div className="w-32 h-32 bg-white rounded-xl shadow-sm border border-slate-200 flex items-center justify-center p-2 mb-4 relative overflow-hidden">
                            {productImage ? (
                                <Image
                                    src={productImage}
                                    alt={productName}
                                    fill
                                    className="object-contain"
                                />
                            ) : (
                                <Share2 className="w-10 h-10 text-slate-300" />
                            )}
                        </div>
                        <h3 className="font-bold text-slate-900 text-sm leading-tight mb-1 line-clamp-2">
                            {productName}
                        </h3>
                        {productPrice && (
                            <p className="text-[var(--colour-fsP2)] font-bold text-lg">
                                Rs. {productPrice.toLocaleString()}
                            </p>
                        )}
                        <div className="mt-4 bg-blue-50 text-blue-700 text-[10px] font-bold px-3 py-1 rounded-full border border-blue-100">
                            EARN POINTS ON SHARE
                        </div>
                    </div>

                    {/* RIGHT PANEL: Share Options */}
                    <div className="md:col-span-3 p-6">
                        <DialogHeader className="mb-4 text-left">
                            <DialogTitle className="text-xl font-bold text-slate-900">Share Product</DialogTitle>
                            <DialogDescription className="text-sm text-slate-500">
                                Share this product with your friends and earn reward points on every successful referral.
                            </DialogDescription>
                        </DialogHeader>

                        <div className="space-y-4">
                            {/* Copy Link Input */}
                            <div className="relative">
                                <label className="text-xs font-bold text-slate-700 mb-1.5 block">Copy Link</label>
                                <div className="flex items-center">
                                    <div className="relative flex-1">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <Link className="h-4 w-4 text-gray-400" />
                                        </div>
                                        <input
                                            readOnly
                                            value={productUrl}
                                            className="w-full pl-9 pr-3 py-2.5  text-sm bg-gray-50 border border-gray-200 rounded-l-lg text-slate-600 outline-none focus:ring-1 focus:ring-[var(--colour-fsP2)]"
                                        />
                                    </div>
                                    <Button
                                        type="button"
                                        onClick={handleCopy}
                                        className="rounded-l-none rounded-r-lg h-[42px] bg-[var(--colour-fsP2)] hover:bg-[var(--colour-fsP2)]/90 text-white min-w-[80px]"
                                    >
                                        {copied ? (
                                            <div className="flex items-center gap-1">
                                                <Check className="h-4 w-4" />
                                                <span>Copied</span>
                                            </div>
                                        ) : (
                                            <span>Copy</span>
                                        )}
                                    </Button>
                                </div>
                            </div>

                            {/* Social Share Grid */}
                            <div>
                                <label className="text-xs font-bold text-slate-700 mb-2 block">Share via</label>
                                <div className="grid grid-cols-4 gap-2">
                                    {shareLinks.map((link, idx) => (
                                        <a
                                            key={idx}
                                            href={link.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className={`flex flex-col items-center justify-center gap-1.5 p-3 rounded-lg border bg-white transition-all hover:shadow-sm hover:scale-105 ${link.color}`}
                                            title={link.name}
                                        >
                                            {link.icon}
                                            <span className="text-[10px] font-bold text-slate-600">{link.name}</span>
                                        </a>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
