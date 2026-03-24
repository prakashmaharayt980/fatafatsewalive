import { apiPublic } from './client';
import { unstable_cache } from 'next/cache';
import type { CampaignsResponse, CampaignDetailsResponse } from './offers.interface';

export const OffersService = {
    GetallOfferlist: () => 
        unstable_cache(
            async () => {
                const res = await apiPublic.get<CampaignsResponse>(`/v1/campaigns`);
                return res.data;
            },
            ['all-campaigns'],
            { revalidate: 7200, tags: ['campaigns'] }
        )(),

    GetOfferDetailsBySlug: (slug: string) =>
        unstable_cache(
            async () => {
                const res = await apiPublic.get<CampaignDetailsResponse>(`/v1/campaigns/${slug}`);
                return res.data;
            },
            [`campaign-details-${slug}`],
            { revalidate: 7200, tags: [`campaign-${slug}`] }
        )(),
}
