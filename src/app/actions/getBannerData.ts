'use server';

import RemoteServices from '../api/remoteservice';

export async function getBannerData(slug: string) {
  try {
    const res = await RemoteServices.getBannerSlug(slug);
    return res.data?.[0] || null;
  } catch (error) {
    console.error(`Failed to fetch banner data for slug: ${slug}`, error);
    return null;
  }
}
