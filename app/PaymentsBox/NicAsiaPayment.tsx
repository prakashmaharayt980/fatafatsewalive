'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { PaymentService } from '@/app/api/services/payments.service';

interface NicAsiaPaymentProps {
    orderId: number;
}

export default function NicAsiaPayment({ orderId }: NicAsiaPaymentProps) {
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const initiatePayment = async () => {
            try {
                setLoading(true);
                const data = await PaymentService.InitiateNicasiaPayment({ order_id: orderId });

                // Check if backend gave us the required data
                if (!data.gatewayUrl || !data.params) {
                    alert('Failed to initiate payment: Invalid response from server');
                    setLoading(false);
                    // Optionally redirect back or allow retry
                    return;
                }

                console.log('NIC Asia Payment Data:', data);

                // Create a Hidden Form to "Bridge" the data to NIC Asia
                // NIC Asia requires a Form POST, not an AJAX request.
                const form = document.createElement("form");
                form.setAttribute("method", "POST");
                form.setAttribute("action", data.gatewayUrl);

                // Add all signed parameters as hidden inputs
                Object.keys(data.params).forEach((key) => {
                    const hiddenField = document.createElement("input");
                    hiddenField.setAttribute("type", "hidden");
                    hiddenField.setAttribute("name", key);
                    hiddenField.setAttribute("value", data.params[key]);
                    form.appendChild(hiddenField);
                });

                // Auto-Submit the form (Redirects user to NIC Asia)
                document.body.appendChild(form);
                form.submit();

            } catch (error) {
                console.error("Payment Error", error);
                setLoading(false);
                alert("Something went wrong while initiating payment.");
            }
        };

        if (orderId) {
            initiatePayment();
        }
    }, [orderId]);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="bg-white p-6 rounded-xl shadow-xl flex flex-col items-center gap-4 max-w-sm w-full mx-4">
                <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center">
                    <Loader2 className="w-8 h-8 text-red-600 animate-spin" />
                </div>
                <div className="text-center">
                    <h3 className="text-lg font-bold text-slate-800">Contacting Bank</h3>
                    <p className="text-sm text-slate-500 mt-1">Please wait while we redirect you to NIC Asia payment gateway...</p>
                </div>
            </div>
        </div>
    );
}