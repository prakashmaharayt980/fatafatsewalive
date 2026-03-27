// src/app/page.tsx

import type { Metadata } from 'next';
import HomePage from './homepage';


import BannerSectionServer from '@/components/BannerSectionServer';


import BasketSectionClient from '@/components/BasketSectionClient';
import OfferSectionClient from '@/components/OfferSectionClient';
import OurArticlesSectionClient from '@/components/OurArticlesSectionClient';

// Demo categories
const demoCategories = [
  { slug: 'mobile-price-in-nepal', title: 'Mobile Phone' },
  { slug: 'laptop-price-in-nepal', title: 'Laptop' },
  { slug: 'accessories-price-in-nepal', title: 'Accessories', imgSlug: 'right-slider-thumbnail-test' },
  { slug: 'drone-price-in-nepal', title: 'Drone' },
  { slug: 'speaker-price-in-nepal', title: 'Speaker' },
  { slug: 'dslr-camera-price-in-nepal', title: 'Camera' },
];

// Banner sections config
const bannerSections = [
  { slug: 'home-banner-fourth-test', type: 'Bannerfooter' as const },
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

import TopHeroSection from '@/components/TopHeroSection';

async function Page() {
  const firstCategory = demoCategories[0];

  // All other sections lazy-load on scroll
  const remainingCategories = demoCategories.slice(1);
  const basketSections = Object.fromEntries(remainingCategories.map((cat, index) => [
    `basketSection${index + 1}`,
    <BasketSectionClient
      key={cat.slug}
      slug={cat.slug}
      title={cat.title}
      imgSlug={(cat as any).imgSlug}
      isFirstSection={false}
      sectionIndex={index + 1}
    />
  ]));

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <HomePage
        {...basketSections}
        mainBannerSection={
          <TopHeroSection
            slug={firstCategory.slug}
            title={firstCategory.title}
          />
        }
        sectionOne={
          <LazySection
            fallback={<div className="w-full aspect-[1000/250] bg-gray-100 animate-pulse rounded" />}
            aspectRatio="1000/250"
            rootMargin="800px"
          >
            <BannerSectionServer slug={bannerSections[0].slug} type={bannerSections[0].type} />
          </LazySection>}
        offerSection={<OfferSectionClient />}
        sectionTwo={
          <LazySection
            fallback={<div className="w-full aspect-[1000/250] bg-gray-100 animate-pulse rounded" />}
            aspectRatio="1000/250"
            rootMargin="800px"
          >
            <BannerSectionServer slug={bannerSections[1].slug} type={bannerSections[1].type} />
          </LazySection>
        }
        ourArticlesSection={<OurArticlesSectionClient />}
      />
    </>
  );
}

export const revalidate = 60;

export default Page;

