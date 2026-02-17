import { unstable_cache } from 'next/cache';
import RemoteServices from '../api/remoteservice';

export const getBlogPageData = unstable_cache(
    async () => {
        // Fetch specific banner for blog
        // Fetch deals (ProductDeals) - 'Pro' search
        // Fetch latest articles (BlogList)

        const [bannerRes, dealsRes, blogRes] = await Promise.allSettled([
            RemoteServices.getBannerBySlug('blog-banner-test'),
            RemoteServices.searchProducts({ search: 'Pro', page: 1, per_page: 10 }),
            RemoteServices.getBlogList({ page: 1, per_page: 12 }),
        ]);

        const bannerData = bannerRes.status === 'fulfilled' ? bannerRes.value.data || null : null;
        const dealProducts = dealsRes.status === 'fulfilled' ? dealsRes.value.data || [] : [];
        const latestArticles = blogRes.status === 'fulfilled'
            ? (Array.isArray(blogRes.value) ? blogRes.value : blogRes.value.data || [])
            : [];

        return {
            bannerData,
            dealProducts,
            latestArticles
        };
    },
    ['blog-page-data'],
    {
        revalidate: 3600, // 1 hour
        tags: ['blog', 'banner', 'products']
    }
);
