// src/app/layout.tsx
import './globals.css'; // Tailwind or global styles
import React from 'react';
import HeaderBody from '@/app/layouts/headerbody';

import FooterBody from '@/app/layouts/FooterBody';
import { Toaster } from '@/components/ui/sonner';
import ChatBot from './chatbot';

import { CartProvider1 } from '@/app/checkout/CartContext1';
import CheckoutDrawer from '@/app/checkout/CheckoutDrawer';


import { CompareProvider } from '@/app/context/CompareContext';
import LoginPage from '@/app/login/page';
import { AuthProvider } from '@/app/context/AuthContext';
import WishList from '@/app/emi/_components/Wishlist';
import { AddressProvider } from '@/app/context/AddressContext';

import { Inter } from 'next/font/google'
import { EmiProvider } from '@/app/emi/_components/emiContext';
import { GoogleOAuthProvider } from "@react-oauth/google";
import { GoogleAnalytics } from '@next/third-parties/google';
import FacebookPixel from '@/app/layouts/FacebookPixels'
import { getGlobalData } from '@/app/context/GlobalData';
import UserActivityTracker from '@/components/UserActivityTracker';
import GlobalCompareDrawer from '@/components/GlobalCompareDrawer';
import LoginAlertDialog from '@/components/auth/LoginAlertDialog';
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
  const { navItems, isLoggedIn, accessToken, user } = await getGlobalData();
  return (
    <html lang="en" className={inter.className}>
      <body className="flex flex-col min-h-screen">

        <GoogleOAuthProvider clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID}>

          <AuthProvider initialState={{ isLoggedIn, user, accessToken }}>
            <AddressProvider>
              <CartProvider1>
                <CompareProvider>
                  <HeaderBody initialNavItems={navItems} />
                  <main className="flex-1 w-full mx-auto bg-gray-50">
                    <EmiProvider>
                      {children}
                      <LoginPage />
                    </EmiProvider>
                  </main>
                  <FooterBody />
                  <ChatBot />
                  <Toaster richColors position="top-right" />
                  <CheckoutDrawer />
                  <FacebookPixel />

                  <WishList />
                  <GlobalCompareDrawer />
                  <LoginAlertDialog />
                </CompareProvider>
              </CartProvider1>
            </AddressProvider>
          </AuthProvider>


        </GoogleOAuthProvider>


      </body>
      <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS_ID} />
      <UserActivityTracker />
    </html>
  );
}
