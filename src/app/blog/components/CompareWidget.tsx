'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import useSWR from 'swr';
import { ArrowLeftRight, Check, X } from 'lucide-react';
import RemoteServices from '../../api/remoteservice';
import { ProductDetails } from '../../types/ProductDetailsTypes';

import { useCompare } from '../../context/CompareContext';

const CompareWidget = () => {
    const { compareList, removeFromCompare } = useCompare();

    // Fetch fallback only if list is empty (mock suggestion)
    const { data: fallbackProducts } = useSWR<ProductDetails[]>('compare-products-pro',
        () => RemoteServices.SerachProducts('Pro').then(res => res.data || []),
        { dedupingInterval: 600000, keepPreviousData: true }
    );

    const activeList = compareList.length > 0 ? compareList : (fallbackProducts || []).slice(0, 2);

    const p1 = activeList?.[0];
    const p2 = activeList?.[1];

    // SEO Friendly URL Construction -> Switching to ID-based as requested for robustness
    const compareUrl = activeList.length > 0
        ? `/compare?ids=${activeList.map(p => p.id).join(',')}`
        : '#';

    if (!p1 || !p2) return null; // Don't show if data isn't ready

    // Helper to render spec comparison
    const ComparisonRow = ({ label, v1, v2 }: { label: string, v1: string, v2: string }) => (
        <div className="grid grid-cols-2 gap-2 text-[10px] border-b border-gray-50 pb-2 last:border-0 last:pb-0">
            <div className="text-gray-600">
                <span className="block text-gray-400 text-[9px] uppercase tracking-wider mb-0.5">{label}</span>
                <span className="font-semibold line-clamp-1" title={v1}>{v1}</span>
            </div>
            <div className="text-gray-600 border-l border-gray-50 pl-2">
                <span className="block text-gray-400 text-[9px] uppercase tracking-wider mb-0.5">&nbsp;</span>
                <span className="font-semibold line-clamp-1" title={v2}>{v2}</span>
            </div>
        </div>
    );

    return (
        <div className="bg-white rounded-2xl border border-gray-100 p-4 sticky top-8">
            <h3 className="text-lg font-bold text-gray-900 mb-4 font-heading flex items-center gap-2">
                <ArrowLeftRight className="w-5 h-5 text-blue-600" />
                Compare Specs
            </h3>

            {/* Product Headers Side-by-Side */}
            <div className="grid grid-cols-2 gap-2 mb-4">
                {/* Product 1 */}
                <div className="flex flex-col items-center text-center">
                    <div className="relative w-16 h-16 mb-2 bg-gray-50 rounded-lg overflow-hidden">
                        <Image
                            src={p1.image?.full || ''}
                            alt={p1.name}
                            fill
                            className="object-contain p-1"
                        />
                    </div>
                    <span className="text-xs font-bold text-gray-900 line-clamp-2 h-8 leading-tight">
                        {p1.name}
                    </span>
                    <span className="text-xs font-bold text-blue-600 mt-1">
                        Rs. {p1.discounted_price.toLocaleString()}
                    </span>
                </div>

                {/* Product 2 */}
                <div className="flex flex-col items-center text-center border-l border-gray-100 pl-2">
                    <div className="relative w-16 h-16 mb-2 bg-gray-50 rounded-lg overflow-hidden">
                        <Image
                            src={p2.image?.full || ''}
                            alt={p2.name}
                            fill
                            className="object-contain p-1"
                        />
                    </div>
                    <span className="text-xs font-bold text-gray-900 line-clamp-2 h-8 leading-tight">
                        {p2.name}
                    </span>
                    <span className="text-xs font-bold text-blue-600 mt-1">
                        Rs. {p2.discounted_price.toLocaleString()}
                    </span>
                </div>
            </div>

            {/* Comparison Details Table */}
            <div className="bg-gray-50/50 rounded-xl p-3 space-y-2 mb-4">
                <ComparisonRow
                    label="Brand"
                    v1={p1.brand?.name || 'N/A'}
                    v2={p2.brand?.name || 'N/A'}
                />
                <ComparisonRow
                    label="Stock"
                    v1={p1.quantity > 0 ? 'In Stock' : 'Out'}
                    v2={p2.quantity > 0 ? 'In Stock' : 'Out'}
                />
                {/* Add more specs here if product object has them (e.g. RAM, Storage) */}
            </div>

            <Link
                href={compareUrl}
                className={`block w-full text-center bg-gray-900 hover:bg-black text-white font-bold py-3 rounded-xl transition-all text-xs ${activeList.length < 2 ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
                Full Comparison ({activeList.length})
            </Link>
        </div>
    );
};

export default CompareWidget;
