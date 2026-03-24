
import './globals.css';
import React from 'react';
import dynamic from 'next/dynamic';
import { Inter } from 'next/font/google';
import { GoogleAnalytics } from '@next/third-parties/google';
import FacebookPixel from './layouts/FacebookPixels';

import { AuthProvider } from '@/app/context/AuthContext';
import { getGlobalData } from '@/app/context/GlobalData';

import HeaderBody from './layouts/headerbody';
import ClientSideDrawers from './clientlayout';
import FooterBody from './layouts/FooterBody';

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




export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const { navItems } = await getGlobalData();

  return (
    <html lang="en" className={inter.className}>
      <body className="flex flex-col min-h-screen">
        <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS_ID!} />
        {/* <FacebookPixel /> */}
        <HeaderBody initialNavItems={navItems} />

        <main className="flex-1 w-full mx-auto bg-gray-50">
          {children}
        </main>



        <ClientSideDrawers />
        <FooterBody />
      </body>
    </html>
  );
}