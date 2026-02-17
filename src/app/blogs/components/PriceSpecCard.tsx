import React from 'react';
import Image from 'next/image';

import { ProductDetails } from '../../types/ProductDetailsTypes';
import Link from 'next/link';

interface PriceSpecProps {
    image?: string;
    name?: string;
    price?: string;
    specs?: { label: string; value: string }[];
    shopLink?: string;
    product?: ProductDetails;
}

const PriceSpecCard = ({ image, name, price, specs, shopLink, product }: PriceSpecProps) => {

    const displayImage = product?.image?.full || image || '';
    const displayName = product?.name || name || '';
    const displayPrice = product ? `Rs. ${product.discounted_price.toLocaleString()}` : price || '';
    const displayLink = product ? `/products/${product.slug}` : shopLink || '#';

    const displaySpecs = product ? [
        { label: 'Brand', value: product.brand?.name || 'N/A' },
        { label: 'Status', value: product.quantity > 0 ? 'In Stock' : 'Out of Stock' },
    ] : specs || [];

    return (
        <div className="bg-white rounded-lg border border-[var(--colour-border3)] p-4 sticky top-8">
            <div className="relative w-full aspect-[4/3] mb-3 bg-[var(--colour-bg4)] rounded-lg overflow-hidden">
                <Image src={displayImage} alt={displayName} fill className="object-contain p-2" />
            </div>

            <h3 className="font-semibold text-sm text-[var(--colour-text2)] mb-1 leading-snug line-clamp-2">{displayName}</h3>
            <p className="text-base font-bold text-[var(--colour-fsP2)] mb-3">{displayPrice}</p>

            <div className="space-y-2 mb-3 bg-[var(--colour-bg4)] rounded-lg p-3">
                {displaySpecs.map((spec, index) => (
                    <div key={index} className="flex justify-between items-center text-xs">
                        <span className="text-[var(--colour-text3)] font-medium">{spec.label}</span>
                        <span className="text-[var(--colour-text2)] font-semibold">{spec.value}</span>
                    </div>
                ))}
            </div>

            <Link
                href={displayLink}
                className="block w-full text-center bg-[var(--colour-fsP1)] hover:bg-[var(--colour-fsP2)] text-white font-semibold py-2.5 rounded-lg transition-all active:scale-95 text-sm"
            >
                View Product
            </Link>
        </div>
    );
};

export default PriceSpecCard;
