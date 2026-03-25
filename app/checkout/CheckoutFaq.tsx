'use client';

import React from 'react';

interface FaqItem {
    q: string;
    a: string;
}

interface CheckoutFaqProps {
    type?: 'standard' | 'preorder';
    className?: string;
}

const STANDARD_FAQS: FaqItem[] = [
    {
        q: 'When will my order be delivered?',
        a: 'Standard delivery takes 1-3 business days within Kathmandu Valley and 3-5 days for locations outside the valley.',
    },
    {
        q: 'What payment methods do you accept?',
        a: 'We accept Fonepay, Khalti, eSewa, Bank Transfer, and Cash on Delivery (on selected items and locations).',
    },
    {
        q: 'Is there a return policy?',
        a: 'Yes, we have a 7-day return policy for manufacturing defects. Please refer to our full Return Policy for detailed terms.',
    },
    {
        q: 'Can I track my order?',
        a: 'Absolutely! Once your order is dispatched, you can track its status from your account dashboard or via the link sent to your registered contact.',
    },
    {
        q: 'Is 0% EMI available for all products?',
        a: '0% EMI is available for selected products from partner banks. Look for the "EMI Available" tag on product pages.',
    },
    {
        q: 'How do I use a promo code?',
        a: 'You can enter your promo code in the "Apply Coupon" section in the order summary on the right side of this page.',
    },
];

const PREORDER_FAQS: FaqItem[] = [
    {
        q: 'What is a Pre-Order?',
        a: 'Pre-order allows you to reserve high-demand products before their official launch. It guarantees you a unit from the first available batch.',
    },
    {
        q: 'When will I receive my pre-ordered item?',
        a: 'Delivery dates depend on the official launch and stock arrival. We will notify you immediately once the product is ready for dispatch.',
    },
    {
        q: 'Is the pre-order deposit refundable?',
        a: 'The deposit secures your allocation and is generally non-refundable. However, if the product launch is cancelled, a full refund will be issued.',
    },
    {
        q: 'How do I pay the remaining balance?',
        a: 'Once the product is in stock and the final price is announced, we will notify you to complete the balance payment through your dashboard.',
    },
    {
        q: 'Can I cancel my pre-order?',
        a: 'Yes, you can cancel your pre-order before the shipping process begins. Please contact our support team for cancellation requests.',
    },
    {
        q: 'Will I be notified about price changes?',
        a: 'Yes, we will notify you immediately via email/phone if there is any update on the official pricing before the final payment.',
    },
];

export default function CheckoutFaq({ type = 'standard', className = '' }: CheckoutFaqProps) {
    const faqs = type === 'preorder' ? PREORDER_FAQS : STANDARD_FAQS;

    return (
        <div className={`mt-10 mb-16 w-full px-1 ${className}`}>
            <div className="text-left mb-8 px-4">
                <h2 className="text-xl md:text-2xl font-bold text-gray-900 border-l-4 border-[var(--colour-fsP2)] pl-4">
                    Frequently Asked Questions
                </h2>
                <p className="text-sm text-gray-500 mt-2 pl-5 italic font-medium">Everything you need to know about {type === 'preorder' ? 'pre-orders' : 'orders'} at Fatafat Sewa.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
                {faqs.map((item, i) => (
                    <div 
                        key={i} 
                        className="p-5 sm:p-6 bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:border-[var(--colour-fsP2)]/20 transition-all flex flex-col gap-3"
                    >
                        <h3 className="text-gray-900 font-bold text-base sm:text-[17px] leading-tight">
                            {item.q}
                        </h3>
                        <p className="text-gray-500 text-sm leading-relaxed">
                            {item.a}
                        </p>
                    </div>
                ))}
            </div>
        </div>
    );
}
