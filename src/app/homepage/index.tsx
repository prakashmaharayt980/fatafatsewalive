'use client';

import Imgbanner from './Imgbanner';
import SkeletonCard from '@/app/skeleton/SkeletonCard';
import SkeletonBanner from '@/app/skeleton/SkeletonBanner';
import BasketCard from './BasketCard';

// Lazy-loaded components
import dynamic from 'next/dynamic';

const OfferBanner = dynamic(() => import('./OfferBanner'), {
  loading: () => <SkeletonBanner />
});
const OurArticles = dynamic(() => import('./OurArticles'));
const CategoryProductSection = dynamic(() => import('./BasketCardwithImage'), {
  loading: () => <SkeletonCard />
});
const TwoImageBanner = dynamic(() => import('./Banner2'));
const OneImageBanner = dynamic(() => import('./Bannerfooter'));

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
  mobilePhoneData: any; // Added prop for initial product data
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
  mobilePhoneData,
  sectionOne,
  offerSection,
  sectionTwo,
  sectionThree,
  sectionFour
}: HomePageProps) => {

  return (
    <main className="mx-auto h-full m-0 p-0 sm:py-1 space-y-1  bg-[#f8f9fa] relative overflow-hidden">
      <h1 className="sr-only">Fatafat Sewa - Best Online Shopping in Nepal</h1>

      {/* Woodmart-Inspired Texture: Subtle Background Orbs */}
      <div className="absolute top-0 left-[-10%] w-[800px] h-[800px] bg-blue-100/40 rounded-full blur-[120px] pointer-events-none mix-blend-multiply z-0" />
      <div className="absolute top-[300px] right-[-10%] w-[600px] h-[600px] bg-purple-100/40 rounded-full blur-[100px] pointer-events-none mix-blend-multiply z-0" />
      <div className="absolute top-[800px] left-[20%] w-[700px] h-[700px] bg-indigo-50/50 rounded-full blur-[130px] pointer-events-none z-0" />

      <div className="relative z-10">
        <div className="sm:px-2 ">
          <Imgbanner
            mainBanner={mainBannerData}
            sideBanner={sideBannerData}
          />

          <BasketCard
            title={demoCategories[0].title}
            slug={demoCategories[0].slug}
            id={demoCategories[0].id}
            initialData={mobilePhoneData}

          />



          {sectionOne}

          <BasketCard title={demoCategories[1].title} slug={demoCategories[1].slug} id={demoCategories[1].id} />

          <CategoryProductSection
            title={demoCategories[2].title}
            slug={demoCategories[2].slug}
            id={demoCategories[2].id}
            imageUrl={categorySectionImage}
          />
        </div>
        {offerSection}
        <div className="sm:px-2 md:px-4">
          <BasketCard title={demoCategories[3].title} slug={demoCategories[3].slug} id={demoCategories[3].id} />

          {sectionTwo}

          <BasketCard title={demoCategories[4].title} slug={demoCategories[4].slug} id={demoCategories[4].id} />

          {sectionThree}

          <BasketCard title={demoCategories[5].title} slug={demoCategories[5].slug} id={demoCategories[5].id} />

          {sectionFour}

          <OurArticles blogpage="blog" />

        </div>
      </div>
    </main>
  );
};

export default HomePage;