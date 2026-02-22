'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { X, Loader2, RotateCcw, ArrowLeft, Star, Smartphone, Plus, ChevronRight } from 'lucide-react';
import RemoteServices from '../api/remoteservice';
import { ProductDetails } from '../types/ProductDetailsTypes';
import { toast } from 'sonner';
import CompareSearchComponent from './CompareSearchComponent';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import CustomIconImg from "@/app/CommonVue/CustomIconImg";


import { useCompare } from '../context/CompareContext';
// ... existing imports

function CompareContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { compareList, setCompareList, removeFromCompare, clearCompare } = useCompare();

    // Use slugs instead of IDs for SEO-friendly URLs
    const slugsString = searchParams.get('slugs') || '';
    const initialSlugs = slugsString ? slugsString.split(',').filter(Boolean) : [];

    const [loading, setLoading] = useState(true);

    const compareListRef = React.useRef(compareList);
    useEffect(() => {
        compareListRef.current = compareList;
    }, [compareList]);

    // Sync URL -> Context on Mount (and when URL changes externally)
    useEffect(() => {
        const fetchProducts = async () => {
            // Strategy: URL is source of truth for "Shared/Initial Load". 

            if (initialSlugs.length === 0) {
                // If URL is empty, ensure the context is cleared and loading stops
                setLoading(false);
                if (compareList.length > 0) {
                    setCompareList([]);
                }
                return;
            }

            // Sync check: verify if current context matches URL
            // Using a ref avoids infinite loops while checking latest state.
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
                // Fetch all slugs in URL
                const fetched = await Promise.all(
                    initialSlugs.map(async (slug) => {
                        // Optimisation: check if already in list
                        const existing = currentList.find(p => p.slug === slug);
                        if (existing) return existing;

                        try {
                            const product = await RemoteServices.getProductBySlug(slug);
                            return product || null;
                        } catch (e) {
                            console.error(`Failed to load product with slug: ${slug}`, e);
                            return null;
                        }
                    })
                );

                const validProducts = fetched.filter((p): p is ProductDetails => !!p);
                // Only update if different to avoid unused updates
                // We use a functional update or just set it. 
                // To avoid loop, we rely on the fact that if this updates context, 
                // the OTHER effect will see URL matches context and do nothing.
                setCompareList(validProducts);
            } catch (error) {
                toast.error("Failed to load comparison data.");
            } finally {
                setLoading(false);
            }
        };

        fetchProducts();

        // Only run when slugsString changes. 
        // We explicitly omit compareList from deps to prevent re-running when user removes an item.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [slugsString, setCompareList]);

    // Sync Context -> URL (When user adds/removes via UI)
    useEffect(() => {
        if (loading) return;

        const currentSlugs = compareList.map(p => p.slug).join(',');
        if (currentSlugs !== slugsString) {
            const newPath = currentSlugs ? `/compare?slugs=${currentSlugs}` : '/compare';
            router.replace(newPath);
        }
    }, [compareList, loading, router, slugsString]);


    const handleAddProduct = (product: ProductDetails) => {
        const isIn = compareList.some(p => p.id === product.id);
        if (!isIn) {
            if (compareList.length >= 4) {
                toast.error("Max 4 products");
                return;
            }
            setCompareList([...compareList, product]);
        }
    };

    const handleClearAll = () => {
        clearCompare();
    };

    // The static specSections have been removed in favor of dynamic attributes mapping from product_attributes

    if (loading && initialSlugs.length > 0) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center gap-3 bg-gray-50 text-gray-900">
                <Loader2 className="w-10 h-10 animate-spin text-[var(--colour-fsP2)]" />
                <p className="text-gray-500 font-medium">Loading comparison...</p>
            </div>
        );
    }

    return (
        <main className="min-h-screen bg-white text-gray-800 font-sans pb-20">
            <div className="container mx-auto px-4 max-w-7xl">
                {/* Header Actions & Breadcrumb */}
                <div className="py-4 flex flex-wrap items-center justify-between gap-4 mb-4 bg-white z-20">
                    <nav className="flex items-center gap-1.5 text-sm overflow-x-auto pb-1 scrollbar-hide">
                        <Link href="/" className="text-[var(--colour-fsP2)] hover:text-[var(--colour-fsP1)] whitespace-nowrap font-medium transition-colors">Home</Link>
                        <ChevronRight className="w-4 h-4 text-gray-400 flex-shrink-0" />
                        <span className="text-gray-800 font-semibold truncate max-w-[180px] sm:max-w-[300px]">Compare</span>
                    </nav>

                    <div className="flex gap-3">
                        {compareList.length > 0 && (
                            <Button
                                variant="outline"
                                onClick={handleClearAll}
                                className="text-red-500 border-red-100 hover:bg-red-50 hover:border-red-200 hover:text-red-600 transition-colors h-8 text-xs font-semibold px-3"
                            >
                                <RotateCcw className="w-3.5 h-3.5 mr-1.5" />
                                Clear Comparison
                            </Button>
                        )}
                    </div>
                </div>

                {/* Comparison Grid */}
                <section aria-labelledby="compare-grid-heading" className="overflow-x-auto pb-6 custom-scrollbar">
                    <h2 id="compare-grid-heading" className="sr-only">Product Comparison</h2>
                    <div className="min-w-[800px] lg:min-w-0">

                        {/* 1. Product Headers */}
                        <div className="grid grid-cols-[150px_repeat(3,_minmax(200px,_1fr))] md:grid-cols-[180px_repeat(3,_1fr)] gap-0 border-t border-gray-200">
                            {/* Empty Corner */}
                            <div className="p-4 flex items-end pb-4 border-b border-gray-200 bg-gray-50">
                                <span className="font-semibold text-lg text-gray-700 flex items-center">
                                    <CustomIconImg iconKey="smartphone" size={20} className="text-[var(--colour-fsP2)] mr-2" color="currentColor" />
                                    Overview
                                </span>
                            </div>

                            {/* Product Columns */}
                            {[0, 1, 2].map((idx) => {
                                const product = compareList[idx];
                                if (!product) {
                                    return (
                                        <div key={`empty-${idx}`} className="p-6 border-b border-l border-gray-100 bg-white">
                                            <CompareSearchComponent
                                                onSelect={handleAddProduct}
                                                excludeSlugs={compareList.map(p => p.slug)}
                                                compact
                                            />
                                        </div>
                                    );
                                }

                                return (
                                    <article key={product.id} className="relative p-6 border-b border-l border-gray-100 bg-white flex flex-col justify-between group">
                                        {/* Remove Button */}
                                        <button
                                            onClick={() => removeFromCompare(product.id)}
                                            aria-label={`Remove ${product.name} from comparison`}
                                            className="absolute top-3 right-3 p-1.5 rounded-full text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors bg-white shadow-sm border border-gray-100 opacity-0 group-hover:opacity-100 z-10"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>

                                        <div className="flex flex-col items-start text-left space-y-4 h-full">
                                            {/* Image Container */}
                                            <div className="relative w-full h-40 flex items-center justify-center bg-gray-50/50 rounded-xl border border-gray-100 p-2">
                                                <Image
                                                    src={product.image?.full || '/placeholder.png'}
                                                    alt={`Image of ${product.name}`}
                                                    fill
                                                    className="object-contain"
                                                />
                                            </div>

                                            <div className="space-y-2 w-full flex-grow flex flex-col justify-start">
                                                <h3 className="text-[15px] font-bold text-gray-800 line-clamp-2 leading-snug">
                                                    <Link href={`/products/${product.slug}`} className="hover:text-blue-600 transition-colors">
                                                        {product.name}
                                                    </Link>
                                                </h3>

                                                <div className="flex items-center justify-start gap-1.5 mt-1">
                                                    <div className="flex text-amber-500" aria-label={`Rating: ${product.average_rating || 4.5} out of 5`}>
                                                        {[...Array(5)].map((_, i) => (
                                                            <Star key={i} className={cn("w-3.5 h-3.5 fill-current", i >= (product.average_rating || 4) && "text-gray-200 fill-gray-200")} />
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="w-full pt-4 mt-auto">
                                                <Link
                                                    href={`/products/${product.slug}`}
                                                    className="w-full py-2 rounded-full border border-gray-200 text-blue-600 hover:bg-blue-50 font-semibold text-sm transition-colors text-center flex items-center justify-center"
                                                >
                                                    View Full
                                                </Link>
                                            </div>
                                        </div>
                                    </article>
                                );
                            })}
                        </div>

                        {/* Best For Row (Mock Data) */}
                        <div className="grid grid-cols-[150px_repeat(3,_minmax(200px,_1fr))] md:grid-cols-[180px_repeat(3,_1fr)] gap-0 border-b border-gray-100">
                            <div className="p-4 text-[13px] font-bold text-gray-700 bg-gray-50 flex items-center border-r border-gray-100">
                                <Star className="w-4 h-4 text-[var(--colour-fsP2)] mr-2" />
                                Best For
                            </div>
                            {[0, 1, 2].map((colIdx) => {
                                const product = compareList[colIdx];
                                if (!product) return <div key={`best-for-empty-${colIdx}`} className="p-4 border-l border-gray-100 bg-white" />;

                                // Mock data based on index
                                const mockBadges = [
                                    ['Student', 'Content Creator'],
                                    ['Office', 'Business'],
                                    ['Gaming', 'Developer']
                                ][colIdx % 3];

                                return (
                                    <div key={`best-for-${colIdx}`} className="p-4 border-l border-gray-100 bg-white flex flex-wrap gap-2 items-start justify-start content-start">
                                        {mockBadges.map(badge => (
                                            <span key={badge} className="px-2.5 py-1 bg-gray-50 text-gray-700 border border-gray-200 rounded-lg text-[11px] font-bold uppercase tracking-wider">
                                                {badge}
                                            </span>
                                        ))}
                                    </div>
                                );
                            })}
                        </div>

                        {/* Available With Fatafatsewa Row */}
                        <div className="grid grid-cols-[150px_repeat(3,_minmax(200px,_1fr))] md:grid-cols-[180px_repeat(3,_1fr)] gap-0 border-b border-gray-200">
                            <div className="p-4 text-[13px] font-bold text-gray-700 bg-gray-50 flex items-center border-r border-gray-100 leading-snug">
                                <RotateCcw className="w-4 h-4 text-[var(--colour-fsP2)] mr-2 shrink-0" />
                                Support & EMI
                            </div>
                            {[0, 1, 2].map((colIdx) => {
                                const product = compareList[colIdx];
                                if (!product) return <div key={`features-empty-${colIdx}`} className="p-4 border-l border-gray-100 bg-white" />;

                                const availableFeatures = [
                                    '0% EMI', 'Exchange', '1 Yr Insurance', 'Refer & Earn'
                                ];

                                return (
                                    <div key={`features-${colIdx}`} className="p-4 border-l border-gray-100 bg-white flex flex-wrap gap-2 items-start justify-start content-start">
                                        {availableFeatures.map(feature => (
                                            <span key={feature} className="px-2.5 py-1 bg-[var(--colour-fsP2)]/10 text-[var(--colour-fsP2)] rounded-lg text-[11px] font-bold uppercase tracking-wider">
                                                {feature}
                                            </span>
                                        ))}
                                    </div>
                                );
                            })}
                        </div>

                        {/* 2. Pros & Cons (Mock Data) */}
                        <div className="flex flex-col border-b-4 border-gray-100 mb-8 pt-4">
                            <div className="sticky top-[89px] bg-gray-50/95 backdrop-blur z-20 py-4 px-4 font-bold text-[var(--colour-fsP2)] uppercase tracking-wider text-xs md:text-sm mt-4 mb-2 flex items-center gap-2 border-y border-gray-100 shadow-sm">
                                <Plus className="w-4 h-4" /> User Insights
                            </div>

                            {/* Pros Row */}
                            <div className="grid grid-cols-[150px_repeat(3,_minmax(200px,_1fr))] md:grid-cols-[180px_repeat(3,_1fr)] gap-0 hover:bg-gray-50/50 transition-colors group">
                                <div className="p-4 text-sm font-bold text-emerald-600 border-b border-gray-100 flex items-center bg-gray-50/80">
                                    Why you should buy
                                </div>
                                {[0, 1, 2].map((colIdx) => {
                                    const product = compareList[colIdx];
                                    return (
                                        <div key={`pros-${colIdx}`} className="p-4 text-[14px] leading-relaxed text-gray-700 border-b border-l border-gray-100 flex items-center bg-white/30 group-hover:bg-white transition-colors">
                                            {product ? (
                                                <ul className="space-y-2 text-gray-600">
                                                    <li className="flex items-start gap-2">
                                                        <span className="text-emerald-500 mt-0.5 shrink-0">✓</span>
                                                        <span>Excellent build quality</span>
                                                    </li>
                                                    <li className="flex items-start gap-2">
                                                        <span className="text-emerald-500 mt-0.5 shrink-0">✓</span>
                                                        <span>Smooth performance</span>
                                                    </li>
                                                    <li className="flex items-start gap-2">
                                                        <span className="text-emerald-500 mt-0.5 shrink-0">✓</span>
                                                        <span>Great battery backup</span>
                                                    </li>
                                                    <li className="flex items-start gap-2">
                                                        <span className="text-emerald-500 mt-0.5 shrink-0">✓</span>
                                                        <span>Premium brand value</span>
                                                    </li>
                                                </ul>
                                            ) : <span className="text-gray-300 mx-auto">-</span>}
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Cons Row */}
                            <div className="grid grid-cols-[150px_repeat(3,_minmax(200px,_1fr))] md:grid-cols-[180px_repeat(3,_1fr)] gap-0 hover:bg-gray-50/50 transition-colors group rounded-b-xl overflow-hidden">
                                <div className="p-4 text-sm font-bold text-red-500 border-b border-gray-100 flex items-center bg-gray-50/80">
                                    Why you shouldn't buy
                                </div>
                                {[0, 1, 2].map((colIdx) => {
                                    const product = compareList[colIdx];
                                    return (
                                        <div key={`cons-${colIdx}`} className="p-4 text-[14px] leading-relaxed text-gray-700 border-b border-l border-gray-100 flex items-center bg-white/30 group-hover:bg-white transition-colors">
                                            {product ? (
                                                <ul className="space-y-2 text-gray-600">
                                                    <li className="flex items-start gap-2">
                                                        <span className="text-red-400 mt-0.5 shrink-0">×</span>
                                                        <span>Slightly expensive</span>
                                                    </li>
                                                    <li className="flex items-start gap-2">
                                                        <span className="text-red-400 mt-0.5 shrink-0">×</span>
                                                        <span>No charger in box</span>
                                                    </li>
                                                </ul>
                                            ) : <span className="text-gray-300 mx-auto">-</span>}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* 3. Specs Rows - Dynamically populated from APIs */}
                        <div className="flex flex-col">
                            {(() => {
                                // Extract all unique keys from all products' attributes to build a unified spec table
                                const allKeys = new Set<string>();
                                compareList.forEach(product => {
                                    if (product.attributes?.product_attributes) {
                                        Object.keys(product.attributes.product_attributes).forEach(key => allKeys.add(key));
                                    }
                                });

                                const keysArray = Array.from(allKeys).sort();

                                if (keysArray.length === 0) {
                                    return (
                                        <div className="p-8 text-center text-gray-500 font-medium">
                                            No explicit technical specifications available for these products.
                                        </div>
                                    );
                                }

                                return (
                                    <div className="contents">
                                        <div className="sticky top-[89px] bg-gray-50/95 backdrop-blur-xl z-20 border-y border-gray-100 shadow-sm py-4 px-4 font-bold text-[var(--colour-fsP2)] uppercase tracking-wider text-xs md:text-sm mt-4 mb-2 flex items-center gap-2">
                                            <Smartphone className="w-4 h-4" /> Technical Specifications
                                        </div>

                                        {keysArray.map((key, rowIdx) => {
                                            const val0 = compareList[0]?.attributes?.product_attributes?.[key]?.trim().toLowerCase();
                                            const val1 = compareList[1]?.attributes?.product_attributes?.[key]?.trim().toLowerCase();
                                            const val2 = compareList[2]?.attributes?.product_attributes?.[key]?.trim().toLowerCase();

                                            const isValid = (v: string | undefined) => v && v !== "" && v !== "-";

                                            let colClass = ["", "", ""];
                                            let textClass = ["text-gray-700", "text-gray-700", "text-gray-700"];

                                            if (isValid(val0) && val0 === val1 && val1 === val2) {
                                                textClass = ["text-[var(--colour-fsP2)] font-bold", "text-[var(--colour-fsP2)] font-bold", "text-[var(--colour-fsP2)] font-bold"];
                                            } else {
                                                if (isValid(val0) && val0 === val1) {
                                                    textClass[0] = "text-[var(--colour-fsP2)] font-semibold";
                                                    textClass[1] = "text-[var(--colour-fsP2)] font-semibold";
                                                } else if (isValid(val1) && val1 === val2) {
                                                    textClass[1] = "text-[var(--colour-fsP1)] font-semibold";
                                                    textClass[2] = "text-[var(--colour-fsP1)] font-semibold";
                                                } else if (isValid(val0) && val0 === val2) {
                                                    textClass[0] = "text-[var(--colour-fsP1)] font-semibold";
                                                    textClass[2] = "text-[var(--colour-fsP1)] font-semibold";
                                                }
                                            }

                                            return (
                                                <div key={key} className="grid grid-cols-[150px_repeat(3,_minmax(200px,_1fr))] md:grid-cols-[180px_repeat(3,_1fr)] gap-0 hover:bg-gray-50/50 transition-colors group">
                                                    {/* Label */}
                                                    <div className="p-4 text-sm font-bold text-gray-700 border-b border-gray-200 flex items-center bg-gray-50/80 capitalize">
                                                        <CustomIconImg iconKey={key} size={16} className="text-[var(--colour-fsP2)] mr-2 shrink-0" color="currentColor" />
                                                        {key}
                                                    </div>

                                                    {/* Values */}
                                                    {[0, 1, 2].map((colIdx) => {
                                                        const product = compareList[colIdx];
                                                        const value = product?.attributes?.product_attributes?.[key];

                                                        const highlightBg = colClass[colIdx] || "bg-white/30 group-hover:bg-white";
                                                        const highlightText = textClass[colIdx];

                                                        return (
                                                            <div key={`val-${rowIdx}-${colIdx}`} className={cn("p-4 text-[14px] leading-relaxed border-b border-l border-gray-100 flex items-center transition-colors whitespace-pre-wrap break-words", highlightBg, highlightText)}>
                                                                {product ? (value || <span className="text-gray-300 mx-auto">-</span>) : <span className="text-gray-300 mx-auto">-</span>}
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

                        {/* Freebies & Gifts Row */}
                        <div className="flex flex-col border-t-4 border-gray-100 mt-8 pt-4">
                            <div className="sticky top-[89px] bg-gray-50/95 backdrop-blur z-20 py-4 px-4 font-bold text-indigo-600 uppercase tracking-wider text-xs md:text-sm mt-4 mb-2 flex items-center gap-2 border-y border-gray-100 shadow-sm">
                                <Plus className="w-4 h-4" /> Freebies & Gifts
                            </div>

                            <div className="grid grid-cols-[150px_repeat(3,_minmax(200px,_1fr))] md:grid-cols-[180px_repeat(3,_1fr)] gap-0 border-b border-gray-100 group">
                                <div className="p-4 text-[13px] font-bold text-indigo-600 border-r border-gray-100 bg-gray-50 flex items-center leading-snug">
                                    Promotional Gifts
                                </div>
                                {[0, 1, 2].map((colIdx) => {
                                    const product = compareList[colIdx];
                                    if (!product) return <div key={`freebie-empty-${colIdx}`} className="p-4 border-l border-gray-100 bg-white" />;

                                    // Mock Freebies based on index (or fallback logic)
                                    const mockFreebies = [
                                        ['Smart Watch', 'TWS Earbuds'],
                                        ['Bluetooth Speaker'],
                                        [] // No freebies for the 3rd one to show empty state
                                    ][colIdx % 3];

                                    return (
                                        <div key={`freebies-${colIdx}`} className="p-4 border-l border-gray-100 bg-white flex flex-wrap gap-2 items-start justify-start content-start">
                                            {mockFreebies.length > 0 ? (
                                                mockFreebies.map(gift => (
                                                    <span key={gift} className="px-2.5 py-1 bg-indigo-50 border border-indigo-100 text-indigo-700 rounded-lg text-[11px] font-bold uppercase tracking-wider flex items-center gap-1.5">
                                                        <Plus className="w-3 h-3" /> {gift}
                                                    </span>
                                                ))
                                            ) : (
                                                <span className="text-gray-300 text-sm">-</span>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

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

