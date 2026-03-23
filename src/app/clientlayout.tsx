'use client';

import dynamic from 'next/dynamic';

const Toaster = dynamic(() => import('sonner').then(m => m.Toaster), {
  ssr: false,
});

const FooterBody = dynamic(() => import('./layouts/FooterBody'), {
  ssr: true,
});



const CheckoutDrawer = dynamic(() => import('@/app/checkout/CheckoutDrawer'), { ssr: false });
const WishList = dynamic(() => import('@/app/checkout/Wishlist'), { ssr: false });
const GlobalCompareDrawer = dynamic(() => import('@/app/context/GlobalCompareDrawer'), { ssr: false });
const LoginAlertDialog = dynamic(() => import('@/components/auth/LoginAlertDialog'), { ssr: false });
const FacebookPixel = dynamic(() => import('@/app/layouts/FacebookPixels'), { ssr: false });
const LoginPage = dynamic(() => import('@/app/login/page'), { ssr: false });
const UserActivityTracker = dynamic(() => import('@/components/UserActivityTracker'), { ssr: false });

export default function ClientSideDrawers() {
  return (
    <>
      <FooterBody />
      <CheckoutDrawer />
      <WishList />
      <GlobalCompareDrawer />
      <LoginAlertDialog />
      <FacebookPixel />
      <LoginPage />
      <UserActivityTracker />
      <Toaster richColors position="top-right" />
    </>
  );
}