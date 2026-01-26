
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

// Helper function to retry API calls with exponential backoff
async function fetchWithRetry<T>(
  fetchFn: () => Promise<T>,
  retries = 3,
  delay = 1000
): Promise<T | null> {
  for (let i = 0; i < retries; i++) {
    try {
      return await fetchFn();
    } catch (error: any) {
      const isLastAttempt = i === retries - 1;
      const isDNSError = error?.code === 'EAI_AGAIN' || error?.code === 'ENOTFOUND';

      if (isLastAttempt || !isDNSError) {
        console.error(`Failed to fetch after ${i + 1} attempts:`, error);
        return null;
      }

      // Wait before retrying with exponential backoff
      const waitTime = delay * Math.pow(2, i);
      console.log(`DNS error, retrying in ${waitTime}ms... (attempt ${i + 1}/${retries})`);
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
  }
  return null;
}

// Server Component
async function page() {
  // Server-side data fetching with retry logic
  const bannerData = await fetchWithRetry(async () => {
    const res = await RemoteServices.getAllBanners();
    return {
      data: res.data,
      meta: res.meta,
    };
  });

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