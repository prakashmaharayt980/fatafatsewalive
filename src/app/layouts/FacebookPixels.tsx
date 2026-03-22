'use client'

import React, { useEffect } from 'react'
import Script from 'next/script'
import { usePathname, useSearchParams } from 'next/navigation'

export default function FacebookPixel() {
    const pathname = usePathname()
    const searchParams = useSearchParams()

    useEffect(() => {
        // Track page view on route change
        if (typeof window !== 'undefined' && window.fbq) {
            window.fbq('track', 'PageView')
        }
    }, [pathname, searchParams])

    return (
        <Script
            id="facebook-pixel"
            strategy="lazyOnload"
            dangerouslySetInnerHTML={{
                __html: `
                !function(f,b,e,v,n,t,s)
                {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
                n.callMethod.apply(n,arguments):n.queue.push(arguments)};
                if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
                n.queue=[];t=b.createElement(e);t.async=!0;
                t.src=v;s=b.getElementsByTagName(e)[0];
                s.parentNode.insertBefore(t,s)}(window, document,'script',
                'https://connect.facebook.net/en_US/fbevents.js');
                fbq('init', '${process.env.NEXT_PUBLIC_FACEBOOK_PIXEL_ID}');
                fbq('track', 'PageView');
                `,
            }}
        />
    )
}