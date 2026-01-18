'use client';

import { useState, useCallback, useMemo, useTransition, useEffect, useRef } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import useSWR from 'swr';
import useSWRInfinite from 'swr/infinite';
import {
    FilterState,
    CategoryProductsResponse,
    INITIAL_FILTERS,
    Product,
    CategoryData,
    BrandData,
} from './types';
import {
    buildFilterQueryString,
    buildApiParams,
    parseFiltersFromSearchParams,
    hasFiltersChanged,
} from './utils';
import RemoteServices from '@/app/api/remoteservice';

// ============================================
// FILTER HOOK WITH URL SYNC
// ============================================
interface UseFiltersOptions {
    initialFilters?: Partial<FilterState>;
    syncToUrl?: boolean;
}

export const useFilters = (options: UseFiltersOptions = {}) => {
    const { initialFilters = {}, syncToUrl = true } = options;
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const [isPending, startTransition] = useTransition();

    // Initialize filters from URL or defaults
    const [filters, setFiltersState] = useState<FilterState>(() => ({
        ...INITIAL_FILTERS,
        ...parseFiltersFromSearchParams(Object.fromEntries(searchParams.entries())),
        ...initialFilters,
    }));

    // Track previous filters for comparison
    const prevFiltersRef = useRef<FilterState>(filters);

    // Update URL when filters change (Silent update to avoid page refresh)
    const updateUrl = useCallback((newFilters: FilterState) => {
        if (!syncToUrl) return;

        const queryString = buildFilterQueryString(newFilters);

        // Preserve 'id' from current search params if it exists
        const currentId = searchParams.get('id');
        let finalQuery = queryString;
        if (currentId) {
            finalQuery = queryString ? `${queryString}&id=${currentId}` : `id=${currentId}`;
        }

        const newUrl = finalQuery ? `${pathname}?${finalQuery}` : pathname;

        // Use window.history methods to update URL without triggering Next.js navigation/re-render
        // This solves "not that change page" while keeping "observation"
        window.history.replaceState(null, '', newUrl);

    }, [pathname, syncToUrl, searchParams]);

    // Set filters with URL sync
    const setFilters = useCallback((
        updater: FilterState | ((prev: FilterState) => FilterState)
    ) => {
        setFiltersState((prev) => {
            const newFilters = typeof updater === 'function' ? updater(prev) : updater;

            if (hasFiltersChanged(newFilters, prev)) {
                updateUrl(newFilters);
            }

            return newFilters;
        });
    }, [updateUrl]);

    // Toggle array filter (categories, brands, colors, sizes)
    const toggleArrayFilter = useCallback((
        key: 'categories' | 'brands' | 'colors' | 'sizes',
        value: string | number
    ) => {
        setFilters((prev) => {
            const arr = prev[key] as (string | number)[];
            const newArr = arr.includes(value)
                ? arr.filter((v) => v !== value)
                : [...arr, value];
            return { ...prev, [key]: newArr };
        });
    }, [setFilters]);

    // Clear all filters
    const clearAllFilters = useCallback(() => {
        setFilters(INITIAL_FILTERS);
    }, [setFilters]);

    // Calculate active filter count
    const activeFilterCount = useMemo(() => {
        return (
            filters.categories.length +
            filters.brands.length +
            filters.colors.length +
            filters.sizes.length +
            (filters.inStock ? 1 : 0) +
            (filters.onSale ? 1 : 0) +
            (filters.priceRange[0] > 0 || filters.priceRange[1] < 100000 ? 1 : 0)
        );
    }, [filters]);

    // Check if filters changed from initial
    const hasActiveFilters = activeFilterCount > 0;

    return {
        filters,
        setFilters,
        toggleArrayFilter,
        clearAllFilters,
        activeFilterCount,
        hasActiveFilters,
        isPending,
    };
};

// ============================================
// PRODUCTS HOOK WITH INFINITE LOADING
// ============================================
interface UseProductsOptions {
    categoryId: string;
    filters: FilterState;
    initialData?: CategoryProductsResponse;
    enabled?: boolean;
}

