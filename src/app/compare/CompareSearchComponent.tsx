'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Search, Plus, Loader2, X, ChevronRight, Smartphone } from 'lucide-react';
import RemoteServices from '../api/remoteservice';
import Image from 'next/image';
import { ProductDetails } from '../types/ProductDetailsTypes';
import { cn } from '@/lib/utils';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";

// Simple debounce hook
function useDebounceValue<T>(value: T, delay: number): T {
    const [debouncedValue, setDebouncedValue] = useState(value);
    useEffect(() => {
        const handler = setTimeout(() => setDebouncedValue(value), delay);
        return () => clearTimeout(handler);
    }, [value, delay]);
    return debouncedValue;
}

interface CompareSearchComponentProps {
    onSelect: (product: ProductDetails) => void;
    excludeSlugs: string[];
    compact?: boolean;
}

export default function CompareSearchComponent({ onSelect, excludeSlugs, compact = false }: CompareSearchComponentProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<ProductDetails[]>([]);
    const [loading, setLoading] = useState(false);
    const debouncedQuery = useDebounceValue(query, 500);

    // Fetch products on query change
    useEffect(() => {
        const fetchProducts = async () => {
            if (!debouncedQuery.trim()) {
                setResults([]);
                return;
            }

            setLoading(true);
            try {
                const res = await RemoteServices.searchProducts({ search: debouncedQuery });
                const products = res.data || res || [];
                setResults(products);
            } catch (error) {
                console.error("Search failed", error);
                setResults([]);
            } finally {
                setLoading(false);
            }
        };

        fetchProducts();
    }, [debouncedQuery]);

    const handleSelect = (product: ProductDetails) => {
        onSelect(product);
        setIsOpen(false);
        setQuery('');
        setResults([]);
    };

    const filteredResults = results.filter(p => !excludeSlugs.includes(p.slug));

    return (
        <>
            {/* Trigger Button - Clean Design like EmiProduct */}
            <button
                onClick={() => setIsOpen(true)}
                className={cn(
                    "w-full flex items-center justify-center group cursor-pointer relative overflow-hidden transition-all duration-300",
                    compact
                        ? "h-full min-h-[350px] flex-col rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50/50 hover:bg-[var(--colour-fsP2)]/5 hover:border-[var(--colour-fsP2)]/50 p-6"
                        : "h-[300px] flex-col rounded-2xl bg-gray-900 border border-gray-800"
                )}
            >
                <div className="relative z-10 flex flex-col items-center text-center">
                    <div className={cn(
                        "rounded-full flex items-center justify-center mb-4 transition-all duration-300",
                        compact
                            ? "w-14 h-14 bg-white shadow-sm border border-gray-100 group-hover:bg-[var(--colour-fsP2)] group-hover:border-[var(--colour-fsP2)]"
                            : "w-16 h-16 bg-gray-800 group-hover:bg-[var(--colour-fsP2)] shadow-black/20"
                    )}>
                        <Plus className={cn(
                            "transition-colors",
                            compact ? "w-6 h-6 text-gray-400 group-hover:text-white" : "w-8 h-8 text-gray-400 group-hover:text-white"
                        )} />
                    </div>
                    <p className={cn(
                        "font-bold transition-colors mb-1",
                        compact ? "text-base text-gray-600 group-hover:text-[var(--colour-fsP2)] font-semibold" : "text-lg text-gray-200 group-hover:text-white"
                    )}>
                        Add to Compare
                    </p>
                    <p className={cn(
                        "text-sm transition-colors mt-1 max-w-[150px]",
                        compact ? "text-gray-400" : "text-gray-500 group-hover:text-gray-400"
                    )}>
                        {compact ? "Select a product" : "Select another product"}
                    </p>
                </div>
            </button>

            {/* Search Drawer/Dialog */}
            <Drawer open={isOpen} onOpenChange={setIsOpen}>
                <DrawerContent className="h-[85vh] sm:h-[75vh] max-w-3xl mx-auto p-0 rounded-t-3xl bg-white flex flex-col shadow-2xl border-x border-t border-gray-200">
                    {/* Header */}
                    <DrawerHeader className="px-6 border-b border-gray-100 py-4 bg-white sticky top-0 z-10 rounded-t-3xl">
                        <DrawerTitle className="text-xl font-bold text-gray-800 flex items-center gap-2">
                            <Search className="w-5 h-5 text-[var(--colour-fsP2)]" />
                            Search Products
                        </DrawerTitle>
                    </DrawerHeader>

                    <div className="flex-1 flex flex-col px-6 py-4 gap-4 overflow-hidden bg-gray-50/30">
                        {/* Search Input */}
                        <div className="sticky top-0 z-10 bg-gray-50/30 pb-2">
                            <div className={cn(
                                "flex items-center rounded-xl bg-white shadow-sm transition-all border border-gray-200",
                                "focus-within:border-[var(--colour-fsP2)] focus-within:ring-4 focus-within:ring-[var(--colour-fsP2)]/10"
                            )}>
                                <Search className="ml-4 w-4 h-4 text-gray-400" />
                                <input
                                    type="text"
                                    value={query}
                                    onChange={(e) => setQuery(e.target.value)}
                                    placeholder="Type to search products..."
                                    className="w-full px-3 py-2.5 bg-transparent border-none focus:outline-none text-sm font-medium text-gray-900 placeholder-gray-400"
                                    autoFocus
                                />
                                {query && (
                                    <button
                                        onClick={() => { setQuery(""); setResults([]); }}
                                        className="mr-2 p-1 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors text-gray-500"
                                    >
                                        <X className="w-3.5 h-3.5" />
                                    </button>
                                )}
                                {loading && <Loader2 className="mr-3 h-4 w-4 text-[var(--colour-fsP2)] animate-spin" />}
                            </div>
                        </div>

                        {/* Results List */}
                        <div className="flex-1 overflow-y-auto custom-scrollbar overflow-x-hidden pr-2">
                            {filteredResults.length > 0 ? (
                                <div className="space-y-1.5 pb-4">
                                    {filteredResults.map(product => (
                                        <button
                                            key={product.id}
                                            onClick={() => handleSelect(product)}
                                            className="w-full text-left p-2 bg-white hover:bg-[var(--colour-fsP2)]/5 border border-transparent hover:border-[var(--colour-fsP2)]/20 rounded-xl flex items-center gap-3 transition-all duration-200 group cursor-pointer"
                                        >
                                            <div className="relative w-12 h-12 bg-gray-50/50 rounded-lg overflow-hidden flex-shrink-0 border border-gray-100">
                                                {product.image?.full || product.image?.thumb ? (
                                                    <Image
                                                        src={product.image.full || product.image.thumb || '/placeholder.png'}
                                                        alt={product.name}
                                                        fill
                                                        className="object-contain p-1.5 group-hover:scale-105 transition-transform duration-300"
                                                    />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-gray-300">
                                                        <Smartphone className="w-5 h-5" />
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h3 className="font-semibold text-gray-900 truncate group-hover:text-[var(--colour-fsP2)] transition-colors">
                                                    {product.name}
                                                </h3>
                                                <div className="flex items-baseline gap-2 mt-0.5">
                                                    <span className="text-sm font-bold text-[var(--colour-fsP2)]">
                                                        Rs. {product.discounted_price?.toLocaleString()}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="flex-shrink-0 p-2 text-gray-300 group-hover:text-[var(--colour-fsP2)] transition-colors">
                                                <ChevronRight className="w-5 h-5" />
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            ) : (
                                <div className="h-full flex flex-col items-center justify-center text-gray-400 opacity-80 min-h-[300px]">
                                    {query ? (
                                        <>
                                            <Search className="w-12 h-12 mb-3 stroke-1 text-gray-300" />
                                            <p className="text-lg font-medium text-gray-600">No products found</p>
                                        </>
                                    ) : (
                                        <>
                                            <Smartphone className="w-16 h-16 mb-4 stroke-1 text-[var(--colour-fsP2)]/30" />
                                            <p className="text-lg font-medium text-gray-600">Start searching to add products</p>
                                        </>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </DrawerContent>
            </Drawer>
        </>
    );
}
