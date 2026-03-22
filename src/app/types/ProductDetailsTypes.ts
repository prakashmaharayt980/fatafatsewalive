import { Review } from "./ReviewTypes";

export interface ProductDescription {
    short_description: string | null;
    description: string;
    highlights: string;
    warranty_description: string | null;
}

export interface PriceInfo {
    original_price: number | null;
    current: number;
}

export interface ImageInfo {
    url: string;
    alt_text?: string;
    thumb?: string;
    full?: string;
    preview?: string;
}

export interface ImageInfoExtended extends ImageInfo {
    id?: number;
    custom_properties?: {
        color?: string;
        is_default?: boolean;
    };
    color?: string | null;
}

export interface BrandInfo {
    id: number;
    name: string;
    slug: string;
    description?: string;
    status?: string | boolean;
    brand_image?: {
        full: string;
        thumb: string;
    };
    thumb?: ImageInfo;
}

export interface CategoryInfo {
    id: number;
    title: string;
    slug: string;
    description?: string;
    parent_id?: number | null;
    status?: number | boolean;
    featured?: number;
    order?: number;
    category_full_name?: string;
    image?: string | any;
    images?: any;
    thumb?: ImageInfo;
    created_at?: string;
    updated_at?: string;
}

export interface ProductVariant {
    id?: number;
    product_id?: number;
    sku: string | null;
    price: number;
    original_price: number | null;
    discounted_price: number;
    quantity: number;
    attributes: Record<string, string>;
    status?: any;
    images: ImageInfoExtended[];
    image?: any;
    color?: string;
}

export interface ProductData {
    id: number;
    name: string;
    slug: string;
    sku: string | null;
    description: ProductDescription;
    price: number | PriceInfo;
    original_price?: number | null;
    discounted_price: number;
    quantity: number;
    unit?: string | null;
    weight?: string | null;
    status?: number | boolean;
    is_featured?: number;
    attributes: Record<string, string>;
    variant_attributes?: Record<string, string[]>;
    highlights?: string; // fallback in case some old properties use it directly
    product_video_url?: string | null;
    emi_enabled?: number | boolean;
    pre_order?: any;
    pre_order_price?: number;
    average_rating: number;

    // Media
    thumb?: ImageInfo | null;
    image?: any; // Fallback for old code
    images: ImageInfoExtended[];

    // Relations
    brand: BrandInfo | null;
    vendor?: any;
    categories: CategoryInfo[];
    variants: ProductVariant[];
    reviews?: Review | any;
    related_products?: any;

    // Meta
    created_at?: string;
    updated_at?: string;
    rating_count?: number;
    colors?: string[];
    short_desc?: string | null; // For some basket products
}

// Aliases for unified structure while keeping backwards compatibility for imports across 50+ files
export type ProductDetails = ProductData;
export type BasketProduct = ProductData;
export type ProductSummary = ProductData;

export interface CustomVariantGroup {
    color: string;
    price: number;
    discounted_price: number;
    variantId: number;
    sku: string | null;
    quantity: number;
    images: Array<{
        url: string;
        thumb: string;
        isDefault: boolean;
    }>;
}

export interface ProductDisplayState {
    mainImage: string;
    variantsByColor: CustomVariantGroup[];
}
