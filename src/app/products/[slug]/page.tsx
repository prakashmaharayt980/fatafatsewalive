import React from "react";
import RemoteServices from "@/app/api/remoteservice";
import { SlugProps } from "@/app/types/PropSlug";
import { ProductDetails } from "@/app/types/ProductDetailsTypes";
import ProductPageClient from "./ProductPageClient";
import { Metadata } from "next";

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

  const description = product.short_description || product.description?.replace(/<[^>]*>/g, '').substring(0, 160) || `Buy ${product.name} at the best price in Nepal from Fatafat Sewa.`;

  return {
    title: `${product.name} | Buy Online at Best Price in Nepal | Fatafat Sewa`,
    description,
    keywords: [product.name, product.brand?.name, product.categories?.[0]?.title, 'buy online Nepal', 'Fatafat Sewa'].filter(Boolean),
    alternates: {
      canonical: cleanCanonicalUrl,
    },
    openGraph: {
      images: [product.image?.full || ""],
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
    "image": [productDetails.image?.full],
    "description": productDetails.short_description || productDetails.description,
    "sku": productDetails.sku,
    "brand": {
      "@type": "Brand",
      "name": productDetails.brand?.name || "Generic"
    },
    "offers": {
      "@type": "Offer",
      "url": `https://fatafatsewa.com/products/${productDetails.slug}`,
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