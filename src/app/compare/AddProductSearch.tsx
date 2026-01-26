'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Search, Plus, Loader2, X } from 'lucide-react';
import RemoteServices from '../api/remoteservice';
import Image from 'next/image';
import { ProductDetails } from '../types/ProductDetailsTypes';

// Simple debounce hook if not available
function useDebounceValue<T>(value: T, delay: number): T {
    const [debouncedValue, setDebouncedValue] = useState<T>(value);
    useEffect(() => {
        const handler = setTimeout(() => setDebouncedValue(value), delay);
        return () => clearTimeout(handler);
    }, [value, delay]);
    return debouncedValue;
}

interface AddProductSearchProps {
    onSelect: (product: ProductDetails) => void;
    excludeIds: number[];
}

export default function AddProductSearch({ onSelect, excludeIds }: AddProductSearchProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<ProductDetails[]>([]);
    const [loading, setLoading] = useState(false);
    const wrapperRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const debouncedQuery = useDebounceValue(query, 500);

    useEffect(() => {
        if (isOpen && inputRef.current) {
            inputRef.current.focus();
        }
    }, [isOpen]);

    useEffect(() => {
        const fetchProducts = async () => {
            if (!debouncedQuery.trim()) {
                setResults([]);
                return;
            }

            setLoading(true);
            try {
                // RemoteServices typo fixed
                const res = await RemoteServices.searchProducts({ search: debouncedQuery });
                // The API structure for search returns { data: [...] } usually
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

    // Close on click outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    if (!isOpen) {
        return (
            <button
                onClick={() => setIsOpen(true)}
                className="w-full h-full min-h-[300px] flex flex-col items-center justify-center bg-gray-50 hover:bg-gray-100 border-2 border-dashed border-gray-200 rounded-xl transition-all group"
            >
                <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center shadow-sm mb-4 group-hover:scale-110 transition-transform">
                    <Plus className="w-8 h-8 text-gray-400 group-hover:text-blue-600" />
                </div>
                <span className="font-semibold text-gray-500 group-hover:text-gray-700">Add Product</span>
            </button>
        );
    }

    return (
        <div ref={wrapperRef} className="w-full h-full min-h-[300px] bg-white rounded-xl shadow-xl ring-1 ring-gray-200 flex flex-col relative overflow-hidden transition-all duration-300">
            <div className="p-5 border-b border-gray-100 flex items-center gap-3 bg-gray-50/50">
                <Search className="w-6 h-6 text-blue-500" />
                <input
                    ref={inputRef}
                    type="text"
                    className="flex-1 outline-none text-base text-gray-800 placeholder:text-gray-400 bg-transparent font-medium"
                    placeholder="Search product to add..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    autoFocus
                />
                {query && (
                    <button
                        onClick={() => { setQuery(''); inputRef.current?.focus(); }}
                        className="p-1 hover:bg-gray-200 rounded-full text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
                    >
                        <X className="w-4 h-4" />
                    </button>
                )}
                <button
                    onClick={() => setIsOpen(false)}
                    className="p-2 hover:bg-red-50 rounded-lg text-gray-400 hover:text-red-500 transition-colors cursor-pointer ml-1"
                >
                    <X className="w-5 h-5" />
                </button>
            </div>

            <div className="flex-1 overflow-y-auto p-3 space-y-2 scrollbar-thin bg-gray-50/30">
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-12 text-gray-400 gap-3">
                        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                        <span className="text-sm font-medium">Searching...</span>
                    </div>
                ) : results.length > 0 ? (
                    results
                        .filter(p => !excludeIds.includes(p.id))
                        .map(product => (
                            <button
                                key={product.id}
                                onClick={() => {
                                    onSelect(product);
                                    setIsOpen(false);
                                    setQuery('');
                                }}
                                className="w-full text-left p-3 hover:bg-white hover:shadow-md hover:ring-1 hover:ring-blue-100 rounded-xl flex items-center gap-4 transition-all duration-200 group cursor-pointer bg-white border border-gray-100/50"
                            >
                                <div className="w-14 h-14 relative bg-gray-50 rounded-lg border border-gray-100 flex-shrink-0 p-1">
                                    <Image
                                        src={product.image?.thumb || product.image?.full || '/placeholder.png'}
                                        alt={product.name}
                                        fill
                                        className="object-contain group-hover:scale-110 transition-transform duration-300"
                                    />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h4 className="text-sm font-bold text-gray-900 truncate group-hover:text-blue-600 transition-colors">
                                        {product.name}
                                    </h4>
                                    <p className="text-xs font-semibold text-blue-600 mt-0.5">
                                        Rs. {product.discounted_price?.toLocaleString()}
                                    </p>
                                </div>
                                <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Plus className="w-5 h-5" />
                                </div>
                            </button>
                        ))
                ) : query.length > 2 ? (
                    <div className="text-center py-12 text-gray-500 text-sm">
                        No products found matching "{query}"
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-16 text-gray-400 gap-2">
                        <Search className="w-12 h-12 opacity-20" />
                        <p className="text-sm">Type name to search</p>
                    </div>
                )}
            </div>
        </div>
    );
}
