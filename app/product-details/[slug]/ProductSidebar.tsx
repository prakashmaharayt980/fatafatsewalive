"use client";

import React from "react";
import type { ProductData } from "@/app/types/ProductDetailsTypes";
import TrustWidget from "./TrustWidget";
import PartnersWidget from "./PartnersWidget";
import EmiWidget from "./EmiWidget";

interface Props {
    product: ProductData;
}

const ProductSidebar: React.FC<Props> = ({ product }) => {
    const currentPrice =
        typeof product.price === "object"
            ? (product.price as any).current
            : product.discounted_price ?? product.price;

    return (
        <div className="space-y-4 lg:sticky lg:top-24">
            {product.emi_enabled && <EmiWidget price={Number(currentPrice)} />}
            {/* <TrustWidget /> */}
            <PartnersWidget />
        </div>
    );
};

export default ProductSidebar;
