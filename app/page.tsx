// src/app/page.tsx

import type { Metadata } from 'next';
import HomePage from './homepage';
import Bannerfooter from './homepage/Bannerfooter';
import Banner2 from './homepage/Banner2';
import OfferBanner from './homepage/OfferBanner';
import { Suspense } from 'react';
import SkeletonCard from '@/app/skeleton/SkeletonCard';
import SkeletonBanner from '@/app/skeleton/SkeletonBanner';
import BannerCarouselServer from '@/components/BannerCarouselServer';
import BannerSectionServer from '@/components/BannerSectionServer';
import OurArticles from '@/app/homepage/OurArticles';
import BasketSectionServer from '@/components/BasketSectionServer';


// Demo categories
const demoCategories = [
  { slug: 'mobile-price-in-nepal', title: 'Mobile Phone' },
  { slug: 'laptop-price-in-nepal', title: 'Laptop' },
  { slug: 'accessories-price-in-nepal', title: 'Accessories', imgSlug: 'right-slider-thumbnail-test' },
  { slug: 'drone-price-in-nepal', title: 'Drone' },
  { slug: 'home-appliance-price-in-nepal', title: 'Home' },
  { slug: 'dslr-camera-price-in-nepal', title: 'Camera' },
];

// Banner sections config
const bannerSections = [
  { slug: 'home-banner-fourth-test', type: 'Bannerfooter' as const },
  { slug: 'pathao-offer', type: 'OfferBanner' as const },
  { slug: 'banner-3-img-test', type: 'Banner2' as const },
];

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
  };
}

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

import LazySection from '@/components/LazySection';

async function Page() {
  const basketSections = Object.fromEntries(demoCategories.map((cat, index) => {
    const section = (
      <BasketSectionServer
        slug={cat.slug}
        title={cat.title}
        imgSlug={(cat as any).imgSlug}
      />
    );

    return [`basketSection${index}`, index < 2 ? section : (
      <LazySection key={cat.slug} fallback={<SkeletonCard />} minHeight="400px">
        <Suspense fallback={<SkeletonCard />}>
          {section}
        </Suspense>
      </LazySection>
    )];
  }));

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <HomePage
        {...basketSections}
        mainBannerSection={<BannerCarouselServer />}
        sectionOne={<Suspense fallback={<div className="w-full aspect-[5/1] bg-gray-100 animate-pulse rounded" />}><BannerSectionServer slug={bannerSections[0].slug} type={bannerSections[0].type} /></Suspense>}
        offerSection={
          <LazySection fallback={<div className="w-full min-h-[400px] sm:min-h-[500px] bg-gray-50 animate-pulse rounded-xl" />} minHeight="400px">
            <Suspense fallback={<div className="w-full min-h-[400px] sm:min-h-[500px] bg-gray-50 animate-pulse rounded-xl" />}><BannerSectionServer slug={bannerSections[1].slug} type={bannerSections[1].type} /></Suspense>
          </LazySection>
        }
        sectionTwo={
          <LazySection fallback={<div className="w-full aspect-[1000/250] bg-gray-100 animate-pulse rounded" />} minHeight="200px">
            <Suspense fallback={<div className="w-full aspect-[1000/250] bg-gray-100 animate-pulse rounded" />}><BannerSectionServer slug={bannerSections[2].slug} type={bannerSections[2].type} /></Suspense>
          </LazySection>
        }
        ourArticlesSection={
          <LazySection fallback={<div className="min-h-[400px] animate-pulse bg-gray-50 rounded-2xl" />} minHeight="400px">
            <OurArticles blogpage="home" />
          </LazySection>
        }
      />
    </>
  );
}

export const revalidate = 60;

export default Page;

