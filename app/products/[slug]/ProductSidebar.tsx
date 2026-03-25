"use client";

import React from "react";
import type { ProductData } from "@/app/types/ProductDetailsTypes";
import TrustWidget from "./TrustWidget";
import PartnersWidget from "./PartnersWidget";


import ProductWidget from "@/app/blogs/components/widgets/ProductWidget";

interface ProductSidebarProps {
    product: ProductData;
    trendingProducts?: any[];
}

const ProductSidebar: React.FC<ProductSidebarProps> = ({ product, trendingProducts }) => {
    const baseCurrentPrice =
        typeof product.price === "object"
            ? (product.price as any).current
            : product.discounted_price || product.price;

    return (
        <div className="space-y-3 lg:sticky lg:top-24">
            <TrustWidget />
            <PartnersWidget />
            <ProductWidget products={trendingProducts} />
        </div>
    );
};

export default ProductSidebar;