'use client'

import React from 'react'
import { Search, X, Loader2, Sparkles, SlidersHorizontal } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import type { NavbarItem } from '@/app/context/navbar.interface'
import type { ProductListItem } from '../exchange-helpers'
import ExchangeProductCard from './ExchangeProductCard'

interface ExchangeCatalogProps {
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
}

export default function ExchangeCatalog({
    categories,
    selectedCategory,
    selectedBrand,
    searchTerm,
    products,
    isLoadingProducts,
    onSelectCategory,
    onSelectBrand,
    onSearch,
    onSelectProduct
}: ExchangeCatalogProps) {
    const mobileCategories = categories.filter(c => {
        const title = c.title?.toLowerCase() || ''
        const slug = c.slug?.toLowerCase() || ''
        return title.includes('mobile') || title.includes('laptop') || title.includes('smartphone') || title.includes('macbook') || slug.includes('mobile') || slug.includes('laptop') || slug.includes('smartphone') || slug.includes('macbook')
    })

    return (
        <div className="p-6 md:p-10 space-y-10 bg-white">
            
            {/* Header & Filter Controls */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-2 border-b border-gray-100">
                <div className="space-y-1">
                    <h2 className="text-2xl font-black text-gray-900 flex items-center gap-3">
                        <Sparkles className="text-yellow-400 fill-yellow-400" size={24} /> 
                        Eligible Device Catalog
                    </h2>
                    <p className="text-[12px] font-bold text-gray-400 uppercase tracking-[0.15em]">Browsing {products.length} active trade-ins</p>
                </div>
                
                {/* Search Bar - Premium Styled */}
                <div className="relative w-full max-w-md group transition-all">
                    <div className="absolute inset-0 bg-blue-100/30 blur-xl group-focus-within:bg-blue-200/40 rounded-3xl -z-10 transition-all" />
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 transition-colors group-focus-within:text-[var(--colour-fsP2)]" size={18} />
                    <Input
                        placeholder="Search for your specific device model..."
                        className="pl-12 pr-12 h-14 text-sm border-gray-200 rounded-2xl font-bold bg-white/100 shadow-sm focus:border-[var(--colour-fsP2)] focus:ring-4 focus:ring-blue-100 transition-all"
                        value={searchTerm}
                        onChange={e => onSearch(e.target.value)}
                    />
                    {searchTerm && (
                        <button onClick={() => onSearch('')} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-red-500 transition-colors cursor-pointer">
                            <X size={18} />
                        </button>
                    )}
                </div>
            </div>

            <div className="flex flex-col md:flex-row gap-10">
                
                {/* LHS Filter Sidebar */}
                <aside className="w-full md:w-64 shrink-0 space-y-8">
                    
                    {/* Category Selection */}
                    <div className="space-y-4">
                        <p className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.2em] text-gray-400 px-1">
                           <SlidersHorizontal size={14} /> Categories
                        </p>
                        <div className="flex flex-col gap-1.5">
                            {mobileCategories.map(cat => (
                                <button
                                    key={cat.id}
                                    onClick={() => onSelectCategory(cat)}
                                    className={cn(
                                        "w-full text-left px-5 py-3 rounded-2xl text-[13px] font-bold border transition-all duration-300 flex items-center justify-between group",
                                        selectedCategory?.id === cat.id 
                                            ? "bg-[var(--colour-fsP2)] border-[var(--colour-fsP2)] text-white shadow-xl translate-x-1" 
                                            : "bg-[#F8FAFC] border-transparent text-gray-600 hover:bg-white hover:border-gray-200"
                                    )}
                                >
                                    {cat.title}
                                    <div className={cn(
                                        "w-1.5 h-1.5 rounded-full transition-all",
                                        selectedCategory?.id === cat.id ? "bg-white scale-125" : "bg-gray-300 group-hover:bg-blue-400 group-hover:scale-125"
                                    )} />
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Brands Filter */}
                    {selectedCategory && (selectedCategory.brands?.length || 0) > 0 && (
                        <div className="space-y-4 animate-in slide-in-from-left-4 duration-500">
                            <p className="text-[11px] font-black uppercase tracking-[0.2em] text-gray-400 px-1">Popular Brands</p>
                            <div className="grid grid-cols-2 gap-2">
                                <button
                                    onClick={() => onSelectBrand('')}
                                    className={cn(
                                        "col-span-2 py-3 rounded-xl text-xs font-black uppercase tracking-wider border transition-all",
                                        !selectedBrand ? "bg-gray-900 border-gray-900 text-white shadow-lg" : "bg-white border-gray-100 text-gray-500 hover:border-gray-300 h-10 px-3 py-1.5 rounded-lg text-xs font-bold border transition-colors"
                                    )}
                                >
                                    All Brands
                                </button>
                                {selectedCategory.brands?.map(brand => (
                                    <button
                                        key={brand.slug}
                                        onClick={() => onSelectBrand(brand.slug)}
                                        className={cn(
                                            "flex flex-col items-center justify-center py-4 rounded-2xl border transition-all duration-500 hover:scale-105 active:scale-95 group",
                                            selectedBrand === brand.slug ? "bg-blue-50 border-[var(--colour-fsP2)] ring-1 ring-[var(--colour-fsP2)]/30" : "bg-white border-gray-100 hover:border-gray-200"
                                        )}
                                    >
                                        <div className="relative w-8 h-8 opacity-60 group-hover:opacity-100 transition-opacity grayscale group-hover:grayscale-0">
                                            {brand.thumb?.url && <img src={brand.thumb.url} alt={brand.name} className="object-contain w-full h-full" />}
                                        </div>
                                        <span className={cn(
                                            "mt-2 text-[10px] font-black uppercase tracking-wider",
                                            selectedBrand === brand.slug ? "text-[var(--colour-fsP2)]" : "text-gray-400"
                                        )}>{brand.name}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </aside>

                {/* RHS Main Grid Container */}
                <div className="flex-1 relative min-h-[500px]">
                    {isLoadingProducts && (
                        <div className="absolute inset-0 z-20 flex items-start justify-center pt-32 bg-white/70 backdrop-blur-[2px] rounded-3xl animate-in fade-in duration-500">
                            <div className="flex items-center gap-3 px-6 py-3 bg-white shadow-2xl border border-blue-50 rounded-full text-[var(--colour-fsP2)] text-[13px] font-black uppercase tracking-[0.1em] scale-110">
                                <Loader2 className="animate-spin" size={18} />
                                Refreshing Catalog
                            </div>
                        </div>
                    )}

                    {products.length > 0 ? (
                        <div className={cn(
                            "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 sm:gap-8 transition-all duration-700",
                            isLoadingProducts ? "opacity-30 translate-y-4" : "opacity-100"
                        )}>
                            {products.map(product => (
                                <ExchangeProductCard
                                    key={product.id}
                                    product={product}
                                    selectedBrand={selectedBrand}
                                    onSelect={() => onSelectProduct(product)}
                                />
                            ))}
                        </div>
                    ) : !isLoadingProducts && (
                        <div className="flex flex-col items-center justify-center py-24 gap-6 text-gray-300 rounded-3xl border-2 border-dashed border-gray-100 animate-in fade-in slide-in-from-bottom-8 duration-700">
                           <div className="w-20 h-20 rounded-full bg-gray-50 flex items-center justify-center">
                             <Search size={40} className="text-gray-200" />
                           </div>
                           <div className="text-center space-y-1">
                                <p className="text-lg font-black text-gray-800">No device found</p>
                                <p className="text-sm font-bold text-gray-400 max-w-xs mx-auto mt-2 leading-relaxed">
                                    We couldn't find matches for "{searchTerm}". <br className="hidden sm:block" /> Try a different keyword or brand.
                                </p>
                            </div>
                            <button onClick={() => onSearch('')} className="px-6 py-2.5 rounded-xl bg-white border border-gray-200 text-xs font-black uppercase text-gray-600 hover:border-gray-300 hover:text-gray-800 transition-all">
                                Clear All Filters
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
