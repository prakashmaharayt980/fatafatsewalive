'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { X, Loader2, RotateCcw, ChevronRight, Smartphone } from 'lucide-react';
import type { ProductDetails } from '../types/ProductDetailsTypes';
import { toast } from 'sonner';
import CompareSearchComponent from './CompareSearchComponent';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import CustomIconImg from "@/app/CommonVue/CustomIconImg";
import { getProductBySlug } from '../api/services/product.service';
import { useCartStore } from '../context/CartContext';
import { useShallow } from 'zustand/react/shallow';

function CompareContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { compareList, setCompareList, removeFromCompare, clearCompare } = useCartStore(useShallow((state) => ({
        compareList: state.compareItems,
        setCompareList: state.setCompareItems,
        removeFromCompare: state.removeFromCompare,
        clearCompare: state.clearCompare
    })));

    const slugsString = searchParams.get('slugs') ?? '';
    const initialSlugs = slugsString ? slugsString.split(',').filter(Boolean) : [];

    const [loading, setLoading] = useState(true);

    const compareListRef = React.useRef(compareList);
    useEffect(() => {
        compareListRef.current = compareList;
    }, [compareList]);

    useEffect(() => {
        const fetchProducts = async () => {
            if (initialSlugs.length === 0) {
                setLoading(false);
                if (compareList.length > 0) setCompareList([]);
                return;
            }

            const currentList = compareListRef.current;
            const currentSlugs = currentList.map(p => p.slug);
            const isFullySynced =
                initialSlugs.length === currentSlugs.length &&
                initialSlugs.every(slug => currentSlugs.includes(slug));

            if (isFullySynced && currentList.length > 0) {
                setLoading(false);
                return;
            }

            setLoading(true);
            try {
                const fetched = await Promise.all(
                    initialSlugs.map(async (slug) => {
                        const existing = currentList.find(p => p.slug === slug);
                        if (existing) return existing;
                        try {
                            const product = await getProductBySlug(slug);
                            return product ?? null;
                        } catch {
                            return null;
                        }
                    })
                );
                setCompareList(fetched.filter((p): p is ProductDetails => !!p));
            } catch {
                toast.error("Failed to load comparison data.");
            } finally {
                setLoading(false);
            }
        };

        fetchProducts();
    }, [slugsString, setCompareList]);

    useEffect(() => {
        if (loading) return;
        const currentSlugs = compareList.map(p => p.slug).join(',');
        if (currentSlugs !== slugsString) {
            router.replace(currentSlugs ? `/compare?slugs=${currentSlugs}` : '/compare');
        }
    }, [compareList, loading, router, slugsString]);

    const handleAddProduct = (product: ProductDetails) => {
        if (compareList.some(p => p.id === product.id)) return;
        if (compareList.length >= 3) {
            toast.error("Max 3 products");
            return;
        }
        setCompareList([...compareList, product]);
    };

    if (loading && initialSlugs.length > 0) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center gap-3">
                <Loader2 className="w-8 h-8 animate-spin text-(--colour-fsP2)" />
                <p className="text-gray-500 text-sm">Loading comparison...</p>
            </div>
        );
    }

    return (
        <main className="min-h-screen bg-white text-gray-800 pb-20">
            <div className="container mx-auto px-4 max-w-6xl">

                {/* Header */}
                <div className="py-4 flex items-center justify-between gap-4 border-b border-gray-100 mb-6">
                    <nav className="flex items-center gap-1.5 text-sm">
                        <Link href="/" className="text-(--colour-fsP2) hover:underline font-medium">Home</Link>
                        <ChevronRight className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-700 font-semibold">Compare</span>
                    </nav>
                    {compareList.length > 0 && (
                        <Button
                            variant="outline"
                            onClick={() => clearCompare()}
                            className="text-red-500 border-red-200 hover:bg-red-50 h-8 text-xs font-medium px-3"
                        >
                            <RotateCcw className="w-3.5 h-3.5 mr-1.5" />
                            Clear All
                        </Button>
                    )}
                </div>

                {/* Compare Table */}
                <section className="overflow-x-auto pb-6">
                    <div className="w-full">

                        {/* Product Headers */}
                        <div className="grid grid-cols-[160px_repeat(3,minmax(180px,1fr))] border border-gray-200 rounded-lg overflow-hidden">
                            <div className="p-4 bg-gray-50 border-r border-gray-200 flex items-end pb-4">
                                <span className="text-sm font-semibold text-gray-600">Product</span>
                            </div>

                            {[0, 1, 2].map((idx) => {
                                const product = compareList[idx];
                                if (!product) {
                                    return (
                                        <div key={`empty-${idx}`} className="p-4 border-r border-gray-200 last:border-r-0 bg-white">
                                            <CompareSearchComponent
                                                onSelect={handleAddProduct}
                                                excludeSlugs={compareList.map(p => p.slug)}
                                                compact
                                            />
                                        </div>
                                    );
                                }
                                return (
                                    <article key={product.id} className="relative p-4 border-r border-gray-200 last:border-r-0 bg-white group">
                                        <button
                                            onClick={() => removeFromCompare(product.id)}
                                            aria-label={`Remove ${product.name}`}
                                            className="absolute top-2 right-2 p-1 rounded text-gray-400 hover:text-red-500 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            <X className="w-3.5 h-3.5" />
                                        </button>
                                        <div className="flex flex-col items-center text-center gap-3">
                                            <div className="relative w-full h-36 bg-gray-50 rounded border border-gray-100">
                                                <Image
                                                    src={(product as any).thumb?.url ?? (product as any).image?.full ?? '/placeholder.png'}
                                                    alt={product.name}
                                                    fill
                                                    sizes="(max-width: 768px) 100vw, 25vw"
                                                    className="object-contain p-2"
                                                />
                                            </div>
                                            <div className="w-full space-y-2">
                                                <h3 className="text-[13px] font-semibold text-gray-800 line-clamp-2 leading-snug">
                                                    <Link href={`/product-details/${product.slug}`} className="hover:text-(--colour-fsP2)">
                                                        {product.name}
                                                    </Link>
                                                </h3>
                                                <Link
                                                    href={`/product-details/${product.slug}`}
                                                    className="block w-full py-1.5 border border-gray-200 text-(--colour-fsP2) text-xs font-medium rounded hover:bg-gray-50 transition-colors"
                                                >
                                                    View Details
                                                </Link>
                                            </div>
                                        </div>
                                    </article>
                                );
                            })}
                        </div>

                        {/* Technical Specifications */}
                        {compareList.length > 0 && (() => {
                            const allKeys = new Set<string>();
                            compareList.forEach(product => {
                                if ((product as any).attributes) {
                                    Object.keys((product as any).attributes).forEach(key => allKeys.add(key));
                                }
                            });

                            const keysArray = Array.from(allKeys).sort();

                            if (keysArray.length === 0) {
                                return (
                                    <div className="border border-t-0 border-gray-200 rounded-b-lg p-6 text-center text-gray-400 text-sm">
                                        No specifications available for these products.
                                    </div>
                                );
                            }

                            return (
                                <div className="border border-t-0 border-gray-200 rounded-b-lg overflow-hidden mt-px">
                     

                                    {keysArray.map((key) => {
                                        const vals = [0, 1, 2].map(i =>
                                            (compareList[i] as any)?.attributes?.[key]?.trim().toLowerCase() ?? ''
                                        );
                                        const present = vals.filter(v => !!v && v !== '-');
                                        const unique = new Set(present);
                                        const isAllSame = present.length >= 2 && unique.size === 1;

                                        return (
                                            <div key={key} className="grid grid-cols-[160px_repeat(3,minmax(180px,1fr))] border-b border-gray-100 last:border-b-0">
                                                <div className="px-3 py-3 bg-gray-50 border-r border-gray-100 flex items-center gap-1.5">
                                                    <CustomIconImg iconKey={key} size={16} className="text-(--colour-fsP2) shrink-0" color="currentColor" />
                                                    <span className="text-[11px] font-bold text-(--colour-fsP2) uppercase tracking-wide">{key}</span>
                                                </div>
                                                {[0, 1, 2].map((colIdx) => {
                                                    const product = compareList[colIdx];
                                                    const value = (product as any)?.attributes?.[key];
                                                    const v = vals[colIdx];
                                                    const isDualMatch = !isAllSame && !!v && v !== '-' && vals.filter(x => x === v).length === 2;

                                                    return (
                                                        <div
                                                            key={colIdx}
                                                            className={cn(
                                                                "px-4 py-3 text-sm border-r border-gray-100 last:border-r-0 leading-snug",
                                                                isAllSame ? "text-gray-400" :
                                                                isDualMatch ? "text-(--colour-fsP2) font-medium" :
                                                                "text-gray-800"
                                                            )}
                                                        >
                                                            {product ? (value ?? <span className="text-gray-300">—</span>) : <span className="text-gray-300">—</span>}
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        );
                                    })}
                                </div>
                            );
                        })()}
                    </div>
                </section>
            </div>
        </main>
    );
}

export default function CompareClient() {
    return (
        <Suspense fallback={null}>
            <CompareContent />
        </Suspense>
    );
}
