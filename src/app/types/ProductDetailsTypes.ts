import { Review } from "./ReviewTypes";

export interface ProductDetails {
    id: number;
    name: string;
    slug: string;
    sku: string | null;
    short_description: string | null;
    description: string;
    price: number;
    original_price: number | null;
    discounted_price: number;
    quantity: number;
    unit: string | null;
    weight: string | null;
    status: number;
    is_featured: number;
    attributes: {
        attribute_class_id: number;
        product_attributes: Record<string, string>;
    };
    variant_attributes: Record<string, string[]>;
    highlights: string;
    product_video_url: string | null;
    emi_enabled: number;
    pre_order: number;
    pre_order_price: number;
    warranty_description: string | null;
    average_rating: number;
    image: {
        full: string;
        thumb: string;
        preview: string;
    };
    images: Array<{
        id: number;
        url: string;
        thumb: string;
        preview: string;
        custom_properties?: {
            color?: string;
            is_default?: boolean;
        };
        color?: string | null;
    }>;
    brand: {
        id: number;
        name: string;
        slug: string;
        description: string;
        status: string;
        brand_image: {
            full: string;
            thumb: string;
        };
    };
    vendor: any;
    categories: Array<{
        id: number;
        title: string;
        slug: string;
        description: string;
        parent_id: number | null;
        status: number;
        featured: number;
        order: number;
        category_full_name: string;
        image: string;
        images: {
            id: number | null;
            name: string | null;
            default: string;
            thumbnail: string;
        };
        created_at: string;
        updated_at: string;
    }>;
    variants: Array<{
        id: number;
        product_id: number;
        sku: string | null;
        price: number;
        original_price: number | null;
        discounted_price: number;
        quantity: number;
        attributes: Record<string, string>;
        status: any;
    }>;
    reviews: Review
    created_at: string;
    updated_at: string;
}


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

