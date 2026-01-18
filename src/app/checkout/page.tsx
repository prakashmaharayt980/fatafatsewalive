import React from 'react';
import CheckoutClient from './CheckoutClient';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Checkout | Fatafat Sewa',
  description: 'Secure Checkout',
};

export default function Page() {
  return <CheckoutClient />;
}