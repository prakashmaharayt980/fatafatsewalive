import { getAllCategory } from '@/app/types/category';
import { BasketProduct } from '@/app/types/ProductDetailsTypes';

export type CategoryData = getAllCategory['data'][0];

export interface CategoryProductsResponse {
    data: {
        category?: CategoryData;
        products?: BasketProduct[];
    };
    meta: {
        total: number;
        current_page: number;
        per_page: number;
        last_page: number;
    }
}

export interface FilterState {
    category: string[];
    brand: string[];
    colors: string[];
    sizes: string[];
    min_price: number;
    max_price: number;
    sort: SortOption;
    emi_enabled: boolean;
    pre_order: boolean;
    exchange_available: boolean;
}

export type SortOption = 'price_asc' | 'price_desc' | 'name_asc' | 'name_desc' | 'newest';

export interface SearchParams {
    page?: number;
    per_page?: number;
    sort?: SortOption;
    min_price?: number;
    max_price?: number;
    brand?: string;
    category?: string;
    emi_enabled?: boolean;
    pre_order?: boolean;
    exchange_available?: boolean;
}

export const INITIAL_FILTERS: FilterState = {
    category: [],
    brand: [],
    colors: [],
    sizes: [],
    min_price: 0,
    max_price: 100000,
    sort: 'newest',
    emi_enabled: false,
    pre_order: false,
    exchange_available: false,
};

export const SORT_OPTIONS = [
    { id: 'newest', label: 'Relevance' },
    { id: 'price_asc', label: 'Price: Low to High' },
    { id: 'price_desc', label: 'Price: High to Low' },
    { id: 'name_asc', label: 'Name: A to Z' },
    { id: 'name_desc', label: 'Name: Z to A' },
] as const;

export const GRID_CONFIGS = {
    grid4: 'grid-cols-2 md:grid-cols-3 xl:grid-cols-4',
    grid5: 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5',
    list: 'grid-cols-1',
} as const;

export type ViewMode =  'grid3' |  'grid4' | 'grid5' | 'list';
