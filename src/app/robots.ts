import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
    return {
        rules: {
            userAgent: '*',
            allow: '/',
            disallow: ['/profile/', '/checkout/', '/admin/'],
        },
        sitemap: 'https://fatafatsewa.com/sitemap.xml',
    }
}
