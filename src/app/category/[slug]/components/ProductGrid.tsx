'use client';

import React, { memo, useMemo, useCallback } from 'react';
import { Loader2, ShoppingBag } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
    FilterState,
    CategoryProductsResponse,
    CategoryData,
    BrandData,
    GRID_CONFIGS,
    COLORS,
    ViewMode,
} from '../types';
import { useProducts } from '../hooks';
import ProductCard, { ProductCardSkeleton, ProductCardRow, ProductCardRowSkeleton } from './ProductCard';
import { ActiveFilterTag } from './FilterSidebar';

// ============================================
// EMPTY STATE
// ============================================
interface EmptyStateProps {
    onClearFilters: () => void;
}

const EmptyState = memo(({ onClearFilters }: EmptyStateProps) => (
    <div className="text-center py-20">
        <div className="w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-6">
            <ShoppingBag size={40} className="text-gray-400" />
        </div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">No products found</h3>
        <p className="text-gray-500 mb-6 max-w-sm mx-auto">
            We couldn't find any products matching your criteria. Try adjusting your filters.
        </p>
        <button
            onClick={onClearFilters}
            className="bg-[var(--colour-fsP2)] text-white px-6 py-2.5 rounded-full font-medium hover:opacity-90 transition-all shadow-lg cursor-pointer"
        >
            Clear All Filters
        </button>
    </div>
));
EmptyState.displayName = 'EmptyState';

// ============================================
// LOADING GRID
// ============================================
interface LoadingGridProps {
    count?: number;
    viewMode?: ViewMode;
}

const LoadingGrid = memo(({ count = 12, viewMode = 'grid5' }: LoadingGridProps) => (
    <div className={cn('grid gap-2 sm:gap-4 lg:gap-6', GRID_CONFIGS[viewMode])}>
        {[...Array(count)].map((_, i) =>
            viewMode === 'list' ? (
                <ProductCardRowSkeleton key={i} />
            ) : (
                <ProductCardSkeleton key={i} />
            )
        )}
    </div>
));
LoadingGrid.displayName = 'LoadingGrid';

// ============================================
// ACTIVE FILTERS BAR
// ============================================
interface ActiveFiltersBarProps {
    filters: FilterState;
    categories: CategoryData[];
    brands: BrandData[];
    onToggleFilter: (key: 'categories' | 'brands' | 'colors' | 'sizes', value: string | number) => void;
    onFiltersChange: (filters: FilterState) => void;
    onClearAll: () => void;
}

const ActiveFiltersBar = memo(({
    filters,
    categories,
    brands,
    onToggleFilter,
    onFiltersChange,
    onClearAll,
}: ActiveFiltersBarProps) => {
    const activeFilters = useMemo(() => {
        const items: Array<{ key: string; label: string; onRemove: () => void }> = [];

        filters.categories.forEach((catId) => {
            const cat = categories.find((c) => c.id === catId);
            if (cat) {
                items.push({
                    key: `cat-${catId}`,
                    label: cat.title,
                    onRemove: () => onToggleFilter('categories', catId),
                });
            }
        });

        filters.brands.forEach((brandId) => {
            const brand = brands.find((b) => b.id === brandId);
            if (brand) {
                items.push({
                    key: `brand-${brandId}`,
                    label: brand.name,
                    onRemove: () => onToggleFilter('brands', brandId),
                });
            }
        });

        filters.colors.forEach((color) => {
            items.push({
                key: `color-${color}`,
                label: COLORS.find((c) => c.id === color)?.label || color,
                onRemove: () => onToggleFilter('colors', color),
            });
        });

        filters.sizes.forEach((size) => {
            items.push({
                key: `size-${size}`,
                label: `Size: ${size.toUpperCase()}`,
                onRemove: () => onToggleFilter('sizes', size),
            });
        });

        if (filters.inStock) {
            items.push({
                key: 'inStock',
                label: 'In Stock',
                onRemove: () => onFiltersChange({ ...filters, inStock: false }),
            });
        }

        if (filters.onSale) {
            items.push({
                key: 'onSale',
                label: 'On Sale',
                onRemove: () => onFiltersChange({ ...filters, onSale: false }),
            });
        }

        if (filters.emiOnly) {
            items.push({
                key: 'emiOnly',
                label: 'EMI Available',
                onRemove: () => onFiltersChange({ ...filters, emiOnly: false }),
            });
        }

        if (filters.priceRange[0] > 0 || filters.priceRange[1] < 100000) {
            items.push({
                key: 'price',
                label: `Rs. ${filters.priceRange[0].toLocaleString()} - Rs. ${filters.priceRange[1].toLocaleString()}`,
                onRemove: () => onFiltersChange({ ...filters, priceRange: [0, 100000] }),
            });
        }

        return items;
    }, [filters, categories, brands, onToggleFilter, onFiltersChange]);

    if (activeFilters.length === 0) return null;

    return (
        <div className="flex flex-wrap items-center gap-2 mb-6">
            {activeFilters.map((filter) => (
                <ActiveFilterTag
                    key={filter.key}
                    label={filter.label}
                    onRemove={filter.onRemove}
                />
            ))}
            <button
                onClick={onClearAll}
                className="text-sm text-gray-500 hover:text-[var(--colour-fsP2)] font-medium ml-2 transition-colors cursor-pointer"
            >
                Clear All
            </button>
        </div>
    );
});
ActiveFiltersBar.displayName = 'ActiveFiltersBar';

