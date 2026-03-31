import { Suspense } from "react";
import { notFound } from "next/navigation";
import { cacheLife, cacheTag } from "next/cache";
import { PagesService } from "@/app/api/services/pages.service";
import ParsedContent from "@/app/product-details/ParsedContent";
import type { Metadata } from "next";
import type { SlugProps } from "@/app/types/PropSlug";

async function getPageData(slug: string) {
  'use cache';
  cacheLife('hours');
  cacheTag('pages', `page-${slug}`);
  return PagesService.GetPages(slug);
}

export async function generateMetadata({ params }: SlugProps): Promise<Metadata> {
  const { slug } = await params;
  const response = await getPageData(slug);
  const page = response?.data;

  if (!response?.success || !page) {
    return { title: "Page Not Found | Fatafat Sewa" };
  }

  const title = page.title ?? page.name ?? "Page";
  const description = page.description?.slice(0, 155) ?? "Read more on Fatafat Sewa.";

  return {
    title: `${title} | Fatafat Sewa`,
    description,
    openGraph: { title, description, type: "article" },
    twitter: { card: "summary", title, description },
  };
}

async function PageContent({ params }: SlugProps) {
  const { slug } = await params;

  const response = await getPageData(slug);
  const page = response?.data;

  if (!response?.success || !page) notFound();

  const title = page.title ?? page.name ?? "Page";
  const content = page.content ?? page.description ?? "";

  return (
    <article className="min-h-screen bg-gray-50 py-8 lg:py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="rounded bg-white p-6">
          <h1 className="mb-4 text-2xl font-bold text-[var(--colour-fsP2)] sm:text-3xl lg:text-4xl text-center">
            {title}
          </h1>
          <div className="mb-4 border-b-2 border-[var(--colour-fsP2)]" />
          <ParsedContent
            description={content}
            className="prose prose-lg max-w-none text-gray-600 prose-headings:text-gray-800 prose-a:text-blue-600 hover:prose-a:text-blue-500"
          />
        </div>
      </div>
    </article>
  );
}

export default function Page(props: SlugProps) {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-gray-50 animate-pulse text-gray-400">Loading...</div>}>
      <PageContent {...props} />
    </Suspense>
  );
}
