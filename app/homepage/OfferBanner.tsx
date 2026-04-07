'use cache'
import { cacheLife } from "next/cache";
import { GetOfferDetailsBySlug } from "@/app/api/services/offers.service";
import OfferBannerClient from "./OfferBannerClient";

interface Props {
    slug: string;
}

const OfferBanner = async ({ slug }: Props) => {
    cacheLife("hours");
    try {
        const campaignDetailsRes = await GetOfferDetailsBySlug(slug);

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