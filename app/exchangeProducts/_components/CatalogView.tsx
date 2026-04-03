'use client'

import React from 'react'
import { Search, X, ArrowRight } from 'lucide-react'
import Image from 'next/image'
import { cn } from '@/lib/utils'
import { Input } from '@/components/ui/input'
import type { NavbarItem } from '@/app/context/navbar.interface'
import { type ProductListItem, getMaxExchangeValue } from '../exchange-helpers'

interface CatalogViewProps {
    categories: NavbarItem[]
    selectedCategory: NavbarItem | null
    selectedBrand: string
    searchTerm: string
    products: ProductListItem[]
    isLoadingProducts: boolean
    onSelectCategory: (cat: NavbarItem) => void
    onSelectBrand: (slug: string) => void
    onSearch: (value: string) => void
    onSelectProduct: (product: ProductListItem) => void
    getProductImage: (product: ProductListItem) => string
}

export default function CatalogView({
    categories,
    selectedCategory,
    selectedBrand,
    searchTerm,
    products,
    isLoadingProducts,
    onSelectCategory,
    onSelectBrand,
    onSearch,
    onSelectProduct,
    getProductImage
}: CatalogViewProps) {
    return (
        <div className="p-6 md:p-8 space-y-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-5">
                <div className="space-y-3 flex-1">
                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400">Category</p>
                    <div className="flex flex-wrap gap-2">
                        {categories.map(cat => (
                            <button
                                key={cat.id}
                                onClick={() => onSelectCategory(cat)}
                                className={cn(
                                    'px-4 py-2 rounded-xl text-xs font-bold border transition-colors cursor-pointer',
                                    selectedCategory?.id === cat.id
                                        ? 'bg-[var(--colour-fsP2)] border-[var(--colour-fsP2)] text-white'
                                        : 'bg-white border-gray-100 text-gray-600 hover:border-gray-200'
                                )}
                            >
                                {cat.title}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="relative w-full md:w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                    <Input
                        placeholder="Search device model..."
                        className="pl-9 pr-9 h-10 text-sm border-gray-100 rounded-xl font-medium bg-white focus-visible:ring-1 focus-visible:ring-[var(--colour-fsP2)]"
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

            {selectedCategory && (selectedCategory.brands?.length ?? 0) > 0 && (
                <div className="space-y-3">
                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400">Brand</p>
                    <div className="flex flex-wrap gap-2">
                        <button
                            onClick={() => onSelectBrand('')}
                            className={cn(
                                'px-4 py-2 rounded-xl text-xs font-bold border transition-colors cursor-pointer',
                                !selectedBrand ? 'bg-gray-900 border-gray-900 text-white' : 'bg-white border-gray-100 text-gray-500 hover:border-gray-200'
                            )}
                        >
                            All
                        </button>
                        {selectedCategory.brands?.map(brand => (
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
            )}

            <div className="relative min-h-[400px]">
                {products.length > 0 ? (
                    <div className={cn(
                        'grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 transition-opacity duration-300',
                        isLoadingProducts ? 'opacity-30' : 'opacity-100'
                    )}>
                        {products.map(product => {
                            const maxVal = getMaxExchangeValue(product.discounted_price || product.price, product.created_at)
                            return (
                            <div
                                key={product.id}
                                onClick={() => onSelectProduct(product)}
                                role="button"
                                tabIndex={0}
                                onKeyDown={e => e.key === 'Enter' && onSelectProduct(product)}
                                className="group flex flex-col bg-white rounded-2xl border border-gray-100 hover:border-gray-200 hover:shadow-[0_8px_32px_rgba(0,0,0,0.06)] transition-all duration-300 cursor-pointer overflow-hidden h-full"
                            >
                                <div className="relative aspect-square w-full bg-gray-50 overflow-hidden">
                                    <Image
                                        src={getProductImage(product)}
                                        alt={product.name}
                                        fill
                                        className="object-contain p-4 mix-blend-multiply transition-transform duration-500 group-hover:scale-105"
                                        sizes="(max-width: 640px) 50vw, 20vw"
                                    />
                                </div>
                                <div className="flex flex-col flex-1 p-3.5 pt-3">
                                    {(product.brand?.name ?? selectedBrand) && (
                                        <p className="text-[10.5px] font-bold uppercase tracking-widest text-gray-400 truncate mb-1">
                                            {product.brand?.name ?? selectedBrand}
                                        </p>
                                    )}
                                    <p className="text-[13px] font-bold text-gray-800 leading-snug line-clamp-2 min-h-[36px] group-hover:text-[var(--colour-fsP2)] transition-colors">
                                        {product.name}
                                    </p>
                                    <div className="mt-auto pt-2.5 border-t border-gray-50 flex items-center justify-between">
                                        <div>
                                            <p className="text-[9.5px] font-bold uppercase tracking-wide text-gray-400">Exchange up to</p>
                                            <p className="text-[14px] font-bold text-[var(--colour-fsP2)]">Rs. {maxVal.toLocaleString()}</p>
                                        </div>
                                        <div className="w-7 h-7 rounded-full text-white flex items-center justify-center shrink-0" style={{ background: 'var(--colour-fsP2)' }}>
                                            <ArrowRight size={13} />
                                        </div>
                                    </div>
                                </div>
                            </div>
                            )
                        })}
                    </div>
                ) : !isLoadingProducts && (
                    <div className="flex flex-col items-center justify-center py-20 gap-2">
                        <Search size={28} className="text-gray-200" />
                        <p className="text-sm font-medium text-gray-400">No models found</p>
                    </div>
                )}
            </div>
        </div>
    )
}
