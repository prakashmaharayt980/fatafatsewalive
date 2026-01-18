
import React from 'react'
import HomePage from './homepage'
import RemoteServices from './api/remoteservice'
import { Metadata } from 'next'

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
          url: '/og-image.jpg', // Ensure this image exists or use a remote URL
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
  // Server-side data fetching
  let bannerData = null;
  try {
    const res = await RemoteServices.BannerDetails();
    bannerData = {
      data: res.data,
      meta: res.meta,
    };
  } catch (error) {
    console.error("Failed to fetch banner data:", error);
    // Handle error gracefully, maybe pass empty data or error state
  }

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "name": "Fatafat Sewa",
        "url": "https://fatafatsewa.com",
        "logo": "https://fatafatsewa.com/logo.png",
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
      <HomePage initialBannerData={bannerData} />
    </>
  )
}

export default page