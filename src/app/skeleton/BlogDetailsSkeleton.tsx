import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';

export default function BlogDetailsSkeleton() {
    return (
        <div className="min-h-screen bg-gray-50 font-sans">
            <div className="max-w-8xl mx-auto px-2 sm:px-4 lg:px-8">

                {/* Mobile TOC Skeleton */}
                <div className="lg:hidden mb-3">
                    <Skeleton className="h-11 w-full rounded-lg" />
                </div>

                {/* ══════════ 3-Column Layout ══════════ */}
                <div className="flex flex-col lg:flex-row gap-3 pb-16">

                    {/* ─── Left: TOC Skeleton ─── */}
                    <aside className="hidden lg:block w-44 shrink-0">
                        <div className="sticky top-10 pt-40 space-y-1">
                            <Skeleton className="h-2.5 w-16 mb-3" />
                            <div className="border-l border-gray-200 pl-2.5 space-y-2.5">
                                <Skeleton className="h-2 w-[90%]" />
                                <Skeleton className="h-2 w-[70%]" />
                                <Skeleton className="h-2 w-[85%]" />
                                <Skeleton className="h-2 w-[60%]" />
                                <Skeleton className="h-2 w-[78%]" />
                                <Skeleton className="h-2 w-[65%]" />
                            </div>
                        </div>
                    </aside>

                    {/* ─── Center: Breadcrumb + Header + Article ─── */}
                    <main className="flex-1 min-w-0">

                        {/* Breadcrumb */}
                        <div className="flex items-center gap-1.5 py-4 px-6">
                            <Skeleton className="h-4 w-12" />
                            <Skeleton className="h-3 w-3 rounded-full" />
                            <Skeleton className="h-4 w-10" />
                            <Skeleton className="h-3 w-3 rounded-full" />
                            <Skeleton className="h-4 w-20" />
                            <Skeleton className="h-3 w-3 rounded-full" />
                            <Skeleton className="h-4 w-36 sm:w-48" />
                        </div>

                        {/* Header Card */}
                        <div className="rounded-xl bg-white p-4 sm:p-6 mb-3 text-center space-y-3">
                            {/* H1 Title */}
                            <Skeleton className="h-6 md:h-7 w-4/5 mx-auto" />
                            <Skeleton className="h-6 md:h-7 w-3/5 mx-auto" />

                            {/* Meta row: category badge + author + date + read time */}
                            <div className="flex flex-wrap items-center justify-center gap-2.5">
                                <Skeleton className="h-5 w-16 rounded-full" />
                                <div className="flex items-center gap-1.5">
                                    <Skeleton className="h-5 w-5 rounded-full" />
                                    <Skeleton className="h-3 w-20" />
                                </div>
                                <Skeleton className="h-3 w-px bg-gray-200" />
                                <Skeleton className="h-3 w-20" />
                                <Skeleton className="h-3 w-px bg-gray-200" />
                                <Skeleton className="h-3 w-16" />
                            </div>

                            {/* Hero Image */}
                            <Skeleton className="w-full aspect-[16/9] rounded-sm" />
                        </div>

                        {/* Article Prose */}
                        <div className="bg-white rounded-lg border border-gray-100 p-4 sm:p-6 md:p-8 space-y-4">
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-4 w-5/6" />
                            <Skeleton className="h-4 w-full" />

                            {/* H2 with border-l accent */}
                            <div className="flex items-center gap-2 mt-6 mb-2">
                                <Skeleton className="w-1 h-6 rounded-full" />
                                <Skeleton className="h-5 w-44" />
                            </div>

                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-4 w-11/12" />
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-4 w-3/4" />

                            {/* Inline image placeholder */}
                            <Skeleton className="w-full h-44 rounded-lg my-4" />

                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-4 w-4/5" />

                            {/* Another H2 */}
                            <div className="flex items-center gap-2 mt-6 mb-2">
                                <Skeleton className="w-1 h-6 rounded-full" />
                                <Skeleton className="h-5 w-52" />
                            </div>

                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-4 w-2/3" />
                        </div>
                    </main>

                    {/* ─── Right: Product Deals Skeleton ─── */}
                    <aside className="w-full lg:w-72 shrink-0 sm:pt-10">
                        <div className="sticky top-24 space-y-3">
                            {/* Header */}
                            <div className="flex items-center gap-2">
                                <Skeleton className="w-7 h-7 rounded-lg" />
                                <Skeleton className="h-4 w-24" />
                            </div>

                            {/* Product deal cards */}
                            {[...Array(5)].map((_, i) => (
                                <div key={i} className="flex gap-3 p-2.5 rounded-lg bg-white border border-gray-100">
                                    <Skeleton className="w-[72px] h-[72px] rounded-md flex-shrink-0" />
                                    <div className="flex-1 space-y-2 py-1">
                                        <Skeleton className="h-3 w-full" />
                                        <Skeleton className="h-3 w-2/3" />
                                        <Skeleton className="h-4 w-20" />
                                    </div>
                                </div>
                            ))}

                            <Skeleton className="h-9 w-full rounded-lg" />
                        </div>
                    </aside>
                </div>
            </div>

            {/* ══════════ Full-Width Sections ══════════ */}
            <div className="max-w-8xl mx-auto px-2 sm:px-4 lg:px-8 space-y-6 pb-16">
                {/* More from Author */}
                <div>
                    <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2.5">
                            <Skeleton className="w-1 h-6 rounded-full" />
                            <Skeleton className="h-5 w-44" />
                        </div>
                        <Skeleton className="h-3 w-16" />
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                        {[...Array(6)].map((_, i) => (
                            <div key={i} className="bg-white rounded-lg border border-gray-100 overflow-hidden">
                                <Skeleton className="w-full aspect-[4/3]" />
                                <div className="p-2 space-y-1.5">
                                    <Skeleton className="h-3 w-full" />
                                    <Skeleton className="h-3 w-2/3" />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Product Basket */}
                <div>
                    <div className="w-full mb-2">
                        <Skeleton className="w-full h-[300px] rounded-xl" />
                    </div>
                </div>
            </div>
        </div>
    );
}
