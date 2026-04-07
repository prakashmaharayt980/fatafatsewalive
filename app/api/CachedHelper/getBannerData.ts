'use server';

import { cacheLife, cacheTag } from 'next/cache';
import { getBannerBySlug } from '../services/misc.service';

export const getBannerData = async (slug: string) => {
  'use cache';
  cacheLife('hours');
  cacheTag(`banner-${slug}`);
  try {
    const res = await getBannerBySlug(slug);
    return res.data || null;
  } catch (error) {
    console.error(`Failed to fetch banner data for slug: ${slug}`, error);
    return null;
  }
};
