'use client';

import React, { useState, useEffect } from 'react';
import { ShoppingBag, Layers, CreditCard } from 'lucide-react';
import { OrderService } from '@/app/api/remoteservice';
import OrdersSection from './orders/OrdersSection';
import PreOrdersSection from './orders/PreOrdersSection';
import EmiSection from './orders/EmiSection';
import { MOCK_PRE_ORDERS, MOCK_EMI_ORDERS, type Order } from './orders/shared';

type TabType = 'orders' | 'pre_orders' | 'emi';

const TABS: { id: TabType; label: string; icon: typeof ShoppingBag }[] = [
    { id: 'orders', label: 'Orders', icon: ShoppingBag },
    { id: 'pre_orders', label: 'Pre-orders', icon: Layers },
    { id: 'emi', label: 'EMI Orders', icon: CreditCard },
];

export default function OrderHistory() {
    const [activeTab, setActiveTab] = useState<TabType>('orders');
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        OrderService.OrderList()
            .then((res: any) => setOrders(res?.data ?? (Array.isArray(res) ? res : [])))
            .catch((e: any) => setError(e?.message ?? 'Failed to load orders'))
            .finally(() => setLoading(false));
    }, []);

    const counts: Record<TabType, number> = {
        orders: orders.length,
        pre_orders: MOCK_PRE_ORDERS.length,
        emi: MOCK_EMI_ORDERS.length,
    };

    return (
        <div className="w-full max-w-5xl">
            {/* Page heading */}
            <h2 className="text-base font-bold text-[var(--colour-fsP2)] mb-3">Order History</h2>

            {/* Tab pills */}
            <div className="flex flex-wrap gap-2 pb-4 mb-4 border-b border-gray-100">
                {TABS.map(tab => {
                    const active = activeTab === tab.id;
                    return (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-semibold border transition-all
                                ${active
                                    ? 'bg-[var(--colour-fsP2)] text-white border-[var(--colour-fsP2)]'
                                    : 'bg-white text-gray-500 border-gray-200 hover:border-[var(--colour-fsP2)] hover:text-[var(--colour-fsP2)]'}`}
                        >
                            <tab.icon size={13} />
                            {tab.label}
                            <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${active ? 'bg-white/25 text-white' : 'bg-gray-100 text-gray-400'}`}>
                                {counts[tab.id]}
                            </span>
                        </button>
                    );
                })}
            </div>

            {/* Sections — only the active one renders */}
            {activeTab === 'orders' && <OrdersSection orders={orders} loading={loading} error={error} />}
            {activeTab === 'pre_orders' && <PreOrdersSection />}
            {activeTab === 'emi' && <EmiSection />}
        </div>
    );
}
