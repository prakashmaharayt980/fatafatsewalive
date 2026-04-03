import React from 'react';
import Link from 'next/link';
import {
    BadgeCheck, XCircle, Ban, Activity, Hourglass, Receipt,
} from 'lucide-react';

import type { Order, OrderItem, ShippingAddress, UserInfo, PreOrder, EmiOrder } from '../types';

export type { Order, OrderItem, ShippingAddress, UserInfo, PreOrder, EmiOrder };

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
    {
        id: 1,
        invoice_number: 'PRE-20250201',
        full_name: 'Ram Prasad Sharma',
        products: [
            {
                product_id: 201,
                quantity: 1,
                is_preorder: true,
                product_name: 'Samsung Galaxy S25 Ultra 256GB',
                product_image: '',
                selected_color: 'Titanium Black',
                slug: 'samsung-galaxy-s25-ultra-256gb',
                category: 'Smartphones',
                price: 185000,
            },
        ],
        shipping_address_id: 301,
        shipping_address: MOCK_ADDRESS,
        total_amount: 5000,
        order_total: 185000,
        payment_type: 'esewa',
        status: 'upcoming',
        expected_date: '2025-04-15',
        created_at: '2025-02-01T08:30:00Z',
        note: 'Please call before delivery.',
    },
    {
        id: 2,
        invoice_number: 'PRE-20250115',
        full_name: 'Ram Prasad Sharma',
        products: [
            {
                product_id: 202,
                quantity: 1,
                is_preorder: true,
                product_name: 'Apple MacBook Pro M4 14"',
                product_image: '',
                selected_color: 'Space Black',
                slug: 'apple-macbook-pro-m4-14',
                category: 'Laptops',
                price: 320000,
            },
        ],
        shipping_address_id: 302,
        shipping_address: MOCK_ADDRESS,
        total_amount: 20000,
        order_total: 320000,
        payment_type: 'khalti',
        status: 'paid',
        expected_date: '2025-03-30',
        created_at: '2025-01-15T11:00:00Z',
    },
    {
        id: 3,
        invoice_number: 'PRE-20241210',
        full_name: 'Ram Prasad Sharma',
        products: [
            {
                product_id: 203,
                quantity: 1,
                is_preorder: true,
                product_name: 'OnePlus 13 5G 512GB',
                product_image: '',
                selected_color: 'Midnight Ocean',
                slug: 'oneplus-13-5g-512gb',
                category: 'Smartphones',
                price: 75000,
            },
        ],
        shipping_address_id: 303,
        shipping_address: MOCK_ADDRESS,
        total_amount: 75000,
        order_total: 75000,
        payment_type: 'nic-asia',
        status: 'history',
        expected_date: '2025-01-10',
        created_at: '2024-12-10T09:00:00Z',
    },
];

