import React from 'react';
import { Metadata } from 'next';
import ApplyEmiClient from './ApplyEmiClient';
import RemoteServices from '@/app/api/remoteservice';
import { ProductDetails } from '@/app/types/ProductDetailsTypes';

// Define SearchParams type (async in Next 15)
type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;

// Fetch product by slug helper
async function getProductBySlug(slug: string): Promise<ProductDetails | null> {
  if (!slug) return null;
  try {
    const product = await RemoteServices.getProductBySlug(slug);
    return product || null;
  } catch (error) {
    console.error("Error fetching product for EMI:", error);
    return null;
  }
}

export async function generateMetadata({ searchParams }: { searchParams: SearchParams }): Promise<Metadata> {
  const resolvedSearchParams = await searchParams;
  const slug = resolvedSearchParams?.slug as string;
  const product = slug ? await getProductBySlug(slug) : null;

  return {
    title: product ? `Apply EMI for ${product.name} | Fatafat Sewa` : 'Apply for EMI | Fatafat Sewa',
    description: product ? `Easy EMI application for ${product.name}. Get approved quickly at Fatafat Sewa.` : 'Apply for EMI on your favorite gadgets.',
  };
}

export default async function ApplyEmiPage({ searchParams }: { searchParams: SearchParams }) {
  const resolvedSearchParams = await searchParams;
  const slug = resolvedSearchParams?.slug as string;

  const product = slug ? await getProductBySlug(slug) : null;

  return (
    <ApplyEmiClient initialProduct={product} />
  );
}