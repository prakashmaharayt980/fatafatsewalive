import { cookies } from 'next/headers';
import { cache } from 'react'; // For per-request caching
import { unstable_cache } from 'next/cache'; // For shared server caching

import { AuthService, CategoryService, ProfileService } from '@/app/api/services';


export interface navitems {
    id: number;
    slug: string;
    title: string;
    image?: string;
    description?: string;
    featured?: number;
    status?: number;
    order?: number;
    parent_id?: number | null;
    children?: navitems[]
}



const getCachedNavbar = unstable_cache(
    async () => {
        try {

            const response: navitems[] = await CategoryService.getAllCategories().then(res => res.data)

            return response;
        } catch (error) {
            console.error("Error fetching navbar items:", error);
            return [];
        }
    },
    ['navbar-items'], // Cache Key
    {
        revalidate: 3600, // Cache lifetime in seconds (1 hour)
        tags: ['navbar']  // Tag for manual invalidation if needed
    }
);



/**
 * 3. MAIN DATA LOADER
 * Orchestrates the fetching.
 */

const getUser = unstable_cache(
    async () => {
        try {
            return await ProfileService.ProfileView().then(res => res.data)
        } catch (error) {
            return null;
        }
    },
    ['user'],
    {
        revalidate: 3600,
        tags: ['user']
    }
)
export async function getGlobalData() {
    const cookieStore = await cookies();
    const token = cookieStore.get('access_token')?.value;


    // Start fetching Navbar (Hit Cache or API)
    const navItemsPromise = getCachedNavbar();
    const userPromise = getUser();
    if (!token) {
        return {
            isLoggedIn: false,
            accessToken: null,
            user: null,
            navItems: await navItemsPromise,
        };
    }

    // Returning a minimal user object or null if we don't want to fetch profile here yet.
    // Ideally we'd verify the token or fetch the user, but for CLS prevention, 
    // just knowing we have a token is often enough to show "Profile" formatted header.
    // For now, we return minimal data to satisfy the AuthContext initial state if needed.
    return {
        isLoggedIn: true,
        accessToken: token,
        user: await userPromise,
        navItems: await navItemsPromise,
    };
}


