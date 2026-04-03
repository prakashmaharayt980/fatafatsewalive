'use client';

import React, { useEffect, useState, useSyncExternalStore } from 'react';
import {
    User, MapPin, Bell, LogOut, ShieldCheck,
    Truck, CreditCard, Layers, ShoppingBag, Undo2, ChevronRight, Menu, X,
    Shield, Wrench, ArrowLeftRight
} from 'lucide-react';
import { useAuthStore } from '../context/AuthContext';
import { useShallow } from 'zustand/react/shallow';
import { useRouter } from 'next/navigation';

import ProfileContent from './Profile';
import OrderHistory from './OrderHistory';
import AddressBook from './AddressBook';
import ReturnCancel from './ReturnCancel';
import IdentityVerification from './IdentityVerification';
import OrderTracking from './OrderTracking';
import PreOrdersSection from './orders/PreOrdersSection';
import EmiSection from './orders/EmiSection';
import ChangePassword from './ChangePassword';
import Notifications from './Notifications';
import RepairSection from './RepairSection';

import { useProfileState } from './hooks/useProfileState';
import type { ProfileTab } from './hooks/useProfileState';

const NAV = [
    { id: 'user-info', label: 'My Profile', icon: User },
    { id: 'orders', label: 'Normal Orders', icon: ShoppingBag },
    { id: 'emi', label: 'EMI Orders', icon: CreditCard },
    { id: 'pre-orders', label: 'Pre-orders', icon: Layers },
    { id: 'addresses', label: 'Address Book', icon: MapPin },
    { id: 'return-cancel', label: 'Return & Cancel', icon: Undo2 },
    { id: 'identity', label: 'Identity Verification', icon: ShieldCheck },
    { id: 'tracking', label: 'Track Order', icon: Truck },
    { id: 'exchange', label: 'Exchange', icon: ArrowLeftRight },
    { id: 'repair', label: 'Repair', icon: Wrench },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'notifications', label: 'Notifications', icon: Bell },
] as const;

const emptySubscribe = () => () => { };

