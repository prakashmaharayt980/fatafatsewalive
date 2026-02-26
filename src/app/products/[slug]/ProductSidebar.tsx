// ProductSidebar.tsx
"use client";

import React, { useMemo } from "react";
import Image from "next/image";
import { ChevronRight } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import useSWR from "swr";

import { ProductDetails } from "@/app/types/ProductDetailsTypes";
import { useContextCart } from "@/app/checkout/CartContext1";

import EmiWidget from "./EmiWidget";
import TrustWidget from "./TrustWidget";
import PartnersWidget from "./PartnersWidget";

interface ProductSidebarProps {
    product: ProductDetails;
    relatedCategorySlug?: string;
    categoryId?: string;
}



const ProductSidebar: React.FC<ProductSidebarProps> = ({ product, relatedCategorySlug, categoryId }) => {
    const router = useRouter();
    const { compareItems } = useContextCart();




    return (
        <div className="space-y-4 lg:sticky lg:top-24">

            {/* 1. EMI Widget */}
            {product.discounted_price && (
                <EmiWidget price={product.discounted_price || product.price} />
            )}

            {/* 2. Trust/Warranty Widget */}
            <TrustWidget />

            {/* 3. Partners Widget */}
            <PartnersWidget />



        </div>
    );
};

export default ProductSidebar;
