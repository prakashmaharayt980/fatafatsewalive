import type { ProductData } from "../../types/ProductDetailsTypes";
import type { DecoratedProduct } from "../../types/DecoratedProduct";

export function decorateProduct(product: ProductData, index?: number): DecoratedProduct {
    const base = typeof product.price === "object" ? Number((product.price as any).current || 0) : Number(product.price || 0);
    const discounted = 'discounted_price' in product && product.discounted_price ? Number(product.discounted_price) : base;
    const discount = discounted < base ? Math.round(((base - discounted) / base) * 100) : 0;
    const emi = Math.round(base / 12);
    const newProduct = product.created_at ? (Date.now() - new Date(product.created_at).getTime()) < (30 * 24 * 60 * 60 * 1000) : false;
    const bestSeller = index !== undefined && index < 2;

    const displayPriceVal = discounted < base ? discounted : base;
    const displayPriceStr = (displayPriceVal || 0).toLocaleString();

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
