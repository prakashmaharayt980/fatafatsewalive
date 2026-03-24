// src/components/BannerCarouselServer.tsx
import React from 'react';
import { getBannerData } from '@/app/api/CachedHelper/getBannerData';
import Imgbanner from '@/app/homepage/Imgbanner';

export default async function BannerCarouselServer() {
    // Fetch Critical Banners
    const criticalSlugs = {
        main: 'main-banner-test',
        side: 'test-slug-banner',
    };

    try {
        const [bannerData, sideData] = await Promise.all([
            getBannerData(criticalSlugs.main),
            getBannerData(criticalSlugs.side),
        ]);

        return (
            <Imgbanner
                mainBanner={bannerData || null}
                sideBanner={sideData || null}
            />
        );
    } catch (e) {
        console.error("Failed to fetch banners in Server Component", e);
        return null;
    }
}
