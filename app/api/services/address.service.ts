'use server';

import { apiPrivate, apiPublic } from './client';

export const CreateAddress = async (data: any) =>
    apiPrivate.post(`/v1/addresses`, data).then(res => res.data);

export const AddressList = async () =>
    apiPrivate.get(`/v1/addresses`).then(res => res.data);

export const AddressUpdate = async (id: number, data: any) =>
    apiPrivate.put(`/v1/addresses/${id}`, data).then(res => res.data);

export const AddressDelete = async (id: number) =>
    apiPrivate.delete(`/v1/addresses/${id}`).then(res => res.data);

// Shipping Address Endpoints
export const CreateShippingAddress = async (data: any) =>
    apiPrivate.post(`/v1/shipping-addresses`, data).then(res => res.data);

export const ShippingAddressList = async () =>
    apiPrivate.get(`/v1/shipping-addresses`).then(res => res.data);

export const ShippingAddressUpdate = async (id: number, data: any) =>
    apiPrivate.put(`/v1/shipping-addresses/${id}`, data).then(res => res.data);

export const ShippingAddressDelete = async (id: number) =>
    apiPrivate.delete(`/v1/shipping-addresses/${id}`).then(res => res.data);

export const GetLocations = async () =>
    apiPublic.get(`/v1/pages/locations`).then(res => res.data);


