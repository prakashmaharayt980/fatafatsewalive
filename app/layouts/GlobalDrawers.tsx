// src/app/layouts/GlobalDrawers.tsx
'use client';

import dynamic from 'next/dynamic';
import React from 'react';

// Grouping these into a single dynamic container to reduce the number of Suspense boundaries
// and consolidate the "extra" client-side JS into fewer chunks.
const CheckoutDrawer = dynamic(() => import('@/app/checkout/CheckoutDrawer'), { ssr: false });
const WishList = dynamic(() => import('@/app/wishlist/page'), { ssr: false });
const GlobalCompareDrawer = dynamic(() => import('@/app/context/GlobalCompareDrawer'), { ssr: false });
const LoginAlertDialog = dynamic(() => import('@/components/auth/LoginAlertDialog'), { ssr: false });
const LoginPage = dynamic(() => import('@/app/login/page'), { ssr: false });
const UserActivityTracker = dynamic(() => import('@/components/UserActivityTracker'), { ssr: false });

export default function GlobalDrawers() {
  return (
    <>
      <CheckoutDrawer />
      <WishList />
      <GlobalCompareDrawer />
      <LoginAlertDialog />
      <LoginPage />
      <UserActivityTracker />
    </>
  );
}
