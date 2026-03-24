// ============================================
// TYPES
// ============================================
export interface PageProps {
    params: Promise<{ slug: string }>;
}

export interface FilterState {
    categories: number[];
    brands: number[];
    colors: string[];
    sizes: string[];
    priceRange: [number, number];
    sortBy: 'default' | 'price-low-high' | 'price-high-low' | 'newest' | 'rating';
    inStock: boolean;
    onSale: boolean;
}

export interface FilterOption {
    id: string | number;
    label: string;
    count?: number;
    color?: string;
}

// API Response Types
export interface getAllCategory {
    data: Array<{
        id: number;
        title: string;
        slug: string;
        parent_id: number | null;
        image: string;
        created_at?: string;
        updated_at?: string;
    }>;
}

export interface getAllBrands {
    data: Array<{
        id: number;
        name: string;
        slug: string;
        image?: string;
        created_at?: string;
        updated_at?: string;
    }>;
}