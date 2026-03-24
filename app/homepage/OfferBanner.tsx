import { GetallOfferlist, GetOfferDetailsBySlug } from "@/app/api/services/offers.service";
import OfferBannerClient from "./OfferBannerClient";
import type { CampaignDetails } from "@/app/api/services/offers.interface";

const OfferBanner = async ({ data: preFetchedData }: { data?: CampaignDetails }) => {
    try {
        // If data is pre-fetched (e.g. from BannerSectionServer), use it directly
        if (preFetchedData) {
            return <OfferBannerClient offer={preFetchedData} />;
        }

        // Fetch all campaigns (cached for 2 hours)
        const campaignsRes = await GetallOfferlist();
        
        if (!campaignsRes?.success || !Array.isArray(campaignsRes.data) || campaignsRes.data.length === 0) {
            return null;
        }

        // Get the first active campaign
        const primaryCampaign = campaignsRes.data[0];
        
        if (!primaryCampaign?.slug) {
            return null;
        }

        // Fetch full details of the primary campaign (cached for 2 hours)
        const campaignDetailsRes = await GetOfferDetailsBySlug(primaryCampaign.slug);

        if (!campaignDetailsRes?.success || !campaignDetailsRes.data) {
            return null;
        }

        return <OfferBannerClient offer={campaignDetailsRes.data} />;
    } catch (error) {
        console.error("Error loading OfferBanner:", error);
        return null;
    }
};

export default OfferBanner;