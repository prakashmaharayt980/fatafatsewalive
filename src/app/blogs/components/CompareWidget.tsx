'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import useSWR from 'swr';
import { ArrowLeftRight, X, Plus } from 'lucide-react';
import RemoteServices from '../../api/remoteservice';
import { ProductDetails } from '../../types/ProductDetailsTypes';
import { useCompare } from '../../context/CompareContext';
import { formatPrice } from '@/app/category/[slug]/utils';
import ProductCard from '@/app/products/ProductCard';

const CompareWidget = () => {
    const { compareList, removeFromCompare } = useCompare();

    // Fetch fallback only if list is empty (mock suggestion)
    const { data: fallbackProducts } = useSWR<ProductDetails[]>('compare-products-pro',
        () => RemoteServices.searchProducts({ search: 'Pro' }).then(res => res.data || []),
        { dedupingInterval: 600000, keepPreviousData: true }
    );

    // If user has select items, show them. If not, show suggestions (max 4)
    const isUsingFallback = compareList.length === 0;
    const displayList = isUsingFallback
        ? (fallbackProducts || []).slice(0, 4)
        : compareList.slice(0, 4);

    // SEO Friendly URL Construction
    const compareUrl = compareList.length > 0
        ? `/compare?ids=${compareList.map(p => p.id).join(',')}`
        : '#';

    return (
        <div className="bg-white rounded-xl border-2 border-gray-100 p-3 sticky top-8 shadow-xs transition-shadow">
            <div className="flex justify-between items-center mb-2">
                <h3 className="text-xl font-bold text-[var(--colour-fsP2)] font-heading flex items-center gap-2">

                    Best Tech Deals

                </h3>

            </div>

            {/* Grid Layout - 2 Columns */}
            <div className="grid grid-cols-1  gap-3 ">
                {displayList.slice(0, 2).map((product) => (
                    <div key={product.id}><ProductCard product={product} /></div>
                ))}

                {/* Empty Slots Placeholder (Only if user has started adding items) */}
                {!isUsingFallback && compareList.length < 4 && (
                    <Link href="/search?q=smartphones" className="bg-white rounded-xl p-3 border-2 border-dashed border-gray-300 flex flex-col items-center justify-center text-center h-full min-h-[140px] hover:border-[var(--colour-fsP2)] hover:bg-[var(--colour-fsP2)]/5 transition-all group cursor-pointer text-gray-400 hover:text-[var(--colour-fsP2)]">
                        <div className="w-10 h-10 rounded-full bg-gray-100 group-hover:bg-[var(--colour-fsP2)] flex items-center justify-center mb-2 transition-colors">
                            <Plus className="w-5 h-5 group-hover:text-white" />
                        </div>
                        <span className="text-[10px] font-bold uppercase tracking-wide">Add Product</span>
                    </Link>
                )}
            </div>




        </div>
    );
};

export default CompareWidget;
