'use server'

import { apiPublic } from './client';
import { unstable_cache } from 'next/cache';
import type { CampaignsResponse, CampaignDetailsResponse } from './offers.interface';

// Raw fetchers for use on client or in server actions
export const fetchAllOffers = async () => {
    const res = await apiPublic.get<CampaignsResponse>(`/v1/campaigns`);
    return res.data;
};

export const fetchOfferDetails = async (slug: string) => {
    const res = await apiPublic.get<CampaignDetailsResponse>(`/v1/campaigns/${slug}`);
    return res.data;
};


// Cached server-side versions (Server Actions)
export const GetallOfferlist = async () => 
    unstable_cache(
        fetchAllOffers,
        ['all-campaigns'],
        { revalidate: 7200, tags: ['campaigns'] }
    )();

export const GetOfferDetailsBySlug = async (slug: string) =>
    unstable_cache(
        () => fetchOfferDetails(slug),
        [`campaign-details-${slug}`],
        { revalidate: 7200, tags: [`campaign-${slug}`] }
    )();
