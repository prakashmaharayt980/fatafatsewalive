'use client';

import React, { memo } from 'react';
import { cn } from '@/lib/utils';
import type { BasketProduct } from '@/app/types/ProductDetailsTypes';
import { type FilterState, type ViewMode, INITIAL_FILTERS } from '../types';
import { ActiveFilterTag } from './FilterSidebar';
import ProductCard, { ProductCardRow } from './ProductCard';
import type {
    ProductGridProps,
    ActiveFiltersBarProps,
    EmptyStateProps,
    LoadingGridProps,
} from './interfaces';

// ─── Grid columns by view mode ────────────────────────────────────────────────

const GRID_COLS: Record<ViewMode, string> = {
    grid3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
    grid4: 'grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
    grid5: 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5',
    list:  'grid-cols-1',
};

// ─── Loading skeleton ─────────────────────────────────────────────────────────

const LoadingGrid = memo(({ count = 10, viewMode = 'grid5' }: LoadingGridProps) => (
    <div className={cn('grid gap-4', GRID_COLS[viewMode])}>
        {[...Array(count)].map((_, i) => (
            <div
                key={i}
                className="bg-white rounded-xl border border-gray-100 overflow-hidden"
                style={{ animationDelay: `${i * 40}ms` }}
            >
                <div className="aspect-square bg-gray-100 animate-pulse" />
                <div className="p-3 space-y-2">
                    <div className="h-2.5 w-16 bg-gray-200 rounded animate-pulse" />
                    <div className="h-3.5 bg-gray-200 rounded animate-pulse" />
                    <div className="h-3.5 w-3/4 bg-gray-200 rounded animate-pulse" />
                    <div className="h-5 w-24 bg-gray-200 rounded animate-pulse mt-1" />
                </div>
            </div>
        ))}
    </div>
));
LoadingGrid.displayName = 'LoadingGrid';

// ─── Empty state ──────────────────────────────────────────────────────────────

const EmptyState = memo(({ onClearFilters }: EmptyStateProps) => (
    <div className="flex flex-col items-center justify-center py-24 text-center">
        <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
            <svg className="w-7 h-7 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round"
                    d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
            </svg>
        </div>
        <p className="text-[15px] font-medium text-gray-700 mb-1">No products found</p>
        <p className="text-[13px] text-gray-400 mb-5">Try adjusting or clearing your filters</p>
        <button
            onClick={onClearFilters}
            className="px-5 py-2 rounded-lg border border-gray-200 text-[13px] font-medium text-gray-600 hover:bg-gray-50 transition-colors cursor-pointer"
        >
            Clear filters
        </button>
    </div>
));
EmptyState.displayName = 'EmptyState';

// ─── Active filters bar ───────────────────────────────────────────────────────

const ActiveFiltersBar = memo(({
    filters,
    categories,
    brands,
    onToggleFilter,
    onFiltersChange,
    onClearAll,
}: ActiveFiltersBarProps) => {
    const tags: { label: string; onRemove: () => void }[] = [];

    filters.category?.forEach(slug => {
        const cat = categories.find(c => c.slug === slug);
        if (cat) tags.push({
            label: cat.title,
            onRemove: () => onToggleFilter('category', slug),
        });
    });

    filters.brand?.forEach(slug => {
        const brand = brands.find(b => b.slug === slug);
        if (brand) tags.push({
            label: brand.name,
            onRemove: () => onToggleFilter('brand', slug),
        });
    });

    if (filters.min_price > 0 || filters.max_price < 100000) {
        tags.push({
            label: `Rs. ${filters.min_price.toLocaleString()} – ${filters.max_price.toLocaleString()}`,
            onRemove: () => onFiltersChange({
                ...filters,
                min_price: INITIAL_FILTERS.min_price,
                max_price: INITIAL_FILTERS.max_price,
            }),
        });
    }

    if (filters.pre_order) tags.push({
        label: 'Pre Order',
        onRemove: () => onFiltersChange({ ...filters, pre_order: false }),
    });

    if (filters.emi_enabled) tags.push({
        label: 'EMI Available',
        onRemove: () => onFiltersChange({ ...filters, emi_enabled: false }),
    });

    if (filters.exchange_available) tags.push({
        label: 'Exchange Available',
        onRemove: () => onFiltersChange({ ...filters, exchange_available: false }),
    });

    if (!tags.length) return null;

    return (
        <div className="flex flex-wrap items-center gap-2 mb-4">
            {tags.map(tag => (
                <ActiveFilterTag key={tag.label} label={tag.label} onRemove={tag.onRemove} />
            ))}
            {tags.length > 1 && (
                <button
                    onClick={onClearAll}
                    className="text-[11px] text-gray-400 hover:text-gray-700 underline underline-offset-2 cursor-pointer transition-colors"
                >
                    Clear all
                </button>
            )}
        </div>
    );
});
ActiveFiltersBar.displayName = 'ActiveFiltersBar';

