import { ProductDetails } from '@/app/types/ProductDetailsTypes';
import { getAllCategory as GlobalCategoryData } from '@/app/types/CategoryTypes';
import { BrandsResponse } from '@/app/types/Brands';

// ============================================
// FILTER TYPES
// ============================================
export interface FilterState {
    categories: number[];
    brands: number[];
    colors: string[];
    sizes: string[];
    priceRange: [number, number];
    sortBy: SortOption;
    inStock: boolean;
    onSale: boolean;
    emiOnly: boolean;
}

export type SortOption = 'default' | 'price-low-high' | 'price-high-low' | 'newest' | 'rating';

export interface FilterOption {
    id: string | number;
    label: string;
    count?: number;
    color?: string;
}

// ============================================
// API RESPONSE TYPES
// ============================================
export type CategoryData = GlobalCategoryData['data'][0];

export type BrandData = BrandsResponse['data'][0];

export type Product = ProductDetails;

export interface PaginationMeta {
    current_page: number;
    per_page: number;
    total: number;
    last_page: number;
}

export interface CategoryProductsResponse {
    data: Product[];
    meta: PaginationMeta;
}

export interface CategoriesResponse {
    data: CategoryData[];
}



// ============================================
// COMPONENT PROPS TYPES
// ============================================
export interface PageParams {
    slug: string;
}

export interface SearchParams {
    id?: string;
    page?: string;
    categories?: string;
    brands?: string;
    colors?: string;
    sizes?: string;
    min_price?: string;
    max_price?: string;
    sort?: string;
    in_stock?: string;
    on_sale?: string;
    emi_enabled?: string;
}

export interface CategoryPageData {
    category: CategoryData | null;
    initialProducts: CategoryProductsResponse;
    categories: CategoryData[];
    brands: BrandData[];
    slug: string;
    id: string;
}

// ============================================
// CONSTANTS
// ============================================
export const INITIAL_FILTERS: FilterState = {
    categories: [],
    brands: [],
    colors: [],
    sizes: [],
    priceRange: [0, 100000],
    sortBy: 'default',
    inStock: false,
    onSale: false,
    emiOnly: false,
};

export const SORT_OPTIONS = [
    { id: 'default', label: 'Relevance' },
    { id: 'price-low-high', label: 'Price: Low to High' },
    { id: 'price-high-low', label: 'Price: High to Low' },
    { id: 'newest', label: 'Newest First' },
    { id: 'rating', label: 'Top Rated' },
] as const;

export const COLORS: FilterOption[] = [
    { id: 'black', label: 'Black', color: '#0a0a0a' },
    { id: 'white', label: 'White', color: '#fafafa' },
    { id: 'red', label: 'Red', color: '#dc2626' },
    { id: 'blue', label: 'Blue', color: '#2563eb' },
    { id: 'green', label: 'Green', color: '#16a34a' },
    { id: 'orange', label: 'Orange', color: '#ea580c' },
    { id: 'purple', label: 'Purple', color: '#9333ea' },
    { id: 'pink', label: 'Pink', color: '#db2777' },
];

export const GRID_CONFIGS = {
    grid4: 'grid-cols-2 md:grid-cols-3 xl:grid-cols-4',
    grid5: 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5',
    list: 'grid-cols-1',
} as const;

export type ViewMode = 'grid4' | 'grid5' | 'list';