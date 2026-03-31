'use client'

import React, { useState, useEffect, useMemo, useRef } from 'react'
import { ChevronRight, ChevronLeft, ArrowRight } from 'lucide-react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { cn } from '@/lib/utils'
import { searchProducts } from '@/app/api/services/product.service'
import EmiProductCard from '@/app/product-details/ProductCards/EmiProductCard'
import type { ProductSummary } from '@/app/types/ProductDetailsTypes'
import { MOCK_EMI_PRODUCTS } from './mockData'

interface EmiBasketSectionProps {
    slug: string
    title: string
    category?: any
    budget: number
    tenure: number
    downPayment: number
    zeroEmi: boolean
    emiPlan: 'standard' | 'apple_zero' | 'citizens_0_40'
}

export default function EmiBasketSection({ 
    slug, 
    title,
    category,
    budget, 
    tenure, 
    downPayment, 
    zeroEmi, 
    emiPlan 
}: EmiBasketSectionProps) {
    const router = useRouter()
    const scrollRef = useRef<HTMLDivElement>(null)
    const [products, setProducts] = useState<ProductSummary[]>([])
    const [loading, setLoading] = useState(true)

    // Discover the best image to show for the category
    const categoryImage = category?.image?.full || category?.thumbnail_image?.full || category?.image_url;

    useEffect(() => {
        let isActive = true
        setLoading(true)
        
        searchProducts({ categories: slug, per_page: 20 })
            .then(res => {
                if (!isActive) return
                const data = res?.data || res?.products || []
                
                // If API is empty, use mock data fallback
                if (Array.isArray(data) && data.length === 0 && MOCK_EMI_PRODUCTS[slug]) {
                    setProducts(MOCK_EMI_PRODUCTS[slug])
                } else {
                    setProducts(Array.isArray(data) ? data : [])
                }
            })
            .catch(() => {
                if (isActive && MOCK_EMI_PRODUCTS[slug]) {
                    setProducts(MOCK_EMI_PRODUCTS[slug])
                } else {
                    setProducts([])
                }
            })
            .finally(() => setLoading(false))

        return () => { isActive = false }
    }, [slug])

    // EMI Filtering logic
    const filteredProducts = useMemo(() => {
        return products
            .map((p) => {
                const price = Number(p.discounted_price || p.price) || 0
                let effectiveDownpayment = downPayment
                let effectiveInterest = zeroEmi ? 0 : 0.12
                
                const isApple = p.brand?.name?.toLowerCase().includes('apple')
                
                if (emiPlan === 'apple_zero' && isApple) {
                    effectiveInterest = 0
                } else if (emiPlan === 'citizens_0_40') {
                    effectiveInterest = 0
                    effectiveDownpayment = Math.max(downPayment, price * 0.4)
                }

                const financedAmount = Math.max(price - effectiveDownpayment, 0)
                const monthlyEmi = financedAmount <= 0 ? 0 :
                    (financedAmount * (1 + effectiveInterest * (tenure / 12))) / tenure

                return { ...p, monthlyEmi: Math.round(monthlyEmi), numericPrice: price }
            })
            .filter((p) => {
                if (emiPlan === 'apple_zero') {
                    return p.brand?.name?.toLowerCase().includes('apple') && p.monthlyEmi <= budget && p.monthlyEmi > 0
                }
                return p.monthlyEmi <= budget && p.monthlyEmi > 0
            })
    }, [products, budget, tenure, downPayment, zeroEmi, emiPlan])

    const scroll = (direction: 'left' | 'right') => {
        if (!scrollRef.current) return
        const { scrollLeft, clientWidth } = scrollRef.current
        const scrollTo = direction === 'left' ? scrollLeft - clientWidth * 0.8 : scrollLeft + clientWidth * 0.8
        scrollRef.current.scrollTo({ left: scrollTo, behavior: 'smooth' })
    }

    if (!loading && filteredProducts.length === 0) return null

    return (
        <section className="w-full my-6 group/section animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-col md:flex-row gap-6 h-auto items-stretch min-h-[460px]">
                
                {/* ─── SIDE BANNER (Basket Info) ─── */}
                <div
                    onClick={() => router.push(`/category/${slug}`)}
                    className="hidden md:flex w-full md:w-1/5 min-w-[240px] relative rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-700 group/banner cursor-pointer shrink-0"
                >
                    {categoryImage ? (
                        <Image
                            src={categoryImage}
                            alt={title}
                            fill
                            className="object-cover transition-transform duration-1000 group-hover/banner:scale-110"
                            sizes="(max-width: 1024px) 30vw, 20vw"
                        />
                    ) : (
                        <div className="absolute inset-0 bg-gradient-to-br from-slate-800 to-slate-900" />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent opacity-80 group-hover/banner:opacity-40 transition-opacity duration-500" />
                    <div className="absolute bottom-8 left-6 right-6 text-white transform group-hover/banner:-translate-y-2 transition-transform duration-500">
                      <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/60 mb-2 block">Premium EMI Deals</span>
                      <p className="text-2xl font-black mb-4 drop-shadow-lg leading-tight uppercase">{title}</p>
                      <div className="inline-flex items-center gap-2 text-xs font-black bg-white/20 backdrop-blur-md px-4 py-2 rounded-full border border-white/30 transform transition-all duration-300 hover:bg-white hover:text-slate-900">
                        Explore <ArrowRight className="w-3.5 h-3.5" />
                      </div>
                    </div>
                </div>

                {/* ─── PRODUCT CONTENT AREA ─── */}
                <div className="flex-1 flex flex-col min-w-0 bg-white md:bg-transparent rounded-3xl p-2 sm:p-4 md:p-0">
                    <div className="flex items-center justify-between mb-5 px-1">
                        <div className="flex items-center gap-3">
                            <div className="w-1.5 h-8 bg-[var(--colour-fsP2)] rounded-full shadow-sm" />
                            <h2 className="text-xl md:text-2xl font-black text-slate-800 tracking-tight uppercase">{title}</h2>
                        </div>
                        <button 
                            onClick={() => router.push(`/category/${slug}`)}
                            className="flex items-center gap-1.5 px-4 py-2 text-xs font-black text-[var(--colour-fsP2)] hover:text-slate-900 hover:bg-slate-100 rounded-full transition-all duration-200 group uppercase tracking-widest"
                        >
                            View All
                            <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
                        </button>
                    </div>

                    <div className="relative group/scroll flex-1">
                        <div 
                            ref={scrollRef}
                            className="flex gap-4 overflow-x-auto scrollbar-hide snap-x no-scrollbar pb-6 pt-2 px-1"
                        >
                            {loading ? (
                                Array.from({ length: 4 }).map((_, i) => (
                                    <div key={i} className="min-w-[190px] sm:min-w-[240px] snap-start">
                                        <div className="bg-white rounded-[2rem] overflow-hidden border border-gray-100 shadow-sm flex flex-col p-4 animate-pulse h-full">
                                            <div className="aspect-square bg-gray-50 rounded-2xl mb-4" />
                                            <div className="h-4 w-1/3 bg-gray-50 rounded mb-2" />
                                            <div className="h-6 w-3/4 bg-gray-50 rounded mb-3" />
                                            <div className="mt-auto h-10 w-full bg-gray-50 rounded-xl" />
                                        </div>
                                    </div>
                                ))
                            ) : (
                                filteredProducts.map((p, idx) => (
                                    <div key={p.id} className="min-w-[190px] sm:min-w-[240px] snap-start">
                                        <EmiProductCard 
                                            product={p} 
                                            tenure={tenure} 
                                            zeroEmi={zeroEmi} 
                                            downPayment={downPayment} 
                                            index={idx} 
                                        />
                                    </div>
                                ))
                            )}
                        </div>

                        {/* Pagination Hover Controls */}
                        {!loading && filteredProducts.length > 3 && (
                            <>
                                <button onClick={() => scroll('left')} className="absolute left-0 top-1/2 -translate-y-12 -translate-x-5 z-10 w-11 h-11 bg-white shadow-xl rounded-full flex items-center justify-center opacity-0 group-hover/scroll:opacity-100 transition-all duration-300 border border-gray-50 hover:bg-slate-50 hidden md:flex">
                                    <ChevronLeft className="w-6 h-6 text-slate-800" />
                                </button>
                                <button onClick={() => scroll('right')} className="absolute right-0 top-1/2 -translate-y-12 translate-x-5 z-10 w-11 h-11 bg-white shadow-xl rounded-full flex items-center justify-center opacity-0 group-hover/scroll:opacity-100 transition-all duration-300 border border-gray-50 hover:bg-slate-50 hidden md:flex">
                                    <ChevronRight className="w-6 h-6 text-slate-800" />
                                </button>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </section>
    )
}
