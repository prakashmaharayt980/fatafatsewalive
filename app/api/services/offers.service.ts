'use server'

import { apiPublic } from '../ServiceHelper/index';
import { unstable_cache } from 'next/cache';
import type { CampaignsResponse, CampaignDetailsResponse } from './offers.interface';

// Raw fetchers for use on client or in server actions
export const fetchAllOffers = async () => {
    return apiPublic.get<CampaignsResponse>(`/v1/campaigns`).then(res => res.data);
};

export const fetchOfferDetails = async (slug: string) => {
    return apiPublic.get<CampaignDetailsResponse>(`/v1/campaigns/${slug}`).then(res => res.data);
};


// Cached server-side versions (Server Actions)
export const GetallOfferlist = async () =>
    unstable_cache(
        fetchAllOffers,
        ['all-campaigns'],
        { revalidate: 20, tags: ['campaigns'] }
    )();

export const GetOfferDetailsBySlug = async (slug: string) =>
    unstable_cache(
        () => fetchOfferDetails(slug),
        [`campaign-details-${slug}`],
        { revalidate: 1, tags: [`campaign-${slug}`] }
    )();
