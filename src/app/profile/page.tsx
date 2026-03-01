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

// Wrapped component that uses searchParams
function ProfilePageContent() {
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
        <div className="min-h-screen bg-slate-50 lg:py-4">
            <div className=" mx-auto px-0 sm:px-4 max-w-7xl">

                {/* Header Welcome (Desktop Only) */}
                <div className="mb-5 hidden lg:block px-4 sm:px-0">
                    <h1 className="text-2xl font-bold text-[var(--colour-fsP2)]">My Account</h1>
                    <p className="text-sm text-slate-500  ">Manage your profile and preferences.</p>
                </div>

                <div className="flex flex-col lg:flex-row gap-2">
                    {/* Mobile Profile Header */}
                    <div className="lg:hidden bg-white p-6 pb-8 flex flex-col items-center text-center border-b border-slate-100">
                        <div className="w-24 h-24 rounded-full bg-[var(--colour-fsP2)] p-0.5 mb-4 relative overflow-hidden">
                            <div className="w-full h-full rounded-full bg-white flex items-center justify-center text-[var(--colour-fsP2)] text-3xl font-bold overflow-hidden">
                                {authState.user?.avatar_image?.thumb ? (
                                    <Image src={authState.user.avatar_image.thumb} alt="Profile" width={96} height={96} className="w-full h-full object-cover" />
                                ) : (
                                    authState.user?.name?.substring(0, 2).toUpperCase() || <User size={40} />
                                )}
                            </div>
                        </div>
                        <h2 className="text-2xl font-bold text-slate-800">{authState.user?.name || 'Guest User'}</h2>
                        <p className="text-slate-500 font-medium">{authState.user?.email}</p>
                    </div>

                    {/* Mobile Navigation (Sticky) */}
                    <div className="lg:hidden sticky top-0 z-30 bg-white border-b border-slate-200 py-3 overflow-x-auto scrollbar-hide">
                        <div className="flex px-4 space-x-3 min-w-max">
                            {menuItems.map(item => (
                                <Link
                                    key={item.id}
                                    href={`/profile?tab=${item.id}`}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium ${currentTab === item.id
                                        ? 'bg-[var(--colour-fsP2)] text-white'
                                        : 'bg-white text-slate-600 border border-slate-200'
                                        }`}
                                >
                                    <item.icon className={`w-4 h-4 ${currentTab === item.id ? 'text-white' : 'text-slate-500'}`} />
                                    {item.label}
                                </Link>
                            ))}
                        </div>
                    </div>

                    {/* Sidebar (Desktop Only) */}
                    <aside className="hidden lg:block w-60 flex-shrink-0">
                        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden sticky top-24">

                            {/* User Profile Summary */}
                            <div className="p-5 border-b border-slate-100 flex flex-col items-center text-center bg-gray-50">
                                <div className="w-16 h-16 rounded-full bg-[var(--colour-fsP2)] p-0.5 mb-3 relative overflow-hidden">
                                    <div className="w-full h-full rounded-full bg-white flex items-center justify-center text-[var(--colour-fsP2)] text-lg font-bold">
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
                                        className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium ${currentTab === item.id
                                            ? 'bg-gray-50 text-slate-800'
                                            : 'text-slate-500'
                                            }`}
                                    >
                                        <item.icon className={`w-4 h-4 ${currentTab === item.id ? 'text-[var(--colour-fsP2)]' : 'text-slate-400'}`} />
                                        {item.label}
                                    </Link>
                                ))}

                                <div className="pt-2 mt-2 border-t border-slate-100">
                                    <button
                                        onClick={handleLogout}
                                        className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium text-red-600 text-left"
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
                        <div className="bg-white lg:rounded-xl lg:border lg:border-slate-200 p-2 min-h-[400px]">
                            {renderContent()}

                            {/* Mobile Logout Button (Bottom of Content) */}
                            <div className="lg:hidden mt-8 pt-8 border-t border-slate-100">
                                <button
                                    onClick={handleLogout}
                                    className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-red-50 text-red-600 font-medium"
                                >
                                    <LogOut className="w-5 h-5" />
                                    Sign Out
                                </button>
                            </div>
                        </div>
                    </main>
                </div>
            </div>
        </div>
    );
}

export default function ProfilePage() {
    return (
        <React.Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-slate-50"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--colour-fsP2)]"></div></div>}>
            <ProfilePageContent />
        </React.Suspense>
    );
}