import { MetadataRoute } from 'next'
import RemoteServices from './api/remoteservice'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const baseUrl = 'https://fatafatsewa.com'

    // Static routes
    const routes = [
        '',
        '/login',
        '/blog',
        '/compare',
    ].map((route) => ({
        url: `${baseUrl}${route}`,
        lastModified: new Date(),
        changeFrequency: 'daily' as const,
        priority: 1,
    }))

    // Dynamic Categories
    let categories = []
    try {
        const res = await RemoteServices.getCategoriesAll(); // Ensure this matches your API response structure
        // If res is array
        if (Array.isArray(res)) {
            categories = res.map((cat: any) => ({
                url: `${baseUrl}/category/${cat.slug}?id=${cat.id}`,
                lastModified: new Date(),
                changeFrequency: 'weekly' as const,
                priority: 0.8,
            }))
        } else if (res && res.data && Array.isArray(res.data)) {
            // If res has data property
            categories = res.data.map((cat: any) => ({
                url: `${baseUrl}/category/${cat.slug}?id=${cat.id}`,
                lastModified: new Date(),
                changeFrequency: 'weekly' as const,
                priority: 0.8,
            }))
        }

    } catch (error) {
        console.error('Failed to fetch categories for sitemap:', error)
    }

    // Dynamic Blogs
    let blogs = []
    try {
        const res = await RemoteServices.Bloglist();
        if (res && res.data && Array.isArray(res.data)) {
            blogs = res.data.map((blog: any) => ({
                url: `${baseUrl}/blog/${blog.id}`, // Confirm if blog uses slug or ID
                lastModified: new Date(blog.created_at || new Date()),
                changeFrequency: 'weekly' as const,
                priority: 0.7,
            }))
        }
    } catch (error) {
        console.error('Failed to fetch blogs for sitemap:', error)
    }

    return [...routes, ...categories, ...blogs]
}
