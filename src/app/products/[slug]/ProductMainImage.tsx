"use client";

import React, { useState, useRef, useCallback, useEffect } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";

import { cn } from "@/lib/utils";
import { ArrowLeft, ArrowRight, X, ZoomIn, ChevronLeft, ChevronRight } from "lucide-react";

interface ProductMainImageProps {
    selectedImage: string;
    setSelectedImage: (image: string) => void;
    productName: string;
    fallbackImage: string;
    productId: number;
    images: string[];
    variantImages?: string[];
}

const ProductMainImage: React.FC<ProductMainImageProps> = ({
    selectedImage,
    setSelectedImage,
    productName,
    fallbackImage,
    images,
    variantImages,
}) => {
    const [showMagnifier, setShowMagnifier] = useState(false);
    const [[bgX, bgY], setBgXY] = useState([50, 50]);
    const [[lensX, lensY], setLensXY] = useState([0, 0]);
    const wrapperRef = useRef<HTMLDivElement>(null);
    const [isMobileZoomed, setIsMobileZoomed] = useState(false);
    const thumbContainerRef = useRef<HTMLDivElement>(null);

    const LENS_SIZE = 120;
    const ZOOM_LEVEL = 3;

    const [mounted, setMounted] = useState(false);
    useEffect(() => setMounted(true), []);

    const currentImages = images.length > 0 ? images : [fallbackImage];
    const thumbnailImages = variantImages && variantImages.length > 0 ? variantImages : currentImages;
    const currentIndex = currentImages.indexOf(selectedImage);
    const safeIndex = currentIndex >= 0 ? currentIndex : 0;

    const goToPrev = useCallback(() => {
        const prevIndex = safeIndex <= 0 ? currentImages.length - 1 : safeIndex - 1;
        setSelectedImage(currentImages[prevIndex]);
    }, [safeIndex, currentImages, setSelectedImage]);

    const goToNext = useCallback(() => {
        const nextIndex = safeIndex >= currentImages.length - 1 ? 0 : safeIndex + 1;
        setSelectedImage(currentImages[nextIndex]);
    }, [safeIndex, currentImages, setSelectedImage]);

    // Keyboard navigation in fullscreen
    useEffect(() => {
        if (!isMobileZoomed) return;
        const handleKey = (e: KeyboardEvent) => {
            if (e.key === "ArrowLeft") goToPrev();
            else if (e.key === "ArrowRight") goToNext();
            else if (e.key === "Escape") setIsMobileZoomed(false);
        };
        window.addEventListener("keydown", handleKey);
        return () => window.removeEventListener("keydown", handleKey);
    }, [isMobileZoomed, goToPrev, goToNext]);

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!wrapperRef.current) return;
        const { left, top, width, height } = wrapperRef.current.getBoundingClientRect();
        const relativeX = e.clientX - left;
        const relativeY = e.clientY - top;
        const safeLensX = Math.max(LENS_SIZE / 2, Math.min(relativeX, width - LENS_SIZE / 2));
        const safeLensY = Math.max(LENS_SIZE / 2, Math.min(relativeY, height - LENS_SIZE / 2));
        setLensXY([safeLensX, safeLensY]);
        setBgXY([
            Math.max(0, Math.min(100, (relativeX / width) * 100)),
            Math.max(0, Math.min(100, (relativeY / height) * 100)),
        ]);
    };

    const src = selectedImage || fallbackImage || "/fixedimg/placeholder-lg.webp";

    // Scroll active thumbnail into view
    useEffect(() => {
        if (!thumbContainerRef.current) return;
        const activeThumb = thumbContainerRef.current.querySelector('[data-active="true"]');
        if (activeThumb) {
            activeThumb.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
        }
    }, [selectedImage]);

    return (
        <div className={cn("relative sticky top-24", showMagnifier && "z-[100]")}>
            {/* ─── Fullscreen Zoom Dialog ─── */}
            {isMobileZoomed && mounted && createPortal(
                <div
                    className="fixed inset-0 z-[9999] bg-black/90 backdrop-blur-xl flex flex-col items-center justify-center animate-in fade-in zoom-in-95 duration-200"
                    onClick={() => setIsMobileZoomed(false)}
                >
                    {/* Top bar */}
                    <div className="absolute top-0 left-0 right-0 z-[10001] flex items-center justify-between px-4 py-3 sm:px-6 sm:py-4 bg-gradient-to-b from-black/60 to-transparent">
                        <div className="flex items-center gap-3">
                            {currentImages.length > 1 && (
                                <span className="text-white/80 text-sm font-medium tracking-wide">
                                    {safeIndex + 1} <span className="text-white/40">/</span> {currentImages.length}
                                </span>
                            )}
                            <span className="text-white/50 text-xs truncate max-w-[200px] hidden sm:inline">
                                {productName}
                            </span>
                        </div>
                        <button
                            onClick={(e) => { e.stopPropagation(); setIsMobileZoomed(false); }}
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
                            src={src}
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
                                            <Image
                                                src={image || "/placeholder.png"}
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
            )}

            <div className="flex gap-2.5">
                {/* ─── Vertical Thumbnail Strip (Desktop) ─── */}
                {thumbnailImages.length > 1 && (
                    <div className="hidden md:flex flex-col gap-1.5 max-h-[420px] overflow-y-auto scrollbar-hide px-0.5 py-0.5" ref={thumbContainerRef}>
                        {thumbnailImages.map((image, idx) => {
                            const isActive = selectedImage === image;
                            return (
                                <button
                                    key={`vthumb-${idx}`}
                                    data-active={isActive}
                                    onClick={() => setSelectedImage(image)}
                                    aria-label={`View image ${idx + 1}`}
                                    className={cn(
                                        "relative flex-shrink-0 w-[54px] h-[54px] rounded-lg overflow-hidden border-2 transition-all duration-200 cursor-pointer bg-white",
                                        isActive
                                            ? "border-[var(--colour-fsP2)] shadow-sm shadow-[var(--colour-fsP2)]/20 scale-105"
                                            : "border-gray-200 hover:border-gray-300 hover:shadow-sm"
                                    )}
                                >
                                    <span className={cn(
                                        "absolute inset-0 z-10 transition-opacity duration-200 bg-white rounded-md",
                                        isActive ? "opacity-0" : "opacity-15 hover:opacity-0"
                                    )} />
                                    <Image
                                        src={image || "/placeholder.png"}
                                        alt={`${productName} ${idx + 1}`}
                                        fill
                                        className="object-contain p-1"
                                        sizes="54px"
                                    />
                                </button>
                            );
                        })}
                    </div>
                )}

                {/* ─── Main Image ─── */}
                <div className="flex-1 space-y-2">
                    <div
                        ref={wrapperRef}
                        className="relative w-full aspect-square bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm group cursor-crosshair"
                        onMouseEnter={() => typeof window !== "undefined" && window.innerWidth >= 768 && setShowMagnifier(true)}
                        onMouseLeave={() => setShowMagnifier(false)}
                        onMouseMove={handleMouseMove}
                    >
                        {/* Counter pill */}
                        {currentImages.length > 1 && (
                            <div className="absolute top-3 left-3 z-10 bg-black/25 backdrop-blur-md text-white text-[10px] font-semibold tracking-widest px-2.5 py-1 rounded-full">
                                {safeIndex + 1} / {currentImages.length}
                            </div>
                        )}

                        {/* Zoom trigger button */}
                        <button
                            onClick={() => setIsMobileZoomed(true)}
                            className="absolute bottom-3 right-3 z-20 w-9 h-9 rounded-lg bg-white/90 backdrop-blur-sm border border-gray-200/80 flex items-center justify-center text-gray-500 hover:text-[var(--colour-fsP1)] hover:border-[var(--colour-fsP1)]/40 hover:scale-110 transition-all shadow-sm cursor-pointer"
                            aria-label="Zoom image"
                        >
                            <ZoomIn className="w-4 h-4" />
                        </button>

                        {/* Nav Arrows */}
                        {currentImages.length > 1 && (
                            <>
                                <button
                                    onClick={(e) => { e.stopPropagation(); goToPrev(); }}
                                    aria-label="Previous image"
                                    className="absolute left-2.5 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full bg-white/90 backdrop-blur-sm border border-gray-200/80 shadow-sm flex items-center justify-center text-gray-500 hover:text-[var(--colour-fsP1)] hover:border-[var(--colour-fsP1)]/30 opacity-0 group-hover:opacity-100 transition-all cursor-pointer"
                                >
                                    <ChevronLeft className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={(e) => { e.stopPropagation(); goToNext(); }}
                                    aria-label="Next image"
                                    className="absolute right-2.5 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full bg-white/90 backdrop-blur-sm border border-gray-200/80 shadow-sm flex items-center justify-center text-gray-500 hover:text-[var(--colour-fsP1)] hover:border-[var(--colour-fsP1)]/30 opacity-0 group-hover:opacity-100 transition-all cursor-pointer"
                                >
                                    <ChevronRight className="w-4 h-4" />
                                </button>
                            </>
                        )}

                        {/* Image */}
                        <div className="relative w-full h-full p-5">
                            <Image
                                src={src}
                                alt={productName}
                                fill
                                priority
                                fetchPriority="high"
                                className="object-contain transition-opacity duration-200"
                                sizes="(max-width: 768px) 100vw, 50vw"
                            />
                        </div>

                        {/* Hover lens indicator */}
                        {showMagnifier && (
                            <div
                                className="pointer-events-none absolute hidden md:block rounded-full border-2 border-[var(--colour-fsP2)]/50 bg-[var(--colour-fsP2)]/[0.06] -translate-x-1/2 -translate-y-1/2 shadow-lg shadow-[var(--colour-fsP2)]/10"
                                style={{
                                    width: `${LENS_SIZE}px`,
                                    height: `${LENS_SIZE}px`,
                                    top: `${lensY}px`,
                                    left: `${lensX}px`,
                                    transition: "none",
                                }}
                            />
                        )}
                    </div>

                    {/* ─── Horizontal Thumbnail Strip (Mobile) ─── */}
                    {thumbnailImages.length > 1 && (
                        <div className="flex md:hidden gap-1.5 overflow-x-auto scrollbar-hide py-0.5 px-0.5">
                            {thumbnailImages.map((image, idx) => {
                                const isActive = selectedImage === image;
                                return (
                                    <button
                                        key={`hthumb-${idx}`}
                                        onClick={() => setSelectedImage(image)}
                                        aria-label={`View image ${idx + 1}`}
                                        className={cn(
                                            "relative flex-shrink-0 w-[50px] h-[50px] rounded-lg overflow-hidden border-2 transition-all duration-200 cursor-pointer bg-white",
                                            isActive
                                                ? "border-[var(--colour-fsP2)] shadow-sm shadow-[var(--colour-fsP2)]/20"
                                                : "border-gray-200 hover:border-gray-300"
                                        )}
                                    >
                                        <Image
                                            src={image || "/placeholder.png"}
                                            alt={`${productName} ${idx + 1}`}
                                            fill
                                            className="object-contain p-1"
                                            sizes="50px"
                                        />
                                    </button>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>

            {/* ─── Zoom Panel (Desktop hover) ─── */}
            {showMagnifier && (
                <div
                    className="absolute top-0 left-[calc(100%+12px)] z-[110] w-[400px] h-[400px] bg-white rounded-2xl border border-gray-100 shadow-2xl hidden md:block overflow-hidden pointer-events-none"
                    style={{
                        backgroundImage: `url('${src}')`,
                        backgroundRepeat: "no-repeat",
                        backgroundSize: `${ZOOM_LEVEL * 100}%`,
                        backgroundPosition: `${bgX}% ${bgY}%`,
                    }}
                >
                    {/* Subtle zoom level indicator */}
                    <div className="absolute bottom-2.5 right-2.5 bg-black/30 backdrop-blur-sm text-white text-[10px] font-medium px-2 py-0.5 rounded-full">
                        {ZOOM_LEVEL}x
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProductMainImage;