'use client';

import React, { useState } from 'react';
import { Calendar, CreditCard, MapPin, Package, Search } from 'lucide-react';
import {
    Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
    EmptyState, StatusBadge, DRow, DSection,
    fmt, fmtRs,
    MOCK_PRE_ORDERS, MOCK_ADDRESS,
    type PreOrder,
} from './shared';

const PRE_CFG: Record<string, { label: string; cls: string }> = {
    upcoming:   { label: 'Upcoming',    cls: 'text-(--colour-fsP2) bg-blue-50 border-blue-200' },
    paid:       { label: 'Paid & Ready', cls: 'text-emerald-600 bg-emerald-50 border-emerald-200' },
    history:    { label: 'Delivered',   cls: 'text-slate-600 bg-gray-50 border-gray-200' },
    processing: { label: 'Processing',  cls: 'text-amber-600 bg-amber-50 border-amber-200' },
    cancelled:  { label: 'Cancelled',   cls: 'text-red-600 bg-red-50 border-red-200' },
};

const fmtPayment = (type: string) => {
    const map: Record<string, string> = {
        esewa: 'eSewa',
        khalti: 'Khalti',
        cash_on_delivery: 'Cash on Delivery',
        'nic-asia': 'NIC Asia Bank',
        'global-ime': 'Global IME Bank',
        fonepay: 'FonePay',
        connectips: 'ConnectIPS',
    };
    return map[type] ?? type;
};

const getPreProduct   = (pre: PreOrder) => pre.products?.[0];
const getPreName      = (pre: PreOrder) => getPreProduct(pre)?.product_name ?? 'Pre-order product';
const getPreCategory  = (pre: PreOrder) => getPreProduct(pre)?.category ?? 'Pre-order';
const getPreColor     = (pre: PreOrder) => getPreProduct(pre)?.selected_color ?? null;
const getPreInvoice   = (pre: PreOrder) => pre.invoice_number ?? `PRE-${pre.id}`;
const getDeposit      = (pre: PreOrder) => Number(pre.total_amount ?? 0);
const getOrderTotal   = (pre: PreOrder) => Number(pre.order_total ?? 0);
const getBalance      = (pre: PreOrder) => Math.max(getOrderTotal(pre) - getDeposit(pre), 0);
const getPct          = (pre: PreOrder) => {
    const total = getOrderTotal(pre);
    return total > 0 ? Math.round((getDeposit(pre) / total) * 100) : 0;
};

