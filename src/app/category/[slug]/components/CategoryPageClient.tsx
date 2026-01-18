'use client';

import React, { useState, useCallback } from 'react';
import { SWRConfig } from 'swr';
import {
    FilterState,
    CategoryProductsResponse,
    CategoryData,
    BrandData,
    ViewMode,
    INITIAL_FILTERS,
} from '../types';
import { useFilters, useFilterData } from '../hooks';
import FilterSidebar from "./FilterSidebar";
import ProductGrid from './ProductGrid';
import CategoryHeader from './CategoryHeader';
import MobileFilterDrawer from "./MobileFilterDrawer";
import { SmartStickyWrapper } from './SmartStickyWrapper';

// ============================================
// GLOBAL STYLES
// ============================================
const GlobalStyles = () => (
    <style jsx global>{`
        @keyframes fadeInUp {
            from {
                opacity: 0;
                transform: translateY(20px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }

        .animate-fadeInUp {
            animation: fadeInUp 0.5s ease-out forwards;
            opacity: 0;
        }

        .custom-scrollbar::-webkit-scrollbar {
            width: 6px;
        }

        .custom-scrollbar::-webkit-scrollbar-track {
            background: transparent;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb {
            background: linear-gradient(to bottom, #fed7aa, #fdba74);
            border-radius: 10px;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
            background: linear-gradient(to bottom, #fdba74, #fb923c);
        }
    `}</style>
);

// ============================================
// MAIN CLIENT COMPONENT
// ============================================
interface CategoryPageClientProps {
    categoryId: string;
    slug: string;
    title: string;
    initialProducts: CategoryProductsResponse;
    initialCategories: CategoryData[];
    initialBrands: BrandData[];
    fallback?: Record<string, unknown>;
}

export default function CategoryPageClient({
    categoryId,
    slug,
    title,
    initialProducts,
    initialCategories,
    initialBrands,
    fallback = {},
}: CategoryPageClientProps) {
    // UI State
    const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
    const [viewMode, setViewMode] = useState<ViewMode>('grid');

    // Filter hook with URL sync
    const {
        filters,
        setFilters,
        toggleArrayFilter,
        clearAllFilters,
        activeFilterCount,
        isPending,
    } = useFilters({ syncToUrl: true });

    // Filter data with hydrated initial data
    const { categories, brands, isLoading: filterDataLoading } = useFilterData(
        initialCategories,
        initialBrands
    );

    // Handlers
    const handleSortChange = useCallback(
        (sortBy: FilterState['sortBy']) => {
            setFilters((prev) => ({ ...prev, sortBy }));
        },
        [setFilters]
    );

    const handleFiltersChange = useCallback(
        (newFilters: FilterState) => {
            setFilters(newFilters);
        },
        [setFilters]
    );

    const handleMobileFilterOpen = useCallback(() => {
        setMobileFilterOpen(true);
    }, []);

    const handleMobileFilterClose = useCallback(() => {
        setMobileFilterOpen(false);
    }, []);

    const handleMobileFilterApply = useCallback(() => {
        setMobileFilterOpen(false);
    }, []);

    return (
        <SWRConfig value={{ fallback }}>
            <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
                {/* Mobile Filter Drawer */}
                <MobileFilterDrawer
                    isOpen={mobileFilterOpen}
                    onClose={handleMobileFilterClose}
                    onClear={clearAllFilters}
                    onApply={handleMobileFilterApply}
                >
                    <div className="px-4 py-4">
                        <FilterSidebar
                            filters={filters}
                            onFiltersChange={handleFiltersChange}
                            onToggleFilter={toggleArrayFilter}
                            onClearAll={clearAllFilters}
                            categories={categories}
                            brands={brands}
                            loadingCategories={filterDataLoading}
                            loadingBrands={filterDataLoading}
                            activeFilterCount={activeFilterCount}
                            className="shadow-none border-0"
                        />
                    </div>
                </MobileFilterDrawer>

                <div className="max-w-[1600px] mx-auto px-4 lg:px-8 py-6 lg:py-8">
                    {/* Header */}
                    <CategoryHeader
                        title={title}
                        totalProducts={initialProducts.meta?.total || 0}
                        sortBy={filters.sortBy}
                        viewMode={viewMode}
                        activeFilterCount={activeFilterCount}
                        onSortChange={handleSortChange}
                        onViewModeChange={setViewMode}
                        onMobileFilterClick={handleMobileFilterOpen}
                    />

                    {/* Loading indicator for filter changes */}
                    {isPending && (
                        <div className="mb-4">
                            <div className="h-1 bg-orange-100 rounded-full overflow-hidden">
                                <div className="h-full bg-gradient-to-r from-orange-500 to-amber-500 animate-pulse w-1/2" />
                            </div>
                        </div>
                    )}

                    {/* Main Layout */}
                    <div className="flex gap-8">
                        {/* Desktop Sidebar */}
                        <aside className="hidden lg:block w-72 flex-shrink-0">
                            <SmartStickyWrapper topOffset={24} bottomOffset={24}>
                                <FilterSidebar
                                    filters={filters}
                                    onFiltersChange={handleFiltersChange}
                                    onToggleFilter={toggleArrayFilter}
                                    onClearAll={clearAllFilters}
                                    categories={categories}
                                    brands={brands}
                                    loadingCategories={filterDataLoading}
                                    loadingBrands={filterDataLoading}
                                    activeFilterCount={activeFilterCount}
                                />
                            </SmartStickyWrapper>
                        </aside>

                        {/* Product Grid */}
                        <main className="flex-1 min-w-0">
                            <ProductGrid
                                categoryId={categoryId}
                                filters={filters}
                                initialData={initialProducts}
                                categories={categories}
                                brands={brands}
                                viewMode={viewMode}
                                onToggleFilter={toggleArrayFilter}
                                onFiltersChange={handleFiltersChange}
                                onClearFilters={clearAllFilters}
                            />
                        </main>
                    </div>
                </div>

                <GlobalStyles />
            </div>
        </SWRConfig>
    );
}