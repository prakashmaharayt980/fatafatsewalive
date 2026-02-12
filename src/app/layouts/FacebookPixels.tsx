'use client'

import { useEffect, useState } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'

export default function FacebookPixel() {
    const [loaded, setLoaded] = useState(false)
    const pathname = usePathname()
    const searchParams = useSearchParams()

    useEffect(() => {
        // Initialize only once
        if (!loaded) {
            import('react-facebook-pixel')
                .then((x) => x.default)
                .then((ReactPixel) => {
                    ReactPixel.init(process.env.NEXT_PUBLIC_FACEBOOK_PIXEL_ID) // Replace with your Pixel ID
                    ReactPixel.pageView()
                    setLoaded(true)
                })
        } else {
            // Track page view on route change
            import('react-facebook-pixel')
                .then((x) => x.default)
                .then((ReactPixel) => {
                    ReactPixel.pageView()
                })
        }
    }, [pathname, searchParams, loaded])

    return null
}