function PreOrderDetailDialog({ pre, onClose }: { pre: PreOrder | null; onClose: () => void }) {
    if (!pre) return null;

    const cfg      = PRE_CFG[pre.status] ?? PRE_CFG.upcoming;
    const pct      = getPct(pre);
    const balance  = getBalance(pre);
    const addr     = pre.shipping_address ?? MOCK_ADDRESS;
    const color    = getPreColor(pre);
    const isUpcoming   = pre.status === 'upcoming';
    const isDelivered  = pre.status === 'history';
    const isCancelled  = pre.status === 'cancelled';

    return (
        <Dialog open={!!pre} onOpenChange={onClose}>
            <DialogContent className="p-0 overflow-hidden bg-white rounded-xl border border-gray-200 shadow-lg sm:max-w-4xl mx-auto">
                <DialogHeader className="px-5 py-4 border-b border-gray-100">
                    <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-0.5">{getPreCategory(pre)}</p>
                            <DialogTitle className="text-sm font-bold text-slate-900 leading-snug">{getPreName(pre)}</DialogTitle>
                            <DialogDescription className="sr-only">Pre-order details</DialogDescription>
                        </div>
                        <span className={`shrink-0 inline-flex items-center text-[11px] font-bold px-2 py-0.5 rounded border ${cfg.cls}`}>
                            {cfg.label}
                        </span>
                    </div>
                </DialogHeader>

                <div className="px-5 py-4 space-y-4 max-h-[72vh] overflow-y-auto [&::-webkit-scrollbar]:w-0 [scrollbar-width:none]">

                    {/* ── UPCOMING: minimal view ─────────────────────── */}
                    {isUpcoming && (
                        <>
                            {/* Expected arrival — prominent */}
                            <div className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg bg-gray-50">
                                <div className="p-2 bg-white border border-gray-200 rounded-lg shrink-0">
                                    <Calendar size={16} className="text-(--colour-fsP2)" />
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Coming Soon</p>
                                    <p className="text-sm font-bold text-slate-900 mt-0.5">{fmt(pre.expected_date)}</p>
                                </div>
                            </div>

                            {/* Core fields */}
                            <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                                <DRow label="Deposit Paid" value={<span className="text-sm font-bold text-(--colour-fsP2)">{fmtRs(getDeposit(pre))}</span>} />
                                <DRow label="Payment Method" value={fmtPayment(pre.payment_type ?? '')} />
                                <DRow label="Date of Purchase" value={fmt(pre.created_at)} />
                                <DRow label="Reservation ID" value={getPreInvoice(pre)} />
                                {color && <DRow label="Colour / Variant" value={color} />}
                            </div>

                            {pre.note && (
                                <div className="p-3 border border-gray-200 rounded-lg bg-gray-50">
                                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Note</p>
                                    <p className="text-xs font-semibold text-slate-800 leading-relaxed">{pre.note}</p>
                                </div>
                            )}
                        </>
                    )}

                    {/* ── PAID / READY ───────────────────────────────── */}
                    {pre.status === 'paid' && (
                        <>
                            <div className="grid grid-cols-2 divide-x border border-gray-200 rounded-lg overflow-hidden">
                                <div className="px-4 py-3">
                                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Total Paid</p>
                                    <p className="text-sm font-bold text-slate-900">{fmtRs(getOrderTotal(pre))}</p>
                                </div>
                                <div className="px-4 py-3">
                                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Expected</p>
                                    <p className="text-sm font-bold text-(--colour-fsP2)">{fmt(pre.expected_date)}</p>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                                <DRow label="Payment Method" value={fmtPayment(pre.payment_type ?? '')} />
                                <DRow label="Date of Purchase" value={fmt(pre.created_at)} />
                                <DRow label="Reservation ID" value={getPreInvoice(pre)} />
                                {color && <DRow label="Colour / Variant" value={color} />}
                            </div>
                        </>
                    )}

                    {/* ── PROCESSING ─────────────────────────────────── */}
                    {pre.status === 'processing' && (
                        <>
                            <div className="grid grid-cols-3 divide-x border border-gray-200 rounded-lg overflow-hidden">
                                <div className="px-3 py-3">
                                    <p className="text-[10px] font-bold text-slate-500 uppercase mb-1">Deposit</p>
                                    <p className="text-sm font-bold text-slate-900">{fmtRs(getDeposit(pre))}</p>
                                </div>
                                <div className="px-3 py-3">
                                    <p className="text-[10px] font-bold text-slate-500 uppercase mb-1">Balance</p>
                                    <p className="text-sm font-bold text-(--colour-fsP2)">{fmtRs(balance)}</p>
                                </div>
                                <div className="px-3 py-3">
                                    <p className="text-[10px] font-bold text-slate-500 uppercase mb-1">Expected</p>
                                    <p className="text-sm font-bold text-slate-900">{fmt(pre.expected_date)}</p>
                                </div>
                            </div>
                            <div className="h-0.75 bg-gray-100 rounded-full overflow-hidden">
                                <div className="h-full bg-(--colour-fsP2) rounded-full transition-all duration-700" style={{ width: `${pct}%` }} />
                            </div>
                            <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                                <DRow label="Payment Method" value={fmtPayment(pre.payment_type ?? '')} />
                                <DRow label="Date of Purchase" value={fmt(pre.created_at)} />
                                <DRow label="Reservation ID" value={getPreInvoice(pre)} />
                                {color && <DRow label="Colour / Variant" value={color} />}
                            </div>
                        </>
                    )}

                    {/* ── DELIVERED / HISTORY ────────────────────────── */}
                    {isDelivered && (
                        <>
                            <div className="grid grid-cols-2 divide-x border border-gray-200 rounded-lg overflow-hidden">
                                <div className="px-4 py-3">
                                    <p className="text-[10px] font-bold text-slate-500 uppercase mb-1">Total Paid</p>
                                    <p className="text-sm font-bold text-slate-900">{fmtRs(getOrderTotal(pre))}</p>
                                </div>
                                <div className="px-4 py-3">
                                    <p className="text-[10px] font-bold text-slate-500 uppercase mb-1">Payment Method</p>
                                    <p className="text-sm font-bold text-slate-900">{fmtPayment(pre.payment_type ?? '')}</p>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                                <DRow label="Date of Purchase" value={fmt(pre.created_at)} />
                                <DRow label="Reservation ID" value={getPreInvoice(pre)} />
                                {color && <DRow label="Colour / Variant" value={color} />}
                            </div>
                        </>
                    )}

                    {/* ── CANCELLED ──────────────────────────────────── */}
                    {isCancelled && (
                        <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                            <DRow label="Deposit Paid" value={fmtRs(getDeposit(pre))} />
                            <DRow label="Payment Method" value={fmtPayment(pre.payment_type ?? '')} />
                            <DRow label="Date of Purchase" value={fmt(pre.created_at)} />
                            <DRow label="Reservation ID" value={getPreInvoice(pre)} />
                        </div>
                    )}

                    {/* ── Shipping address (all statuses) ────────────── */}
                    <DSection>Shipping Address</DSection>
                    <div className="flex items-start gap-3 p-3 border border-gray-200 rounded-lg bg-gray-50">
                        <div className="p-1.5 bg-white border border-gray-200 rounded-lg shrink-0">
                            <MapPin size={13} className="text-(--colour-fsP2)" />
                        </div>
                        <div>
                            <p className="text-xs font-bold text-slate-900">{addr.name}</p>
                            <p className="text-xs font-semibold text-slate-600 mt-0.5">{addr.address}, {addr.city}</p>
                            <p className="text-xs font-semibold text-slate-500">{addr.phone}</p>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}

export default function PreOrdersSection() {
    const [detail, setDetail] = useState<PreOrder | null>(null);
    const [searchTerm, setSearchTerm] = useState('');

    const filtered = MOCK_PRE_ORDERS.filter(pre => {
        const product = getPreName(pre).toLowerCase();
        const invoice = getPreInvoice(pre).toLowerCase();
        const search = searchTerm.toLowerCase();
        return product.includes(search) || invoice.includes(search);
    });

    return (
        <div className="space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-gray-100">
                <div>
                    <h2 className="text-lg font-bold text-slate-900">Pre-orders</h2>
                    <p className="text-xs text-slate-500 mt-0.5">Reserved products currently in production</p>
                </div>
                <div className="relative w-full sm:w-52">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
                    <input
                        type="text"
                        placeholder="Search product or ID..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full h-9 pl-9 pr-3 bg-gray-50 border border-gray-200 rounded-lg text-xs focus:outline-none focus:border-(--colour-fsP2) focus:bg-white transition-colors"
                    />
                </div>
            </div>

            {filtered.length === 0 ? (
                <EmptyState
                    label={searchTerm ? 'No reservations found' : 'No pre-orders'}
                    sub={searchTerm ? 'Try another product name or ID.' : 'Reserved products will appear here.'}
                />
            ) : (
                <div className="space-y-2">
                    {filtered.map(pre => {
                        const cfg = PRE_CFG[pre.status] ?? PRE_CFG.upcoming;
                        const pct = getPct(pre);

                        return (
                            <div key={pre.id} className="border border-gray-200 rounded-xl overflow-hidden bg-white">
                                <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
                                    <div className="min-w-0">
                                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{getPreCategory(pre)}</p>
                                        <p className="text-sm font-bold text-slate-900 truncate">{getPreName(pre)}</p>
                                    </div>
                                    <span className={`shrink-0 ml-3 inline-flex items-center text-[11px] font-bold px-2 py-0.5 rounded border ${cfg.cls}`}>
                                        {cfg.label}
                                    </span>
                                </div>

                                <div className="grid grid-cols-3 divide-x divide-gray-100">
                                    <div className="px-4 py-3">
                                        <p className="text-[10px] font-bold text-slate-500 uppercase mb-0.5">Deposit</p>
                                        <p className="text-sm font-bold text-slate-900">{fmtRs(getDeposit(pre))}</p>
                                    </div>
                                    <div className="px-4 py-3">
                                        <p className="text-[10px] font-bold text-slate-500 uppercase mb-0.5">
                                            {pre.status === 'upcoming' ? 'Coming' : 'Balance'}
                                        </p>
                                        <p className="text-sm font-bold text-(--colour-fsP2)">
                                            {pre.status === 'upcoming' ? fmt(pre.expected_date) : fmtRs(getBalance(pre))}
                                        </p>
                                    </div>
                                    <div className="px-4 py-3">
                                        <p className="text-[10px] font-bold text-slate-500 uppercase mb-0.5">Payment</p>
                                        <p className="text-sm font-bold text-slate-900">{fmtPayment(pre.payment_type ?? '')}</p>
                                    </div>
                                </div>

                                <div className="px-4 py-3 border-t border-gray-100 bg-gray-50/40">
                                    <div className="flex items-center justify-between mb-1.5">
                                        <p className="text-[10px] font-bold text-slate-500">ID: {getPreInvoice(pre)}</p>
                                        <span className="text-[10px] font-bold text-(--colour-fsP2)">{pct}%</span>
                                    </div>
                                    <div className="h-[2px] bg-gray-100 rounded-full overflow-hidden mb-2">
                                        <div className="h-full bg-(--colour-fsP2) rounded-full transition-all duration-700" style={{ width: `${pct}%` }} />
                                    </div>
                                    <div className="flex justify-end">
                                        <button
                                            onClick={() => setDetail(pre)}
                                            className="text-[11px] font-bold text-(--colour-fsP2) hover:underline"
                                        >
                                            View details →
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            <PreOrderDetailDialog pre={detail} onClose={() => setDetail(null)} />
        </div>
    );
}