// ============================================
// MAIN PRODUCT GRID COMPONENT
// ============================================
interface ProductGridProps {
    categoryId: string;
    filters: FilterState;
    initialData?: CategoryProductsResponse;
    categories: CategoryData[];
    brands: BrandData[];
    viewMode?: ViewMode;
    onToggleFilter: (key: 'categories' | 'brands' | 'colors' | 'sizes', value: string | number) => void;
    onFiltersChange: (filters: FilterState) => void;
    onClearFilters: () => void;
}

const ProductGrid = memo(({
    categoryId,
    filters,
    initialData,
    categories,
    brands,
    viewMode = 'grid5',
    onToggleFilter,
    onFiltersChange,
    onClearFilters,
}: ProductGridProps) => {
    const {
        products,
        meta,
        isLoading,
        isLoadingMore,
        isEmpty,
        isReachingEnd,
        loadMore,
    } = useProducts({
        categoryId,
        filters,
        initialData,
        enabled: !!categoryId,
    });

    const handleLoadMore = useCallback(() => {
        if (!isLoadingMore && !isReachingEnd) {
            loadMore();
        }
    }, [isLoadingMore, isReachingEnd, loadMore]);

    if (isLoading && products.length === 0) {
        return <LoadingGrid count={viewMode === 'list' ? 6 : 12} viewMode={viewMode} />;
    }

    if (isEmpty || products.length === 0) {
        return <EmptyState onClearFilters={onClearFilters} />;
    }

    return (
        <div>
            {/* Active Filters */}
            <ActiveFiltersBar
                filters={filters}
                categories={categories}
                brands={brands}
                onToggleFilter={onToggleFilter}
                onFiltersChange={onFiltersChange}
                onClearAll={onClearFilters}
            />

            {/* Product Grid / List */}
            <div className={cn('grid gap-2 sm:gap-3 lg:gap-4', GRID_CONFIGS[viewMode])}>
                {products.map((product, index) =>
                    viewMode === 'list' ? (
                        <ProductCardRow
                            key={`${product.id}-${index}`}
                            product={product}
                            index={index}
                            priority={index < 4}
                        />
                    ) : (
                        <ProductCard
                            key={`${product.id}-${index}`}
                            product={product}
                            index={index}
                            priority={index < 4}
                        />
                    )
                )}
            </div>

            {/* Load More Section */}
            <div className="mt-8">
                {isLoadingMore && (
                    <div className="flex items-center justify-center py-8">
                        <Loader2 size={32} className="text-[var(--colour-fsP2)] animate-spin" />
                    </div>
                )}

                {!isLoadingMore && !isReachingEnd && (
                    <div className="text-center pb-8">
                        <button
                            onClick={handleLoadMore}
                            className="px-8 py-3 bg-[var(--colour-fsP2)] text-white border border-transparent rounded-full font-semibold text-sm hover:bg-white hover:text-[var(--colour-fsP2)] hover:border-[var(--colour-fsP2)] hover:shadow-lg transition-all duration-300 cursor-pointer w-48 mx-auto"
                        >
                            Show More
                        </button>
                    </div>
                )}

                {isReachingEnd && products.length > 0 && (
                    <p className="text-center text-gray-400 text-sm py-4">
                        You've seen all {meta?.total || products.length} products
                    </p>
                )}
            </div>
        </div>
    );
});

ProductGrid.displayName = 'ProductGrid';

export default ProductGrid;
export { LoadingGrid, EmptyState, ActiveFiltersBar };
