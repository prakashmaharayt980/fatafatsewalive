'use client';

import React, { useState } from 'react';
import {
    Ban, Undo, Search, PackageCheck, History,
    CreditCard, CheckCircle2, Box, Tag, Clock,
    ThumbsUp, ShoppingBag, XCircle, AlertTriangle, ChevronRight,
} from 'lucide-react';
import {
    Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";

type OrderStatus = 'return_pending' | 'cancelled' | 'processing' | 'return_accepted';

interface ReturnOrder {
    id: string;
    date: string;
    status: OrderStatus;
    total: number;
    items: number;
    product: string;
    returnable: boolean;
    cancel_reason?: string;
    return_reason?: string;
}

const ORDERS: ReturnOrder[] = [
    {
        id: 'ORD-2024-X8291', date: 'Oct 5, 2024', status: 'return_pending',
        total: 29999, items: 3, product: 'Sony WH-1000XM5 Headphones', returnable: true,
    },
    {
        id: 'ORD-2024-X1102', date: 'Oct 8, 2024', status: 'cancelled',
        total: 14500, items: 2, product: 'OnePlus 12R 5G (256GB)', returnable: false,
        cancel_reason: 'Customer changed mind before delivery.',
    },
    {
        id: 'ORD-2024-X5567', date: 'Oct 10, 2024', status: 'processing',
        total: 8999, items: 1, product: 'Samsung Galaxy Buds2 Pro', returnable: true,
        return_reason: 'Product not as described',
    },
    {
        id: 'ORD-2024-X9901', date: 'Oct 12, 2024', status: 'return_accepted',
        total: 35000, items: 1, product: 'Apple Watch SE 44mm', returnable: true,
        return_reason: 'Received damaged product',
    },
];

const RETURN_REASONS = [
    'Received damaged or defective product',
    'Wrong product delivered',
    'Product not as described',
    'Changed my mind',
    'Missing accessories or parts',
    'Other',
];

const NON_RETURNABLE_CATEGORIES = [
    'Opened software or digital products',
    'Items with broken seal (earphones, hygiene)',
    'Custom-ordered or engraved products',
    'Products without original packaging',
];

const STATUS_CFG: Record<OrderStatus, { label: string; cls: string; icon: React.ReactNode }> = {
    return_pending:  { label: 'Return Available', cls: 'text-(--colour-fsP2) bg-blue-50 border-blue-200',    icon: <Undo size={10} />           },
    cancelled:       { label: 'Cancelled',          cls: 'text-red-600 bg-red-50 border-red-200',             icon: <XCircle size={10} />        },
    processing:      { label: 'Under Review',        cls: 'text-amber-600 bg-amber-50 border-amber-200',       icon: <Clock size={10} />          },
    return_accepted: { label: 'Return Accepted',     cls: 'text-emerald-600 bg-emerald-50 border-emerald-200', icon: <CheckCircle2 size={10} />   },
};

const fmtRs = (n: number) => `Rs ${n.toLocaleString()}`;

const ORDER_DETAIL = {
    orderNumber: 'ORD-2024-X8291', date: 'Oct 5, 2024', paymentMethod: 'Mastercard',
    items: [
        { id: 1, name: 'Sony WH-1000XM5 Headphones', pack: 'Black', qty: 1, price: 29999 },
    ],
    subtotal: 29999, shipping: 0, tax: 0, total: 29999,
};

// ─── Action dialog state ──────────────────────────────────────────────────────
interface ActionState {
    open: boolean;
    order: ReturnOrder | null;
    reason: string;
    otherText: string;
    step: 'check' | 'reason' | 'confirm';
}

export default function ReturnCancel() {
    const [action, setAction] = useState<ActionState>({ open: false, order: null, reason: '', otherText: '', step: 'check' });
    const [detailOpen, setDetailOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [submitted, setSubmitted] = useState<Set<string>>(new Set());

    const filtered = ORDERS.filter(o => {
        const s = searchTerm.toLowerCase();
        return o.id.toLowerCase().includes(s) || o.status.toLowerCase().includes(s) || o.product.toLowerCase().includes(s);
    });

    const openAction = (order: ReturnOrder) => {
        if (!order.returnable) {
            setAction({ open: true, order, reason: '', otherText: '', step: 'check' });
        } else {
            setAction({ open: true, order, reason: '', otherText: '', step: 'reason' });
        }
    };

    const handleSubmit = () => {
        if (!action.order) return;
        setSubmitted(prev => new Set([...prev, action.order!.id]));
        setAction({ open: false, order: null, reason: '', otherText: '', step: 'check' });
    };

    // ── Per-status action button ────────────────────────────────────────────
    const ActionButton = ({ order }: { order: ReturnOrder }) => {
        if (submitted.has(order.id)) {
            return (
                <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-lg">
                    Submitted
                </span>
            );
        }
        switch (order.status) {
            case 'return_pending':
                return (
                    <div className="flex gap-2">
                        <button
                            onClick={() => openAction(order)}
                            className="h-8 px-4 bg-(--colour-fsP2) text-white rounded-lg text-xs font-bold hover:bg-blue-700 transition-colors flex items-center gap-1.5"
                        >
                            <Undo size={12} /> Request Return
                        </button>
                        <button className="h-8 px-3 border border-gray-200 text-slate-700 rounded-lg text-xs font-bold hover:bg-slate-50 transition-colors flex items-center gap-1.5">
                            <ShoppingBag size={12} /> Buy Again
                        </button>
                    </div>
                );
            case 'cancelled':
                return (
                    <button className="h-8 px-4 bg-(--colour-fsP2) text-white rounded-lg text-xs font-bold hover:bg-blue-700 transition-colors flex items-center gap-1.5">
                        <ShoppingBag size={12} /> Buy Again
                    </button>
                );
            case 'processing':
                return (
                    <span className="text-[10px] font-bold text-amber-600 bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-lg flex items-center gap-1.5">
                        <Clock size={11} /> Request Under Review
                    </span>
                );
            case 'return_accepted':
                return (
                    <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-lg flex items-center gap-1.5">
                        <CheckCircle2 size={11} /> Return Accepted
                    </span>
                );
        }
    };

    // ── Status note shown below order ───────────────────────────────────────
    const StatusNote = ({ order }: { order: ReturnOrder }) => {
        if (order.status === 'cancelled' && order.cancel_reason) return (
            <p className="text-[10px] font-semibold text-slate-600 mt-1">
                Reason: {order.cancel_reason}
            </p>
        );
        if (order.status === 'processing' && order.return_reason) return (
            <p className="text-[10px] font-semibold text-slate-600 mt-1">
                Stated reason: "{order.return_reason}"
            </p>
        );
        if (order.status === 'return_accepted' && order.return_reason) return (
            <p className="text-[10px] font-semibold text-emerald-600 mt-1">
                Refund will be credited within 5–7 business days
            </p>
        );
        if (order.status === 'return_pending' && !order.returnable) return (
            <p className="text-[10px] font-bold text-amber-600 flex items-center gap-1 mt-1">
                <AlertTriangle size={10} /> Non-returnable items in this order
            </p>
        );
        return null;
    };

    return (
        <div className="space-y-5">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-gray-100">
                <div className="flex items-center gap-2">
                    <History className="w-4 h-4 text-(--colour-fsP2)" />
                    <div>
                        <h2 className="text-lg font-bold text-(--colour-fsP2)">Returns & Cancellations</h2>
                        <p className="text-xs text-slate-500 mt-0.5">Manage returns or review cancelled orders</p>
                    </div>
                </div>
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
                    <input
                        type="text"
                        placeholder="Search by ID, product or status..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="h-9 pl-9 pr-3 w-64 bg-gray-50 border border-gray-200 rounded-lg text-xs font-semibold focus:outline-none focus:border-(--colour-fsP2) focus:bg-white transition-colors"
                    />
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 divide-x border border-gray-200 rounded-xl overflow-hidden">
                {[
                    { label: 'Under Review', value: String(ORDERS.filter(o => o.status === 'processing').length), icon: Clock },
                    { label: 'Return Accepted', value: String(ORDERS.filter(o => o.status === 'return_accepted').length), icon: ThumbsUp },
                    { label: 'Cancelled', value: String(ORDERS.filter(o => o.status === 'cancelled').length), icon: Ban },
                ].map((s, i) => (
                    <div key={i} className="px-4 py-3 flex items-center gap-3 bg-white">
                        <s.icon className="w-4 h-4 text-(--colour-fsP2) shrink-0" />
                        <div>
                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{s.label}</p>
                            <p className="text-sm font-bold text-(--colour-fsP2)">{s.value}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* List */}
            {filtered.length === 0 ? (
                <div className="py-16 text-center border border-dashed border-gray-200 rounded-xl">
                    <p className="text-xs font-bold text-slate-500">No activity found</p>
                </div>
            ) : (
                <div className="space-y-2">
                    {filtered.map(order => {
                        const cfg = STATUS_CFG[order.status];
                        return (
                            <div key={order.id} className="border border-gray-200 rounded-xl bg-white overflow-hidden">
                                <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
                                    <div className="flex items-center gap-3 min-w-0">
                                        <div className="p-2 border border-gray-100 rounded-lg bg-gray-50 text-slate-500 shrink-0">
                                            {order.status === 'cancelled' ? <Ban className="w-3.5 h-3.5" /> : <Undo className="w-3.5 h-3.5" />}
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-sm font-bold text-(--colour-fsP2) truncate">{order.id}</p>
                                            <p className="text-xs font-bold text-slate-900 truncate">{order.product}</p>
                                            <p className="text-[10px] text-slate-500 font-semibold mt-0.5">
                                                {order.date} · {order.items} item{order.items > 1 ? 's' : ''}
                                            </p>
                                            <StatusNote order={order} />
                                        </div>
                                    </div>
                                    <span className={`shrink-0 ml-3 inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded border uppercase tracking-widest ${cfg.cls}`}>
                                        {cfg.icon}{cfg.label}
                                    </span>
                                </div>

                                <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
                                    <div>
                                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Order Total</p>
                                        <p className="text-sm font-bold text-(--colour-fsP2)">{fmtRs(order.total)}</p>
                                    </div>
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <button
                                            onClick={() => setDetailOpen(true)}
                                            className="w-8 h-8 flex items-center justify-center border border-gray-200 rounded-lg text-slate-500 hover:text-(--colour-fsP2) hover:border-(--colour-fsP2) transition-colors"
                                        >
                                            <PackageCheck className="w-3.5 h-3.5" />
                                        </button>
                                        <ActionButton order={order} />
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* ── Action Dialog ─────────────────────────────────────────────── */}
            <Dialog open={action.open} onOpenChange={v => setAction(p => ({ ...p, open: v }))}>
                <DialogContent className="p-0 overflow-hidden bg-white rounded-xl border border-gray-200 shadow-lg sm:max-w-md mx-auto">
                    <DialogHeader className="px-5 py-4 border-b border-gray-100">
                        <DialogTitle className="text-sm font-bold text-slate-900">
                            {action.order?.returnable ? 'Request Return' : 'Return Not Available'}
                        </DialogTitle>
                        <DialogDescription className="text-xs text-slate-500 mt-0.5">
                            {action.order?.product}
                        </DialogDescription>
                    </DialogHeader>

                    <div className="px-5 py-4 space-y-4">
                        {/* Non-returnable */}
                        {!action.order?.returnable && (
                            <>
                                <div className="flex items-start gap-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                                    <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                                    <div>
                                        <p className="text-xs font-bold text-amber-800">This product cannot be returned</p>
                                        <p className="text-[10px] text-amber-600 mt-1 leading-relaxed">
                                            Based on our return policy, the following are non-returnable:
                                        </p>
                                    </div>
                                </div>
                                <ul className="space-y-1.5">
                                    {NON_RETURNABLE_CATEGORIES.map((c, i) => (
                                        <li key={i} className="flex items-center gap-2 text-xs font-semibold text-slate-700">
                                            <XCircle size={12} className="text-red-400 shrink-0" /> {c}
                                        </li>
                                    ))}
                                </ul>
                                <p className="text-[10px] text-slate-500 font-semibold">
                                    If you believe this is an error, contact our support team with your order ID.
                                </p>
                                <div className="flex gap-2 pt-1">
                                    <button
                                        onClick={() => setAction(p => ({ ...p, open: false }))}
                                        className="flex-1 h-9 border border-gray-200 rounded-lg text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors"
                                    >
                                        Close
                                    </button>
                                    <button className="flex-1 h-9 bg-(--colour-fsP2) text-white rounded-lg text-xs font-bold hover:bg-blue-700 transition-colors">
                                        Contact Support
                                    </button>
                                </div>
                            </>
                        )}

                        {/* Returnable — pick reason */}
                        {action.order?.returnable && action.step === 'reason' && (
                            <>
                                <div>
                                    <p className="text-[10px] font-bold text-(--colour-fsP2) uppercase tracking-widest mb-2">
                                        Why are you returning this product?
                                    </p>
                                    <div className="space-y-1.5">
                                        {RETURN_REASONS.map(r => (
                                            <label key={r} className={`flex items-center gap-3 px-3 py-2.5 border rounded-lg cursor-pointer transition-colors ${action.reason === r ? 'border-(--colour-fsP2) bg-blue-50' : 'border-gray-200 hover:border-slate-300'}`}>
                                                <input
                                                    type="radio"
                                                    name="reason"
                                                    value={r}
                                                    checked={action.reason === r}
                                                    onChange={() => setAction(p => ({ ...p, reason: r, otherText: '' }))}
                                                    className="accent-(--colour-fsP2)"
                                                />
                                                <span className="text-xs font-semibold text-slate-800">{r}</span>
                                            </label>
                                        ))}
                                    </div>
                                    {action.reason === 'Other' && (
                                        <div className="mt-2">
                                            <p className="text-[10px] font-bold text-(--colour-fsP2) uppercase tracking-widest mb-1.5">
                                                Please describe your reason
                                            </p>
                                            <textarea
                                                value={action.otherText}
                                                onChange={e => setAction(p => ({ ...p, otherText: e.target.value }))}
                                                placeholder="Describe the issue with your order..."
                                                rows={3}
                                                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-(--colour-fsP2) focus:bg-white resize-none transition-colors"
                                            />
                                        </div>
                                    )}
                                </div>
                                <div className="flex gap-2 pt-1">
                                    <button
                                        onClick={() => setAction(p => ({ ...p, open: false }))}
                                        className="flex-1 h-9 border border-gray-200 rounded-lg text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        disabled={!action.reason || (action.reason === 'Other' && !action.otherText.trim())}
                                        onClick={() => setAction(p => ({ ...p, step: 'confirm' }))}
                                        className="flex-1 h-9 bg-(--colour-fsP2) text-white rounded-lg text-xs font-bold hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-1.5"
                                    >
                                        Continue <ChevronRight size={13} />
                                    </button>
                                </div>
                            </>
                        )}

                        {/* Confirm step */}
                        {action.order?.returnable && action.step === 'confirm' && (
                            <>
                                <div className="p-3 border border-gray-200 rounded-lg bg-gray-50 space-y-2">
                                    <div>
                                        <p className="text-[10px] font-bold text-(--colour-fsP2) uppercase tracking-widest">Order</p>
                                        <p className="text-xs font-bold text-slate-900 mt-0.5">{action.order.id}</p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-bold text-(--colour-fsP2) uppercase tracking-widest">Return Reason</p>
                                        <p className="text-xs font-bold text-slate-900 mt-0.5">
                                            {action.reason === 'Other' ? action.otherText : action.reason}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-bold text-(--colour-fsP2) uppercase tracking-widest">Refund Amount</p>
                                        <p className="text-xs font-bold text-slate-900 mt-0.5">{fmtRs(action.order.total)}</p>
                                    </div>
                                </div>
                                <div className="p-3 border border-amber-200 bg-amber-50 rounded-lg">
                                    <p className="text-[10px] font-bold text-amber-700 leading-relaxed">
                                        Our team will review your request within 2 business days. Ensure the product is in original condition with all accessories.
                                    </p>
                                </div>
                                <div className="flex gap-2 pt-1">
                                    <button
                                        onClick={() => setAction(p => ({ ...p, step: 'reason' }))}
                                        className="flex-1 h-9 border border-gray-200 rounded-lg text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors"
                                    >
                                        Back
                                    </button>
                                    <button
                                        onClick={handleSubmit}
                                        className="flex-1 h-9 bg-(--colour-fsP2) text-white rounded-lg text-xs font-bold hover:bg-blue-700 transition-colors"
                                    >
                                        Submit Return Request
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </DialogContent>
            </Dialog>

            {/* ── Detail Dialog ─────────────────────────────────────────────── */}
            <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
                <DialogContent className="p-0 overflow-hidden bg-white rounded-xl border border-gray-200 shadow-lg sm:max-w-lg mx-auto">
                    <DialogHeader className="px-5 py-4 border-b border-gray-100">
                        <DialogTitle className="text-sm font-bold text-slate-900">Order Summary</DialogTitle>
                        <DialogDescription className="sr-only">Order details</DialogDescription>
                        <div className="flex items-center gap-3 mt-0.5">
                            <span className="text-[10px] font-bold text-slate-500">{ORDER_DETAIL.orderNumber}</span>
                            <span className="text-[10px] text-slate-400">·</span>
                            <span className="text-[10px] font-bold text-slate-500">{ORDER_DETAIL.date}</span>
                        </div>
                    </DialogHeader>

                    <div className="px-5 py-4 space-y-4 max-h-[70vh] overflow-y-auto [&::-webkit-scrollbar]:w-0 [scrollbar-width:none]">
                        <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg bg-gray-50">
                            <div className="flex items-center gap-2.5">
                                <CreditCard className="w-4 h-4 text-slate-500" />
                                <div>
                                    <p className="text-[10px] font-bold text-(--colour-fsP2) uppercase tracking-widest">Paid via</p>
                                    <p className="text-sm font-bold text-slate-900">{ORDER_DETAIL.paymentMethod}</p>
                                </div>
                            </div>
                            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                        </div>

                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                <Box className="w-3.5 h-3.5 text-slate-500" />
                                <p className="text-[10px] font-bold text-(--colour-fsP2) uppercase tracking-widest">Items</p>
                            </div>
                            <div className="space-y-2">
                                {ORDER_DETAIL.items.map(item => (
                                    <div key={item.id} className="flex items-center justify-between px-3 py-2.5 border border-gray-200 rounded-lg">
                                        <div className="min-w-0">
                                            <p className="text-xs font-bold text-slate-900 truncate">{item.name}</p>
                                            <p className="text-[10px] font-semibold text-slate-500 mt-0.5">{item.pack} · Qty {item.qty}</p>
                                        </div>
                                        <p className="text-xs font-bold text-(--colour-fsP2) ml-4 shrink-0">{fmtRs(item.price)}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="border-t border-gray-100 pt-3 space-y-2">
                            {[
                                { label: 'Subtotal',     val: ORDER_DETAIL.subtotal },
                                { label: 'Shipping Fee', val: ORDER_DETAIL.shipping },
                                { label: 'Tax & VAT',    val: ORDER_DETAIL.tax      },
                            ].map(r => (
                                <div key={r.label} className="flex justify-between">
                                    <p className="text-xs font-semibold text-slate-500">{r.label}</p>
                                    <p className="text-xs font-bold text-slate-900">{fmtRs(r.val)}</p>
                                </div>
                            ))}
                            <div className="flex justify-between pt-2 border-t border-gray-100">
                                <p className="text-xs font-bold text-slate-900">Total Refundable</p>
                                <p className="text-sm font-bold text-(--colour-fsP2)">{fmtRs(ORDER_DETAIL.total)}</p>
                            </div>
                        </div>

                        <button className="w-full h-9 border border-gray-200 rounded-lg text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors flex items-center justify-center gap-2">
                            <Tag className="w-3.5 h-3.5" /> Download Statement
                        </button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
