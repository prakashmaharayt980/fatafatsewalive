'use client'

import dynamic from 'next/dynamic'
import LazySection from './LazySection'
import { fetchOfferData } from './actions'

const OfferBannerClient = dynamic(() => import('../app/homepage/OfferBannerClient'), { ssr: true })

export default function OfferSectionClient() {
    return (
        <LazySection
            className="min-h-100 sm:min-h-125"
            minHeight="0"
            fetcher={fetchOfferData}
            render={(data) => data ? <OfferBannerClient offer={data} /> : null}
        />
    )
}
