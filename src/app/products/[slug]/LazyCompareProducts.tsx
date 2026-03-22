'use client';

import React, { useState, useEffect } from 'react';
import { useInView } from 'react-intersection-observer';
import Image from 'next/image';
import Link from 'next/link';
import { ProductData } from '@/app/types/ProductDetailsTypes';
import { CategoryService } from '@/app/api/services/category.service';
import SkeletonCard from '@/app/skeleton/SkeletonCard';
import { ChevronRight } from 'lucide-react';
import { trackCategoryClick } from '@/lib/analytics';
import { title } from 'process';
import router from 'next/router';

interface LazyCompareProductsProps {
    categorySlug?: string;
    currentProductId?: number;
}

function ProductSide({ product, side }: { product: ProductData; side: 'left' | 'right' }) {
    const imgUrl = product.thumb?.preview || product.thumb?.url || product.image?.preview || product.image?.thumb || product.image?.url || '/svgfile/no-image.svg';
    const basePrice = typeof product.price === 'object' ? (product.price as any).current : product.price;
    const finalPrice = product.discounted_price && product.discounted_price < basePrice ? product.discounted_price : basePrice;

    return (
        <div className={`flex flex-col items-center gap-2 flex-1 ${side === 'left' ? 'pr-3' : 'pl-3'}`}>
            <Link href={`/products/${product.slug}`} className="relative w-24 h-28 flex items-center justify-center group/img">
                <Image
                    src={imgUrl}
                    alt={product.name}
                    width={96}
                    height={112}
                    className="object-contain drop-shadow-sm transition-transform duration-500 group-hover/img:scale-110"
                />
            </Link>
            <Link href={`/products/${product.slug}`}>
                <p className="text-gray-700 font-bold text-[11px] text-center leading-snug line-clamp-2 max-w-[120px] hover:text-[var(--colour-fsP2)] transition-colors">
                    {product.name}
                </p>
            </Link>
            <span className="text-xs font-black text-gray-900">
                Rs. {finalPrice?.toLocaleString()}
            </span>
        </div>
    );
}

function CompareCard({ left, right }: { left: ProductData; right: ProductData }) {
    const [hovered, setHovered] = useState(false);
    const category = left.categories?.[0]?.title || right.categories?.[0]?.title || 'Products';

    return (
        <div
            className="group bg-white rounded-2xl border border-gray-100 overflow-hidden cursor-pointer transition-all duration-300 hover:border-[var(--colour-fsP2)]/30 hover:shadow-md hover:-translate-y-0.5"
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
        >
            <div className="text-center pt-3 pb-1.5 bg-gray-50/50 group-hover:bg-[var(--colour-fsP2)]/5 transition-colors">
                <span className="text-[10px] font-black uppercase text-gray-400 group-hover:text-[var(--colour-fsP2)] transition-colors">{category}</span>
            </div>
            <div className="flex items-stretch px-3 py-3">
                <ProductSide product={left} side="left" />
                <div className="flex flex-col items-center justify-center gap-1 shrink-0">
                    <div className="w-px h-10 bg-gray-100 group-hover:bg-[var(--colour-fsP2)]/20 transition-colors" />
                    <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${hovered
                        ? 'border-[var(--colour-fsP2)] bg-[var(--colour-fsP2)]/10 scale-110 shadow-sm'
                        : 'border-gray-100 bg-white'
                        }`}>
                        <span className={`text-[8px] font-black uppercase transition-colors ${hovered ? 'text-[var(--colour-fsP2)]' : 'text-gray-400'}`}>VS</span>
                    </div>
                    <div className="w-px h-10 bg-gray-100 group-hover:bg-[var(--colour-fsP2)]/20 transition-colors" />
                </div>
                <ProductSide product={right} side="right" />
            </div>
            <div className="px-3 pb-3">
                <Link
                    href={`/compare?ids=${left.id},${right.id}`}
                    className={`block w-full py-2 rounded-xl text-[10px] font-bold uppercase tracking-wider text-center transition-all duration-300 ${hovered
                        ? 'bg-[var(--colour-fsP2)] text-white shadow-sm'
                        : 'bg-gray-50 text-gray-500 border border-gray-100'
                        }`}
                >
                    Compare Now
                </Link>
            </div>
        </div>
    );
}

export default function LazyCompareProducts({ categorySlug, currentProductId }: LazyCompareProductsProps) {
    const [data, setData] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [hasFetched, setHasFetched] = useState(false);

    const { ref, inView } = useInView({
        triggerOnce: true,
        rootMargin: '200px 0px',
    });

    useEffect(() => {
        if (inView && !hasFetched && categorySlug) {
            setHasFetched(true);
            setIsLoading(true);

            CategoryService.getCategoryProducts(categorySlug, { per_page: 8,min_price: 100 })
                .then((res) => {
                    if (res && res.data) {
                        setData(res.data);
                    }
                })
                .catch((error: any) => {
                    if (error?.response?.status !== 404) {
                        console.error('Failed to fetch compare products:', error);
                    }
                })
                .finally(() => {
                    setIsLoading(false);
                });
        }
    }, [inView, hasFetched, categorySlug, currentProductId]);


    const productList = data && data.products ? data.products : [];
    const filteredProducts = currentProductId
        ? productList.filter((p: ProductData) => p.id !== currentProductId)
        : productList;

    // Pair products: each product vs the next one
    const pairs: [ProductData, ProductData][] = [];
    for (let i = 0; i + 1 < filteredProducts.length && pairs.length < 4; i += 2) {
        pairs.push([filteredProducts[i], filteredProducts[i + 1]]);
    }

    if (hasFetched && !isLoading && pairs.length === 0) return null;

    return (
        <div ref={ref} className="w-full mt-10">
            {isLoading || !hasFetched ? (
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <SkeletonCard />
                    <SkeletonCard />
                    <SkeletonCard />
                    <SkeletonCard />
                </div>
            ) : pairs.length > 0 ? (
                <div className="space-y-4">


                    <div className="flex items-center justify-between px-4 sm:px-6 mb-3">
                        <div className="flex items-center gap-3">
                            {/* Vertical accent bar */}
                            <div className="w-1 h-7 bg-slate-800 rounded-full" />
                            <h2 className="text-lg sm:text-xl font-semibold text-slate-800 tracking-tight">
                                Compare Similar Products
                            </h2>
                        </div>

                        <Link
                            href={`/compare?ids=${currentProductId}`}

                            className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-[var(--colour-fsP2)] cursor-pointer hover:text-slate-900 hover:bg-slate-100 rounded-full transition-all duration-200 group"
                        >
                            View All
                            <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
                        </Link>
                    </div>

                    {/* Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {pairs.map(([left, right], idx) => (
                            <CompareCard key={`${left.id}-${right.id}`} left={left} right={right} />
                        ))}
                    </div>
                </div>
            ) : null}
        </div>
    );
}
