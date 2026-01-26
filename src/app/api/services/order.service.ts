import { apiPrivate } from './client';

export const OrderService = {
    CreateOrder: (data: any) =>
        apiPrivate.post(`/v1/orders`, data).then(res => res.data),

    OrderList: () =>
        apiPrivate.get(`/v1/orders`).then(res => res.data),

    OrderUpdate: (id: number, data: any) =>
        apiPrivate.put(`/v1/orders/${id}`, data).then(res => res.data),

    BuyProduct: (data: any) =>
        apiPrivate.post(`/v1/orders/direct-buy`, data).then(res => res.data),
};
