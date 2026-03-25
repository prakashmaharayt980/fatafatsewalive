'use client';

import React, { useEffect, useMemo, useCallback } from 'react';
import { toast } from 'sonner';
import { deleteCookie, setCookie } from 'cookies-next';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import { useRouter } from 'next/navigation';


interface User {
    id: string;
    email: string;
    name: string;
    address: string;
    phone: string;
    avatar_image?: { thumb: string; full: string; };
}

interface AuthState {
    user: User | null;
    isLoggedIn: boolean;
    loginDailogOpen: boolean;
    showLoginAlert: boolean;
    isLoading: boolean;
}

interface AuthActions {
    login: (token: string, user: User) => void;
    logout: () => void;
    syncSession: (session: { user: User; access_token: string }) => void;
    triggerLoginAlert: () => void;
    setloginDailogOpen: (open: boolean) => void;
    setShowLoginAlert: (show: boolean) => void;
}

export const useAuthStore = create<AuthState & AuthActions>()(
    persist(
        (set, get) => ({
            // State
            user: null,
            isLoggedIn: false,
            loginDailogOpen: false,
            showLoginAlert: false,
            isLoading: false,

            // Actions
            login: (token, userData) => {
                setCookie('access_token', token, { maxAge: 60 * 60 * 24 * 7 });
                set({ user: userData, isLoggedIn: true });
                toast.success("Successfully logged in");
                // Note: router.refresh() should be handled by the caller or specialized hook if needed
                // For direct store actions, we just update the state
            },

            logout: () => {
                deleteCookie('access_token');
                deleteCookie('refresh_token');
                
                // Clear all session related data from other stores
                try {
                    const { useCartStore } = require('./CartContext');
                    useCartStore.getState().clearGuestData();
                } catch (e) {
                    console.error('Failed to clear cart data on logout', e);
                }

                set({ user: null, isLoggedIn: false });
                toast.info("Logged out");
                
                // Redirect to home and refresh to clear any local component states (like checkout)
                if (typeof window !== 'undefined') {
                    window.location.href = '/';
                }
            },

            syncSession: (session) => {
                set({
                    user: session.user,
                    isLoggedIn: true
                });
            },

            triggerLoginAlert: () => {
                set({ showLoginAlert: true });
                setTimeout(() => set({ showLoginAlert: false }), 3000);
            },

            setloginDailogOpen: (open) => set({ loginDailogOpen: open }),
            setShowLoginAlert: (show) => set({ showLoginAlert: show }),
        }),
        {
            name: 'auth-storage',
            partialize: (state) => ({
                user: state.user,
                isLoggedIn: state.isLoggedIn
            }),
        }
    )
);


export const useAuth = useAuthStore;

export const AuthProvider = ({
    children,
    initialState
}: {
    children: React.ReactNode,
    initialState?: { user: User | null; isLoggedIn: boolean; accessToken?: string }
}) => {
    useEffect(() => {
        if (initialState) {
            useAuthStore.setState({
                user: initialState.user,
                isLoggedIn: initialState.isLoggedIn
            });
        }
    }, [initialState]);

    return <>{children}</>;
};



