'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { X, Plus, Search, Loader2, Scale } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import type { BasketProduct } from '@/app/types/ProductDetailsTypes';
import { searchProducts } from '../api/services/product.service';
import { useCartStore } from '@/app/context/CartContext';
import { useShallow } from 'zustand/react/shallow';

function useDebounce<T>(value: T, delay: number): T {
    const [debounced, setDebounced] = useState(value);
    useEffect(() => {
        const t = setTimeout(() => setDebounced(value), delay);
        return () => clearTimeout(t);
    }, [value, delay]);
    return debounced;
}

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
    const debouncedQuery = useDebounce(query, 400);

    // Same-category restriction: client-side filter by slug (no id needed)
    const firstCategorySlug = compareItems[0]?.categories?.[0]?.slug;
    const firstCategoryName = compareItems[0]?.categories?.[0]?.title;

    useEffect(() => {
        if (!debouncedQuery.trim()) { setResults([]); return; }
        let active = true;
        setSearching(true);
        searchProducts({
            search: debouncedQuery,
            ...(firstCategorySlug ? { categories: firstCategorySlug } : {}),
        })
            .then(res => { if (active) setResults(res.data ?? res ?? []); })
            .catch(() => { if (active) setResults([]); })
            .finally(() => { if (active) setSearching(false); });
        return () => { active = false; };
    }, [debouncedQuery, firstCategorySlug]);

    // Deduplicate by id AND slug
    const isAlreadyAdded = (p: BasketProduct) =>
        compareItems.some(c => c.id === p.id || c.slug === p.slug);

    const handleAdd = (product: BasketProduct) => {
        if (compareItems.length >= 3) return;
        if (isAlreadyAdded(product)) return;
    
        addToCompare(product);
        closeSearch();
    };

    const closeSearch = () => { setSearchOpen(false); setQuery(''); setResults([]); };

    if (compareItems.length === 0) return null;

    const canCompare = compareItems.length >= 2;

    return (
        <>
            {/* ── Pill (collapsed) ── */}
            <div className={cn(
                'fixed bottom-4 sm:bottom-6 left-1/2 -translate-x-1/2 z-50 transition-all duration-200',
                open ? 'opacity-0 pointer-events-none scale-95' : 'opacity-100 scale-100'
            )}>
                <button
                    onClick={() => setOpen(true)}
                    className="flex items-center gap-2 bg-white border border-gray-200 rounded-full pl-3.5 sm:pl-4 pr-2.5 sm:pr-3 py-1.5 sm:py-2 text-xs sm:text-sm font-semibold text-gray-800 shadow-md hover:shadow-lg hover:border-gray-300 transition-all cursor-pointer"
                >
                    <Scale className="w-3.5 h-3.5 text-(--colour-fsP2)" />
                    <span>Compare</span>
                    <span className="w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-(--colour-fsP2) text-white text-[10px] sm:text-[11px] font-bold flex items-center justify-center leading-none">
                        {compareItems.length}
                    </span>
                </button>
            </div>

            {/* ── Expanded tray ── */}
            <div className={cn(
                'fixed bottom-0 left-0 right-0 z-50 sm:max-w-4xl mx-auto transition-all duration-200',
                open ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0 pointer-events-none'
            )}>
                <div className="bg-(--colour-fsP2) border-t border-gray-200 shadow-[0_-2px_12px_rgba(0,0,0,0.08)] rounded-t-2xl">
                    <div className=" px-3 sm:px-4 py-2.5 sm:py-3">

                        {/* Mobile: stacked layout | Desktop: single row */}
                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">

                            {/* Product slots */}
                            <div className="flex-1 grid grid-cols-3 gap-1.5 sm:gap-2 min-w-0">
                                {Array.from({ length: 3 }, (_, idx) => {
                                    const p = compareItems[idx];
                                    return p ? (
                                        <div key={p.id} className="relative flex items-center gap-1.5 sm:gap-2 border border-white/20 rounded-lg sm:rounded-xl px-2 py-1.5 sm:py-2 bg-white/15 group min-w-0">
                                            <button
                                                onClick={() => removeFromCompare(p.id)}
                                                className="absolute -top-1 -right-1 w-3.5 h-3.5 sm:w-4 sm:h-4 bg-white border border-gray-200 rounded-full flex items-center justify-center text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all cursor-pointer"
                                            >
                                                <X className="w-2 h-2 sm:w-2.5 sm:h-2.5" />
                                            </button>
                                            <div className="relative w-7 h-7 sm:w-9 sm:h-9 shrink-0 bg-white rounded border border-white/30 overflow-hidden">
                                                {p.thumb?.url && (
                                                    <Image src={p.thumb.url} alt={p.thumb.alt_text ?? p.name} fill sizes="36px" className="object-contain p-0.5" />
                                                )}
                                            </div>
                                            <div className="min-w-0 flex-1 hidden sm:block">
                                                <p className="text-[10px] sm:text-[11px] font-semibold text-white truncate leading-tight">{p.name}</p>
                                                <p className="text-[10px] sm:text-[11px] font-bold text-white/80 mt-0.5">
                                                    Rs. {((p.discounted_price ?? (typeof p.price === 'object' ? (p.price as any).current : p.price)) ?? 0).toLocaleString()}
                                                </p>
                                            </div>
                                            {/* Mobile: just show price */}
                                            <p className="sm:hidden text-[9px] font-bold text-white/90 truncate flex-1 leading-tight">
                                                {p.name.split(' ').slice(0, 2).join(' ')}
                                            </p>
                                        </div>
                                    ) : (
                                        <button
                                            key={`empty-${idx}`}
                                            onClick={() => setSearchOpen(true)}
                                            className="flex items-center justify-center gap-1 sm:gap-1.5 border border-dashed border-white/40 rounded-lg sm:rounded-xl h-10 sm:h-13 text-white/70 hover:border-white hover:text-white transition-colors text-[10px] sm:text-xs font-medium cursor-pointer"
                                        >
                                            <Plus className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                                            <span>Add</span>
                                        </button>
                                    );
                                })}
                            </div>

                            {/* Actions */}
                            <div className="flex items-center gap-1.5 sm:gap-2 justify-end shrink-0">
                                <button
                                    onClick={() => {
                                        router.push(`/compare?slugs=${compareItems.map(p => p.slug).join(',')}`);
                                        setOpen(false);
                                    }}
                                    disabled={!canCompare}
                                    className="flex items-center gap-1.5 px-3 sm:px-4 py-1.5 sm:py-2 bg-white text-(--colour-fsP2) text-[12px] sm:text-[13px] font-bold rounded-lg sm:rounded-xl disabled:opacity-40 disabled:cursor-not-allowed hover:bg-white/90 transition-opacity cursor-pointer"
                                >
                                    <Scale className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                                    Compare
                                </button>
                                <button
                                    onClick={() => { setCompareItems([]); setOpen(false); }}
                                    className="px-2.5 sm:px-3 py-1.5 sm:py-2 text-[11px] sm:text-[12px] text-white/80 border border-white/30 rounded-lg sm:rounded-xl hover:bg-white/10 transition-colors font-medium cursor-pointer"
                                >
                                    Clear
                                </button>
                                <button
                                    onClick={() => setOpen(false)}
                                    className="p-1.5 sm:p-2 rounded-lg sm:rounded-xl text-white/60 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                                >
                                    <X className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Search modal ── */}
            {searchOpen && (
                <div
                    className="fixed inset-0 z-60 flex items-center justify-center bg-black/30 px-4"
                    onClick={closeSearch}
                >
                    <div
                        className="bg-white rounded-2xl w-full max-w-md flex flex-col border border-gray-200 shadow-xl overflow-hidden"
                        style={{ maxHeight: '72vh' }}
                        onClick={e => e.stopPropagation()}
                    >
                        {/* Header with search input */}
                        <div className="px-4 pt-4 pb-3 border-b border-gray-100">
                            {firstCategoryName && (
                                <p className="text-[10px] font-semibold text-(--colour-fsP2) bg-blue-50 border border-blue-100 rounded-full px-2.5 py-0.5 inline-block mb-2.5">
                                    Showing {firstCategoryName} only
                                </p>
                            )}
                            <div className="flex items-center gap-2.5 rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 focus-within:bg-white focus-within:border-(--colour-fsP2) transition-colors">
                                {searching
                                    ? <Loader2 className="w-4 h-4 text-(--colour-fsP2) animate-spin shrink-0" />
                                    : <Search className="w-4 h-4 text-gray-400 shrink-0" />
                                }
                                <input
                                    autoFocus
                                    type="text"
                                    value={query}
                                    onChange={e => setQuery(e.target.value)}
                                    placeholder={firstCategoryName ? `Search ${firstCategoryName}…` : 'Search devices to compare…'}
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
                                        onClick={closeSearch}
                                        className="w-6 h-6 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 transition-colors cursor-pointer shrink-0"
                                    >
                                        <X className="w-3.5 h-3.5" />
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Results */}
                        <div className="overflow-y-auto flex-1">
                            {results.filter(p => !isAlreadyAdded(p)).length > 0 ? (
                                results
                                    .filter(p => !isAlreadyAdded(p))
                                    .map(product => (
                                        <button
                                            key={product.id}
                                            onClick={() => handleAdd(product)}
                                            className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-0 cursor-pointer text-left group"
                                        >
                                            <div className="relative w-11 h-11 bg-gray-50 rounded-xl border border-gray-100 shrink-0 overflow-hidden">
                                                {product?.thumb?.url && (
                                                    <Image src={product.thumb.url} alt={product.thumb.alt_text ?? product.name} fill sizes="44px" className="object-contain p-1" />
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
                                                    Rs. {((product.discounted_price ?? (typeof product.price === 'object' ? (product.price as any).current : product.price)) ?? 0).toLocaleString()}
                                                </p>
                                            </div>
                                            <Plus className="w-4 h-4 text-gray-300 group-hover:text-(--colour-fsP2) shrink-0 transition-colors" />
                                        </button>
                                    ))
                            ) : (
                                <div className="py-12 flex flex-col items-center gap-2 text-gray-400">
                                    <Search className="w-8 h-8 opacity-20" />
                                    <p className="text-sm text-gray-500">{query ? 'No products found' : 'Type to search devices'}</p>
                                    {query && firstCategoryName && (
                                        <p className="text-xs text-gray-400 text-center">Only {firstCategoryName} products can be added</p>
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
