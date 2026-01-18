import axios, { AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import * as yup from 'yup';
import { LoginFormData, RegisterFormData, VerifyFormData, ForgotFormData } from '@/app/login/validationSchema';

import { getCookie, setCookie, deleteCookie } from 'cookies-next';


declare module "axios" {
  export interface InternalAxiosRequestConfig {
    meta?: {
      contentType?: string;
    };
  }
  export interface AxiosRequestConfig {
    meta?: {
      contentType?: string;
    };
  }
}

const envSchema = yup.object({
  NEXT_PUBLIC_API_URL: yup.string().url().required("NEXT_PUBLIC_API_URL is missing or invalid"),
  NEXT_PUBLIC_API_KEY: yup.string().required("NEXT_PUBLIC_API_KEY is required"),
  NEXT_PUBLIC_API_N8N_URL: yup.string().url().required("NEXT_PUBLIC_API_N8N_URL is missing or invalid"),
});


const getEnv = () => {
  try {
    return envSchema.validateSync({
      NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
      NEXT_PUBLIC_API_KEY: process.env.NEXT_PUBLIC_API_KEY,
      NEXT_PUBLIC_API_N8N_URL: process.env.NEXT_PUBLIC_API_N8N_URL,
    });
  } catch (err: any) {

    return {
      NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || '',
      NEXT_PUBLIC_API_KEY: process.env.NEXT_PUBLIC_API_KEY || '',
      NEXT_PUBLIC_API_N8N_URL: process.env.NEXT_PUBLIC_API_N8N_URL || '',
    };
  }
};


const env = getEnv();
const baseURL = env.NEXT_PUBLIC_API_URL;

const n8nBaseURL = env.NEXT_PUBLIC_API_N8N_URL;

export const n8nApi: AxiosInstance = axios.create({
  baseURL: n8nBaseURL,
  headers: {
    "Content-Type": "application/json",
    "API-Key": env.NEXT_PUBLIC_API_KEY,
  },
});


export const apiPublic: AxiosInstance = axios.create({
  baseURL,
  headers: {
    "Content-Type": "application/json",
    "API-Key": env.NEXT_PUBLIC_API_KEY,
  },
});

export const apiPrivate: AxiosInstance = axios.create({
  baseURL,
  headers: {
    "API-Key": env.NEXT_PUBLIC_API_KEY,
  },
});

apiPrivate.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = getCookie("access_token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  // ✅ CUSTOM CONTENT TYPE HANDLING
  if (config.meta?.contentType) {
    config.headers["Content-Type"] = config.meta.contentType;
  } else if (!config.headers["Content-Type"] && !(config.data instanceof FormData)) {
    config.headers["Content-Type"] = "application/json";
  }

  return config;
});

apiPrivate.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = getCookie("refresh_token");
        if (!refreshToken) throw new Error("No refresh token");

        const { data } = await apiPublic.post('/v1/refresh-token', {
          refresh: refreshToken,
        });

        const newAccessToken = data.access;

        setCookie("access_token", newAccessToken, { maxAge: 60 * 60 * 24 });

        apiPrivate.defaults.headers.common["Authorization"] = `Bearer ${newAccessToken}`;
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

        return apiPrivate(originalRequest);
      } catch (refreshError) {
        deleteCookie("access_token");
        deleteCookie("refresh_token");
        if (typeof window !== "undefined") window.location.href = "/login";
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);


