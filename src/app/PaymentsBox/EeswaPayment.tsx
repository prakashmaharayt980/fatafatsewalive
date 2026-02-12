'use client';

import { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { PaymentService } from '@/app/api/services/payments.service';

interface EsewaPaymentProps {
    orderId: string;
    amount: number;
}

export default function EeswaPayment({ orderId, amount }: EsewaPaymentProps) {
    useEffect(() => {
        const initiatePayment = async () => {
            // 1. Prepare data for backend initiation
            // const payload = {
            //     amt: amount,
            //     pid: orderId,
            //     su: `${window.location.origin}/checkout/Successpage?oid=${orderId}`,
            //     fu: `${window.location.origin}/checkout/failed`,
            // };

            const payload = {
                order_id: orderId,
                amount: amount
            }
            try {
                // 2. Call backend to sign the parameters
                const response = await PaymentService.InitiateEeswaPayment(payload);

                if (response && response.params && response.gatewayUrl) {
                    const params = response.params;
                    const gatewayUrl = response.gatewayUrl;

                    // 3. Create and submit the form with signed data
                    const form = document.createElement('form');
                    form.setAttribute('method', 'POST');
                    form.setAttribute('action', gatewayUrl);

                    for (const key in params) {
                        const hiddenField = document.createElement('input');
                        hiddenField.setAttribute('type', 'hidden');
                        hiddenField.setAttribute('name', key);
                        hiddenField.setAttribute('value', params[key]);
                        form.appendChild(hiddenField);
                    }
                    document.body.appendChild(form);
                    form.submit();
                } else {
                    console.error("Invalid response from payment initiation api", response);
                    alert("Failed to initiate payment. Please try again.");
                }

            } catch (error) {
                console.error("Error initiating Esewa payment:", error);
                alert("An error occurred while initiating payment.");
            }
        };

        if (orderId && amount) {
            initiatePayment();
        }
    }, [orderId, amount]);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="bg-white p-6 rounded-xl shadow-xl flex flex-col items-center gap-4 max-w-sm w-full mx-4">
                <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center">
                    <Loader2 className="w-8 h-8 text-green-600 animate-spin" />
                </div>
                <div className="text-center">
                    <h3 className="text-lg font-bold text-slate-800">Redirecting to Esewa</h3>
                    <p className="text-sm text-slate-500 mt-1">Please wait while we redirect you to Esewa payment gateway...</p>
                </div>
            </div>
        </div>
    );
}
