'use client';

import { useEffect, useState, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { X, Loader2, RotateCcw, ChevronRight, CreditCard, Scale } from 'lucide-react';
import type { ProductDetails } from '../types/ProductDetailsTypes';
import { toast } from 'sonner';
import CompareSearchComponent from './CompareSearchComponent';
import { cn } from '@/lib/utils';
import CustomIconImg from '@/app/CommonVue/CustomIconImg';
import { getProductBySlug } from '../api/services/product.service';
import { useCartStore } from '../context/CartContext';
import { useShallow } from 'zustand/react/shallow';

const hasFullData = (p: ProductDetails) => Object.keys(p.attributes ?? {}).length > 0;

const getPrice = (p: ProductDetails) =>
    p.discounted_price ?? (typeof p.price === 'object' ? p.price.current : p.price) ?? 0;

const getImage = (p: ProductDetails) =>
    p.thumb?.url ?? (p as any).image?.full ?? (p as any).image?.thumb ?? '/placeholder.png';

function CompareContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { compareList, setCompareList, removeFromCompare, clearCompare } = useCartStore(useShallow((state) => ({
        compareList: state.compareItems,
        setCompareList: state.setCompareItems,
        removeFromCompare: state.removeFromCompare,
        clearCompare: state.clearCompare,
    })));

    const slugsString = searchParams.get('slugs') ?? '';
    const initialSlugs = Array.from(new Set(slugsString ? slugsString.split(',').filter(Boolean) : []));
    const [loading, setLoading] = useState(initialSlugs.length > 0);

    // Stable ref so fetch effect can read current list without it being a dep
    const compareListRef = useRef<ProductDetails[]>(compareList);
    useEffect(() => { compareListRef.current = compareList; }, [compareList]);

    // Smart fetch: reuse products that already have full attribute data, only fetch missing ones
    useEffect(() => {
        const currentList = compareListRef.current;

        if (initialSlugs.length === 0) {
            if (currentList.length > 0) setCompareList([]);
            setLoading(false);
            return;
        }

        const slugsNeedingFetch = initialSlugs.filter(slug => {
            const existing = currentList.find(p => p.slug === slug);
            return !existing || !hasFullData(existing);
        });

        if (slugsNeedingFetch.length === 0) {
            // All slugs have full data — just reorder to match URL, no API calls
            const ordered = initialSlugs
                .map(slug => currentList.find(p => p.slug === slug))
                .filter((p): p is ProductDetails => !!p);
            setCompareList(ordered);
            setLoading(false);
            return;
        }

        setLoading(true);
        Promise.all(
            initialSlugs.map(async slug => {
                const existing = currentList.find(p => p.slug === slug && hasFullData(p));
                if (existing) return existing;
                return getProductBySlug(slug).catch(() => null);
            })
        )
            .then(fetched => setCompareList(fetched.filter((p): p is ProductDetails => !!p)))
            .catch(() => toast.error('Failed to load comparison data.'))
            .finally(() => setLoading(false));
    }, [slugsString]); // eslint-disable-line react-hooks/exhaustive-deps

    // Sync URL when compareList changes (skip on initial mount and while loading)
    const didMount = useRef(false);
    useEffect(() => {
        if (!didMount.current) { didMount.current = true; return; }
        if (loading) return;
        const currentSlugs = compareList.map(p => p.slug).join(',');
        if (currentSlugs !== slugsString) {
            router.replace(currentSlugs ? `/compare?slugs=${currentSlugs}` : '/compare');
        }
    }, [compareList, loading]); // eslint-disable-line react-hooks/exhaustive-deps

    // When adding from the page search: fetch full data immediately so no re-fetch is triggered
    const handleAddProduct = async (product: ProductDetails) => {
        if (compareList.some(p => p.id === product.id || p.slug === product.slug)) return;
        if (compareList.length >= 3) { toast.error('Max 3 products can be compared'); return; }

        if (!hasFullData(product)) {
            const full = await getProductBySlug(product.slug).catch(() => null);
            setCompareList([...compareListRef.current, full ?? product]);
        } else {
            setCompareList([...compareList, product]);
        }
    };

    const allAttrKeys = Array.from(
        new Set(compareList.flatMap(p => Object.keys(p.attributes ?? {})))
    );

    // Color palette for distinct matching groups per row
    const MATCH_COLOURS = [
        { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-l-2 border-emerald-400' },
        { bg: 'bg-violet-50',  text: 'text-violet-700',  border: 'border-l-2 border-violet-400' },
        { bg: 'bg-amber-50',   text: 'text-amber-700',   border: 'border-l-2 border-amber-400' },
    ] as const;

    // For a given spec key, returns a map of value → colour index (only for values shared by 2+)
    const getMatchMap = (key: string): Record<string, number> => {
        const vals = compareList.map(p => p?.attributes?.[key]);
        const freq: Record<string, number> = {};
        vals.forEach(v => { if (v) freq[v] = (freq[v] ?? 0) + 1; });
        const matchingVals = Object.entries(freq)
            .filter(([, count]) => count > 1)
            .map(([v]) => v);
        const map: Record<string, number> = {};
        matchingVals.forEach((v, i) => { map[v] = i % MATCH_COLOURS.length; });
        return map;
    };

    // Category of first product — restrict search to same category (client-side filter)
    const firstProduct = compareList[0];
    const categorySlug = firstProduct?.categories?.[0]?.slug;
    const categoryName = firstProduct?.categories?.[0]?.title;

    const COLS = 3;

    if (loading) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center gap-2">
                <Loader2 className="w-6 h-6 animate-spin text-(--colour-fsP2)" />
                <p className="text-sm text-gray-400">Loading products...</p>
            </div>
        );
    }

    // ── Shared product card renderer ──────────────────────────────────────────
    const renderProductCard = (idx: number, mobile = false) => {
        const product = compareList[idx];

        if (!product) {
            return (
                <div
                    key={`slot-${idx}-${mobile ? 'm' : 'd'}`}
                    className={cn('overflow-hidden h-full', mobile ? 'border border-dashed border-gray-200 rounded-xl' : 'border border-dashed border-gray-200 rounded-lg')}
                >
                    <CompareSearchComponent
                        onSelect={handleAddProduct}
                        excludeSlugs={compareList.map(p => p.slug)}
                        categorySlug={categorySlug}
                        categoryName={categoryName}
                    />
                </div>
            );
        }

        return (
            <article
                key={`card-${product.id}-${mobile ? 'm' : 'd'}`}
                className={cn(
                    'relative bg-white group overflow-hidden',
                    mobile ? 'border border-gray-200 rounded-xl' : ''
                )}
            >
                <button
                    onClick={() => removeFromCompare(product.id)}
                    aria-label={`Remove ${product.name}`}
                    className={cn(
                        'absolute z-10 flex items-center justify-center rounded-full bg-white border border-gray-200 text-gray-400 hover:text-red-500 hover:border-red-200 transition-all cursor-pointer',
                        mobile
                            ? 'top-1.5 right-1.5 w-5 h-5 opacity-100'
                            : 'top-2.5 right-2.5 w-6 h-6 opacity-0 group-hover:opacity-100'
                    )}
                >
                    <X className={mobile ? 'w-2.5 h-2.5' : 'w-3 h-3'} />
                </button>

                <div className={cn('flex flex-col items-center text-center', mobile ? 'p-2 gap-1.5' : 'p-4 gap-3')}>
                    <div className={cn('relative w-full bg-gray-50 rounded-lg border border-gray-100 overflow-hidden', mobile ? 'h-24' : 'h-40')}>
                        <Image
                            src={getImage(product)}
                            alt={product.name}
                            fill
                            sizes="(max-width:768px) 33vw, 25vw"
                            className={cn('object-contain', mobile ? 'p-1.5' : 'p-3')}
                        />
                    </div>

                    <div className="w-full space-y-1">
                        {product.brand && !mobile && (
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                                {product.brand.name}
                            </p>
                        )}
                        <h3 className={cn('font-semibold text-gray-900 leading-snug', mobile ? 'text-[10px] line-clamp-2' : 'text-[13px] line-clamp-2')}>
                            <Link href={`/product-details/${product.slug}`} className="hover:text-(--colour-fsP2) transition-colors">
                                {product.name}
                            </Link>
                        </h3>
                        <p className={cn('font-bold text-(--colour-fsP2)', mobile ? 'text-[10px]' : 'text-sm')}>
                            Rs. {getPrice(product).toLocaleString()}
                        </p>
                        {(product.emi_enabled === 1 || product.emi_enabled === true) && (
                            <span className={cn('inline-flex items-center font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-full', mobile ? 'gap-0.5 text-[8px] px-1 py-0.5' : 'gap-1 text-[10px] px-2 py-0.5')}>
                                <CreditCard className={mobile ? 'w-2 h-2' : 'w-3 h-3'} />
                                EMI
                            </span>
                        )}
                        <Link
                            href={`/product-details/${product.slug}`}
                            className={cn(
                                'block w-full border text-(--colour-fsP2) font-semibold rounded-lg hover:bg-(--colour-fsP2) hover:text-white transition-colors',
                                mobile ? 'py-1 border-gray-200 text-[9px] rounded-md hover:bg-gray-50 hover:text-gray-700' : 'py-1.5 mt-0.5 border-(--colour-fsP2) text-xs'
                            )}
                        >
                            {mobile ? 'View' : 'View Details'}
                        </Link>
                    </div>
                </div>
            </article>
        );
    };

    return (
        <main className="min-h-screen bg-white pb-32">
            <div className="max-w-7xl mx-auto px-3 sm:px-4">

                {/* Breadcrumb */}
                <div className="py-3 sm:py-4 flex items-center justify-between border-b border-gray-100 mb-4 sm:mb-8">
                    <nav className="flex items-center gap-1.5 text-xs sm:text-sm text-gray-500">
                        <Link href="/" className="text-(--colour-fsP2) hover:underline font-medium">Home</Link>
                        <ChevronRight className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                        <span className="font-medium text-gray-700">Compare</span>
                    </nav>
                    {compareList.length > 0 && (
                        <button
                            onClick={() => clearCompare()}
                            className="flex items-center gap-1.5 text-[11px] sm:text-xs font-medium text-red-500 border border-red-100 px-2.5 sm:px-3 py-1.5 rounded-lg hover:bg-red-50 transition-colors cursor-pointer"
                        >
                            <RotateCcw className="w-3 h-3" />
                            Clear
                        </button>
                    )}
                </div>

                {/* ── MOBILE LAYOUT (< md) ── no horizontal scroll */}
                <div className="md:hidden">
                    <div className="grid grid-cols-3 gap-1.5 mb-5">
                        {Array.from({ length: COLS }, (_, idx) => renderProductCard(idx, true))}
                    </div>

                    {compareList.length > 0 && (
                        <div className="mt-2">
                            <div className="flex items-center gap-1.5 mb-3">
                                <Scale className="w-3.5 h-3.5 text-(--colour-fsP2)" />
                                <h2 className="text-xs font-bold text-gray-700 uppercase tracking-wide">Specifications</h2>
                            </div>

                            {allAttrKeys.length === 0 ? (
                                <div className="border border-gray-100 rounded-xl p-6 text-center">
                                    <p className="text-xs text-gray-400">No specifications available.</p>
                                </div>
                            ) : (
                                <div className="border border-gray-200 rounded-xl overflow-hidden">
                                    {allAttrKeys.map((key, i) => (
                                        <div key={key} className={cn('border-b border-gray-100 last:border-b-0', i % 2 === 0 ? 'bg-white' : 'bg-gray-50/50')}>
                                            {/* Full-width key row */}
                                            <div className="flex justify-center items-center gap-1.5 px-3 py-1.5 bg-gray-50 border-b border-gray-100">
                                                <CustomIconImg iconKey={key} size={11} className="text-(--colour-fsP2) shrink-0" color="currentColor" />
                                                <span className="text-[10px]   font-bold text-(--colour-fsP2) uppercase tracking-wide">{key}</span>
                                            </div>
                                            {/* 3-col values */}
                                            <div className="grid grid-cols-3 divide-x divide-gray-100">
                                                {(() => {
                                                    const matchMap = getMatchMap(key);
                                                    return Array.from({ length: COLS }, (_, colIdx) => {
                                                        const p = compareList[colIdx];
                                                        const value = p?.attributes?.[key];
                                                        const colourIdx = value != null ? matchMap[value] : undefined;
                                                        const colour = colourIdx != null ? MATCH_COLOURS[colourIdx] : null;
                                                        return (
                                                            <div key={colIdx} className={cn(
                                                                'px-2 py-2 text-[10px] leading-snug',
                                                                colour ? `${colour.bg} ${colour.text} ${colour.border} font-semibold` : 'text-gray-700'
                                                            )}>
                                                                {p ? (value ?? <span className="text-gray-300">—</span>) : <span className="text-gray-200">—</span>}
                                                            </div>
                                                        );
                                                    });
                                                })()}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {compareList.length === 0 && (
                        <div className="border border-dashed border-gray-200 rounded-xl p-10 text-center mt-2">
                            <Scale className="w-7 h-7 text-gray-200 mx-auto mb-2" />
                            <p className="text-sm font-semibold text-gray-500">Add products to compare</p>
                            <p className="text-xs text-gray-400 mt-1">Select up to 3 products</p>
                        </div>
                    )}
                </div>

                {/* ── DESKTOP LAYOUT (md+) — single unified frame ── */}
                <div className="hidden md:block overflow-x-auto">
                    <div className="min-w-160 border border-gray-200 rounded-xl overflow-hidden">

                        {/* Product header row — same grid as spec rows */}
                        <div className="grid grid-cols-[200px_repeat(3,minmax(200px,1fr))] border-b border-gray-200 bg-white">
                            <div className="px-4 py-4 border-r border-gray-200 flex items-center">
                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Products</span>
                            </div>
                            {Array.from({ length: COLS }, (_, idx) => (
                                <div key={idx} className="border-r border-gray-200 last:border-r-0 p-3">
                                    {renderProductCard(idx, false)}
                                </div>
                            ))}
                        </div>

                        {/* Specs section header */}
                        {compareList.length > 0 && allAttrKeys.length > 0 && (
                            <div className="grid grid-cols-[200px_repeat(3,minmax(200px,1fr))] bg-gray-50 border-b border-gray-200">
                                <div className="px-4 py-2.5 border-r border-gray-200 flex items-center gap-2">
                                    <Scale className="w-3.5 h-3.5 text-(--colour-fsP2)" />
                                    <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Specs</span>
                                </div>
                                {Array.from({ length: COLS }, (_, idx) => (
                                    <div key={idx} className="border-r border-gray-200 last:border-r-0 px-4 py-2.5">
                                        {compareList[idx] && (
                                            <span className="text-[11px] font-semibold text-gray-400 truncate block">
                                                {compareList[idx].brand?.name ?? ''}
                                            </span>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Spec rows */}
                        {compareList.length > 0 && allAttrKeys.length === 0 && (
                            <div className="p-8 text-center">
                                <p className="text-sm text-gray-400">No specifications available for these products.</p>
                            </div>
                        )}

                        {compareList.length > 0 && allAttrKeys.map((key, i) => (
                            <div
                                key={key}
                                className={cn(
                                    'grid grid-cols-[200px_repeat(3,minmax(200px,1fr))] border-b border-gray-100 last:border-b-0',
                                    i % 2 === 0 ? 'bg-white' : 'bg-gray-50/40'
                                )}
                            >
                                <div className="px-4 py-3 flex items-start gap-2 border-r border-gray-100 min-w-0 bg-gray-50/60">
                                    <CustomIconImg iconKey={key} size={13} className="text-(--colour-fsP2) shrink-0 mt-0.5" color="currentColor" />
                                    <span className="text-[11px] font-bold text-(--colour-fsP2) uppercase tracking-wide leading-tight whitespace-nowrap overflow-hidden text-ellipsis">{key}</span>
                                </div>
                                {(() => {
                                    const matchMap = getMatchMap(key);
                                    return Array.from({ length: COLS }, (_, colIdx) => {
                                        const p = compareList[colIdx];
                                        const value = p?.attributes?.[key];
                                        const colourIdx = value != null ? matchMap[value] : undefined;
                                        const colour = colourIdx != null ? MATCH_COLOURS[colourIdx] : null;
                                        return (
                                            <div key={colIdx} className={cn(
                                                'px-4 py-3 text-[13px] border-r border-gray-100 last:border-r-0 leading-snug',
                                                colour ? `${colour.bg} ${colour.text} ${colour.border} font-semibold` : 'text-gray-700'
                                            )}>
                                                {p ? (value ?? <span className="text-gray-300 text-xs">—</span>) : <span className="text-gray-200 text-xs">—</span>}
                                            </div>
                                        );
                                    });
                                })()}
                            </div>
                        ))}

                        {compareList.length === 0 && (
                            <div className="p-16 text-center">
                                <Scale className="w-8 h-8 text-gray-200 mx-auto mb-3" />
                                <p className="text-sm font-semibold text-gray-500">Add products to compare</p>
                                <p className="text-xs text-gray-400 mt-1">Select up to 3 products to compare side by side</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </main>
    );
}

export default function CompareClient() {
    return (
        <Suspense fallback={null}>
            <CompareContent />
        </Suspense>
    );
}
