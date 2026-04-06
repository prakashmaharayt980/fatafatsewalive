import React, { Suspense } from 'react';
import type { Metadata } from 'next';
import dynamic from 'next/dynamic';
import AboutHero from '@/components/about/AboutHero';
import OurServices from '@/components/about/OurServices';
import { getBannerData } from '@/app/api/CachedHelper/getBannerData';
import LazyAboutSection from '@/components/about/LazyAboutSection';

// Dynamic Imports for Client Components and Heavy Sections
const CompanyStats = dynamic(() => import('@/components/about/CompanyStats'), {
    loading: () => <div className="h-96 animate-pulse bg-slate-50" />,
    ssr: true
});

const CompanyPartners = dynamic(() => import('@/components/about/CompanyPartners'), {
    ssr: true
});

const CompanyJourney = dynamic(() => import('@/components/about/CompanyJourney'), {
    ssr: true
});



const GoogleReviews = dynamic(() => import('@/components/about/GoogleReviews'), {
    ssr: true
});

const OfficeLocation = dynamic(() => import('@/components/about/OfficeLocation'), {
    ssr: true
});

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

async function AboutHeroSection() {
    const bannerData = await getBannerData('about-page-banner');

    // Sort images by order if it exists, otherwise empty array
    const sortedImages = bannerData?.images
        ? [...bannerData.images].sort((a: any, b: any) => a.order - b.order)
        : [];

    const preloadImage = sortedImages[0]?.image?.full;

    return (
        <>
            {preloadImage && (
                // eslint-disable-next-line @next/next/no-head-element
                <link rel="preload" as="image" href={preloadImage} fetchPriority="high" />
            )}
            <AboutHero bannerData={bannerData} />
        </>
    );
}

const AboutUsPage = () => {
    return (
        <main className="min-h-screen bg-white">
            <Suspense fallback={<div className="w-full relative bg-slate-200 animate-pulse" style={{ aspectRatio: '20 / 6' }} />}>
                <AboutHeroSection />
            </Suspense>

            <Suspense fallback={<div className="h-96 animate-pulse bg-slate-50" />}>
                <CompanyStats />
            </Suspense>

            <OurServices />

            <LazyAboutSection minHeight="400px">
                <CompanyPartners />
            </LazyAboutSection>

            <LazyAboutSection minHeight="600px">
                <CompanyJourney />
            </LazyAboutSection>

            {/* <LazyAboutSection minHeight="600px">
                <BoardMembers />
            </LazyAboutSection> */}

            <LazyAboutSection minHeight="400px">
                <GoogleReviews />
            </LazyAboutSection>

            <LazyAboutSection minHeight="500px">
                <OfficeLocation />
            </LazyAboutSection>
        </main>
    );
};

export default AboutUsPage;