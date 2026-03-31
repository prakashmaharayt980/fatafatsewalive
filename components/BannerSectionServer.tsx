import { cacheLife, cacheTag } from 'next/cache';
import { getBannerData } from '@/app/api/CachedHelper/getBannerData';
import Bannerfooter from '@/app/homepage/Bannerfooter';
import Banner2 from '@/app/homepage/Banner2';

const BannerRegistry = {
  Bannerfooter,
  Banner2,
} as const;

type BannerType = keyof typeof BannerRegistry;

interface Props {
  slug: string;
  type: BannerType;
  className?: string;
}

export default async function BannerSectionServer({ slug, type, className }: Props) {
  'use cache';
  cacheLife('hours');
  cacheTag('banners', `banner-${slug}`);

  const data = await getBannerData(slug);
  const Component = BannerRegistry[type];

  return (
    <div className={className}>
      <Component data={data as any} />
    </div>
  );
}
