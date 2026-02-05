
import React from 'react'
import HomePage from './homepage'
import RemoteServices from './api/remoteservice'
import { Metadata } from 'next'
import { Suspense } from 'react'
import BannerFetcher from './components/BannerFetcher'
import OneImageBanner from './homepage/Bannerfooter'
// import TwoImageBanner from './homepage/Banner2' // Removed static import
// import OfferBanner from './homepage/OfferBanner' // Removed static import
import dynamic from 'next/dynamic'
// Generate Metadata for SEO
export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'Fatafat Sewa - Online Shopping in Nepal',
    description: 'Fatafat Sewa is the best online shopping site in Nepal. Buy Electronics, Mobile, Laptops, and many more at the best price.',
    alternates: {
      canonical: 'https://fatafatsewa.com',
    },
    openGraph: {
      title: 'Fatafat Sewa - Online Shopping in Nepal',
      description: 'Fatafat Sewa is the best online shopping site in Nepal.',
      type: 'website',
      url: 'https://fatafatsewa.com',
      images: [
        {
          url: '/favicon.png', // Ensure this image exists or use a remote URL
          width: 1200,
          height: 630,
          alt: 'Fatafat Sewa',
        },
      ],
    },
  }
}


// Server Component
async function page() {
  // 1. Fetch Critical Data in Parallel
  const criticalSlugs = {
    main: 'main-banner-test',
    side: 'test-slug-banner', // Corrected slug for side
    category: 'right-slider-thumbnail-test',
    // Side banner is also used in section three, so we fetch it once here
  };

  const promises = Object.entries(criticalSlugs).map(async ([key, slug]) => {
    try {
      const res = await RemoteServices.getBannerSlug(slug);
      return { key, data: res.data?.[0] || null };
    } catch (e) {
      console.error(`Failed to fetch critical banner: ${slug}`, e);
      return { key, data: null };
    }
  });

  const results = await Promise.all(promises);
  const criticalData = results.reduce((acc, { key, data }) => {
    acc[key] = data;
    return acc;
  }, {} as Record<string, any>);

  // 2. Define Suspense/Streaming slots
  const OneImageBanner = dynamic(() => import('./homepage/Bannerfooter'));
  const OfferBanner = dynamic(() => import('./homepage/OfferBanner'));
  const TwoImageBanner = dynamic(() => import('./homepage/Banner2'));

  const SectionOne = (
    <Suspense fallback={<div className="bg-gray-100  rounded-xl" />}>
      <BannerFetcher
        slug="home-banner-secound"
        Component={OneImageBanner}
      />
    </Suspense>
  );

  const OfferSection = (
    <Suspense fallback={<div className="bg-gray-100 " />}>
      <BannerFetcher
        slug="offer-banner"
        Component={OfferBanner}
      />
    </Suspense>
  );

  const SectionTwo = (
    <Suspense fallback={<div className="  bg-gray-100  rounded-xl" />}>
      <BannerFetcher
        slug="home-banner-secound"
        Component={OneImageBanner}
      />
    </Suspense>
  );

  // Section Three now uses BannerFetcher for consistency
  const SectionThree = (
    <Suspense fallback={<div className="bg-gray-100  rounded-xl" />}>
      <BannerFetcher
        slug={'home-banner-third-test'}
        Component={TwoImageBanner}
      />
    </Suspense>
  );

  const SectionFour = (
    <Suspense fallback={<div className=" bg-gray-100  rounded-xl" />}>
      <BannerFetcher
        slug="home-banner-fourth-test"
        Component={OneImageBanner}
      />
    </Suspense>
  );

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "name": "Fatafat Sewa",
        "url": "https://fatafatsewa.com",
        "logo": "https://fatafatsewa.com/favicon.png",
        "sameAs": [
          "https://www.facebook.com/fatafatsewa",
          "https://www.instagram.com/fatafatsewa",
          "https://twitter.com/fatafatsewa"
        ]
      },
      {
        "@type": "WebSite",
        "name": "Fatafat Sewa",
        "url": "https://fatafatsewa.com",
        "potentialAction": {
          "@type": "SearchAction",
          "target": "https://fatafatsewa.com/search?q={search_term_string}",
          "query-input": "required name=search_term_string"
        }
      }
    ]
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <HomePage
        mainBannerData={criticalData.main}
        sideBannerData={criticalData.side}
        categorySectionImage={criticalData.category?.images?.[0]?.image?.full}
        sectionOne={SectionOne}
        offerSection={OfferSection}
        sectionTwo={SectionTwo}
        sectionThree={SectionThree}
        sectionFour={SectionFour}
      />
    </>
  )
}

export default page