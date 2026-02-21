import { apiPrivate, apiPublic } from './client';

export const PagesService = {
    GetPages: (slug: string) =>
        apiPrivate.get(`/v1/pages/${slug}`).then(res => res.data),

    GetLocations: () =>
        apiPublic.get(`/v1/pages/locations`).then(res => res.data),

};
