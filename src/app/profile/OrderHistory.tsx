'use client';

import { Ban, Check, CreditCard, Loader, ShoppingBasket, ThumbsUp, Undo, Eye, RotateCcw, XCircle, Package } from 'lucide-react';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { OrderService } from '@/app/api/remoteservice';

interface OrderItem {
    id: number;
    product_id: number;
    quantity: number;
    price: number;
    product: {
        id: number;
        name: string;
        slug: string;
        image?: {
            thumb: string;
            full: string;
        };
    };
}

interface Order {
    id: number;
    invoice_number: string;
    status: number;
    order_status: string;
    order_total: number;
    shipping_cost: number;
    payment_type: string;
    items: OrderItem[];
    created_at: string;
}

function OrderHistory() {
    const [AlertDialogstate, setAlertDialogstate] = useState({
        open: false,
        content: '',
        productID: ''
    });
    const [DialogDetailState, setDialogDetailState] = useState<{
        open: boolean;
        content: Order | null;
    }>({
        open: false,
        content: null,
    });
    const [activeFilter, setActiveFilter] = useState('all');
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Fetch orders on component mount
    useEffect(() => {
        const fetchOrders = async () => {
            try {
                setLoading(true);
                const response = await OrderService.OrderList();
                if (response && response.data) {
                    setOrders(response.data);
                } else if (Array.isArray(response)) {
                    setOrders(response);
                }
                setError(null);
            } catch (err: any) {
                console.error('Error fetching orders:', err);
                setError(err.message || 'Failed to load orders');
            } finally {
                setLoading(false);
            }
        };

        fetchOrders();
    }, []);

    const getStatusColor = (status: string) => {
        const statusLower = status.toLowerCase();
        if (statusLower.includes('deliver')) {
            return 'text-emerald-700 bg-emerald-50 border-emerald-200';
        } else if (statusLower.includes('cancel')) {
            return 'text-red-700 bg-red-50 border-red-200';
        } else if (statusLower.includes('process') || statusLower.includes('pending')) {
            return 'text-amber-700 bg-amber-50 border-amber-200';
        }
        return 'text-slate-600 bg-slate-50 border-slate-200';
    };

    const getStatusIcon = (status: string) => {
        const statusLower = status.toLowerCase();
        if (statusLower.includes('deliver')) {
            return <Check className="w-3 h-3" />;
        } else if (statusLower.includes('cancel')) {
            return <XCircle className="w-3 h-3" />;
        } else if (statusLower.includes('process') || statusLower.includes('pending')) {
            return <Loader className="w-3 h-3" />;
        }
        return null;
    };

    const filteredOrders = activeFilter === 'all'
        ? orders
        : orders.filter(order => order.order_status.toLowerCase().includes(activeFilter.toLowerCase()));

    const getFilterCount = (filterKey: string) => {
        if (filterKey === 'all') return orders.length;
        return orders.filter(o => o.order_status.toLowerCase().includes(filterKey.toLowerCase())).length;
    };

    const filterButtons = [
        { key: 'all', label: 'All', icon: ShoppingBasket, count: getFilterCount('all') },
        { key: 'process', label: 'Processing', icon: Loader, count: getFilterCount('process') },
        { key: 'deliver', label: 'Delivered', icon: Check, count: getFilterCount('deliver') },
        { key: 'cancel', label: 'Canceled', icon: Ban, count: getFilterCount('cancel') },
    ];

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--colour-fsP2)]"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-center py-12">
                <XCircle className="w-12 h-12 mx-auto mb-3 text-red-400" />
                <p className="text-sm text-red-600">{error}</p>
            </div>
        );
    }

    return (
        <div className="space-y-4 sm:space-y-6">
            {/* Header */}
            <div className="border-b border-gray-200 pb-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div>
                        <div className="flex items-center gap-2">
                            <ShoppingBasket className="w-5 h-5 text-[var(--colour-fsP2)]" />
                            <h2 className="text-xl font-bold text-gray-800">Order History</h2>
                        </div>
                        <p className="text-sm text-gray-500 mt-0.5">{orders.length} total orders</p>
                    </div>
                </div>

                {/* Filter Buttons - Horizontal scroll on mobile */}
                <div className="mt-4 -mx-4 px-4 sm:mx-0 sm:px-0 overflow-x-auto no-scrollbar">
                    <div className="flex gap-2 pb-1">
                        {filterButtons.map((filter) => (
                            <button
                                key={filter.key}
                                onClick={() => setActiveFilter(filter.key)}
                                className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border ${activeFilter === filter.key
                                    ? 'bg-[var(--colour-fsP2)] text-white border-[var(--colour-fsP2)]'
                                    : 'bg-white text-gray-600 border-gray-200'
                                    }`}
                            >
                                <filter.icon className="w-3 h-3" />
                                <span>{filter.label}</span>
                                <span className={`ml-1 px-1.5 py-0.5 rounded-full text-[10px] ${activeFilter === filter.key
                                    ? 'bg-white/20 text-white'
                                    : 'bg-gray-100 text-gray-500'
                                    }`}>
                                    {filter.count}
                                </span>
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Orders List */}
            <div className="space-y-3">
                {filteredOrders.length === 0 ? (
                    <div className="text-center py-12 text-gray-400">
                        <ShoppingBasket className="w-12 h-12 mx-auto mb-3 opacity-30" />
                        <p className="text-sm">No orders found</p>
                    </div>
                ) : (
                    filteredOrders.map((order) => (
                        <div key={order.id} className="bg-white border border-gray-200 rounded-lg p-3 sm:p-4">
                            {/* Order Header */}
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                                <div className="flex items-center gap-3">
                                    <div>
                                        <h3 className="font-semibold text-sm text-gray-800">{order.invoice_number}</h3>
                                        <p className="text-xs text-gray-400">{formatDate(order.created_at)}</p>
                                    </div>
                                </div>
                                <span className={`self-start sm:self-auto flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border ${getStatusColor(order.order_status)}`}>
                                    {getStatusIcon(order.order_status)}
                                    {order.order_status}
                                </span>
                            </div>

                            {/* Order Summary */}
                            <div className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded-lg mb-3">
                                <span className="text-gray-500 text-sm">{order.items.length} {order.items.length === 1 ? 'item' : 'items'}</span>
                                <span className="text-lg font-bold text-[var(--colour-fsP2)]">Rs {order.order_total.toLocaleString()}</span>
                            </div>

                            {/* Action Buttons - Stack on mobile, flex on desktop */}
                            <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-2">
                                <Link
                                    href={`/checkout/Successpage/${order.id}`}
                                    className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-gray-100 text-gray-700 text-xs font-medium"
                                >
                                    <Eye className="w-3.5 h-3.5" />
                                    <span>Details</span>
                                </Link>

                                <button
                                    onClick={() => setDialogDetailState({ open: true, content: order })}
                                    className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-[var(--colour-fsP2)] text-white text-xs font-medium"
                                >
                                    <RotateCcw className="w-3.5 h-3.5" />
                                    <span>Buy Again</span>
                                </button>

                                {order.order_status.toLowerCase().includes('deliver') && (
                                    <button
                                        onClick={() => setAlertDialogstate({
                                            open: true,
                                            content: 'Return Product',
                                            productID: order.invoice_number
                                        })}
                                        className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg border border-amber-200 bg-amber-50 text-amber-700 text-xs font-medium"
                                    >
                                        <Undo className="w-3.5 h-3.5" />
                                        <span>Return</span>
                                    </button>
                                )}

                                {(order.order_status.toLowerCase().includes('process') || order.order_status.toLowerCase().includes('pending')) && (
                                    <button
                                        onClick={() => setAlertDialogstate({
                                            open: true,
                                            content: 'Cancel Order',
                                            productID: order.invoice_number
                                        })}
                                        className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg border border-red-200 bg-red-50 text-red-700 text-xs font-medium"
                                    >
                                        <Ban className="w-3.5 h-3.5" />
                                        <span>Cancel</span>
                                    </button>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Alert Dialog */}
            <AlertDialog open={AlertDialogstate.open} onOpenChange={() => setAlertDialogstate({ open: false, content: '', productID: '' })}>
                <AlertDialogContent className="border border-gray-200 rounded-xl overflow-hidden bg-white max-w-sm mx-4 sm:mx-auto">
                    <AlertDialogHeader>
                        <AlertDialogTitle className="text-gray-800">Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription className="text-sm text-gray-500">
                            This action will request to <span className="font-medium text-gray-700">{AlertDialogstate.content}</span> for order <span className="font-medium text-gray-700">{AlertDialogstate.productID}</span>
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter className="gap-2">
                        <AlertDialogCancel className="cursor-pointer bg-gray-100 text-gray-700 rounded-lg border-0">
                            Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction className="cursor-pointer bg-[var(--colour-fsP2)] rounded-lg text-white">
                            <ThumbsUp className="w-4 h-4 mr-1" />
                            Confirm
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Order Details Dialog */}
            <Dialog open={DialogDetailState.open} onOpenChange={() => setDialogDetailState({ open: false, content: null })}>
                <DialogContent className="border border-gray-200 rounded-xl overflow-hidden bg-white max-w-md mx-4 sm:mx-auto p-0">
                    <DialogHeader className="p-4 pb-0">
                        <DialogTitle className="text-lg font-bold text-gray-800">Order Items</DialogTitle>
                    </DialogHeader>
                    {DialogDetailState.content && (
                        <div className="p-4 space-y-4">
                            {/* Order Info */}
                            <div className="grid grid-cols-2 gap-2 p-3 bg-gray-50 rounded-lg">
                                <div>
                                    <p className="text-[10px] text-gray-400 uppercase tracking-wide mb-0.5">Date</p>
                                    <p className="font-medium text-gray-700 text-sm">{formatDate(DialogDetailState.content.created_at)}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] text-gray-400 uppercase tracking-wide mb-0.5">Payment</p>
                                    <div className="flex items-center gap-1">
                                        <CreditCard className="w-3 h-3 text-gray-400" />
                                        <p className="font-medium text-gray-700 text-sm capitalize">{DialogDetailState.content.payment_type?.replace(/_/g, ' ')}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Order Items */}
                            <div className="space-y-2 max-h-[300px] overflow-y-auto">
                                {DialogDetailState.content.items.map((item) => (
                                    <div key={item.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                                        <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center shrink-0 border border-gray-200 overflow-hidden">
                                            {item.product.image?.thumb ? (
                                                <img src={item.product.image.thumb} alt={item.product.name} className="w-full h-full object-cover" />
                                            ) : (
                                                <Package className="w-6 h-6 text-gray-400" />
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h3 className="font-medium text-gray-800 text-sm truncate">{item.product.name}</h3>
                                            <p className="text-xs text-gray-400">Qty: {item.quantity}</p>
                                        </div>
                                        <div className="font-semibold text-[var(--colour-fsP2)] shrink-0">
                                            Rs {item.price.toLocaleString()}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Price Summary */}
                            <div className="pt-3 border-t border-gray-200">
                                <div className="flex justify-between items-center">
                                    <span className="font-bold text-gray-800">Total Paid</span>
                                    <span className="font-bold text-lg text-[var(--colour-fsP2)]">Rs {DialogDetailState.content.order_total.toLocaleString()}</span>
                                </div>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}

export default OrderHistory;
