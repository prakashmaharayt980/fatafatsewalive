'use client';

import React, { useState } from 'react';
import type { LucideIcon } from 'lucide-react';
import {
    ArrowRight, Bell, BellRing, CalendarRange, CheckCircle2,
    Clock3, Gift, Megaphone, MessageSquare, Percent, Search,
    Sparkles, Tag, TicketPercent, X,
} from 'lucide-react';
import {
    Dialog, DialogContent, DialogDescription,
    DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';

type FeedType = 'all' | 'offer' | 'discount' | 'event' | 'coupon';

type TypeStyle = {
    border: string; bg: string; iconBorder: string; iconBg: string; iconText: string;
    tagBorder: string; tagBg: string; tagText: string; badgeCls: string;
};

const TYPE_STYLE: Record<Exclude<FeedType, 'all'>, TypeStyle> = {
    offer: {
        border: 'border-orange-200', bg: 'bg-orange-50',
        iconBorder: 'border-orange-200', iconBg: 'bg-orange-50', iconText: 'text-orange-600',
        tagBorder: 'border-orange-200', tagBg: 'bg-white', tagText: 'text-orange-600',
        badgeCls: 'border-orange-200 bg-orange-50 text-orange-600',
    },
    discount: {
        border: 'border-emerald-200', bg: 'bg-emerald-50',
        iconBorder: 'border-emerald-200', iconBg: 'bg-emerald-50', iconText: 'text-emerald-600',
        tagBorder: 'border-emerald-200', tagBg: 'bg-white', tagText: 'text-emerald-600',
        badgeCls: 'border-emerald-200 bg-emerald-50 text-emerald-600',
    },
    event: {
        border: 'border-violet-200', bg: 'bg-violet-50',
        iconBorder: 'border-violet-200', iconBg: 'bg-violet-50', iconText: 'text-violet-600',
        tagBorder: 'border-violet-200', tagBg: 'bg-white', tagText: 'text-violet-600',
        badgeCls: 'border-violet-200 bg-violet-50 text-violet-600',
    },
    coupon: {
        border: 'border-yellow-200', bg: 'bg-yellow-50',
        iconBorder: 'border-yellow-200', iconBg: 'bg-yellow-50', iconText: 'text-yellow-700',
        tagBorder: 'border-yellow-200', tagBg: 'bg-white', tagText: 'text-yellow-700',
        badgeCls: 'border-yellow-200 bg-yellow-50 text-yellow-700',
    },
};

const CHANNEL_STYLE: Record<string, { border: string; bg: string; text: string; iconCls: string }> = {
    'Offer Alerts': { border: 'border-orange-200', bg: 'bg-orange-50', text: 'text-orange-600', iconCls: 'text-orange-500' },
    'Coupon Updates': { border: 'border-yellow-200', bg: 'bg-yellow-50', text: 'text-yellow-700', iconCls: 'text-yellow-600' },
    'Event Notices': { border: 'border-violet-200', bg: 'bg-violet-50', text: 'text-violet-600', iconCls: 'text-violet-500' },
    'Discounts': { border: 'border-emerald-200', bg: 'bg-emerald-50', text: 'text-emerald-600', iconCls: 'text-emerald-500' },
};

interface NotificationItem {
    id: number;
    type: Exclude<FeedType, 'all'>;
    title: string;
    summary: string;
    detail: string;
    highlights: string[];
    time: string;
    tag: string;
    action: string;
    read: boolean;
    icon: LucideIcon;
    validity?: string;
    code?: string;
}

const FILTERS: Array<{ id: FeedType; label: string }> = [
    { id: 'all', label: 'All' },
    { id: 'offer', label: 'Offers' },
    { id: 'discount', label: 'Discounts' },
    { id: 'event', label: 'Events' },
    { id: 'coupon', label: 'Coupons' },
];

const NOTIFICATIONS: NotificationItem[] = [
    {
        id: 1, type: 'offer', read: false,
        title: 'Weekend Apple Offer',
        summary: 'Extra exchange bonus and accessory bundle on selected iPhone and MacBook models this weekend.',
        detail: 'Get special Apple weekend pricing with an exchange top-up and a selected accessory bundle on highlighted models while the campaign is active.',
        highlights: ['Exchange top-up on eligible models', 'Accessory bundle included', 'Limited to campaign stock'],
        time: '10 minutes ago', tag: 'Hot Offer', action: 'See Offer', icon: Sparkles,
        validity: 'Valid until Sunday midnight',
    },
    {
        id: 2, type: 'discount', read: false,
        title: 'Laptop Price Drop',
        summary: 'Gaming and creator laptops just received fresh markdowns for a limited stock window.',
        detail: 'Laptop models across ASUS, Lenovo, and Acer now have lower prices. These discounts are stock-based and may close early when inventory moves.',
        highlights: ['ASUS, Lenovo, Acer models', 'Stock-based — closes when sold out', 'No coupon needed'],
        time: '1 hour ago', tag: 'Price Drop', action: 'View Discount', icon: Percent,
        validity: 'While stock lasts',
    },
    {
        id: 3, type: 'coupon', read: false,
        title: 'Member Coupon Ready',
        summary: 'Your profile has an active coupon for accessories and add-ons during checkout.',
        detail: 'Use your saved member coupon on eligible accessories and daily-use add-ons. Apply it during checkout before the expiry window closes.',
        highlights: ['Apply at checkout', 'Eligible on accessories & add-ons', 'One-time use only'],
        time: 'Today', tag: 'Coupon', action: 'Open Coupon', icon: TicketPercent,
        validity: 'Expires end of week', code: 'MEMBER2026',
    },
    {
        id: 4, type: 'event', read: true,
        title: 'Pre-Order Launch Event',
        summary: 'New launch event updates are live with booking windows, gifts, and first-day availability.',
        detail: 'The latest event includes launch timelines, pre-order opening information, gift bundles, and booking updates for newly announced devices.',
        highlights: ['Launch timelines confirmed', 'Gift bundles for early bookings', 'Pre-order slots open now'],
        time: 'Yesterday', tag: 'Launch Event', action: 'Read Event', icon: CalendarRange,
        validity: 'Event ends in 5 days',
    },
    {
        id: 5, type: 'offer', read: true,
        title: 'EMI Festival Picks',
        summary: 'Selected phones and laptops now have featured EMI plans with lighter upfront payment.',
        detail: 'This campaign highlights EMI-ready devices with easier first payment combinations so you can compare featured products quickly.',
        highlights: ['Lighter first EMI payment', 'Featured phones and laptops', 'Easy approval process'],
        time: '2 days ago', tag: 'EMI Offer', action: 'Explore Picks', icon: Gift,
        validity: 'Valid this week',
    },
    {
        id: 6, type: 'coupon', read: true,
        title: 'Free Delivery Coupon',
        summary: 'A shipping coupon is available for selected areas and eligible cart totals.',
        detail: 'Apply the delivery coupon on supported orders to remove or reduce shipping charges where the campaign is enabled.',
        highlights: ['Supported in selected areas', 'Applies to eligible cart totals', 'Single-use coupon'],
        time: '3 days ago', tag: 'Delivery Coupon', action: 'Use Coupon', icon: Tag,
        validity: 'Expires in 2 days', code: 'FREEDEL26',
    },
];

const CHANNELS = [
    { label: 'Offer Alerts', value: 'Instant', icon: BellRing, desc: 'New deals and campaign launches' },
    { label: 'Coupon Updates', value: 'Active', icon: TicketPercent, desc: 'Coupon availability and expiry' },
    { label: 'Event Notices', value: 'Weekly', icon: Megaphone, desc: 'Launch events and pre-orders' },
    { label: 'Discounts', value: 'On', icon: Percent, desc: 'Price drops on tracked products' },
];

export default function Notifications() {
    const [state, setState] = useState({
        activeFilter: 'all' as FeedType,
        search: '',
        detailOpen: false,
        selectedId: NOTIFICATIONS[0]?.id ?? 0,
    });

    const update = (u: Partial<typeof state>) => setState(p => ({ ...p, ...u }));

    const filtered = NOTIFICATIONS.filter(item => {
        const matchFilter = state.activeFilter === 'all' || item.type === state.activeFilter;
        const q = state.search.trim().toLowerCase();
        const matchSearch = !q || item.title.toLowerCase().includes(q) || item.summary.toLowerCase().includes(q) || item.tag.toLowerCase().includes(q);
        return matchFilter && matchSearch;
    });

    const unreadCount = NOTIFICATIONS.filter(n => !n.read).length;
    const selected = NOTIFICATIONS.find(n => n.id === state.selectedId) ?? NOTIFICATIONS[0];
    const SelIcon = selected.icon;
    const selStyle = TYPE_STYLE[selected.type];

    return (
        <div className="space-y-5">
            {/* Header */}
            <div className="flex items-center gap-2 pb-4 border-b border-gray-100">
                <Bell className="w-4 h-4 text-(--colour-fsP2)" />
                <div>
                    <h2 className="text-lg font-bold text-(--colour-fsP2)">Notifications</h2>
                    <p className="text-xs text-slate-500 mt-0.5">Offers, discounts, coupons, and launch events</p>
                </div>
                {unreadCount > 0 && (
                    <span className="ml-auto text-[10px] font-bold px-2 py-0.5 rounded border border-orange-200 bg-orange-50 text-orange-600 uppercase tracking-widest">
                        {unreadCount} unread
                    </span>
                )}
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                    { label: 'Unread', value: NOTIFICATIONS.filter(n => !n.read).length, cls: 'text-orange-600', iconCls: 'border-orange-200 bg-orange-50 text-orange-500', icon: BellRing },
                    { label: 'Offers', value: NOTIFICATIONS.filter(n => n.type === 'offer').length, cls: 'text-orange-500', iconCls: 'border-orange-200 bg-orange-50 text-orange-500', icon: Sparkles },
                    { label: 'Discounts', value: NOTIFICATIONS.filter(n => n.type === 'discount').length, cls: 'text-emerald-600', iconCls: 'border-emerald-200 bg-emerald-50 text-emerald-500', icon: Percent },
                    { label: 'Coupons', value: NOTIFICATIONS.filter(n => n.type === 'coupon').length, cls: 'text-yellow-700', iconCls: 'border-yellow-200 bg-yellow-50 text-yellow-600', icon: TicketPercent },
                ].map(s => {
                    const Icon = s.icon;
                    return (
                        <div key={s.label} className="p-3 border border-gray-200 rounded-xl bg-gray-50 flex items-center gap-3">
                            <div className={`p-2 rounded-lg border ${s.iconCls}`}>
                                <Icon size={14} />
                            </div>
                            <div>
                                <p className={`text-sm font-bold ${s.cls}`}>{s.value}</p>
                                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{s.label}</p>
                            </div>
                        </div>
                    );
                })}
            </div>


            {/* Search + filter */}
            <div className="space-y-3">
                <label className="flex items-center gap-2.5 h-10 px-3 border border-gray-200 rounded-lg bg-gray-50 focus-within:border-(--colour-fsP2) focus-within:bg-white transition-colors">
                    <Search size={14} className="text-slate-400 shrink-0" />
                    <input
                        type="text"
                        value={state.search}
                        onChange={e => update({ search: e.target.value })}
                        placeholder="Search offers, coupons, events…"
                        className="w-full bg-transparent text-sm font-semibold text-slate-900 outline-none placeholder:text-slate-400"
                    />
                    {state.search && (
                        <button onClick={() => update({ search: '' })} className="text-slate-400 hover:text-slate-600">
                            <X size={13} />
                        </button>
                    )}
                </label>
                <div className="flex flex-wrap gap-2">
                    {FILTERS.map(f => {
                        const active = f.id === state.activeFilter;
                        return (
                            <button key={f.id} type="button" onClick={() => update({ activeFilter: f.id })}
                                className={`h-7 px-3 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-colors border
                                    ${active ? 'bg-(--colour-fsP2) text-white border-(--colour-fsP2)' : 'bg-white text-slate-600 border-gray-200 hover:border-(--colour-fsP2) hover:text-(--colour-fsP2)'}`}>
                                {f.label}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Feed */}
            <div className="space-y-3">
                {filtered.length === 0 ? (
                    <div className="py-16 flex flex-col items-center gap-3 text-center border border-dashed border-gray-200 rounded-xl">
                        <div className="p-3 rounded-xl border border-gray-200 bg-gray-50 text-slate-400">
                            <Search size={16} />
                        </div>
                        <p className="text-sm font-bold text-slate-700">No matching notifications</p>
                        <p className="text-xs text-slate-500">Try a different filter or search term.</p>
                    </div>
                ) : (
                    filtered.map(item => {
                        const Icon = item.icon;
                        const ts = TYPE_STYLE[item.type];
                        return (
                            <article key={item.id}
                                className={`flex items-start gap-3 p-4 border rounded-xl transition-colors ${item.read ? 'border-gray-200 bg-white' : `${ts.border} ${ts.bg}`}`}>
                                <div className={`p-2 rounded-lg border shrink-0 mt-0.5 ${item.read ? 'border-gray-200 bg-gray-50 text-slate-500' : `${ts.iconBorder} ${ts.iconBg} ${ts.iconText}`}`}>
                                    <Icon size={14} />
                                </div>
                                <div className="flex-1 min-w-0 space-y-1">
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded border ${item.read ? 'border-gray-200 bg-gray-50 text-slate-500' : `${ts.tagBorder} ${ts.tagBg} ${ts.tagText}`}`}>
                                            {item.tag}
                                        </span>
                                        {!item.read && (
                                            <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded border border-orange-200 bg-orange-50 text-orange-600">
                                                New
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-sm font-bold text-slate-900">{item.title}</p>
                                    <p className="text-xs text-slate-600 leading-5">{item.summary}</p>
                                    <div className="flex items-center justify-between gap-2 pt-1">
                                        <div className="flex items-center gap-1.5">
                                            <Clock3 size={11} className="text-slate-400" />
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{item.time}</p>
                                        </div>
                                        <button type="button"
                                            onClick={() => update({ detailOpen: true, selectedId: item.id })}
                                            className={`h-7 px-2.5 text-[10px] font-bold rounded-lg transition-colors flex items-center gap-1 uppercase tracking-widest border
                                                ${item.read ? 'border-gray-200 bg-white text-slate-600 hover:border-(--colour-fsP2) hover:text-(--colour-fsP2)' : `${ts.iconBorder} bg-white ${ts.iconText}`}`}>
                                            {item.action} <ArrowRight size={10} />
                                        </button>
                                    </div>
                                </div>
                            </article>
                        );
                    })
                )}
            </div>

            {/* Detail dialog */}
            <Dialog open={state.detailOpen} onOpenChange={open => update({ detailOpen: open })}>
                <DialogContent className="p-0 overflow-hidden bg-white rounded-xl border border-gray-200 sm:max-w-2xl">
                    <DialogHeader className={`px-4 sm:px-6 py-4 border-b ${selStyle.border} ${selStyle.bg}`}>
                        <div className="flex items-center gap-2 mb-1.5">
                            <div className={`p-1.5 rounded-lg border ${selStyle.iconBorder} bg-white ${selStyle.iconText}`}>
                                <SelIcon size={13} />
                            </div>
                            <span className={`text-[10px] font-bold uppercase tracking-widest ${selStyle.iconText}`}>{selected.tag}</span>
                            {!selected.read && (
                                <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded border border-orange-200 bg-white text-orange-600">
                                    New
                                </span>
                            )}
                        </div>
                        <DialogTitle className="text-base font-bold text-slate-900">{selected.title}</DialogTitle>
                        <DialogDescription className="text-xs text-slate-500 mt-0.5 flex items-center gap-1.5">
                            <Clock3 size={11} /> {selected.time}
                            {selected.validity && <> · <span className={`font-bold ${selStyle.tagText}`}>{selected.validity}</span></>}
                        </DialogDescription>
                    </DialogHeader>

                    <div className="px-4 sm:px-6 py-4 sm:py-5 grid sm:grid-cols-2 gap-4 sm:gap-5">
                        {/* Left: detail + highlights */}
                        <div className="space-y-4">
                            <div>
                                <p className="text-[10px] font-bold text-(--colour-fsP2) uppercase tracking-widest mb-2">About this notification</p>
                                <p className="text-sm font-semibold text-slate-700 leading-6">{selected.detail}</p>
                            </div>
                            <div>
                                <p className="text-[10px] font-bold text-(--colour-fsP2) uppercase tracking-widest mb-2">What's included</p>
                                <div className="space-y-2">
                                    {selected.highlights.map(h => (
                                        <div key={h} className="flex items-start gap-2.5 px-3 py-2 border border-gray-200 rounded-lg bg-gray-50">
                                            <CheckCircle2 size={13} className={`${selStyle.iconText} shrink-0 mt-0.5`} />
                                            <p className="text-xs font-semibold text-slate-700">{h}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Right: meta cards */}
                        <div className="space-y-3">
                            <p className="text-[10px] font-bold text-(--colour-fsP2) uppercase tracking-widest">Details</p>
                            <div className="grid grid-cols-2 gap-2.5">
                                <div className="p-3 border border-gray-200 rounded-lg bg-gray-50">
                                    <p className="text-[10px] font-bold text-(--colour-fsP2) uppercase tracking-widest mb-0.5">Type</p>
                                    <p className="text-xs font-bold text-slate-900 capitalize">{selected.type}</p>
                                </div>
                                <div className="p-3 border border-gray-200 rounded-lg bg-gray-50">
                                    <p className="text-[10px] font-bold text-(--colour-fsP2) uppercase tracking-widest mb-0.5">Status</p>
                                    <p className={`text-xs font-bold ${selected.read ? 'text-slate-500' : selStyle.iconText}`}>{selected.read ? 'Read' : 'Unread'}</p>
                                </div>
                                <div className="p-3 border border-gray-200 rounded-lg bg-gray-50">
                                    <p className="text-[10px] font-bold text-(--colour-fsP2) uppercase tracking-widest mb-0.5">Received</p>
                                    <p className="text-xs font-bold text-slate-900">{selected.time}</p>
                                </div>
                                {selected.validity && (
                                    <div className={`p-3 border rounded-lg ${selStyle.border} ${selStyle.bg}`}>
                                        <p className={`text-[10px] font-bold uppercase tracking-widest mb-0.5 ${selStyle.iconText}`}>Validity</p>
                                        <p className={`text-xs font-bold ${selStyle.iconText}`}>{selected.validity}</p>
                                    </div>
                                )}
                            </div>
                            {selected.code && (
                                <div className={`p-3 border rounded-lg ${selStyle.border} ${selStyle.bg}`}>
                                    <p className={`text-[10px] font-bold uppercase tracking-widest mb-1.5 ${selStyle.iconText}`}>Coupon Code</p>
                                    <div className="flex items-center justify-between gap-3 px-3 py-2 border border-dashed border-gray-300 rounded-lg bg-white">
                                        <p className="text-sm font-bold text-slate-900 tracking-widest">{selected.code}</p>
                                        <span className={`text-[10px] font-bold uppercase tracking-widest ${selStyle.iconText}`}>Copy</span>
                                    </div>
                                </div>
                            )}
                            <div className="flex items-start gap-2.5 p-3 border border-gray-200 bg-gray-50 rounded-lg">
                                <MessageSquare size={13} className="text-slate-400 shrink-0 mt-0.5" />
                                <p className="text-xs font-semibold text-slate-600">This update was added to your feed to help you discover savings and campaign opportunities.</p>
                            </div>
                        </div>
                    </div>

                    <DialogFooter className="border-t border-gray-100 px-4 sm:px-6 py-4 flex gap-2">
                        <button type="button" onClick={() => update({ detailOpen: false })}
                            className="flex-1 h-9 border border-gray-200 rounded-lg text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors">
                            Close
                        </button>
                        <button type="button"
                            className={`flex-1 h-9 rounded-lg text-xs font-bold transition-colors flex items-center justify-center gap-2 border ${selStyle.border} ${selStyle.bg} ${selStyle.iconText} hover:opacity-90`}>
                            {selected.action} <ArrowRight size={13} />
                        </button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
