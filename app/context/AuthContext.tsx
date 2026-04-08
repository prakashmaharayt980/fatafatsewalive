'use client';

import React from 'react';
import { toast } from 'sonner';
import { deleteCookie, setCookie } from 'cookies-next';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
  id: string;
  email: string;
  name: string;
  address: string;
  phone: string;
  avatar_image?: { thumb: string; full: string };
}

interface AuthState {
  user: User | null;
  isLoggedIn: boolean;
  loginDialogOpen: boolean;
  showLoginAlert: boolean;
  isLoading: boolean;
  hasHydrated: boolean;
}

interface AuthActions {
  login: (token: string, user: User) => void;
  logout: () => void;
  syncSession: (session: { user: User; access_token: string }) => void;
  triggerLoginAlert: () => void;
  setLoginDialogOpen: (open: boolean) => void;
  setShowLoginAlert: (show: boolean) => void;
  setHasHydrated: (state: boolean) => void;
}

export const useAuthStore = create<AuthState & AuthActions>()(
  persist(
    (set, get) => ({
      user: null,
      isLoggedIn: false,
      loginDialogOpen: false,
      showLoginAlert: false,
      isLoading: false,
      hasHydrated: false,

      login: (token, userData) => {
        if (get().isLoggedIn) return;

        setCookie('access_token', token, {
          maxAge: 60 * 60 * 24 * 7,
        });

        set({
          user: userData,
          isLoggedIn: true,
        });
      },

      logout: () => {
        deleteCookie('access_token');
        deleteCookie('refresh_token');

        try {
          const { useCartStore } = require('./CartContext');
          useCartStore.getState().clearGuestData();
        } catch (e) {
          console.error('Failed to clear cart data on logout', e);
        }

        set({ user: null, isLoggedIn: false });

        toast.info('Logged out');

        if (typeof window !== 'undefined' && window.location.pathname === '/profile') {
          window.location.href = '/';
        }
      },

      syncSession: (session) => {
        const current = get().user;
        if (current?.id === session.user.id) return;

        set({
          user: session.user,
          isLoggedIn: true,
        });
      },

      triggerLoginAlert: () => {
        set({ showLoginAlert: true });
        setTimeout(() => set({ showLoginAlert: false }), 3000);
      },

      setLoginDialogOpen: (open) => set({ loginDialogOpen: open }),
      setShowLoginAlert: (show) => set({ showLoginAlert: show }),
      setHasHydrated: (state) => set({ hasHydrated: state }),
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        isLoggedIn: state.isLoggedIn,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);