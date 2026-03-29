import { apiPrivate } from './client';
import { unstable_cache } from 'next/cache';

export const PagesService = {
    GetPages: (slug: string) =>
        unstable_cache(
            async () => apiPrivate.get(`/v1/pages/${slug}`).then(res => res.data),
            [`page-details-${slug}`],
            { revalidate: 7200, tags: [`page-${slug}`] }
        )(),
};