export const useProducts = ({
    categoryId,
    filters,
    initialData,
    enabled = true,
}: UseProductsOptions) => {
    // Generate cache key based on filters
    const filterKey = useMemo(
        () => JSON.stringify(buildApiParams(filters)),
        [filters]
    );

    // SWR Infinite key generator
    const getKey = useCallback(
        (pageIndex: number, previousPageData: CategoryProductsResponse | null) => {
            if (!enabled || !categoryId) return null;
            if (previousPageData && !previousPageData.data?.length) return null;

            const params = buildApiParams(filters, pageIndex + 1);
            const queryString = new URLSearchParams(params).toString();

            return [`/category/${categoryId}`, queryString, filterKey];
        },
        [categoryId, filters, filterKey, enabled]
    );

    // Fetcher function
    const fetcher = useCallback(
        async ([, queryString]: [string, string, string]) => {
            return await RemoteServices.CategoryProduct_ID(
                categoryId,
                queryString
            );
        },
        [categoryId]
    );

    // SWR Infinite hook
    const {
        data,
        error,
        size,
        setSize,
        isLoading,
        isValidating,
        mutate,
    } = useSWRInfinite<CategoryProductsResponse>(getKey, fetcher, {
        fallbackData: initialData ? [initialData] : undefined,
        revalidateOnFocus: false,
        revalidateFirstPage: false,
        revalidateOnMount: !initialData,
        dedupingInterval: 60000,
        parallel: true,
        keepPreviousData: true, // Prevents flashing empty state during refetching
    });

    // Flatten products from all pages
    const products = useMemo(
        () => data?.flatMap((page) => page.data || []) || [],
        [data]
    );

    // Meta from first page
    const meta = data?.[0]?.meta;

    // Loading states
    const isLoadingMore = isLoading || (size > 0 && data && typeof data[size - 1] === 'undefined');
    const isEmpty = data?.[0]?.data?.length === 0;
    const isReachingEnd = isEmpty || (data && data[data.length - 1]?.data?.length < (meta?.per_page || 20));

    // Sort products client-side (Optional: only if API sorting is not sufficient or if you want local sorting)
    const sortedProducts = useMemo(() => {
        // Since we are now using ProductDetails and the API handles sorting via 'sortBy',
        // we can simplify this or remove it. For now, I'll keep it as 'products' 
        // because the API parameters already include the sort option.
        return products;
    }, [products]);

    // Load next page
    const loadMore = useCallback(() => {
        if (!isLoadingMore && !isReachingEnd) {
            setSize((s) => s + 1);
        }
    }, [isLoadingMore, isReachingEnd, setSize]);

    // Reset to first page (used when filters change)
    const reset = useCallback(() => {
        setSize(1);
    }, [setSize]);

    // Reset when filters change
    useEffect(() => {
        reset();
    }, [filterKey, reset]);

    return {
        products: sortedProducts,
        meta,
        error,
        isLoading,
        isLoadingMore,
        isValidating,
        isEmpty,
        isReachingEnd,
        loadMore,
        reset,
        mutate,
        size,
    };
};

// ============================================
// FILTER DATA HOOK (Categories & Brands)
// ============================================
interface FilterDataResult {
    categories: CategoryData[];
    brands: BrandData[];
    isLoading: boolean;
    error: Error | null;
}

export const useFilterData = (
    initialCategories?: FilterDataResult['categories'],
    initialBrands?: FilterDataResult['brands']
): FilterDataResult => {
    // Fetch categories
    const {
        data: categoriesData,
        error: categoriesError,
        isLoading: categoriesLoading,
    } = useSWR(
        'categories',
        () => RemoteServices.getCategoriesAll(),
        {
            fallbackData: initialCategories ? { data: initialCategories } : undefined,
            revalidateOnFocus: false,
            revalidateOnMount: !initialCategories,
            dedupingInterval: 300000, // 5 minutes
        }
    );

    // Fetch brands
    const {
        data: brandsData,
        error: brandsError,
        isLoading: brandsLoading,
    } = useSWR(
        'brands',
        () => RemoteServices.getBrandsAll(),
        {
            fallbackData: initialBrands ? { data: initialBrands } : undefined,
            revalidateOnFocus: false,
            revalidateOnMount: !initialBrands,
            dedupingInterval: 300000, // 5 minutes
        }
    );

    return {
        categories: categoriesData?.data || [],
        brands: brandsData?.data || [],
        isLoading: categoriesLoading || brandsLoading,
        error: categoriesError || brandsError,
    };
};

// ============================================
// INTERSECTION OBSERVER HOOK
// ============================================
interface UseIntersectionObserverOptions {
    threshold?: number;
    rootMargin?: string;
    enabled?: boolean;
}

export const useIntersectionObserver = (
    callback: () => void,
    options: UseIntersectionObserverOptions = {}
) => {
    const { threshold = 0.1, rootMargin = '100px', enabled = true } = options;
    const ref = useRef<HTMLDivElement>(null);
    const callbackRef = useRef(callback);

    // Keep callback ref updated
    useEffect(() => {
        callbackRef.current = callback;
    }, [callback]);

    useEffect(() => {
        if (!enabled) return;

        const element = ref.current;
        if (!element) return;

        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0]?.isIntersecting) {
                    callbackRef.current();
                }
            },
            { threshold, rootMargin }
        );

        observer.observe(element);

        return () => observer.disconnect();
    }, [threshold, rootMargin, enabled]);

    return ref;
};