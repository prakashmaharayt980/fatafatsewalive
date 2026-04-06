'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { fetchCategoryProducts } from '@/app/product-details/actions';
import { Scale } from 'lucide-react';
import { decorateProduct } from '@/app/api/utils/productDecorator';
import type { DecoratedProduct } from '@/app/types/DecoratedProduct';

interface Props {
    categorySlug?: string;
    currentProductId?: number;
}

function ProductSide({ product }: { product: DecoratedProduct }) {
    const imgUrl = product.thumb?.url || '/svgfile/no-image.svg';
    const discountPct = product.discountPercent ?? 0;

    return (
        <div className="flex flex-col items-center gap-1.5 flex-1 min-w-0">
            <Link
                href={`/product-details/${product.slug}`}
                className="relative w-full aspect-square rounded-lg overflow-hidden bg-gray-50 flex items-center justify-center hover:bg-gray-100 transition-colors"
            >
                <Image
                    src={imgUrl}
                    alt={product.name}
                    width={100}
                    height={100}
                    className="object-contain w-4/5 h-4/5"
                />
                {discountPct > 0 && (
                    <span className="absolute top-1.5 left-1.5 bg-red-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full">
                        -{discountPct}%
                    </span>
                )}
            </Link>

            {product.brandName && (
                <span className="text-[9px] font-bold text-(--colour-fsP2) uppercase tracking-wider truncate w-full text-center">
                    {product.brandName}
                </span>
            )}

            <Link href={`/product-details/${product.slug}`} className="w-full">
                <p className="text-[11px] font-semibold text-gray-700 text-center leading-snug line-clamp-2 hover:text-(--colour-fsP2) transition-colors">
                    {product.name}
                </p>
            </Link>

            <div className="flex flex-col items-center gap-0.5 mt-auto">
                <span className="text-xs font-bold text-gray-900">
                    Rs. {product.displayPrice}
                </span>
                {discountPct > 0 && product.basePrice !== product.discountedPriceVal && (
                    <span className="text-[9px] text-gray-400 line-through">
                        Rs. {(product.basePrice ?? 0).toLocaleString()}
                    </span>
                )}
            </div>
        </div>
    );
}

function CompareCard({ left, right }: { left: DecoratedProduct; right: DecoratedProduct }) {
    return (
        <div className="group bg-white rounded-xl border border-gray-200 hover:border-gray-300 hover:shadow-sm transition-all duration-200 overflow-hidden flex flex-col">
            {/* Products row */}
            <div className="flex items-stretch gap-0 px-3 pt-4 pb-3 flex-1">
                <ProductSide product={left} />

                {/* VS divider */}
                <div className="flex flex-col items-center justify-center shrink-0 px-2">
                    <div className="w-px flex-1 bg-gray-100" />
                    <div className="w-6 h-6 rounded-full border border-gray-200 bg-white flex items-center justify-center my-1.5 shrink-0">
                        <span className="text-[8px] font-black text-gray-400 uppercase">VS</span>
                    </div>
                    <div className="w-px flex-1 bg-gray-100" />
                </div>

                <ProductSide product={right} />
            </div>

            {/* CTA */}
            <div className="px-3 pb-3">
                <Link
                    href={`/compare?slugs=${left.slug},${right.slug}`}
                    className="flex items-center justify-center gap-1.5 w-full py-2 rounded-lg text-[11px] font-semibold text-(--colour-fsP2) border border-(--colour-fsP2) hover:bg-(--colour-fsP2) hover:text-white transition-colors duration-200"
                >
                    <Scale className="w-3 h-3" />
                    Compare
                </Link>
            </div>
        </div>
    );
}

export default function LazyCompareProducts({ categorySlug, currentProductId }: Props) {
    const [data, setData] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (!categorySlug) { setIsLoading(false); return; }
        setIsLoading(true);
        fetchCategoryProducts(categorySlug, { per_page: 10, min_price: 100 })
            .then(res => { if (res?.data) setData(res.data); })
            .catch((err: any) => { if (err?.response?.status !== 404) console.error(err); })
            .finally(() => setIsLoading(false));
    }, [categorySlug, currentProductId]);

    const productList = (data?.products ?? []).map((p: any, idx: number) => decorateProduct(p, idx));
    const filtered = currentProductId
        ? productList.filter((p: DecoratedProduct) => p.id !== currentProductId)
        : productList;

    const pairs: [DecoratedProduct, DecoratedProduct][] = [];
    for (let i = 0; i + 1 < filtered.length && pairs.length < 4; i += 2) {
        pairs.push([filtered[i], filtered[i + 1]]);
    }

    if (isLoading || pairs.length === 0) return null;

    return (
        <div className="w-full sm:px-4">
            {/* Header */}
            <div className="flex items-center gap-2 mb-4">
                <div className="w-1 h-6 bg-(--colour-fsP2) rounded-full" />
                <h2 className="text-base font-bold text-gray-800">Compare Similar Products</h2>
            </div>

            {/* Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
                {pairs.map(([left, right]) => (
                    <CompareCard key={`${left.id}-${right.id}`} left={left} right={right} />
                ))}
            </div>
        </div>
    );
}
