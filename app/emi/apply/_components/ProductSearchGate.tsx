'use client';

import React, { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Search, X, Loader2, ShoppingBag, ArrowRight, Package, ChevronRight } from 'lucide-react';
import { searchProducts } from '@/app/api/services/product.service';
import { useEmiStore } from '../../_components/emiContext';

interface SearchProduct {
    id: number;
    name: string;
    slug: string;
    price: number;
    emi_price?: number;
    thumb?: { url: string; alt_text?: string };
    brand?: { name: string };
}

const SKELETON_COUNT = 5;

function SkeletonRow() {
    return (
        <div className="flex items-center gap-3 px-4 py-3">
            <div className="w-12 h-12 rounded-xl bg-slate-100 shrink-0 animate-pulse" />
            <div className="flex-1 space-y-2">
                <div className="h-3.5 bg-slate-100 rounded-lg animate-pulse w-3/4" />
                <div className="h-3 bg-slate-100 rounded-lg animate-pulse w-1/3" />
            </div>
        </div>
    );
}

interface Props {
    onProductSelected: () => void;
}

export default function ProductSearchGate({ onProductSelected }: Props) {
    const setEmiContextInfo = useEmiStore((s) => s.setEmiContextInfo);

    const [drawerOpen, setDrawerOpen] = useState(false);
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<SearchProduct[]>([]);
    const [loading, setLoading] = useState(false);
    const [searched, setSearched] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);
    const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const abortRef = useRef<AbortController | null>(null);

    useEffect(() => {
        if (drawerOpen) {
            setTimeout(() => inputRef.current?.focus(), 100);
        } else {
            setQuery('');
            setResults([]);
            setSearched(false);
        }
    }, [drawerOpen]);

    const handleQueryChange = (q: string) => {
        setQuery(q);
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        abortRef.current?.abort();

        if (q.length < 2) {
            setResults([]);
            setSearched(q.length > 0);
            setLoading(false);
            return;
        }

        setLoading(true);
        setSearched(true);
        const controller = new AbortController();
        abortRef.current = controller;

        timeoutRef.current = setTimeout(async () => {
            try {
                const res = await searchProducts({ search: q, emi_available: true, per_page: 12 });
                if (controller.signal.aborted) return;
                setResults(res?.data ?? []);
            } catch {
                if (controller.signal.aborted) return;
                setResults([]);
            } finally {
                if (!controller.signal.aborted) setLoading(false);
            }
        }, 300);
    };

    const handleSelect = (p: SearchProduct) => {
        setEmiContextInfo((prev) => ({ ...prev, product: p as any }));
        setDrawerOpen(false);
        onProductSelected();
    };

    return (
        <>
            {/* ── Gate screen ── */}
            <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12">
                <div className="w-full max-w-md border border-slate-200 bg-white p-8 rounded-2xl text-center">

                    <div className="w-16 h-16 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center mx-auto mb-5">
                        <Package className="w-8 h-8 text-(--colour-fsP2)" strokeWidth={1.5} />
                    </div>

                    <h2 className="text-xl font-bold text-slate-900 mb-2">Choose a Product First</h2>
                    <p className="text-sm text-slate-500 leading-relaxed mb-7">
                        To start your EMI application, first search for the product you want to buy on EMI. We&apos;ll pre-fill the price and calculate your monthly payments automatically.
                    </p>

                    <button
                        onClick={() => setDrawerOpen(true)}
                        className="w-full flex items-center justify-center gap-2 py-3 px-5 bg-(--colour-fsP2) text-white font-bold text-sm rounded-xl hover:bg-blue-700 transition-colors mb-3"
                    >
                        <Search className="w-4 h-4" />
                        Search a Product
                    </button>

                    <Link
                        href="/emi/shop"
                        className="w-full flex items-center justify-center gap-2 py-3 px-5 border border-slate-200 text-slate-700 font-semibold text-sm rounded-xl hover:bg-slate-50 transition-colors"
                    >
                        <ShoppingBag className="w-4 h-4" />
                        Browse EMI Shop
                        <ChevronRight className="w-3.5 h-3.5 ml-auto" />
                    </Link>

                    <p className="text-xs text-slate-400 mt-5">
                        Already have a product in mind?{' '}
                        <Link href="/emi/shop" className="text-(--colour-fsP2) font-semibold hover:underline">
                            Find it here
                        </Link>
                    </p>
                </div>
            </div>

            {/* ── Search Drawer ── */}
            {drawerOpen && (
                <div
                    className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40"
                    onClick={(e) => { if (e.target === e.currentTarget) setDrawerOpen(false); }}
                >
                    <div className="w-full sm:max-w-lg bg-white rounded-t-2xl sm:rounded-2xl flex flex-col h-[88dvh] sm:h-[72vh]">

                        {/* Header */}
                        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-slate-100 shrink-0">
                            <Search className="w-4 h-4 text-slate-400 shrink-0" />
                            <input
                                ref={inputRef}
                                value={query}
                                onChange={(e) => handleQueryChange(e.target.value)}
                                placeholder="Search product name, e.g. iPhone 15, MacBook…"
                                className="flex-1 text-sm font-medium text-slate-800 placeholder-slate-400 outline-none bg-transparent"
                            />
                            <span className="w-5 h-5 flex items-center justify-center shrink-0">
                                {loading && <Loader2 className="w-4 h-4 text-slate-400 animate-spin" />}
                            </span>
                            <button
                                onClick={() => setDrawerOpen(false)}
                                className="p-1.5 rounded-xl hover:bg-slate-100 transition-colors shrink-0"
                            >
                                <X className="w-4 h-4 text-slate-500" />
                            </button>
                        </div>

                        {/* Results */}
                        <div className="overflow-y-auto flex-1">

                            {!searched && (
                                <div className="flex flex-col items-center justify-center h-full pb-10 text-center px-4">
                                    <div className="w-14 h-14 rounded-2xl bg-slate-50 flex items-center justify-center mb-3">
                                        <ShoppingBag className="w-7 h-7 text-slate-300" />
                                    </div>
                                    <p className="text-sm font-semibold text-slate-500">Type to search EMI-eligible products</p>
                                    <p className="text-xs text-slate-400 mt-1">Phones, laptops, tablets & more</p>
                                </div>
                            )}

                            {loading && (
                                <div className="p-2 divide-y divide-slate-50">
                                    {Array.from({ length: SKELETON_COUNT }, (_, i) => <SkeletonRow key={i} />)}
                                </div>
                            )}

                            {searched && !loading && results.length === 0 && (
                                <div className="flex flex-col items-center justify-center h-full pb-10 text-center px-4">
                                    <p className="text-sm font-semibold text-slate-500">No results for &ldquo;{query}&rdquo;</p>
                                    <p className="text-xs text-slate-400 mt-1">
                                        Try a different keyword or{' '}
                                        <Link href="/emi/shop" onClick={() => setDrawerOpen(false)} className="text-(--colour-fsP2) font-semibold underline">
                                            browse the EMI shop
                                        </Link>
                                    </p>
                                </div>
                            )}

                            {!loading && results.length > 0 && (
                                <ul className="divide-y divide-slate-50">
                                    {results.map((p) => {
                                        const price = p.emi_price ?? p.price;
                                        const emiPerMonth = price > 0 ? Math.round(price / 12) : null;
                                        return (
                                            <li key={p.id}>
                                                <button
                                                    onClick={() => handleSelect(p)}
                                                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-50 active:bg-slate-100 transition-colors text-left group"
                                                >
                                                    <div className="w-12 h-12 rounded-xl bg-white border border-slate-100 flex items-center justify-center shrink-0 overflow-hidden group-hover:border-(--colour-fsP2) transition-colors">
                                                        {p.thumb ? (
                                                            <Image
                                                                src={p.thumb.url}
                                                                alt={p.thumb.alt_text ?? p.name}
                                                                width={48}
                                                                height={48}
                                                                className="w-full h-full object-contain p-1"
                                                                sizes="48px"
                                                            />
                                                        ) : (
                                                            <ShoppingBag className="w-5 h-5 text-slate-300" />
                                                        )}
                                                    </div>

                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-sm font-semibold text-slate-800 truncate leading-snug">{p.name}</p>
                                                        {p.brand?.name && (
                                                            <p className="text-[11px] text-slate-400 mt-0.5">{p.brand.name}</p>
                                                        )}
                                                        <div className="flex items-center gap-2 mt-1">
                                                            <span className="text-xs font-bold text-(--colour-fsP2)">
                                                                NPR {price.toLocaleString()}
                                                            </span>
                                                            {emiPerMonth && (
                                                                <span className="text-[10px] font-semibold text-slate-500 bg-blue-50 px-1.5 py-0.5 rounded-md">
                                                                    ~NPR {emiPerMonth.toLocaleString()}/mo
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>

                                                    <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-(--colour-fsP2) shrink-0 transition-colors" />
                                                </button>
                                            </li>
                                        );
                                    })}
                                </ul>
                            )}
                        </div>

                        {/* Footer */}
                        <div className="px-4 py-3 border-t border-slate-100 shrink-0 flex items-center justify-between">
                            <p className="text-xs text-slate-400">Can&apos;t find it?</p>
                            <Link
                                href="/emi/shop"
                                onClick={() => setDrawerOpen(false)}
                                className="text-xs font-bold text-(--colour-fsP2) hover:underline flex items-center gap-1"
                            >
                                Browse EMI Shop <ArrowRight className="w-3 h-3" />
                            </Link>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
