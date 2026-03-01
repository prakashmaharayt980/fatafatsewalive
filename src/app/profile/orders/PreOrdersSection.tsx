'use client';

import React, { useState } from 'react';
import { Tag, Truck, MapPin, AlertTriangle, Calendar, CheckCircle2, Clock } from 'lucide-react';
import {
    Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
    FilterBar, EmptyState, DRow, DSection,
    fmt, fmtRs,
    MOCK_PRE_ORDERS, MOCK_ADDRESS,
    type PreOrder,
} from './shared';

// ─── Pre-order Detail Dialog ──────────────────────────────────────────────────

const PRE_CFG = {
    upcoming: { label: 'Upcoming', color: 'var(--colour-fsP2)', bg: 'bg-blue-50', border: 'border-blue-100', icon: <Clock size={16} className="text-[var(--colour-fsP2)]" /> },
    paid: { label: 'Paid & Ready', color: 'var(--colour-fsP2)', bg: 'bg-blue-50', border: 'border-blue-100', icon: <CheckCircle2 size={16} className="text-[var(--colour-fsP2)]" /> },
    history: { label: 'Order Received', color: '#374151', bg: 'bg-gray-50', border: 'border-gray-200', icon: <CheckCircle2 size={16} className="text-gray-500" /> },
};

function PreOrderDetailDialog({ pre, onClose }: { pre: PreOrder | null; onClose: () => void }) {
    if (!pre) return null;
    const cfg = PRE_CFG[pre.status];
    const pct = Math.round((pre.amount_paid / pre.total_amount) * 100);
    const remaining = pre.total_amount - pre.amount_paid;
    const addr = pre.address ?? MOCK_ADDRESS;

    return (
        <Dialog open={!!pre} onOpenChange={onClose}>
            <DialogContent className="rounded-xl border border-gray-200 bg-white max-w-lg w-full mx-4 p-0 overflow-hidden flex flex-col max-h-[90vh]">
                {/* Accent stripe */}
                <div className="h-[3px] w-full" style={{ backgroundColor: pre.status === 'history' ? '#9CA3AF' : 'var(--colour-fsP2)' }} />

                <DialogHeader className="px-5 py-4 border-b border-gray-100 bg-gray-50 shrink-0">
                    <div className="flex items-start justify-between gap-2">
                        <DialogTitle className="text-sm font-bold text-gray-900 leading-snug">{pre.product_name}</DialogTitle>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded border shrink-0"
                            style={{ color: cfg.color, borderColor: `color-mix(in srgb, ${cfg.color} 30%, transparent)`, backgroundColor: `color-mix(in srgb, ${cfg.color} 8%, white)` }}>
                            {cfg.label.toUpperCase()}
                        </span>
                    </div>
                    <p className="text-[10px] text-gray-400 mt-1 flex items-center gap-2">
                        <span className="flex items-center gap-1"><Calendar size={9} /> {pre.invoice_number}</span>
                        <span className="flex items-center gap-1"><Tag size={9} /> {pre.category}</span>
                    </p>
                </DialogHeader>

                <div className="overflow-y-auto flex-1 p-5 space-y-5">
                    {/* Status banner */}
                    <div className={`flex items-center gap-3 p-3.5 rounded-lg border ${cfg.bg} ${cfg.border}`}>
                        {cfg.icon}
                        <div>
                            <p className="text-xs font-bold" style={{ color: cfg.color }}>{cfg.label}</p>
                            {pre.status === 'upcoming' && (
                                <p className="text-[11px] text-gray-500 mt-0.5 flex items-center gap-1">
                                    <Truck size={10} /> Expected delivery: {fmt(pre.expected_date)}
                                </p>
                            )}
                            {pre.status === 'paid' && (
                                <p className="text-[11px] text-gray-500 mt-0.5">Your payment is complete. Product will be dispatched soon.</p>
                            )}
                            {pre.status === 'history' && (
                                <p className="text-[11px] text-gray-500 mt-0.5">This pre-order has been fulfilled and delivered.</p>
                            )}
                        </div>
                    </div>

                    {/* Payment breakdown */}
                    <div>
                        <DSection>Payment Breakdown</DSection>
                        <div className="mt-2 border border-gray-100 rounded-lg overflow-hidden divide-y divide-gray-50">
                            <div className="flex justify-between items-center px-4 py-2.5 bg-gray-50">
                                <span className="text-xs text-gray-500">Total Amount</span>
                                <span className="text-xs font-bold text-gray-800">{fmtRs(pre.total_amount)}</span>
                            </div>
                            <div className={`flex justify-between items-center px-4 py-2.5 ${pct > 0 ? 'bg-blue-50' : 'bg-white'}`}>
                                <span className={`text-xs font-medium ${pct > 0 ? 'text-[var(--colour-fsP2)]' : 'text-gray-500'}`}>Amount Paid</span>
                                <span className={`text-xs font-bold ${pct > 0 ? 'text-[var(--colour-fsP2)]' : 'text-gray-800'}`}>{fmtRs(pre.amount_paid)}</span>
                            </div>
                            {remaining > 0 && (
                                <div className="flex justify-between items-center px-4 py-2.5 bg-orange-50">
                                    <span className="text-xs font-medium text-[var(--colour-fsP1)]">Remaining</span>
                                    <span className="text-xs font-bold text-[var(--colour-fsP1)]">{fmtRs(remaining)}</span>
                                </div>
                            )}
                        </div>
                        {/* Progress bar */}
                        <div className="mt-3">
                            <div className="flex justify-between text-[10px] text-gray-400 mb-1.5">
                                <span>Payment Progress</span>
                                <span className="font-bold text-[var(--colour-fsP2)]">{pct}%</span>
                            </div>
                            <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                <div className="h-full rounded-full bg-[var(--colour-fsP2)]" style={{ width: `${pct}%` }} />
                            </div>
                        </div>
                    </div>

                    {/* Pre-order Info */}
                    <div>
                        <DSection>Pre-order Info</DSection>
                        <div className="grid grid-cols-2 gap-x-4 gap-y-3 mt-2">
                            <DRow label="Category" value={pre.category} />
                            <DRow label="Invoice" value={pre.invoice_number} />
                            {pre.status !== 'history' && <DRow label="Expected Date" value={fmt(pre.expected_date)} />}
                            <DRow label="Status" value={cfg.label} />
                        </div>
                    </div>

                    {/* Delivery address */}
                    <div>
                        <DSection>Delivery Address</DSection>
                        <div className="flex items-start gap-2 mt-2 p-3 bg-gray-50 border border-gray-100 rounded-lg">
                            <MapPin size={13} className="text-[var(--colour-fsP2)] shrink-0 mt-0.5" />
                            <div className="text-xs text-gray-700 leading-relaxed">
                                <span className="font-semibold">{addr.name}</span><br />
                                {addr.address},<br />
                                {addr.city} · {addr.phone}
                            </div>
                        </div>
                    </div>

                    {/* Note */}
                    {pre.note && (
                        <div className="flex items-start gap-2 p-3 bg-orange-50 border border-orange-100 rounded-lg">
                            <AlertTriangle size={13} className="text-[var(--colour-fsP1)] shrink-0 mt-0.5" />
                            <p className="text-[11px] text-gray-700">{pre.note}</p>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}

// ─── Pre-orders Section ───────────────────────────────────────────────────────

export default function PreOrdersSection() {
    const [filter, setFilter] = useState<'all' | 'upcoming' | 'paid' | 'history'>('all');
    const [detail, setDetail] = useState<PreOrder | null>(null);

    const FILTERS = [
        { key: 'all', label: 'All', cnt: MOCK_PRE_ORDERS.length },
        { key: 'upcoming', label: 'Upcoming', cnt: MOCK_PRE_ORDERS.filter(p => p.status === 'upcoming').length },
        { key: 'paid', label: 'Paid', cnt: MOCK_PRE_ORDERS.filter(p => p.status === 'paid').length },
        { key: 'history', label: 'History', cnt: MOCK_PRE_ORDERS.filter(p => p.status === 'history').length },
    ];

    const filtered = filter === 'all' ? MOCK_PRE_ORDERS : MOCK_PRE_ORDERS.filter(p => p.status === filter);

    return (
        <div className="space-y-4">
            <FilterBar filters={FILTERS} active={filter} onSelect={(k) => setFilter(k as any)} />

            {filtered.length === 0
                ? <EmptyState label="No pre-orders" sub="Reserved products will appear here." />
                : filtered.map(pre => {
                    const cfg = PRE_CFG[pre.status];
                    const pct = Math.round((pre.amount_paid / pre.total_amount) * 100);
                    const accentColor = pre.status === 'history' ? '#9CA3AF' : 'var(--colour-fsP2)';
                    return (
                        <div key={pre.id} className="border border-gray-200 rounded-lg overflow-hidden bg-white">
                            {/* Accent stripe */}
                            <div className="h-[3px]" style={{ backgroundColor: accentColor }} />

                            <div className="px-4 py-3">
                                {/* Title + status */}
                                <div className="flex items-start justify-between gap-2 mb-1.5">
                                    <p className="text-sm font-bold text-gray-800 leading-snug">{pre.product_name}</p>
                                    <span className="text-[10px] font-bold px-2 py-0.5 rounded border shrink-0"
                                        style={{ color: accentColor, borderColor: `color-mix(in srgb, ${accentColor} 30%, transparent)`, backgroundColor: `color-mix(in srgb, ${accentColor} 8%, white)` }}>
                                        {pre.status.toUpperCase()}
                                    </span>
                                </div>

                                <p className="text-[10px] text-gray-400 flex items-center gap-2 mb-2">
                                    <span className="flex items-center gap-1"><Tag size={9} /> {pre.category}</span>
                                    <span className="flex items-center gap-1"><Calendar size={9} /> {pre.invoice_number}</span>
                                </p>

                                {pre.status === 'upcoming' && (
                                    <p className="text-[11px] font-medium text-[var(--colour-fsP2)] flex items-center gap-1 mb-2">
                                        <Truck size={10} /> Expected: {fmt(pre.expected_date)}
                                    </p>
                                )}

                                {/* Payment progress */}
                                <div>
                                    <div className="flex justify-between text-[10px] text-gray-400 mb-1.5">
                                        <span>Payment Progress</span>
                                        <span className="font-semibold">{fmtRs(pre.amount_paid)} / {fmtRs(pre.total_amount)}</span>
                                    </div>
                                    <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                        <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: accentColor }} />
                                    </div>
                                    <p className="text-right text-[10px] text-gray-400 mt-0.5">{pct}% paid</p>
                                </div>
                            </div>

                            <div className="flex justify-end px-4 py-2.5 border-t border-gray-100">
                                <button onClick={() => setDetail(pre)}
                                    className="flex items-center gap-1 text-[11px] font-semibold text-[var(--colour-fsP2)] border border-[var(--colour-fsP2)] px-3 py-1.5 rounded hover:bg-blue-50 transition-colors">
                                    View Full Details →
                                </button>
                            </div>
                        </div>
                    );
                })
            }

            <PreOrderDetailDialog pre={detail} onClose={() => setDetail(null)} />
        </div>
    );
}
