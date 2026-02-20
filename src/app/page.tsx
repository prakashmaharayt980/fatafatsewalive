import HomePage from './homepage'
import { Metadata } from 'next'
import BannerFetcher from './CommonVue/BannerFetcher'
import { getHomepageData } from './context/HomepageData'
import { getBannerData } from '@/app/api/CachedHelper/getBannerData'

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



// Server Component
async function page() {
  // 1. Fetch Critical Data (Cached for 1 hour)
  const { criticalData, mobilePhoneData } = await getHomepageData();

  // 2. Client-side Lazy Loaded Sections using BannerFetcher

  const SectionOne = (
    <BannerFetcher
      key="section-one"
      slug="home-banner-fourth-test"
      variant="footer"
      fetchAction={getBannerData}
      className="mt-4"
    />
  );

  const OfferSection = (
    <BannerFetcher
      key="offer-section"
      slug="offer-banner"
      variant="offer"
      fetchAction={getBannerData}
      className="mt-4"
    />
  );

  const SectionTwo = (
    <BannerFetcher
      key="section-two"
      slug="home-banner-fourth-test"
      variant="footer"
      fetchAction={getBannerData}
      className="mt-4"
    />
  );

  const SectionThree = (
    <BannerFetcher
      key="section-three"
      slug="home-banner-third-test"
      variant="two-image"
      fetchAction={getBannerData}
      className="mt-4"
    />
  );

  const SectionFour = (
    <BannerFetcher
      key="section-four"
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
        sectionTwo={SectionTwo}
        sectionThree={SectionThree}
        sectionFour={SectionFour}
      />
    </>
  )
}

export default page