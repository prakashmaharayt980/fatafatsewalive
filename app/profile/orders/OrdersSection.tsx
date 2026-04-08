'use client';

import React, { useState, useEffect } from 'react';
import { OrderService } from '../../api/services/order.service';
import {
    Package, RotateCcw, Ban,
    MapPin, User, XCircle,
    RefreshCcw, CreditCard, Navigation,
} from 'lucide-react';
import { APIProvider, Map, AdvancedMarker } from '@vis.gl/react-google-maps';
import {
    AlertDialog, AlertDialogContent,
    AlertDialogHeader, AlertDialogTitle, AlertDialogDescription,
} from "@/components/ui/alert-dialog";
import {
    Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
    StatusBadge, EmptyState,
    fmt, fmtRs, isDelivered,
    type Order,
} from './shared';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const noBar = '[&::-webkit-scrollbar]:w-0 [scrollbar-width:none]';
const isCOD = (t: string) => !t || t.toLowerCase().includes('cash_on_delivery') || t.toLowerCase().includes('cod');

// ─── Cancel Dialog ──────────────────────────────────────────────────────────
function CancelDialog({
    order, open, onClose, onConfirm,
}: { order: Order | null; open: boolean; onClose: () => void; onConfirm: (reason: string) => void }) {
    const [reason, setReason] = useState('');
    if (!order) return null;
    const needsRefund = !isCOD(order.payment_type);

    return (
        <AlertDialog open={open} onOpenChange={onClose}>
            <AlertDialogContent className="bg-white rounded-xl border border-gray-200 p-0 overflow-hidden">
                <AlertDialogHeader className="px-4 py-3.5 border-b border-gray-100">
                    <AlertDialogTitle className="text-sm font-bold text-slate-900">Cancel Order</AlertDialogTitle>
                    <AlertDialogDescription className="text-xs text-slate-500 mt-0.5">
                        #{order.invoice_number}
                    </AlertDialogDescription>
                </AlertDialogHeader>

                <div className="px-4 pt-4 pb-3 space-y-3">
                    <div className={`divide-y divide-gray-100 border border-gray-100 rounded-lg overflow-y-auto max-h-40 ${noBar}`}>
                        {(order.items || []).map(item => (
                            <div key={item.id} className="flex items-center gap-3 px-3 py-2.5">
                                <div className="w-8 h-8 rounded border border-gray-100 bg-gray-50 flex items-center justify-center shrink-0 overflow-hidden">
                                    {item.product?.thumb?.url
                                        ? <Image src={item.product.thumb.url} alt={item.product.name} width={32} height={32} className="w-full h-full object-contain" />
                                        : <Package size={13} className="text-gray-300" />}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-xs font-semibold text-slate-900 truncate">{item.product?.name}</p>
                                    <p className="text-[11px] text-slate-500 mt-0.5">{fmtRs(item.price ?? item.product?.price?.current)} × {item.quantity}</p>
                                </div>
                                <p className="text-xs font-bold text-(--colour-fsP2) shrink-0">{fmtRs((item.price ?? item.product?.price?.current) * item.quantity)}</p>
                            </div>
                        ))}
                    </div>

                    {needsRefund && (
                        <div className="flex items-center gap-2.5 p-3 border border-gray-100 rounded-lg">
                            <RefreshCcw size={13} className="text-(--colour-fsP2) shrink-0" />
                            <div>
                                <p className="text-xs font-bold text-slate-900">{fmtRs(order.order_total)} will be refunded</p>
                                <p className="text-[11px] text-slate-500 mt-0.5 capitalize">
                                    {order.payment_type?.replace(/_/g, ' ')} · 3–5 business days
                                </p>
                            </div>
                        </div>
                    )}

                    <div>
                        <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-widest mb-1.5">
                            Reason *
                        </label>
                        <textarea
                            value={reason}
                            onChange={e => setReason(e.target.value)}
                            placeholder="Why are you cancelling this order?"
                            rows={3}
                            className="w-full text-xs text-slate-900 placeholder-gray-400 border border-gray-200 rounded-lg p-3 resize-none focus:outline-none focus:border-(--colour-fsP2) transition-colors"
                        />
                    </div>

                    <div className="flex gap-2 pb-1">
                        <button onClick={onClose}
                            className="flex-1 h-9 rounded-lg border border-gray-200 text-xs font-semibold text-slate-700 hover:bg-gray-50 transition-colors">
                            Keep Order
                        </button>
                        <button
                            disabled={!reason.trim()}
                            onClick={() => { onConfirm(reason); setReason(''); }}
                            className="flex-1 h-9 rounded-lg bg-red-500 hover:bg-red-600 disabled:opacity-30 disabled:cursor-not-allowed text-xs font-semibold text-white transition-colors">
                            Cancel Order
                        </button>
                    </div>
                </div>
            </AlertDialogContent>
        </AlertDialog>
    );
}

