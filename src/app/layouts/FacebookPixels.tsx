'use client';

import { useEffect } from 'react';
import Script from 'next/script';
import { usePathname, useSearchParams } from 'next/navigation';

const PIXEL_ID = process.env.NEXT_PUBLIC_FACEBOOK_PIXEL_ID as string;

declare global {
  interface Window {
    fbq?: (...args: any[]) => void;
  }
}

export default function FacebookPixel() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (!window.fbq) return;

    window.fbq('track', 'PageView');
  }, [pathname, searchParams]);

  return (
    <>
      {/* Load main pixel script efficiently */}
      <Script
        src="https://connect.facebook.net/en_US/fbevents.js"
        strategy="lazyOnload"
      />

      {/* Initialize pixel (separate, lightweight) */}
      <Script
        id="facebook-pixel-init"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            window.fbq = window.fbq || function(){(window.fbq.q=window.fbq.q||[]).push(arguments)};
            window.fbq('init', '${PIXEL_ID}');
          `,
        }}
      />
    </>
  );
}