import React, { cache } from "react";

import type { SlugProps } from "@/app/types/PropSlug";
import type { ProductData } from "@/app/types/ProductDetailsTypes";

import type { Metadata } from "next";
import { getProductBySlug } from "@/app/api/services/product.service";
import ProductPageClient from "./ProductPageClient";

// Force dynamic rendering — always fetch fresh product data
export const dynamic = "force-dynamic";


// Fetch product data on server — wrapped in cache() to deduplicate
// between generateMetadata() and the page component
const getProduct = cache(async (slug: string): Promise<ProductData | null> => {
  if (!slug) return null;
  try {
    const data = await getProductBySlug(slug);
    return data;
  } catch (error) {
    console.error("Error fetching product:", error);
    return null;
  }
});

export async function generateMetadata({ params }: SlugProps): Promise<Metadata> {
  const resolvedParams = await params;
  const slug = resolvedParams.slug;

  const product = await getProduct(slug);

  if (!product) {
    return {
      title: "Product Not Found | Fatafat Sewa",
    };
  }

  const cleanCanonicalUrl = `https://fatafatsewa.com/products/${product.slug}`;

  const description = product.description?.short_description || `Buy ${product.name} at the best price in Nepal from Fatafat Sewa.`;

  return {
    title: `${product.name} | Buy Online at Best Price in Nepal | Fatafat Sewa`,
    description,
    keywords: ([product.name, product.brand?.name, product.categories?.[0]?.title, 'buy online Nepal', 'Fatafat Sewa'].filter((k): k is string => !!k)),
    alternates: {
      canonical: cleanCanonicalUrl,
    },
    openGraph: {
      images: [product.thumb?.url || ""],
      title: product.name,
      description,
      url: cleanCanonicalUrl,
      type: 'website',
    },
  };
}

export default async function ProductDetailsPage({ params }: SlugProps) {
  const resolvedParams = await params;
  const slug = resolvedParams.slug;
  const productDetails = await getProduct(slug);

  if (!productDetails) {
    return (
      <div className="min-h-screen h-full flex items-center justify-center bg-gray-50">
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
    "image": [productDetails.thumb?.url || ""],
    "description": productDetails.description?.short_description || "",
    "sku": productDetails.sku,
    "brand": {
      "@type": "Brand",
      "name": productDetails.brand?.name || "Generic"
    },
    "offers": {
      "@type": "Offer",
      "url": `https://fatafatsewa.com/products/${productDetails.slug}`,
      "priceCurrency": "NPR",
      "price": productDetails.price || 0,
      "priceValidUntil": "2026-12-31", // Example validity
      "itemCondition": "https://schema.org/NewCondition",
      "availability": productDetails.quantity > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock"
    },
    // "aggregateRating": productDetails. ? {
    //   "@type": "AggregateRating",
    //   "ratingValue": productDetails.average_rating,
    //   "reviewCount": productDetails.reviews?.meta?.total || 1
    // } : undefined
  };

  return (
    <>
      <h1 className="sr-only">{productDetails.name}</h1>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ProductPageClient productDetails={productDetails} />
    </>
  );
}



export const revalidate = 0;