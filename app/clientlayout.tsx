'use client';

import dynamic from 'next/dynamic';

const Toaster = dynamic(() => import('sonner').then(m => m.Toaster), {
  ssr: false,
});

const GlobalDrawers = dynamic(() => import('./layouts/GlobalDrawers'), {
  ssr: false,
});

export default function ClientSideDrawers() {
  return (
    <>
      <GlobalDrawers />
      <Toaster richColors position="top-right" />
    </>
  );
}