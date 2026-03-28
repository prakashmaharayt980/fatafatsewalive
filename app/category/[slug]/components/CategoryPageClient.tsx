'use client';

import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import type { FilterState, ViewMode } from '../types';
import { INITIAL_FILTERS } from '../types';
import { fetchCategoryProducts } from './actions';

import dynamic from 'next/dynamic';
import { ProductCardSkeleton, FilterSidebarSkeleton } from './Skeletons';

const MobileFilterDrawer = dynamic(() => import('./MobileFilterDrawer'), { ssr: false });
const CategoryBanner = dynamic(() => import('./CategoryBanner'), { ssr: true });
const FilterSidebar = dynamic(() => import('./FilterSidebar'), {
    ssr: true,
    loading: () => <FilterSidebarSkeleton />
});
const CategoryHeader = dynamic(() => import('./CategoryHeader'), { ssr: true });
const ProductGrid = dynamic(() => import('./ProductGrid'), {
    ssr: true,
    loading: () => <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
        {[...Array(8)].map((_, i) => <ProductCardSkeleton key={i} />)}
    </div>
});
const ParsedContent = dynamic(() => import('@/app/products/ParsedContent'), { ssr: true });

import { SmartStickyWrapper } from './SmartStickyWrapper';
import type { CategoryPageClientProps } from './interfaces';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function buildQueryString(filters: FilterState): string {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
        const defaultValue = INITIAL_FILTERS[key as keyof FilterState];
        const isDefault = Array.isArray(value) && Array.isArray(defaultValue)
            ? value.length === defaultValue.length && value.every((v, i) => v === defaultValue[i])
            : value === defaultValue;

        if (value !== undefined && value !== null && !isDefault && value !== false) {
            params.set(key, Array.isArray(value) ? value.join(',') : String(value));
        }
    });
    return params.toString();
}


function parseFilters(sp: Record<string, string>): FilterState {
    return {
        ...INITIAL_FILTERS,
        ...(sp.sort && { sort: sp.sort as FilterState['sort'] }),
        ...(sp.emi_enabled === 'true' && { emi_enabled: true }),
        ...(sp.pre_order === 'true' && { pre_order: true }),
        ...(sp.exchange_available === 'true' && { exchange_available: true }),
        ...(sp.min_price && { min_price: Number(sp.min_price) }),
        ...(sp.max_price && { max_price: Number(sp.max_price) }),
        ...(sp.category && { category: sp.category.split(',') }),
        ...(sp.brand && { brand: sp.brand.split(',') }),
    };
}

// Always produce a fresh object — prevents React bailing out on same reference
function freshFilters(f: FilterState): FilterState {
    return { ...f };
}

// ─── Core fetch helper — used by both useEffect and clearAllFilters ───────────

