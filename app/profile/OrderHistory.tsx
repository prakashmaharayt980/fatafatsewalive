'use client';

import React, { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import OrdersSection from './orders/OrdersSection';
import { MOCK_ORDERS } from './orders/shared';
import { OrderService } from '../api/services/order.service';
import type { Order } from './types';

export default function OrderHistory() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        OrderService.OrderList()
            .then((res: { data?: Order[] } | Order[]) => {
                const data = Array.isArray(res) ? res : res?.data ?? [];
                setOrders(data);
            })
            .catch((e: { message?: string }) => setError(e?.message ?? 'Failed to load orders'))
            .finally(() => setLoading(false));
    }, []);

    const effectiveOrders = orders.length > 0 ? orders : MOCK_ORDERS;

    const filteredOrders = effectiveOrders.filter(order => {
        const id = String(order.id ?? '').toLowerCase();
        const status = String(order.status ?? '').toLowerCase();
        const search = searchTerm.toLowerCase();
        const hasProduct = order.items?.some(item =>
            (item.product?.name ?? '').toLowerCase().includes(search) ||
            (item.name ?? '').toLowerCase().includes(search)
        );
        return id.includes(search) || status.includes(search) || hasProduct;
    });

    return (
        <div className="space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-gray-100">
                <div>
                    <h2 className="text-lg font-bold text-slate-900">Orders</h2>
                    <p className="text-xs text-slate-500 mt-0.5">
                        {effectiveOrders.length > 0 ? `${effectiveOrders.length} total orders` : 'Your purchase history'}
                    </p>
                </div>
                <div className="relative w-full sm:w-52">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
                    <input
                        type="text"
                        placeholder="Search by order or product..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full h-9 pl-9 pr-3 bg-gray-50 border border-gray-200 rounded-lg text-xs focus:outline-none focus:border-(--colour-fsP2) focus:bg-white transition-colors"
                    />
                </div>
            </div>

            <OrdersSection orders={filteredOrders} loading={loading} error={orders.length > 0 ? error : null} />
        </div>
    );
}
