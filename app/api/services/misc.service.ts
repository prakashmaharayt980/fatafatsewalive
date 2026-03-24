
'use server'

import { apiPublic, apiPrivate, n8nApi } from './client';

export const getBannerBySlug = async (slug: string) =>
    apiPublic.get(`/v1/banners/${slug}`).then(res => res.data);

export const chatBotQuery = async (data: { message: string; sessionId?: string | number }) =>
    n8nApi.post(`/chatbot`, data).then(res => res.data);

export const getChatbotHistory = async (sessionId?: string | number) => {
    const params = sessionId ? `?sessionId=${sessionId}` : '';
    return n8nApi.get(`/chatbot${params}`).then(res => res.data);
};

// No object exports allowed in 'use server' files
