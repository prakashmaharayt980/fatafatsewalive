import type { MetadataRoute } from 'next'
import { getAllCategories } from './api/services/category.service';
import { getBlogList } from './api/services/blog.service';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const baseUrl = 'https://fatafatsewa.com'

    const routes = [
        { path: '', priority: 1.0 },
        { path: '/blogs', priority: 0.9 },
        { path: '/emi/shop', priority: 0.9 },
        { path: '/compare', priority: 0.7 },
        
        { path: '/login', priority: 0.5 },
    ].map(({ path, priority }) => ({
        url: `${baseUrl}${path}`,
        lastModified: new Date(),
        changeFrequency: 'daily' as const,
        priority,
    }))

    let categories: MetadataRoute.Sitemap = []
    try {
        const res = await getAllCategories()
        const list = Array.isArray(res) ? res : Array.isArray(res?.data) ? res.data : []
        categories = list.map((cat: any) => ({
            url: `${baseUrl}/category/${cat.slug}`,
            lastModified: new Date(),
            changeFrequency: 'weekly' as const,
            priority: 0.8,
        }))
    } catch {
        console.error('sitemap: failed to fetch categories')
    }

    let blogs: MetadataRoute.Sitemap = []
    try {
        const res = await getBlogList()
        const list = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : []
        blogs = list.map((blog: any) => ({
            url: `${baseUrl}/blogs/${blog.slug}`,
            lastModified: new Date(blog.updated_at ?? blog.created_at ?? Date.now()),
            changeFrequency: 'weekly' as const,
            priority: 0.7,
        }))
    } catch {
        console.error('sitemap: failed to fetch blogs')
    }

    return [...routes, ...categories, ...blogs]
}
