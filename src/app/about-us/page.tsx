import React from 'react';
import type { Metadata } from 'next';
import AboutHero from '@/components/about/AboutHero';
import CompanyStats from '@/components/about/CompanyStats';
import OurServices from '@/components/about/OurServices';
import CompanyJourney from '@/components/about/CompanyJourney';
import CompanyPartners from '@/components/about/CompanyPartners';
import OfficeLocation from '@/components/about/OfficeLocation';
import GoogleReviews from '@/components/about/GoogleReviews';
import BoardMembers from '@/components/about/BoardMembers';
import { getBannerData } from '@/app/api/CachedHelper/getBannerData';

export const metadata: Metadata = {
    title: 'About Us | Fatafatsewa - Nepal\'s Leading Digital Shopping Destination',
    description: 'Learn about Fatafatsewa, Nepal\'s leading e-commerce platform offering 0% EMI, genuine electronics, fast delivery, and expert repair services. Discover our journey, services, and office location.',
    keywords: 'about fatafatsewa, online shopping nepal, buy on EMI nepal, electronics store kathmandu, fatafatsewa location',
    openGraph: {
        title: 'About Fatafatsewa',
        description: 'Nepal\'s leading e-commerce platform offering 0% EMI and genuine electronics.',
        url: 'https://fatafatsewa.com/about-us',
        siteName: 'Fatafatsewa',
        images: [
            {
                url: '/images/office/office-team.jpg',
                width: 1200,
                height: 630,
            }
        ],
        type: 'website',
    },
};

const AboutUsPage = async () => {
    // Globally cached banner fetch
    const bannerData = await getBannerData('about-page-banner');

    // Sort images by order if it exists, otherwise empty array
    const sortedImages = bannerData?.images
        ? [...bannerData.images].sort((a: any, b: any) => a.order - b.order)
        : [];

    const preloadImage = sortedImages[0]?.image?.full;

    return (
        <main className="min-h-screen bg-white">
            {preloadImage && (
                // eslint-disable-next-line @next/next/no-head-element
                <link rel="preload" as="image" href={preloadImage} fetchPriority="high" />
            )}
            <AboutHero bannerData={bannerData} />
            <CompanyStats />

            <OurServices />
            <CompanyPartners />
            <CompanyJourney />
            <BoardMembers />

            <GoogleReviews />
            <OfficeLocation />
        </main>
    );
};

export default AboutUsPage;