'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { X, Loader2, RotateCcw, ArrowLeft, Star, Smartphone, Plus } from 'lucide-react';
import RemoteServices from '../api/remoteservice';
import { ProductDetails } from '../types/ProductDetailsTypes';
import { toast } from 'sonner';
import CompareSearchComponent from './CompareSearchComponent';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';


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

    // Sync URL -> Context on Mount (and when URL changes externally)
    useEffect(() => {
        const fetchProducts = async () => {
            // Strategy: URL is source of truth for "Shared/Initial Load". 

            if (initialSlugs.length === 0) {
                // If URL is empty, we rely on Context (persistence).
                setLoading(false);
                return;
            }

            // Sync check: verify if current context matches URL
            // We do NOT depend on compareList in dependency array to avoid loop when removing items
            // But we need to check if we have the items already.

            // Note: In a real app, we might use a ref to access current compareList without triggering effect,
            // or just fetch based on URL regardless, relying on caching.
            // Here, we'll fetch missing items.

            setLoading(true);
            try {
                // Fetch all slugs in URL
                const fetched = await Promise.all(
                    initialSlugs.map(async (slug) => {
                        // Optimisation: check if in context (we can't easily validly check stale context here without deps, 
                        // so we accept a potential re-fetch or rely on service caching)
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

    // Define spec groups using a consistent structure
    const specSections = [
        {
            title: 'General',
            rows: [
                { label: 'Date', render: (p: ProductDetails) => 'Sept 2025' },
                { label: 'Market Status', render: (p: ProductDetails) => p.quantity > 0 ? <span className="text-emerald-600 font-medium">In Stock</span> : <span className="text-red-500 font-medium">Out of Stock</span> },
            ]
        },
        {
            title: 'Type',
            rows: [
                { label: 'Brand', render: (p: ProductDetails) => p.brand?.name || '-' },
                { label: 'Device Type', render: (p: ProductDetails) => p.categories?.[0]?.title || 'Smartphone' },
            ]
        },
        {
            title: 'Body',
            rows: [
                { label: 'Dimension', render: (p: ProductDetails) => '160 x 75 x 8 mm' },
                { label: 'Weight', render: (p: ProductDetails) => '180 g' },
                { label: 'Colors', render: (p: ProductDetails) => p.variants?.map(v => v.attributes?.Color).filter(Boolean).join(', ') || '-' },
            ]
        },
        {
            title: 'Display',
            rows: [
                { label: 'Size', render: (p: ProductDetails) => '6.7 inches' },
                { label: 'Type', render: (p: ProductDetails) => 'AMOLED, 120Hz' },
                { label: 'Resolution', render: (p: ProductDetails) => '1440 x 3200 pixels' },
            ]
        },
        {
            title: 'Platform',
            rows: [
                { label: 'OS', render: (p: ProductDetails) => 'Android 15 / iOS 19' },
                { label: 'Chipset', render: (p: ProductDetails) => 'Snapdragon 8 Gen 4 / A19 Pro' },
                { label: 'CPU', render: (p: ProductDetails) => 'Octa-core' },
            ]
        },
        {
            title: 'Memory',
            rows: [
                { label: 'Card slot', render: (p: ProductDetails) => 'No' },
                { label: 'Internal', render: (p: ProductDetails) => '256GB 12GB RAM' },
            ]
        },
        {
            title: 'Camera',
            rows: [
                { label: 'Main', render: (p: ProductDetails) => '200 MP, f/1.7' },
                { label: 'Selfie', render: (p: ProductDetails) => '32 MP, f/2.2' },
                { label: 'Video', render: (p: ProductDetails) => '8K@30fps, 4K@60fps' },
            ]
        }
    ];

    const maxSlots = 4;
    const showAddSlot = compareList.length < maxSlots;

    if (loading && compareList.length === 0 && initialSlugs.length > 0) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center gap-3 bg-gray-50 text-gray-900">
                <Loader2 className="w-10 h-10 animate-spin text-[var(--colour-fsP2)]" />
                <p className="text-gray-500 font-medium">Loading comparison...</p>
            </div>
        );
    }

    // Empty State
    if (compareList.length === 0 && !loading) {
        return (
            <div className="min-h-screen bg-gray-50 text-gray-900 pb-20 pt-10">
                <div className="container mx-auto px-4 max-w-4xl">
                    <div className="text-center mb-10">
                        <h1 className="text-4xl font-bold mb-4 text-gray-900">Compare Products</h1>
                        <p className="text-gray-500">Search and add products to compare specs, prices, and features side-by-side.</p>
                    </div>

                    <div className="max-w-md mx-auto">
                        <CompareSearchComponent
                            onSelect={handleAddProduct}
                            excludeSlugs={[]}
                        />
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-50 text-gray-600 font-sans pb-20">
            <div className="container mx-auto px-4 max-w-[1400px]">
                {/* Header Actions */}
                <div className="py-6 flex flex-wrap items-center justify-between gap-4 border-b border-gray-200 mb-6 sticky top-0 bg-gray-50/95 backdrop-blur z-20">
                    <div className="flex items-center gap-4">
                        <Link href="/" className="p-2 rounded-full bg-white border border-gray-200 hover:bg-gray-100 transition-colors text-gray-600">
                            <ArrowLeft className="w-5 h-5" />
                        </Link>
                        <div>
                            <h1 className="text-xl font-bold text-gray-900">Compare Devices</h1>
                            <p className="text-xs text-gray-500">
                                {compareList.length} Product{compareList.length !== 1 ? 's' : ''} Selected
                            </p>
                        </div>
                    </div>

                    <div className="flex gap-3">
                        {compareList.length > 0 && (
                            <Button
                                variant="ghost"
                                onClick={handleClearAll}
                                className="text-red-500 hover:text-red-600 hover:bg-red-50"
                            >
                                <RotateCcw className="w-4 h-4 mr-2" />
                                Clear
                            </Button>
                        )}
                    </div>
                </div>

                {/* Comparison Grid */}
                <div className="overflow-x-auto pb-10 custom-scrollbar">
                    <div className="min-w-[800px]">

                        {/* 1. Product Headers */}
                        <div className="grid grid-cols-[200px_repeat(4,_1fr)] gap-0">
                            {/* Empty Corner */}
                            <div className="p-4 flex items-end pb-6 border-b border-gray-200">
                                <span className="font-bold text-lg text-gray-800">Specs</span>
                            </div>

                            {/* Product Columns */}
                            {[0, 1, 2, 3].map((idx) => {
                                const product = compareList[idx];
                                if (!product) {
                                    return (
                                        <div key={`empty-${idx}`} className="p-6 border-b border-gray-200 border-l border-gray-200 bg-white/50">
                                            <div className="h-full flex flex-col items-center justify-center border-2 border-dashed border-gray-200 rounded-xl p-4 hover:border-[var(--colour-fsP2)]/50 hover:bg-[var(--colour-fsP2)]/5 transition-all group cursor-pointer"
                                            >
                                                <CompareSearchComponent
                                                    onSelect={handleAddProduct}
                                                    excludeSlugs={compareList.map(p => p.slug)}
                                                    compact
                                                />
                                            </div>
                                        </div>
                                    );
                                }

                                return (
                                    <div key={product.id} className="relative p-6 border-b border-gray-200 border-l border-gray-200 bg-white group hover:shadow-lg transition-shadow duration-300 z-10">
                                        {/* Remove Button */}
                                        <button
                                            onClick={() => removeFromCompare(product.id)}
                                            className="absolute top-4 right-4 p-1.5 rounded-full bg-gray-100 text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors opacity-0 group-hover:opacity-100"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>

                                        <div className="flex flex-col items-center text-center space-y-4">
                                            <div className="relative w-40 h-40">
                                                <Image
                                                    src={product.image?.full || '/placeholder.png'}
                                                    alt={product.name}
                                                    fill
                                                    className="object-contain drop-shadow-sm p-2"
                                                />
                                            </div>

                                            <div className="space-y-1 w-full">
                                                <Link href={`/products/${product.slug}`} className="text-lg font-bold text-gray-900 hover:text-[var(--colour-fsP2)] transition-colors line-clamp-2 min-h-[3.5rem] flex items-center justify-center">
                                                    {product.name}
                                                </Link>

                                                <div className="flex items-center justify-center gap-1">
                                                    <div className="flex text-amber-400">
                                                        {[...Array(5)].map((_, i) => (
                                                            <Star key={i} className={cn("w-3.5 h-3.5 fill-current", i >= (product.average_rating || 4) && "text-gray-200 fill-gray-200")} />
                                                        ))}
                                                    </div>
                                                    <span className="text-xs text-gray-400 font-medium">(4.5)</span>
                                                </div>
                                            </div>

                                            <div className="text-xl font-bold text-[var(--colour-fsP2)]">
                                                Rs. {product.discounted_price?.toLocaleString()}
                                            </div>

                                            <Link
                                                href={`/products/${product.slug}`}
                                                className="w-full py-2.5 rounded-lg bg-[var(--colour-fsP2)] hover:bg-[var(--colour-fsP2)]/90 text-white font-bold text-sm transition-all shadow-md shadow-[var(--colour-fsP2)]/20"
                                            >
                                                Buy Now
                                            </Link>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* 2. Specs Rows */}
                        <div className="flex flex-col">
                            {specSections.map((section, secIdx) => (
                                <div key={section.title} className="contents">
                                    {/* Section Header */}
                                    <div className="sticky top-[89px] bg-gray-50/95 backdrop-blur z-10 border-y border-gray-200 py-3 px-4 font-bold text-[var(--colour-fsP2)] uppercase tracking-wider text-xs md:text-sm mt-8 mb-0">
                                        {section.title}
                                    </div>

                                    {/* Rows */}
                                    {section.rows.map((row, rowIdx) => (
                                        <div key={row.label} className="grid grid-cols-[200px_repeat(4,_1fr)] gap-0 hover:bg-white transition-colors group">
                                            {/* Label */}
                                            <div className="p-4 text-sm font-medium text-gray-500 border-b border-gray-200/60 flex items-center bg-gray-50/50">
                                                {row.label}
                                            </div>

                                            {/* Values */}
                                            {[0, 1, 2, 3].map((colIdx) => {
                                                const product = compareList[colIdx];
                                                return (
                                                    <div key={`val-${secIdx}-${rowIdx}-${colIdx}`} className="p-4 text-sm text-gray-700 border-b border-l border-gray-200/60 flex items-center bg-white/50 group-hover:bg-white transition-colors">
                                                        {product ? row.render(product) : <span className="text-gray-300">-</span>}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    ))}
                                </div>
                            ))}
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
}

export default function CompareClient() {
    return (
        <Suspense fallback={null}>
            <CompareContent />
        </Suspense>
    );
}

