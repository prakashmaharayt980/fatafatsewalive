import { apiPrivate } from './client';

export const PaymentService = {
    InitiateNicasiaPayment: (data: any) =>
        apiPrivate.post(`/v1/payment/nicasia/initiate`, data).then(res => res.data),

    InitiateEeswaPayment: (data: any) =>
        apiPrivate.post(`/v1/payment/esewa/initiate`, data).then(res => res.data),
};
