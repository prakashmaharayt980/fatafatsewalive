'use client';

import { useUserActivity } from '@/hooks/useUserActivity';

export default function UserActivityTracker() {
    useUserActivity();
    return null; // Headless component
}
