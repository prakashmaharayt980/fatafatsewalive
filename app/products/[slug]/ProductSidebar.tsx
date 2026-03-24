"use client";

import React from "react";
import type { ProductData } from "@/app/types/ProductDetailsTypes";
import EmiWidget from "./EmiWidget";
import TrustWidget from "./TrustWidget";
import PartnersWidget from "./PartnersWidget";


interface ProductSidebarProps {
    product: ProductData;
}

const ProductSidebar: React.FC<ProductSidebarProps> = ({ product }) => {
    const baseCurrentPrice =
        typeof product.price === "object"
            ? (product.price as any).current
            : product.discounted_price || product.price;

    return (
        <div className="space-y-3 lg:sticky lg:top-24">
            {product.emi_enabled && <EmiWidget price={Number(baseCurrentPrice)} />}
            <TrustWidget />
            <PartnersWidget />
        </div>
    );
};

export default ProductSidebar;