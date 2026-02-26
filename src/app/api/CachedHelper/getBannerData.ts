'use server';

import { cache } from 'react';
import RemoteServices from '@/app/api/remoteservice';

export const getBannerData = cache(async (slug: string) => {
  try {
    const res = await RemoteServices.getBannerBySlug(slug);
    return res.data || null;
  } catch (error) {
    console.error(`Failed to fetch banner data for slug: ${slug}`, error);
    return null;
  }
});