export const MOCK_EMI_ORDERS: EmiOrder[] = [
    {
        id: 1,
        applicationtype: 'craditcard',
        product: {
            id: 401,
            varient: 'Black',
            quntioy: 1,
            price: 102000,
            name: 'Sony 65" 4K OLED TV',
            image: '',
            slug: 'sony-65-4k-oled-tv',
        },
        formdata: {
            personalInfo: {
                name: 'Ram Prasad Sharma',
                phone: '9841000000',
                email: 'ram@example.com',
                address: 'Thamel, Kathmandu',
            },
            bankInfo: {
                bankname: 'Nepal Investment Bank',
                bankbranch: 'Durbar Marg',
            },
            emiCalculation: {
                duration: 12,
                downPayment: 12000,
                financeAmount: 90000,
                paymentpermonth: 8500,
            },
            creditCard: {
                cardHolderName: 'Ram Prasad Sharma',
                creditCardNumber: '4111 1111 1111 1024',
                expiryDate: '11/28',
                cardLimit: 150000,
            },
        },
        status: 'active',
        paid_installments: 4,
        total_installments: 12,
        created_at: '2024-11-01',
        bank_name: 'Nepal Investment Bank',
    },
    {
        id: 2,
        applicationtype: 'with_cittizen',
        product: {
            id: 402,
            varient: 'Shadow Black',
            quntioy: 1,
            price: 62400,
            name: 'HP Pavilion Gaming Laptop',
            image: '',
            slug: 'hp-pavilion-gaming-laptop',
        },
        formdata: {
            personalInfo: {
                name: 'Ram Prasad Sharma',
                phone: '9841000000',
                address: 'Baluwatar, Kathmandu',
                nationalID: '27-01-75-10234',
            },
            bankInfo: {
                bankname: 'Nabil Bank',
                bankbranch: 'Maharajgunj',
                salaryAmount: 85000,
            },
            emiCalculation: {
                duration: 12,
                downPayment: 25000,
                financeAmount: 62400,
                paymentpermonth: 5200,
            },
            granterInfo: {
                name: 'Sita Sharma',
                phone: '9841222222',
                address: 'Tokha, Kathmandu',
                nationalID: '28-02-71-55342',
            },
        },
        status: 'processing',
        paid_installments: 0,
        total_installments: 12,
        created_at: '2025-02-20',
        document_note: 'Your citizenship documents are under verification. You will be notified by email once approved.',
    },
    {
        id: 3,
        applicationtype: 'with_new_card_Apply',
        product: {
            id: 403,
            varient: 'Natural Titanium',
            quntioy: 1,
            price: 117600,
            name: 'Apple iPhone 16 Pro Max 256GB',
            image: '',
            slug: 'apple-iphone-16-pro-max-256gb',
        },
        formdata: {
            personalInfo: {
                name: 'Ram Prasad Sharma',
                phone: '9841000000',
                email: 'ram@example.com',
            },
            bankInfo: {
                bankname: 'Global IME Bank',
                accountNumber: '01800123456789',
                bankbranch: 'New Baneshwor',
                salaryAmount: 120000,
            },
            emiCalculation: {
                duration: 12,
                downPayment: 0,
                financeAmount: 117600,
                paymentpermonth: 9800,
            },
        },
        status: 'pending',
        paid_installments: 0,
        total_installments: 12,
        created_at: '2025-02-28',
        document_note: 'EMI application received. Awaiting bank approval. Check your email for further instructions.',
    },
    {
        id: 4,
        applicationtype: 'with_cittizen',
        product: {
            id: 404,
            varient: 'Yellow/Nickel',
            quntioy: 1,
            price: 37200,
            name: 'Dyson V15 Detect Vacuum',
            image: '',
            slug: 'dyson-v15-detect-vacuum',
        },
        formdata: {
            personalInfo: {
                name: 'Ram Prasad Sharma',
                phone: '9841000000',
                address: 'Lalitpur, Jawalakhel',
            },
            bankInfo: {
                bankname: 'NIC Asia Bank',
                bankbranch: 'Pulchowk',
                salaryAmount: 68000,
            },
            emiCalculation: {
                duration: 12,
                downPayment: 12000,
                financeAmount: 37200,
                paymentpermonth: 3100,
            },
            granterInfo: {
                name: 'Hari Sharma',
                phone: '9841333333',
                address: 'Kapan, Kathmandu',
            },
        },
        status: 'approved',
        paid_installments: 2,
        total_installments: 12,
        created_at: '2025-01-05',
        bank_name: 'NIC Asia Bank',
    },
];

// ─── Formatters ───────────────────────────────────────────────────────────────

export const fmt = (d?: string) => !d ? 'N/A' : new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
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
    return { label: s || 'Unknown', dot: 'bg-gray-400', cls: 'text-slate-700 bg-gray-50 border-gray-200', icon: <Activity size={11} /> };
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
                            ${isActive ? 'bg-[var(--colour-fsP2)] text-white border-[var(--colour-fsP2)]' : 'bg-white text-slate-700 border-gray-200 hover:border-[var(--colour-fsP2)] hover:text-[var(--colour-fsP2)]'}`}>
                        {f.label}
                        <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${isActive ? 'bg-white/25 text-white' : 'bg-gray-100 text-slate-500'}`}>{f.cnt}</span>
                    </button>
                );
            })}
        </div>
    );
}

export function EmptyState({ label, sub }: { label: string; sub: string }) {
    return (
        <div className="flex flex-col items-center gap-2 py-16 text-center">
            <p className="text-sm font-bold text-slate-800">{label}</p>
            <p className="text-xs text-slate-500">{sub}</p>
            <Link href="/" className="mt-2 text-xs font-semibold text-[var(--colour-fsP2)] hover:underline">Browse Products →</Link>
        </div>
    );
}

/** Simple labeled data row used inside dialogs */
export function DRow({ label, value }: { label: string; value: React.ReactNode }) {
    return (
        <div>
            <p className="text-[10px] text-(--colour-fsP2) uppercase tracking-wider font-bold mb-0.5">{label}</p>
            <div className="text-xs font-bold text-slate-900">{value}</div>
        </div>
    );
}

/** Thin divider label used inside dialogs */
export function DSection({ children }: { children: React.ReactNode }) {
    return <p className="text-[10px] font-bold text-(--colour-fsP2) uppercase tracking-widest border-b border-gray-100 pb-1 mt-4 first:mt-0">{children}</p>;
}
