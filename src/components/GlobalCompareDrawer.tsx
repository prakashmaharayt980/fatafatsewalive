'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { X, Plus, ChevronDown, ChevronUp, Search, Smartphone } from 'lucide-react';
import { useCompare } from '@/app/context/CompareContext';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";
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
            {/* Main Bottom Drawer */}
            <div className={cn(
                "fixed bottom-0 left-0 right-0 z-40 transition-transform duration-300 ease-in-out bg-white border-t border-gray-200 shadow-[0_-4px_20px_-5px_rgba(0,0,0,0.1)]",
                isExpanded ? "translate-y-0" : "translate-y-[calc(100%-48px)] p-0"
            )}>
                {/* Header / Toggle Bar */}
                <div
                    className="flex justify-between items-center px-4 py-3 cursor-pointer bg-white/50 backdrop-blur border-b border-gray-100 hover:bg-gray-50 transition-colors"
                    onClick={() => setIsExpanded(!isExpanded)}
                >
                    <div className="flex items-center gap-3">
                        <span className="font-semibold text-gray-800">Mobiles Comparison</span>
                        <span className="bg-[var(--colour-fsP2)] text-white text-xs px-2 py-0.5 rounded-full font-bold">
                            {compareList.length} / 3
                        </span>
                    </div>

                    <button className="text-gray-500 hover:text-[var(--colour-fsP2)]">
                        {isExpanded ? <ChevronDown className="w-5 h-5" /> : <ChevronUp className="w-5 h-5" />}
                    </button>
                </div>

                {/* Content Area */}
                <div className="p-4 md:p-6 grid grid-cols-1 md:grid-cols-4 gap-4 md:gap-8 items-center bg-white">

                    {/* Comparison Slots (3 Slots) */}
                    <div className="md:col-span-3 grid grid-cols-3 gap-2 md:gap-4">
                        {[0, 1, 2].map((idx) => {
                            const product = compareList[idx];

                            if (product) {
                                return (
                                    <div key={product.id} className="relative bg-white rounded-lg p-3 flex  items-center gap-3 border border-gray-200 shadow-sm">
                                        <button
                                            onClick={(e) => { e.stopPropagation(); removeFromCompare(product.id); }}
                                            className="absolute top-1 right-1 p-1 text-gray-400 hover:text-red-500 rounded-full hover:bg-red-50 transition-colors"
                                        >
                                            <X className="w-3.5 h-3.5" />
                                        </button>

                                        <div className="relative w-12 h-12 flex-shrink-0 bg-gray-50 rounded p-0.5 border border-gray-100">
                                            <Image
                                                src={product.image?.full || product.image?.thumb || '/placeholder.png'}
                                                alt={product.name}
                                                fill
                                                className="object-contain"
                                            />
                                        </div>

                                        <div className="min-w-0 flex-1">
                                            <h4 className="text-gray-800 text-sm font-medium truncate leading-tight mb-0.5" title={product.name}>
                                                {product.name}
                                            </h4>
                                            <p className="text-[var(--colour-fsP2)] text-xs font-bold">
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
                                        className="h-full min-h-[70px] border border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center gap-1 text-gray-400 hover:text-[var(--colour-fsP2)] hover:border-[var(--colour-fsP2)] hover:bg-[var(--colour-fsP2)]/5 transition-all group"
                                    >
                                        <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center group-hover:bg-[var(--colour-fsP2)] group-hover:text-white transition-colors">
                                            <Plus className="w-4 h-4" />
                                        </div>
                                        <span className="text-xs font-medium">Add Product</span>
                                    </button>
                                );
                            }
                        })}
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col gap-2">
                        <Button
                            onClick={handleCompare}
                            className="w-full bg-[var(--colour-fsP2)] hover:bg-[var(--colour-fsP2)]/90 text-white font-bold shadow-md shadow-[var(--colour-fsP2)]/20"
                            disabled={compareList.length < 2}
                        >
                            Compare
                        </Button>
                        <Button
                            variant="ghost"
                            onClick={clearCompare}
                            className="w-full text-gray-500 hover:text-red-500 hover:bg-red-50"
                        >
                            Clear
                        </Button>
                    </div>
                </div>
            </div>

            {/* Search Drawer (Nested or Separate) */}
            <Drawer open={isSearchOpen} onOpenChange={setIsSearchOpen}>
                <DrawerContent className="h-[80vh] max-w-5xl mx-auto p-0 rounded-t-2xl bg-white flex flex-col">
                    <DrawerHeader className="px-4 border-b border-gray-100 py-4">
                        <DrawerTitle className="text-lg font-semibold text-[var(--colour-fsP2)] flex items-center gap-2">
                            <Search className="w-5 h-5" />
                            Search Products to Compare
                        </DrawerTitle>
                    </DrawerHeader>

                    <div className="flex-1 flex flex-col p-4 gap-4 overflow-hidden bg-gray-50">
                        {/* Search Input */}
                        <div className="relative">
                            <div className={cn(
                                "flex items-center rounded-xl bg-white shadow-sm transition-all border border-gray-200",
                                "focus-within:border-[var(--colour-fsP2)]/50 focus-within:ring-2 focus-within:ring-[var(--colour-fsP2)]/10"
                            )}>
                                <Search className="ml-4 w-5 h-5 text-gray-400" />
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => handleSearch(e.target.value)}
                                    placeholder="Type device name..."
                                    className="w-full px-4 py-3 bg-transparent border-none focus:outline-none text-base text-gray-900 placeholder-gray-400"
                                    autoFocus
                                />
                                {searchQuery && (
                                    <button
                                        onClick={() => { setSearchQuery(""); setSearchResults([]); }}
                                        className="mr-2 p-1.5 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors text-gray-500"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                )}
                                {isSearching && <Loader2 className="mr-4 h-5 w-5 text-[var(--colour-fsP2)] animate-spin" />}
                            </div>
                        </div>

                        {/* Results List */}
                        <div className="flex-1 overflow-y-auto custom-scrollbar">
                            {searchResults.length > 0 ? (
                                <div className="space-y-2">
                                    {searchResults.filter(p => !compareList.some(c => c.id === p.id)).map(product => (
                                        <button
                                            key={product.id}
                                            onClick={() => handleAddProduct(product)}
                                            className="w-full text-left p-2 bg-white hover:bg-[var(--colour-fsP2)]/5 border border-gray-200 hover:border-[var(--colour-fsP2)]/30 rounded-lg flex items-center gap-3 transition-all duration-200 group cursor-pointer"
                                        >
                                            <div className="relative w-10 h-10 bg-gray-50 rounded overflow-hidden flex-shrink-0 border border-gray-100">
                                                <Image
                                                    src={product.image?.full || product.image?.thumb || '/placeholder.png'}
                                                    alt={product.name}
                                                    fill
                                                    className="object-contain p-1"
                                                />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h3 className="font-semibold text-gray-900 truncate text-sm">
                                                    {product.name}
                                                </h3>
                                                <span className="text-xs font-bold text-[var(--colour-fsP2)]">
                                                    Rs. {product.discounted_price?.toLocaleString()}
                                                </span>
                                            </div>
                                            <Plus className="w-4 h-4 text-gray-300 group-hover:text-[var(--colour-fsP2)]" />
                                        </button>
                                    ))}
                                </div>
                            ) : (
                                <div className="h-full flex flex-col items-center justify-center text-gray-400 opacity-80 min-h-[200px]">
                                    <Smartphone className="w-12 h-12 mb-3 stroke-1 text-[var(--colour-fsP2)]/30" />
                                    <p className="text-sm font-medium text-gray-600">Search to add devices</p>
                                </div>
                            )}
                        </div>
                    </div>
                </DrawerContent>
            </Drawer>
        </>
    );
}
