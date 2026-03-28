import React from 'react';
import type { FilterOption } from '@/app/types/category';
import type { FilterState, ViewMode, CategoryProductsResponse, CategoryData } from '../types';
import type { BasketProduct } from '@/app/types/ProductDetailsTypes';
import type { DecoratedProduct } from '@/app/types/DecoratedProduct';

// ─── FilterSidebar ────────────────────────────────────────────────────────────

export interface FilterSectionProps {
    title: string;
    icon?: React.ElementType;
    children: React.ReactNode;
    defaultOpen?: boolean;
    loading?: boolean;
    onClear?: () => void;
    showClear?: boolean;
}

export interface CheckboxItemProps {
    option: FilterOption;
    checked: boolean;
    onChange: (id: string | number) => void;
}

export interface SearchableListProps {
    items: Array<{ id: string | number; label: string }>;
    selectedIds: Array<string | number>;
    onToggle: (id: string | number) => void;
    placeholder?: string;
    emptyMessage?: string;
}

export interface PriceRangeSliderProps {
    min: number;
    max: number;
    value: [number, number];
    onChange: (v: [number, number]) => void;
}

export interface ToggleSwitchProps {
    label: string;
    checked: boolean;
    onChange: () => void;
}

export interface ActiveFilterTagProps {
    label: string;
    onRemove: () => void;
}

export interface FilterSidebarProps {
    filters: FilterState;
    onFiltersChange: (filters: FilterState) => void;
    onToggleFilter: (key: 'category' | 'brand' | 'colors' | 'sizes', value: string | number) => void;
    onClearAll: () => void;
    categories: { id: number; title: string; slug: string }[];
    brands: BrandData[];

    loadingCategories?: boolean;
    loadingBrands?: boolean;
    className?: string;
}

// ─── CategoryHeader ───────────────────────────────────────────────────────────

export interface SortDropdownProps {
    value: FilterState['sort'];
    onChange: (value: FilterState['sort']) => void;
}

export interface CategoryHeaderProps {
    title: string;
    totalProducts: number;
    sortBy: FilterState['sort'];
    activeFilterCount: number;
    onSortChange: (sortBy: FilterState['sort']) => void;
    onMobileFilterClick: () => void;
    viewMode: ViewMode;
    onViewModeChange: (mode: ViewMode) => void;
}

export interface ViewModeToggleProps {
    value: ViewMode;
    onChange: (mode: ViewMode) => void;
}

// ─── ProductCard ──────────────────────────────────────────────────────────────

export interface ProductCardProps {
    product: DecoratedProduct;
    index?: number;
    priority?: boolean;
}

export interface ProductCardRowProps {
    product: DecoratedProduct;
    index?: number;
    priority?: boolean;
}

// ─── ProductGrid ──────────────────────────────────────────────────────────────

export interface BrandData {
    id?: number;
    name: string;
    slug: string;
}


export interface ProductMeta {
    current_page: number;
    per_page: number;
    total: number;
    last_page: number;
}

export interface EmptyStateProps {
    onClearFilters: () => void;
}

export interface LoadingGridProps {
    count?: number;
    viewMode?: ViewMode;
}

export interface ActiveFiltersBarProps {
    filters: FilterState;
    categories: { id: number; title: string; slug: string }[];
    brands: BrandData[];
    onToggleFilter: (key: 'category' | 'brand' | 'colors' | 'sizes', value: string | number) => void;
    onFiltersChange: (filters: FilterState) => void;
    onClearAll: () => void;
}

export interface ProductGridProps {
    categoryId: string;
    filters: FilterState;
    // Client-managed — passed down from CategoryPageClient
    products: DecoratedProduct[];
    meta: ProductMeta;
    isLoading: boolean;
    isLoadingMore: boolean;
    hasMore: boolean;
    onLoadMore: () => void;
    // Shared
    categories: { id: number; title: string; slug: string }[];
    brands: BrandData[];
    viewMode?: ViewMode;
    onToggleFilter: (key: 'category' | 'brand' | 'colors' | 'sizes', value: string | number) => void;
    onFiltersChange: (filters: FilterState) => void;
    onClearFilters: () => void;
}

// ─── MobileFilterDrawer ───────────────────────────────────────────────────────

export interface MobileFilterDrawerProps {
    isOpen: boolean;
    onClose: () => void;
    onClear: () => void;
    onApply: () => void;
    children: React.ReactNode;
}

// ─── SmartStickyWrapper ───────────────────────────────────────────────────────

export interface SmartStickyWrapperProps {
    children: React.ReactNode;
    topOffset?: number;
    bottomOffset?: number;
}

// ─── CategoryBanner ───────────────────────────────────────────────────────────

export interface BannerImage {
    id: string;
    image?: { full: string };
    url?: string;
    link?: string;
    order: number;
}

export interface CategoryBannerProps {
    category: CategoryData | null;
    bannerData?: { images: BannerImage[] };
}

// ─── CategoryPageClient ───────────────────────────────────────────────────────

export interface CategoryPageClientProps {
    categoryId: string;
    slug: string;
    title: string;
    category: CategoryData | null;
    bannerData?: any;
    initialProducts: CategoryProductsResponse;
    initialCategories: CategoryData[];
    initialBrands?: BrandData[];
    sub_category?: string;
}