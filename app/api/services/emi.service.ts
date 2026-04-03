

import { apiPrivate } from '../ServiceHelper/index';

export const EmiRequest =  (data: any) =>
    apiPrivate.post(`/v1/emi-requests`, data).then(res => res.data);

export const EmiRequestList =  () =>
    apiPrivate.get(`/v1/emi-request`).then(res => res.data);

export const EmiRequestDetails =  (id: number) =>
    apiPrivate.get(`/v1/emi-request/${id}`).then(res => res.data);

export const EmiRequestUpdate =  (id: number, data: any) =>
    apiPrivate.put(`/v1/emi-request/${id}`, data).then(res => res.data);

export const EmiRequestDelete =  (id: number) =>
    apiPrivate.delete(`/v1/emi-request/${id}`).then(res => res.data);

export const ApplyEmiWithCard =  (data: any) =>
    apiPrivate.post(`/v1/emi-apply/card`, data).then(res => res.data);

export const ApplyEmiDownPayment =  (data: any) =>
    apiPrivate.post(`/v1/emi-apply/bank`, data).then(res => res.data);

export const ApplyEmiWithCardCreation =  (data: any) =>
    apiPrivate.post(`/v1/emi-apply/no-cost`, data).then(res => res.data);
