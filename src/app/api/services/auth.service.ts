import { apiPublic, setCookie } from './client';
import { LoginFormData, RegisterFormData, VerifyFormData, ForgotFormData } from '@/app/login/validationSchema';

export const AuthService = {
    Login: async (data: LoginFormData) => {
        const res = await apiPublic.post(`/v1/login/`, data);
        if (res.data.data.access_token) {
            setCookie("access_token", res.data.data.access_token, { maxAge: 60 * 60 * 24 * 7 });
            setCookie("refresh_token", res.data.data.refresh_token, { maxAge: 60 * 60 * 24 * 7 });
        }
        return res.data;
    },

    GoogleLogin: async (data: LoginFormData) => {
        const res = await apiPublic.post(`/accounts/google/login/`, data);
        if (res.data.data.access_token) {
            setCookie("access_token", res.data.data.access_token, { maxAge: 60 * 60 * 24 * 7 });
            setCookie("refresh_token", res.data.data.refresh_token, { maxAge: 60 * 60 * 24 * 7 });
        }
        return res.data;
    },

    FacebookLogin: async (data: LoginFormData) => {
        const res = await apiPublic.post(`/accounts/facebook/login/`, data);
        if (res.data.data.access_token) {
            setCookie("access_token", res.data.data.access_token, { maxAge: 60 * 60 * 24 * 7 });
            setCookie("refresh_token", res.data.data.refresh_token, { maxAge: 60 * 60 * 24 * 7 });
        }
        return res.data;
    },

    Register: async (data: RegisterFormData) => {
        const res = await apiPublic.post(`/v1/register`, data);
        if (res.data.data.access_token) {
            setCookie("access_token", res.data.data.access_token, { maxAge: 60 * 60 * 24 * 7 });
            setCookie("refresh_token", res.data.data.refresh_token, { maxAge: 60 * 60 * 24 * 7 });
        }
        return res.data;
    },

    VerifyOtp: (data: VerifyFormData) =>
        apiPublic.post(`/v1/otp/verify`, data).then(res => res.data),

    ForgottenPassword: (data: ForgotFormData) =>
        apiPublic.post(`/v1/forgottenpassword`, data).then(res => res.data),

    ResetPassword: (data: VerifyFormData) =>
        apiPublic.post(`/v1/password/reset`, data).then(res => res.data),
};
