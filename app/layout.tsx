import './globals.css';
import { Suspense, type ReactNode } from 'react';
import { Inter } from 'next/font/google';
import { GoogleAnalytics } from '@next/third-parties/google';
import { cacheLife } from 'next/cache';
import { getNavbarData } from '@/app/context/GlobalData';
import Header from './layouts/Header';
import ClientSideDrawers from './clientlayout';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
});

export const metadata = {
  metadataBase: new URL('https://fatafatsewa.com'),
  title: {
    default: 'Fatafat Sewa - Instant Delivery Platform in Nepal',
    template: '%s | Fatafat Sewa'
  },
  description: 'Fatafat Sewa is the best online shopping site in Nepal. Buy Electronics, Mobile, Laptops, and many more at the best price.',
  keywords: ['Online Shopping Nepal', 'Electronics Nepal', 'Mobile Phones Nepal', 'Laptops Nepal', 'Fatafat Sewa'],
  authors: [{ name: 'Fatafat Sewa Team' }],
  applicationName: 'Fatafat Sewa',
  openGraph: {
    title: 'Fatafat Sewa - Instant Delivery Platform in Nepal',
    description: 'Best online shopping site in Nepal. Buy Electronics, Mobile, Laptops at the best price.',
    url: 'https://fatafatsewa.com',
    siteName: 'Fatafat Sewa',
    locale: 'en_US',
    type: 'website',
  },
  icons: { icon: '/favicon.png' },
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
  twitter: {
    card: 'summary_large_image',
    site: '@fatafatsewa',
    creator: '@fatafatsewa',
  },
};

async function HeaderDataFetcher() {
  'use cache';
  cacheLife('minutes');
  const navItems = await getNavbarData();
  return <Header initialNavItems={navItems} />;
}

async function LazyFooter() {
  'use cache';
  cacheLife('days');
  const { default: Footer } = await import('./layouts/FooterBody');
  return <Footer />;
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={inter.className}>
      <body className="flex flex-col min-h-screen">
        <Suspense fallback={<div className="h-16 w-full bg-white shadow-sm animate-pulse" />}>
          <HeaderDataFetcher />
        </Suspense>

        <main className="flex-1 w-full mx-auto bg-gray-50">
          {children}
        </main>

        <ClientSideDrawers />
        <LazyFooter />
        <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS_ID ?? ''} />
      </body>
    </html>
  );
}
