'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { X, Loader2, Trash2, Plus, Check, RotateCcw, ArrowLeft } from 'lucide-react';
import RemoteServices from '../api/remoteservice';
import { ProductDetails } from '../types/ProductDetailsTypes';
import { toast } from 'sonner';
import AddProductSearch from './AddProductSearch';
import { Button } from '@/components/ui/button';

function CompareContent() {
    const router = useRouter();
    const searchParams = useSearchParams();

    // Use slugs instead of IDs for SEO-friendly URLs
    const slugsString = searchParams.get('slugs') || '';
    const initialSlugs = slugsString ? slugsString.split(',').filter(Boolean) : [];

    const [products, setProducts] = useState<ProductDetails[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeSpecTab, setActiveSpecTab] = useState('General');

    useEffect(() => {
        const fetchProducts = async () => {
            if (initialSlugs.length === 0) {
                setProducts([]);
                setLoading(false);
                return;
            }

            setLoading(true);
            try {
                const fetched = await Promise.all(
                    initialSlugs.map(async (slug) => {
                        try {
                            // Use getProductBySlug for more reliable fetching
                            const product = await RemoteServices.getProductBySlug(slug);
                            return product || null;
                        } catch (e) {
                            console.error(`Failed to load product with slug: ${slug}`, e);
                            return null;
                        }
                    })
                );
                const validProducts = fetched.filter((p): p is ProductDetails => !!p);
                setProducts(validProducts);
            } catch (error) {
                toast.error("Failed to load comparison data.");
            } finally {
                setLoading(false);
            }
        };

        fetchProducts();
    }, [slugsString]);

    const handleAddProduct = (product: ProductDetails) => {
        // Use product slug for the URL
        const newSlugs = [...initialSlugs, product.slug].join(',');
        router.push(`/compare?slugs=${newSlugs}`);
    };

    const handleRemoveProduct = (productSlug: string) => {
        const newSlugs = initialSlugs.filter(slug => slug !== productSlug).join(',');
        router.push(newSlugs ? `/compare?slugs=${newSlugs}` : '/compare');
    };

    const handleClearAll = () => {
        router.push('/compare');
    };

    // Spec categories for tabs
    const specCategories = ['General', 'Display', 'Performance', 'Camera', 'Battery', 'Connectivity'];

    // Define spec groups with category mapping
    const specsGroups: Record<string, Array<{ label: string; render: (p: ProductDetails) => React.ReactNode }>> = {
        'General': [
            { label: 'Brand', render: (p) => p.brand?.name || '-' },
            { label: 'Model', render: (p) => p.name || '-' },
            { label: 'Price', render: (p) => <span className="font-bold text-[var(--colour-fsP2)]">Rs. {p.discounted_price?.toLocaleString()}</span> },
            { label: 'Status', render: (p) => p.quantity > 0 ? <span className="text-green-600 font-medium">In Stock</span> : <span className="text-red-500">Out of Stock</span> },
            { label: 'Warranty', render: (p) => p.warranty_description || 'Standard' },
        ],
        'Display': [
            { label: 'Type', render: () => 'AMOLED' },
            { label: 'Size', render: () => '6.7 inches' },
            { label: 'Resolution', render: () => '1080 x 2400 pixels' },
            { label: 'Refresh Rate', render: () => '120Hz' },
        ],
        'Performance': [
            { label: 'Processor', render: () => 'Snapdragon 8 Gen 2' },
            { label: 'RAM', render: () => '8GB / 12GB' },
            { label: 'Storage', render: () => '128GB / 256GB' },
        ],
        'Camera': [
            { label: 'Main Camera', render: () => '108MP + 12MP + 8MP' },
            { label: 'Front Camera', render: () => '32MP' },
            { label: 'Video', render: () => '4K@60fps' },
        ],
        'Battery': [
            { label: 'Capacity', render: () => '5000 mAh' },
            { label: 'Charging', render: () => '65W Fast Charging' },
        ],
        'Connectivity': [
            { label: '5G', render: () => <Check className="w-5 h-5 text-green-600" /> },
            { label: 'WiFi', render: () => 'Wi-Fi 6E' },
            { label: 'Bluetooth', render: () => '5.3' },
            { label: 'NFC', render: () => <Check className="w-5 h-5 text-green-600" /> },
        ],
    };

    const maxSlots = 3;
    const showAddSlot = products.length < maxSlots;

    if (loading && products.length === 0 && initialSlugs.length > 0) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center gap-3 bg-gray-50">
                <div className="w-16 h-16 rounded-full bg-[var(--colour-fsP2)]/10 flex items-center justify-center animate-pulse">
                    <Loader2 className="w-8 h-8 animate-spin text-[var(--colour-fsP2)]" />
                </div>
                <p className="text-gray-500 font-medium">Loading comparison...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            <div className="container mx-auto px-4 max-w-[1400px]">
                {/* Breadcrumb & Header - Enhanced Design */}
                <div className="py-8">
                    <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
                        <Link href="/" className="hover:text-[var(--colour-fsP2)] transition cursor-pointer flex items-center gap-1">
                            <ArrowLeft className="w-4 h-4" />
                            Home
                        </Link>
                        <span className="text-gray-300">/</span>
                        <span className="text-[var(--colour-fsP2)] font-medium">Compare Products</span>
                    </div>
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                        <div>
                            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                                Compare <span className="text-[var(--colour-fsP2)]">{products.length > 0 ? products[0].categories?.[0]?.title || 'Products' : 'Products'}</span>
                            </h1>
                            <p className="text-gray-500">Find the perfect product by comparing features side by side</p>
                        </div>
                        {products.length > 0 && (
                            <Button
                                variant="outline"
                                onClick={handleClearAll}
                                className="text-red-500 border-red-200 hover:bg-red-50 hover:text-red-600 hover:border-red-300 cursor-pointer transition-all"
                            >
                                <RotateCcw className="w-4 h-4 mr-2" />
                                Clear All
                            </Button>
                        )}
                    </div>
                </div>

                {/* Product Cards Section - Premium Dark Theme Header */}
                <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-t-3xl p-6 md:p-8 shadow-xl">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* Existing Products */}
                        {products.map((product) => (
                            <div key={product.id} className="relative bg-gray-700/50 backdrop-blur rounded-xl p-4 group">
                                <button
                                    onClick={() => handleRemoveProduct(product.slug)}
                                    className="absolute top-2 right-2 p-2 bg-gray-600/50 hover:bg-red-500 text-white rounded-full transition-all opacity-100 md:opacity-0 md:group-hover:opacity-100 z-10 cursor-pointer"
                                    title="Remove"
                                >
                                    <X className="w-4 h-4" />
                                </button>

                                <div className="flex flex-col items-center text-center">
                                    <div className="relative w-32 h-32 md:w-40 md:h-40 bg-white rounded-lg overflow-hidden p-2 mb-4">
                                        <Image
                                            src={product.image?.full || '/placeholder.png'}
                                            alt={product.name}
                                            fill
                                            className="object-contain hover:scale-110 transition-transform duration-300"
                                        />
                                    </div>
                                    <div className="flex items-center gap-1 mb-2">
                                        {[1, 2, 3, 4, 5].map((star) => (
                                            <svg key={star} className={`w-4 h-4 ${star <= (product.average_rating || 4) ? 'text-yellow-400' : 'text-gray-500'}`} fill="currentColor" viewBox="0 0 20 20">
                                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                            </svg>
                                        ))}
                                    </div>
                                    <p className="text-gray-400 text-sm mb-1">Starting from</p>
                                    <p className="text-white font-bold text-xl mb-3">
                                        Rs. {product.discounted_price?.toLocaleString()}
                                    </p>
                                    <Link
                                        href={`/products/${product.slug}`}
                                        className="w-full py-2.5 px-4 bg-[var(--colour-fsP2)] hover:bg-blue-800 text-white text-sm font-bold rounded-lg transition cursor-pointer text-center block shadow-lg shadow-[var(--colour-fsP2)]/20"
                                    >
                                        Buy Now
                                    </Link>
                                    <p className="text-white font-medium text-sm mt-3 line-clamp-2">{product.name}</p>
                                </div>
                            </div>
                        ))}

                        {/* Add Product Slot */}
                        {showAddSlot && (
                            <div className="bg-gray-700/20 border-2 border-dashed border-[var(--colour-fsP2)]/30 rounded-2xl p-4 min-h-[350px]">
                                <AddProductSearch
                                    onSelect={handleAddProduct}
                                    excludeSlugs={products.map(p => p.slug)}
                                />
                            </div>
                        )}
                    </div>
                </div>

                {/* Spec Category Tabs */}
                <div className="bg-white border-x border-gray-200 px-5 py-4 flex items-center gap-2 overflow-x-auto scrollbar-none">
                    {specCategories.map((cat) => (
                        <button
                            key={cat}
                            onClick={() => setActiveSpecTab(cat)}
                            className={`px-5 py-2.5 rounded-full text-sm font-semibold transition-all whitespace-nowrap cursor-pointer ${activeSpecTab === cat
                                ? 'bg-[var(--colour-fsP2)] text-white shadow-lg shadow-[var(--colour-fsP2)]/20'
                                : 'bg-gray-100 text-gray-600 hover:bg-[var(--colour-fsP2)]/10 hover:text-[var(--colour-fsP2)]'
                                }`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>

                {/* Specs Table */}
                <div className="bg-white rounded-b-3xl shadow-lg border border-gray-200 overflow-hidden">
                    {products.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <tbody className="divide-y divide-gray-100">
                                    {/* Active Tab Title */}
                                    <tr className="bg-[var(--colour-fsP2)]/10">
                                        <td colSpan={products.length + 1} className="p-4 pl-6 font-bold text-[var(--colour-fsP2)] text-sm uppercase tracking-wide">
                                            {activeSpecTab}
                                        </td>
                                    </tr>

                                    {/* Spec Rows */}
                                    {specsGroups[activeSpecTab]?.map((row, idx) => (
                                        <tr key={row.label} className={`${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'} hover:bg-blue-50/30 transition-colors`}>
                                            <td className="p-4 font-medium text-gray-600 text-sm w-48 border-r border-gray-100">
                                                {row.label}
                                            </td>
                                            {products.map((product) => (
                                                <td key={`${product.id}-${row.label}`} className="p-4 text-gray-900 text-sm font-medium">
                                                    {row.render(product)}
                                                </td>
                                            ))}
                                            {showAddSlot && <td className="p-4 border-l border-gray-100"></td>}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-24 text-gray-400">
                            <div className="w-24 h-24 rounded-full bg-[var(--colour-fsP2)]/10 flex items-center justify-center mb-6">
                                <Plus className="w-12 h-12 text-[var(--colour-fsP2)]" />
                            </div>
                            <p className="text-xl font-semibold text-gray-600">No products selected for comparison</p>
                            <p className="text-sm mt-2 text-gray-400">Add products using the search above to get started</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default function ComparePage() {
    return (
        <Suspense fallback={null}>
            <CompareContent />
        </Suspense>
    );
}
