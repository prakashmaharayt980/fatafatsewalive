import React, { cache } from "react";

import type { SlugProps } from "@/app/types/PropSlug";
import type { Metadata } from "next";
import { getProductBySlug } from "@/app/api/services/product.service";
import ProductPageClient from "./ProductPageClient";

const getProduct = cache((slug: string) => getProductBySlug(slug));

export async function generateMetadata({ params }: SlugProps): Promise<Metadata> {
  const resolvedParams = await params;
  const slug = resolvedParams.slug;
  const product = await getProduct(slug);

  if (!product) {
    return { title: "Product Not Found | Fatafat Sewa" };
  }

  const canonicalUrl = `https://fatafatsewa.com/product-details/${product.slug}`;
  const description = (product.description?.short_description
    ?? `Buy ${product.name} at the best price in Nepal from Fatafat Sewa.`).slice(0, 160);
  const images = product.images?.map((img: { url: string }) => img.url).filter(Boolean) ?? [product.thumb?.url ?? ""];
  const suffix = " | Fatafat Sewa";
  const titleCore = `${product.name} | Best Price Nepal`;
  const title = titleCore.length + suffix.length <= 60
    ? titleCore + suffix
    : titleCore.slice(0, 60 - suffix.length) + suffix;

  return {
    title,
    description,
    keywords: [
      product.name,
      product.brand?.name,
      product.categories?.[0]?.title,
      "buy online Nepal",
      "best price Nepal",
      "Fatafat Sewa",
    ].filter((k): k is string => !!k),
    alternates: { canonical: canonicalUrl },
    openGraph: {
      type: "website",
      url: canonicalUrl,
      title: product.name,
      description,
      images,
    },
    twitter: {
      card: "summary_large_image",
      title: product.name,
      description,
      images,
    },
  };
}

export default async function ProductDetailsPage({ params }: SlugProps) {
  const resolvedParams = await params;
  const slug = resolvedParams.slug;
  const productDetails = await getProduct(slug);

  if (!productDetails) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f7f7f8]">
        <div className="text-center px-4">
          <h1 className="text-2xl font-bold text-slate-800 mb-2">Product Not Found</h1>
          <p className="text-slate-500 text-sm">The product you are looking for does not exist or has been removed.</p>
        </div>
      </div>
    );
  }

  const canonicalUrl = `https://fatafatsewa.com/product-details/${productDetails.slug}`;
  const currentPrice =
    typeof productDetails.price === "object"
      ? (productDetails.price as any).current
      : productDetails.discounted_price ?? productDetails.price;

  const jsonLd: Record<string, any> = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: productDetails.name,
    image: productDetails.images?.map((img: { url: string }) => img.url).filter(Boolean) ?? [productDetails.thumb?.url ?? ""],
    description: productDetails.description?.short_description ?? "",
    sku: productDetails.sku,
    brand: {
      "@type": "Brand",
      name: productDetails.brand?.name ?? "Generic",
    },
    offers: {
      "@type": "Offer",
      url: canonicalUrl,
      priceCurrency: "NPR",
      price: currentPrice ?? 0,

      itemCondition: "https://schema.org/NewCondition",
      availability:
        productDetails.quantity > 0
          ? "https://schema.org/InStock"
          : "https://schema.org/OutOfStock",
    },
  };

  if (productDetails.average_rating > 0) {
    jsonLd.aggregateRating = {
      "@type": "AggregateRating",
      ratingValue: productDetails.average_rating.toFixed(1),
      bestRating: "5",
      worstRating: "1",
      ratingCount: productDetails.rating_count ?? 1,
    };
  }

  const category = productDetails.categories?.[0];
  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: "https://fatafatsewa.com" },
      ...(category ? [{ "@type": "ListItem", position: 2, name: category.title, item: `https://fatafatsewa.com/category/${category.slug}` }] : []),
      { "@type": "ListItem", position: category ? 3 : 2, name: productDetails.name, item: canonicalUrl },
    ],
  };

  return (
    <>
      <h1 className="sr-only">{productDetails.name}</h1>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />
      <ProductPageClient productDetails={productDetails} />
    </>
  );
}
