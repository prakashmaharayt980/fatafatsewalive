import React from "react";
import RemoteServices from "@/app/api/remoteservice";
import { SlugProps } from "@/app/types/PropSlug";
import { ProductDetails } from "@/app/types/ProductDetailsTypes";
import ProductPageClient from "./ProductPageClient";
import { Metadata } from "next";

// Helper to parse slug and ID
const parseSlugAndId = (rawSlug: string, searchParamId?: string | null) => {
  if (rawSlug.includes('id=')) {
    // Handle cases like "some-slug&id=123" or "some-slug?id=123" if encoded
    // Simple split by pattern if known format is slug&id=...
    const parts = rawSlug.split(/&id=|%26id%3D/);
    if (parts.length > 1) {
      return { slug: decodeURIComponent(parts[0]), id: decodeURIComponent(parts[1]) };
    }
  }
  return { slug: decodeURIComponent(rawSlug), id: searchParamId || '' };
};

// Fetch product data on server
async function getProduct(slug: string): Promise<ProductDetails | null> {
  if (!slug) return null;
  try {
    const data = await RemoteServices.getProductBySlug(slug);
    return data;
  } catch (error) {
    console.error("Error fetching product:", error);
    return null;
  }
}

export async function generateMetadata({ params, searchParams }: SlugProps): Promise<Metadata> {
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams; // searchParams is a promise in Next.js 15, assume awaitable if older or standard

  const { slug } = parseSlugAndId(resolvedParams.slug, typeof resolvedSearchParams === 'object' ? (resolvedSearchParams as any).id : undefined);

  const product = await getProduct(slug);

  if (!product) {
    return {
      title: "Product Not Found | Fatafat Sewa",
    };
  }

  const cleanCanonicalUrl = `https://fatafatsewa.com/product/${product.slug}?id=${product.id}`;

  return {
    title: `${product.name} | Buy Online at Best Price in Nepal | Fatafat Sewa`,
    description: product.short_description || product.description?.substring(0, 160) || `Buy ${product.name} at Fatafat Sewa.`,
    alternates: {
      canonical: cleanCanonicalUrl,
    },
    openGraph: {
      images: [product.image?.full || ""],
      title: product.name,
      description: product.short_description || "",
      url: cleanCanonicalUrl,
    },
  };
}

export default async function ProductDetailsPage({ params, searchParams }: SlugProps) {
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams; // Await searchParams if it's a promise (standard in newer Next.js)

  const { id } = parseSlugAndId(resolvedParams.slug, typeof resolvedSearchParams === 'object' ? (resolvedSearchParams as any).id : undefined);

  const productDetails = await getProduct(id);

  if (!productDetails) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Product Not Found</h1>
          <p className="text-gray-600">The product you are looking for does not exist or has been removed.</p>
        </div>
      </div>
    );
  }

  // Generate Structured Data (JSON-LD)
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": productDetails.name,
    "image": [productDetails.image?.full],
    "description": productDetails.short_description || productDetails.description,
    "sku": productDetails.sku,
    "brand": {
      "@type": "Brand",
      "name": productDetails.brand?.name || "Generic"
    },
    "offers": {
      "@type": "Offer",
      "url": `https://fatafatsewa.com/product/${productDetails.slug}?id=${productDetails.id}`,
      "priceCurrency": "NPR",
      "price": productDetails.discounted_price || productDetails.price,
      "priceValidUntil": "2026-12-31", // Example validity
      "itemCondition": "https://schema.org/NewCondition",
      "availability": productDetails.quantity > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock"
    },
    "aggregateRating": productDetails.average_rating ? {
      "@type": "AggregateRating",
      "ratingValue": productDetails.average_rating,
      "reviewCount": productDetails.reviews?.meta?.total || 1
    } : undefined
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ProductPageClient productDetails={productDetails} />
    </>
  );
}