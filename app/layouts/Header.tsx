import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import imglogo from '@/app/assets/CompanyLogo.webp';
import dynamic from 'next/dynamic';
import { cookies } from 'next/headers';
import type { NavbarItem } from '../context/navbar.interface';

const NavBar = dynamic(() => import('./NavBar'), { ssr: true });
const SearchBarClient = dynamic(() => import('./SearchBarClient'), { ssr: true });
const HeaderActionsClient = dynamic(() => import('./HeaderActionsClient'), { ssr: true });
const MobileNavClient = dynamic(() => import('./MobileNavClient'), { ssr: true });

interface HeaderProps {
    initialNavItems: NavbarItem[];
}

export default async function Header({ initialNavItems }: HeaderProps) {
    const cookieStore = await cookies();
    const isLoggedIn = cookieStore.has('access_token');

    return (
        <header className="sticky top-0 z-40 w-full bg-white shadow-sm">
            <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-6">
                <div className="flex items-center justify-between h-14 sm:h-16 lg:h-18">
                    <Link href="/" className="flex items-center space-x-2 cursor-pointer shrink-0">
                        <Image
                            src={imglogo}
                            alt="Fatafatsewa Logo"
                            width={120}
                            height={30}
                            priority
                            sizes="120px"
                            style={{ height: 'auto' }}
                            className="rounded-lg h-7 sm:h-8 lg:h-9 transition-transform duration-200 hover:scale-105"
                        />
                    </Link>

                    {/* Desktop Search Island */}
                    <SearchBarClient />

                    <div className="flex items-center space-x-2 sm:space-x-3">
                        {/* Auth & Cart Island */}
                        <HeaderActionsClient initialIsLoggedIn={isLoggedIn} />

                        {/* Mobile Nav & Sheet Island */}
                        <MobileNavClient initialNavItems={initialNavItems} />
                    </div>
                </div>
            </div>

            {/* NavBar is already a client component, but it's part of the header structure */}
            <NavBar navbaritems={initialNavItems} />
        </header>
    );
}
