'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import useSWR from 'swr';
import RemoteServices from '@/app/api/remoteservice';
import { Smartphone } from 'lucide-react';
import { formatPrice } from '@/app/category/[slug]/utils';

const ProductWidget = () => {
    // Fetch generic products to act as "Trending" or "Just For You"
    const { data: products, isLoading } = useSWR('blog-sidebar-products', () =>
        RemoteServices.searchProducts({ search: 'smartphones' }).then(res => res.data?.slice(0, 6) || [])
    );

    if (isLoading) return <div className="h-64 bg-gray-100 rounded-2xl animate-pulse"></div>;
    if (!products || products.length === 0) return null;

    return (
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
            <h3 className="text-lg font-bold text-gray-900 mb-4 font-heading flex items-center gap-2">
                <Smartphone className="w-5 h-5 text-blue-600" />
                Trending Products
            </h3>
            <div className="space-y-4">
                {products.map((product: any) => (
                    <Link
                        key={product.id}
                        href={`/products/${product.slug}`}
                        className="flex gap-3 group items-center"
                    >
                        <div className="relative w-14 h-14 bg-gray-50 rounded-lg overflow-hidden flex-shrink-0 border border-gray-100 group-hover:border-blue-200 transition-colors">
                            <Image
                                src={product.image?.thumb || product.image?.full || '/placeholder.png'}
                                alt={product.name}
                                fill
                                className="object-contain p-1 group-hover:scale-110 transition-transform duration-500"
                            />
                        </div>
                        <div className="min-w-0 flex-1">
                            <h4 className="font-semibold text-gray-900 text-sm leading-tight group-hover:text-blue-600 transition-colors mb-1 line-clamp-2">
                                {product.name}
                            </h4>
                            <div className="text-blue-600 font-bold text-xs">
                                Rs. {formatPrice(product.price)}
                            </div>
                        </div>
                    </Link>
                ))}
                <Link href="/category/smartphones?id=1" className="block w-full mt-4 py-2.5 border border-gray-100 text-gray-500 font-semibold rounded-xl hover:bg-gray-50 hover:text-blue-600 transition-colors text-xs text-center">
                    View All Products
                </Link>
            </div>
        </div>
    );
};

export default ProductWidget;
