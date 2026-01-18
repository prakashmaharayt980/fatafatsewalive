import { FilterState, SearchParams } from './types';

/**
 * Parse slug and ID from URL parameter
 */
export const parseSlugAndId = (
    rawSlug: string,
    searchParamId?: string | null
): { slug: string; id: string } => {
    const decodedSlug = decodeURIComponent(rawSlug);

    if (decodedSlug.includes('&id=')) {
        const [slug, idPart] = decodedSlug.split('&id=');
        return { slug, id: idPart || '' };
    }

    if (decodedSlug.includes('&')) {
        const [slug, idPart] = decodedSlug.split('&');
        return { slug, id: idPart.replace(/^id=/, '') };
    }

    return { slug: decodedSlug, id: searchParamId || '' };
};

/**
 * Calculate discount percentage
 */
export const calculateDiscount = (
    price: number | string,
    discountedPrice?: number | string
): number => {
    if (!discountedPrice || price === discountedPrice) return 0;
    const originalPrice = typeof price === 'string' ? parseFloat(price) : price;
    const salePrice = typeof discountedPrice === 'string' ? parseFloat(discountedPrice) : discountedPrice;
    if (originalPrice === 0) return 0;
    return Math.round(((originalPrice - salePrice) / originalPrice) * 100);
};

/**
 * Format price with locale
 */
export const formatPrice = (price: string | number): string => {
    const val = typeof price === 'string' ? parseFloat(price) : price;
    return (val || 0).toLocaleString('en-NP');
};

/**
 * Parse filters from URL search params
 */
export const parseFiltersFromSearchParams = (
    searchParams: SearchParams
): Partial<FilterState> => {
    const filters: Partial<FilterState> = {};

    if (searchParams.categories) {
        filters.categories = searchParams.categories.split(',').map(Number).filter(Boolean);
    }
    if (searchParams.brands) {
        filters.brands = searchParams.brands.split(',').map(Number).filter(Boolean);
    }
    if (searchParams.colors) {
        filters.colors = searchParams.colors.split(',').filter(Boolean);
    }
    if (searchParams.sizes) {
        filters.sizes = searchParams.sizes.split(',').filter(Boolean);
    }
    if (searchParams.min_price || searchParams.max_price) {
        filters.priceRange = [
            parseInt(searchParams.min_price || '0', 10),
            parseInt(searchParams.max_price || '100000', 10),
        ];
    }
    if (searchParams.sort) {
        filters.sortBy = searchParams.sort as FilterState['sortBy'];
    }
    if (searchParams.in_stock === '1') {
        filters.inStock = true;
    }
    if (searchParams.on_sale === '1') {
        filters.onSale = true;
    }

    return filters;
};

/**
 * Build query string from filters
 */
export const buildFilterQueryString = (filters: FilterState): string => {
    const params: Record<string, string> = {};

    if (filters.categories.length) {
        params.categories = filters.categories.join(',');
    }
    if (filters.brands.length) {
        params.brands = filters.brands.join(',');
    }
    if (filters.colors.length) {
        params.colors = filters.colors.join(',');
    }
    if (filters.sizes.length) {
        params.sizes = filters.sizes.join(',');
    }
    if (filters.priceRange[0] > 0) {
        params.min_price = filters.priceRange[0].toString();
    }
    if (filters.priceRange[1] < 100000) {
        params.max_price = filters.priceRange[1].toString();
    }
    if (filters.sortBy !== 'default') {
        params.sort = filters.sortBy;
    }
    if (filters.inStock) {
        params.in_stock = '1';
    }
    if (filters.onSale) {
        params.on_sale = '1';
    }

    return new URLSearchParams(params).toString();
};

/**
 * Build API query params from filters
 */
export const buildApiParams = (
    filters: FilterState,
    page: number = 1
): Record<string, string> => {
    const params: Record<string, string> = {
        page: page.toString(),
        per_page: '20'
    };

    if (filters.categories.length) params.categories = filters.categories.join(',');
    if (filters.brands.length) params.brands = filters.brands.join(',');
    if (filters.colors.length) params.colors = filters.colors.join(',');
    if (filters.sizes.length) params.sizes = filters.sizes.join(',');
    if (filters.priceRange[0] > 0) params.min_price = filters.priceRange[0].toString();
    if (filters.priceRange[1] < 100000) params.max_price = filters.priceRange[1].toString();
    if (filters.sortBy !== 'default') params.sort = filters.sortBy;
    if (filters.inStock) params.in_stock = '1';
    if (filters.onSale) params.on_sale = '1';

    return params;
};

/**
 * Format page title from slug
 */
export const formatPageTitle = (slug: string): string => {
    return slug
        .replace(/-/g, ' ')
        .replace(/\b\w/g, (l) => l.toUpperCase());
};

/**
 * Debounce function for performance
 */
export function debounce<T extends (...args: unknown[]) => unknown>(
    func: T,
    wait: number
): (...args: Parameters<T>) => void {
    let timeout: NodeJS.Timeout | null = null;

    return (...args: Parameters<T>) => {
        if (timeout) clearTimeout(timeout);
        timeout = setTimeout(() => func(...args), wait);
    };
}

/**
 * Check if filters have changed
 */
export const hasFiltersChanged = (
    current: FilterState,
    previous: FilterState
): boolean => {
    return JSON.stringify(current) !== JSON.stringify(previous);
};