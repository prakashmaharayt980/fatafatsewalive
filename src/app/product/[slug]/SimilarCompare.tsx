"use client";

import React, { useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ShoppingBag, ArrowRight } from "lucide-react";
import useSWR from "swr";
import { useContextCart } from "@/app/checkout/CartContext1";
import { ProductDetails } from "@/app/types/ProductDetailsTypes";
import { cn } from "@/lib/utils";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

interface SimilarCompareProps {
    currentProduct: ProductDetails;
    categoryId: string;
}

export default function SimilarCompare({ currentProduct, categoryId }: SimilarCompareProps) {
    const { addToCart, compareItems } = useContextCart();
    const router = useRouter();

    const { data: similarData, isLoading } = useSWR(
        `http://localhost:8000/api/products/get-product-by-category/${categoryId}`,
        fetcher
    );

    const similarProducts: ProductDetails[] = useMemo(() => {
        if (!similarData?.products) return [];
        return similarData.products
            .filter((p: ProductDetails) => p.id !== currentProduct.id)
            .sort(() => 0.5 - Math.random()) // Randomize for variety
            .slice(0, 3); // Show up to 3 similar products
    }, [similarData, currentProduct.id]);

    if (isLoading) {
        return (
            <div className="w-full max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8 bg-white mt-12 border-t border-gray-100">
                <div className="flex justify-between items-end mb-8 px-2">
                    <div className="space-y-2">
                        <div className="h-8 w-64 bg-gray-200 rounded animate-pulse"></div>
                        <div className="h-4 w-48 bg-gray-100 rounded animate-pulse"></div>
                    </div>
                </div>
                <div className="flex overflow-x-auto pb-8 gap-4 sm:gap-6 scrollbar-hide px-2">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="min-w-[280px] w-[280px] shrink-0">
                            <div className="h-[400px] bg-gray-100 rounded-2xl animate-pulse"></div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    if (!similarProducts.length) return null;

    // Combined list: Current + Similar
    const compareList = [
        { ...currentProduct, isCurrent: true },
        ...similarProducts.map(p => ({ ...p, isCurrent: false }))
    ];

    return (
        <div className="w-full max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8 bg-white mt-16 border-t border-gray-100">
            {/* Header */}
            <div className="flex justify-between items-end mb-12 px-2">
                <div>
                    <h2 className="text-3xl font-black text-gray-900 tracking-tight mb-2">
                        Compare Products
                    </h2>
                    <p className="text-gray-500 font-medium text-base">Alternatives to {currentProduct.name}</p>
                </div>
                {similarData?.products.length > 4 && (
                    <div className="hidden md:flex gap-2">
                        <div className="text-sm font-bold text-gray-400">Scroll for more →</div>
                    </div>
                )}
            </div>

            {/* Horizontal Scroll Layout */}
            <div className="flex overflow-x-auto pb-12 gap-8 sm:gap-10 snap-x snap-mandatory scrollbar-hide px-2">
                {/* Current Product Card (Fixed First) */}
                <div className="min-w-[300px] w-[300px] snap-center shrink-0">
                    <div className="h-full relative flex flex-col bg-white rounded-3xl border-2 border-blue-600 shadow-2xl overflow-hidden">
                        <div className="absolute top-0 left-0 right-0 bg-blue-600 text-white text-sm font-black py-2 text-center z-10 uppercase tracking-wider">
                            Current Choice
                        </div>
                        <div className="relative aspect-[4/3] bg-gray-50 mt-8">
                            {currentProduct.image && (currentProduct.image.thumb || currentProduct.image.full) ? (
                                <Image
                                    src={currentProduct.image.thumb || currentProduct.image.full}
                                    alt={currentProduct.name}
                                    fill
                                    className="object-contain p-8"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center p-8 text-gray-300">
                                    <ShoppingBag className="w-12 h-12 opacity-50" />
                                </div>
                            )}
                        </div>
                        <div className="p-6 flex flex-col flex-1 gap-4">
                            <h3 className="text-lg font-black text-gray-900 leading-snug line-clamp-2">{currentProduct.name}</h3>
                            <div className="mt-auto">
                                <div className="text-2xl font-black text-blue-600">
                                    Rs. {(currentProduct.discounted_price || currentProduct.price).toLocaleString()}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Similar Products List */}
                {similarProducts.map((product) => {
                    const price = product.discounted_price || product.price;

                    return (
                        <div key={product.id} className="min-w-[300px] w-[300px] snap-center shrink-0 group relative">
                            <Link href={`/product/${product.slug}?id=${product.id}`}>
                                <div className="h-full flex flex-col bg-white rounded-3xl border border-gray-200 hover:border-gray-300 overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
                                    <div className="relative aspect-[4/3] bg-gray-50 group-hover:bg-gray-100 transition-colors">
                                        {product.image && (product.image.thumb || product.image.full) ? (
                                            <Image
                                                src={product.image.thumb || product.image.full}
                                                alt={product.name}
                                                fill
                                                className="object-contain p-8 group-hover:scale-105 transition-transform duration-500"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-300">
                                                <ShoppingBag className="w-10 h-10 opacity-50" />
                                            </div>
                                        )}
                                        {/* Hover Overlay Actions */}
                                        <div className="absolute inset-0 bg-white/10 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 gap-3 p-6 backdrop-blur-sm">
                                            <button
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    // Get current compare items from context
                                                    const currentIds = compareItems?.map((i: any) => i.id) || [];
                                                    const newIds = Array.from(new Set([...currentIds, product.id])).join(',');
                                                    router.push(`/compare?ids=${newIds}`);
                                                }}
                                                className="w-full py-3 bg-white text-gray-900 text-sm font-black rounded-xl shadow-lg flex items-center justify-center gap-2 hover:bg-gray-50 transform transition-transform hover:scale-105"
                                            >
                                                Compare Product
                                            </button>
                                        </div>
                                    </div>

                                    <div className="p-6 flex flex-col flex-1 gap-4">
                                        <h3 className="text-lg font-bold text-gray-900 leading-snug line-clamp-2 group-hover:text-blue-600 transition-colors">
                                            {product.name}
                                        </h3>
                                        <div className="mt-auto flex items-end justify-between">
                                            <div className="text-xl font-black text-gray-900">
                                                Rs. {price.toLocaleString()}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