function runFetch(
    slug: string,
    filters: FilterState,
    abortRef: React.MutableRefObject<AbortController | null>,
    setProducts: React.Dispatch<React.SetStateAction<any[]>>,
    setMeta: React.Dispatch<React.SetStateAction<any>>,
    setIsFetching: React.Dispatch<React.SetStateAction<boolean>>,
) {
    if (abortRef.current) abortRef.current.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setProducts([]);
    setMeta({ current_page: 1, per_page: 10, total: 0, last_page: 1 });
    setIsFetching(true);

    fetchCategoryProducts({ slug, filters, page: 1 })
        .then(result => {
            if (controller.signal.aborted) return;
            if (!result.error) {
                setProducts(result.products);
                setMeta(result.meta);
            }
        })
        .finally(() => {
            if (!controller.signal.aborted) setIsFetching(false);
        });

    return controller;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function CategoryPageClient({
    categoryId,
    slug,
    title,
    category,
    bannerData,
    initialProducts,
    initialCategories,
    initialBrands,
    sub_category,
}: CategoryPageClientProps) {

    const pathname = usePathname();
    const searchParams = useSearchParams();

    const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
    const [viewMode, setViewMode] = useState<ViewMode>('grid5');

    // sub_category seeded once into filters.category — never injected again after init
    const [filters, setFiltersState] = useState<FilterState>(() => {
        const sp = Object.fromEntries(searchParams.entries());
        const parsed = parseFilters(sp);
        if (sub_category && !sp.category) {
            parsed.category = [sub_category];
        }
        return parsed;
    });

    const [products, setProducts] = useState<any[]>(
        initialProducts?.data?.products ?? []
    );
    const [meta, setMeta] = useState(
        initialProducts?.meta ?? { current_page: 1, per_page: 10, total: 0, last_page: 1 }
    );
    const [isFetching, setIsFetching] = useState(false);
    const [isLoadingMore, setIsLoadingMore] = useState(false);

    const isFirstMount = useRef(true);
    const isInternalUpdate = useRef(false);
    const abortRef = useRef<AbortController | null>(null);
    // When clear triggers its own fetch directly, skip the useEffect fetch
    const skipNextEffect = useRef(false);

    // ── Back/forward navigation sync ──
    useEffect(() => {
        if (isFirstMount.current) return;
        if (isInternalUpdate.current) {
            isInternalUpdate.current = false;
            return;
        }
        // Real browser navigation — re-parse URL
        const sp = Object.fromEntries(searchParams.entries());
        const parsed = parseFilters(sp);
        if (sp.sub_category && !sp.category) {
            parsed.category = [sp.sub_category];
        }
        setFiltersState(parsed);
    }, [searchParams]);

    // ── Re-fetch on filter change ──
    useEffect(() => {
        if (isFirstMount.current) {
            isFirstMount.current = false;
            return;
        }
        // clearAllFilters already handled the fetch — don't double fetch
        if (skipNextEffect.current) {
            skipNextEffect.current = false;
            return;
        }

        isInternalUpdate.current = true;
        const qs = buildQueryString(filters);
        window.history.replaceState(null, '', qs ? `${pathname}?${qs}` : pathname);

        const controller = runFetch(slug, filters, abortRef, setProducts, setMeta, setIsFetching);
        return () => controller.abort();
    }, [filters, pathname, slug]);

    // ── Load more ──
    const handleLoadMore = useCallback(async () => {
        if (isLoadingMore || meta.current_page >= meta.last_page) return;
        setIsLoadingMore(true);

        const result = await fetchCategoryProducts({
            slug,
            filters,
            page: meta.current_page + 1,
        });

        if (!result.error) {
            setProducts(prev => {
                const seen = new Set(prev.map((p: any) => p.id));
                return [...prev, ...result.products.filter((p: any) => !seen.has(p.id))];
            });
            setMeta(result.meta);
        }
        setIsLoadingMore(false);
    }, [isLoadingMore, meta, slug, filters]);

    // ── Filter setters ──
    const setFilters = useCallback(
        (updater: FilterState | ((prev: FilterState) => FilterState)) =>
            setFiltersState(updater),
        []
    );

    const toggleArrayFilter = useCallback(
        (key: 'category' | 'brand' | 'colors' | 'sizes', value: string | number) => {
            setFilters(prev => {
                const arr = prev[key] as (string | number)[];
                return {
                    ...prev,
                    [key]: arr.includes(value)
                        ? arr.filter(v => v !== value)
                        : [...arr, value],
                };
            });
        },
        [setFilters]
    );

    const clearAllFilters = useCallback(() => {
        // Update URL immediately
        isInternalUpdate.current = true;
        window.history.replaceState(null, '', pathname);

        // Tell the useEffect to skip — we're fetching here directly
        skipNextEffect.current = true;

        // freshFilters ensures new object reference even if already at defaults
        // This guarantees setFiltersState triggers a re-render + sidebar resets
        const cleared = freshFilters(INITIAL_FILTERS);
        setFiltersState(cleared);

        // Fetch directly — doesn't rely on useEffect
        runFetch(slug, cleared, abortRef, setProducts, setMeta, setIsFetching);
    }, [slug, pathname]);

    const handleSortChange = useCallback(
        (sort: FilterState['sort']) => setFilters(prev => ({ ...prev, sort })),
        [setFilters]
    );

    const handleFiltersChange = useCallback(
        (newFilters: FilterState) => setFilters(newFilters),
        [setFilters]
    );

    // ── Derived ──
    const activeFilterCount = useMemo(() => (
        (filters.category?.length ?? 0) +
        (filters.brand?.length ?? 0) +
        (filters.colors?.length ?? 0) +
        (filters.sizes?.length ?? 0) +
        (filters.min_price > 0 || filters.max_price < 100000 ? 1 : 0)
    ), [filters]);

    const hasMore = meta.current_page < meta.last_page;
    const categories = initialCategories ?? [];
    const brands = initialBrands ?? [];


    const filterSidebarProps = useMemo(() => ({
        filters,
        onFiltersChange: handleFiltersChange,
        onToggleFilter: toggleArrayFilter,
        onClearAll: clearAllFilters,
        categories,
        brands,
        loadingCategories: false,
        loadingBrands: false,
    }), [filters, handleFiltersChange, toggleArrayFilter, clearAllFilters, categories, brands]);


    return (
        <div className="min-h-screen bg-[#f8fafc] scrollbar-hide">
            <MobileFilterDrawer
                isOpen={mobileFilterOpen}
                onClose={() => setMobileFilterOpen(false)}
                onClear={clearAllFilters}
                onApply={() => setMobileFilterOpen(false)}
            >
                <div className="px-4 py-4">
                    <FilterSidebar {...filterSidebarProps} className="shadow-none border-0" />
                </div>
            </MobileFilterDrawer>

            <div className="max-w-8xl mx-auto px-4 lg:px-8 py-6 lg:py-8">
                <CategoryBanner category={category} bannerData={bannerData} />

                <CategoryHeader
                    title={title}
                    totalProducts={meta.total}
                    sortBy={filters.sort}
                    activeFilterCount={activeFilterCount}
                    onSortChange={handleSortChange}
                    onMobileFilterClick={() => setMobileFilterOpen(true)}
                    viewMode={viewMode}
                    onViewModeChange={setViewMode}
                />

                <div className="flex gap-8 mb-12">
                    <aside className="hidden lg:block w-72 shrink-0">
                        <SmartStickyWrapper topOffset={24} bottomOffset={24}>
                            <FilterSidebar {...filterSidebarProps} />
                        </SmartStickyWrapper>
                    </aside>

                    <main className="flex-1 min-w-0">
                        <ProductGrid
                            categoryId={categoryId}
                            filters={filters}
                            products={products}
                            meta={meta}
                            isLoading={isFetching}
                            isLoadingMore={isLoadingMore}
                            hasMore={hasMore}
                            onLoadMore={handleLoadMore}
                            categories={categories}
                            brands={brands}
                            viewMode={viewMode}
                            onToggleFilter={toggleArrayFilter}
                            onFiltersChange={handleFiltersChange}
                            onClearFilters={clearAllFilters}
                        />
                    </main>
                </div>

                {category?.description && (
                    <ParsedContent description={category.description} className="" />
                )}
            </div>
        </div>
    );
}