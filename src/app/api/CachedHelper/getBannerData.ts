'use server';

import { cache } from 'react';

import { MiscService } from '../services/misc.service';

export const getBannerData = cache(async (slug: string) => {
  try {
    const res = await MiscService.getBannerBySlug(slug);
    return res.data || null;
  } catch (error) {
    console.error(`Failed to fetch banner data for slug: ${slug}`, error);
    return null;
  }
});
