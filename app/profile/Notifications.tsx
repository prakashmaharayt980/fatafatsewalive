import { Bell, ShoppingBasket, Star, TicketPercent } from 'lucide-react';
import React, { useState } from 'react'
import {
    Dialog,
    DialogClose,
    DialogContent,
   
    DialogFooter,
    DialogHeader,
    DialogTitle,

} from "@/components/ui/dialog"
import { Button } from '@/components/ui/button';

function Notifications() {
    const [NotificationState, setNotificationState] = useState({
        open: false,
        ratingvalue: 0,
        hoverRating: 0,
        newRating: 0
    })

    const notifications = [
        {
            id: 1,
            title: 'Order Delivered',
            message: 'Your order #ORD-2024-001 has been delivered successfully',
            time: '2 hours ago',
            read: false
        },
        {
            id: 2,
            title: 'Special Offer',
            message: '30% off on all electronics. Limited time offer!',
            time: '5 hours ago',
            read: false
        },
        {
            id: 3,
            title: 'Order Shipped',
            message: 'Your order #ORD-2024-002 is on its way',
            time: '1 day ago',
            read: true
        },
        {
            id: 4,
            title: 'Password Changed',
            message: 'Your password was successfully updated',
            time: '3 days ago',
            read: true
        }
    ];



    return (
        <div>
            <div className="space-y-4">


                <div className="bg-white border border-gray-200 p-4 rounded-xl flex flex-row justify-between">
                    <div  >
                        <div className='flex flex-row items-center gap-2'>
                            <Bell className="w-5 h-5 text-[var(--colour-fsP2)]" />
                            <h2 className="text-xl font-semibold text-[var(--colour-fsP2)]">Notifications</h2>
                        </div>
                        <p className="text-sm text-gray-500 ml-1">{notifications.filter(n => !n.read).length} unread</p>
                    </div>

                    <div className='flex felx-row items-center gap-1.5'>
                        <button className=' rounded-xl flex flex-row h-7 gap-2 items-center text-amber-600 border border-gray-200 bg-amber-50 px-4 text-sm ' >
                            <ShoppingBasket className="w-4 h-4" />
                            <span>  Order</span></button>
                        <button className=' rounded-xl flex flex-row h-7 gap-2 items-center text-amber-600 border border-gray-200 bg-amber-50 px-4 text-sm ' >
                            <TicketPercent className="w-4 h-4" />
                            <span>Promos</span></button>
                        <button className=' rounded-xl flex flex-row h-7 gap-2 items-center text-green-600 bg-green-50 border border-gray-200 px-4 text-sm ' >
                            <Bell className="w-4 h-4" />
                            <span>   Mark all read</span></button>


                    </div>
                </div>

                {notifications.map((notification) => (
                    <div
                        key={notification.id}
                        className={` border p-2 hover:border-gray-300 rounded-xl  transition-colors ${notification.read ? 'border-gray-200 bg-white' : 'border-[var(--colour-fsP2)]/20 bg-gray-100'
                            }`}
                    >
                        <div className="flex justify-between items-start flex-col">
                            <div className="flex-1">
                                <div className="flex items-center gap-2 justify-between">
                                    <div className='flex items-center gap-2'>
                                        <ShoppingBasket className="w-4 h-4 text-[var(--colour-fsP2)]" />
                                        <h3 className="font-semibold text-[var(--colour-fsP1)] ">{notification.title}</h3>
                                    </div>
                                    {!notification.read && (
                                        <span className="w-2 h-2 bg-[var(--colour-fsP2)] rounded-full"></span>
                                    )}
                                </div>
                                <p className="text-gray-600  text-sm">{notification.message}</p>
                                <p className="text-xs text-gray-400 ">{notification.time}</p>
                            </div>
                            <div className='flex flex-row justify-end w-full gap-2'>
                                <button
                                    onClick={() => setNotificationState(prev => ({
                                        ...prev,
                                        open: true,


                                    }))}
                                    className="flex cursor-pointer gap-2 items-center flex-row rounded-2xl px-3 py-1 bg-yellow-600 text-white hover:bg-[var(--colour-fsP1)]  transition-colors text-sm font-medium">
                                    <Star className='w-4 h-4' />
                                    <span>Rate Order</span>
                                </button>
                                <button

                                    className="flex cursor-pointer gap-2 items-center flex-row rounded-2xl px-3 py-1 bg-[var(--colour-fsP2)]   text-white hover:bg-[var(--colour-fsP1)]  transition-colors text-sm font-medium">
                                    <ShoppingBasket className='w-4 h-4' />
                                    <span>Shop now</span>
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
            <Dialog open={NotificationState.open} onOpenChange={() => setNotificationState(prev => ({
                ...prev,
                open: false
            }))}>

                <DialogContent className='border border-gray-200 rounded-xl overflow-hidden bg-white shadow-sm'>
                    <DialogHeader>
                        <DialogTitle className='text-[var(--colour-fsP2)] text-center'>Rating Order Service</DialogTitle>

                    </DialogHeader>
                    <div className="flex items-center justify-center gap-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                            <button
                                key={star}
                                type="button"
                                className="p-1  rounded-sm"
                                onClick={() => setNotificationState({ ...NotificationState, ratingvalue: star })}
                                onMouseEnter={() => setNotificationState({ ...NotificationState, hoverRating: star })}
                                onMouseLeave={() => setNotificationState({ ...NotificationState, hoverRating: star })}
                            >
                                <Star
                                    size={18}
                                    className={`transition-colors duration-150 ${star <= (NotificationState.newRating || NotificationState.hoverRating)
                                        ? 'text-yellow-400 fill-yellow-400'
                                        : 'text-gray-300 hover:text-gray-400'
                                        }`}
                                />
                            </button>
                        ))}
                    </div>


                    <DialogFooter>
                        <DialogClose className=' cursor-pointer bg-red-600 text-white rounded-3xl ' asChild>
                            <Button variant="outline">Cancel</Button>
                        </DialogClose>
                        <div className='flex flex-row gap-1 items-center cursor-pointer bg-[var(--colour-fsP2)] rounded-3xl  px-4 hover:bg-[var(--colour-fsP1)] text-white'>
                            <Star className='w-3 h-3' />
                            <button className='text-sm ' type="submit">Rate it</button>

                        </div>
                    </DialogFooter>

                </DialogContent>
            </Dialog>
        </div>
    )
}

export default Notifications
