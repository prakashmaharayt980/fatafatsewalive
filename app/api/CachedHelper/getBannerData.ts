import { getBannerBySlug } from '../services/misc.service';
import { cacheLife, cacheTag } from 'next/cache';

export const getBannerData = async (slug: string) => {
  'use cache';
  cacheLife('hours');
  cacheTag('banners', `banner-${slug}`);

  try {
    const res = await getBannerBySlug(slug);
    return res.data || null;
  } catch (error) {
    console.error(`Failed to fetch banner data for slug: ${slug}`, error);
    return null;
  }
};
