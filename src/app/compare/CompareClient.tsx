'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { X, Loader2, Trash2, Plus, Check, RotateCcw } from 'lucide-react';
import RemoteServices from '../api/remoteservice';
import { ProductDetails } from '../types/ProductDetailsTypes';
import { toast } from 'sonner';
import AddProductSearch from './AddProductSearch';
import { Button } from '@/components/ui/button';

function CompareContent() {
    const router = useRouter();
    const searchParams = useSearchParams();

    const idsString = searchParams.get('ids') || '';
    const initialIds = idsString ? idsString.split(',').filter(Boolean) : [];

    const [products, setProducts] = useState<ProductDetails[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeSpecTab, setActiveSpecTab] = useState('General');

    useEffect(() => {
        const fetchProducts = async () => {
            if (initialIds.length === 0) {
                setProducts([]);
                setLoading(false);
                return;
            }

            setLoading(true);
            try {
                const fetched = await Promise.all(
                    initialIds.map(async (id) => {
                        try {
                            const response = await RemoteServices.searchProducts({ search: id });
                            return response.data?.[0] || null;
                        } catch (e) {
                            console.error(`Failed to load product ${id}`, e);
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
    }, [idsString]);

    const handleAddProduct = (product: ProductDetails) => {
        const newIds = [...initialIds, String(product.id)].join(',');
        router.push(`/compare?ids=${newIds}`);
    };

    const handleRemoveProduct = (productId: number) => {
        const newIds = initialIds.filter(id => id !== String(productId)).join(',');
        router.push(newIds ? `/compare?ids=${newIds}` : '/compare');
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
            { label: 'Price', render: (p) => <span className="font-bold text-[var(--colour-fsP1)]">Rs. {p.discounted_price?.toLocaleString()}</span> },
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

    if (loading && products.length === 0 && initialIds.length > 0) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center gap-3 bg-gray-50">
                <Loader2 className="w-10 h-10 animate-spin text-[var(--colour-fsP1)]" />
                <p className="text-gray-500 font-medium">Loading comparison...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            <div className="container mx-auto px-4 max-w-[1400px]">
                {/* Breadcrumb & Header */}
                <div className="py-6">
                    <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
                        <Link href="/" className="hover:text-[var(--colour-fsP1)] transition cursor-pointer">Home</Link>
                        <span>/</span>
                        <span className="text-gray-800 font-medium">Compare</span>
                    </div>
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <h1 className="text-2xl md:text-3xl font-bold text-[var(--colour-fsP1)]">
                                Compare {products.length > 0 ? products[0].categories?.[0]?.title || 'Products' : 'Products'}
                            </h1>
                            <p className="text-gray-500 mt-1">Find the perfect product by comparing features side by side</p>
                        </div>
                        {products.length > 0 && (
                            <Button
                                variant="outline"
                                onClick={handleClearAll}
                                className="text-red-500 border-red-200 hover:bg-red-50 hover:text-red-600 cursor-pointer"
                            >
                                <RotateCcw className="w-4 h-4 mr-2" />
                                Clear
                            </Button>
                        )}
                    </div>
                </div>

                {/* Product Cards Section - Dark Theme Header */}
                <div className="bg-gray-800 rounded-t-2xl p-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* Existing Products */}
                        {products.map((product) => (
                            <div key={product.id} className="relative bg-gray-700/50 backdrop-blur rounded-xl p-4 group">
                                <button
                                    onClick={() => handleRemoveProduct(product.id)}
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
                                        href={`/product/${product.slug}?id=${product.id}`}
                                        className="w-full py-2.5 px-4 bg-[var(--colour-fsP1)] hover:bg-blue-700 text-white text-sm font-bold rounded-lg transition cursor-pointer text-center block"
                                    >
                                        Buy Now
                                    </Link>
                                    <p className="text-white font-medium text-sm mt-3 line-clamp-2">{product.name}</p>
                                </div>
                            </div>
                        ))}

                        {/* Add Product Slot */}
                        {showAddSlot && (
                            <div className="bg-gray-700/30 border-2 border-dashed border-gray-600 rounded-xl p-4 min-h-[350px]">
                                <AddProductSearch
                                    onSelect={handleAddProduct}
                                    excludeIds={products.map(p => p.id)}
                                />
                            </div>
                        )}
                    </div>
                </div>

                {/* Spec Category Tabs */}
                <div className="bg-white border-x border-gray-200 px-4 py-3 flex items-center gap-2 overflow-x-auto scrollbar-none">
                    {specCategories.map((cat) => (
                        <button
                            key={cat}
                            onClick={() => setActiveSpecTab(cat)}
                            className={`px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap cursor-pointer ${activeSpecTab === cat
                                ? 'bg-[var(--colour-fsP1)] text-white shadow-md'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                }`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>

                {/* Specs Table */}
                <div className="bg-white rounded-b-2xl shadow-sm border border-gray-200 overflow-hidden">
                    {products.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <tbody className="divide-y divide-gray-100">
                                    {/* Active Tab Title */}
                                    <tr className="bg-[var(--colour-fsP1)]/10">
                                        <td colSpan={products.length + 1} className="p-3 pl-5 font-bold text-[var(--colour-fsP1)] text-sm uppercase tracking-wide">
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
                        <div className="flex flex-col items-center justify-center py-20 text-gray-400">
                            <Plus className="w-16 h-16 mb-4 opacity-30" />
                            <p className="text-lg font-medium">No products selected for comparison</p>
                            <p className="text-sm mt-1">Add products using the search above</p>
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
