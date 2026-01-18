'use client';

import React from 'react';
import { User, MapPin, ShieldCheck, LogOut, Package2, Bell } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';

// Components
import ProfileContent from './Profile';
import OrderHistory from './OrderHistory';
import AddressSelectionUI from '../checkout/AddressSectionUi';
import ChangePassword from './ChangePassword';
import Notifications from './Notifications';

export default function ProfilePage() {
    const { logout, authState } = useAuth();
    const router = useRouter();
    const searchParams = useSearchParams();

    // Default tab
    const currentTab = searchParams.get('tab') || 'user-info';

    const menuItems = [
        { id: 'user-info', label: 'User Info', icon: User },
        { id: 'orders', label: 'My Orders', icon: Package2 },
        { id: 'notifications', label: 'Notifications', icon: Bell },
        { id: 'addresses', label: 'Addresses', icon: MapPin },
        { id: 'auth', label: 'Security', icon: ShieldCheck },
    ];

    const handleLogout = () => {
        logout();
        router.push('/');
    };

    const renderContent = () => {
        switch (currentTab) {
            case 'orders':
                return <OrderHistory />;
            case 'notifications':
                return <Notifications />;
            case 'addresses':
                return (
                    <div className="space-y-4 sm:space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                        <div className="border-b border-slate-100 pb-4">
                            <h2 className="text-xl font-bold text-slate-800">Address Book</h2>
                            <p className="text-slate-500 text-sm mt-1">Manage your shipping addresses for faster checkout.</p>
                        </div>
                        <AddressSelectionUI mode="management" />
                    </div>
                );
            case 'auth':
                return <ChangePassword />;
            case 'user-info':
            default:
                return <ProfileContent />;
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 py-6 sm:py-10">
            <div className="container mx-auto px-3 sm:px-4 max-w-7xl">

                {/* Header Welcome */}
                <div className="mb-4 sm:mb-6">
                    <h1 className="text-xl sm:text-2xl font-bold text-slate-800">My Account</h1>
                    <p className="text-xs sm:text-sm text-slate-500">Manage your profile and preferences.</p>
                </div>

                <div className="flex flex-col lg:flex-row gap-4 sm:gap-6">
                    {/* Mobile Navigation (Horizontal Scroll) */}
                    <div className="lg:hidden -mx-3 px-3 overflow-x-auto no-scrollbar">
                        <div className="flex space-x-2 pb-2">
                            {menuItems.map(item => (
                                <Link
                                    key={item.id}
                                    href={`/profile?tab=${item.id}`}
                                    className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-medium whitespace-nowrap border transition-all ${currentTab === item.id
                                        ? 'bg-slate-800 text-white border-slate-800 shadow-sm'
                                        : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                                        }`}
                                >
                                    <item.icon className="w-3.5 h-3.5" />
                                    {item.label}
                                </Link>
                            ))}
                            <button
                                onClick={handleLogout}
                                className="flex-shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-medium whitespace-nowrap border border-red-200 bg-red-50 text-red-600 hover:bg-red-100 transition-all"
                            >
                                <LogOut className="w-3.5 h-3.5" />
                                Sign Out
                            </button>
                        </div>
                    </div>

                    {/* Sidebar (Desktop Only) */}
                    <aside className="hidden lg:block w-60 flex-shrink-0">
                        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden sticky top-24 shadow-sm">

                            {/* User Profile Summary */}
                            <div className="p-5 border-b border-slate-100 flex flex-col items-center text-center bg-gradient-to-b from-slate-50 to-white">
                                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 p-0.5 mb-3 relative overflow-hidden shadow-lg">
                                    <div className="w-full h-full rounded-full bg-white flex items-center justify-center text-blue-600 text-lg font-bold">
                                        {authState.user?.avatar_image?.thumb ? (
                                            <Image src={authState.user.avatar_image.thumb} alt="Profile" width={64} height={64} className="w-full h-full object-cover rounded-full" />
                                        ) : (
                                            authState.user?.name?.substring(0, 2).toUpperCase() || <User size={24} />
                                        )}
                                    </div>
                                </div>
                                <h3 className="font-semibold text-slate-800 text-sm truncate w-full">{authState.user?.name || 'Guest User'}</h3>
                                <p className="text-xs text-slate-400 truncate w-full">{authState.user?.email}</p>
                            </div>

                            {/* Navigation */}
                            <nav className="p-2 space-y-0.5">
                                {menuItems.map(item => (
                                    <Link
                                        key={item.id}
                                        href={`/profile?tab=${item.id}`}
                                        className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${currentTab === item.id
                                            ? 'bg-slate-100 text-slate-800'
                                            : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'
                                            }`}
                                    >
                                        <item.icon className={`w-4 h-4 ${currentTab === item.id ? 'text-blue-600' : 'text-slate-400'}`} />
                                        {item.label}
                                    </Link>
                                ))}

                                <div className="pt-2 mt-2 border-t border-slate-100">
                                    <button
                                        onClick={handleLogout}
                                        className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 text-left transition-colors"
                                    >
                                        <LogOut className="w-4 h-4" />
                                        Sign Out
                                    </button>
                                </div>
                            </nav>
                        </div>
                    </aside>

                    {/* Main Content */}
                    <main className="flex-1 min-w-0">
                        <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-6 min-h-[400px] shadow-sm">
                            {renderContent()}
                        </div>
                    </main>
                </div>
            </div>
        </div>
    );
}