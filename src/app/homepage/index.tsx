'use client';

import React, { lazy, Suspense } from 'react';
import Image from 'next/image';
import Imgbanner from './Imgbanner';

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
const OneImageBanner = lazy(() => import('./Bannertop'));

// Demo category data - Replace with API fetch later
const demoCategories = [
  { id: '1', title: 'Mobile Phone', slug: 'mobile-price-in-nepal', image: '/images/categories/new-arrivals.jpg' },
  { id: '2', title: 'Laptop ', slug: 'laptop-price-in-nepal', image: '/images/categories/laptop.jpg' },
  { id: '3', title: 'Accessories', slug: 'accessories-price-in-nepal', image: '/images/categories/accessories.jpg' },
  { id: '74', title: 'Drone', slug: 'drone-price-in-nepal', image: '/images/categories/drone.jpg' },
  { id: '5', title: 'Home ', slug: 'home-appliance-price-in-nepal', image: '/images/categories/home-appliance.jpg' },
  { id: '34', title: 'Camera', slug: 'dslr-camera-price-in-nepal', image: '/images/categories/dslr-camera.jpg' },
];

interface HomePageProps {
  initialBannerData?: BannerTypes | null;
}

const HomePage = ({ initialBannerData }: HomePageProps) => {
  // Use data passed from server
  const bannerData = initialBannerData;

  return (
    <div className="mx-auto h-full m-0 p-0 sm:py-2 space-y-2 sm:space-y-3 bg-[#f8f9fa] relative overflow-hidden">
      {/* Woodmart-Inspired Texture: Subtle Background Orbs */}
      <div className="absolute top-0 left-[-10%] w-[800px] h-[800px] bg-blue-100/40 rounded-full blur-[120px] pointer-events-none mix-blend-multiply z-0" />
      <div className="absolute top-[20%] right-[-10%] w-[600px] h-[600px] bg-purple-100/40 rounded-full blur-[100px] pointer-events-none mix-blend-multiply z-0" />
      <div className="absolute bottom-0 left-[20%] w-[700px] h-[700px] bg-indigo-50/50 rounded-full blur-[130px] pointer-events-none z-0" />

      <div className="relative z-10">
        <div className="sm:px-2 md:px-4">
          {/* Index 0 (Scroll) and Index 1 (Side Grid) */}
          <Imgbanner
            mainBanner={bannerData?.data?.[0]}
            sideBanner={bannerData?.data?.[1]}
          />

          {/* Removed BannerProductGrid as per request */}

          <LazyLoadSection fallback={<SkeltonCard />}>
            <Suspense fallback={<SkeltonCard />}>
              <BasketCardTrading title={demoCategories[0].title} slug={demoCategories[0].slug} id={demoCategories[0].id} />
            </Suspense>
          </LazyLoadSection>



          <LazyLoadSection fallback={<SkeltonBanner />}>
            <Suspense fallback={<SkeltonBanner />}>
              {/* Index 2 */}
              <OneImageBanner data={bannerData?.data?.[4]} />
            </Suspense>
          </LazyLoadSection>

          <LazyLoadSection fallback={<SkeltonCard />}>
            <Suspense fallback={<SkeltonCard />}>
              <BasketCard title={demoCategories[1].title} slug={demoCategories[1].slug} id={demoCategories[1].id} />
            </Suspense>
          </LazyLoadSection>


          <LazyLoadSection fallback={<SkeltonCard />}>
            <Suspense fallback={<SkeltonCard />}>
              <CategoryProductSection
                title={demoCategories[2].title}
                slug={demoCategories[2].slug}
                id={demoCategories[2].id}
                imageUrl={bannerData?.data?.[3]?.images?.[0]?.image?.full}
              />
            </Suspense>
          </LazyLoadSection>
        </div>
        <LazyLoadSection fallback={<SkeltonBanner />}>
          <Suspense fallback={<SkeltonBanner />}>
            <OfferBanner />
          </Suspense>
        </LazyLoadSection>
        <div className="sm:px-2 md:px-4">
          <LazyLoadSection fallback={<SkeltonCard />}>
            <Suspense fallback={<SkeltonCard />}>
              <BasketCard title={demoCategories[3].title} slug={demoCategories[3].slug} id={demoCategories[3].id} />
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
              <BasketCard title={demoCategories[4].title} slug={demoCategories[4].slug} id={demoCategories[4].id} />
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
              <BasketCard title={demoCategories[5].title} slug={demoCategories[5].slug} id={demoCategories[5].id} />
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

        </div>
      </div>
    </div>
  );
};

export default HomePage;