import { apiPrivate } from '../ServiceHelper/index';

export const ProfileService = {
    ProfileView: () =>
        apiPrivate.get(`/v1/me`).then(res => res.data),

    ProfileUpdate: (data: any) =>
        apiPrivate.put(`/v1/profile`, data).then(res => res.data),

    UpdateProfile: (data: any) =>
        apiPrivate.patch(`/accounts/profile/update/`, data).then(res => res.data),

    ChangePassword: (data: any) =>
        apiPrivate.post(`/v1/password/change`, data).then(res => res.data),

    DashboardStats: () =>
        apiPrivate.get(`/v1/dashboard-stats`).then(res => res.data),
};
