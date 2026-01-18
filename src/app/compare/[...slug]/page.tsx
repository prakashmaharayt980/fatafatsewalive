'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import useSWR from 'swr';
import Image from 'next/image';
import Link from 'next/link';
import { Check, X, ArrowLeft } from 'lucide-react';
import RemoteServices from '../../api/remoteservice';
import { ProductDetails } from '../../types/ProductDetailsTypes';
import { useCompare } from '../../context/CompareContext';

export default function ComparisonPage() {
    const params = useParams();
    const slug = params.slug as string[]; // e.g., ['iphone-14-vs-samsung-s23']
    const { addToCompare } = useCompare();

    const [products, setProducts] = useState<ProductDetails[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProducts = async () => {
            if (!slug || slug.length === 0) return;

            // 1. Parse slugs from URL (e.g. "iphone-13-vs-galaxy-s22")
            // Assuming the URL segment is joined by 'vs' if passed as single string or array
            // The Next.js catch-all might return array. We join and split by '-vs-'.
            const rawSlug = Array.isArray(slug) ? slug.join('/') : slug;
            const productSlugs = rawSlug.split('-vs-');

            if (productSlugs.length === 0) {
                setLoading(false);
                return;
            }

            try {
                // 2. Fetch all products in parallel
                // Note: RemoteServices doesn't have "getBySlug", using Search as proxy or specialized endpoint if available.
                // ideally: RemoteServices.ProductDetails_Slug(s)
                // For now, using Search or Loop ID fetch if slugs are actually IDs (fallback)

                const fetchedProducts = await Promise.all(
                    productSlugs.map(async (s) => {
                        // Try fetching by slug/search
                        // If s looks like an ID (numeric), use ID fetch
                        if (!isNaN(Number(s))) {
                            return RemoteServices.ProductDetails_ID(s);
                        }

                        // Fallback: Search by name/slug and take first result
                        // This is inexact but works for demo/SEO URLs if names are unique enough
                        const res = await RemoteServices.SerachProducts(s.replace(/-/g, ' '));
                        return res.data?.[0] || null;
                    })
                );

                setProducts(fetchedProducts.filter(p => p !== null) as ProductDetails[]);
            } catch (error) {
                console.error("Failed to fetch comparison products", error);
            } finally {
                setLoading(false);
            }
        };

        fetchProducts();
    }, [slug]);


    if (loading) return <div className="min-h-screen flex items-center justify-center">Loading comparison...</div>;

    if (products.length === 0) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center p-4">
                <h1 className="text-2xl font-bold text-gray-900 mb-4">No products found to compare</h1>
                <Link href="/blog" className="text-blue-600 hover:underline">Back to Blog</Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white pb-20 pt-8">
            <div className="container mx-auto px-4 max-w-[1600px]">
                <div className="mb-8 flex items-center gap-4">
                    <Link href="/blog" className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                        <ArrowLeft className="w-6 h-6 text-gray-600" />
                    </Link>
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-900 font-heading">
                        Product Comparison
                    </h1>
                </div>

                <div className="overflow-x-auto pb-8">
                    <table className="w-full text-left border-collapse min-w-[800px]">
                        <thead>
                            <tr>
                                <th className="p-4 border-b-2 border-gray-100 w-48 bg-white sticky left-0 z-10">Specs</th>
                                {products.map(p => (
                                    <th key={p.id} className="p-4 border-b-2 border-gray-100 min-w-[200px] align-top">
                                        <div className="flex flex-col items-center text-center">
                                            <div className="relative w-32 h-32 mb-4 bg-gray-50 rounded-xl overflow-hidden">
                                                <Image src={p.image?.full || ''} alt={p.name} fill className="object-contain p-2" />
                                            </div>
                                            <h3 className="font-bold text-gray-900 leading-tight mb-2">{p.name}</h3>
                                            <p className="text-blue-600 font-bold mb-4">Rs. {p.discounted_price.toLocaleString()}</p>
                                            <button
                                                className="px-6 py-2 bg-blue-600 text-white text-sm font-bold rounded-full hover:bg-blue-700 transition"
                                                onClick={() => addToCompare(p)}
                                            >
                                                Add to Cart
                                            </button>
                                        </div>
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {/* General Specs */}
                            <tr className="bg-gray-50/50"><td colSpan={products.length + 1} className="p-3 font-bold text-gray-500 text-xs uppercase tracking-wider sticky left-0">General</td></tr>
                            <tr>
                                <td className="p-4 font-semibold text-gray-700 sticky left-0 bg-white">Brand</td>
                                {products.map(p => <td key={p.id} className="p-4 text-gray-600">{p.brand?.name}</td>)}
                            </tr>

                            {/* Mock Specs (Since ProductDetails might lack deep specs in this interface, showing basics) */}
                            <tr>
                                <td className="p-4 font-semibold text-gray-700 sticky left-0 bg-white">Stock Status</td>
                                {products.map(p => (
                                    <td key={p.id} className="p-4 text-gray-600">
                                        {p.quantity > 0
                                            ? <span className="flex items-center gap-2 text-green-600 font-bold"><Check className="w-4 h-4" /> In Stock</span>
                                            : <span className="flex items-center gap-2 text-red-500 font-bold"><X className="w-4 h-4" /> Out of Stock</span>
                                        }
                                    </td>
                                ))}
                            </tr>

                            {/* Description as "Summary" */}
                            <tr>
                                <td className="p-4 font-semibold text-gray-700 sticky left-0 bg-white align-top">Summary</td>
                                {products.map(p => (
                                    <td key={p.id} className="p-4 text-gray-600 text-sm leading-relaxed min-w-[250px]">
                                        <div dangerouslySetInnerHTML={{ __html: p.description?.substring(0, 150) + '...' }} />
                                    </td>
                                ))}
                            </tr>


                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
