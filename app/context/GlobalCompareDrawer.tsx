'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { X, Plus, Search, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { BasketProduct } from '@/app/types/ProductDetailsTypes';
import { searchProducts } from '../api/services/product.service';
import { useCartStore } from '@/app/context/CartContext';
import { useShallow } from 'zustand/react/shallow';

export default function GlobalCompareDrawer() {
    const { compareItems, removeFromCompare, addToCompare, setCompareItems } = useCartStore(
        useShallow(state => ({
            compareItems: state.compareItems,
            removeFromCompare: state.removeFromCompare,
            addToCompare: state.addToCompare,
            setCompareItems: state.setCompareItems,
        }))
    );

    const router = useRouter();
    const [open, setOpen] = useState(false);
    const [searchOpen, setSearchOpen] = useState(false);
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<BasketProduct[]>([]);
    const [searching, setSearching] = useState(false);

    if (compareItems.length === 0) return null;

    const handleCompare = () => {
        router.push(`/compare?slugs=${compareItems.map(p => p.slug).join(',')}`);
    };

    const handleSearch = async (q: string) => {
        setQuery(q);
        if (!q.trim()) { setResults([]); return; }
        setSearching(true);
        try {
            const res = await searchProducts({ search: q });
            setResults(res.data ?? res ?? []);
        } catch { } finally {
            setSearching(false);
        }
    };

    const handleAdd = (product: BasketProduct) => {
        addToCompare(product);
        setSearchOpen(false);
        setQuery('');
        setResults([]);
    };

    return (
        <>
            {/* Collapsed pill */}
            <div className={cn(
                'fixed bottom-20 left-1/2 -translate-x-1/2 z-50 transition-all duration-200',
                open ? 'opacity-0 pointer-events-none translate-y-2' : 'opacity-100'
            )}>
                <button
                    onClick={() => setOpen(true)}
                    className="flex items-center gap-2 bg-white border border-gray-200 rounded-full px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                >
                    Compare
                    <span className="bg-blue-600 text-white text-[11px] font-bold rounded-full w-5 h-5 flex items-center justify-center">
                        {compareItems.length}
                    </span>
                </button>
            </div>

            {/* Expanded tray */}
            <div className={cn(
                'fixed bottom-0 left-0 sm:max-w-4xl mx-auto right-0 z-50 transition-all duration-200',
                open ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0 pointer-events-none'
            )}>
                <div className="bg-white border-t border-gray-200 shadow-lg">
                    <div className="px-4 py-3 flex items-center flex-col sm:flex-row gap-3">

                        {/* Slots */}
                        <div className="flex-1 grid grid-cols-3 gap-2">
                            {[0, 1, 2].map(idx => {
                                const p = compareItems[idx];
                                return p ? (
                                    <div
                                        key={p.id}
                                        className="relative flex items-center gap-2 border border-gray-200 rounded-lg px-2 py-1.5 group bg-white"
                                    >
                                        <button
                                            onClick={() => removeFromCompare(p.id)}
                                            className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-white border border-gray-200 rounded-full flex items-center justify-center text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                                        >
                                            <X className="w-2.5 h-2.5" />
                                        </button>
                                        <div className="relative w-9 h-9 shrink-0 bg-gray-50 rounded border border-gray-100 overflow-hidden">
                                            {p?.thumb?.url && (
                                                <Image
                                                    src={p.thumb.url}
                                                    alt={p.thumb?.alt_text ?? p.name}
                                                    fill
                                                    sizes="36px"
                                                    className="object-contain p-0.5"
                                                />
                                            )}
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-[11px] font-semibold text-gray-800 truncate leading-tight">{p.name}</p>
                                            <p className="text-[11px] text-blue-600 font-bold mt-0.5">
                                                Rs. {(p.discounted_price ?? p.price)?.toLocaleString()}
                                            </p>
                                        </div>
                                    </div>
                                ) : (
                                    <button
                                        key={`e-${idx}`}
                                        onClick={() => setSearchOpen(true)}
                                        className="flex items-center justify-center gap-1.5 border border-dashed border-gray-300 rounded-lg h-12 text-gray-400 hover:border-blue-400 hover:text-blue-500 hover:bg-gray-50 transition-colors text-[12px] font-medium cursor-pointer"
                                    >
                                        <Plus className="w-3.5 h-3.5" />
                                        Add
                                    </button>
                                );
                            })}
                        </div>

                        {/* Actions */}
                        <div className="flex flex-row gap-2 shrink-0">
                            <button
                                onClick={handleCompare}
                                disabled={compareItems.length < 2}
                                className="px-5 py-2 bg-blue-600 text-white text-[13px] font-semibold rounded-lg disabled:opacity-40 disabled:cursor-not-allowed hover:bg-blue-700 transition-colors cursor-pointer"
                            >
                                Compare
                            </button>
                            <button
                                onClick={() => setCompareItems([])}
                                className="px-4 py-2 text-[12px] text-red-600 border border-red-100 rounded-lg hover:bg-red-50 transition-colors font-medium cursor-pointer"
                            >
                                Clear
                            </button>
                            <button
                                onClick={() => setOpen(false)}
                                className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors cursor-pointer"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Search modal */}
            {searchOpen && (
                <div
                    className="fixed inset-0 z-100 flex items-center justify-center bg-black/40 cursor-pointer"
                    onClick={() => setSearchOpen(false)}
                >
                    <div
                        className="bg-white rounded-xl w-full max-w-lg mx-4 flex flex-col shadow-lg overflow-hidden cursor-default"
                        style={{ maxHeight: '70vh' }}
                        onClick={e => e.stopPropagation()}
                    >
                        <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-100">
                            {searching
                                ? <Loader2 className="w-4 h-4 text-blue-500 animate-spin shrink-0" />
                                : <Search className="w-4 h-4 text-gray-400 shrink-0" />
                            }
                            <input
                                autoFocus
                                type="text"
                                value={query}
                                onChange={e => handleSearch(e.target.value)}
                                placeholder="Search devices…"
                                className="flex-1 text-[14px] text-gray-800 placeholder-gray-400 outline-none bg-transparent cursor-text"
                            />
                            {query && (
                                <button
                                    onClick={() => { setQuery(''); setResults([]); }}
                                    className="text-gray-400 hover:text-gray-600 cursor-pointer"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            )}
                            <button
                                onClick={() => setSearchOpen(false)}
                                className="ml-1 text-gray-400 hover:text-gray-600 cursor-pointer"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        <div className="overflow-y-auto">
                            {results.length > 0 ? (
                                results
                                    .filter(p => !compareItems.some(c => c.id === p.id))
                                    .map(product => (
                                        <button
                                            key={product.id}
                                            onClick={() => handleAdd(product)}
                                            className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-0 cursor-pointer"
                                        >
                                            <div className="relative w-10 h-10 bg-gray-100 rounded border border-gray-100 shrink-0 overflow-hidden">
                                                {product?.thumb?.url && (
                                                    <Image
                                                        src={product.thumb.url}
                                                        alt={product.thumb?.alt_text ?? product.name}
                                                        fill
                                                        sizes="40px"
                                                        className="object-contain p-1"
                                                    />
                                                )}
                                            </div>
                                            <div className="flex-1 text-left min-w-0">
                                                <p className="text-[13px] font-semibold text-gray-800 truncate">{product.name}</p>
                                                <p className="text-[12px] text-blue-600 font-bold mt-0.5">
                                                    Rs. {(product.discounted_price ?? product.price)?.toLocaleString()}
                                                </p>
                                            </div>
                                            <Plus className="w-4 h-4 text-gray-400 shrink-0" />
                                        </button>
                                    ))
                            ) : (
                                <div className="py-12 flex flex-col items-center text-gray-400">
                                    <Search className="w-8 h-8 mb-2 opacity-30" />
                                    <p className="text-[13px]">{query ? 'No results found' : 'Start typing to search'}</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
