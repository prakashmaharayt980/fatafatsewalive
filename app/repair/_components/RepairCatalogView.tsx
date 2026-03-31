'use client'

import React from 'react'
import { Search, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Input } from '@/components/ui/input'
import RepairProductCard from './RepairProductCard'

interface Props {
    categories: any[]
    selectedCategory: any
    brands: any[]
    selectedBrand: string
    searchTerm: string
    products: any[]
    isLoadingProducts: boolean
    onSelectCategory: (cat: any) => void
    onSelectBrand: (slug: string) => void
    onSearch: (value: string) => void
    onSelectProduct: (product: any) => void
    getProductImage: (product: any) => string
}

export default function RepairCatalogView({
    categories,
    selectedCategory,
    brands,
    selectedBrand,
    searchTerm,
    products,
    isLoadingProducts,
    onSelectCategory,
    onSelectBrand,
    onSearch,
    onSelectProduct,
    getProductImage,
}: Props) {
    // Determine brands to show: if category selected, show its brands or all brands
    const brandsToShow = selectedCategory?.brands || brands || []

    return (
        <div className="p-6 md:p-8 space-y-8">
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
                <div className="flex-1 space-y-6">
                    {/* Category Selection */}
                    <div className="space-y-3">
                        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400">Select Category</p>
                        <div className="flex flex-wrap gap-2">
                            {categories.map(cat => (
                                <button
                                    key={cat.id}
                                    onClick={() => onSelectCategory(cat)}
                                    className={cn(
                                        'px-4 py-2 rounded-xl text-xs font-bold border transition-colors cursor-pointer',
                                        selectedCategory?.id === cat.id
                                            ? 'bg-[var(--colour-fsP2)] border-[var(--colour-fsP2)] text-white'
                                            : 'bg-white border-gray-100 text-gray-500 hover:border-gray-200'
                                    )}
                                >
                                    {cat.title}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Brand Selection */}
                    <div className="space-y-3">
                        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400">Select Brand</p>
                        <div className="flex flex-wrap gap-2 max-h-[120px] overflow-y-auto pr-2 scrollbar-thin">
                            <button
                                onClick={() => onSelectBrand('')}
                                className={cn(
                                    'px-4 py-2 rounded-xl text-xs font-bold border transition-colors cursor-pointer',
                                    !selectedBrand ? 'bg-gray-900 border-gray-900 text-white' : 'bg-white border-gray-100 text-gray-500 hover:border-gray-200'
                                )}
                            >
                                All Brands
                            </button>
                            {brandsToShow.map((brand: any) => (
                                <button
                                    key={brand.slug}
                                    onClick={() => onSelectBrand(brand.slug)}
                                    className={cn(
                                        'px-4 py-2 rounded-xl text-xs font-bold border transition-colors cursor-pointer',
                                        selectedBrand === brand.slug ? 'bg-gray-900 border-gray-900 text-white' : 'bg-white border-gray-100 text-gray-500 hover:border-gray-200'
                                    )}
                                >
                                    {brand.name}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="shrink-0 relative w-full lg:w-72">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                    <Input
                        placeholder="Search device model..."
                        className="pl-9 pr-9 h-11 text-sm border-gray-100 rounded-xl font-medium bg-gray-50 focus:bg-white focus:border-[var(--colour-fsP2)] transition-all focus-visible:ring-0"
                        value={searchTerm}
                        onChange={e => onSearch(e.target.value)}
                    />
                    {searchTerm && (
                        <button onClick={() => onSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-500 cursor-pointer">
                            <X size={14} />
                        </button>
                    )}
                </div>
            </div>

            <div className="relative min-h-[400px] pt-4">
                {products.length > 0 ? (
                    <div className={cn(
                        'grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 transition-opacity duration-300',
                        isLoadingProducts ? 'opacity-30' : 'opacity-100'
                    )}>
                        {products.map(product => (
                            <RepairProductCard
                                key={product.id}
                                product={product}
                                selectedBrand={selectedBrand}
                                onSelect={onSelectProduct}
                                getProductImage={getProductImage}
                            />
                        ))}
                    </div>
                ) : !isLoadingProducts && (
                    <div className="flex flex-col items-center justify-center py-20 gap-3">
                        <div className="w-16 h-16 rounded-full bg-gray-50 flex items-center justify-center">
                            <Search size={28} className="text-gray-200" />
                        </div>
                        <div className="text-center">
                            <p className="text-sm font-bold text-gray-900">No models found</p>
                            <p className="text-xs text-gray-400 mt-1">Try adjusting your filters or search term</p>
                        </div>
                    </div>
                )}
                {isLoadingProducts && products.length === 0 && (
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                        {Array.from({ length: 10 }).map((_, i) => (
                            <div key={i} className="aspect-[4/5] bg-gray-50 animate-pulse rounded-2xl border border-gray-100" />
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}
