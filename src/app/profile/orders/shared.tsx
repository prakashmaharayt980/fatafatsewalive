// Shared types, helpers, and small components for the Order History feature
// fsP1 = #f86014 (orange) · fsP2 = #1967b3 (blue)

import React from 'react';
import {
    BadgeCheck, XCircle, Ban, Activity, Loader2, Hourglass, Receipt,
} from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface OrderItem {
    id: number; product_id: number; quantity: number; price: number;
    unit_price?: number;
    product: { id: number; name: string; slug: string; sku?: string; image?: { thumb: string; full: string } };
}

export interface Order {
    id: number; invoice_number: string; status: number;
    order_status: string; order_total: number; shipping_cost: number;
    payment_type: string; items: OrderItem[]; created_at: string;
    notes?: string;
    shipping_address?: ShippingAddress;
    user?: UserInfo;
    // Optional timeline timestamps for journey display
    processed_at?: string;
    shipped_at?: string;
    delivered_at?: string;
    cancelled_at?: string;
    cancel_reason?: string;
}

export interface ShippingAddress {
    name: string; phone: string; address: string; city: string;
}

export interface UserInfo {
    name: string; email: string; phone: string;
}

export interface PreOrder {
    id: number; invoice_number: string; product_name: string; product_image: string;
    expected_date: string; status: 'upcoming' | 'paid' | 'history';
    amount_paid: number; total_amount: number; category: string;
    address?: ShippingAddress; note?: string;
}

export interface EmiOrder {
    id: number; product_name: string; product_image: string;
    emi_type: 'credit_card' | 'citizenship';
    status: 'pending' | 'processing' | 'approved' | 'rejected' | 'active';
    monthly_installment: number; total_amount: number;
    paid_installments: number; total_installments: number;
    created_at: string; document_note?: string; bank_name?: string;
}

// ─── Mock Data ────────────────────────────────────────────────────────────────

export const MOCK_ADDRESS: ShippingAddress = {
    name: 'Ram Prasad Sharma', phone: '9841000000',
    address: 'Thamel, Ward-29, Near Garden of Dreams', city: 'Kathmandu',
};

export const MOCK_USER: UserInfo = {
    name: 'Ram Prasad Sharma', email: 'ram@example.com', phone: '9841000000',
};

// Rich mock orders used as fallback / demo data when API returns empty
export const MOCK_ORDERS: Order[] = [
    {
        id: 1001, invoice_number: 'INV-1772209838-37522', status: 1,
        order_status: 'placed', payment_type: 'cash_on_delivery',
        order_total: 205498, shipping_cost: 0,
        created_at: '2026-02-27T08:12:00Z',
        shipping_address: MOCK_ADDRESS, user: MOCK_USER,
        items: [
            { id: 1, product_id: 101, quantity: 1, price: 112999, product: { id: 101, name: 'OnePlus 15R 5G (12+512GB)', slug: 'oneplus-15r-512', image: { thumb: '', full: '' } } },
            { id: 2, product_id: 102, quantity: 1, price: 92499, product: { id: 102, name: 'OnePlus 15R 5G (12+256GB)', slug: 'oneplus-15r-256', image: { thumb: '', full: '' } } },
        ],
    },
    {
        id: 1002, invoice_number: 'INV-1772110044-18800', status: 2,
        order_status: 'processing', payment_type: 'esewa',
        order_total: 183000, shipping_cost: 150,
        created_at: '2026-02-25T11:45:00Z',
        processed_at: '2026-02-25T14:00:00Z',
        shipping_address: MOCK_ADDRESS, user: MOCK_USER,
        items: [
            { id: 3, product_id: 103, quantity: 1, price: 182850, product: { id: 103, name: 'Samsung Galaxy S25 Ultra 256GB', slug: 'samsung-s25-ultra', image: { thumb: '', full: '' } } },
        ],
    },
    {
        id: 1003, invoice_number: 'INV-1771980088-55310', status: 3,
        order_status: 'delivered', payment_type: 'khalti',
        order_total: 48000, shipping_cost: 0,
        created_at: '2026-02-10T09:00:00Z',
        processed_at: '2026-02-10T12:00:00Z',
        shipped_at: '2026-02-12T08:30:00Z',
        delivered_at: '2026-02-14T14:00:00Z',
        shipping_address: MOCK_ADDRESS, user: MOCK_USER,
        notes: 'Please leave at the gate if no one at home.',
        items: [
            { id: 4, product_id: 104, quantity: 2, price: 24000, product: { id: 104, name: 'Sony WH-1000XM5 Headphones', slug: 'sony-wh1000xm5', image: { thumb: '', full: '' } } },
        ],
    },
    {
        id: 1004, invoice_number: 'INV-1771850033-91020', status: 5,
        order_status: 'cancelled', payment_type: 'cash_on_delivery',
        order_total: 32500, shipping_cost: 0,
        created_at: '2026-01-28T16:20:00Z',
        cancelled_at: '2026-01-29T10:00:00Z',
        cancel_reason: 'Changed my mind after placing the order.',
        shipping_address: MOCK_ADDRESS, user: MOCK_USER,
        items: [
            { id: 5, product_id: 105, quantity: 1, price: 32500, product: { id: 105, name: 'Xiaomi 14T Pro 5G 256GB', slug: 'xiaomi-14t-pro', image: { thumb: '', full: '' } } },
        ],
    },
];

