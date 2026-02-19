import { Metadata } from 'next'
import { Suspense } from 'react'
import ShopByEmiClient from './ShopByEmiClient'

export const metadata: Metadata = {
    title: 'Shop by EMI — Find Products That Fit Your Budget | Fatafat Sewa',
    description:
        'Browse products based on your monthly EMI budget. Filter by tenure, down payment, brand, and sort by popularity or price. Find the perfect gadget within your budget at Fatafat Sewa.',
    openGraph: {
        title: 'Shop by EMI — Find Products That Fit Your Budget | Fatafat Sewa',
        description:
            'Browse products based on your monthly EMI budget. Filter by tenure, down payment, and sort by popularity or price.',
    },
}

export default function ShopByEmiPage() {
    return (
        <main>
            <Suspense fallback={
                <div className="min-h-screen bg-[var(--colour-bg4)] flex items-center justify-center">
                    <div className="text-center">
                        <div className="w-10 h-10 border-4 border-[var(--colour-fsP2)] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                        <p className="text-sm font-medium text-[var(--colour-text3)]">Loading Shop by EMI...</p>
                    </div>
                </div>
            }>
                <ShopByEmiClient />
            </Suspense>
        </main>
    )
}
