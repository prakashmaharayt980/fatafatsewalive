import { apiPrivate } from './client';

export const CartService = {
    CreateCart: (data: any) =>
        apiPrivate.post(`/v1/cart/items`, data).then(res => res.data),

    CartList: () =>
        apiPrivate.get(`/v1/cart`).then(res => res.data),

    DeleteCart: (id: number) =>
        apiPrivate.delete(`/v1/cart/items/${id}`).then(res => res.data),

    CartUpdate: (id: number, data: any) =>
        apiPrivate.put(`/v1/cart/items/${id}`, data).then(res => res.data),

    PromoCdeUse: (data: any) =>
        apiPrivate.post(`/v1/cart/apply-coupon`, data).then(res => res.data),
};
