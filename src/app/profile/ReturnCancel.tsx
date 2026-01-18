import { Ban, CreditCard, PackageCheck, Search, ThumbsUp, Trash, Undo } from 'lucide-react';
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

function ReturnCancel() {
    const [AlertDialogstate, setAlertDialogstate] = useState({
        open: false,
        content: '',
        productID: ''
    })
    const [DialogDetailState, setDialogDetailState] = useState({
        open: false,
        content: null,

    })
    // Sample orders data
    const orders = [
        {
            id: 'ORD-2024-001',
            date: 'Oct 5, 2024',
            status: 'Return',
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
            status: '',
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

    const getStatusColor = (status) => {
        switch (status) {
            case 'Return':
                return 'text-green-600 bg-green-50';
            case 'Canceled':
                return 'bg-red-500  text-red-50';

            default:
                return 'text-gray-600 bg-gray-50';
        }
    };
    return (
        <div>
            <div className="space-y-4">
                <div className="bg-white border border-gray-200 p-4 rounded-xl flex flex-row justify-between">
                    <div  >
                        <div className='flex flex-row items-center gap-2'>
                            <Ban className="w-5 h-5" />
                            <h2 className="text-xl font-semibold text-[var(--colour-fsP2)]">Return & Cancel</h2>
                        </div>
                        <p className="text-sm text-gray-500 ml-1">{orders.length} total orders</p>
                    </div>

                    <div className='flex felx-row items-center gap-1.5'>
                        <div className='shadow-sm rounded-2xl flex felx-row items-center px-2'>
                            <input
                                type="text"
                                placeholder="Enter Order Id"
                                // value={state.search}
                                // onChange={handleSearchChange}
                                className="w-full py-2 px-4  bg-transparent  focus:outline-none text-sm"
                                autoFocus
                            />
                            <Search className='w-5 h-5 text-[var(--colour-fsP2)]' />
                        </div>

                        <button className=' rounded-xl flex flex-row h-7 gap-2 items-center text-green-600 bg-green-50 border border-gray-200 px-4 text-sm ' >
                            <Undo className="w-4 h-4" />
                            <span> Return</span></button>
                        <button className=' rounded-xl flex flex-row h-7 gap-2 items-center bg-red-600  text-red-50 border border-gray-200 px-4 text-sm ' >
                            <Ban className="w-4 h-4" />
                            <span>  Canceled</span></button>

                    </div>
                </div>



                {orders.map((order) => (
                    <div key={order.id} className="bg-white border rounded-2xl border-gray-200 p-3 hover:border-gray-300 transition-colors">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-2">
                            <div>
                                <h3 className="font-semibold text-sm text-[var(--colour-fsP1)]">{order.id}</h3>
                                <p className="text-xs text-gray-500 ">{order.date}</p>
                            </div>
                            <span className={`mt-2 sm:mt-0 px-3 py-1 rounded-xl text-sm font-medium w-fit ${getStatusColor(order.status)}`}>
                                {order.status}
                            </span>
                        </div>

                        <div className="border-t border-gray-200 pt-2 flex justify-between items-center">
                            <span className="text-gray-600 text-sm">{order.items} items</span>
                            <span className="text-lg font-semibold text-gray-900">${order.total.toFixed(2)}</span>
                        </div>

                        <div className="mt-2 flex gap-3 justify-end">
                            <button
                                onClick={() => setDialogDetailState(pre => ({
                                    ...pre, open: true,
                                    content: null
                                }))}
                                className="flex gap-2 items-center flex-row rounded-2xl px-3 py-1 bg-gray-600 text-white hover:bg-[var(--colour-fsP1)]  transition-colors text-sm font-medium">
                                <PackageCheck className='w-4 h-4' />
                                <span>    View Details</span>
                            </button>

                            <button
                                onClick={() => setAlertDialogstate(prev => ({
                                    ...prev,
                                    open: true,
                                    content: 'Retrun Product',
                                    productID: order.id

                                }))}
                                className="flex gap-2 items-center flex-row rounded-2xl px-3 py-1 bg-red-700 text-white hover:bg-[var(--colour-fsP1)]  transition-colors text-sm font-medium">
                                <Undo className='w-4 h-4' />
                                <span> Return</span>
                            </button>
                            <button
                                onClick={() => setAlertDialogstate(prev => ({
                                    ...prev,
                                    open: true,
                                    content: 'Cancel Product',
                                    productID: order.id

                                }))}
                                className="flex gap-2 items-center flex-row rounded-2xl px-3 py-1 bg-red-700 text-white hover:bg-[var(--colour-fsP1)]  transition-colors text-sm font-medium">
                                <Ban className='w-4 h-4' />
                                <span>    Cancel</span>
                            </button>


                        </div>
                    </div>
                ))}
            </div>

            <AlertDialog open={AlertDialogstate.open} onOpenChange={() => setAlertDialogstate(prev => ({
                ...prev,
                open: false
            }))}>

                <AlertDialogContent className='border border-gray-200 rounded-xl overflow-hidden bg-white shadow-sm'>
                    <AlertDialogHeader>
                        <AlertDialogTitle className='text-[var(--colour-fsP2)]'>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription className='text-sm px-3'>
                            This Action will request to <span className='text-[var(--colour-fsP1)]'>{AlertDialogstate.content}</span> which has <br /> Product Id : <span className='text-[var(--colour-fsP1)]'> {AlertDialogstate.productID} </span>
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel className=' cursor-pointer bg-red-600 text-white rounded-3xl '>
                            <Trash className='w-4 h-4' />
                            Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction className=' cursor-pointer bg-[var(--colour-fsP2)] rounded-3xl  hover:bg-[var(--colour-fsP1)] text-white'>
                            <ThumbsUp className='w-4 h-4' />
                            Sure
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            <Dialog open={DialogDetailState.open} onOpenChange={() => setDialogDetailState(prev => ({
                ...prev,
                open: false
            }))}>

                <DialogContent className='border border-gray-200 rounded-xl overflow-hidden bg-white shadow-sm'>
                    <DialogHeader className=''>
                        <DialogTitle hidden>Product Details</DialogTitle>
                        <h2 className="text-2xl sm:text-2xl font-black text-[var(--colour-fsP2)] ">Order Summary</h2>
                    </DialogHeader>
                    <div className="lg:col-span-3 ">


                        {/* Order Info */}
                        <div className="grid grid-cols-3 gap-3 mb-5 pb-4 border-b border-gray-200">
                            <div>
                                <p className="text-xs text-gray-500 mb-0.5">Date</p>
                                <p className="font-bold text-gray-700 text-sm">{orderDetails.date}</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 mb-0.5">Order Number</p>
                                <p className="font-bold text-gray-700 text-sm">{orderDetails.orderNumber}</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 mb-0.5">Payment Method</p>
                                <div className="flex items-center">
                                    <CreditCard className="w-3.5 h-3.5 mr-1 text-gray-600" />
                                    <p className="font-bold text-gray-700 text-sm">{orderDetails.paymentMethod}</p>
                                </div>
                            </div>
                        </div>

                        {/* Order Items */}
                        <div className="space-y-3 mb-5">
                            {orderDetails.items.map((item) => (
                                <div key={item.id} className="flex items-center gap-3 p-3 bg-gray-100 backdrop-blur rounded-xl border border-rose-100/50 hover:shadow-md transition-all duration-200">
                                    <div className="w-16 h-16 bg-white rounded-lg flex items-center justify-center text-3xl shadow-sm shrink-0">
                                        {item.image}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-bold text-gray-900 text-sm mb-0.5 truncate">{item.name}</h3>
                                        <p className="text-xs text-gray-600">Pack: {item.pack}</p>
                                        <p className="text-xs text-gray-600">Qty: {item.qty}</p>
                                    </div>
                                    <div className=" font-semibold text-lg text-gray-600 shrink-0">
                                        Rs {item.price.toFixed(2)}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Price Breakdown */}
                        <div className="space-y-2 mb-4 pb-4 border-b border-gray-200">
                            <div className="flex justify-between text-gray-600 text-sm">
                                <span>Sub Total</span>
                                <span className="font-semibold">Rs {orderDetails.subtotal.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-gray-600 text-sm">
                                <span>Shipping</span>
                                <span className="font-semibold">Rs {orderDetails.shipping.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-gray-600 text-sm">
                                <span>Tax</span>
                                <span className="font-semibold">Rs {orderDetails.tax.toFixed(2)}</span>
                            </div>
                        </div>

                        <div className="flex justify-between items-center  text-base">
                            <span className="font-bold text-gray-900">Total Paid</span>
                            <span className="font-bold text-[var(--colour-fsP2)]">Rs {orderDetails.total.toFixed(2)}</span>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    )

}

export default ReturnCancel
