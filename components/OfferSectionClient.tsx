'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import LazySection from './LazySection';
import { GetallOfferlist, GetOfferDetailsBySlug } from '@/app/api/services/offers.service';

const OfferBannerClient = dynamic(() => import('@/app/homepage/OfferBannerClient'), { ssr: true });

async function fetchOfferData() {
  const campaigns = await GetallOfferlist();
  if (!campaigns?.success || !campaigns.data?.length) return null;

  const details = await GetOfferDetailsBySlug(campaigns.data[0].slug);
  return details?.success ? details.data : null;
}

export default function OfferSectionClient() {
  return (
    <LazySection
      className="min-h-[400px] sm:min-h-[500px]"
      minHeight="0"
      fetcher={fetchOfferData}
      render={(data) => data ? <OfferBannerClient offer={data} /> : null}
    />
  );
}
