import { apiPublic, apiPrivate, n8nApi } from './client';

export const MiscService = {




    getBannerBySlug: (slug: string) =>
        apiPublic.get(`/v1/banners/${slug}`).then(res => res.data),


    chatBotQuery: (data: { message: string; sessionId?: string | number }) =>
        n8nApi.post(`/chatbot`, data).then(res => res.data),


    getChatbotHistory: (sessionId?: string | number) => {
        const params = sessionId ? `?sessionId=${sessionId}` : '';
        return n8nApi.get(`/chatbot${params}`).then(res => res.data);
    },

};
