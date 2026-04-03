'use client';

import React, { useState } from 'react';
import {
    Package, RefreshCw, Truck, ClipboardCheck, Shield, Check,
    MapPin, Phone, Eye, XCircle, Clock, Wallet, Info,
} from 'lucide-react';
import {
    Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from '@/components/ui/dialog';
import { EmptyState, fmt } from './orders/shared';
import Image from 'next/image';

// ─── Types ────────────────────────────────────────────────────────────────────

interface ExchangeRequest {
    id: number;
    ref_number: string;
    device_name: string;
    device_image: string;
    status: 'received' | 'pickup' | 'evaluation' | 'processing' | 'complete' | 'cancelled';
    pickup_address: string;
    customer_phone: string;
    submitted_at: string;
    estimated_value: number;
    new_device?: {
        name: string;
        price: number;
        image: string;
    };
}

// ─── Constants ────────────────────────────────────────────────────────────────

const STEPS = [
    { key: 'received',   label: 'Received',   icon: Package },
    { key: 'pickup',     label: 'Pickup',     icon: Truck },
    { key: 'evaluation', label: 'Evaluation', icon: ClipboardCheck },
    { key: 'processing', label: 'Processing', icon: RefreshCw },
    { key: 'complete',   label: 'Complete',   icon: Shield },
] as const;

const STEP_INDEX: Record<string, number> = {
    received: 0, pickup: 1, evaluation: 2, processing: 3, complete: 4,
};

const EXCHANGE_STATUS: Record<string, { label: string; cls: string }> = {
    received:   { label: 'Received',   cls: 'text-[var(--colour-fsP2)] bg-blue-50 border-blue-200' },
    pickup:     { label: 'Pickup',     cls: 'text-orange-600 bg-orange-50 border-orange-200' },
    evaluation: { label: 'Evaluation', cls: 'text-orange-600 bg-orange-50 border-orange-200' },
    processing: { label: 'Processing', cls: 'text-orange-600 bg-orange-50 border-orange-200' },
    complete:   { label: 'Complete',   cls: 'text-[var(--colour-fsP2)] bg-blue-50 border-blue-200' },
    cancelled:  { label: 'Cancelled',  cls: 'text-red-600 bg-red-50 border-red-200' },
};

const fmtRs = (n: number) => `Rs ${(n || 0).toLocaleString()}`;
const noBar = '[&::-webkit-scrollbar]:w-0 [scrollbar-width:none]';

const MOCK_EXCHANGES: ExchangeRequest[] = [
    {
        id: 3001, ref_number: 'EXC-3001',
        device_name: 'iPhone 13 Pro', device_image: '',
        status: 'evaluation', pickup_address: 'Thamel, Kathmandu',
        customer_phone: '9841000000', submitted_at: '2026-03-30T10:00:00Z',
        estimated_value: 45000,
        new_device: {
            name: 'iPhone 15 Pro', price: 185000, image: ''
        }
    },
    {
        id: 3002, ref_number: 'EXC-3002',
        device_name: 'Samsung Galaxy S22', device_image: '',
        status: 'complete', pickup_address: 'Baneshwor, Kathmandu',
        customer_phone: '9841111111', submitted_at: '2026-03-15T09:00:00Z',
        estimated_value: 32000,
    }
];

// ─── Status badge ─────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: string }) {
    const s = EXCHANGE_STATUS[status] ?? { label: status, cls: 'text-slate-600 bg-gray-50 border-gray-200' };
    return (
        <span className={`inline-flex items-center text-[11px] font-semibold px-2 py-0.5 rounded border ${s.cls}`}>
            {s.label}
        </span>
    );
}

// ─── Progress Bar ─────────────────────────────────────────────────────────────

