'use client'

import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { Heart, Scale } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useShallow } from 'zustand/react/shallow'
import { useCartStore } from '@/app/context/CartContext'
import { useAuthStore } from '@/app/context/AuthContext'
import type { BasketProduct } from '@/app/types/ProductDetailsTypes'

interface Props {
    product: any
    priority?: boolean
}

export default function EmiProductCard({ product, priority = false }: Props) {
    const router = useRouter()

    const { user, triggerLoginAlert } = useAuthStore(
        useShallow(s => ({ user: s.user, triggerLoginAlert: s.triggerLoginAlert }))
    )
    const { addToWishlist, removeFromWishlist, wishlistItems, addToCompare, removeFromCompare, compareItems } = useCartStore(
        useShallow(s => ({
            addToWishlist: s.addToWishlist,
            removeFromWishlist: s.removeFromWishlist,
            wishlistItems: s.wishlistItems,
            addToCompare: s.addToCompare,
            removeFromCompare: s.removeFromCompare,
            compareItems: s.compareItems,
        }))
    )

    if (!product?.id) return null

    const isWishlisted = wishlistItems.some(i => i.id === product.id)
    const isCompared = compareItems.some(i => i.id === product.id)

    const extract = (p: any): number => {
        if (typeof p === 'number') return p
        if (typeof p === 'string') return parseFloat(p) || 0
        if (p && typeof p === 'object') {
            const v = p.current ?? p.price ?? p.original_price ?? p.value ?? 0
            return typeof v === 'number' ? v : parseFloat(String(v)) || 0
        }
        return 0
    }

    const original = product.basePrice ?? extract(product.price)
    const discounted = product.discountedPriceVal ?? extract(product.discounted_price || product.price)
    const hasDisc = original > discounted && discounted > 0
    const discPct = product.discountPercent ?? (hasDisc ? Math.round(((original - discounted) / original) * 100) : 0)
    const price = product.displayPrice ?? (discounted || original).toLocaleString()
    const emiMonthly = Math.round((discounted || original) / 12)

    const img = product.thumb?.url || product.image?.thumb || product.image?.full || product.thumb_url || '/images/placeholder.svg'

    return (
        <div
            onClick={() => product.slug && router.push(`/product-details/${product.slug}`)}
            className="group relative cursor-pointer flex flex-col bg-white border border-(--colour-border3) rounded-xl overflow-hidden hover:border-(--colour-fsP2)/40 hover:shadow-sm transition-all duration-150"
        >
            {/* Actions */}
            <div className="absolute top-2 right-2 z-20 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                    onClick={e => { e.stopPropagation(); isWishlisted ? removeFromWishlist(product.id) : addToWishlist(product.id, user, triggerLoginAlert, product as unknown as BasketProduct) }}
                    aria-label="Wishlist"
                    className={cn('w-7 h-7 flex items-center justify-center rounded-full bg-white border shadow-sm transition-colors',
                        isWishlisted ? 'text-red-500 border-red-200' : 'text-[var(--colour-text3)] hover:text-red-400 border-(--colour-border3)')}
                >
                    <Heart className={cn('w-3.5 h-3.5', isWishlisted && 'fill-red-500')} />
                </button>
                <button
                    onClick={e => { e.stopPropagation(); isCompared ? removeFromCompare(product.id) : addToCompare(product) }}
                    aria-label="Compare"
                    className={cn('w-7 h-7 flex items-center justify-center rounded-full bg-white border shadow-sm transition-colors border-(--colour-border3)',
                        isCompared ? 'text-[var(--colour-fsP2)]' : 'text-[var(--colour-text3)] hover:text-[var(--colour-fsP2)]')}
                >
                    <Scale className="w-3.5 h-3.5" />
                </button>
            </div>

            {/* Discount badge */}
            {hasDisc && discPct > 0 && (
                <span className="absolute top-2 left-2 z-10 text-[9px] font-black text-white px-1.5 py-0.5 rounded-md" style={{ background: 'var(--colour-fsP1)' }}>
                    -{discPct}%
                </span>
            )}

            {/* Image */}
            <div className="relative aspect-square w-full bg-[var(--colour-bg4)]">
                <Image
                    src={img}
                    alt={product.name ?? 'Product'}
                    fill
                    className="object-contain p-3 mix-blend-multiply group-hover:scale-[1.03] transition-transform duration-200"
                    priority={priority}
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                />
            </div>

            {/* Body */}
            <div className="flex flex-col p-2.5 gap-1 grow border-t border-(--colour-border3)">
                <h3 className="text-[12px] font-semibold text-[var(--colour-text2)] leading-snug line-clamp-2 group-hover:text-[var(--colour-fsP2)] transition-colors" title={product.name}>
                    {product.name}
                </h3>

                <div className="mt-auto pt-1.5">
                    <p className="text-[13px] font-bold text-[var(--colour-text1)]">Rs.&nbsp;{price}</p>
                    {hasDisc && (
                        <p className="text-[10px] text-[var(--colour-text3)] line-through">Rs.&nbsp;{original.toLocaleString()}</p>
                    )}
                    <div className="mt-1.5 inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold" style={{ color: 'var(--colour-fsP2)', background: '#EEF3FB' }}>
                        EMI Rs.&nbsp;{emiMonthly.toLocaleString()}/mo
                    </div>
                </div>
            </div>
        </div>
    )
}
