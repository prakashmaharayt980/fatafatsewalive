import React from 'react';
import { Metadata } from 'next';
import ApplyEmiClient from './ApplyEmiClient';
import RemoteServices from '@/app/api/remoteservice';

// Define SearchParams type (async in Next 15)
type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;

// Fetch product helper
async function getProduct(id: string) {
  if (!id) return null;
  try {
    const data = await RemoteServices.ProductDetails_ID(id);
    return data;
  } catch (error) {
    console.error("Error fetching product for EMI:", error);
    return null;
  }
}

export async function generateMetadata({ searchParams }: { searchParams: SearchParams }): Promise<Metadata> {
  const resolvedSearchParams = await searchParams;
  const id = resolvedSearchParams?.id as string;
  const product = id ? await getProduct(id) : null;

  return {
    title: product ? `Apply EMI for ${product.name} | Fatafat Sewa` : 'Apply for EMI | Fatafat Sewa',
    description: product ? `Easy EMI application for ${product.name}. Get approved quickly at Fatafat Sewa.` : 'Apply for EMI on your favorite gadgets.',
  };
}

export default async function ApplyEmiPage({ searchParams }: { searchParams: SearchParams }) {
  const resolvedSearchParams = await searchParams;
  const id = resolvedSearchParams?.id as string;
  // We can also grab slug if needed, but ID is sufficient for fetching

  const product = id ? await getProduct(id) : null;

  return (
    <ApplyEmiClient initialProduct={product} />
  );
}