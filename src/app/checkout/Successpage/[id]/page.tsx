import React from 'react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import RemoteServices, { OrderService } from '@/app/api/remoteservice';
import SuccessClient, { OrderData } from './SuccessClient';

interface SuccessPageProps {
    params: Promise<{
        id: number;
    }>;
}

// --- MAIN SERVER COMPONENT ---
export default async function OrderConfirmation({ params }: SuccessPageProps) {
    // 1. Await params (Next.js 15+ requirement)
    const { id } = await params;
    const cookieStore = await cookies();
    const token = cookieStore.get('access_token')?.value;

    if (!id) {
        redirect('/');
    }

    // 2. Fetch Data Directly on the Server
    let order: OrderData | null = null;
    let error = false;

    try {
        const response = await OrderService.OrderDetails(id, token);
        if (response && (response.success || response.data)) {
            // Handle inconsistent API response structure if any, assuming response.data is the order
            order = response.data;
        } else {
            error = true;
        }
    } catch (err) {
        console.error('Error fetching order:', err);
        error = true;
    }

    // 3. Handle Errors
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