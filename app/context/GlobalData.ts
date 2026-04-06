import { cookies } from 'next/headers';
import { getCachedAllCategories } from '../api/utils/categoryCache';
import type { NavbarItem } from './navbar.interface';

export type { NavbarItem };

export async function getNavbarData(): Promise<NavbarItem[]> {
    try {
        const res = await getCachedAllCategories();
        return res.data as NavbarItem[];
    } catch (error) {
        console.error("Error fetching navbar items:", error);
        return [];
    }
}

export async function getGlobalData() {
    const navItemsPromise = getNavbarData();

    const cookieStore = await cookies();
    const token = cookieStore.get('access_token')?.value;

    if (!token) {
        return {
            isLoggedIn: false,
            accessToken: null,
            navItems: await navItemsPromise,
        };
    }

    return {
        isLoggedIn: true,
        accessToken: token,
        user: null,
        navItems: await navItemsPromise,
    };
}
