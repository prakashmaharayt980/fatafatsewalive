import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import imglogo from '@/app/assets/CompanyLogo.webp';
import NavBar from './NavBar';
import SearchBarClient from './SearchBarClient';
import HeaderActionsClient from './HeaderActionsClient';
import MobileNavClient from './MobileNavClient';
import type { NavbarItem } from '../context/navbar.interface';

interface HeaderProps {
    initialNavItems: NavbarItem[];
}

export default function Header({ initialNavItems }: HeaderProps) {
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
                        <HeaderActionsClient />

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
