import HomePage from './homepage'
import { Metadata } from 'next'
import { Suspense } from 'react'
import BannerFetcher from './CommonVue/BannerFetcher'
import BasketCardFetcher from './homepage/BasketCardFetcher'
import LazyBasketCardFetcher from './homepage/LazyBasketCardFetcher'
import BasketCardwithImageFetcher from './homepage/BasketCardwithImageFetcher'
import LazyOurArticlesFetcher from './homepage/LazyOurArticlesFetcher'
import { getHomepageData } from '@/app/api/CachedHelper/getInitialData'
import { getBannerData } from '@/app/api/CachedHelper/getBannerData'

// Demo category data - Replace with API fetch later
const demoCategories = [
  { slug: 'mobile-price-in-nepal', title: 'Mobile Phone' },
  { slug: 'laptop-price-in-nepal', title: 'Laptop' },
  { slug: 'accessories-price-in-nepal', title: 'Accessories' },
  { slug: 'drone-price-in-nepal', title: 'Drone' },
  { slug: 'home-appliance-price-in-nepal', title: 'Home' },
  { slug: 'dslr-camera-price-in-nepal', title: 'Camera' },
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
  }
}

// Loading skeletons
const BannerSkeleton = () => (
  <div className="w-full h-32 sm:h-48 lg:h-64 bg-linear-to-r from-gray-200 via-gray-100 to-gray-200 rounded-xl animate-pulse" />
);

const BasketCardSkeleton = () => (
  <div className="space-y-4">
    <div className="h-8 w-32 bg-gray-200 rounded animate-pulse" />
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="bg-gray-100 rounded-lg h-64 animate-pulse" />
      ))}
    </div>
  </div>
);

// Server Component
async function page() {
  // 1. Fetch Critical Data (Now un-cached to resolve caching issues)
  const { criticalData } = await getHomepageData();

  // 2. Client-side Lazy Loaded Sections using BannerFetcher

  const SectionOne = (
    <Suspense key="section-one" fallback={<BannerSkeleton />}>
      <BannerFetcher
        slug="home-banner-fourth-test"
        variant="footer"
        fetchAction={getBannerData}
        className="mt-4"
      />
    </Suspense>
  );

  const OfferSection = (
    <Suspense key="offer-section" fallback={<BannerSkeleton />}>
      <BannerFetcher
        slug="offer-banner"
        variant="offer"
        fetchAction={getBannerData}
        className="mt-4"
      />
    </Suspense>
  );

  const SectionTwo = (
    <Suspense key="section-two" fallback={<BannerSkeleton />}>
      <BannerFetcher
        slug="home-banner-fourth-test"
        variant="footer"
        fetchAction={getBannerData}
        className="mt-4"
      />
    </Suspense>
  );

  const SectionThree = (
    <Suspense key="section-three" fallback={<BannerSkeleton />}>
      <BannerFetcher
        slug="banner-3-img-test"
        variant="two-image"
        fetchAction={getBannerData}
        className="mt-4"
      />
    </Suspense>
  );

  const SectionFour = (
    <Suspense key="section-four" fallback={<BannerSkeleton />}>
      <BannerFetcher
        slug="home-banner-fourth-test"
        variant="footer"
        fetchAction={getBannerData}
        className="mt-4"
      />
    </Suspense>
  );

  // 3. Client-side Lazy Loaded Product Sections (BasketCards)

  const BasketSection0 = (
    <BasketCardFetcher
      title={demoCategories[0].title}
      slug={demoCategories[0].slug}
    />
  );

  const BasketSection1 = (
    <LazyBasketCardFetcher
      title={demoCategories[1].title}
      slug={demoCategories[1].slug}
    />
  );

  const BasketSection2 = (
    <BasketCardwithImageFetcher
      title={demoCategories[2].title}
      slug={demoCategories[2].slug}
    />
  );

  const BasketSection3 = (
    <LazyBasketCardFetcher
      title={demoCategories[3].title}
      slug={demoCategories[3].slug}
    />
  );

  const BasketSection4 = (
    <LazyBasketCardFetcher
      title={demoCategories[4].title}
      slug={demoCategories[4].slug}
    />
  );

  const BasketSection5 = (
    <LazyBasketCardFetcher
      title={demoCategories[5].title}
      slug={demoCategories[5].slug}
    />
  );

  const OurArticlesSection = (
    <LazyOurArticlesFetcher blogpage="blog" />
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


  const mainBannerFirstImgObj = criticalData.main?.images
    ?.sort((a: any, b: any) => (a.order || 0) - (b.order || 0))?.[0];
  const mainBannerFirstImg = mainBannerFirstImgObj?.url || mainBannerFirstImgObj?.image?.full as string | undefined;



  return (
    <>
      {/* Preload above-the-fold banner images for faster LCP */}
      {mainBannerFirstImg && (
        <link
          rel="preload"
          as="image"
          href={mainBannerFirstImg}
          fetchPriority="high"
        />
      )}

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <HomePage
        mainBannerData={criticalData.main}
        sideBannerData={criticalData.side}
       
        sectionOne={SectionOne}
        offerSection={OfferSection}
        sectionTwo={SectionTwo}
        sectionThree={SectionThree}
        sectionFour={SectionFour}
        basketSection0={BasketSection0}
        basketSection1={BasketSection1}
        basketSection2={BasketSection2}
        basketSection3={BasketSection3}
        basketSection4={BasketSection4}
        basketSection5={BasketSection5}
        ourArticlesSection={OurArticlesSection}
      />
    </>
  )
}

export default page