export const MOCK_PRE_ORDERS: PreOrder[] = [
    { id: 1, invoice_number: 'PRE-20250201', product_name: 'Samsung Galaxy S25 Ultra 256GB', product_image: '', expected_date: '2025-04-15', status: 'upcoming', amount_paid: 5000, total_amount: 185000, category: 'Smartphones', address: MOCK_ADDRESS, note: 'Please call before delivery.' },
    { id: 2, invoice_number: 'PRE-20250115', product_name: 'Apple MacBook Pro M4 14"', product_image: '', expected_date: '2025-03-30', status: 'paid', amount_paid: 20000, total_amount: 320000, category: 'Laptops', address: MOCK_ADDRESS },
    { id: 3, invoice_number: 'PRE-20241210', product_name: 'OnePlus 13 5G 512GB', product_image: '', expected_date: '2025-01-10', status: 'history', amount_paid: 75000, total_amount: 75000, category: 'Smartphones', address: MOCK_ADDRESS },
];

export const MOCK_EMI_ORDERS: EmiOrder[] = [
    { id: 1, product_name: 'Sony 65" 4K OLED TV', product_image: '', emi_type: 'credit_card', status: 'active', monthly_installment: 8500, total_amount: 102000, paid_installments: 4, total_installments: 12, created_at: '2024-11-01', bank_name: 'Nepal Investment Bank' },
    { id: 2, product_name: 'HP Pavilion Gaming Laptop', product_image: '', emi_type: 'citizenship', status: 'processing', monthly_installment: 5200, total_amount: 62400, paid_installments: 0, total_installments: 12, created_at: '2025-02-20', document_note: 'Your citizenship documents are under verification. You will be notified by email once approved.' },
    { id: 3, product_name: 'Apple iPhone 16 Pro Max 256GB', product_image: '', emi_type: 'credit_card', status: 'pending', monthly_installment: 9800, total_amount: 117600, paid_installments: 0, total_installments: 12, created_at: '2025-02-28', document_note: 'EMI application received. Awaiting bank approval. Check your email for further instructions.' },
    { id: 4, product_name: 'Dyson V15 Detect Vacuum', product_image: '', emi_type: 'citizenship', status: 'approved', monthly_installment: 3100, total_amount: 37200, paid_installments: 2, total_installments: 12, created_at: '2025-01-05', bank_name: 'NIC Asia Bank' },
];

// ─── Formatters ───────────────────────────────────────────────────────────────

export const fmt = (d: string) => !d ? 'N/A' : new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
export const fmtRs = (n: number) => `Rs ${(n || 0).toLocaleString()}`;
export const isDelivered = (s: string) => { const l = s?.toLowerCase() ?? ''; return l.includes('deliver') || l.includes('success') || l.includes('received'); };

// ─── Status config ────────────────────────────────────────────────────────────

// Only brand + neutral colours — no green/purple/amber
// positive → blue   warning → orange   negative → red

