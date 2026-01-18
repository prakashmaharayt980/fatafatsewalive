import React from 'react';
import Link from 'next/link';

const FloatingNav = () => {
    return (
        <nav className="fixed top-5 left-1/2 transform -translate-x-1/2 z-50">
            <div className="bg-white/70 backdrop-blur-md border border-white/20 shadow-lg rounded-full px-8 py-3 flex items-center space-x-8 transition-all hover:-translate-y-1 duration-300">
                <Link href="/" className="font-bold text-gray-800 hover:text-blue-600 transition-colors">
                    Home
                </Link>
                <Link href="/blog" className="font-medium text-gray-600 hover:text-blue-600 transition-colors">
                    News
                </Link>
                <Link href="/reviews" className="font-medium text-gray-600 hover:text-blue-600 transition-colors">
                    Reviews
                </Link>
                <Link href="/deals" className="font-medium text-gray-600 hover:text-blue-600 transition-colors">
                    Deals
                </Link>
                <div className="h-4 w-px bg-gray-300 mx-2"></div>
                <button className="text-sm font-semibold text-blue-600 hover:text-blue-700 transition-colors">
                    Subscribe
                </button>
            </div>
        </nav>
    );
};

export default FloatingNav;
