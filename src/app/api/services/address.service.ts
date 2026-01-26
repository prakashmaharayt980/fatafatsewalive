import { apiPrivate } from './client';

export const AddressService = {
    // Address Endpoints
    CreateAddress: (data: any) =>
        apiPrivate.post(`/v1/addresses`, data).then(res => res.data),

    AddressList: () =>
        apiPrivate.get(`/v1/addresses`).then(res => res.data),

    AddressUpdate: (id: number, data: any) =>
        apiPrivate.put(`/v1/addresses/${id}`, data).then(res => res.data),

    AddressDelete: (id: number) =>
        apiPrivate.delete(`/v1/addresses/${id}`).then(res => res.data),

    // Shipping Address Endpoints
    CreateShippingAddress: (data: any) =>
        apiPrivate.post(`/v1/shipping-addresses`, data).then(res => res.data),

    ShippingAddressList: () =>
        apiPrivate.get(`/v1/shipping-addresses`).then(res => res.data),

    ShippingAddressUpdate: (id: number, data: any) =>
        apiPrivate.put(`/v1/shipping-addresses/${id}`, data).then(res => res.data),

    ShippingAddressDelete: (id: number) =>
        apiPrivate.delete(`/v1/shipping-addresses/${id}`).then(res => res.data),
};
