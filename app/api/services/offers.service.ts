'use server'

import { cacheLife, cacheTag } from 'next/cache';
import { apiPublic } from '../ServiceHelper/index';
import type { CampaignsResponse, CampaignDetailsResponse } from './offers.interface';

// Raw fetchers for use on client or in server actions
export const fetchAllOffers = async () => {
    return apiPublic.get<CampaignsResponse>(`/v1/campaigns`).then(res => res.data);
};

export const fetchOfferDetails = async (slug: string) => {
    return apiPublic.get<CampaignDetailsResponse>(`/v1/campaigns/${slug}`).then(res => res.data);
};


// Cached server-side versions (Next.js 16 'use cache')
export const GetallOfferlist = async () => {
    'use cache';
    cacheLife('minutes');
    cacheTag('campaigns');
    return fetchAllOffers();
};

export const GetOfferDetailsBySlug = async (slug: string) => {
    'use cache';
    cacheLife('minutes');
    cacheTag(`campaign-${slug}`);
    return fetchOfferDetails(slug);
};
