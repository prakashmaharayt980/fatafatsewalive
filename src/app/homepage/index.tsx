'use client';

import React, { Suspense } from 'react';
import Image from 'next/image';
import Imgbanner from './Imgbanner';


import SkeltonCard from './SkeltonCard';
import SkeltonBanner from './SkeltonBanner';
import LazyLoadSection from '@/components/LazyLoadSection';
import { BannerTypes } from '@/app/types/BannerTypes';


// Lazy-loaded components
import dynamic from 'next/dynamic';
const BasketCard = dynamic(() => import('./BasketCard'));
const OfferBanner = dynamic(() => import('./OfferBanner'));
const OurArticles = dynamic(() => import('./OurArticles'));
const CategoryProductSection = dynamic(() => import('./BasketCardwithImage'));
const TwoImageBanner = dynamic(() => import('./Banner2'));
const OneImageBanner = dynamic(() => import('./Bannertop'));

// Demo category data - Replace with API fetch later
const demoCategories = [
  { id: '1', title: 'Mobile Phone', slug: 'mobile-price-in-nepal' },
  { id: '2', title: 'Laptop ', slug: 'laptop-price-in-nepal', image: '/images/categories/laptop.jpg' },
  { id: '3', title: 'Accessories', slug: 'accessories-price-in-nepal', image: '/images/categories/accessories.jpg' },
  { id: '74', title: 'Drone', slug: 'drone-price-in-nepal', image: '/images/categories/drone.jpg' },
  { id: '5', title: 'Home ', slug: 'home-appliance-price-in-nepal', image: '/images/categories/home-appliance.jpg' },
  { id: '34', title: 'Camera', slug: 'dslr-camera-price-in-nepal', image: '/images/categories/dslr-camera.jpg' },
];



interface HomePageProps {
  mainBannerData: any;
  sideBannerData: any;
  categorySectionImage: string;
  sectionOne: React.ReactNode;
  offerSection: React.ReactNode;
  sectionTwo: React.ReactNode;
  sectionThree: React.ReactNode;
  sectionFour: React.ReactNode;
}

const HomePage = ({
  mainBannerData,
  sideBannerData,
  categorySectionImage,
  sectionOne,
  offerSection,
  sectionTwo,
  sectionThree,
  sectionFour
}: HomePageProps) => {

  return (
    <div className="mx-auto h-full m-0 p-0 sm:py-2 space-y-2 sm:space-y-3 bg-[#f8f9fa] relative overflow-hidden">
      {/* Woodmart-Inspired Texture: Subtle Background Orbs */}
      <div className="absolute top-0 left-[-10%] w-[800px] h-[800px] bg-blue-100/40 rounded-full blur-[120px] pointer-events-none mix-blend-multiply z-0" />
      <div className="absolute top-[300px] right-[-10%] w-[600px] h-[600px] bg-purple-100/40 rounded-full blur-[100px] pointer-events-none mix-blend-multiply z-0" />
      <div className="absolute top-[800px] left-[20%] w-[700px] h-[700px] bg-indigo-50/50 rounded-full blur-[130px] pointer-events-none z-0" />

      <div className="relative z-10">
        <div className="sm:px-2 md:px-4">
          {/* Index 0 (Scroll) and Index 1 (Side Grid) */}
          <Imgbanner
            mainBanner={mainBannerData}
            sideBanner={sideBannerData}
          />

          {/* Removed BannerProductGrid as per request */}

          <BasketCard title={demoCategories[0].title} slug={demoCategories[0].slug} id={demoCategories[0].id} />



          {sectionOne}

          <BasketCard title={demoCategories[1].title} slug={demoCategories[1].slug} id={demoCategories[1].id} />


          <LazyLoadSection fallback={<SkeltonCard />}>
            <Suspense fallback={<SkeltonCard />}>
              <CategoryProductSection
                title={demoCategories[2].title}
                slug={demoCategories[2].slug}
                id={demoCategories[2].id}
                imageUrl={categorySectionImage}
              />
            </Suspense>
          </LazyLoadSection>
        </div>
        {offerSection}
        <div className="sm:px-2 md:px-4">
          <BasketCard title={demoCategories[3].title} slug={demoCategories[3].slug} id={demoCategories[3].id} />

          {sectionTwo}

          <BasketCard title={demoCategories[4].title} slug={demoCategories[4].slug} id={demoCategories[4].id} />

          {sectionThree}

          <BasketCard title={demoCategories[5].title} slug={demoCategories[5].slug} id={demoCategories[5].id} />

          {sectionFour}

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