'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import LoginAlertDialog from '@/components/auth/LoginAlertDialog';
import { deleteCookie, setCookie, getCookie } from 'cookies-next';
import RemoteServices from '../api/remoteservice';

interface User {
    id: string;
    name: string;
    email: string;
    address: string;
    phone: string;
    avatar_image?: {
        thumb: string;
        full: string;
    };
}

interface AuthState {
    user: User | null;
    access_token: string | null;
    refresh_token: string | null;
}

interface AuthContextType {
    authState: AuthState;
    login: (data: AuthState) => void;
    logout: () => void;
    loginDailogOpen: boolean;
    setloginDailogOpen: React.Dispatch<React.SetStateAction<boolean>>;
    showLoginAlert: boolean;
    setShowLoginAlert: React.Dispatch<React.SetStateAction<boolean>>;
    triggerLoginAlert: () => void;
    isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const router = useRouter();
    const [loginDailogOpen, setloginDailogOpen] = useState(false);
    const [showLoginAlert, setShowLoginAlert] = useState(false);
    const [authState, setAuthState] = useState<AuthState>({
        user: null,
        access_token: null,
        refresh_token: null,
    });
    const [isInitialized, setIsInitialized] = useState(false);

    // Initialize Auth State based on Cookies (Source of Truth)
    useEffect(() => {
        const initializeAuth = async () => {
            const token = getCookie('access_token');
            const storedAuth = localStorage.getItem('auth_data');

            if (!token) {
                // Scenario A: No Cookie -> Clear everything (Logout)
                if (storedAuth) {
                    localStorage.removeItem('auth_data');
                }
                setAuthState({ user: null, access_token: null, refresh_token: null });
            } else {
                // Scenario B: Cookie Exists
                if (storedAuth) {
                    // Fast path: Load from LocalStorage
                    try {
                        const parsedAuth = JSON.parse(storedAuth);
                        setAuthState(parsedAuth);
                    } catch (e) {
                        console.error("Failed to parse auth data", e);
                        // Fallback to API if LS is corrupt
                        await restoreSessionFromApi(token as string);
                    }
                } else {
                    // Scenario C: Cookie Exists but LS empty -> Fetch Profile
                    await restoreSessionFromApi(token as string);
                }
            }
            setIsInitialized(true);
        };

        initializeAuth();
    }, []);

    const restoreSessionFromApi = async (token: string) => {
        try {
            // Assume RemoteServices.ProfileView uses the cookie automatically via axios interceptor
            const response = await RemoteServices.ProfileView();
            // Map API response to AuthState structure if necessary
            // The API response structure for ProfileView needs to be confirmed. 
            // Assuming it returns User object.
            // We might need to construct a partial AuthState since we don't have refresh token here strictly speaking, 
            // unless we grab it from cookie too (but httponly check?).
            // For now, let's use what we have or just user data.

            // If ProfileView returns { status: 200, data: User } or just User. 
            // Looking at remoteservice.ts: ProfileView: () => apiPrivate.get(`/user`).then(res => res.data),

            const user = response.data || response;

            const newAuthState = {
                user: user,
                access_token: token,
                refresh_token: getCookie('refresh_token') as string || null
            };

            setAuthState(newAuthState);
            localStorage.setItem('auth_data', JSON.stringify(newAuthState));

        } catch (error) {
            console.error("Failed to restore session from API", error);
            // If API fails (e.g. 401), logout
            logout();
        }
    };

    const login = (data: AuthState) => {
        setAuthState(data);
        localStorage.setItem('auth_data', JSON.stringify(data));
        if (data.access_token) {
            setCookie('access_token', data.access_token);
        }
        setloginDailogOpen(false); // Close dialog on login
        setShowLoginAlert(false); // Close alert if open
        toast.success("Logged in successfully");
    };

    const logout = () => {
        setAuthState({ user: null, access_token: null, refresh_token: null });
        localStorage.removeItem('auth_data');
        deleteCookie('access_token');
        router.push('/');
        toast.info("Logged out");
    };

    const triggerLoginAlert = () => {
        setShowLoginAlert(true);
    };

    return (
        <AuthContext.Provider value={{
            authState,
            login,
            logout,
            loginDailogOpen,
            setloginDailogOpen,
            showLoginAlert,
            setShowLoginAlert,
            triggerLoginAlert,
            isLoading: !isInitialized
        }}>
            {children}
            <LoginAlertDialog />
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
