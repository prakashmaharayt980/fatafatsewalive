'use server';

import { unstable_cache } from 'next/cache';
import { MiscService } from '../services/misc.service';

export const getBannerData = async (slug: string) => {
  return unstable_cache(
    async () => {
      try {
        const res = await MiscService.getBannerBySlug(slug);
        return res.data || null;
      } catch (error) {
        console.error(`Failed to fetch banner data for slug: ${slug}`, error);
        return null;
      }
    },
    [`banner-${slug}`],
    {
      revalidate: 7200, // 2 hours
      tags: ['banners', `banner-${slug}`],
    }
  )();
};
