'use client';

import { useState, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';

export type ProfileTab =
    | 'user-info'
    | 'orders'
    | 'emi'
    | 'pre-orders'
    | 'addresses'
    | 'return-cancel'
    | 'identity'
    | 'tracking'
    | 'exchange'
    | 'repair'
    | 'security'
    | 'notifications';

export interface ProfileState {
    activeTab: ProfileTab;
    isLoading: boolean;
    error: string | null;
    searchQuery: string;
}

export function useProfileState() {
    const searchParams = useSearchParams();
    const router = useRouter();

    const currentTab = (searchParams.get('tab') as ProfileTab) ?? 'user-info';

    const [state, setState] = useState<ProfileState>({
        activeTab: currentTab,
        isLoading: false,
        error: null,
        searchQuery: '',
    });

    const updateState = useCallback((updates: Partial<ProfileState>) => {
        setState(prev => ({ ...prev, ...updates }));
    }, []);

    const setTab = useCallback((tab: ProfileTab) => {
        updateState({ activeTab: tab });
        router.push(`/profile?tab=${tab}`);
    }, [router, updateState]);

    return {
        state,
        updateState,
        setTab,
        currentTab,
    };
}
