'use server';

import { apiPrivate } from './client';

export const EmiRequest = async (data: any) =>
    apiPrivate.post(`/v1/emi-requests`, data).then(res => res.data);

export const EmiRequestList = async () =>
    apiPrivate.get(`/v1/emi-request`).then(res => res.data);

export const EmiRequestDetails = async (id: number) =>
    apiPrivate.get(`/v1/emi-request/${id}`).then(res => res.data);

export const EmiRequestUpdate = async (id: number, data: any) =>
    apiPrivate.put(`/v1/emi-request/${id}`, data).then(res => res.data);

export const EmiRequestDelete = async (id: number) =>
    apiPrivate.delete(`/v1/emi-request/${id}`).then(res => res.data);

export const ApplyEmiWithCard = async (data: any) =>
    apiPrivate.post(`/v1/emi-apply/card`, data).then(res => res.data);

export const ApplyEmiDownPayment = async (data: any) =>
    apiPrivate.post(`/v1/emi-apply/bank`, data).then(res => res.data);

export const ApplyEmiWithCardCreation = async (data: any) =>
    apiPrivate.post(`/v1/emi-apply/no-cost`, data).then(res => res.data);


