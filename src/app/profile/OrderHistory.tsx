import { Ban, Check, CreditCard, Loader, ShoppingBasket, ThumbsUp, Undo, Eye, RotateCcw, XCircle } from 'lucide-react'
import React, { useState } from 'react'
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,

} from "@/components/ui/alert-dialog"
import {
    Dialog,
    DialogContent,

    DialogHeader,
    DialogTitle,

} from "@/components/ui/dialog"

function OrderHistory() {
    const [AlertDialogstate, setAlertDialogstate] = useState({
        open: false,
        content: '',
        productID: ''
    })
    const [DialogDetailState, setDialogDetailState] = useState({
        open: false,
        content: null,

    })
    const [activeFilter, setActiveFilter] = useState('all')

    // Sample orders data
    const orders = [
        {
            id: 'ORD-2024-001',
            date: 'Oct 5, 2024',
            status: 'Delivered',
            total: 299.99,
            items: 3
        },
        {
            id: 'ORD-2024-002',
            date: 'Oct 8, 2024',
            status: 'Canceled',
            total: 149.50,
            items: 2
        },
        {
            id: 'ORD-2024-003',
            date: 'Oct 10, 2024',
            status: 'Processing',
            total: 89.99,
            items: 1
        }
    ];

    const orderDetails = {
        date: '02 May 2023',
        orderNumber: '024-125478956',
        paymentMethod: 'Mastercard',
        items: [
            {
                id: 1,
                name: 'All In One Chocolate Combo',
                pack: 'Medium',
                qty: 1,
                price: 50.00,
                image: '🍫'
            },
            {
                id: 2,
                name: 'Desire Of Hearts',
                pack: 'Large',
                qty: 1,
                price: 50.00,
                image: '💝'
            }
        ],
        subtotal: 100.00,
        shipping: 2.00,
        tax: 5.00,
        total: 107.00
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Delivered':
                return 'text-emerald-700 bg-emerald-50 border-emerald-200';
            case 'Canceled':
                return 'text-red-700 bg-red-50 border-red-200';
            case 'Processing':
                return 'text-amber-700 bg-amber-50 border-amber-200';
            default:
                return 'text-slate-600 bg-slate-50 border-slate-200';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'Delivered':
                return <Check className="w-3 h-3" />;
            case 'Canceled':
                return <XCircle className="w-3 h-3" />;
            case 'Processing':
                return <Loader className="w-3 h-3" />;
            default:
                return null;
        }
    };

    const filteredOrders = activeFilter === 'all'
        ? orders
        : orders.filter(order => order.status.toLowerCase() === activeFilter.toLowerCase());

    const filterButtons = [
        { key: 'all', label: 'All', icon: ShoppingBasket, count: orders.length },
        { key: 'processing', label: 'Processing', icon: Loader, count: orders.filter(o => o.status === 'Processing').length },
        { key: 'delivered', label: 'Delivered', icon: Check, count: orders.filter(o => o.status === 'Delivered').length },
        { key: 'canceled', label: 'Canceled', icon: Ban, count: orders.filter(o => o.status === 'Canceled').length },
    ];

    return (
        <div className="space-y-4 sm:space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header */}
            <div className="border-b border-slate-100 pb-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div>
                        <div className="flex items-center gap-2">
                            <ShoppingBasket className="w-5 h-5 text-slate-700" />
                            <h2 className="text-xl font-bold text-slate-800">Order History</h2>
                        </div>
                        <p className="text-sm text-slate-500 mt-0.5">{orders.length} total orders</p>
                    </div>
                </div>

                {/* Filter Buttons - Horizontal scroll on mobile */}
                <div className="mt-4 -mx-4 px-4 sm:mx-0 sm:px-0 overflow-x-auto no-scrollbar">
                    <div className="flex gap-2 pb-1">
                        {filterButtons.map((filter) => (
                            <button
                                key={filter.key}
                                onClick={() => setActiveFilter(filter.key)}
                                className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${activeFilter === filter.key
                                    ? 'bg-slate-800 text-white border-slate-800 shadow-sm'
                                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                                    }`}
                            >
                                <filter.icon className="w-3 h-3" />
                                <span>{filter.label}</span>
                                <span className={`ml-1 px-1.5 py-0.5 rounded-full text-[10px] ${activeFilter === filter.key
                                    ? 'bg-white/20 text-white'
                                    : 'bg-slate-100 text-slate-500'
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
                    <div className="text-center py-12 text-slate-400">
                        <ShoppingBasket className="w-12 h-12 mx-auto mb-3 opacity-30" />
                        <p className="text-sm">No orders found</p>
                    </div>
                ) : (
                    filteredOrders.map((order) => (
                        <div key={order.id} className="bg-white border border-slate-200 rounded-xl p-3 sm:p-4 hover:border-slate-300 hover:shadow-sm transition-all">
                            {/* Order Header */}
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                                <div className="flex items-center gap-3">
                                    <div>
                                        <h3 className="font-semibold text-sm text-slate-800">{order.id}</h3>
                                        <p className="text-xs text-slate-400">{order.date}</p>
                                    </div>
                                </div>
                                <span className={`self-start sm:self-auto flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border ${getStatusColor(order.status)}`}>
                                    {getStatusIcon(order.status)}
                                    {order.status}
                                </span>
                            </div>

                            {/* Order Summary */}
                            <div className="flex items-center justify-between py-2 px-3 bg-slate-50 rounded-lg mb-3">
                                <span className="text-slate-500 text-sm">{order.items} {order.items === 1 ? 'item' : 'items'}</span>
                                <span className="text-lg font-bold text-slate-800">Rs {order.total.toFixed(2)}</span>
                            </div>

                            {/* Action Buttons - Stack on mobile, flex on desktop */}
                            <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-2">
                                <button
                                    onClick={() => setDialogDetailState(pre => ({
                                        ...pre, open: true,
                                        content: null
                                    }))}
                                    className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors text-xs font-medium"
                                >
                                    <Eye className="w-3.5 h-3.5" />
                                    <span>Details</span>
                                </button>

                                <button className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors text-xs font-medium">
                                    <RotateCcw className="w-3.5 h-3.5" />
                                    <span>Buy Again</span>
                                </button>

                                {order.status === 'Delivered' && (
                                    <button
                                        onClick={() => setAlertDialogstate(prev => ({
                                            ...prev,
                                            open: true,
                                            content: 'Return Product',
                                            productID: order.id
                                        }))}
                                        className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg border border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100 transition-colors text-xs font-medium"
                                    >
                                        <Undo className="w-3.5 h-3.5" />
                                        <span>Return</span>
                                    </button>
                                )}

                                {order.status === 'Processing' && (
                                    <button
                                        onClick={() => setAlertDialogstate(prev => ({
                                            ...prev,
                                            open: true,
                                            content: 'Cancel Order',
                                            productID: order.id
                                        }))}
                                        className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg border border-red-200 bg-red-50 text-red-700 hover:bg-red-100 transition-colors text-xs font-medium"
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
            <AlertDialog open={AlertDialogstate.open} onOpenChange={() => setAlertDialogstate(prev => ({
                ...prev,
                open: false
            }))}>
                <AlertDialogContent className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-lg max-w-sm mx-4 sm:mx-auto">
                    <AlertDialogHeader>
                        <AlertDialogTitle className="text-slate-800">Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription className="text-sm text-slate-500">
                            This action will request to <span className="font-medium text-slate-700">{AlertDialogstate.content}</span> for order <span className="font-medium text-slate-700">{AlertDialogstate.productID}</span>
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter className="gap-2">
                        <AlertDialogCancel className="cursor-pointer bg-slate-100 text-slate-700 rounded-lg border-0 hover:bg-slate-200">
                            Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction className="cursor-pointer bg-slate-800 rounded-lg hover:bg-slate-900 text-white">
                            <ThumbsUp className="w-4 h-4 mr-1" />
                            Confirm
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Order Details Dialog */}
            <Dialog open={DialogDetailState.open} onOpenChange={() => setDialogDetailState(prev => ({
                ...prev,
                open: false
            }))}>
                <DialogContent className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-lg max-w-md mx-4 sm:mx-auto p-0">
                    <DialogHeader className="p-4 pb-0">
                        <DialogTitle className="text-lg font-bold text-slate-800">Order Summary</DialogTitle>
                    </DialogHeader>
                    <div className="p-4 space-y-4">
                        {/* Order Info */}
                        <div className="grid grid-cols-3 gap-2 p-3 bg-slate-50 rounded-lg">
                            <div>
                                <p className="text-[10px] text-slate-400 uppercase tracking-wide mb-0.5">Date</p>
                                <p className="font-medium text-slate-700 text-sm">{orderDetails.date}</p>
                            </div>
                            <div>
                                <p className="text-[10px] text-slate-400 uppercase tracking-wide mb-0.5">Order #</p>
                                <p className="font-medium text-slate-700 text-sm truncate">{orderDetails.orderNumber}</p>
                            </div>
                            <div>
                                <p className="text-[10px] text-slate-400 uppercase tracking-wide mb-0.5">Payment</p>
                                <div className="flex items-center gap-1">
                                    <CreditCard className="w-3 h-3 text-slate-400" />
                                    <p className="font-medium text-slate-700 text-sm">{orderDetails.paymentMethod}</p>
                                </div>
                            </div>
                        </div>

                        {/* Order Items */}
                        <div className="space-y-2">
                            {orderDetails.items.map((item) => (
                                <div key={item.id} className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                                    <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center text-2xl shadow-sm shrink-0 border border-slate-100">
                                        {item.image}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-medium text-slate-800 text-sm truncate">{item.name}</h3>
                                        <p className="text-xs text-slate-400">Pack: {item.pack} • Qty: {item.qty}</p>
                                    </div>
                                    <div className="font-semibold text-slate-700 shrink-0">
                                        Rs {item.price.toFixed(2)}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Price Breakdown */}
                        <div className="space-y-2 pt-3 border-t border-slate-100">
                            <div className="flex justify-between text-slate-500 text-sm">
                                <span>Subtotal</span>
                                <span>Rs {orderDetails.subtotal.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-slate-500 text-sm">
                                <span>Shipping</span>
                                <span>Rs {orderDetails.shipping.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-slate-500 text-sm">
                                <span>Tax</span>
                                <span>Rs {orderDetails.tax.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between items-center pt-2 border-t border-slate-100">
                                <span className="font-bold text-slate-800">Total Paid</span>
                                <span className="font-bold text-lg text-blue-600">Rs {orderDetails.total.toFixed(2)}</span>
                            </div>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    )
}

export default OrderHistory
