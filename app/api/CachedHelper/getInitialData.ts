'use server';

import { getBannerBySlug } from '../services/misc.service';
import { getBlogList } from '../services/blog.service';


export const getHomepageData = async () => {


    const criticalSlugs = {
        main: 'main-banner-test',
        side: 'test-slug-banner',
    };

    const bannerPromises = Object.entries(criticalSlugs).map(async ([key, slug]) => {
        try {
            const res = await getBannerBySlug(slug);
            return { key, data: res.data || null };
        } catch (e) {
            console.error(`Failed to fetch critical banner: ${slug}`, e);
            return { key, data: null };
        }
    });

    const bannerResults = await Promise.all(bannerPromises);

    const criticalData = bannerResults.reduce((acc, { key, data }) => {
        acc[key] = data;
        return acc;
    }, {} as Record<string, any>);

    return { criticalData };
};

