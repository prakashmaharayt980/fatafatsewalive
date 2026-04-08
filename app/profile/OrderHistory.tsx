'use client';

import React, { useState, useEffect } from 'react';
import OrdersSection from './orders/OrdersSection';
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

    const filteredOrders = orders.filter(order => {
        const id = String(order.id ?? '').toLowerCase();
        const invoice = String(order.invoice_number ?? '').toLowerCase();
        const status = String(order.order_status ?? '').toLowerCase();
        const search = searchTerm.toLowerCase();

        const hasProduct = order.items?.some(item =>
            (item.product?.name ?? '').toLowerCase().includes(search)
        );

        return id.includes(search) || invoice.includes(search) || status.includes(search) || hasProduct;
    });

    return (
        <div className="space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-gray-100">
                <div>
                    <h2 className="text-lg font-bold text-slate-900">Orders</h2>
                    <p className="text-xs text-slate-500 mt-0.5">
                        {orders.length} total orders
                    </p>
                </div>
            </div>

            <OrdersSection orders={filteredOrders} loading={loading} error={error} />
        </div>
    );
}
