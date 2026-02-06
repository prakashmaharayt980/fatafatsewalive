'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Search, Plus, Loader2, X, ChevronRight, Smartphone } from 'lucide-react';
import RemoteServices from '../api/remoteservice';
import Image from 'next/image';
import { ProductDetails } from '../types/ProductDetailsTypes';
import { cn } from '@/lib/utils';

// Simple debounce hook
function useDebounceValue<T>(value: T, delay: number): T {
    const [debouncedValue, setDebouncedValue] = useState(value);
    useEffect(() => {
        const handler = setTimeout(() => setDebouncedValue(value), delay);
        return () => clearTimeout(handler);
    }, [value, delay]);
    return debouncedValue;
}

interface AddProductSearchProps {
    onSelect: (product: ProductDetails) => void;
    excludeSlugs: string[];
}

export default function AddProductSearch({ onSelect, excludeSlugs }: AddProductSearchProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<ProductDetails[]>([]);
    const [loading, setLoading] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);
    const debouncedQuery = useDebounceValue(query, 500);

    // Focus input when dialog opens
    useEffect(() => {
        if (isOpen && inputRef.current) {
            inputRef.current.focus();
        }
    }, [isOpen]);

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

    // Close on Escape key
    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape') setIsOpen(false);
        };
        if (isOpen) {
            document.addEventListener('keydown', handleEscape);
            document.body.style.overflow = 'hidden';
        }
        return () => {
            document.removeEventListener('keydown', handleEscape);
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    const handleSelect = (product: ProductDetails) => {
        onSelect(product);
        setIsOpen(false);
        setQuery('');
        setResults([]);
    };

    const handleClose = () => {
        setIsOpen(false);
        setQuery('');
        setResults([]);
    };

    const filteredResults = results.filter(p => !excludeSlugs.includes(p.slug));

    return (
        <>
            {/* Premium Trigger Button - styled to match EMI page */}
            <button
                onClick={() => setIsOpen(true)}
                className="w-full h-full min-h-[300px] flex flex-col items-center justify-center bg-gradient-to-br from-white to-[var(--colour-fsP2)]/5 hover:to-[var(--colour-fsP2)]/10 border-2 border-dashed border-[var(--colour-fsP2)]/30 hover:border-[var(--colour-fsP2)]/60 rounded-2xl transition-all duration-300 group cursor-pointer relative overflow-hidden"
            >
                {/* Background decorations */}
                <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-[var(--colour-fsP2)]/5 rounded-full blur-3xl group-hover:bg-[var(--colour-fsP2)]/15 transition-colors duration-500"></div>
                <div className="absolute -top-10 -left-10 w-32 h-32 bg-[var(--colour-fsP2)]/5 rounded-full blur-3xl group-hover:bg-[var(--colour-fsP2)]/10 transition-colors duration-500"></div>

                <div className="relative z-10 flex flex-col items-center">
                    <div className="w-20 h-20 rounded-full bg-[var(--colour-fsP2)]/10 flex items-center justify-center mb-5 group-hover:scale-110 group-hover:bg-[var(--colour-fsP2)]/15 transition-all duration-300 shadow-lg shadow-[var(--colour-fsP2)]/10">
                        <Search className="w-9 h-9 text-[var(--colour-fsP2)] group-hover:scale-110 transition-transform" />
                    </div>
                    <p className="text-lg font-bold text-gray-800 group-hover:text-[var(--colour-fsP2)] transition-colors mb-1">
                        Add Product to Compare
                    </p>
                    <p className="text-sm text-gray-500 max-w-[200px] text-center">
                        Search and select a product to add to comparison
                    </p>
                    <div className="mt-6 px-6 py-2.5 bg-[var(--colour-fsP2)] text-white rounded-full text-sm font-semibold shadow-lg shadow-[var(--colour-fsP2)]/30 group-hover:shadow-[var(--colour-fsP2)]/50 group-hover:scale-105 transition-all duration-300 flex items-center gap-2">
                        <Plus className="w-4 h-4" />
                        Search Products
                    </div>
                </div>
            </button>

            {/* Premium Dialog Overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-20 px-4 bg-black/60 backdrop-blur-md animate-fadeIn"
                    onClick={handleClose}
                >
                    {/* Dialog Container - Premium Card Style */}
                    <div
                        className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl flex flex-col max-h-[85vh] animate-slideDown overflow-hidden"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Header with Search */}
                        <div className="p-5 border-b border-gray-100 bg-gradient-to-r from-[var(--colour-fsP2)]/5 to-transparent">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                                    <Search className="w-5 h-5 text-[var(--colour-fsP2)]" />
                                    Search Products
                                </h2>
                                <button
                                    onClick={handleClose}
                                    className="p-2 hover:bg-gray-100 rounded-full text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            {/* Search Input - EMI Style */}
                            <div className="relative w-full group">
                                <div className={cn(
                                    "flex items-center rounded-2xl bg-gray-100 transition-all duration-300 overflow-hidden",
                                    "focus-within:bg-white focus-within:shadow-[0_4px_20px_rgba(0,0,0,0.08)] focus-within:ring-2 focus-within:ring-[var(--colour-fsP2)]/30"
                                )}>
                                    <div className="pl-4 text-gray-400 group-focus-within:text-[var(--colour-fsP2)] transition-colors">
                                        <Search className="w-5 h-5" />
                                    </div>
                                    <input
                                        ref={inputRef}
                                        type="text"
                                        placeholder="Search for mobiles, laptops, electronics..."
                                        value={query}
                                        onChange={(e) => setQuery(e.target.value)}
                                        onKeyDown={(e) => e.stopPropagation()}
                                        className="w-full px-4 py-4 bg-transparent border-none focus:outline-none text-base font-medium text-gray-900 placeholder-gray-400"
                                    />
                                    {query && (
                                        <button
                                            onClick={() => {
                                                setQuery('');
                                                inputRef.current?.focus();
                                            }}
                                            className="pr-4 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
                                        >
                                            <div className="bg-gray-200 hover:bg-gray-300 rounded-full p-1 transition-colors">
                                                <X className="w-4 h-4" />
                                            </div>
                                        </button>
                                    )}
                                    {loading && (
                                        <div className="pr-4">
                                            <Loader2 className="w-5 h-5 text-[var(--colour-fsP2)] animate-spin" />
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Results Area - Premium List */}
                        <div className="flex-1 overflow-y-auto p-4 bg-gray-50/50 custom-scrollbar">
                            {loading ? (
                                <div className="flex flex-col items-center justify-center py-16">
                                    <div className="w-16 h-16 rounded-full bg-[var(--colour-fsP2)]/10 flex items-center justify-center mb-4 animate-pulse">
                                        <Loader2 className="w-8 h-8 text-[var(--colour-fsP2)] animate-spin" />
                                    </div>
                                    <p className="text-gray-500 font-medium">Searching products...</p>
                                </div>
                            ) : filteredResults.length > 0 ? (
                                <div className="space-y-3">
                                    {filteredResults.map(product => (
                                        <button
                                            key={product.id}
                                            onClick={() => handleSelect(product)}
                                            className="w-full text-left p-4 bg-white hover:bg-[var(--colour-fsP2)]/5 border border-gray-100 hover:border-[var(--colour-fsP2)]/30 hover:shadow-md rounded-xl flex items-center gap-4 transition-all duration-200 group cursor-pointer"
                                        >
                                            <div className="relative w-16 h-16 bg-gray-50 rounded-lg overflow-hidden flex-shrink-0 border border-gray-100">
                                                {product.image?.full || product.image?.thumb ? (
                                                    <Image
                                                        src={product.image.full || product.image.thumb || '/placeholder.png'}
                                                        alt={product.name}
                                                        fill
                                                        className="object-contain p-1 group-hover:scale-110 transition-transform duration-300"
                                                    />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-gray-300">
                                                        <Smartphone className="w-6 h-6" />
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h3 className="font-semibold text-gray-900 truncate group-hover:text-[var(--colour-fsP2)] transition-colors">
                                                    {product.name}
                                                </h3>
                                                <div className="flex items-baseline gap-2 mt-1">
                                                    <span className="text-sm font-bold text-[var(--colour-fsP2)]">
                                                        Rs. {product.discounted_price?.toLocaleString()}
                                                    </span>
                                                    {product.discounted_price && product.price && product.discounted_price < product.price && (
                                                        <span className="text-xs text-gray-400 line-through">
                                                            Rs. {product.price.toLocaleString()}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="flex-shrink-0 p-2 text-gray-300 group-hover:text-[var(--colour-fsP2)] transition-colors">
                                                <ChevronRight className="w-5 h-5" />
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            ) : query.length > 2 ? (
                                <div className="flex flex-col items-center justify-center py-16 text-gray-400 opacity-80">
                                    <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mb-5">
                                        <Search className="w-10 h-10 stroke-1 text-gray-300" />
                                    </div>
                                    <p className="text-lg font-medium text-gray-500">No products found</p>
                                    <p className="text-sm text-gray-400 mt-1 text-center max-w-xs">
                                        Try searching with different keywords or check the spelling
                                    </p>
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center py-16 text-gray-400 opacity-80">
                                    <div className="w-20 h-20 rounded-full bg-[var(--colour-fsP2)]/10 flex items-center justify-center mb-5">
                                        <Smartphone className="w-10 h-10 stroke-1 text-[var(--colour-fsP2)]" />
                                    </div>
                                    <p className="text-lg font-medium text-gray-600">Start typing to search</p>
                                    <p className="text-sm text-gray-400 mt-1 text-center max-w-xs">
                                        Find mobiles, laptops, and more to compare
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Footer with count */}
                        {filteredResults.length > 0 && (
                            <div className="px-5 py-4 bg-white border-t border-gray-100 flex items-center justify-between">
                                <p className="text-sm text-gray-500">
                                    Found <span className="font-semibold text-[var(--colour-fsP2)]">{filteredResults.length}</span> product{filteredResults.length !== 1 ? 's' : ''}
                                </p>
                                <p className="text-xs text-gray-400">
                                    Click to add to comparison
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            )}

            <style jsx>{`
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }

                @keyframes slideDown {
                    from {
                        opacity: 0;
                        transform: translateY(-20px) scale(0.98);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0) scale(1);
                    }
                }

                .animate-fadeIn {
                    animation: fadeIn 0.25s ease-out;
                }

                .animate-slideDown {
                    animation: slideDown 0.35s cubic-bezier(0.16, 1, 0.3, 1);
                }

                .custom-scrollbar::-webkit-scrollbar {
                    width: 6px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background-color: #e2e8f0;
                    border-radius: 20px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background-color: #cbd5e1;
                }
            `}</style>
        </>
    );
}