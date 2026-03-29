import React from 'react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';

import SuccessClient, { type OrderData } from './SuccessClient';
import { OrderService } from '@/app/api/services/order.service';

interface SuccessPageProps {
    params: Promise<{
        id: number;
    }>;
}

import { Suspense } from 'react';

// --- CONTENT COMPONENT ---
async function OrderConfirmationContent({ params }: SuccessPageProps) {
    const { id } = await params;
    const cookieStore = await cookies();
    const token = cookieStore.get('access_token')?.value;

    if (!id) {
        redirect('/');
    }

    let order: OrderData | null = null;
    let error = false;

    try {
        const response = await OrderService.OrderDetails(id, token);
        if (response && (response.success || response.data)) {
            order = response.data;
        } else {
            error = true;
        }
    } catch (err) {
        console.error('Error fetching order:', err);
        error = true;
    }

    if (error || !order) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center p-4">
                <p className="text-red-500 mb-4">Order not found or server error.</p>
                <Link
                    href="/"
                    className="px-4 py-2 bg-[var(--colour-fsP2)] text-white rounded-lg hover:opacity-90 transition-opacity"
                >
                    Return Home
                </Link>
            </div>
        );
    }

    return (
        <SuccessClient order={order} />
    );
}

// --- MAIN PAGE WRAPPER ---
export default function OrderConfirmation(props: SuccessPageProps) {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex flex-col items-center justify-center p-4 space-y-4">
                <div className="w-12 h-12 border-4 border-[var(--colour-fsP2)] border-t-transparent rounded-full animate-spin"></div>
                <p className="text-gray-500 font-medium">Confirming your order...</p>
            </div>
        }>
            <OrderConfirmationContent {...props} />
        </Suspense>
    );
}