'use client';

import React, { useState } from 'react';
import {
    Truck, Search, MapPin, CheckCircle2, Loader2,
    Smartphone, Box, Wrench, ArrowLeftRight, Layers,
    CreditCard, Info, Clock,
} from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────
type OrderType = 'normal' | 'emi' | 'preorder' | 'exchange' | 'repair';

interface TrackingStep {
    label: string;
    date: string;
    status: 'completed' | 'current' | 'pending';
    note?: string;
}

interface TrackingResult {
    type: OrderType;
    id: string;
    product: string;
    steps: TrackingStep[];
    meta: Record<string, string>;
}

// ─── Demo data per order type ─────────────────────────────────────────────────
const DEMO: Record<OrderType, TrackingResult> = {
    normal: {
        type: 'normal', id: 'ORD-2024-X8291', product: 'OnePlus 13 5G (512GB)',
        steps: [
            { label: 'Order Placed',      date: 'Oct 12, 10:30 AM', status: 'completed' },
            { label: 'Processing',        date: 'Oct 12, 02:45 PM', status: 'completed' },
            { label: 'Packed',            date: 'Oct 13, 09:12 AM', status: 'completed' },
            { label: 'Out for Delivery',  date: 'Oct 14, 08:00 AM', status: 'current', note: 'Your package is with the delivery agent' },
            { label: 'Delivered',         date: 'Est. Oct 14',      status: 'pending'   },
        ],
        meta: { Carrier: 'Fatafat Express', Destination: 'New Baneshwor, Kathmandu', 'Est. Delivery': 'Oct 14, 2024' },
    },
    emi: {
        type: 'emi', id: 'EMI-2024-E1023', product: 'Sony 65″ 4K OLED TV',
        steps: [
            { label: 'Application Submitted', date: 'Sep 01, 11:00 AM', status: 'completed' },
            { label: 'Bank Review',           date: 'Sep 02, 03:00 PM', status: 'completed' },
            { label: 'EMI Approved',          date: 'Sep 04, 10:00 AM', status: 'completed' },
            { label: 'Product Dispatched',    date: 'Sep 05, 08:30 AM', status: 'current', note: 'Shipped via Fatafat Express' },
            { label: 'Delivered',             date: 'Est. Sep 06',      status: 'pending'   },
            { label: 'EMI Active',            date: 'Starts Oct 01',    status: 'pending'   },
        ],
        meta: { Bank: 'NIC Asia Bank', 'Monthly EMI': 'Rs 8,500', 'Next Due': 'Nov 1, 2024', Duration: '12 months' },
    },
    preorder: {
        type: 'preorder', id: 'PRE-20250201', product: 'Samsung Galaxy S25 Ultra (256GB)',
        steps: [
            { label: 'Reservation Confirmed', date: 'Feb 01, 08:30 AM', status: 'completed' },
            { label: 'Deposit Received',      date: 'Feb 01, 08:35 AM', status: 'completed' },
            { label: 'In Production / Import',date: 'Ongoing',           status: 'current', note: 'Product is being manufactured' },
            { label: 'Ready for Dispatch',    date: 'Est. Apr 10',       status: 'pending'   },
            { label: 'Delivered',             date: 'Est. Apr 15',       status: 'pending'   },
        ],
        meta: { 'Deposit Paid': 'Rs 5,000', Balance: 'Rs 180,000', 'Expected Date': 'Apr 15, 2025', Color: 'Titanium Black' },
    },
    exchange: {
        type: 'exchange', id: 'EXC-2024-X0042', product: 'iPhone 14 → iPhone 15 Pro',
        steps: [
            { label: 'Exchange Request',    date: 'Oct 10, 01:00 PM', status: 'completed' },
            { label: 'Pickup Scheduled',    date: 'Oct 11, 10:00 AM', status: 'completed' },
            { label: 'Old Item Collected',  date: 'Oct 11, 02:00 PM', status: 'completed' },
            { label: 'Assessment',          date: 'Oct 12, 11:00 AM', status: 'current', note: 'Device condition being evaluated' },
            { label: 'New Item Dispatched', date: 'Est. Oct 13',       status: 'pending'  },
            { label: 'Delivered',           date: 'Est. Oct 14',       status: 'pending'  },
        ],
        meta: { 'Old Device': 'iPhone 14 (Good)', 'Exchange Value': 'Rs 45,000', 'Balance to Pay': 'Rs 72,600', 'New Device': 'iPhone 15 Pro' },
    },
    repair: {
        type: 'repair', id: 'REP-2024-R0087', product: 'MacBook Pro M1 — Battery Issue',
        steps: [
            { label: 'Repair Request',   date: 'Oct 08, 10:00 AM', status: 'completed' },
            { label: 'Item Received',    date: 'Oct 08, 03:00 PM', status: 'completed' },
            { label: 'Diagnosis Done',   date: 'Oct 09, 11:00 AM', status: 'completed', note: 'Battery replacement required' },
            { label: 'Repair in Progress', date: 'Oct 10, 09:00 AM', status: 'current', note: 'Technician: Rajan Thapa' },
            { label: 'Quality Check',    date: 'Est. Oct 11',       status: 'pending'  },
            { label: 'Ready for Pickup', date: 'Est. Oct 12',       status: 'pending'  },
        ],
        meta: { 'Service Center': 'Fatafat Service Hub', Technician: 'Rajan Thapa', Fault: 'Battery Degraded (12%)', 'Est. Cost': 'Rs 4,500' },
    },
};

