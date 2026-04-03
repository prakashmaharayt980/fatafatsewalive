

import { apiPublic, apiPrivate } from '../ServiceHelper/index';

export const ReviewService = {

    createReview: ({ data, id }: { data: any; id: string | number }) =>
        apiPrivate.post(`/v1/products/${id}/reviews`, data).then(res => res.data),


    getReviews: (id: string | number, page: number = 1) =>
        apiPublic.get(`/v1/products/${id}/reviews?page=${page}`).then(res => res.data),


};
