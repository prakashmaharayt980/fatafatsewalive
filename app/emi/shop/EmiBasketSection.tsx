'use client'

import { memo, useRef, useMemo, useCallback } from 'react'
import { ChevronRight } from 'lucide-react'
import { useRouter } from 'next/navigation'
import ProductCard from '@/app/product-details/ProductCard'
import SkeletonCard from '@/app/skeleton/SkeletonCard'
import useSWR from 'swr'
import { getFilteredBasketProducts } from '@/app/api/utils/productFetchers'
import { useBasketState, useStoreSelectors, useScrollObserver } from '@/app/homepage/hooks/useBasketState'
import type { BasketProduct } from '@/app/types/ProductDetailsTypes'

interface Props {
    slug: string
    title: string
    brandSlug?: string
    initialData?: { products?: any[] }
    badge?: string
    isFirstSection?: boolean
}

const BATCH_SIZE = 4

function EmiBasketSection({ slug, title, brandSlug, initialData, badge, isFirstSection = false }: Props) {
    const router = useRouter()
    const scrollRef = useRef<HTMLDivElement>(null)
    const sentinelRef = useRef<HTMLDivElement>(null)

    const hasInitialData = Array.isArray(initialData?.products) && initialData!.products.length > 0

    const { data: swrProducts, isLoading } = useSWR(
        hasInitialData ? null : ['emi-basket', slug, brandSlug ?? 'all'],
        async () => {
            const res = await getFilteredBasketProducts(slug, { brand: brandSlug ?? '', count: 10, emi_enabled: true })
            return res?.products ?? []
        },
        { revalidateOnFocus: false }
    )

    const products = useMemo(() => {
        if (hasInitialData && initialData?.products) return initialData.products
        return swrProducts ?? []
    }, [hasInitialData, initialData?.products, swrProducts])

    const stateKey = `emi-${slug}-${brandSlug ?? 'all'}`
    const { state, updateState } = useBasketState(stateKey, products.length > 0)
    const { auth, cart, wishlistSet } = useStoreSelectors()

    const visibleCountRef = useRef(state.visibleCount)
    visibleCountRef.current = state.visibleCount
    const productsLengthRef = useRef(products.length)
    productsLengthRef.current = products.length

    const loadMore = useCallback(() => {
        updateState({ visibleCount: Math.min(visibleCountRef.current + BATCH_SIZE, productsLengthRef.current) })
    }, [updateState])

    useScrollObserver(
        scrollRef as React.RefObject<HTMLDivElement>,
        sentinelRef as React.RefObject<HTMLDivElement>,
        state.ready,
        state.visibleCount,
        products.length,
        loadMore
    )

    const visibleProducts = useMemo(() => products.slice(0, state.visibleCount), [products, state.visibleCount])

    if ((isLoading && !hasInitialData) || !state.ready || !products.length) return <SkeletonCard />

    const viewAllHref = brandSlug
        ? `/category/${slug}?brand=${brandSlug}&emi_enabled=true`
        : `/category/${slug}?emi_enabled=true`

    return (
        <div className="w-full py-2 sm:py-3 bg-transparent">
            <div className="flex items-center justify-between px-4 sm:px-4 mb-3">
                <div className="flex items-center gap-3">
                    <div className="w-1 h-7 bg-slate-800 rounded-full" />
                    <h2 className="text-lg sm:text-xl font-semibold text-slate-800 tracking-tight">{title}</h2>
                    {badge && (
                        <span
                            className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full text-white tracking-wide"
                            style={{ background: 'var(--colour-fsP2)' }}
                        >
                            {badge}
                        </span>
                    )}
                </div>
                <button
                    onClick={() => router.push(viewAllHref)}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-(--colour-fsP2) cursor-pointer hover:text-slate-900 hover:bg-slate-100 rounded-full transition-all duration-200 group"
                >
                    View All
                    <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
                </button>
            </div>

            <div className="relative px-1 sm:px-4">
                <div
                    ref={scrollRef}
                    className="flex overflow-x-auto overflow-y-visible scrollbar-hide snap-x pb-2 mt-2 pt-2"
                    style={{ scrollbarWidth: 'none', msOverflowStyle: 'none', scrollBehavior: 'smooth' }}
                >
                    {visibleProducts.map((product: any, index: number) => (
                        <div
                            key={product.id}
                            className="shrink-0 snap-start px-1 sm:px-1.5 w-1/2 sm:w-1/3 md:w-1/4 lg:w-1/5"
                        >
                            <ProductCard
                                product={product}
                                isFirstSection={isFirstSection}
                                simple
                                index={index}
                                isWishlisted={wishlistSet.has(product.id)}
                                isCompared={cart.isInCompare(product.id)}
                                onWishlist={() => cart.addToWishlist(product.id, auth.user, auth.triggerLoginAlert, product as BasketProduct)}
                                onCompare={() => cart.isInCompare(product.id) ? cart.removeFromCompare(product.id) : cart.addToCompare(product)}
                            />
                        </div>
                    ))}
                    {state.visibleCount < products.length && (
                        <div ref={sentinelRef} className="shrink-0 w-4 h-full" aria-hidden="true" />
                    )}
                </div>
            </div>
        </div>
    )
}

export default memo(EmiBasketSection)
