import { unstable_cache } from 'next/cache';
import RemoteServices from '../api/remoteservice';
import { CategoryService } from '../api/services/category.service';

export const getHomepageData = unstable_cache(
    async () => {


        // 1. Fetch Critical Banners
        const criticalSlugs = {
            main: 'main-banner-test',
            side: 'test-slug-banner',
            category: 'right-slider-thumbnail-test',
        };

        const bannerPromises = Object.entries(criticalSlugs).map(async ([key, slug]) => {
            try {
                const res = await RemoteServices.getBannerBySlug(slug);
                return { key, data: res.data || null };
            } catch (e) {
                console.error(`Failed to fetch critical banner: ${slug}`, e);
                return { key, data: null };
            }
        });

        // 2. Fetch Mobile Phones Product Data (ID: 1)
        const productPromise = CategoryService.getCategoryProducts({ id: '1', per_page: 10 })
            .catch(e => {
                console.error("Failed to fetch mobile phone data", e);
                return null;
            });

        const [bannerResults, mobilePhoneData] = await Promise.all([
            Promise.all(bannerPromises),
            productPromise
        ]);

        const criticalData = bannerResults.reduce((acc, { key, data }) => {
            acc[key] = data;
            return acc;
        }, {} as Record<string, any>);

        return {
            criticalData,
            mobilePhoneData,
        };
    },
    ['homepage-data'], // Cache Key
    {
        revalidate: 1, // Cache lifetime in seconds (1 hour)
        tags: ['homepage'] // Tag for manual invalidation
    }
);