function TrackingBar({ status }: { status: string }) {
    const activeStep = STEP_INDEX[status] ?? 0;
    const isDone = status === 'complete';
    const isCancelled = status === 'cancelled';

    return (
        <div className="w-full">
            <div className="flex items-center">
                {STEPS.map((step, i) => {
                    const isLast = i === STEPS.length - 1;
                    const done = isDone || i < activeStep;
                    const active = !isDone && !isCancelled && i === activeStep;
                    const Icon = step.icon;
                    return (
                        <React.Fragment key={i}>
                            <div className="flex flex-col items-center shrink-0">
                                <div className={`w-9 h-9 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${
                                    done       ? 'bg-[var(--colour-fsP2)] border-[var(--colour-fsP2)]' :
                                    active     ? 'bg-[var(--colour-fsP2)] border-[var(--colour-fsP2)] ring-[3px] ring-[var(--colour-fsP2)]/20' :
                                    isCancelled && i === 0 ? 'bg-red-50 border-red-300' :
                                                'bg-white border-gray-200'
                                }`}>
                                    {done
                                        ? <Check className="h-4 w-4 text-white stroke-2" />
                                        : <Icon className={`h-4 w-4 ${active ? 'text-white' : 'text-gray-300'}`} />
                                    }
                                </div>
                            </div>
                            {!isLast && (
                                <div className={`flex-1 h-0.5 transition-all duration-500 mx-1 ${done ? 'bg-[var(--colour-fsP2)]' : 'bg-gray-100'}`} />
                            )}
                        </React.Fragment>
                    );
                })}
            </div>
            <div className="flex mt-2">
                {STEPS.map((step, i) => {
                    const isLast = i === STEPS.length - 1;
                    const done = isDone || i <= activeStep;
                    return (
                        <React.Fragment key={i}>
                            <div className="flex justify-center shrink-0 w-9">
                                <span className={`text-[9px] font-bold uppercase tracking-wide whitespace-nowrap ${done && !isCancelled ? 'text-[var(--colour-fsP2)]' : 'text-slate-400'}`}>
                                    {step.label}
                                </span>
                            </div>
                            {!isLast && <div className="flex-1 mx-1" />}
                        </React.Fragment>
                    );
                })}
            </div>
        </div>
    );
}

// ─── Detail Dialog ────────────────────────────────────────────────────────────

