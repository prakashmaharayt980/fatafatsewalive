import { apiPublic, apiPrivate, n8nApi } from './client';

export const MiscService = {
    // Get category tree for navbar
    getNavbarItems: () =>
        apiPublic.get(`/v1/categories/tree`).then(res => res.data),

    // Get homepage banners
    getHomeBanners: () =>
        apiPublic.get(`/v1/banners/home`).then(res => res.data),

    // Get banner by slot/slug
    getBannerBySlug: (slug: string) =>
        apiPublic.get(`/v1/banners?slot=${slug}`).then(res => res.data),

    // Get all active banners
    getAllBanners: () =>
        apiPublic.get(`/v1/banners`).then(res => res.data),
    getBannerSlug: (slug: string) =>
        apiPublic.get(`/v1/banners?slug=${slug}`).then(res => res.data),

    // AI Chatbot query
    chatBotQuery: (data: { message: string; sessionId?: string | number }) =>
        n8nApi.post(`/chatbot`, data).then(res => res.data),

    // Get chatbot conversation history
    getChatbotHistory: (sessionId?: string | number) => {
        const params = sessionId ? `?sessionId=${sessionId}` : '';
        return n8nApi.get(`/chatbot${params}`).then(res => res.data);
    },

    // Apply for EMI
    applyEmi: (data: any) =>
        apiPrivate.post(`/v1/emi/apply`, data, {
            meta: { contentType: "multipart/form-data" },
        }).then(res => res.data),

    // Get EMI banks/providers
    getEmiProviders: () =>
        apiPublic.get(`/v1/emi/providers`).then(res => res.data),

    // Get homepage sections (deals, featured, etc.)
    getHomeSections: () =>
        apiPublic.get(`/v1/home/sections`).then(res => res.data),
};
