import { cookies } from 'next/headers';
import { cache } from 'react'; // For per-request caching
import { unstable_cache } from 'next/cache'; // For shared server caching
import { getAllCategories } from '../api/services/category.service';
import type { NavbarItem } from './navbar.interface';

export type { NavbarItem };

const getCachedNavbar = unstable_cache(
    () => {
        return getAllCategories()
            .then(res => res.data as NavbarItem[])
            .catch(error => {
                console.error("Error fetching navbar items:", error);
                return [];
            });
    },
    ['navbar-items'], // Cache Key
    {
        revalidate: 3600, // Cache lifetime in seconds (1 hour)
        tags: ['navbar']  // Tag for manual invalidation if needed
    }
);




export async function getGlobalData() {
    const cookieStore = await cookies();
    const token = cookieStore.get('access_token')?.value;


    // Start fetching Navbar (Hit Cache or API)
    const navItemsPromise = getCachedNavbar();
    if (!token) {
        return {
            isLoggedIn: false,
            accessToken: null,
            navItems: await navItemsPromise,
        };
    }

    // TTFB OPTIMIZATION:
    // We intentionally DO NOT wait for the user profile API (userPromise) to resolve here.
    // Fetching the user on the server blocks the initial HTML response (TTFB), causing delays.
    // We return the token, and let the Client-side AuthContext silently fetch the user data in the background.
    return {
        isLoggedIn: true,
        accessToken: token,
        user: null,
        navItems: await navItemsPromise,
    };
}
