// src/components/BannerCarouselServer.tsx
import React from 'react';
import { preload } from 'react-dom';
import { getBannerData } from '@/app/api/CachedHelper/getBannerData';
import Imgbanner from '@/app/homepage/Imgbanner';

export default async function BannerCarouselServer() {
    // 1. Fetch Critical Banners
    const criticalSlugs = {
        main: 'main-banner-test',
        side: 'test-slug-banner',
    };

    try {
        const [bannerData, sideData] = await Promise.all([
            getBannerData(criticalSlugs.main),
            getBannerData(criticalSlugs.side),
        ]);

        // Preload LCP Image (First slide of main carousel)
        const firstImg = bannerData?.images?.sort((a: any, b: any) => (a.order ?? 0) - (b.order ?? 0))?.[0]?.url;
        if (firstImg) {
            // Match the next/image optimized URL for 1200px width (typical desktop LCP)
            const optimizedUrl = `/_next/image?url=${encodeURIComponent(firstImg)}&w=1200&q=75`;
            preload(optimizedUrl, { as: 'image', fetchPriority: 'high' });
        }

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
