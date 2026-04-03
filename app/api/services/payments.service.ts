import { apiPrivate } from '../ServiceHelper/index';

export const InitiateNicasiaPayment = async (data: any) =>
    apiPrivate.post(`/v1/payment/nicasia/initiate`, data).then(res => res.data);

export const InitiateEeswaPayment = async (data: any) =>
    apiPrivate.post(`/v1/payment/esewa/initiate`, data).then(res => res.data);

export const GetEMiBanks = async () =>
    apiPrivate.get(`/v1/emi-banks`).then(res => res.data);
