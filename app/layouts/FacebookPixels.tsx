'use client';

import Script from 'next/script';

const PIXEL_ID = process.env.NEXT_PUBLIC_FACEBOOK_PIXEL_ID as string;

declare global {
  interface Window {
    fbq?: (...args: any[]) => void;
  }
}

export default function FacebookPixel() {
  // PageView tracking is handled by src/components/UserActivityTracker.tsx
  // to avoid duplication and ensure consistency with other analytics providers.

  if (!PIXEL_ID) {
    if (process.env.NODE_ENV === 'development') {
      console.warn('Facebook Pixel ID is missing from environment variables');
    }
    return null;
  }

  return (
    <>
      <Script
        id="facebook-pixel-base"
        src="https://connect.facebook.net/en_US/fbevents.js"
        strategy="afterInteractive"
      />
      <Script
        id="facebook-pixel-init"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            if (!window.fbq) {
                window.fbq = function() {
                  window.fbq.callMethod ? window.fbq.callMethod.apply(window.fbq, arguments) : window.fbq.queue.push(arguments);
                };
                if (!window._fbq) window._fbq = window.fbq;
                window.fbq.push = window.fbq;
                window.fbq.loaded = true;
                window.fbq.version = '2.0';
                window.fbq.queue = [];
                window.fbq('init', '${PIXEL_ID}');
            }
          `,
        }}
      />
    </>
  );
}