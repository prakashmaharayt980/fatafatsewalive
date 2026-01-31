// RelatedComparison.tsx
"use client";

import React from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { ProductDetails } from "@/app/types/ProductDetailsTypes";
import useSWR from "swr";

interface RelatedComparisonProps {
    currentProduct: ProductDetails;
    categoryId: string;
}

const fetcher = (url: string) => fetch(url).then((res) => res.json());

const RelatedComparison: React.FC<RelatedComparisonProps> = ({
    currentProduct,
    categoryId,
}) => {
    const router = useRouter();

    const { data: similarData } = useSWR(
        categoryId ? `${process.env.NEXT_PUBLIC_API_URL}/products/get-product-by-category/${categoryId}` : null,
        fetcher
    );

    const relatedProducts = React.useMemo(() => {
        if (!similarData?.products) return [];
        return similarData.products
            .filter((p: ProductDetails) => p.id !== currentProduct.id)
            .slice(0, 4);
    }, [similarData, currentProduct.id]);

    const handleCompare = (productId: number) => {
        router.push(`/compare?ids=${currentProduct.id},${productId}`);
    };

    if (!relatedProducts.length) return null;

    return (
        <div className="w-full bg-white rounded-xl border border-gray-100 p-4">
            <h3 className="text-base font-bold text-slate-900 mb-4">Related Comparison</h3>

            <div className="space-y-3">
                {relatedProducts.slice(0, 2).map((product: ProductDetails) => (
                    <div
                        key={product.id}
                        onClick={() => handleCompare(product.id)}
                        className="flex items-center gap-3 p-3 rounded-lg border border-gray-100 hover:border-[var(--colour-fsP2)]/30 hover:bg-gray-50 transition-all cursor-pointer group"
                    >
                        {/* Current Product */}
                        <div className="flex flex-col items-center flex-1 min-w-0">
                            <div className="relative w-14 h-14 mb-1.5">
                                <Image
                                    src={currentProduct.image?.thumb || currentProduct.image?.full || "/placeholder.png"}
                                    alt={currentProduct.name}
                                    fill
                                    className="object-contain"
                                    sizes="56px"
                                />
                            </div>
                            <p className="text-[11px] font-medium text-slate-700 text-center line-clamp-1 w-full">
                                {currentProduct.name.split(' ').slice(0, 2).join(' ')}
                            </p>
                            <p className="text-[11px] font-bold text-[var(--colour-fsP1)]">
                                Rs. {(currentProduct.discounted_price || currentProduct.price).toLocaleString()}
                            </p>
                        </div>

                        {/* VS Badge */}
                        <div className="flex-shrink-0">
                            <div className="w-7 h-7 rounded-full bg-slate-800 flex items-center justify-center">
                                <span className="text-[9px] font-bold text-white">VS</span>
                            </div>
                        </div>

                        {/* Compared Product */}
                        <div className="flex flex-col items-center flex-1 min-w-0">
                            <div className="relative w-14 h-14 mb-1.5">
                                <Image
                                    src={product.image?.thumb || product.image?.full || "/placeholder.png"}
                                    alt={product.name}
                                    fill
                                    className="object-contain"
                                    sizes="56px"
                                />
                            </div>
                            <p className="text-[11px] font-medium text-slate-700 text-center line-clamp-1 w-full">
                                {product.name.split(' ').slice(0, 2).join(' ')}
                            </p>
                            <p className="text-[11px] font-bold text-[var(--colour-fsP1)]">
                                Rs. {(product.discounted_price || product.price).toLocaleString()}
                            </p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default RelatedComparison;