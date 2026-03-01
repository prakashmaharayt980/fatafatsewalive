'use client';

import React, { useState } from 'react';
import {
    Package, Eye, Undo, RotateCcw, Ban, Calendar,
    CheckCircle2, Clock, Truck, MapPin,
    User, Download, Headphones, XCircle, AlertTriangle,
    RefreshCcw, CreditCard,
} from 'lucide-react';
import {
    Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
    AlertDialog, AlertDialogContent,
    AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
    StatusBadge, FilterBar, EmptyState,
    fmt, fmtRs, isDelivered, MOCK_ADDRESS, MOCK_USER, MOCK_ORDERS,
    type Order,
} from './shared';

const noBar = '[&::-webkit-scrollbar]:w-0 [scrollbar-width:none]';
const isCOD = (t: string) => !t || t.toLowerCase().includes('cash') || t.toLowerCase().includes('cod');

// ─── Cancel Dialog ─────────────────────────────────────────────────────────────
function CancelDialog({
    order, open, onClose, onConfirm,
}: { order: Order | null; open: boolean; onClose: () => void; onConfirm: (reason: string) => void }) {
    const [reason, setReason] = useState('');
    if (!order) return null;

    const needsRefund = !isCOD(order.payment_type);

    return (
        <AlertDialog open={open} onOpenChange={onClose}>
            <AlertDialogContent className="bg-white rounded-2xl border border-gray-200 shadow-xl max-w-sm mx-4 p-0 overflow-hidden">

                {/* Header */}
                <AlertDialogHeader className="px-5 pt-5 pb-4 border-b border-gray-100">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-red-50 flex items-center justify-center shrink-0">
                            <AlertTriangle size={16} className="text-red-500" />
                        </div>
                        <div>
                            <AlertDialogTitle className="text-sm font-bold text-gray-900 leading-tight">Cancel Order</AlertDialogTitle>
                            <p className="text-[11px] text-gray-400 mt-0.5">#{order.invoice_number}</p>
                        </div>
                    </div>
                </AlertDialogHeader>

                <div className="px-5 py-4 space-y-4">
                    {/* Products */}
                    <div className="space-y-2">
                        {(order.items || []).map(item => (
                            <div key={item.id} className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 bg-gray-50">
                                <div className="w-10 h-10 rounded-lg border border-gray-200 bg-white flex items-center justify-center shrink-0 overflow-hidden">
                                    {item.product?.image?.thumb
                                        ? <img src={item.product.image.thumb} alt={item.product.name} className="w-full h-full object-contain p-0.5" />
                                        : <Package size={14} className="text-gray-300" />}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-[12px] font-semibold text-gray-800 truncate">{item.product?.name}</p>
                                    <p className="text-[11px] text-gray-400">Qty {item.quantity} · {fmtRs(item.price * item.quantity)}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Refund note — only if NOT COD */}
                    {needsRefund && (
                        <div className="flex items-start gap-2.5 px-3.5 py-3 bg-blue-50 border border-blue-100 rounded-xl">
                            <RefreshCcw size={14} className="text-[var(--colour-fsP2)] shrink-0 mt-0.5" />
                            <div className="text-[11px] leading-relaxed">
                                <p className="font-bold text-[var(--colour-fsP2)]">Refund of {fmtRs(order.order_total)} will be processed</p>
                                <p className="text-gray-500 mt-0.5">
                                    Paid via <span className="font-semibold capitalize">{order.payment_type?.replace(/_/g, ' ')}</span>.
                                    Refund takes 3–5 business days to your original payment method.
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Reason input */}
                    <div>
                        <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                            Reason for Cancellation <span className="text-red-400">*</span>
                        </label>
                        <textarea
                            value={reason}
                            onChange={e => setReason(e.target.value)}
                            placeholder="e.g. Changed my mind, found a better price..."
                            rows={3}
                            className="w-full text-[12px] text-gray-800 placeholder-gray-400 border border-gray-200 rounded-xl px-3.5 py-2.5 resize-none focus:outline-none focus:border-[var(--colour-fsP2)] focus:ring-1 focus:ring-blue-200 transition-colors"
                        />
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 pt-1">
                        <button onClick={onClose}
                            className="flex-1 py-2.5 rounded-xl border border-gray-200 text-[12px] font-bold text-gray-600 hover:bg-gray-50 transition-colors">
                            Go Back
                        </button>
                        <button
                            disabled={!reason.trim()}
                            onClick={() => { onConfirm(reason); setReason(''); }}
                            className="flex-1 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 disabled:opacity-40 disabled:cursor-not-allowed text-[12px] font-bold text-white transition-colors">
                            Confirm Cancel
                        </button>
                    </div>
                </div>

            </AlertDialogContent>
        </AlertDialog>
    );
}

// ─── Order Detail Dialog ──────────────────────────────────────────────────────
function OrderDetailDialog({ order, onClose, onCancelClick }: {
    order: Order | null;
    onClose: () => void;
    onCancelClick: () => void;
}) {
    if (!order) return null;

    const status = order.order_status?.toLowerCase() ?? '';
    const delivered = isDelivered(order.order_status);
    const isCancelled = status.includes('cancel');
    const isPlaced = status.includes('placed') || status.includes('pending');
    const addr = order.shipping_address ?? MOCK_ADDRESS;
    const user = order.user ?? MOCK_USER;
    const subtotal = order.order_total - (order.shipping_cost || 0);
    const isCod = isCOD(order.payment_type);

    const steps = [
        { label: 'Placed', icon: CheckCircle2, done: true, date: fmt(order.created_at) },
        { label: 'Processing', icon: Clock, done: !!order.processed_at || (!isCancelled && !isPlaced), date: order.processed_at ? fmt(order.processed_at) : null },
        { label: 'Shipped', icon: Truck, done: !!order.shipped_at || delivered, date: order.shipped_at ? fmt(order.shipped_at) : null },
        { label: 'Delivered', icon: Package, done: delivered, date: order.delivered_at ? fmt(order.delivered_at) : null },
    ];
    const activeStep = steps.filter(s => s.done).length - 1;

    return (
        <Dialog open={!!order} onOpenChange={onClose}>
            <DialogContent className={`
                w-full max-w-lg sm:max-w-lg
                max-h-[95dvh] sm:max-h-[90dvh]
                p-0 flex flex-col gap-0
                bg-white border border-gray-200 shadow-2xl
                rounded-t-2xl sm:rounded-2xl overflow-hidden
                ${noBar}
            `}>

                {/* ── Header ── */}
                <DialogHeader className="shrink-0 px-5 pt-4 pb-3 border-b border-gray-100">
                    <div className="flex items-center gap-3">
                        <div className="flex-1 min-w-0">
                            <DialogTitle className="text-[14px] font-bold text-gray-900 truncate">
                                Order #{order.invoice_number}
                            </DialogTitle>
                            <p className="text-[11px] text-gray-400 mt-0.5 flex items-center gap-1.5">
                                <Calendar size={10} /> {fmt(order.created_at)}
                                <span className="mx-1 text-gray-300">·</span>
                                <StatusBadge status={order.order_status} />
                            </p>
                        </div>
                    </div>
                </DialogHeader>

                {/* ── Scrollable body ── */}
                <div className={`flex-1 overflow-y-auto ${noBar} pb-[68px]`}>

                    {/* ── CANCELLED: minimal view ── */}
                    {isCancelled ? (
                        <div className="px-5 pt-5 space-y-4 pb-6">
                            {/* Cancelled banner */}
                            <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-100 rounded-xl">
                                <XCircle size={18} className="text-red-500 shrink-0 mt-0.5" />
                                <div>
                                    <p className="text-sm font-bold text-red-700">Order Cancelled</p>
                                    <p className="text-[11px] text-red-500 mt-0.5">
                                        Cancelled on {fmt(order.cancelled_at ?? order.created_at)}.
                                    </p>
                                    {order.cancel_reason && (
                                        <p className="text-[11px] text-red-400 mt-1 italic">"{order.cancel_reason}"</p>
                                    )}
                                </div>
                            </div>

                            {/* Refund notice if not COD */}
                            {!isCod && (
                                <div className="flex items-start gap-3 p-4 bg-blue-50 border border-blue-100 rounded-xl">
                                    <CreditCard size={16} className="text-[var(--colour-fsP2)] shrink-0 mt-0.5" />
                                    <div>
                                        <p className="text-[12px] font-bold text-[var(--colour-fsP2)]">
                                            Refund of {fmtRs(order.order_total)} requested
                                        </p>
                                        <p className="text-[11px] text-gray-500 mt-0.5">
                                            Your refund via <span className="font-semibold capitalize">{order.payment_type?.replace(/_/g, ' ')}</span> will be processed within 3–5 business days.
                                        </p>
                                    </div>
                                </div>
                            )}

                            {/* Products only */}
                            <div>
                                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">Items Cancelled</p>
                                <div className="space-y-2">
                                    {(order.items || []).map(item => (
                                        <div key={item.id} className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 bg-gray-50">
                                            <div className="w-11 h-11 shrink-0 rounded-xl border border-gray-200 bg-white flex items-center justify-center overflow-hidden">
                                                {item.product?.image?.thumb
                                                    ? <img src={item.product.image.thumb} alt={item.product.name} className="w-full h-full object-contain p-0.5" />
                                                    : <Package size={16} className="text-gray-300" />}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-[12px] font-semibold text-gray-700 truncate">{item.product?.name}</p>
                                                <p className="text-[11px] text-gray-400 mt-0.5">Qty {item.quantity} · {fmtRs(item.price * item.quantity)}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                    ) : (
                        /* ── ACTIVE ORDER: full view ── */
                        <div className="space-y-0">

                            {/* Status banner */}
                            <div className="mx-5 mt-4 mb-3 flex items-center gap-3 px-4 py-3 rounded-xl"
                                style={{ background: `linear-gradient(120deg, var(--colour-fsP2) 0%, #0f4c9e 100%)` }}>
                                <div className="shrink-0 p-2 rounded-lg bg-white/20">
                                    {delivered ? <CheckCircle2 size={20} className="text-white" /> : <Truck size={20} className="text-white" />}
                                </div>
                                <div className="text-white min-w-0">
                                    <p className="text-[13px] font-bold leading-tight">
                                        {delivered ? 'Order Delivered' : isPlaced ? 'Order Placed' : 'On Its Way'}
                                    </p>
                                    <p className="text-[11px] text-white/70 mt-0.5">
                                        {delivered
                                            ? `Delivered on ${fmt(order.delivered_at ?? '')}`
                                            : isPlaced
                                                ? 'Your order is received and will be processed soon.'
                                                : 'Expected delivery in 2–5 business days.'}
                                    </p>
                                </div>
                            </div>

                            {/* Journey stepper */}
                            <div className="px-5 pb-4">
                                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-3">Order Journey</p>
                                <div className="flex items-start">
                                    {steps.map((step, i) => {
                                        const Icon = step.icon;
                                        const isActive = i === activeStep;
                                        return (
                                            <div key={i} className="flex-1 flex flex-col items-center relative">
                                                {i > 0 && (
                                                    <div className="absolute left-0 right-1/2 top-[15px] h-0.5"
                                                        style={{ background: steps[i].done ? 'var(--colour-fsP2)' : '#e5e7eb' }} />
                                                )}
                                                {i < steps.length - 1 && (
                                                    <div className="absolute left-1/2 right-0 top-[15px] h-0.5"
                                                        style={{ background: steps[i + 1].done ? 'var(--colour-fsP2)' : '#e5e7eb' }} />
                                                )}
                                                <div className={`relative z-10 w-7 h-7 rounded-full flex items-center justify-center border-2 ${step.done ? 'text-white border-transparent' : 'bg-white border-gray-200 text-gray-300'
                                                    } ${isActive ? 'ring-4 ring-blue-100' : ''}`}
                                                    style={step.done ? { background: 'var(--colour-fsP2)', borderColor: 'var(--colour-fsP2)' } : {}}>
                                                    <Icon size={12} />
                                                </div>
                                                <p className={`text-[9px] font-bold mt-1 text-center ${step.done ? 'text-gray-700' : 'text-gray-400'}`}>
                                                    {step.label}
                                                </p>
                                                {step.done && step.date && (
                                                    <p className="text-[9px] text-[var(--colour-fsP2)] font-mono mt-0.5 text-center">{step.date}</p>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Items */}
                            <div className="px-5 pb-4">
                                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">
                                    Items ({(order.items || []).length})
                                </p>
                                <div className="space-y-2">
                                    {(order.items || []).map(item => (
                                        <div key={item.id} className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 hover:border-gray-200 hover:bg-gray-50/50 transition-all">
                                            <div className="w-12 h-12 shrink-0 rounded-xl border border-gray-200 bg-white flex items-center justify-center overflow-hidden">
                                                {item.product?.image?.thumb
                                                    ? <img src={item.product.image.thumb} alt={item.product.name} className="w-full h-full object-contain p-1 group-hover:scale-105 transition-transform" />
                                                    : <Package size={16} className="text-gray-300" />}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-[12px] font-semibold text-gray-900 truncate">{item.product?.name}</p>
                                                <p className="text-[11px] text-gray-500 mt-0.5">Qty {item.quantity} · Unit {fmtRs(item.price)}</p>
                                            </div>
                                            <p className="text-[13px] font-bold text-[var(--colour-fsP2)] shrink-0">{fmtRs(item.price * item.quantity)}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Payment summary */}
                            <div className="px-5 pb-4">
                                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">Payment Summary</p>
                                <div className="rounded-xl border border-gray-100 overflow-hidden">
                                    <div className="bg-gray-50 px-4 py-3 space-y-2 text-[12px]">
                                        <div className="flex justify-between text-gray-500">
                                            <span>Subtotal</span>
                                            <span className="font-semibold text-gray-800">{fmtRs(subtotal)}</span>
                                        </div>
                                        <div className="flex justify-between text-gray-500">
                                            <span>Shipping</span>
                                            <span className={`font-semibold ${(order.shipping_cost || 0) > 0 ? 'text-gray-800' : 'text-green-600'}`}>
                                                {(order.shipping_cost || 0) > 0 ? fmtRs(order.shipping_cost) : 'Free'}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between px-4 py-3 bg-gray-900 text-white">
                                        <div>
                                            <p className="text-[9px] text-white/40 uppercase tracking-wider">Total</p>
                                            <p className="text-[17px] font-bold">{fmtRs(order.order_total)}</p>
                                        </div>
                                        <span className="text-[11px] bg-white/20 px-3 py-1 rounded-full font-semibold capitalize">
                                            {order.payment_type?.replace(/_/g, ' ') || 'Cash On Delivery'}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Delivery */}
                            <div className="px-5 pb-6">
                                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">Delivery Details</p>
                                <div className="rounded-xl border border-gray-100 divide-y divide-gray-50 overflow-hidden">
                                    <div className="flex items-start gap-3 px-4 py-3">
                                        <User size={13} className="text-gray-400 shrink-0 mt-0.5" />
                                        <div className="min-w-0">
                                            <p className="text-[12px] font-semibold text-gray-900">{user.name}</p>
                                            <p className="text-[11px] text-gray-500 mt-0.5">{user.phone} · {user.email}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-3 px-4 py-3">
                                        <MapPin size={13} className="text-gray-400 shrink-0 mt-0.5" />
                                        <div>
                                            <p className="text-[12px] font-semibold text-gray-900">{addr.name}</p>
                                            <p className="text-[11px] text-gray-500 mt-0.5">{addr.address}, {addr.city}</p>
                                        </div>
                                    </div>
                                </div>
                                {order.notes && (
                                    <p className="mt-2 text-[11px] text-gray-500 px-1 italic">Note: {order.notes}</p>
                                )}
                            </div>

                        </div>
                    )}

                </div>

                {/* ── Sticky footer ── */}
                <div className="absolute bottom-0 left-0 right-0 flex gap-2.5 px-5 py-3 bg-white border-t border-gray-100 shadow-[0_-4px_20px_rgba(0,0,0,0.06)]">
                    <button className="flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl border border-gray-200 hover:bg-gray-50 text-[12px] font-bold text-gray-700 transition-colors">
                        <Download size={13} /> Invoice
                    </button>
                    {isPlaced && (
                        <button onClick={onCancelClick}
                            className="flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl border border-red-200 bg-red-50 hover:bg-red-100 text-[12px] font-bold text-red-600 transition-colors">
                            <Ban size={13} /> Cancel
                        </button>
                    )}
                    {!isCancelled && (
                        <button className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-[12px] font-bold text-white transition-opacity hover:opacity-90"
                            style={{ background: 'linear-gradient(120deg, var(--colour-fsP2), #0f4c9e)' }}>
                            <Headphones size={13} /> Support
                        </button>
                    )}
                    {isCancelled && (
                        <button className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-[12px] font-bold text-gray-700 transition-colors">
                            <RotateCcw size={13} /> Buy Again
                        </button>
                    )}
                </div>

            </DialogContent>
        </Dialog>
    );
}

// ─── Orders Section ────────────────────────────────────────────────────────────
export default function OrdersSection({ orders: rawOrders, loading, error }: {
    orders: Order[]; loading: boolean; error: string | null;
}) {
    const orders = rawOrders?.length ? rawOrders : MOCK_ORDERS;

    const [filter, setFilter] = useState('all');
    const [detailOrder, setDetail] = useState<Order | null>(null);
    const [cancelTarget, setCancelTarget] = useState<Order | null>(null);

    const FILTERS = [
        { key: 'all', label: 'All', cnt: orders.length },
        { key: 'placed', label: 'Placed', cnt: orders.filter(o => o.order_status?.toLowerCase().includes('placed')).length },
        { key: 'process', label: 'Processing', cnt: orders.filter(o => o.order_status?.toLowerCase().includes('process')).length },
        { key: 'deliver', label: 'Delivered', cnt: orders.filter(o => o.order_status?.toLowerCase().includes('deliver')).length },
        { key: 'cancel', label: 'Cancelled', cnt: orders.filter(o => o.order_status?.toLowerCase().includes('cancel')).length },
    ];

    const filtered = filter === 'all'
        ? orders
        : orders.filter(o => o.order_status?.toLowerCase().includes(filter));

    if (loading) return (
        <div className="flex items-center justify-center py-20">
            <div className="w-5 h-5 border-2 border-[var(--colour-fsP2)] border-t-transparent rounded-full animate-spin" />
        </div>
    );
    if (error) return <EmptyState label="Could not load orders" sub={error} />;

    const openCancel = (o: Order) => setCancelTarget(o);

    return (
        <div className="space-y-3">
            <FilterBar filters={FILTERS} active={filter} onSelect={setFilter} />

            {filtered.length === 0
                ? <EmptyState label="No orders found" sub="Try a different filter." />
                : filtered.map(order => {
                    const status = order.order_status?.toLowerCase() ?? '';
                    const isPlaced = status.includes('placed') || status.includes('pending');
                    const isCancelled = status.includes('cancel');
                    return (
                        <div key={order.id}
                            className="border border-gray-100 rounded-xl bg-white overflow-hidden hover:border-gray-200 hover:shadow-sm transition-all">

                            {/* Header */}
                            <div className="flex items-center justify-between px-4 py-2.5 bg-gray-50 border-b border-gray-100">
                                <div>
                                    <p className="text-[12px] font-bold text-gray-800">{order.invoice_number}</p>
                                    <p className="text-[10px] text-gray-400 flex items-center gap-1 mt-0.5">
                                        <Calendar size={9} /> {fmt(order.created_at)}
                                    </p>
                                </div>
                                <StatusBadge status={order.order_status} />
                            </div>

                            {/* Items */}
                            <div className="divide-y divide-gray-50">
                                {(order.items || []).slice(0, 2).map(item => (
                                    <div key={item.id} className="flex items-center gap-3 px-4 py-2.5">
                                        <div className="w-9 h-9 rounded-lg border border-gray-100 bg-gray-50 overflow-hidden shrink-0 flex items-center justify-center">
                                            {item.product?.image?.thumb
                                                ? <img src={item.product.image.thumb} alt={item.product.name} className="w-full h-full object-cover" />
                                                : <Package size={13} className="text-gray-300" />}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-[12px] font-medium text-gray-800 truncate">{item.product?.name}</p>
                                            <p className="text-[10px] text-gray-400">Qty: {item.quantity}</p>
                                        </div>
                                        <p className="text-[11px] font-semibold text-[var(--colour-fsP2)] shrink-0">{fmtRs(item.price)}</p>
                                    </div>
                                ))}
                                {(order.items?.length ?? 0) > 2 && (
                                    <p className="text-center text-[10px] text-gray-400 py-1.5">
                                        +{order.items.length - 2} more items
                                    </p>
                                )}
                            </div>

                            {/* Footer */}
                            <div className="flex items-center justify-between px-4 py-2.5 border-t border-gray-100 gap-2 flex-wrap">
                                <div>
                                    <p className="text-[10px] text-gray-400 uppercase tracking-wider">Total</p>
                                    <p className="text-[13px] font-bold text-[var(--colour-fsP2)]">{fmtRs(order.order_total)}</p>
                                </div>
                                <div className="flex items-center gap-1.5 flex-wrap justify-end">
                                    <button onClick={() => setDetail(order)}
                                        className="flex items-center gap-1 text-[11px] font-semibold text-gray-600 border border-gray-200 px-2.5 py-1.5 rounded-lg hover:border-[var(--colour-fsP2)] hover:text-[var(--colour-fsP2)] transition-colors">
                                        <Eye size={11} /> Details
                                    </button>
                                    {!isCancelled && (
                                        <button className="flex items-center gap-1 text-[11px] font-semibold text-[var(--colour-fsP2)] border border-[var(--colour-fsP2)] px-2.5 py-1.5 rounded-lg hover:bg-blue-50 transition-colors">
                                            <RotateCcw size={11} /> Buy Again
                                        </button>
                                    )}
                                    {status.includes('deliver') && (
                                        <button className="flex items-center gap-1 text-[11px] font-semibold text-[var(--colour-fsP1)] border border-[var(--colour-fsP1)] px-2.5 py-1.5 rounded-lg hover:bg-orange-50 transition-colors">
                                            <Undo size={11} /> Return
                                        </button>
                                    )}
                                    {isPlaced && (
                                        <button onClick={() => openCancel(order)}
                                            className="flex items-center gap-1 text-[11px] font-semibold text-red-500 border border-red-200 px-2.5 py-1.5 rounded-lg hover:bg-red-50 transition-colors">
                                            <Ban size={11} /> Cancel
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    );
                })
            }

            <OrderDetailDialog
                order={detailOrder}
                onClose={() => setDetail(null)}
                onCancelClick={() => { if (detailOrder) { setCancelTarget(detailOrder); } }}
            />

            <CancelDialog
                order={cancelTarget}
                open={!!cancelTarget}
                onClose={() => setCancelTarget(null)}
                onConfirm={(reason) => {
                    // TODO: call cancel API with reason
                    console.log('Cancel reason:', reason, 'for order:', cancelTarget?.invoice_number);
                    setCancelTarget(null);
                }}
            />
        </div>
    );
}
