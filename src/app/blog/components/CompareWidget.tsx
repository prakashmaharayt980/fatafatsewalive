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

const CompareWidget = () => {
    const { compareList, removeFromCompare } = useCompare();

    // Fetch fallback only if list is empty (mock suggestion)
    const { data: fallbackProducts } = useSWR<ProductDetails[]>('compare-products-pro',
        () => RemoteServices.SerachProducts('Pro').then(res => res.data || []),
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
        <div className="bg-white rounded-2xl border border-gray-100 p-4 sticky top-8 shadow-sm">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold text-gray-900 font-heading flex items-center gap-2">
                    <ArrowLeftRight className="w-5 h-5 text-blue-600" />
                    Compare
                </h3>
                <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                    {compareList.length} / 4
                </span>
            </div>

            {/* Grid Layout - 2 Columns */}
            <div className="grid grid-cols-2 gap-3 mb-5">
                {displayList.map((product) => (
                    <div key={product.id} className="relative group bg-gray-50 rounded-xl p-3 border border-transparent hover:border-blue-200 transition-all hover:bg-white hover:shadow-sm flex flex-col items-center text-center">

                        {/* Remove Button (Only for user selected items) */}
                        {!isUsingFallback && (
                            <button
                                onClick={(e) => {
                                    e.preventDefault();
                                    removeFromCompare(product.id);
                                }}
                                className="absolute -top-1.5 -right-1.5 w-6 h-6 bg-white rounded-full text-gray-400 hover:text-red-500 hover:bg-red-50 border border-gray-200 shadow-sm flex items-center justify-center transition-colors z-10"
                                title="Remove"
                            >
                                <X className="w-3 h-3" />
                            </button>
                        )}

                        {/* Image */}
                        <div className="relative w-14 h-14 mb-2 mix-blend-multiply">
                            <Image
                                src={product.image?.thumb || product.image?.full || '/placeholder.png'}
                                alt={product.name}
                                fill
                                className="object-contain"
                            />
                        </div>

                        {/* Name */}
                        <h4 className="text-[11px] font-semibold text-gray-900 line-clamp-2 leading-tight mb-1 h-8 w-full">
                            {product.name}
                        </h4>

                        {/* Price ("Proce") */}
                        <div className="text-xs font-bold text-blue-600">
                            Rs. {formatPrice(product.discounted_price || product.price)}
                        </div>
                    </div>
                ))}

                {/* Empty Slots Placeholder (Only if user has started adding items) */}
                {!isUsingFallback && compareList.length < 4 && (
                    <Link href="/search?q=smartphones" className="bg-white rounded-xl p-3 border border-dashed border-gray-300 flex flex-col items-center justify-center text-center h-full min-h-[140px] hover:border-blue-400 hover:bg-blue-50/50 transition-all group cursor-pointer text-gray-400 hover:text-blue-600">
                        <div className="w-10 h-10 rounded-full bg-gray-50 group-hover:bg-blue-100 flex items-center justify-center mb-2 transition-colors">
                            <Plus className="w-5 h-5" />
                        </div>
                        <span className="text-[10px] font-bold uppercase tracking-wide">Add Product</span>
                    </Link>
                )}
            </div>

            <Link
                href={compareUrl}
                className={`block w-full text-center bg-gray-900 hover:bg-blue-600 text-white font-bold py-3 rounded-xl transition-all text-xs uppercase tracking-wider ${compareList.length < 2 ? 'opacity-50 cursor-not-allowed' : 'shadow-lg shadow-blue-900/20'}`}
                onClick={(e) => compareList.length < 2 && e.preventDefault()}
            >
                Compare Now
            </Link>

            {compareList.length < 2 && (
                <p className="text-[10px] text-gray-400 text-center mt-2.5">
                    Add at least 2 products to compare
                </p>
            )}
        </div>
    );
};

export default CompareWidget;
