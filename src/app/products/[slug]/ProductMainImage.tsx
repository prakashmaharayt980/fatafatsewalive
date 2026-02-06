// ProductMainImage.tsx
"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Heart, Maximize2, ChevronLeft, ChevronRight } from "lucide-react";
import { useContextCart } from "@/app/checkout/CartContext1";
import { cn } from "@/lib/utils";

interface ProductMainImageProps {
    selectedImage: string;
    setSelectedImage: (image: string) => void;
    productName: string;
    fallbackImage: string;
    productId: number;
    images: string[];
}

const ProductMainImage: React.FC<ProductMainImageProps> = ({
    selectedImage,
    setSelectedImage,
    productName,
    fallbackImage,
    productId,
    images,
}) => {
    const { wishlistItems, addToWishlist, removeFromWishlist } = useContextCart();
    const isInWishlist = wishlistItems.some((item) => item.id === productId);
    const [isZoomed, setIsZoomed] = useState(false);

    const toggleWishlist = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (isInWishlist) {
            removeFromWishlist(productId);
        } else {
            addToWishlist(productId);
        }
    };

    const currentImages = images.length > 0 ? images : [fallbackImage];
    const currentIndex = currentImages.indexOf(selectedImage);

    const goToPrev = () => {
        const prevIndex = currentIndex <= 0 ? currentImages.length - 1 : currentIndex - 1;
        setSelectedImage(currentImages[prevIndex]);
    };

    const goToNext = () => {
        const nextIndex = currentIndex >= currentImages.length - 1 ? 0 : currentIndex + 1;
        setSelectedImage(currentImages[nextIndex]);
    };

    return (
        <div className="space-y-2 sticky top-24">
            <div className="relative w-full aspect-[4/4] max-h-[420px] bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm group">
                {/* Image counter */}
                {currentImages.length > 1 && (
                    <div className="absolute top-3 left-3 z-10 bg-black/50 backdrop-blur-sm text-white text-xs font-medium px-2.5 py-1 rounded-full">
                        {(currentIndex >= 0 ? currentIndex : 0) + 1} / {currentImages.length}
                    </div>
                )}

                {/* Prev/Next Arrows */}
                {currentImages.length > 1 && (
                    <>
                        <button
                            onClick={goToPrev}
                            className="absolute left-2 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full bg-white/90 border border-gray-200 flex items-center justify-center text-gray-600 hover:bg-white hover:shadow-md transition-all opacity-0 group-hover:opacity-100"
                        >
                            <ChevronLeft className="w-4 h-4" />
                        </button>
                        <button
                            onClick={goToNext}
                            className="absolute right-2 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full bg-white/90 border border-gray-200 flex items-center justify-center text-gray-600 hover:bg-white hover:shadow-md transition-all opacity-0 group-hover:opacity-100"
                        >
                            <ChevronRight className="w-4 h-4" />
                        </button>
                    </>
                )}

                {/* Fullscreen Icon */}
                <button
                    onClick={() => setIsZoomed(!isZoomed)}
                    className="absolute bottom-3 right-3 z-10 w-8 h-8 rounded-lg bg-black/50 backdrop-blur-sm flex items-center justify-center text-white/90 hover:bg-black/70 transition-colors opacity-0 group-hover:opacity-100"
                >
                    <Maximize2 className="w-4 h-4" />
                </button>

                {/* Main Image */}
                <div className="relative w-full h-full p-3 sm:p-4">
                    <Image
                        src={selectedImage || fallbackImage}
                        alt={productName}
                        className={cn(
                            "object-contain transition-transform duration-500 drop-shadow-sm",
                            isZoomed ? "scale-150 cursor-zoom-out" : "cursor-zoom-in"
                        )}
                        fill
                        priority
                        sizes="(max-width: 768px) 100vw, 35vw"
                        onClick={() => setIsZoomed(!isZoomed)}
                        unoptimized={true}
                    />
                </div>
            </div>

            {/* Thumbnails Strip */}
            <div className="flex gap-1.5 overflow-x-auto scrollbar-hide pb-1 px-3">
                {currentImages.map((image, idx) => (
                    <button
                        key={`thumb-${idx}`}
                        className={cn(
                            "relative w-14 h-14 flex-shrink-0 cursor-pointer overflow-hidden rounded-lg transition-all border-2",
                            selectedImage === image
                                ? "border-[var(--colour-fsP1)] ring-1 ring-[var(--colour-fsP1)]/20 shadow-sm"
                                : "border-gray-100 bg-gray-50"
                        )}
                        onClick={() => setSelectedImage(image)}
                    >
                        <Image
                            src={image}
                            alt={`${productName} thumbnail ${idx + 1}`}
                            className="object-contain p-1"
                            fill
                            sizes="56px"
                            unoptimized={true}
                        />
                    </button>
                ))}
            </div>
        </div>
    );
};

export default ProductMainImage;
