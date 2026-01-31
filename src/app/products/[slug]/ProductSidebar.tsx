// ProductSidebar.tsx
"use client";

import React, { useMemo } from "react";
import Image from "next/image";
import { ChevronRight } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import useSWR from "swr";
import RelatedNews from "./RelatedNews";
import { ProductDetails } from "@/app/types/ProductDetailsTypes";
import { useContextCart } from "@/app/checkout/CartContext1";

interface ProductSidebarProps {
    product: ProductDetails;
    relatedCategorySlug?: string;
    categoryId?: string;
}

const fetcher = (url: string) => fetch(url).then((res) => res.json());

const ProductSidebar: React.FC<ProductSidebarProps> = ({ product, relatedCategorySlug, categoryId }) => {
    const router = useRouter();
    const { compareItems } = useContextCart();

    // Fetch similar products for comparison
    const { data: similarData } = useSWR(
        categoryId ? `${process.env.NEXT_PUBLIC_API_URL}/products/get-product-by-category/${categoryId}` : null,
        fetcher
    );

    const similarProducts: ProductDetails[] = useMemo(() => {
        if (!similarData?.products) return [];
        return similarData.products
            .filter((p: ProductDetails) => p.id !== product.id)
            .sort(() => 0.5 - Math.random())
            .slice(0, 3);
    }, [similarData, product.id]);

    return (
        <div className="space-y-6 sticky top-24">
            {/* 1. Related News */}
            <RelatedNews productName={product.name} />

            {/* 2. Related Comparisons */}
            {similarProducts.length > 0 && (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-bold text-slate-800">Related Comparison</h3>
                    </div>

                    <div className="space-y-3">
                        {similarProducts.map((simProduct, idx) => (
                            <div
                                key={idx}
                                className="bg-gray-50 rounded-xl p-3 border border-gray-100 transition-hover hover:border-gray-200 cursor-pointer group"
                                onClick={() => {
                                    const currentIds = compareItems?.map((i: any) => i.id) || [];
                                    const newIds = Array.from(new Set([...currentIds, product.id, simProduct.id])).join(',');
                                    router.push(`/compare?ids=${newIds}`);
                                }}
                            >
                                <div className="flex items-center justify-between gap-2">
                                    {/* Product A (Current) */}
                                    <div className="flex flex-col items-center gap-1 w-1/3">
                                        <div className="w-10 h-12 relative mix-blend-multiply">
                                            <Image
                                                src={product.image?.full || '/placeholder.png'}
                                                alt={product.name}
                                                fill
                                                className="object-contain"
                                            />
                                        </div>
                                        <p className="text-[10px] text-center font-medium leading-tight line-clamp-2">{product.name.split(' ').slice(0, 2).join(' ')}...</p>
                                        <p className="text-[10px] text-gray-500 font-bold">Rs. {(product.discounted_price || product.price).toLocaleString()}</p>
                                    </div>

                                    {/* VS Badge */}
                                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-white shadow-sm border border-gray-100 shrink-0 z-10 -mx-1 group-hover:bg-[var(--colour-fsP2)] group-hover:text-white transition-colors">
                                        <span className="text-[10px] font-bold text-gray-400 group-hover:text-white">VS</span>
                                    </div>

                                    {/* Product B (Similar) */}
                                    <div className="flex flex-col items-center gap-1 w-1/3">
                                        <div className="w-10 h-12 relative mix-blend-multiply opacity-80 group-hover:opacity-100 transition-all">
                                            <Image
                                                src={simProduct.image?.full || simProduct.image?.thumb || '/placeholder.png'}
                                                alt={simProduct.name}
                                                fill
                                                className="object-contain"
                                            />
                                        </div>
                                        <p className="text-[10px] text-center font-medium leading-tight line-clamp-2 text-gray-600 group-hover:text-[var(--colour-fsP2)] transition-colors">
                                            {simProduct.name.split(' ').slice(0, 2).join(' ')}...
                                        </p>
                                        <p className="text-[10px] text-gray-400 font-bold group-hover:text-gray-600">
                                            Rs. {(simProduct.discounted_price || simProduct.price).toLocaleString()}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}


        </div>
    );
};

export default ProductSidebar;