const RemoteServices = {
  // PUBLIC ENDPOINTS
  NavbarItems: () => apiPublic.get(`client/categoryTree/list`).then(res => res.data),

  HomePageResource_img: () => apiPublic.get(`tools/client/banners/list`).then(res => res.data),

  Login: async (data: LoginFormData) => {
    const res = await apiPublic.post(`/v1/login/`, data);
    if (res.data.data.access_token) {
      setCookie("access_token", res.data.data.access_token, { maxAge: 60 * 60 * 24 * 7 }); // 7 days
      setCookie("refresh_token", res.data.data.refresh_token, { maxAge: 60 * 60 * 24 * 7 });
    }
    return res.data;
  },

  GoogleLogin: async (data: LoginFormData) => {
    const res = await apiPublic.post(`accounts/google/login/`, data);
    if (res.data.access_token) {
      setCookie("access_token", res.data.access_token, { maxAge: 60 * 60 * 24 * 7 }); // 7 days
      setCookie("refresh_token", res.data.refresh_token, { maxAge: 60 * 60 * 24 * 7 });
    }
    return res.data;
  },

  FacebookLogin: async (data: LoginFormData) => {
    const res = await apiPublic.post(`accounts/facebook/login/`, data);
    if (res.data.data.access_token) {
      setCookie("access_token", res.data.data.access_token, { maxAge: 60 * 60 * 24 * 7 }); // 7 days
      setCookie("refresh_token", res.data.data.refresh_token, { maxAge: 60 * 60 * 24 * 7 });
    }
    return res.data;
  },

  Register: async (data: RegisterFormData) => {
    const res = await apiPublic.post(`v1/register`, data);
    if (res.data.data.access_token) {
      setCookie("access_token", res.data.data.access_token, { maxAge: 60 * 60 * 24 * 7 }); // 7 days
      setCookie("refresh_token", res.data.data.refresh_token, { maxAge: 60 * 60 * 24 * 7 });
    }
    return res.data;
  },

  VerifyOtp: (data: VerifyFormData) =>
    apiPublic.post(`/v1/otp/verify`, data).then(res => res.data),

  ForgottenPassword: (data: ForgotFormData) =>
    apiPublic.post(`/v1/forgottenpassword`, data).then(res => res.data),

  // ResetPassword: (data: ResetFormData) =>
  //   apiPublic.post(`/v1/reset-password`, data).then(res => res.data),

  // PRIVATE ENDPOINTS (Require Authorization)
  DashboardStats: () =>
    apiPrivate.get(`/v1/dashboard-stats/`).then(res => res.data),

  BuyProduct: (data: any) =>
    apiPrivate.post(`orders/create`, data).then(res => res.data),

  UpdateProfile: (data: any) =>
    apiPrivate.patch(`accounts/profile/update/`, data).then(res => res.data),

  AllCategory: () => apiPublic.get(`get-all-categories`).then(res => res.data),

  CategoryProduct_ID: (id: string, queryString?: string) => apiPublic.get(`v1/categories/${id}/products${queryString ? `${queryString.startsWith('?') ? '' : '?'}${queryString}` : ''}`).then(res => res.data),
  categoryProduct_slug: (slug: string) => apiPublic.get(`v1/categories/slug/${slug}`).then(res => res.data),

  SerachProducts: (search: string) => apiPublic.get(`v1/products/search?per_page=10&search=${search}`).then(res => res.data),
  ProductDetails_ID: (id: string) => apiPublic.get(`v1/products/${id}`).then(res => res.data.data),

  BannerDetails: () => apiPublic.get(`v1/banners`).then(res => res.data),

  ReviewCreate: ({
    data,
    id
  }) => apiPrivate.post(`v1/products/${id}/reviews`, data).then(res => res.data),

  ReviewList: (id: number, page: number = 1) => apiPrivate.get(`v1/products/${id}/reviews?page=${page}`).then(res => res.data),

  CreateCart: (data: any) => apiPrivate.post(`v1/cart/items`, data).then(res => res.data),
  CartList: () => apiPrivate.get(`v1/cart`).then(res => res.data),
  DeleteCart: (id: number) => apiPrivate.delete(`v1/cart/items/${id}`).then(res => res.data),
  CartUpdate: (id: number, data: any) => apiPrivate.put(`v1/cart/items/${id}`, data,
    //   {
    //   meta: { contentType: "multipart/form-data" },
    // }
  ).then(res => res.data),

  CreateOrder: (data: any) => apiPrivate.post(`v1/orders`, data).then(res => res.data),
  OrderList: () => apiPrivate.get(`v1/orders`).then(res => res.data),
  OrderUpdate: (id: number, data: any) => apiPrivate.put(`v1/orders/${id}`, data).then(res => res.data),

  PromoCdeUse: (data) => apiPrivate.post(`v1/cart/apply-coupon`, data).then(res => res.data),



  CreateAddress: (data: any) => apiPrivate.post(`v1/addresses`, data).then(res => res.data),
  AddressList: () => apiPrivate.get(`v1/addresses`).then(res => res.data),
  AddressUpdate: (id: number, data: any) => apiPrivate.put(`v1/addresses/${id}`, data).then(res => res.data),
  AddressDelete: (id: number) => apiPrivate.delete(`v1/addresses/${id}`).then(res => res.data),

  ProfileView: () => apiPrivate.get(`/user`).then(res => res.data),
  ProfileUpdate: (data: any) => apiPrivate.put(`v1/profile`, data).then(res => res.data),

  ChangePassword: (data: any) => apiPrivate.post(`v1/password/reset`, data).then(res => res.data),

  Bloglist: () => apiPublic.get(`v1/blogs`).then(res => res.data),
  BlogDetails: (id: number) => apiPublic.get(`v1/blog/${id}`).then(res => res.data),


  getCategoriesAll: () => apiPublic.get(`get-all-categories`).then(res => res.data),
  getBrandsAll: () => apiPublic.get(`get-all-brands`).then(res => res.data),
  getCategoriesParent: () => apiPublic.get(`v1/categories/parents`).then(res => res.data),


  chatBotQuery: (data: { message: string, sessionid: number, method: string }) => n8nApi.post(`/webhook1`, data).then(res => res.data),

  ApplyEmi: (data: any) => apiPrivate.post(`v1/emi/apply`, data,
    {
      meta: { contentType: "multipart/form-data" },
    }
  ).then(res => res.data),
};

export default RemoteServices;