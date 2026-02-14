'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { deleteCookie, setCookie } from 'cookies-next';

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
}

interface AuthContextType extends AuthState {
    login: (token: string, user: User) => void;
    triggerLoginAlert: () => void;
    logout: () => void;
    authState: AuthState;
    loginDailogOpen: boolean;
    setloginDailogOpen: React.Dispatch<React.SetStateAction<boolean>>;
    showLoginAlert: boolean;
    setShowLoginAlert: React.Dispatch<React.SetStateAction<boolean>>;
    isLoading: boolean;
    syncSession: (session: { user: User; access_token: string; refresh_token?: string | null }) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({
    children,
    initialState
}: {
    children: React.ReactNode,
    initialState?: AuthState & { accessToken?: string }
}) => {
    const router = useRouter();

    // Initialize with server state if provided
    const [authState, setAuthState] = useState<AuthState>(() => {
        if (initialState) {
            return {
                user: initialState.user,
                isLoggedIn: initialState.isLoggedIn
            };
        }
        return {
            user: null,
            isLoggedIn: false
        };
    });

    const [loginDailogOpen, setloginDailogOpen] = useState(false);
    const [showLoginAlert, setShowLoginAlert] = useState(false);
    const [isLoading, setIsLoading] = useState(false); // Added for Header compatibility

    const login = useCallback((token: string, userData: User) => {
        setCookie('access_token', token, { maxAge: 60 * 60 * 24 * 7 });
        setAuthState({ user: userData, isLoggedIn: true });
        toast.success("Successfully logged in");
        router.refresh();
    }, [router]);

    const logout = useCallback(() => {
        deleteCookie('access_token');
        deleteCookie('refresh_token');
        setAuthState({ user: null, isLoggedIn: false });
        toast.info("Logged out");
        router.refresh();
    }, [router]);

    const triggerLoginAlert = useCallback(() => {
        setShowLoginAlert(true);
        setTimeout(() => setShowLoginAlert(false), 3000);
    }, []);

    const syncSession = useCallback((session: { user: User; access_token: string; refresh_token?: string | null }) => {
        // This can be used to update the context from a client component that receives props
        setAuthState({
            user: session.user,
            isLoggedIn: true
        });
    }, []);

    return (
        <AuthContext.Provider value={{
            ...authState,
            login,
            logout,
            loginDailogOpen,
            setloginDailogOpen,
            showLoginAlert,
            setShowLoginAlert,
            isLoading,
            syncSession,
            triggerLoginAlert,
            authState
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuth must be used within an AuthProvider');
    return context;
};