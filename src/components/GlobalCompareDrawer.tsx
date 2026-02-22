'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { X, Plus, ChevronDown, ChevronUp, Search, Smartphone } from 'lucide-react';
import { useCompare } from '@/app/context/CompareContext';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import RemoteServices from '@/app/api/remoteservice';
import { ProductDetails } from '@/app/types/ProductDetailsTypes';
import { Loader2 } from 'lucide-react';

// Reusing logic from CompareSearchComponent but adapted for the drawer context if needed, 
// or simply integrating the search drawer logic directly here to avoid complex prop drilling/composition.
// For simplicity and specific UI requirements (dark theme drawer, light theme search), I'll inline the search logic or use a tailored version.

export default function GlobalCompareDrawer() {
    const { compareList, removeFromCompare, clearCompare, addToCompare } = useCompare();
    const router = useRouter();
    const [isExpanded, setIsExpanded] = useState(false);
    const [isSearchOpen, setIsSearchOpen] = useState(false);

    // Search State
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<ProductDetails[]>([]);
    const [isSearching, setIsSearching] = useState(false);

    // Initial check: only show if items exist
    if (compareList.length === 0) return null;

    const handleCompare = () => {
        const slugs = compareList.map(p => p.slug).join(',');
        router.push(`/compare?slugs=${slugs}`);
        // Optional: clearCompare() or keep them? Usually keep them until manually cleared or explicit "New Compare"
    };

    const handleSearch = async (query: string) => {
        setSearchQuery(query);
        if (!query.trim()) {
            setSearchResults([]);
            return;
        }

        setIsSearching(true);
        try {
            const res = await RemoteServices.searchProducts({ search: query });
            setSearchResults(res.data || res || []);
        } catch (error) {
            console.error(error);
        } finally {
            setIsSearching(false);
        }
    };

    const handleAddProduct = (product: ProductDetails) => {
        addToCompare(product);
        setIsSearchOpen(false);
        setSearchQuery('');
        setSearchResults([]);
    };

    return (
        <>
            {/* Floating Toggle Pill */}
            <div className={cn(
                "fixed top-[110px] left-1/2 -translate-x-1/2 z-[90] transition-all duration-300 ease-in-out",
                isExpanded ? "-translate-y-4 opacity-0 pointer-events-none" : "translate-y-0 opacity-100"
            )}>
                <button
                    onClick={() => setIsExpanded(true)}
                    className="bg-white/95 backdrop-blur-md border border-gray-200  rounded-4xl px-5 py-2.5 flex items-center gap-3 transition-all hover:-translate-y-0.5"
                >
                    <span className="font-bold text-[13px] text-gray-700 uppercase tracking-wide">Compare</span>
                    <span className="bg-[var(--colour-fsP2)] text-white text-[11px] px-2 py-0.5 rounded-full font-bold shadow-sm">
                        {compareList.length} / 3
                    </span>
                    <ChevronDown className="w-4 h-4 text-gray-400" />
                </button>
            </div>

            {/* Main Floating Island Drawer */}
            <div className={cn(
                "fixed top-[110px] left-1/2 -translate-x-1/2 z-[100] transition-all duration-300 ease-in-out w-[95%] max-w-5xl",
                isExpanded ? "translate-y-0 opacity-100" : "-translate-y-8 opacity-0 pointer-events-none"
            )}>
                {/* content wrapper */}
                <div className="w-full flex flex-col bg-white/95 backdrop-blur-xl border border-gray-200 shadow-2xl rounded-2xl overflow-hidden">
                    {/* Header */}
                    <div className="flex justify-between items-center px-4 py-2 border-b border-gray-100 bg-gray-50/50">
                        <div className="flex items-center gap-2.5">
                            <Smartphone className="w-4 h-4 text-[var(--colour-fsP2)]" />
                            <span className="font-bold text-[13px] text-gray-800 uppercase tracking-widest">Compare Devices</span>
                        </div>
                        <button
                            className="p-1.5 rounded-full text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                            onClick={() => setIsExpanded(false)}
                            aria-label="Close"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>

                    {/* Content Area (Items & Actions) */}
                    <div className="p-2 sm:p-3 grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-3 items-center">

                        {/* Comparison Slots (3 Slots) */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 md:gap-2">
                            {[0, 1, 2].map((idx) => {
                                const product = compareList[idx];

                                if (product) {
                                    return (
                                        <div key={product.id} className="relative bg-white rounded-lg p-1 flex items-center gap-3 border border-gray-200 shadow-sm hover:border-[var(--colour-fsP2)]/30 hover:shadow-md transition-all group">
                                            <button
                                                onClick={(e) => { e.stopPropagation(); removeFromCompare(product.id); }}
                                                className="absolute -top-2 -right-2 p-1 bg-white text-gray-400 border border-gray-200 hover:text-red-500 hover:border-red-200 rounded-full hover:bg-red-50 shadow-sm transition-all opacity-0 group-hover:opacity-100 scale-90 group-hover:scale-100 z-10"
                                            >
                                                <X className="w-3.5 h-3.5" />
                                            </button>

                                            <div className="relative w-14 h-14 flex-shrink-0 bg-gray-50 rounded-lg p-1.5 border border-gray-100">
                                                <Image
                                                    src={product.image?.full || product.image?.thumb || '/placeholder.png'}
                                                    alt={product.name}
                                                    fill
                                                    className="object-contain"
                                                />
                                            </div>

                                            <div className="min-w-0 flex-1">
                                                <h4 className="text-gray-800 text-[13px] font-bold truncate leading-snug mb-1" title={product.name}>
                                                    {product.name}
                                                </h4>
                                                <p className="text-[var(--colour-fsP2)] text-[13px] font-black">
                                                    Rs. {product.discounted_price?.toLocaleString()}
                                                </p>
                                            </div>
                                        </div>
                                    );
                                } else {
                                    return (
                                        <button
                                            key={`empty-${idx}`}
                                            onClick={() => setIsSearchOpen(true)}
                                            className="h-full min-h-[82px] rounded-xl flex items-center justify-center gap-2 border-2 border-dashed border-gray-200 text-gray-400 hover:text-[var(--colour-fsP2)] hover:border-[var(--colour-fsP2)]/50 hover:bg-[var(--colour-fsP2)]/5 transition-all outline-none focus:ring-2 focus:ring-[var(--colour-fsP2)]/20 group"
                                        >
                                            <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center border border-gray-100 group-hover:bg-white group-hover:border-blue-100 transition-colors">
                                                <Plus className="w-4 h-4" />
                                            </div>
                                            <span className="text-[13px] font-semibold">Add Product</span>
                                        </button>
                                    );
                                }
                            })}
                        </div>

                        {/* Actions */}
                        <div className="flex sm:flex-col flex-row items-stretch justify-center gap-2 lg:border-l lg:border-gray-100 lg:pl-4">
                            <Button
                                onClick={handleCompare}
                                className="w-full min-w-[100px] bg-[var(--colour-fsP2)] hover:bg-[var(--colour-fsP2)]/90 text-white font-bold transition-all shadow-sm shadow-[var(--colour-fsP2)]/20 rounded-lg h-11"
                                disabled={compareList.length < 2}
                            >
                                Compare
                            </Button>
                            <Button
                                variant="ghost"
                                onClick={clearCompare}
                                className="w-full text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg h-10 text-[13px] font-bold transition-colors"
                            >
                                Clear All
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Search Modal (Clean Centered Dialog) */}
            {isSearchOpen && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 sm:p-6 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
                    <div
                        className="bg-white rounded-2xl w-full max-w-3xl h-[85vh] sm:h-[75vh] flex flex-col shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100 bg-gray-50/80">
                            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2.5">
                                <Search className="w-5 h-5 text-[var(--colour-fsP2)]" />
                                Search Devices to Compare
                            </h2>
                            <button
                                onClick={() => setIsSearchOpen(false)}
                                className="p-2 bg-white border border-gray-200 rounded-full text-gray-500 hover:text-red-500 hover:bg-red-50 hover:border-red-100 transition-all shadow-sm"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        <div className="p-4 sm:p-5 border-b border-gray-100 bg-white">
                            <div className="relative">
                                <div className={cn(
                                    "flex items-center rounded-xl bg-gray-50/50 shadow-inner transition-all border border-gray-200",
                                    "focus-within:border-[var(--colour-fsP2)]/50 focus-within:ring-4 focus-within:ring-[var(--colour-fsP2)]/10 focus-within:bg-white"
                                )}>
                                    <Search className="ml-4 w-5 h-5 text-gray-400" />
                                    <input
                                        type="text"
                                        value={searchQuery}
                                        onChange={(e) => handleSearch(e.target.value)}
                                        placeholder="Type device name... (e.g. iPhone 15, Samsung S24)"
                                        className="w-full px-4 py-3.5 bg-transparent border-none focus:outline-none text-[15px] font-medium text-gray-900 placeholder-gray-400"
                                        autoFocus
                                    />
                                    {searchQuery && (
                                        <button
                                            onClick={() => { setSearchQuery(""); setSearchResults([]); }}
                                            className="mr-2 p-1.5 rounded-full bg-white border border-gray-200 hover:bg-gray-100 transition-colors text-gray-500 shadow-sm"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                    )}
                                    {isSearching && <Loader2 className="mr-4 h-5 w-5 text-[var(--colour-fsP2)] animate-spin" />}
                                </div>
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto bg-gray-50 p-3 sm:p-5 custom-scrollbar">
                            {searchResults.length > 0 ? (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    {searchResults.filter(p => !compareList.some(c => c.id === p.id)).map(product => (
                                        <button
                                            key={product.id}
                                            onClick={() => handleAddProduct(product)}
                                            className="w-full text-left p-3.5 bg-white hover:bg-blue-50/50 border border-gray-200 hover:border-[var(--colour-fsP2)]/40 rounded-xl flex items-center gap-4 transition-all duration-200 group shadow-sm hover:shadow-md cursor-pointer"
                                        >
                                            <div className="relative w-14 h-14 bg-gray-50 rounded-lg overflow-hidden flex-shrink-0 border border-gray-100 p-1.5">
                                                <Image
                                                    src={product.image?.full || product.image?.thumb || '/placeholder.png'}
                                                    alt={product.name}
                                                    fill
                                                    className="object-contain"
                                                />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h3 className="font-bold text-gray-900 truncate text-[14px] leading-tight mb-1">
                                                    {product.name}
                                                </h3>
                                                <span className="text-[13px] font-black text-[var(--colour-fsP2)]">
                                                    Rs. {product.discounted_price?.toLocaleString()}
                                                </span>
                                            </div>
                                            <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center border border-gray-100 group-hover:bg-[var(--colour-fsP2)]/10 group-hover:border-[var(--colour-fsP2)]/30 transition-colors">
                                                <Plus className="w-4 h-4 text-gray-400 group-hover:text-[var(--colour-fsP2)]" />
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            ) : (
                                <div className="h-full flex flex-col items-center justify-center text-gray-400 opacity-80 min-h-[250px]">
                                    <Smartphone className="w-16 h-16 mb-4 stroke-1 text-[var(--colour-fsP2)]/30" />
                                    <p className="text-[15px] font-semibold text-gray-500">Search to add devices</p>
                                    <p className="text-[13px] text-gray-400 mt-1">Type in the search bar above to look for products.</p>
                                </div>
                            )}
                        </div>
                    </div>
                    {/* Background overlay click to close */}
                    <div className="fixed inset-0 z-[-1]" onClick={() => setIsSearchOpen(false)} />
                </div>
            )}
        </>
    );
}
