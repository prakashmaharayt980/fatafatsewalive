import { apiPrivate, apiPublic } from './client';

export const PagesService = {
    GetPages: (slug: string) =>
        apiPrivate.get(`/v1/pages/${slug}`).then(res => res.data),


};
