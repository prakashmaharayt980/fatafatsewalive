import React from 'react'
import HomePage from './homepage'
import RemoteServices from './api/remoteservice'
import { Metadata } from 'next'
import BannerFetcher from './components/BannerFetcher'
import { CategoryService } from './api/services/category.service'
import { getHomepageData } from './context/HomepageData'

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
          url: '/favicon.png',
          width: 1200,
          height: 630,
          alt: 'Fatafat Sewa',
        },
      ],
    },
  }
}

// Server Action to fetch banner data
async function getBannerData(slug: string) {
  'use server';
  try {
    const res = await RemoteServices.getBannerBySlug(slug);
    return res.data || null;
  } catch (error) {
    console.error(`Failed to fetch banner data for slug: ${slug}`, error);
    return null;
  }
}

// Server Component
async function page() {
  // 1. Fetch Critical Data (Cached for 1 hour)
  const { criticalData, mobilePhoneData } = await getHomepageData();

  // 2. Client-side Lazy Loaded Sections using BannerFetcher

  const SectionOne = (
    <BannerFetcher
      slug="home-banner-fourth-test"
      variant="footer"
      fetchAction={getBannerData}
      className="mt-4"
    />
  );

  const OfferSection = (
    <BannerFetcher
      slug="offer-banner"
      variant="offer"
      fetchAction={getBannerData}
      className="mt-4"
    />
  );

  const SectionTwo = (
    <BannerFetcher
      slug="home-banner-fourth-test"
      variant="footer"
      fetchAction={getBannerData}
      className="mt-4"
    />
  );

  const SectionThree = (
    <BannerFetcher
      slug="home-banner-third-test"
      variant="two-image"
      fetchAction={getBannerData}
      className="mt-4"
    />
  );

  const SectionFour = (
    <BannerFetcher
      slug="home-banner-fourth-test"
      variant="footer"
      fetchAction={getBannerData}
      className="mt-4"
    />
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
        mobilePhoneData={mobilePhoneData}
        sectionOne={SectionOne}
        offerSection={OfferSection}
        sectionTwo={SectionOne}
        sectionThree={SectionThree}
        sectionFour={SectionFour}
      />
    </>
  )
}

export default page