// ─── Load more button ─────────────────────────────────────────────────────────

const LoadMoreButton = memo(({ onClick, isLoading }: { onClick: () => void; isLoading: boolean }) => (
    <div className="flex justify-center mt-8">
        <button
            onClick={onClick}
            disabled={isLoading}
            className="px-8 py-2.5 rounded-full border border-gray-200 text-[13px] font-medium text-gray-600 hover:bg-gray-50 hover:border-gray-300 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
        >
            {isLoading ? (
                <span className="flex items-center gap-2">
                    <svg className="w-4 h-4 animate-spin text-gray-400" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor"
                            d="M4 12a8 8 0 018-8v8H4z" />
                    </svg>
                    Loading...
                </span>
            ) : 'Load more'}
        </button>
    </div>
));
LoadMoreButton.displayName = 'LoadMoreButton';

// ─── ProductGrid ──────────────────────────────────────────────────────────────

const ProductGrid = memo(({
    filters,
    products,
    meta,
    isLoading,
    isLoadingMore,
    hasMore,
    onLoadMore,
    categories,
    brands,
    viewMode = 'grid5',
    onToggleFilter,
    onFiltersChange,
    onClearFilters,
}: ProductGridProps) => {
    const isListView = viewMode === 'list';

    return (
        <div>
            {/* Active filter tags */}
            <ActiveFiltersBar
                filters={filters}
                categories={categories}
                brands={brands}
                onToggleFilter={onToggleFilter}
                onFiltersChange={onFiltersChange}
                onClearAll={onClearFilters}
            />

            {/* Loading state — full grid skeleton */}
            {isLoading && <LoadingGrid count={10} viewMode={viewMode} />}

            {/* Empty state */}
            {!isLoading && products.length === 0 && (
                <EmptyState onClearFilters={onClearFilters} />
            )}

            {/* Product grid */}
            {!isLoading && products.length > 0 && (
                <>
                    <div className={cn(
                        isListView ? 'flex flex-col gap-3' : cn('grid gap-4', GRID_COLS[viewMode])
                    )}>
                        {products.map((product, i) =>
                            isListView ? (
                                <ProductCardRow
                                    key={`${product.id}-${i}`}
                                    product={product}
                                    index={i}
                                    priority={i < 4}
                                />
                            ) : (
                                <ProductCard
                                    key={`${product.id}-${i}`}
                                    product={product}
                                    index={i}
                                    priority={i < 6}
                                />
                            )
                        )}
                    </div>

                    {/* Load more skeleton rows appended below existing products */}
                    {isLoadingMore && (
                        <div className={cn(
                            'mt-4',
                            isListView ? 'flex flex-col gap-3' : cn('grid gap-4', GRID_COLS[viewMode])
                        )}>
                            {[...Array(5)].map((_, i) => (
                                <div key={i} className="bg-white rounded-xl border border-gray-100 overflow-hidden">
                                    <div className="aspect-square bg-gray-100 animate-pulse" />
                                    <div className="p-3 space-y-2">
                                        <div className="h-2.5 w-16 bg-gray-200 rounded animate-pulse" />
                                        <div className="h-3.5 bg-gray-200 rounded animate-pulse" />
                                        <div className="h-5 w-24 bg-gray-200 rounded animate-pulse" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Pagination info + load more */}
                    <div className="mt-6 flex flex-col items-center gap-2">
                        <p className="text-[12px] text-gray-400">
                            Showing {products.length} of {meta.total} products
                        </p>
                        {hasMore && (
                            <LoadMoreButton onClick={onLoadMore} isLoading={isLoadingMore} />
                        )}
                    </div>
                </>
            )}
        </div>
    );
});

ProductGrid.displayName = 'ProductGrid';
export default ProductGrid;