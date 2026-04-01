"use client";

import React, { useEffect } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface ProductZoomDialogProps {
    isOpen: boolean;
    onClose: () => void;
    currentImages: string[];
    currentIndex: number;
    productName: string;
    selectedImage: string;
    setSelectedImage: (image: string) => void;
    goToPrev: () => void;
    goToNext: () => void;
}

const ProductZoomDialog: React.FC<ProductZoomDialogProps> = ({
    isOpen,
    onClose,
    currentImages,
    currentIndex,
    productName,
    selectedImage,
    setSelectedImage,
    goToPrev,
    goToNext,
}) => {
    // Keyboard navigation in fullscreen
    useEffect(() => {
        if (!isOpen) return;
        const handleKey = (e: KeyboardEvent) => {
            if (e.key === "ArrowLeft") goToPrev();
            else if (e.key === "ArrowRight") goToNext();
            else if (e.key === "Escape") onClose();
        };
        window.addEventListener("keydown", handleKey);
        return () => window.removeEventListener("keydown", handleKey);
    }, [isOpen, goToPrev, goToNext, onClose]);

    if (!isOpen) return null;

    return createPortal(
        <div
            className="fixed inset-0 z-[9999] bg-black/90 backdrop-blur-xl flex flex-col items-center justify-center animate-in fade-in zoom-in-95 duration-200"
            onClick={onClose}
        >
            {/* Top bar */}
            <div className="absolute top-0 left-0 right-0 z-[10001] flex items-center justify-between px-4 py-3 sm:px-6 sm:py-4 bg-gradient-to-b from-black/60 to-transparent">
                <div className="flex items-center gap-3">
                    {currentImages.length > 1 && (
                        <span className="text-white/80 text-sm font-medium tracking-wide">
                            {currentIndex + 1} <span className="text-white/40">/</span> {currentImages.length}
                        </span>
                    )}
                    <span className="text-white/50 text-xs truncate max-w-[200px] hidden sm:inline">
                        {productName}
                    </span>
                </div>
                <button
                    onClick={(e) => { e.stopPropagation(); onClose(); }}
                    className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-md border border-white/15 flex items-center justify-center text-white hover:bg-white/20 transition-all cursor-pointer"
                    aria-label="Close zoom"
                >
                    <X className="w-5 h-5" />
                </button>
            </div>

            {/* Main zoomed image */}
            <div
                className="relative w-full h-full max-w-4xl max-h-[80vh] mx-4 my-16"
                onClick={(e) => e.stopPropagation()}
            >
                <Image
                    src={selectedImage}
                    alt={productName}
                    fill
                    className="object-contain select-none"
                    sizes="100vw"
                    priority
                    draggable={false}
                />
            </div>

            {/* Navigation arrows */}
            {currentImages.length > 1 && (
                <>
                    <button
                        onClick={(e) => { e.stopPropagation(); goToPrev(); }}
                        className="absolute left-3 sm:left-6 top-1/2 -translate-y-1/2 z-[10000] w-11 h-11 rounded-full bg-white/10 backdrop-blur-md border border-white/15 flex items-center justify-center text-white hover:bg-white/25 hover:scale-110 transition-all cursor-pointer"
                    >
                        <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button
                        onClick={(e) => { e.stopPropagation(); goToNext(); }}
                        className="absolute right-3 sm:right-6 top-1/2 -translate-y-1/2 z-[10000] w-11 h-11 rounded-full bg-white/10 backdrop-blur-md border border-white/15 flex items-center justify-center text-white hover:bg-white/25 hover:scale-110 transition-all cursor-pointer"
                    >
                        <ChevronRight className="w-5 h-5" />
                    </button>
                </>
            )}

            {/* Bottom thumbnail strip in dialog */}
            {currentImages.length > 1 && (
                <div className="absolute bottom-0 left-0 right-0 z-[10001] bg-gradient-to-t from-black/70 to-transparent py-3 px-4">
                    <div className="flex justify-center gap-2 overflow-x-auto scrollbar-hide max-w-xl mx-auto">
                        {currentImages.map((image, idx) => {
                            const isActive = selectedImage === image;
                            return (
                                <button
                                    key={`dialog-thumb-${idx}`}
                                    onClick={(e) => { e.stopPropagation(); setSelectedImage(image); }}
                                    className={cn(
                                        "relative flex-shrink-0 w-12 h-12 rounded-lg overflow-hidden border-2 transition-all duration-200 cursor-pointer",
                                        isActive
                                            ? "border-white scale-110 shadow-lg shadow-white/20"
                                            : "border-white/20 opacity-60 hover:opacity-90 hover:border-white/50"
                                    )}
                                >
                                     {/* || "/placeholder.png" */}
                                    <Image
                                        src={image}
                                        alt={`${productName} ${idx + 1}`}
                                        fill
                                        className="object-contain p-0.5"
                                        sizes="48px"
                                    />
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>,
        document.body
    );
};

export default ProductZoomDialog;
