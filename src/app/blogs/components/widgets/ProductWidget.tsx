'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Smartphone } from 'lucide-react';
import { formatPrice } from '@/app/category/[slug]/utils';

interface ProductWidgetProps {
    products?: any[];
}

const ProductWidget = ({ products }: ProductWidgetProps) => {
    if (!products || products.length === 0) return null;

    return (
        <div className="bg-white rounded-2xl p-5 border-2 border-gray-100 shadow-md hover:shadow-xl transition-shadow">
            <h3 className="text-xl font-bold text-gray-900 mb-5 font-heading flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[var(--colour-fsP2)] to-blue-700 flex items-center justify-center">
                    <Smartphone className="w-4 h-4 text-white" />
                </div>
                Trending Products
            </h3>
            <div className="space-y-3">
                {products.map((product: any) => (
                    <Link
                        key={product.id}
                        href={`/products/${product.slug}`}
                        className="flex gap-3 group items-center p-2 rounded-lg hover:bg-gradient-to-r hover:from-[var(--colour-fsP2)]/5 hover:to-transparent transition-all"
                    >
                        <div className="relative w-16 h-16 bg-gradient-to-br from-gray-50 to-white rounded-xl overflow-hidden flex-shrink-0 border-2 border-gray-100 group-hover:border-[var(--colour-fsP2)] transition-all group-hover:shadow-md">
                            <Image
                                src={product.image?.thumb || product.image?.full || '/placeholder.png'}
                                alt={product.name}
                                fill
                                className="object-contain p-2 group-hover:scale-110 transition-transform duration-500"
                            />
                        </div>
                        <div className="min-w-0 flex-1">
                            <h4 className="font-bold text-gray-900 text-sm leading-tight group-hover:text-[var(--colour-fsP2)] transition-colors mb-1.5 line-clamp-2">
                                {product.name}
                            </h4>
                            <div className="text-[var(--colour-fsP2)] font-bold text-sm">
                                Rs. {formatPrice(product.price)}
                            </div>
                        </div>
                    </Link>
                ))}
                <Link
                    href="/category/smartphones?id=1"
                    className="block w-full mt-5 py-3 bg-gradient-to-r from-[var(--colour-fsP2)] to-blue-700 text-white font-bold rounded-xl hover:shadow-lg hover:shadow-[var(--colour-fsP2)]/30 transition-all text-sm text-center hover:-translate-y-0.5"
                >
                    View All Products →
                </Link>
            </div>
        </div>
    );
};

export default ProductWidget;