function ExchangeDetailDialog({ exchange, onClose }: { exchange: ExchangeRequest | null; onClose: () => void }) {
    if (!exchange) return null;

    const step = STEP_INDEX[exchange.status] ?? 0;
    const isDone = exchange.status === 'complete';
    const isCancelled = exchange.status === 'cancelled';

    return (
        <Dialog open={!!exchange} onOpenChange={onClose}>
            <DialogContent className={`w-full sm:max-w-2xl max-h-[95dvh] sm:max-h-[90dvh] p-0 flex flex-col gap-0 bg-white border border-gray-200 rounded-t-xl sm:rounded-xl overflow-hidden ${noBar}`}>
                <DialogHeader className="shrink-0 px-6 py-4 border-b border-gray-100">
                    <div className="flex items-center justify-between gap-4">
                        <div>
                            <DialogTitle className="text-base font-bold text-slate-900">#{exchange.ref_number}</DialogTitle>
                            <DialogDescription className="sr-only">Exchange request detail</DialogDescription>
                            <p className="text-xs text-slate-500 mt-0.5">{fmt(exchange.submitted_at)}</p>
                        </div>
                        <StatusBadge status={exchange.status} />
                    </div>
                </DialogHeader>

                <div className={`flex-1 overflow-y-auto ${noBar} divide-y divide-gray-100`}>
                    <div className="px-6 py-5 bg-gray-50/30">
                        <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest mb-4">Exchange Progress</p>
                        <TrackingBar status={exchange.status} />
                    </div>

                    <div className="px-6 py-6 space-y-6">
                        {/* Devices Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {/* Old Device */}
                            <div className="space-y-2">
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Device to Exchange</p>
                                <div className="p-3 border border-gray-200 rounded-2xl bg-white flex items-center gap-3">
                                    <div className="w-12 h-12 rounded-lg bg-gray-50 border border-gray-100 flex items-center justify-center shrink-0">
                                        <Package size={20} className="text-gray-300" />
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-xs font-bold text-slate-900 truncate">{exchange.device_name}</p>
                                        <p className="text-[11px] font-bold text-[var(--colour-fsP2)] mt-0.5">Value: {fmtRs(exchange.estimated_value)}</p>
                                    </div>
                                </div>
                            </div>

                            {/* New Device */}
                            {exchange.new_device && (
                                <div className="space-y-2">
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Upgrade Device</p>
                                    <div className="p-3 border border-[var(--colour-fsP2)]/20 rounded-2xl bg-[var(--colour-fsP2)]/[0.02] flex items-center gap-3">
                                        <div className="w-12 h-12 rounded-lg bg-white border border-gray-100 flex items-center justify-center shrink-0">
                                            <RefreshCw size={20} className="text-[var(--colour-fsP2)]" />
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-xs font-bold text-slate-900 truncate">{exchange.new_device.name}</p>
                                            <p className="text-[11px] font-bold text-emerald-600 mt-0.5">Price: {fmtRs(exchange.new_device.price)}</p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Summary */}
                        {exchange.new_device && (
                            <div className="bg-gray-50 border border-gray-100 rounded-2xl p-4 space-y-2">
                                <div className="flex justify-between text-xs">
                                    <span className="text-slate-500 font-medium">New Device Price</span>
                                    <span className="text-slate-900 font-bold">{fmtRs(exchange.new_device.price)}</span>
                                </div>
                                <div className="flex justify-between text-xs">
                                    <span className="text-slate-500 font-medium">Estimated Exchange Value</span>
                                    <span className="text-[var(--colour-fsP2)] font-bold">-{fmtRs(exchange.estimated_value)}</span>
                                </div>
                                <div className="pt-2 border-t border-gray-200 flex justify-between items-center">
                                    <span className="text-sm font-bold text-slate-900">Payable Amount</span>
                                    <span className="text-lg font-black text-emerald-600">{fmtRs(exchange.new_device.price - exchange.estimated_value)}</span>
                                </div>
                            </div>
                        )}

                        {/* Pickup */}
                        <div className="space-y-3">
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Pickup Information</p>
                            <div className="space-y-2.5">
                                <div className="flex items-center gap-2.5 text-xs">
                                    <Phone size={13} className="text-[var(--colour-fsP2)]" />
                                    <span className="font-semibold text-slate-900">{exchange.customer_phone}</span>
                                </div>
                                <div className="flex items-start gap-2.5 text-xs">
                                    <MapPin size={13} className="text-[var(--colour-fsP2)] mt-0.5" />
                                    <span className="font-semibold text-slate-900">{exchange.pickup_address}</span>
                                </div>
                            </div>
                        </div>

                        <div className="bg-blue-50 border border-blue-100 p-4 rounded-2xl flex gap-3 items-start">
                            <Info size={16} className="text-[var(--colour-fsP2)] shrink-0 mt-0.5" />
                            <p className="text-[11px] text-blue-700 leading-relaxed">
                                Our technician will perform a physical inspection of your device at your location.
                                The final value may vary based on condition.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="shrink-0 flex gap-2 px-6 py-3 border-t border-gray-100 bg-gray-50/40">
                    <button onClick={onClose} className="flex-1 h-10 rounded-xl border border-gray-200 bg-white text-xs font-bold text-slate-700">Close</button>
                    <button className="flex-1 h-10 rounded-xl bg-[var(--colour-fsP2)] text-white text-xs font-bold">Contact Support</button>
                </div>
            </DialogContent>
        </Dialog>
    );
}

// ─── Main Section ─────────────────────────────────────────────────────────────

export default function ExchangeSection() {
    const exchanges = MOCK_EXCHANGES;
    const [detail, setDetail] = useState<ExchangeRequest | null>(null);

    return (
        <div className="space-y-4">
            <div className="space-y-2">
                {exchanges.length === 0 ? (
                    <EmptyState label="No exchange requests" sub="Upgrade your device using our exchange program." />
                ) : exchanges.map(exchange => {
                    const step = STEP_INDEX[exchange.status] ?? 0;
                    const pct = (step / (STEPS.length - 1)) * 100;

                    return (
                        <div key={exchange.id} className="border border-gray-200 rounded-2xl overflow-hidden bg-white hover:border-[var(--colour-fsP2)]/30 transition-all">
                            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-50">
                                <div>
                                    <p className="text-xs font-black text-slate-900 tracking-tight">#{exchange.ref_number}</p>
                                    <p className="text-[10px] font-bold text-slate-400 mt-0.5">{fmt(exchange.submitted_at)}</p>
                                </div>
                                <StatusBadge status={exchange.status} />
                            </div>

                            <div className="px-5 py-5">
                                <div className="flex items-center gap-4 mb-4">
                                    <div className="w-12 h-12 rounded-xl border border-gray-100 bg-gray-50 flex items-center justify-center shrink-0">
                                        <RefreshCw size={20} className="text-gray-300" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-xs font-bold text-slate-900 truncate">{exchange.device_name}</p>
                                        <p className="text-[11px] font-bold text-[var(--colour-fsP2)] mt-0.5">Value: {fmtRs(exchange.estimated_value)}</p>
                                    </div>
                                    <button 
                                        onClick={() => setDetail(exchange)}
                                        className="h-8 px-3 rounded-lg border border-gray-200 text-[10px] font-bold uppercase tracking-widest text-slate-500 hover:bg-gray-50 transition-all flex items-center gap-1.5"
                                    >
                                        <Eye size={12} /> View
                                    </button>
                                </div>

                                <div className="space-y-1.5">
                                    <div className="flex justify-between items-center">
                                        <span className="text-[9px] font-black uppercase tracking-widest text-[var(--colour-fsP2)]">
                                            {STEPS[step]?.label}
                                        </span>
                                        <span className="text-[9px] font-bold text-slate-400">
                                            {step + 1} / {STEPS.length}
                                        </span>
                                    </div>
                                    <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-[var(--colour-fsP2)] rounded-full transition-all duration-300 shadow-sm"
                                            style={{ width: `${exchange.status === 'complete' ? 100 : pct}%` }}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            <ExchangeDetailDialog exchange={detail} onClose={() => setDetail(null)} />
        </div>
    );
}
