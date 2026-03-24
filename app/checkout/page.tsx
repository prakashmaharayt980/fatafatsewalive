import React from 'react';
import CheckoutClient from './CheckoutClient';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Checkout | Fatafat Sewa',
  description: 'Secure Checkout',
};

export default function Page() {
  return <CheckoutClient />;
}