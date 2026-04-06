import { getBannerData } from '@/app/api/CachedHelper/getBannerData';
import { getRandomBasketProducts } from '@/app/api/utils/productFetchers';
import Imgbanner from '@/app/homepage/Imgbanner';
import BasketCard from '@/app/homepage/BasketCard';

interface Props {
  slug: string;
  title: string;
}

export default async function TopHeroSection({ slug, title }: Props) {
  const criticalSlugs = {
    main: 'main-banner-test',
    side: 'test-slug-banner',
  };

  const [bannerRes, sideRes, initialProducts] = await Promise.all([
    getBannerData(criticalSlugs.main),
    getBannerData(criticalSlugs.side),
    getRandomBasketProducts(slug)
  ]);

  return (
    <div className="flex flex-col">
      <Imgbanner
        mainBanner={bannerRes}
        sideBanner={sideRes}
      />
      <div className="mt-[-10px] relative z-20">
        {slug && (
          <BasketCard
            slug={slug}
            title={title}
            initialData={initialProducts}
            isFirstSection
          />
        )}
      </div>
    </div>
  );
}
