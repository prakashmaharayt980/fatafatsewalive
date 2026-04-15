import type { NextConfig } from "next";

type CacheProfile = {
  stale?: number;
  revalidate?: number;
  expire?: number;
};

export const cacheProfiles: NonNullable<NextConfig["cacheLife"]> = {
  // Product listings — inventory/price can change, revalidate hourly
  product: {
    stale: 300,       // 5 min client cache
    revalidate: 3600, // 1 hour server regen
    expire: 86400,    // 1 day max
  } satisfies CacheProfile,

  // Homepage banners — marketing updates daily
  banner: {
    stale: 300,
    revalidate: 3600,
    expire: 86400,
  } satisfies CacheProfile,

  // Flash offers — short-lived, time-sensitive
  offer: {
    stale: 60,        // 1 min client
    revalidate: 120,  // 2 min server regen
    expire: 3600,     // 1 hour max
  } satisfies CacheProfile,

  // Category trees — change rarely
  category: {
    stale: 300,
    revalidate: 7200, // 2 hours
    expire: 604800,   // 1 week
  } satisfies CacheProfile,

  // Blog posts — editorial updates
  blog: {
    stale: 300,
    revalidate: 3600,
    expire: 604800,   // 1 week
  } satisfies CacheProfile,

  // EMI plans — rates change occasionally
  emi: {
    stale: 300,
    revalidate: 1800, // 30 min
    expire: 86400,
  } satisfies CacheProfile,

  // Misc data (FAQs, store info) — rarely changes
  misc: {
    stale: 300,
    revalidate: 86400, // 1 day
    expire: 2592000,   // 30 days
  } satisfies CacheProfile,
} as const;
