'use client';

import React, { useMemo } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import useSWR from 'swr';
import { ProductDetails } from '@/app/types/ProductDetailsTypes';
import { cn } from '@/lib/utils';
import { Scale } from 'lucide-react';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

interface RelatedComparisonProps {
    currentProduct: ProductDetails;
    categoryId: string;
}

export default function RelatedComparison({ currentProduct, categoryId }: RelatedComparisonProps) {
    const router = useRouter();

    const { data: similarData } = useSWR(
        `http://localhost:8000/api/products/get-product-by-category/${categoryId}`,
        fetcher
    );

    const competitorProduct = useMemo(() => {
        if (!similarData?.products) return null;
        // Find a product that is NOT the current one, ideally similar price/spec
        const others = similarData.products.filter((p: ProductDetails) => p.id !== currentProduct.id);
        if (others.length === 0) return null;
        // For now, pick the first one or random
        return others[0];
    }, [similarData, currentProduct.id]);

    if (!competitorProduct) return null;

    const handleCompareClick = () => {
        router.push(`/compare?ids=${currentProduct.id},${competitorProduct.id}`);
    };

    return (
        <div className="mt-8">
            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                Related Comparison
            </h3>

            <div
                onClick={handleCompareClick}
                className="group cursor-pointer bg-[#1a1c23] rounded-2xl p-5 relative overflow-hidden transition-all duration-300 hover:shadow-xl hover:shadow-blue-900/10 border border-gray-800"
            >
                {/* Background Glow Effect */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 bg-blue-500/20 rounded-full blur-3xl group-hover:bg-blue-500/30 transition-all duration-500"></div>

                <div className="flex items-center justify-between gap-2 relative z-10">

                    {/* Left Product (Current) */}
                    <div className="flex-1 flex flex-col items-center text-center space-y-3">
                        <div className="relative w-24 h-28 transform group-hover:scale-105 transition-transform duration-300">
                            <Image
                                src={currentProduct.image.thumb || currentProduct.image.full}
                                alt={currentProduct.name}
                                fill
                                className="object-contain drop-shadow-lg"
                            />
                        </div>
                        <div className="space-y-1">
                            <h4 className="text-gray-200 text-xs font-medium line-clamp-2 min-h-[2.5em]">
                                {currentProduct.name}
                            </h4>
                            <p className="text-white font-bold text-sm">
                                Rs. {(currentProduct.discounted_price || currentProduct.price).toLocaleString()}
                            </p>
                        </div>
                    </div>

                    {/* VS Badge */}
                    <div className="shrink-0 flex flex-col items-center justify-center">
                        <div className="w-8 h-8 rounded-full border border-gray-600 flex items-center justify-center bg-[#252830] text-gray-400 text-[10px] font-bold z-20 shadow-lg">
                            VS
                        </div>
                        <div className="h-20 w-[1px] bg-gray-700/50 absolute top-1/2 -translate-y-1/2 -z-10"></div>
                    </div>

                    {/* Right Product (Competitor) */}
                    <div className="flex-1 flex flex-col items-center text-center space-y-3">
                        <div className="relative w-24 h-28 transform group-hover:scale-105 transition-transform duration-300">
                            <Image
                                src={competitorProduct.image.thumb || competitorProduct.image.full}
                                alt={competitorProduct.name}
                                fill
                                className="object-contain drop-shadow-lg"
                            />
                        </div>
                        <div className="space-y-1">
                            <h4 className="text-gray-200 text-xs font-medium line-clamp-2 min-h-[2.5em]">
                                {competitorProduct.name}
                            </h4>
                            <p className="text-white font-bold text-sm">
                                Rs. {(competitorProduct.discounted_price || competitorProduct.price).toLocaleString()}
                            </p>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}
