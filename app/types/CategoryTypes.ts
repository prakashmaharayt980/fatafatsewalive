


export interface CategorySlug {
  category: {
    slug: string;
    id: string;
    name: string

  };
  products: {
    count: number;
    next: string | null,
    previous: string | null
    results: Array<{
      slug: string;
      highlights: string;
      emi_enabled: number;
      image: string;
      discounted_price: string;
      price: string;
      average_rating: number;
      name: string;


    }>;
  };
}

export interface CategorySlug_ID {
  data: Array<{
    id: string
    slug: string;
    highlights: string;
    emi_enabled: number;
    image: {
      full: string,
      thumb: string,
      preview: string
    }
    discounted_price: string;
    price: string;
    average_rating: number;
    name: string;
    created_at: string;
    pre_order_price: string;
  }>
  meta: {
    current_page: number,
    last_page: number,
    per_page: number,
    total: number
  }
}


export interface getAllCategory {
  data: Array<{
    id: number;
    title: string;
    slug: string;
    description?: string;
    parent_id: number | null;


    image: string;

    created_at?: string;
    updated_at?: string;
  }>;
}




export interface CategoryTypes {
  categories: Array<{
    id: number;
    title: string;
    slug: string;
    parent_id: number | null;
    parent_tree: string | null;
    children: CategoryTypes['categories'];
    image: string;

    created_at?: string;
    updated_at?: string;
  }>;
}

export interface RelatedProduct {
  id: string;
  slug: string;
  name: string;
}

export interface ProductDetails {
  id: number | string;
  name: string;
  slug: string;
  price: string;
  discounted_price: string;
  quantity: number;
  emi_enabled: boolean;
  brand: string;
  category: string;
  image: string;
  gallery_images: GalleryImage[];
  highlights: string;
  description: string;
  specifications: Record<string, string>;
  attributes: Record<string, string>;
  variants: ProductVariant[];
  meta_title: string;
  meta_description: string;
  average_rating: number;
  pre_order: number;
  pre_order_price: number | null;
  related_category?: RelatedProduct; // Added
}

export interface GalleryImage {
  id: string;
  image: string;
}

export interface ProductVariant {
  ram?: string;
  color?: string;
  storage?: string;
  image?: string;
  price?: number;
  stock?: number;
  [key: string]: any;
}