// ─── Order Detail Dialog ─────────────────────────────────────────────────────
export function OrderDetailDialog({
    order, onClose, onCancelClick,
}: {
    order: Order | null;
    onClose: () => void;
    onCancelClick: () => void;
}) {
    if (!order) return null;

    const router = useRouter();
    const status = order.order_status?.toLowerCase() ?? '';
    const delivered = isDelivered(order.order_status);
    const isCancelled = status.includes('cancel');
    const isPlaced = status.includes('placed') || status.includes('pending') || status.includes('confirm');
    const addr = order.shipping_address;
    const recipient = order.shipping_address?.contact_info;
    const subtotal = order.order_total - (order.shipping_cost || 0);
    const isCod = isCOD(order.payment_type);
    const isConfirmed = status.includes('confirm');
    const isProcessing = status.includes('process');

    const steps = [
        { label: 'Placed', done: true, date: fmt(order.created_at) },
        { label: 'Confirmed', done: isConfirmed || isProcessing || delivered, date: null },
        { label: 'Processing', done: isProcessing || delivered, date: null },
        { label: 'Delivered', done: delivered, date: null },
    ];
    const activeStep = steps.filter(s => s.done).length - 1;

    const handleBuyAgain = (slug: string) => {
        if (!slug) return;
        router.push(`/product-details/${slug}`);
        onClose();
    };

    return (
        <Dialog open={!!order} onOpenChange={onClose}>
            <DialogContent className={`w-full sm:max-w-2xl max-h-[95dvh] sm:max-h-[90dvh] p-0 flex flex-col gap-0 bg-white border border-gray-200 rounded-t-2xl sm:rounded-xl overflow-hidden ${noBar}`}>

                <DialogHeader className="shrink-0 px-4 sm:px-6 py-4 border-b border-gray-100">
                    <div className="flex items-center justify-between gap-4">
                        <div>
                            <DialogTitle className="text-sm font-bold text-slate-900">
                                #{order.invoice_number}
                            </DialogTitle>
                            <DialogDescription className="sr-only">Detailed view of your order.</DialogDescription>
                            <p className="text-[11px] text-slate-500 mt-0.5">{fmt(order.created_at)}</p>
                        </div>
                        <StatusBadge status={order.order_status} />
                    </div>
                </DialogHeader>

                <div className={`flex-1 overflow-y-auto ${noBar}`}>
                    {isCancelled ? (
                        <div className="p-4 sm:p-6 space-y-4">
                            <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-100 rounded-lg">
                                <XCircle size={14} className="text-red-400 shrink-0 mt-0.5" />
                                <div>
                                    <p className="text-sm font-bold text-red-700">Order Cancelled</p>
                                    <p className="text-xs text-red-400 mt-1">Cancelled on {fmt(order.created_at)}.</p>
                                    {order.cancel_reason && (
                                        <p className="text-xs text-red-400 mt-1 italic">"{order.cancel_reason}"</p>
                                    )}
                                </div>
                            </div>
                            {!isCod && (
                                <div className="flex items-start gap-3 p-4 bg-blue-50 border border-blue-100 rounded-lg">
                                    <CreditCard size={14} className="text-(--colour-fsP2) shrink-0 mt-0.5" />
                                    <div>
                                        <p className="text-sm font-bold text-(--colour-fsP2)">Refund of {fmtRs(order.order_total)} requested</p>
                                        <p className="text-xs text-slate-600 mt-1">
                                            Via <span className="font-semibold capitalize">{order.payment_type?.replace(/_/g, ' ')}</span> · 3–5 business days
                                        </p>
                                    </div>
                                </div>
                            )}
                            <div>
                                <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest border-b border-gray-100 pb-1.5 mb-3">Items Cancelled</p>
                                <div className="space-y-2">
                                    {(order.items || []).map(item => (
                                        <div key={item.id} className="flex items-center gap-3 p-3 border border-gray-100 rounded-lg">
                                            <div className="w-10 h-10 shrink-0 rounded border border-gray-100 bg-gray-50 flex items-center justify-center overflow-hidden">
                                                {item.product?.thumb?.url
                                                    ? <Image src={item.product.thumb.url} alt={item.product.name} width={40} height={40} className="w-full h-full object-contain" />
                                                    : <Package size={16} className="text-gray-300" />}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-semibold text-slate-900 truncate">{item.product?.name}</p>
                                                <p className="text-xs text-slate-500 mt-0.5">Qty {item.quantity} · {fmtRs((item.price ?? item.product?.price?.current) * item.quantity)}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="divide-y divide-gray-100">

                            <div className="px-4 sm:px-6 py-5">
                                <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest mb-5">Order Tracking</p>
                                <TrackingBar steps={steps} activeStep={activeStep} />
                            </div>

                            <div className="px-4 sm:px-6 py-4">
                                <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest border-b border-gray-100 pb-1.5 mb-3">
                                    Items · {(order.items || []).length}
                                </p>
                                <div className="space-y-1.5">
                                    {(order.items || []).map(item => (
                                        <div key={item.id} className="flex items-center gap-3 py-2.5 border-b border-gray-50 last:border-0">
                                            <div className="w-11 h-11 shrink-0 rounded-lg border border-gray-100 bg-gray-50 flex items-center justify-center overflow-hidden">
                                                {item.product?.thumb?.url
                                                    ? <Image src={item.product.thumb.url} alt={item.product.name} width={44} height={44} className="w-full h-full object-contain p-0.5" />
                                                    : <Package size={16} className="text-gray-300" />}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-xs font-bold text-slate-900 truncate">{item.product?.name}</p>
                                                <p className="text-[11px] text-slate-500 mt-0.5">
                                                    {fmtRs(item.price ?? item.product?.price?.current)} × {item.quantity}
                                                </p>
                                            </div>
                                            <p className="text-xs font-bold text-(--colour-fsP2) shrink-0">{fmtRs((item.price ?? item.product?.price?.current) * item.quantity)}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-gray-100">
                                <div className="px-4 sm:px-6 py-5">
                                    <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest border-b border-gray-100 pb-1.5 mb-4">Delivery</p>
                                    <div className="space-y-3">
                                        {addr ? (
                                            <>
                                                <div className="flex items-start gap-3">
                                                    <User size={14} className="text-(--colour-fsP2) mt-0.5 shrink-0" />
                                                    <div>
                                                        <p className="text-sm font-bold text-slate-900">{recipient?.first_name} {recipient?.last_name}</p>
                                                        <p className="text-xs text-slate-500 mt-0.5">{recipient?.contact_number}</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-start gap-3 p-3 bg-gray-50 border border-gray-100 rounded-xl relative">
                                                    <div className="w-8 h-8 rounded-lg bg-white border border-gray-200 flex items-center justify-center shrink-0">
                                                        <MapPin size={14} className="text-(--colour-fsP2)" />
                                                    </div>
                                                    <div className="min-w-0 pr-8">
                                                        <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-0.5">Shipping Address</p>
                                                        <p className="text-sm font-bold text-slate-900 leading-snug">{addr.address.landmark}, {addr.address.city}</p>
                                                        <p className="text-xs text-slate-500 mt-0.5">
                                                            {[addr.address.district, addr.address.province, addr.address.country].filter(Boolean).join(', ')}
                                                        </p>
                                                        {addr.address.label && (
                                                            <span className="inline-block mt-1.5 text-[10px] font-semibold text-(--colour-fsP2) bg-blue-50 border border-blue-100 px-2 py-0.5 rounded">
                                                                {addr.address.label}
                                                            </span>
                                                        )}
                                                    </div>
                                                    {addr.geo && (
                                                        <a
                                                            href={`https://www.google.com/maps/search/?api=1&query=${addr.geo.lat},${addr.geo.lng}`}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="absolute top-3 right-3 p-1.5 rounded-lg bg-white border border-gray-200 text-slate-400 hover:text-(--colour-fsP2) transition-colors"
                                                        >
                                                            <Navigation size={12} />
                                                        </a>
                                                    )}
                                                </div>
                                                {addr.geo && addr.geo.lat !== 0 && (
                                                    <div className="relative h-36 rounded-xl overflow-hidden border border-gray-200">
                                                        <APIProvider apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ''}>
                                                            <Map
                                                                mapId={process.env.NEXT_PUBLIC_MAP_ID ?? 'delivery-map'}
                                                                defaultCenter={{ lat: Number(addr.geo.lat), lng: Number(addr.geo.lng) }}
                                                                defaultZoom={15}
                                                                gestureHandling="none"
                                                                disableDefaultUI
                                                                className="w-full h-full"
                                                            >
                                                                <AdvancedMarker position={{ lat: Number(addr.geo.lat), lng: Number(addr.geo.lng) }}>
                                                                    <div className="w-6 h-6 bg-(--colour-fsP2) rounded-full border-2 border-white shadow-lg flex items-center justify-center">
                                                                        <MapPin size={12} className="text-white" />
                                                                    </div>
                                                                </AdvancedMarker>
                                                            </Map>
                                                        </APIProvider>
                                                    </div>
                                                )}
                                            </>
                                        ) : (
                                            <div className="p-4 text-center bg-gray-50 rounded-xl border border-dashed border-gray-200">
                                                <p className="text-xs text-slate-500">No shipping address provided</p>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="px-4 sm:px-6 py-5">
                                    <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest border-b border-gray-100 pb-1.5 mb-4">Payment</p>
                                    <div className="space-y-2">
                                        <div className="flex justify-between text-xs text-slate-600">
                                            <span>Subtotal</span>
                                            <span className="font-semibold text-slate-800">{fmtRs(subtotal)}</span>
                                        </div>
                                        <div className="flex justify-between text-xs text-slate-600">
                                            <span>Shipping</span>
                                            <span className={`font-semibold ${(order.shipping_cost || 0) > 0 ? 'text-slate-800' : 'text-emerald-600'}`}>
                                                {(order.shipping_cost || 0) > 0 ? fmtRs(order.shipping_cost!) : 'Free'}
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between pt-3 mt-1 border-t border-gray-100">
                                            <p className="text-sm font-bold text-slate-900">Total</p>
                                            <p className="text-lg font-bold text-(--colour-fsP2)">{fmtRs(order.order_total)}</p>
                                        </div>
                                    </div>
                                    <div className="mt-3 pt-3 border-t border-gray-100">
                                        <span className="text-xs font-semibold text-slate-700 capitalize">
                                            {order.payment_type?.replace(/_/g, ' ') || 'Cash on delivery'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                <div className="shrink-0 flex gap-2 px-4 sm:px-6 py-3 border-t border-gray-100 bg-gray-50">
                    {isPlaced && (
                        <button onClick={onCancelClick}
                            className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-red-100 bg-white hover:bg-red-50 text-xs font-semibold text-red-500 transition-colors">
                            <Ban size={11} /> Cancel
                        </button>
                    )}
                    <button
                        onClick={() => handleBuyAgain(order.items?.[0]?.product?.slug)}
                        disabled={!order.items?.[0]?.product?.slug}
                        className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg bg-(--colour-fsP2) hover:bg-blue-700 disabled:opacity-50 text-xs font-semibold text-white transition-colors"
                    >
                        <RotateCcw size={11} /> Buy Again
                    </button>
                </div>
            </DialogContent>
        </Dialog>
    );
}

// ─── Tracking Bar ────────────────────────────────────────────────────────────
function TrackingBar({ steps, activeStep }: { steps: { label: string; done: boolean; date: string | null }[]; activeStep: number }) {
    const pct = steps.length > 1 ? (activeStep / (steps.length - 1)) * 100 : 0;
    return (
        <div className="relative w-full">
            <div className="absolute top-1.75 left-0 w-full h-0.5 bg-gray-200 rounded-full" />
            <div
                className="absolute top-1.75 left-0 h-0.5 bg-(--colour-fsP2) rounded-full transition-all duration-500 ease-out"
                style={{ width: `${pct}%` }}
            />
            <div className="relative z-10 flex justify-between">
                {steps.map((step, i) => {
                    const isFirst = i === 0;
                    const isLast = i === steps.length - 1;
                    const isActive = i === activeStep;
                    return (
                        <div key={i} className="relative flex flex-col items-center">
                            <div className={`w-4 h-4 rounded-full border-2 transition-all duration-300 ${step.done ? 'bg-(--colour-fsP2) border-(--colour-fsP2)' : 'bg-white border-gray-300'} ${isActive ? 'scale-125 shadow-sm shadow-blue-100' : ''}`} />
                            <div className={`absolute top-6 w-20 ${isFirst ? 'left-0 text-left' : isLast ? 'right-0 text-right' : 'left-1/2 -translate-x-1/2 text-center'}`}>
                                <span className={`block text-[10px] font-bold uppercase tracking-wide leading-tight ${step.done ? 'text-(--colour-fsP2)' : 'text-slate-400'}`}>
                                    {step.label}
                                </span>
                                {step.date && (
                                    <span className="block text-[10px] text-slate-400 mt-0.5 normal-case font-normal tracking-normal">
                                        {step.date}
                                    </span>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
            <div className="h-12" />
        </div>
    );
}

// ─── Orders Section ──────────────────────────────────────────────────────────
const TABS = [
    { key: 'all', label: 'All' },
    { key: 'placed', label: 'Placed' },
    { key: 'confirm', label: 'Confirmed' },
    { key: 'process', label: 'Processing' },
    { key: 'deliver', label: 'Delivered' },
    { key: 'cancel', label: 'Cancelled' },
] as const;

export default function OrdersSection({ orders: rawOrders, loading, error }: {
    orders: Order[]; loading: boolean; error: string | null;
}) {
    const [localOrders, setLocalOrders] = useState<Order[]>(rawOrders ?? []);
    useEffect(() => { setLocalOrders(rawOrders ?? []); }, [rawOrders]);

    const orders = localOrders;
    const [filter, setFilter] = useState<string>('all');
    const [detailOrder, setDetail] = useState<Order | null>(null);
    const [cancelTarget, setCancelTarget] = useState<Order | null>(null);

    const counts: Record<string, number> = {
        all: orders.length,
        placed: orders.filter(o => o.order_status?.toLowerCase().includes('placed')).length,
        confirm: orders.filter(o => o.order_status?.toLowerCase().includes('confirm')).length,
        process: orders.filter(o => o.order_status?.toLowerCase().includes('process')).length,
        deliver: orders.filter(o => o.order_status?.toLowerCase().includes('deliver')).length,
        cancel: orders.filter(o => o.order_status?.toLowerCase().includes('cancel')).length,
    };

    const filtered = filter === 'all' ? orders : orders.filter(o => o.order_status?.toLowerCase().includes(filter));

    if (loading) return (
        <div className="flex items-center justify-center py-20">
            <div className="w-5 h-5 border-2 border-gray-200 border-t-(--colour-fsP2) rounded-full animate-spin" />
        </div>
    );
    if (error) return <EmptyState label="Could not load orders" sub={error} />;

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-0.5 overflow-x-auto no-scrollbar border-b border-gray-100">
                {TABS.map(tab => {
                    const active = filter === tab.key;
                    return (
                        <button key={tab.key} onClick={() => setFilter(tab.key)}
                            className={`flex items-center gap-1.5 px-3 py-2.5 text-xs font-semibold whitespace-nowrap border-b-2 -mb-px transition-colors ${active ? 'border-(--colour-fsP2) text-(--colour-fsP2)' : 'border-transparent text-slate-500 hover:text-slate-700'}`}>
                            {tab.label}
                            {counts[tab.key] > 0 && (
                                <span className={`text-[10px] font-bold ${active ? 'text-(--colour-fsP2)' : 'text-gray-400'}`}>
                                    {counts[tab.key]}
                                </span>
                            )}
                        </button>
                    );
                })}
            </div>

            <div className="space-y-2">
                {filtered.length === 0 ? (
                    <EmptyState label="No orders found" sub="Try a different filter." />
                ) : filtered.map(order => {
                    const status = order.order_status?.toLowerCase() ?? '';
                    const isPlaced = status.includes('placed') || status.includes('pending');
                    const isCancelled = status.includes('cancel');

                    return (
                        <div key={order.id} className="border border-gray-200 rounded-xl overflow-hidden bg-white">
                            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
                                <div>
                                    <p className="text-xs font-bold text-slate-900">#{order.invoice_number}</p>
                                    <p className="text-[11px] text-slate-500 mt-0.5">{fmt(order.created_at)}</p>
                                </div>
                                <StatusBadge status={order.order_status} />
                            </div>

                            <div className="divide-y divide-gray-50">
                                {(order.items || []).slice(0, 2).map(item => (
                                    <div key={item.id} className="flex items-center gap-3 px-4 py-3">
                                        <div className="w-10 h-10 rounded border border-gray-100 bg-gray-50 overflow-hidden shrink-0 flex items-center justify-center">
                                            {item.product?.thumb?.url
                                                ? <Image src={item.product.thumb.url} alt={item.product.name} width={40} height={40} className="w-full h-full object-contain" />
                                                : <Package size={16} className="text-gray-300" />}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-xs font-semibold text-slate-900 truncate">{item.product?.name}</p>
                                            <p className="text-[11px] text-slate-500 mt-0.5">Qty {item.quantity}</p>
                                        </div>
                                        <p className="text-xs font-bold text-slate-700 shrink-0">{fmtRs(item.price ?? item.product?.price?.current)}</p>
                                    </div>
                                ))}
                                {(order.items?.length ?? 0) > 2 && (
                                    <button onClick={() => setDetail(order)}
                                        className="w-full text-center text-[11px] font-semibold text-(--colour-fsP2) py-2 hover:underline">
                                        +{order.items.length - 2} more item{(order.items.length - 2) > 1 ? 's' : ''}
                                    </button>
                                )}
                            </div>

                            <div className="flex flex-wrap items-center justify-between gap-y-2 px-4 py-3 border-t border-gray-100 bg-gray-50">
                                <div>
                                    <p className="text-[10px] text-slate-500 uppercase tracking-wider">Total</p>
                                    <p className="text-sm font-bold text-slate-900 mt-0.5">{fmtRs(order.order_total)}</p>
                                </div>
                                <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                                    <button onClick={() => setDetail(order)}
                                        className="text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors">
                                        Details
                                    </button>
                                    {!isCancelled && order.items[0]?.product?.slug && (
                                        <>
                                            <span className="text-gray-200">·</span>
                                            <Link href={`/product-details/${order.items[0].product.slug}`}
                                                className="text-xs font-semibold text-(--colour-fsP2) hover:underline transition-colors">
                                                Buy Again
                                            </Link>
                                        </>
                                    )}
                                    {status.includes('deliver') && (
                                        <>
                                            <span className="text-gray-200">·</span>
                                            <button className="text-xs font-semibold text-orange-500 hover:underline transition-colors">
                                                Return
                                            </button>
                                        </>
                                    )}
                                    {isPlaced && (
                                        <>
                                            <span className="text-gray-200">·</span>
                                            <button onClick={() => setCancelTarget(order)}
                                                className="text-xs font-semibold text-red-500 hover:underline transition-colors">
                                                Cancel
                                            </button>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            <OrderDetailDialog
                order={detailOrder}
                onClose={() => setDetail(null)}
                onCancelClick={() => { if (detailOrder) setCancelTarget(detailOrder); }}
            />
            <CancelDialog
                order={cancelTarget}
                open={!!cancelTarget}
                onClose={() => setCancelTarget(null)}
                onConfirm={(reason) => {
                    if (!cancelTarget) return;
                    const id = Number(cancelTarget.id);
                    OrderService.OrderCancel(id, reason)
                        .then(() => {
                            setLocalOrders(prev => prev.map(o =>
                                o.id === id ? { ...o, order_status: 'cancelled' } : o
                            ));
                            if (detailOrder?.id === id) setDetail(null);
                        })
                        .catch(() => { })
                        .finally(() => setCancelTarget(null));
                }}
            />
        </div>
    );
}
