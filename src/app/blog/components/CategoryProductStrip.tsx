'use client';

import React from 'react';
import useSWR from 'swr';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import RemoteServices from '../../api/remoteservice';
import { ProductDetails } from '../../types/ProductDetailsTypes';

interface CategoryProductStripProps {
    categorySlug: string;
    categoryTitle: string;
}

const CategoryProductStrip = ({ categorySlug, categoryTitle }: CategoryProductStripProps) => {

    // Fetch products by category (using search as proxy or specific endpoint if available)
    const { data: products, isLoading } = useSWR<ProductDetails[]>(
        ['category-strip', categorySlug],
        () => RemoteServices.searchProducts({ search: categoryTitle }).then(res => res.data || []),
        { dedupingInterval: 600000 } // Cache for 10 mins
    );

    if (isLoading || !products || products.length === 0) return null;

    return (
        <div className="w-full my-12 py-8 bg-white border-y border-gray-100">
            <div className="flex justify-between items-center mb-6 px-4">
                <h3 className="text-2xl font-bold text-gray-900 font-heading">
                    Top Picks in <span className="text-blue-600">{categoryTitle}</span>
                </h3>
                <Link
                    href={`/category/${categorySlug}`}
                    className="flex items-center text-sm font-semibold text-blue-600 hover:text-blue-700 transition-colors"
                >
                    View All <ArrowRight className="w-4 h-4 ml-1" />
                </Link>
            </div>

            <div className="flex overflow-x-auto gap-4 px-4 pb-4 scrollbar-hide snap-x snap-mandatory">
                {products.slice(0, 10).map((product) => (
                    <Link
                        key={product.id}
                        href={`/product/${product.slug}?id=${product.id}`}
                        className="min-w-[200px] md:min-w-[240px] snap-center group"
                    >
                        <div className="bg-white rounded-2xl border border-gray-100 p-4 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 h-full flex flex-col">
                            <div className="relative aspect-square w-full bg-gray-50 rounded-xl mb-4 overflow-hidden">
                                <Image
                                    src={product.image?.full || '/placeholder.png'}
                                    alt={product.name}
                                    fill
                                    className="object-contain p-2 transition-transform duration-500 group-hover:scale-110"
                                />
                            </div>
                            <div className="flex-1">
                                <h4 className="font-semibold text-gray-900 mb-1 line-clamp-2 text-sm group-hover:text-blue-600 transition-colors">
                                    {product.name}
                                </h4>
                                <div className="flex items-baseline gap-2 mt-2">
                                    <span className="font-bold text-blue-600">
                                        Rs. {product.discounted_price.toLocaleString()}
                                    </span>
                                    {product.discounted_price < product.price && (
                                        <span className="text-xs text-gray-400 line-through">
                                            {product.price.toLocaleString()}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
};

export default CategoryProductStrip;
