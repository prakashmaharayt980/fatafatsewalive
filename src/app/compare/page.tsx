import React from 'react';
import type { Metadata } from 'next';
import CompareClient from './CompareClient';

export const metadata: Metadata = {
    title: 'Compare Products | Fatafat Sewa',
    description: 'Compare mobile phones, laptops, and gadgets side-by-side. Check prices, specs, and features to make the best buying decision.',
    openGraph: {
        title: 'Compare Products - Fatafat Sewa',
        description: 'Compare latest gadgets and find the best price in Nepal.',
        type: 'website',
    }
};

export default function ComparePageWrapper() {
    return <CompareClient />;
}
