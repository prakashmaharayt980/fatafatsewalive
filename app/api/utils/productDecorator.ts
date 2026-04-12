import type { ProductData } from "../../types/ProductDetailsTypes";
import type { DecoratedProduct } from "../../types/DecoratedProduct";

export function decorateProduct(product: ProductData, index?: number): DecoratedProduct {
    const isPriceObj = typeof product.price === "object" && product.price !== null;
    
    // Base Price (Original)
    const base = isPriceObj 
        ? Number((product.price as any).original_price ?? (product.price as any).current ?? 0) 
        : Number(product.price ?? 0);
        
    // Discounted Price (Current)
    const discounted = isPriceObj 
        ? Number((product.price as any).current ?? 0) 
        : base;

    const discount = base > discounted ? (((base - discounted) / base) * 100) : 0;
    const emi = Number((discounted / 12).toFixed(0));
    const newProduct = product.created_at ? (Date.now() - new Date(product.created_at).getTime()) < (30 * 24 * 60 * 60 * 1000) : false;
    const bestSeller = false;

    const displayPriceVal = discounted;
    const displayPriceStr = (displayPriceVal ?? 0).toLocaleString();

    return {
        ...product,
        basePrice: base,
        discountedPriceVal: discounted,
        displayPrice: displayPriceStr,
        displayPriceVal: displayPriceVal,
        discountPercent: discount,
        emiPrice: emi,
        isNew: newProduct,
        isBestSeller: bestSeller,
        brandName: product.brand?.name || "Brand Name",
        rating: product.average_rating || 0,
        ratingCount: product.rating_count || 0,
    };
}
