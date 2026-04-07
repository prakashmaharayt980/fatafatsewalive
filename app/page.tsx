import type { Metadata } from 'next';
import HomePage from './homepage';

import TopHeroSection from '@/components/TopHeroSection';

import OurArticlesSection from '@/components/OurArticlesSection';
import OfferBanner from './homepage/OfferBanner';
import BasketCard from './homepage/BasketCard';
import BasketCardwithImage from './homepage/BasketCardwithImage';
import { getBannerData } from '@/app/api/CachedHelper/getBannerData'
import TopBanner from './homepage/Bannerfooter';
import TwoImageBanner from './homepage/Banner2';

// Config
const categories = [
  { slug: 'mobile-price-in-nepal', title: 'Mobile Phone' },
  { slug: 'laptop-price-in-nepal', title: 'Laptop' },
  { slug: 'accessories-price-in-nepal', title: 'Accessories', imgSlug: 'right-slider-thumbnail-test' },
  { slug: 'drone-price-in-nepal', title: 'Drone' },
  { slug: 'speaker-price-in-nepal', title: 'Speaker' },
] as const;

const banners = [
  { slug: 'home-banner-fourth-test', type: 'Bannerfooter' as const },
  { slug: 'banner-3-img-test', type: 'Banner2' as const },
] as const;

// SEO
export const metadata: Metadata = {
  title: 'Fatafat Sewa - Buy Electronics Online in Nepal | Free Delivery',
  description: 'Shop Mobile, Laptop, Accessories at best prices in Nepal. Free delivery, 0% EMI, genuine products with warranty. Trusted by 50,000+ customers.',
  keywords: ['online shopping Nepal', 'buy mobile Nepal', 'laptop price Nepal', 'electronics Nepal', 'EMI Nepal'],
  alternates: {
    canonical: 'https://fatafatsewa.com',
    languages: { 'en-NP': 'https://fatafatsewa.com' },
  },
  openGraph: {
    title: 'Fatafat Sewa - Buy Electronics Online in Nepal',
    description: 'Shop Mobile, Laptop, Accessories at best prices. Free delivery & 0% EMI.',
    type: 'website',
    url: 'https://fatafatsewa.com',
    siteName: 'Fatafat Sewa',
    images: [{ url: '/og-image.jpg', width: 1200, height: 630, alt: 'Fatafat Sewa Nepal' }],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@fatafatsewa',
    title: 'Fatafat Sewa - Buy Electronics Online in Nepal',
    description: 'Shop Mobile, Laptop, Accessories at best prices. Free delivery & 0% EMI.',
  },
};

// Structured Data
const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": "https://fatafatsewa.com/#organization",
      "name": "Fatafat Sewa",
      "url": "https://fatafatsewa.com",
      "logo": "https://fatafatsewa.com/favicon.png",
      "description": "Nepal's trusted online shopping platform for electronics",
      "sameAs": [
        "https://www.facebook.com/fatafatsewa",
        "https://www.instagram.com/fatafatsewa",
        "https://twitter.com/fatafatsewa"
      ],
      "contactPoint": {
        "@type": "ContactPoint",
        "contactType": "Customer Service",
        "areaServed": "NP",
        "availableLanguage": ["en"]
      }
    },
    {
      "@type": "WebSite",
      "@id": "https://fatafatsewa.com/#website",
      "name": "Fatafat Sewa",
      "url": "https://fatafatsewa.com",
      "publisher": { "@id": "https://fatafatsewa.com/#organization" },
      "potentialAction": {
        "@type": "SearchAction",
        "target": "https://fatafatsewa.com/search?q={search_term_string}",
        "query-input": "required name=search_term_string"
      }
    },
    {
      "@type": "FAQPage",
      "mainEntity": [
        {
          "@type": "Question",
          "name": "Does Fatafat Sewa offer free delivery in Nepal?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Yes! Free delivery available on orders across Nepal. Instant delivery in select Kathmandu areas."
          }
        },
        {
          "@type": "Question",
          "name": "Can I buy electronics on EMI at Fatafat Sewa?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Yes! 0% EMI available on selected products with major Nepali banks including NIC Asia, Sanima, and more."
          }
        },
        {
          "@type": "Question",
          "name": "Are products at Fatafat Sewa original?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "100% genuine products guaranteed with official manufacturer warranty and our 7-day return policy."
          }
        }
      ]
    }
  ]
};

async function FooterBannerServer({ slug }: { slug: string }) {
  try {
    const data = await getBannerData(slug);
    const inner = data?.data ?? data;
    if (!inner?.images?.length) return null;
    return <TopBanner data={inner} />;
  } catch (error) {
    return null;
  }
}

async function TwoImageBannerServer({ slug }: { slug: string }) {
  try {
    const data = await getBannerData(slug);
    const inner = data?.data ?? data;
    if (!inner?.images?.length) return null;
    return <TwoImageBanner data={inner} />;
  } catch (error) {
    return null;
  }
}

export default async function Page() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <HomePage
        mainBannerSection={<TopHeroSection slug={categories[0].slug} title={categories[0].title} />}
        sectionOne={
          <FooterBannerServer slug={banners[0].slug} />
        }
        basketSection1={<BasketCard slug={categories[1].slug} title={categories[1].title} />}
        basketSection2={<BasketCardwithImage slug={categories[2].slug} title={categories[2].title} imgSlug={categories[2].imgSlug} />}
        offerSection={<OfferBanner slug="pathao-offer" />}
        basketSection3={<BasketCard slug={categories[3].slug} title={categories[3].title} />}
        sectionTwo={
          <TwoImageBannerServer slug={banners[1].slug} />
        }
        basketSection4={<BasketCard slug={categories[4].slug} title={categories[4].title} />}
        ourArticlesSection={<OurArticlesSection />}
      />
    </>
  );
}
