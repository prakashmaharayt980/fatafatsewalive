import type { MetadataRoute } from 'next'
import { getCachedAllCategories, getCachedBlogCategories } from './api/utils/categoryCache';
import { getBlogList } from './api/services/blog.service';
import { searchProducts } from './api/services/product.service';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const baseUrl = 'https://fatafatsewa.com'

    // 1. Core Pages & Routes
    const routes: MetadataRoute.Sitemap = [
        { path: '', priority: 1.0 },
        { path: '/blogs', priority: 0.9 },
        { path: '/emi', priority: 0.9 },
        { path: '/emi/shop', priority: 0.9 },
        { path: '/emi/eligibility', priority: 0.85 },
        { path: '/repair', priority: 0.8 },
        { path: '/exchangeProducts', priority: 0.8 },
        { path: '/compare', priority: 0.7 },
        { path: '/login', priority: 0.5 },
    ].map(({ path, priority }) => ({
        url: `${baseUrl}${path}`,
        lastModified: new Date(),
        changeFrequency: 'daily' as const,
        priority,
    }))

    // 2. Product Categories
    let categories: MetadataRoute.Sitemap = []
    try {
        const res = await getCachedAllCategories()
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

    // 3. Blog Categories
    let blogCategories: MetadataRoute.Sitemap = []
    try {
        const res = await getCachedBlogCategories()
        const list = Array.isArray(res) ? res : Array.isArray(res?.data) ? res.data : []
        blogCategories = list.map((cat: any) => ({
            url: `${baseUrl}/blogs?category=${cat.slug}`,
            lastModified: new Date(),
            changeFrequency: 'weekly' as const,
            priority: 0.8,
        }))
    } catch {
        console.error('sitemap: failed to fetch blog categories')
    }

    // 4. Individual Blog Posts
    let blogs: MetadataRoute.Sitemap = []
    try {
        const res = await getBlogList({ per_page: 500, sort: 'desc' })
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

    // 5. Individual Products (Latest Batch)
    let products: MetadataRoute.Sitemap = []
    try {
        const res = await searchProducts({ per_page: 1000, sort: 'newest' })
        const list = Array.isArray(res?.data?.products) ? res.data.products : Array.isArray(res?.data) ? res.data : []
        products = list.map((prod: any) => ({
            url: `${baseUrl}/product-details/${prod.slug}`,
            lastModified: new Date(prod.updated_at ?? prod.created_at ?? Date.now()),
            changeFrequency: 'daily' as const,
            priority: 0.9,
        }))
    } catch {
        console.error('sitemap: failed to fetch products')
    }

    return [...routes, ...categories, ...blogCategories, ...blogs, ...products]
}
