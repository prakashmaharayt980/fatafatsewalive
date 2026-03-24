'use client'

import React, { useState } from 'react';
import { User, ShoppingCart, Heart, ChevronDown, LayoutDashboard, Package, LogOut, User2Icon } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { useAuthStore } from '../context/AuthContext';
import { useCartStore } from '../context/CartContext';
import { useShallow } from 'zustand/react/shallow';

export default function HeaderActionsClient() {
    const { cartItems, setIsCartOpen, setIsWishlistOpen } = useCartStore(useShallow(
        state => ({ cartItems: state.cartItems, setIsCartOpen: state.setIsCartOpen, setIsWishlistOpen: state.setIsWishlistOpen })
    ));
    const { user, isLoggedIn, logout, setloginDailogOpen } = useAuthStore(useShallow(state => ({
        user: state.user,
        isLoggedIn: state.isLoggedIn,
        logout: state.logout,
        setloginDailogOpen: state.setloginDailogOpen
    })));

    const [showAccountMenu, setShowAccountMenu] = useState(false);
    const badgeCount = cartItems?.items?.length || 0;

    const handleLogout = () => {
        logout();
        setShowAccountMenu(false);
    };

    return (
        <div className="flex items-center space-x-2 sm:space-x-3">
            {isLoggedIn ? (
                <>
                    <div className="relative">
                        <button
                            onClick={() => setShowAccountMenu(!showAccountMenu)}
                            aria-label="Account menu"
                            className="hidden sm:flex items-center space-x-1 p-1.5 rounded-full border border-gray-300 text-slate-700 hover:text-[var(--colour-fsP2)] hover:border-[var(--colour-fsP2)] hover:bg-blue-50 transition-all"
                        >
                            <User className="h-4 w-4" strokeWidth={2.5} />
                            <ChevronDown className="h-3 w-3" strokeWidth={2.5} />
                        </button>

                        {showAccountMenu && (
                            <div className="absolute right-0 top-full mt-2 w-60 bg-white border border-gray-200 rounded-lg shadow-lg z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                                <div className="px-4 py-3 border-b border-gray-100">
                                    <p className="text-sm font-semibold text-gray-900 truncate">{user?.name || 'User'}</p>
                                    <p className="text-xs text-gray-500 truncate mt-0.5">{user?.email || 'email@example.com'}</p>
                                </div>
                                <div className="py-1">
                                    {[
                                        { href: '/profile?tab=overview', icon: LayoutDashboard, label: 'Dashboard' },
                                        { href: '/profile?tab=orders', icon: Package, label: 'My Orders' },
                                    ].map((item) => (
                                        <Link
                                            key={item.href}
                                            href={item.href}
                                            className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-colors"
                                        >
                                            <item.icon className="w-4 h-4 text-gray-500" />
                                            {item.label}
                                        </Link>
                                    ))}
                                    <div className="h-px bg-gray-100 my-1" />
                                    <button
                                        onClick={handleLogout}
                                        className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors text-left"
                                    >
                                        <LogOut className="w-4 h-4" />
                                        Logout
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    <button
                        onClick={() => setIsCartOpen(true)}
                        aria-label="Open cart"
                        className="relative p-1.5 rounded-full border border-gray-300 text-slate-700 hover:text-[var(--colour-fsP2)] hover:border-[var(--colour-fsP2)] hover:bg-blue-50 transition-all"
                    >
                        <ShoppingCart className="h-4 w-4" strokeWidth={2.5} />
                        {badgeCount > 0 && (
                            <span className="absolute -top-1 -right-1 bg-[var(--colour-fsP1)] text-white text-[10px] font-bold rounded-full h-4 w-4 flex items-center justify-center">
                                {badgeCount}
                            </span>
                        )}
                    </button>

                    <button
                        onClick={() => setIsWishlistOpen(true)}
                        aria-label="Open wishlist"
                        className="relative p-1.5 rounded-full border border-gray-300 text-slate-700 hover:text-[var(--colour-fsP2)] hover:border-[var(--colour-fsP2)] hover:bg-blue-50 transition-all"
                    >
                        <Heart className="h-4 w-4" strokeWidth={2.5} />
                    </button>
                </>
            ) : (
                <button
                    onClick={() => setloginDailogOpen(true)}
                    className="px-5 py-2 bg-[var(--colour-fsP2)] hover:opacity-90 text-white rounded-full transition-all duration-300 shadow-md hover:shadow-lg flex items-center gap-2 font-medium"
                >
                    <span>Sign In</span>
                    <div className="bg-white/20 p-1 rounded-full">
                        <User2Icon className="w-4 h-4 text-white" />
                    </div>
                </button>
            )}
        </div>
    );
}