function FullHeightLoader() {
    return (
        <div className="min-h-screen bg-slate-100">
            <div className="mx-auto flex min-h-screen max-w-7xl items-center justify-center px-4">
                <div className="flex min-h-[420px] w-full items-center justify-center rounded-2xl border border-slate-200 bg-white">
                    <div className="flex flex-col items-center gap-4 text-center">
                        <div className="h-10 w-10 animate-spin rounded-full border-2 border-slate-200 border-t-(--colour-fsP2)" />
                        <div className="space-y-1">
                            <p className="text-sm font-black text-slate-900">Loading profile page</p>
                            <p className="text-xs font-semibold text-slate-500">Preparing your account dashboard.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function ComingSoon({ label, icon }: { label: string; icon: React.ReactNode }) {
    return (
        <div className="flex flex-col items-center justify-center py-20 gap-3 text-center">
            <div className="p-4 border border-gray-200 rounded-xl bg-gray-50 text-(--colour-fsP2)">{icon}</div>
            <p className="text-sm font-bold text-slate-900">{label} — Coming Soon</p>
            <p className="text-xs text-slate-500">This section is under development.</p>
        </div>
    );
}

function ProfilePageContent() {
    const { logout, user, isLoggedIn } = useAuthStore(useShallow(state => ({
        logout: state.logout,
        user: state.user,
        isLoggedIn: state.isLoggedIn,
    })));

    const router = useRouter();
    const { currentTab, setTab } = useProfileState();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const hydrated = useSyncExternalStore(emptySubscribe, () => true, () => false);

    useEffect(() => { if (hydrated && !isLoggedIn) router.push('/login'); }, [hydrated, isLoggedIn, router]);

    const renderContent = () => {
        switch (currentTab) {
            case 'orders': return <OrderHistory />;
            case 'emi': return <EmiSection />;
            case 'pre-orders': return <PreOrdersSection />;
            case 'addresses': return <AddressBook />;
            case 'return-cancel': return <ReturnCancel />;
            case 'identity': return <IdentityVerification />;
            case 'tracking': return <OrderTracking />;
            case 'exchange': return <ComingSoon label="Exchange" icon={<ArrowLeftRight size={18} />} />;
            case 'repair': return <RepairSection />;
            case 'security': return <ChangePassword />;
            case 'notifications': return <Notifications />;
            default: return <ProfileContent />;
        }
    };

    const activeItem = NAV.find(n => n.id === currentTab) ?? NAV[0];
    const ActiveIcon = activeItem.icon;

    if (!hydrated) return <FullHeightLoader />;

    return (
        <div className="min-h-screen bg-slate-100">
            <div className="max-w-7xl mx-auto px-4 py-8 pb-20">
                <div className="flex flex-col lg:flex-row gap-5">

                    {/* Sidebar */}
                    <aside className={`
                        lg:w-64 shrink-0 bg-white rounded-xl border border-slate-200 overflow-hidden lg:sticky lg:top-24 h-fit
                        ${isSidebarOpen ? 'fixed inset-4 z-50 lg:relative lg:inset-auto' : 'hidden lg:block'}
                    `}>
                        {isSidebarOpen && (
                            <div className="lg:hidden flex justify-end p-3 border-b border-slate-100">
                                <button onClick={() => setIsSidebarOpen(false)} className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 text-slate-600">
                                    <X size={16} />
                                </button>
                            </div>
                        )}

                        {/* User Info */}
                        <div className="px-4 py-4 border-b border-slate-100 bg-slate-50">
                            <p className="text-[10px] font-bold text-(--colour-fsP2) uppercase tracking-widest mb-1">Signed in as</p>
                            <p className="text-sm font-bold text-slate-900 truncate">{user?.name ?? 'Member'}</p>
                            <p className="text-xs font-semibold text-slate-500 truncate">{user?.email}</p>
                        </div>

                        {/* Navigation */}
                        <nav className="p-2 space-y-0.5 max-h-[80vh] overflow-y-auto">
                            {NAV.map(item => {
                                const active = currentTab === item.id;
                                const Icon = item.icon;
                                return (
                                    <button
                                        key={item.id}
                                        onClick={() => { setTab(item.id as ProfileTab); setIsSidebarOpen(false); }}
                                        className={`
                                            w-full flex items-center justify-between gap-3 px-3 py-2.5 rounded-lg text-xs font-bold transition-colors
                                            ${active
                                                ? 'bg-(--colour-fsP2) text-white'
                                                : 'text-slate-700 hover:bg-slate-50 hover:text-(--colour-fsP2)'}
                                        `}
                                    >
                                        <div className="flex items-center gap-2.5">
                                            <Icon size={14} strokeWidth={2} />
                                            {item.label}
                                        </div>
                                        {active && <ChevronRight size={12} strokeWidth={2.5} />}
                                    </button>
                                );
                            })}
                        </nav>

                        <div className="p-2 border-t border-slate-100">
                            <button
                                onClick={() => { logout(); router.push('/'); }}
                                className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-xs font-bold text-rose-500 hover:bg-rose-50 transition-colors"
                            >
                                <LogOut size={14} strokeWidth={2} />
                                Sign Out
                            </button>
                        </div>
                    </aside>

                    {/* Main Content */}
                    <main className="flex-1 min-w-0">
                        {/* Mobile header */}
                        <div className="lg:hidden flex items-center justify-between px-4 py-3 bg-white rounded-xl border border-slate-200 mb-4">
                            <div className="flex items-center gap-2.5">
                                <ActiveIcon size={15} className="text-(--colour-fsP2)" />
                                <span className="text-xs font-bold text-slate-800">
                                    {NAV.find(n => n.id === currentTab)?.label ?? 'Dashboard'}
                                </span>
                            </div>
                            <button
                                onClick={() => setIsSidebarOpen(true)}
                                className="flex items-center gap-1.5 px-3 py-1.5 bg-(--colour-fsP2) text-white text-xs font-bold rounded-lg"
                            >
                                <Menu size={13} /> Menu
                            </button>
                        </div>

                        <div className="bg-white border border-slate-200 rounded-xl p-5 md:p-7 min-h-[600px]">
                            {renderContent()}
                        </div>
                    </main>
                </div>
            </div>
        </div>
    );
}

export default function ProfilePage() {
    return (
        <React.Suspense fallback={
            <FullHeightLoader />
        }>
            <ProfilePageContent />
        </React.Suspense>
    );
}