const TYPE_CFG: Record<OrderType, { label: string; icon: React.ElementType; cls: string }> = {
    normal:   { label: 'Normal Order', icon: Box,              cls: 'text-(--colour-fsP2) bg-blue-50 border-blue-200'     },
    emi:      { label: 'EMI Order',    icon: CreditCard,       cls: 'text-purple-600 bg-purple-50 border-purple-200'       },
    preorder: { label: 'Pre-order',    icon: Layers,           cls: 'text-amber-600 bg-amber-50 border-amber-200'          },
    exchange: { label: 'Exchange',     icon: ArrowLeftRight,   cls: 'text-teal-600 bg-teal-50 border-teal-200'             },
    repair:   { label: 'Repair',       icon: Wrench,           cls: 'text-rose-600 bg-rose-50 border-rose-200'             },
};

const DEMO_BUTTONS: OrderType[] = ['normal', 'emi', 'preorder', 'exchange', 'repair'];

export default function OrderTracking() {
    const [orderId, setOrderId] = useState('');
    const [isSearching, setIsSearching] = useState(false);
    const [result, setResult] = useState<TrackingResult | null>(null);

    const handleSearch = () => {
        if (!orderId.trim()) return;
        setIsSearching(true);
        setTimeout(() => {
            setIsSearching(false);
            setResult(DEMO['normal']);
        }, 1200);
    };

    const loadDemo = (type: OrderType) => {
        setResult(DEMO[type]);
        setOrderId(DEMO[type].id);
    };

    const completed = result ? result.steps.filter(s => s.status === 'completed').length : 0;
    const total     = result ? result.steps.length : 0;
    const pct       = total > 0 ? Math.round((completed / total) * 100) : 0;

    const cfg = result ? TYPE_CFG[result.type] : null;

    return (
        <div className="space-y-5">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-gray-100">
                <div className="flex items-center gap-2">
                    <Truck className="w-4 h-4 text-(--colour-fsP2)" />
                    <div>
                        <h2 className="text-lg font-bold text-(--colour-fsP2)">Track Order</h2>
                        <p className="text-xs text-slate-500 mt-0.5">Enter your order ID or pick a demo below</p>
                    </div>
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1.5 border border-blue-200 bg-blue-50 rounded-lg">
                    <Smartphone className="w-3 h-3 text-(--colour-fsP2)" />
                    <span className="text-[10px] font-bold text-(--colour-fsP2) uppercase tracking-widest">Real-time Updates</span>
                </div>
            </div>

            {/* Search */}
            <div className="border border-gray-200 rounded-xl p-5 bg-white">
                <div className="flex gap-2">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                        <input
                            type="text"
                            placeholder="e.g. ORD-2024-X8291 / EMI-2024-E1023"
                            value={orderId}
                            onChange={e => setOrderId(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && handleSearch()}
                            className="w-full h-10 pl-9 pr-3 bg-gray-50 border border-gray-200 rounded-lg text-sm font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-(--colour-fsP2) focus:bg-white transition-colors"
                        />
                    </div>
                    <button
                        onClick={handleSearch}
                        disabled={!orderId.trim() || isSearching}
                        className="h-10 px-5 bg-(--colour-fsP2) text-white rounded-lg text-xs font-bold hover:bg-blue-700 disabled:opacity-40 transition-colors flex items-center gap-2"
                    >
                        {isSearching ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Tracking…</> : <><Truck className="w-3.5 h-3.5" /> Track</>}
                    </button>
                </div>

                {/* Demo buttons */}
                <div className="mt-3 pt-3 border-t border-gray-100">
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Demo — pick order type</p>
                    <div className="flex flex-wrap gap-2">
                        {DEMO_BUTTONS.map(type => {
                            const c = TYPE_CFG[type];
                            const Icon = c.icon;
                            const active = result?.type === type;
                            return (
                                <button
                                    key={type}
                                    onClick={() => loadDemo(type)}
                                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-[11px] font-bold transition-colors ${active ? c.cls + ' border-current' : 'border-gray-200 text-slate-600 hover:border-slate-300'}`}
                                >
                                    <Icon size={12} /> {c.label}
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Result */}
            {result && cfg && (
                <div className="space-y-4">
                    {/* Order header strip */}
                    <div className="border border-gray-200 rounded-xl bg-white overflow-hidden">
                        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
                            <div className="min-w-0">
                                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{result.id}</p>
                                <p className="text-sm font-bold text-slate-900 truncate">{result.product}</p>
                            </div>
                            <span className={`shrink-0 ml-3 inline-flex items-center gap-1.5 text-[10px] font-bold px-2 py-0.5 rounded border uppercase tracking-widest ${cfg.cls}`}>
                                <cfg.icon size={10} /> {cfg.label}
                            </span>
                        </div>

                        {/* Progress bar */}
                        <div className="px-4 py-3">
                            <div className="flex justify-between mb-1.5">
                                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Delivery Progress</p>
                                <span className="text-[10px] font-bold text-(--colour-fsP2)">{completed}/{total} steps · {pct}%</span>
                            </div>
                            <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-(--colour-fsP2) rounded-full transition-all duration-700"
                                    style={{ width: `${pct}%` }}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                        {/* Timeline */}
                        <div className="lg:col-span-2 border border-gray-200 rounded-xl bg-white overflow-hidden">
                            <div className="px-4 py-3 border-b border-gray-100 bg-gray-50/60">
                                <p className="text-[10px] font-bold text-(--colour-fsP2) uppercase tracking-widest">Tracking Timeline</p>
                            </div>
                            <div className="px-4 py-4">
                                <div className="relative space-y-0">
                                    {result.steps.map((step, i) => (
                                        <div key={i} className="flex gap-4 pb-6 last:pb-0 relative">
                                            {/* Connector line */}
                                            {i < result.steps.length - 1 && (
                                                <div className={`absolute left-[11px] top-6 bottom-0 w-0.5 ${step.status === 'completed' ? 'bg-(--colour-fsP2)' : 'bg-gray-100'}`} />
                                            )}
                                            {/* Dot */}
                                            <div className={`relative z-10 w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5
                                                ${step.status === 'completed' ? 'bg-(--colour-fsP2) text-white'
                                                : step.status === 'current'   ? 'bg-white border-2 border-(--colour-fsP2) text-(--colour-fsP2)'
                                                : 'bg-white border-2 border-gray-200 text-slate-300'}`}>
                                                {step.status === 'completed'
                                                    ? <CheckCircle2 size={13} />
                                                    : step.status === 'current'
                                                        ? <Clock size={11} />
                                                        : <div className="w-1.5 h-1.5 rounded-full bg-current" />}
                                            </div>
                                            {/* Content */}
                                            <div className="pt-0.5 min-w-0">
                                                <p className={`text-xs font-bold leading-none mb-1 ${step.status === 'pending' ? 'text-slate-400' : 'text-slate-900'}`}>
                                                    {step.label}
                                                </p>
                                                <p className={`text-[10px] font-semibold ${step.status === 'current' ? 'text-(--colour-fsP2)' : 'text-slate-500'}`}>
                                                    {step.date}
                                                </p>
                                                {step.note && step.status !== 'pending' && (
                                                    <p className="text-[10px] text-slate-500 font-semibold mt-0.5">{step.note}</p>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Meta info */}
                        <div className="border border-gray-200 rounded-xl bg-white overflow-hidden h-fit">
                            <div className="px-4 py-3 border-b border-gray-100 bg-gray-50/60">
                                <p className="text-[10px] font-bold text-(--colour-fsP2) uppercase tracking-widest">Order Details</p>
                            </div>
                            <div className="px-4 py-4 space-y-3">
                                {Object.entries(result.meta).map(([key, val]) => (
                                    <div key={key}>
                                        <p className="text-[10px] font-bold text-(--colour-fsP2) uppercase tracking-widest mb-0.5">{key}</p>
                                        <p className="text-xs font-bold text-slate-900">{val}</p>
                                    </div>
                                ))}
                                <div className="pt-3 border-t border-gray-100">
                                    <button className="w-full h-9 border border-gray-200 rounded-lg text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors flex items-center justify-center gap-2">
                                        <Info size={13} /> Contact Support
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
