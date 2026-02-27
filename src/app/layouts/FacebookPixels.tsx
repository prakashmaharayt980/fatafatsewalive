'use client'

import { useEffect, useState } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'

export default function FacebookPixel() {
    const [loaded, setLoaded] = useState(false)
    const pathname = usePathname()
    const searchParams = useSearchParams()

    useEffect(() => {
        // Delay initialization to prevent blocking the main thread during hydration (improves TBT)
        if (!loaded) {
            const timer = setTimeout(() => {
                import('react-facebook-pixel')
                    .then((x) => x.default)
                    .then((ReactPixel) => {
                        ReactPixel.init(process.env.NEXT_PUBLIC_FACEBOOK_PIXEL_ID) // Replace with your Pixel ID
                        ReactPixel.pageView()
                        setLoaded(true)
                    })
            }, 3000); // 3-second delay pushes this out of the critical rendering path

            return () => clearTimeout(timer);
        } else {
            // Track page view on route change immediately if already loaded
            import('react-facebook-pixel')
                .then((x) => x.default)
                .then((ReactPixel) => {
                    ReactPixel.pageView()
                })
        }
    }, [pathname, searchParams, loaded])

    return null
}