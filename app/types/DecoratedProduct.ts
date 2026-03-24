import type { ProductData } from "./ProductDetailsTypes";

export interface DecoratedProduct extends ProductData {
    basePrice: number;
    discountedPriceVal: number;
    discountPercent: number;
    emiPrice: number;
    isNew: boolean;
    isBestSeller: boolean;
    brandName: string;
    displayPrice: string;
    displayPriceVal: number;
    rating: number;
    ratingCount: number;
}
