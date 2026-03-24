'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import LazySection from './LazySection';
import { GetallOfferlist, GetOfferDetailsBySlug } from '@/app/api/services/offers.service';

const OfferBannerClient = dynamic(() => import('@/app/homepage/OfferBannerClient'), { ssr: true });

export default function OfferSectionClient() {
    return (
        <LazySection
            fallback={<div className="w-full min-h-[400px] sm:min-h-[500px] bg-gray-50 animate-pulse rounded-xl" />}
            minHeight="400px"
            fetcher={async () => {
                // Fetch first campaign details (Server Action called from Client)
                const campaigns = await GetallOfferlist();
                if (campaigns?.success && campaigns.data?.length > 0) {
                    const details = await GetOfferDetailsBySlug(campaigns.data[0].slug);
                    return details?.success ? details.data : null;
                }
                return null;
            }}
            render={(data) => {
                return data ? <OfferBannerClient offer={data} /> : null;
            }}
        />
    );
}