type StatusEntry = { label: string; cls: string; dot: string; icon: React.ReactNode };
const STATUS_MAP: Record<string, StatusEntry> = {
    delivered: { label: 'Delivered', dot: 'bg-[var(--colour-fsP2)]', cls: 'text-[var(--colour-fsP2)] bg-blue-50 border-blue-200', icon: <BadgeCheck size={11} /> },
    success: { label: 'Success', dot: 'bg-[var(--colour-fsP2)]', cls: 'text-[var(--colour-fsP2)] bg-blue-50 border-blue-200', icon: <BadgeCheck size={11} /> },
    paid: { label: 'Paid', dot: 'bg-[var(--colour-fsP2)]', cls: 'text-[var(--colour-fsP2)] bg-blue-50 border-blue-200', icon: <BadgeCheck size={11} /> },
    approved: { label: 'Approved', dot: 'bg-[var(--colour-fsP2)]', cls: 'text-[var(--colour-fsP2)] bg-blue-50 border-blue-200', icon: <BadgeCheck size={11} /> },
    active: { label: 'Active', dot: 'bg-[var(--colour-fsP2)]', cls: 'text-[var(--colour-fsP2)] bg-blue-50 border-blue-200', icon: <Activity size={11} /> },
    placed: { label: 'Placed', dot: 'bg-[var(--colour-fsP2)]', cls: 'text-[var(--colour-fsP2)] bg-blue-50 border-blue-200', icon: <Receipt size={11} /> },
    processing: { label: 'Processing', dot: 'bg-[var(--colour-fsP1)]', cls: 'text-[var(--colour-fsP1)] bg-orange-50 border-orange-200', icon: <Hourglass size={11} className="animate-spin" /> },
    pending: { label: 'Pending', dot: 'bg-[var(--colour-fsP1)]', cls: 'text-[var(--colour-fsP1)] bg-orange-50 border-orange-200', icon: <Hourglass size={11} /> },
    cancelled: { label: 'Cancelled', dot: 'bg-red-500', cls: 'text-red-600 bg-red-50 border-red-200', icon: <XCircle size={11} /> },
    blocked: { label: 'Blocked', dot: 'bg-red-500', cls: 'text-red-600 bg-red-50 border-red-200', icon: <Ban size={11} /> },
    rejected: { label: 'Rejected', dot: 'bg-red-500', cls: 'text-red-600 bg-red-50 border-red-200', icon: <XCircle size={11} /> },
};

export function getStatus(s: string): StatusEntry {
    const key = s?.toLowerCase().trim() ?? '';
    for (const [k, v] of Object.entries(STATUS_MAP)) if (key.includes(k)) return v;
    return { label: s || 'Unknown', dot: 'bg-gray-400', cls: 'text-gray-600 bg-gray-50 border-gray-200', icon: <Activity size={11} /> };
}

// ─── Shared UI components ─────────────────────────────────────────────────────

export function StatusBadge({ status }: { status: string }) {
    const s = getStatus(status);
    return (
        <span className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded border ${s.cls}`}>
            {s.icon} {s.label}
        </span>
    );
}

export function FilterBar({
    filters, active, onSelect,
}: { filters: { key: string; label: string; cnt: number }[]; active: string; onSelect: (k: string) => void }) {
    return (
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
            {filters.map(f => {
                const isActive = active === f.key;
                return (
                    <button key={f.key} onClick={() => onSelect(f.key)}
                        className={`flex-shrink-0 flex items-center gap-1.5 px-3.5 py-1.5 rounded text-xs font-semibold border transition-all
                            ${isActive ? 'bg-[var(--colour-fsP2)] text-white border-[var(--colour-fsP2)]' : 'bg-white text-gray-600 border-gray-200 hover:border-[var(--colour-fsP2)] hover:text-[var(--colour-fsP2)]'}`}>
                        {f.label}
                        <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${isActive ? 'bg-white/25 text-white' : 'bg-gray-100 text-gray-400'}`}>{f.cnt}</span>
                    </button>
                );
            })}
        </div>
    );
}

export function EmptyState({ label, sub }: { label: string; sub: string }) {
    return (
        <div className="flex flex-col items-center gap-2 py-16 text-center">
            <p className="text-sm font-bold text-gray-700">{label}</p>
            <p className="text-xs text-gray-400">{sub}</p>
            <a href="/" className="mt-2 text-xs font-semibold text-[var(--colour-fsP2)] hover:underline">Browse Products →</a>
        </div>
    );
}

/** Simple labeled data row used inside dialogs */
export function DRow({ label, value }: { label: string; value: React.ReactNode }) {
    return (
        <div>
            <p className="text-[10px] text-gray-400 uppercase tracking-wider font-medium mb-0.5">{label}</p>
            <div className="text-xs font-semibold text-gray-800">{value}</div>
        </div>
    );
}

/** Thin divider label used inside dialogs */
export function DSection({ children }: { children: React.ReactNode }) {
    return <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest border-b border-gray-100 pb-1 mt-4 first:mt-0">{children}</p>;
}
