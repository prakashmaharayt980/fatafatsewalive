
import './globals.css';
import React from 'react';
import { Inter } from 'next/font/google';
import { GoogleAnalytics } from '@next/third-parties/google';

import { getNavbarData } from '@/app/context/GlobalData';
import Header from './layouts/Header';
import ClientSideDrawers from './clientlayout';
import LazyFooter from './layouts/LazyFooter';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
})

export const metadata = {
  metadataBase: new URL('https://fatafatsewa.com'),
  title: {
    default: 'Fatafat Sewa - Instant Delivery Platform in Nepal',
    template: '%s | Fatafat Sewa'
  },
  description: 'Fatafat Sewa is the best online shopping site in Nepal. Buy Electronics, Mobile, Laptops, and many more at the best price.',
  keywords: ['Online Shopping Nepal', 'Electronics Nepal', 'Mobile Phones Nepal', 'Laptops Nepal', 'Fatafat Sewa', 'Instant Delivery'],
  authors: [{ name: 'Fatafat Sewa Team' }],
  applicationName: 'Fatafat Sewa',
  openGraph: {
    title: 'Fatafat Sewa - Instant Delivery Platform in Nepal',
    description: 'Fatafat Sewa is the best online shopping site in Nepal. Buy Electronics, Mobile, Laptops, and many more at the best price.',
    url: 'https://fatafatsewa.com',
    siteName: 'Fatafat Sewa',
    locale: 'en_US',
    type: 'website',
  },
  icons: {
    icon: '/favicon.png',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};


async function HeaderDataFetcher() {
  const navItems = await getNavbarData();
  return <Header initialNavItems={navItems} />;
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.className} data-scroll-behavior="smooth">
      <body className="flex flex-col min-h-screen">
        {/* Using lazyOnload for non-critical analytics to prioritize FCP/LCP */}
        <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS_ID || ''} />

        <React.Suspense fallback={<div className="h-16 w-full bg-white shadow-sm animate-pulse" />}>
          <HeaderDataFetcher />
        </React.Suspense>

        <main className="flex-1 w-full mx-auto bg-gray-50">
          {children}
        </main>


        <ClientSideDrawers />
        <LazyFooter />
      </body>
    </html>
  );
}