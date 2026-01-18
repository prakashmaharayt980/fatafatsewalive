'use client';

import React, { lazy, Suspense } from 'react';
import Image from 'next/image';
import Imgbanner from './Imgbanner';
import MetaTagData from './MetaTagData';
import BasketCardTrading from './BasketCardTrading';
import SkeltonCard from './SkeltonCard';
import SkeltonBanner from './SkeltonBanner';
import LazyLoadSection from '@/components/LazyLoadSection';
import { BannerTypes } from '@/app/types/BannerTypes';

// Lazy-loaded components
const BasketCard = lazy(() => import('./BasketCard'));
const OfferBanner = lazy(() => import('./OfferBanner'));
const OurArticles = lazy(() => import('./OurArticles'));
const CategoryProductSection = lazy(() => import('./BasketCardwithImage'));
const TwoImageBanner = lazy(() => import('./Banner2'));
const OneImageBanner = lazy(() => import('../blog/Bannertop'));

interface HomePageProps {
  initialBannerData?: BannerTypes | null;
}

const HomePage = ({ initialBannerData }: HomePageProps) => {
  // Use data passed from server
  const bannerData = initialBannerData;

  return (
    <div className="mx-auto h-full m-0 p-0 sm:py-4 space-y-6 sm:space-y-8 bg-gradient-to-b from-gray-50 to-white">
      <div className="sm:px-2 md:px-4">
        {/* Index 0 (Scroll) and Index 1 (Side Grid) */}
        <Imgbanner
          mainBanner={bannerData?.data?.[0]}
          sideBanner={bannerData?.data?.[1]}
        />
        <LazyLoadSection fallback={<SkeltonCard />}>
          <Suspense fallback={<SkeltonCard />}>
            <BasketCardTrading title="New Arrivals" slug={'laptop-price-in-nepal'} id={'104'} />
          </Suspense>
        </LazyLoadSection>

        <LazyLoadSection fallback={<SkeltonBanner />}>
          <Suspense fallback={<SkeltonBanner />}>
            {/* Index 2 */}
            <OneImageBanner data={bannerData?.data?.[6]} />
          </Suspense>
        </LazyLoadSection>

        <LazyLoadSection fallback={<SkeltonCard />}>
          <Suspense fallback={<SkeltonCard />}>
            <BasketCard title="Laptop of 2025" slug={'laptop-price-in-nepal'} id={'104'} />
          </Suspense>
        </LazyLoadSection>


        <div className="flex flex-col md:flex-row gap-2 sm:gap-3 w-full m-0 p-0 sm:mx-0 sm:px-0">
          <div className="relative flex justify-end w-full h-96 sm:h-[500px] md:w-1/5 p-4 sm:p-4">
            <div className="border w-full   border-blue-100 rounded-lg overflow-hidden transition-all duration-300 hover:shadow-md">
              {/* Index 4 (Manual Banner) */}
              {bannerData?.data?.[3]?.images?.[0]?.image?.full ? (
                <Image
                  src={bannerData?.data?.[3]?.images?.[0]?.image?.full}
                  alt="Banner Image"
                  className="rounded-lg object-contain group-hover:scale-105 transition-transform duration-500"
                  fill
                  quality={100}
                  loading="lazy"
                  sizes="(max-width: 640px) 150px, (max-width: 768px) 200px, (max-width: 1024px) 250px, (max-width: 1280px) 200px, 180px"
                />
              ) : null}
            </div>
          </div>
          <div className="w-full md:w-4/5 m-0 p-0">
            <LazyLoadSection fallback={<SkeltonCard />}>
              <Suspense fallback={<SkeltonCard />}>
                <CategoryProductSection title="Accessories" slug={'accessories-price-in-nepal'} id={'1'} />
              </Suspense>
            </LazyLoadSection>
          </div>
        </div>
      </div>
      <LazyLoadSection fallback={<SkeltonBanner />}>
        <Suspense fallback={<SkeltonBanner />}>
          <OfferBanner />
        </Suspense>
      </LazyLoadSection>
      <div className="sm:px-2 md:px-4">
        <LazyLoadSection fallback={<SkeltonCard />}>
          <Suspense fallback={<SkeltonCard />}>
            <BasketCard title="Water Pumps of 2025" slug={'water-pump-price-in-nepal'} id={'104'} />
          </Suspense>
        </LazyLoadSection>

        <LazyLoadSection fallback={<SkeltonBanner />}>
          <Suspense fallback={<SkeltonBanner />}>
            {/* Index 5 */}
            <OneImageBanner data={bannerData?.data?.[4]} />
          </Suspense>
        </LazyLoadSection>

        <LazyLoadSection fallback={<SkeltonCard />}>
          <Suspense fallback={<SkeltonCard />}>
            <BasketCard title="Home Appliance of 2025" slug={'macbook-price-in-nepal'} id={'104'} />
          </Suspense>
        </LazyLoadSection>

        <LazyLoadSection fallback={<SkeltonBanner />}>
          <Suspense fallback={<SkeltonBanner />}>
            {/* Index 6 */}
            <TwoImageBanner data={bannerData?.data?.[1]} />
          </Suspense>
        </LazyLoadSection>

        <LazyLoadSection fallback={<SkeltonCard />}>
          <Suspense fallback={<SkeltonCard />}>
            <BasketCard title="Drone of 2025" slug={'drone-price-in-nepal'} id={'104'} />
          </Suspense>
        </LazyLoadSection>

        <LazyLoadSection fallback={<SkeltonBanner />}>
          <Suspense fallback={<SkeltonBanner />}>
            {/* Index 7 */}
            <OneImageBanner data={bannerData?.data?.[8]} />
          </Suspense>
        </LazyLoadSection>

        <LazyLoadSection fallback={<SkeltonCard />}>
          <Suspense fallback={<SkeltonCard />}>
            <OurArticles blogpage="blog" />
          </Suspense>
        </LazyLoadSection>
        <MetaTagData bannerData={bannerData} />
      </div>
    </div>
  );
};

export default HomePage;