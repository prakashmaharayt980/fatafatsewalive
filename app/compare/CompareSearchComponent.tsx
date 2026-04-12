'use client';

import { useState, useEffect } from 'react';
import { Search, Plus, Loader2, X, ChevronRight, Smartphone } from 'lucide-react';
import Image from 'next/image';
import type { ProductDetails } from '../types/ProductDetailsTypes';
import { searchProducts } from '../api/services/product.service';
import { cn } from '@/lib/utils';

function useDebounce<T>(value: T, delay: number): T {
    const [debounced, setDebounced] = useState(value);
    useEffect(() => {
        const t = setTimeout(() => setDebounced(value), delay);
        return () => clearTimeout(t);
    }, [value, delay]);
    return debounced;
}

const getProductPrice = (p: ProductDetails) =>
    (typeof p.price === 'object' ? p.price.current : p.price) ?? 0;

interface Props {
    onSelect: (product: ProductDetails) => void;
    excludeSlugs: string[];
    categoryName?: string;
    categorySlug?: string;
}

export default function CompareSearchComponent({ onSelect, excludeSlugs, categoryName, categorySlug }: Props) {
    const [isOpen, setIsOpen] = useState(false);
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<ProductDetails[]>([]);
    const [loading, setLoading] = useState(false);
    const debouncedQuery = useDebounce(query, 400);

    useEffect(() => {
        if (!debouncedQuery.trim()) { setResults([]); return; }
        let active = true;
        setLoading(true);
        searchProducts({
            search: debouncedQuery,
            ...(categorySlug ? { categories: categorySlug } : {}),
        })
            .then(res => { if (active) setResults(res.data ?? res ?? []); })
            .catch(() => { if (active) setResults([]); })
            .finally(() => { if (active) setLoading(false); });
        return () => { active = false; };
    }, [debouncedQuery, categorySlug]);

    useEffect(() => {
        if (!isOpen) return;
        const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') close(); };
        document.addEventListener('keydown', onKey);
        return () => document.removeEventListener('keydown', onKey);
    }, [isOpen]);

    const close = () => { setIsOpen(false); setQuery(''); setResults([]); };

    const handleSelect = (product: ProductDetails) => {
        onSelect(product);
        close();
    };

    const filtered = results.filter(p => !excludeSlugs.includes(p.slug));

    return (
        <>
            {/* Trigger */}
            <button
                onClick={() => setIsOpen(true)}
                className="w-full h-full min-h-44 sm:min-h-52 flex flex-col items-center justify-center gap-2 bg-white hover:bg-gray-50 transition-colors cursor-pointer p-4"
            >
                <div className="w-9 h-9 rounded-full border border-gray-200 bg-gray-50 flex items-center justify-center">
                    <Plus className="w-4 h-4 text-gray-400" />
                </div>
                <div className="text-center">
                    <p className="text-[11px] sm:text-xs font-semibold text-gray-600">Add Product</p>
                    <p className="text-[10px] text-gray-400 mt-0.5 hidden sm:block">
                        {categoryName ? `Search in ${categoryName}` : 'Search to compare'}
                    </p>
                </div>
            </button>

            {/* Modal */}
            {isOpen && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 px-4"
                    onClick={close}
                >
                    <div
                        className="bg-white rounded-2xl w-full max-w-md flex flex-col border border-gray-200 shadow-xl overflow-hidden"
                        style={{ maxHeight: '72vh' }}
                        onClick={e => e.stopPropagation()}
                    >
                        {/* Header */}
                        <div className="px-4 pt-4 pb-3 border-b border-gray-100">
                            {categoryName && (
                                <p className="text-[10px] font-semibold text-(--colour-fsP2) bg-blue-50 border border-blue-100 rounded-full px-2.5 py-0.5 inline-block mb-2.5">
                                    Showing {categoryName} only
                                </p>
                            )}
                            <div className={cn(
                                'flex items-center gap-2.5 rounded-xl border bg-gray-50 px-3 py-2.5 transition-colors',
                                'focus-within:bg-white focus-within:border-(--colour-fsP2)'
                            )}>
                                {loading
                                    ? <Loader2 className="w-4 h-4 text-(--colour-fsP2) animate-spin shrink-0" />
                                    : <Search className="w-4 h-4 text-gray-400 shrink-0" />
                                }
                                <input
                                    autoFocus
                                    type="text"
                                    value={query}
                                    onChange={e => setQuery(e.target.value)}
                                    placeholder={categoryName ? `Search ${categoryName}…` : 'Search mobiles, laptops…'}
                                    className="flex-1 text-sm text-gray-800 placeholder-gray-400 outline-none bg-transparent"
                                />
                                {query ? (
                                    <button
                                        onClick={() => { setQuery(''); setResults([]); }}
                                        className="w-5 h-5 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center text-gray-500 transition-colors cursor-pointer shrink-0"
                                    >
                                        <X className="w-3 h-3" />
                                    </button>
                                ) : (
                                    <button
                                        onClick={close}
                                        className="w-6 h-6 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 transition-colors cursor-pointer shrink-0"
                                    >
                                        <X className="w-3.5 h-3.5" />
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Results */}
                        <div className="overflow-y-auto flex-1">
                            {filtered.length > 0 ? (
                                filtered.map(product => (
                                    <button
                                        key={product.id}
                                        onClick={() => handleSelect(product)}
                                        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-0 cursor-pointer text-left group"
                                    >
                                        <div className="relative w-11 h-11 bg-gray-50 rounded-xl border border-gray-100 shrink-0 overflow-hidden">
                                            {product.thumb?.url ?? product.image?.full ?? product.image?.thumb ? (
                                                <Image
                                                    src={product.thumb?.url ?? product.image?.full ?? product.image?.thumb ?? '/placeholder.png'}
                                                    alt={product.name}
                                                    fill
                                                    sizes="44px"
                                                    className="object-contain p-1"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center">
                                                    <Smartphone className="w-4 h-4 text-gray-300" />
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            {product.brand && (
                                                <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-0.5">
                                                    {product.brand.name}
                                                </p>
                                            )}
                                            <p className="text-[13px] font-semibold text-gray-800 truncate group-hover:text-(--colour-fsP2) transition-colors">
                                                {product.name}
                                            </p>
                                            <p className="text-xs font-bold text-(--colour-fsP2) mt-0.5">
                                                Rs. {getProductPrice(product).toLocaleString()}
                                            </p>
                                        </div>
                                        <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-(--colour-fsP2) shrink-0 transition-colors" />
                                    </button>
                                ))
                            ) : (
                                <div className="py-12 flex flex-col items-center gap-2 text-gray-400">
                                    {query && !loading ? (
                                        <>
                                            <Search className="w-8 h-8 opacity-20" />
                                            <p className="text-sm text-gray-500">No products found</p>
                                            {categoryName && (
                                                <p className="text-xs text-gray-400 text-center max-w-50">
                                                    Only {categoryName} products can be added
                                                </p>
                                            )}
                                        </>
                                    ) : !loading && (
                                        <>
                                            <Smartphone className="w-8 h-8 opacity-20" />
                                            <p className="text-sm text-gray-500">Type to search</p>
                                        </>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
