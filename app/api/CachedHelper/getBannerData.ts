'use server';

import { getBannerBySlug } from '../services/misc.service';

export const getBannerData = async (slug: string) => {
  try {
    const res = await getBannerBySlug(slug);
    return res.data || null;
  } catch (error) {
    console.error(`Failed to fetch banner data for slug: ${slug}`, error);
    return null;
  }
};
