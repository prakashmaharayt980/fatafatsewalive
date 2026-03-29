import React from "react";
import { notFound } from "next/navigation";
import { PagesService } from "@/app/api/services/pages.service";
import ParsedContent from "@/app/products/ParsedContent";
import type { Metadata } from "next";
import type { SlugProps } from "@/app/types/PropSlug";



// 2. SEO: Dynamic Metadata
// This function runs on the server to generate the <title> and <meta> tags 
// BEFORE the page loads. Crawlers love this.
export async function generateMetadata({ params }: SlugProps): Promise<Metadata> {
    const { slug } = await params;

    // Fetch just enough data for the tags
    const response = await PagesService.GetPages(slug);
    const pageData = response?.data;

    if (!response?.success || !pageData) {
        return {
            title: "Page Not Found",
        };
    }

    return {
        title: pageData.title || pageData.name || "Page",
        description: pageData.description?.slice(0, 160) || "Read more about this topic.",
        openGraph: {
            title: pageData.title || pageData.name,
            description: pageData.description?.slice(0, 160),
        },
    };
}

import { Suspense } from "react";

// 3. The Server Component (Async) Content
async function PageContent({ params }: SlugProps) {
    const { slug } = await params;

    // Fetch data directly on the server
    let response;
    try {
        response = await PagesService.GetPages(slug);
    } catch (error) {
        console.error("Error fetching page:", error);
        notFound();
    }

    const pageData = response?.data;

    // If API returns success:false or no data, show the 404 page
    if (!response?.success || !pageData) {
        notFound();
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8 lg:py-12">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="rounded bg-white p-6">
                    {/* Title */}
                    <h1 className="mb-4 text-2xl font-bold text-[var(--colour-fsP2)]     sm:text-3xl lg:text-4xl text-center">
                        {pageData.title || pageData.name || "Page"}
                    </h1>

                    <div className="mb-4 border-b-2 border-[var(--colour-fsP2)]" />

                    <ParsedContent
                        description={pageData.content || pageData.description || ""}
                        className="prose prose-lg max-w-none text-gray-600 prose-headings:text-gray-800 prose-a:text-blue-600 hover:prose-a:text-blue-500"
                    />
                </div>
            </div>
        </div>
    );
}

export default function Page(props: SlugProps) {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-gray-50 animate-pulse text-gray-400">Loading page...</div>}>
            <PageContent {...props} />
        </Suspense>
    );
}