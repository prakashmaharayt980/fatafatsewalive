// RelatedNews.tsx
"use client";

import React, { useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronRight, Newspaper, Clock } from "lucide-react";
import useSWR from "swr";
import RemoteServices from "@/app/api/remoteservice";
import { formatDate, stripHtml } from "@/app/CommonVue/datetime";
import { Article } from "@/app/types/Blogtypes";
import imglogo from "@/app/assets/logoimg.png";

interface RelatedNewsProps {
    productName?: string;
}

const fetcher = async (): Promise<Article[]> => {
    const res = await RemoteServices.getBlogList();
    return res.data;
};

const RelatedNews: React.FC<RelatedNewsProps> = ({
    productName,
}) => {
    const { data: articles, isLoading } = useSWR<Article[]>(
        'blog-list',
        fetcher,
        { dedupingInterval: 60000 }
    );

    const relatedNews = useMemo(() => {
        if (!articles) return [];
        return articles.slice(0, 4);
    }, [articles]);

    if (isLoading) {
        return (
            <div className="w-full bg-white rounded-2xl border border-gray-100 shadow-sm p-4 space-y-3">
                <div className="h-5 w-32 bg-gray-100 rounded animate-pulse" />
                {[1, 2, 3].map((i) => (
                    <div key={i} className="flex gap-3 animate-pulse">
                        <div className="w-20 h-16 bg-gray-100 rounded-xl flex-shrink-0" />
                        <div className="flex-1 space-y-2 py-1">
                            <div className="h-3.5 w-full bg-gray-100 rounded" />
                            <div className="h-3.5 w-2/3 bg-gray-100 rounded" />
                            <div className="h-3 w-20 bg-gray-100 rounded" />
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    if (relatedNews.length === 0) return null;

    // First article gets featured treatment
    const featured = relatedNews[0];
    const rest = relatedNews.slice(1);

    return (
        <div className="w-full bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-4 pt-4 pb-2">
                <div className="flex items-center gap-2">
                    <Newspaper className="w-4 h-4 text-[var(--colour-fsP2)]" />
                    <h3 className="text-sm font-bold text-slate-900">Latest Articles</h3>
                </div>
                <Link href="/blog" className="text-[11px] font-semibold text-[var(--colour-fsP2)] hover:underline flex items-center">
                    View All <ChevronRight className="w-3 h-3 ml-0.5" />
                </Link>
            </div>

            {/* Featured article */}
            <Link href={`/blog/${featured.slug}`} className="block group px-4 pb-3">
                <div className="relative w-full aspect-[16/9] rounded-xl overflow-hidden bg-gray-100">
                    <Image
                        src={featured.thumbnail_image?.full || featured.thumbnail_image?.thumb || imglogo}
                        alt={featured.title}
                        fill
                        className="object-cover"
                        sizes="300px"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-3">
                        {featured.category?.title && (
                            <span className="text-[9px] font-bold text-white/90 uppercase tracking-wider bg-[var(--colour-fsP2)]/80 px-2 py-0.5 rounded">
                                {featured.category.title}
                            </span>
                        )}
                        <h4 className="text-sm font-bold text-white line-clamp-2 leading-snug mt-1.5 group-hover:underline">
                            {featured.title}
                        </h4>
                    </div>
                </div>
            </Link>

            {/* Rest of articles — compact list */}
            <div className="px-4 pb-3 space-y-0.5">
                {rest.map((item) => (
                    <Link
                        key={item.id}
                        href={`/blog/${item.slug}`}
                        className="flex items-center gap-3 group rounded-lg px-2 py-2 -mx-2 hover:bg-gray-50 transition-colors"
                    >
                        <div className="relative w-16 h-14 rounded-lg overflow-hidden flex-shrink-0 bg-gray-50 border border-gray-100">
                            <Image
                                src={item.thumbnail_image?.thumb || item.thumbnail_image?.full || imglogo}
                                alt={item.title}
                                fill
                                className="object-cover"
                                sizes="64px"
                            />
                        </div>
                        <div className="flex-1 min-w-0">
                            <h4 className="text-xs font-semibold text-slate-700 line-clamp-2 group-hover:text-[var(--colour-fsP2)] transition-colors leading-snug">
                                {item.title}
                            </h4>
                            <div className="flex items-center gap-1 mt-1">
                                <Clock className="w-2.5 h-2.5 text-gray-300" />
                                <p className="text-[10px] text-slate-400">{formatDate(item.publish_date)}</p>
                            </div>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
};

export default RelatedNews;
