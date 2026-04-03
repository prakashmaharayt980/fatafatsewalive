'use client'

import { useState, useEffect, useMemo, useRef } from 'react'
import { ChevronRight, ChevronLeft } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { fetchEmiProducts } from './actions'
import EmiProductCard from '@/app/product-details/ProductCards/EmiProductCard'
import type { ProductSummary } from '@/app/types/ProductDetailsTypes'

interface Props {
    slug: string
    title: string
    brandSlug?: string
    budget: number
    tenure: number
    downPayment: number
    zeroEmi: boolean
    emiPlan: 'standard' | 'apple_zero' | 'citizens_0_40'
}

export default function EmiBasketSection({
    slug, title,
    brandSlug,
    budget, tenure, downPayment, zeroEmi, emiPlan,
}: Props) {
    const router = useRouter()
    const scrollRef = useRef<HTMLDivElement>(null)
    const [products, setProducts] = useState<ProductSummary[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        let active = true
        fetchEmiProducts(slug, 10, brandSlug)
            .then((data) => {
                if (!active) return
                setProducts(Array.isArray(data) ? data : [])
            })
            .catch(() => { if (active) setProducts([]) })
            .finally(() => { if (active) setLoading(false) })
        return () => { active = false }
    }, [brandSlug, slug])

    const filteredProducts = useMemo(() => {
        return products
            .map((p) => {
                const price = Number(p.discounted_price ?? p.price) || 0
                let effDown = downPayment
                let effInterest = zeroEmi ? 0 : 0.12
                const isApple = p.brand?.name?.toLowerCase().includes('apple')
                if (emiPlan === 'apple_zero' && isApple) effInterest = 0
                else if (emiPlan === 'citizens_0_40') { effInterest = 0; effDown = Math.max(downPayment, price * 0.4) }
                const financed = Math.max(price - effDown, 0)
                const monthlyEmi = financed <= 0 ? 0 : (financed * (1 + effInterest * (tenure / 12))) / tenure
                return { ...p, monthlyEmi: Math.round(monthlyEmi), numericPrice: price }
            })
            .filter((p) => {
                if (emiPlan === 'apple_zero') return p.brand?.name?.toLowerCase().includes('apple') && p.monthlyEmi <= budget && p.monthlyEmi > 0
                return p.monthlyEmi <= budget && p.monthlyEmi > 0
            })
    }, [products, budget, tenure, downPayment, zeroEmi, emiPlan])

    const scroll = (dir: 'left' | 'right') => {
        if (!scrollRef.current) return
        const { scrollLeft, clientWidth } = scrollRef.current
        scrollRef.current.scrollTo({
            left: dir === 'left' ? scrollLeft - clientWidth * 0.8 : scrollLeft + clientWidth * 0.8,
            behavior: 'smooth',
        })
    }

    if (!loading && filteredProducts.length === 0) return null

    return (
        <section className="w-full bg-transparent py-2">

            {/* Header — same as BasketCard */}
            <div className="flex items-center justify-between px-1 mb-3">
                <div className="flex items-center gap-3">
                    <div className="w-1 h-7 bg-slate-800 rounded-full" />
                    <h2 className="text-lg sm:text-xl font-semibold text-slate-800 tracking-tight">{title}</h2>
                    {!loading && (
                        <span className="text-[11px] font-semibold text-gray-400 hidden sm:inline">
                            {filteredProducts.length} products
                        </span>
                    )}
                </div>
                <button
                    onClick={() => router.push(`/category/${slug}`)}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium hover:bg-slate-100 rounded-full transition-colors group"
                    style={{ color: 'var(--colour-fsP2)' }}
                >
                    View All
                    <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
                </button>
            </div>

            <div className="relative min-w-0 group/scroll">
                <div
                    ref={scrollRef}
                    className="flex overflow-x-auto scrollbar-hide snap-x pb-2 pt-1 gap-3"
                    style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                >
                    {loading
                        ? Array.from({ length: 4 }, (_, i) => (
                            <div key={i} className="shrink-0 snap-start w-45 sm:w-52.5">
                                <div className="bg-white border border-gray-100 rounded-2xl p-4 animate-pulse h-70 flex flex-col">
                                    <div className="aspect-square bg-gray-100 rounded-xl mb-4" />
                                    <div className="h-3 w-1/3 bg-gray-100 rounded mb-2" />
                                    <div className="h-4 w-3/4 bg-gray-100 rounded mb-3" />
                                    <div className="mt-auto h-8 w-full bg-gray-100 rounded-lg" />
                                </div>
                            </div>
                        ))
                        : filteredProducts.map((p, idx) => (
                            <div key={p.id} className="shrink-0 snap-start w-45 sm:w-52.5">
                                <EmiProductCard
                                    product={p}
                                    tenure={tenure}
                                    zeroEmi={zeroEmi}
                                    downPayment={downPayment}
                                    index={idx}
                                />
                            </div>
                        ))
                    }
                </div>

                {!loading && filteredProducts.length > 3 && (
                    <>
                        <button
                            onClick={() => scroll('left')}
                            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-3 z-10 w-8 h-8 bg-white border border-gray-200 rounded-full shadow-sm hidden md:flex items-center justify-center opacity-0 group-hover/scroll:opacity-100 transition-opacity"
                        >
                            <ChevronLeft className="w-4 h-4 text-gray-700" />
                        </button>
                        <button
                            onClick={() => scroll('right')}
                            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-3 z-10 w-8 h-8 bg-white border border-gray-200 rounded-full shadow-sm hidden md:flex items-center justify-center opacity-0 group-hover/scroll:opacity-100 transition-opacity"
                        >
                            <ChevronRight className="w-4 h-4 text-gray-700" />
                        </button>
                    </>
                )}
            </div>
        </section>
    )
}
