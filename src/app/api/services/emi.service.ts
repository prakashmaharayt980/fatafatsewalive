import { apiPrivate } from './client';

export const EmiService = {
    EmiRequest: (data: any) =>
        apiPrivate.post(`/v1/emi-request`, data).then(res => res.data),

    EmiRequestList: () =>
        apiPrivate.get(`/v1/emi-request`).then(res => res.data),

    EmiRequestDetails: (id: number) =>
        apiPrivate.get(`/v1/emi-request/${id}`).then(res => res.data),

    EmiRequestUpdate: (id: number, data: any) =>
        apiPrivate.put(`/v1/emi-request/${id}`, data).then(res => res.data),

    EmiRequestDelete: (id: number) =>
        apiPrivate.delete(`/v1/emi-request/${id}`).then(res => res.data),

};
