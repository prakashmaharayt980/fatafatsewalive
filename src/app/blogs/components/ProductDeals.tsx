'use client';

import React, { useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import useSWR from 'swr';
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';
import RemoteServices from '../../api/remoteservice';
import { ProductDetails } from '../../types/ProductDetailsTypes';
import { formatPrice } from '@/app/category/[slug]/utils';

const ProductDeals = () => {
    // Fetch products
    const { data: products } = useSWR<ProductDetails[]>('best-tech-deals',
        () => RemoteServices.searchProducts({ search: 'Pro' }).then(res => res.data || []),
        { dedupingInterval: 600000 }
    );







    return (
        <div className="bg-[var(--colour-fsP2)] rounded-xl p-2 sticky top-24 shadow-sm transition-all border border-white/5 overflow-hidden">


            {/* Header with Navigation */}
            <div className="flex justify-between items-center mb-5 relative z-10">
                <h3 className="text-sm font-black text-white font-heading  uppercase flex items-center gap-2">
                    {/* <span className="w-2 h-2 bg-[var(--colour-yellow1)] rounded-full animate-pulse" /> */}
                    Best Tech Deals
                </h3>
                <div className="flex gap-2">
                    <button className="w-9 h-9 rounded-xl bg-white/10 backdrop-blur-md flex items-center justify-center text-white hover:bg-[var(--colour-yellow1)] hover:text-[var(--colour-fsP2)] transition-all duration-300">
                        <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button className="w-9 h-9 rounded-xl bg-white/10 backdrop-blur-md flex items-center justify-center text-white hover:bg-[var(--colour-yellow1)] hover:text-[var(--colour-fsP2)] transition-all duration-300">
                        <ChevronRight className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* List of Deals */}
            <div className="flex flex-col gap-5 relative z-10">
                {products?.slice(0, 3).map((product, index) => (
                    <Link
                        key={product.id}
                        href={`/products/${product.slug}`}
                        className={`group relative  rounded-xl transition-all duration-500 ease-out  bg-white shadow-xl shadow-black/20 text-[var(--colour-fsP2)]`}
                    >
                        <div className="flex p-3 gap-2">
                            {/* Product Image */}
                            <div className={`relative  rounded-xl flex-shrink-0 overflow-hidden p-2 transition-transform duration-500  ${index === 0 ? 'bg-gray-50' : 'bg-white'}`}>
                                <Image
                                    src={product.image?.thumb || product.image?.full || '/placeholder.png'}
                                    alt={product.name}
                                    width={100}
                                    height={100}
                                    className="object-fill aspect-square"
                                />
                            </div>

                            {/* Info */}
                            <div className="flex flex-col justify-center min-w-0 flex-1 ">
                                <h4 className={`text-[16px] font-bold line-clamp-2 leading-tight mb-1 transition-colors duration-300 group-hover:text-[var(--colour-fsP2)]`}>
                                    {product.name}
                                </h4>
                                <p className="text-[12px] grid grid-cols-1 gap-0.5 line-clamp-1  font-medium text-gray-500">
                                    {(product.highlights).split("|").map((item, index) => index < 2 && <span key={index}>{item.trim()}</span>)}
                                </p>

                            </div>
                        </div>

                        {/* Price Row */}
                        <div className={` flex items-center p-3 justify-between border-t pt-1 transition-colors duration-300 bg-[var(--colour-fsP2)]/10 border-gray-100`}>
                            <div className="flex flex-col">
                                <span className={`text-sm font-black transition-colors duration-300 text-[var(--colour-fsP2)]`}>
                                    Rs. {formatPrice(product.discounted_price || product.price)}
                                </span>
                                {product.price > (product.discounted_price || 0) && (
                                    <span className="text-[10px] text-gray-400 line-through decoration-1">
                                        Rs. {formatPrice(product.price)}
                                    </span>
                                )}
                            </div>
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 ${index === 0 ? 'bg-gray-100 text-[var(--colour-fsP2)] group-hover:bg-[var(--colour-fsP2)] group-hover:text-white' : 'bg-white/10 text-white group-hover:bg-[var(--colour-yellow1)] group-hover:text-[var(--colour-fsP2)]'}`}>
                                <ArrowRight className="w-3.5 h-3.5" />
                            </div>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
};

export default ProductDeals;
