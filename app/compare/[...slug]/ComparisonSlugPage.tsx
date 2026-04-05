'use client';

import { useEffect, useState, Suspense } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Check, X, Loader2, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import CustomIconImg from '@/app/CommonVue/CustomIconImg';
import type { ProductData } from '../../types/ProductDetailsTypes';
import { getProductBySlug } from '@/app/api/services/product.service';

function ComparisonPageContent() {
    const params = useParams();
    const slug = params.slug as string[];

    const [products, setProducts] = useState<ProductData[]>([]);
    const [loading, setLoading] = useState(true);
    const [notFound, setNotFound] = useState(false);

    useEffect(() => {
        const fetchProducts = async () => {
            if (!slug || slug.length === 0) {
                setLoading(false);
                setNotFound(true);
                return;
            }

            const rawSlug = Array.isArray(slug) ? slug.join('/') : slug;
            const productSlugs = rawSlug.split('-vs-').map(s => s.trim()).filter(Boolean);

            if (productSlugs.length === 0) {
                setLoading(false);
                setNotFound(true);
                return;
            }

            try {
                const fetched = await Promise.all(
                    productSlugs.map(s => getProductBySlug(s).catch(() => null))
                );
                const valid = fetched.filter((p): p is ProductData => !!p);
                if (valid.length === 0) setNotFound(true);
                setProducts(valid);
            } catch {
                setNotFound(true);
            } finally {
                setLoading(false);
            }
        };

        fetchProducts();
    }, [slug]);

    if (loading) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center gap-3">
                <Loader2 className="w-8 h-8 animate-spin text-(--colour-fsP2)" />
                <p className="text-gray-500 text-sm">Loading comparison...</p>
            </div>
        );
    }

    if (notFound || products.length === 0) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center gap-4 p-4">
                <p className="text-gray-500 text-sm">No products found to compare.</p>
                <Link href="/compare" className="text-sm text-(--colour-fsP2) hover:underline">
                    Go to Compare
                </Link>
            </div>
        );
    }

    const allKeys = new Set<string>();
    products.forEach(p => {
        if ((p as any).attributes) {
            Object.keys((p as any).attributes).forEach(k => allKeys.add(k));
        }
    });
    const specKeys = Array.from(allKeys).sort();

    return (
        <main className="min-h-screen bg-white pb-20">
            <div className="container mx-auto px-4 max-w-5xl">

                <div className="py-4 flex items-center gap-1.5 text-sm border-b border-gray-100 mb-6">
                    <Link href="/" className="text-(--colour-fsP2) hover:underline font-medium">Home</Link>
                    <ChevronRight className="w-4 h-4 text-gray-400" />
                    <Link href="/compare" className="text-(--colour-fsP2) hover:underline font-medium">Compare</Link>
                    <ChevronRight className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-700 font-semibold truncate">
                        {products.map(p => p.name).join(' vs ')}
                    </span>
                </div>

                <div className="overflow-x-auto pb-6">
                    <table className="w-full border-collapse border border-gray-200 rounded-lg overflow-hidden min-w-125">
                        <thead>
                            <tr>
                                <th className="px-3 py-3 border-b border-gray-200 bg-gray-50 text-left w-40">
                                    <span className="text-[11px] font-bold text-(--colour-fsP2) uppercase tracking-wide">Product</span>
                                </th>
                                {products.map(p => (
                                    <th key={p.id} className="p-4 border-b border-l border-gray-200 bg-white align-top">
                                        <div className="flex flex-col items-center text-center gap-2">
                                            <div className="relative w-28 h-28 bg-gray-50 rounded border border-gray-100">
                                                <Image
                                                    src={(p as any).thumb?.url ?? (p as any).image?.full ?? '/placeholder.png'}
                                                    alt={p.name}
                                                    fill
                                                    sizes="112px"
                                                    className="object-contain p-2"
                                                />
                                            </div>
                                            <h3 className="text-[13px] font-semibold text-gray-800 leading-snug line-clamp-2">
                                                <Link href={`/product-details/${p.slug}`} className="hover:text-(--colour-fsP2)">
                                                    {p.name}
                                                </Link>
                                            </h3>
                                            {p.discounted_price && (
                                                <p className="text-sm font-bold text-(--colour-fsP2)">
                                                    Rs. {p.discounted_price.toLocaleString()}
                                                </p>
                                            )}
                                        </div>
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {/* Brand */}
                            <tr className="border-b border-gray-100">
                                <td className="px-3 py-3 bg-gray-50 border-r border-gray-100 align-middle">
                                    <div className="flex items-center gap-1.5">
                                        <CustomIconImg iconKey="brand" size={14} className="text-(--colour-fsP2) shrink-0" color="currentColor" />
                                        <span className="text-[11px] font-bold text-(--colour-fsP2) uppercase tracking-wide">Brand</span>
                                    </div>
                                </td>
                                {products.map(p => (
                                    <td key={p.id} className="px-4 py-3 text-sm text-gray-800 border-l border-gray-100">
                                        {p.brand?.name ?? '—'}
                                    </td>
                                ))}
                            </tr>

                            {/* Stock */}
                            <tr className="border-b border-gray-100">
                                <td className="px-3 py-3 bg-gray-50 border-r border-gray-100 align-middle">
                                    <div className="flex items-center gap-1.5">
                                        <CustomIconImg iconKey="stock" size={14} className="text-(--colour-fsP2) shrink-0" color="currentColor" />
                                        <span className="text-[11px] font-bold text-(--colour-fsP2) uppercase tracking-wide">Stock</span>
                                    </div>
                                </td>
                                {products.map(p => (
                                    <td key={p.id} className="px-4 py-3 text-sm border-l border-gray-100">
                                        {p.quantity > 0
                                            ? <span className="flex items-center gap-1 text-green-600 font-medium"><Check className="w-3.5 h-3.5" /> In Stock</span>
                                            : <span className="flex items-center gap-1 text-red-500 font-medium"><X className="w-3.5 h-3.5" /> Out of Stock</span>
                                        }
                                    </td>
                                ))}
                            </tr>

                            {/* Dynamic Specs */}
                            {specKeys.map(key => {
                                const vals = products.map(p =>
                                    (p as any).attributes?.[key]?.trim().toLowerCase() ?? ''
                                );
                                return (
                                    <tr key={key} className="border-b border-gray-100 last:border-b-0">
                                        <td className="px-3 py-3 bg-gray-50 border-r border-gray-100 align-middle">
                                            <div className="flex items-center gap-1.5">
                                                <CustomIconImg iconKey={key} size={14} className="text-(--colour-fsP2) shrink-0" color="currentColor" />
                                                <span className="text-[11px] font-bold text-(--colour-fsP2) uppercase tracking-wide">{key}</span>
                                            </div>
                                        </td>
                                        {products.map((p, colIdx) => {
                                            const value = p.attributes?.[key];
                                            const v = vals[colIdx];
                                            const highlight = !!v && v !== '-' && vals.filter(x => x === v).length > 1;
                                            return (
                                                <td
                                                    key={p.id}
                                                    className={cn(
                                                        "px-4 py-3 text-sm border-l border-gray-100 leading-snug",
                                                        highlight ? "text-(--colour-fsP2) font-semibold" : "text-gray-800"
                                                    )}
                                                >
                                                    {value ?? '—'}
                                                </td>
                                            );
                                        })}
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </main>
    );
}

export default function ComparisonSlugPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-(--colour-fsP2)" />
            </div>
        }>
            <ComparisonPageContent />
        </Suspense>
    );
}
