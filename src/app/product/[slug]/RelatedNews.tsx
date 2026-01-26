// RelatedNews.tsx
"use client";

import React, { useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import useSWR from "swr";
import RemoteServices from "@/app/api/remoteservice";
import { formatDate } from "@/app/CommonVue/datetime";
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
        // Ideally filter by tag or category related to product if possible, 
        // for now taking latest 3 articles
        return articles.slice(0, 3);
    }, [articles]);

    if (isLoading) {
        return (
            <div className="w-full bg-white rounded-xl border border-gray-100 p-4 space-y-4">
                <div className="h-5 w-32 bg-gray-100 rounded animate-pulse" />
                {[1, 2, 3].map((i) => (
                    <div key={i} className="flex gap-3">
                        <div className="flex-1 space-y-2">
                            <div className="h-3 w-20 bg-gray-100 rounded animate-pulse" />
                            <div className="h-4 w-full bg-gray-100 rounded animate-pulse" />
                        </div>
                        <div className="w-16 h-12 bg-gray-100 rounded animate-pulse" />
                    </div>
                ))}
            </div>
        );
    }

    if (relatedNews.length === 0) return null;

    return (
        <div className="w-full bg-white rounded-xl border border-gray-100 p-4">
            <h3 className="text-base font-bold text-slate-900 mb-4">Related News</h3>

            <div className="space-y-3">
                {relatedNews.map((item) => (
                    <Link
                        key={item.id}
                        href={`/blog/${item.slug}`}
                        className="flex items-start gap-3 group"
                    >
                        <div className="flex-1 min-w-0">
                            <p className="text-[10px] text-slate-400 mb-0.5">{formatDate(item.publish_date)}</p>
                            <h4 className="text-xs font-semibold text-slate-700 line-clamp-2 group-hover:text-[var(--colour-fsP2)] transition-colors leading-snug">
                                {item.title}
                            </h4>
                        </div>
                        <div className="relative w-16 h-12 rounded-lg overflow-hidden flex-shrink-0 bg-gray-100">
                            <Image
                                src={item.thumbnail_image?.thumb || item.thumbnail_image?.full || imglogo}
                                alt={item.title}
                                fill
                                className="object-cover"
                            />
                        </div>
                    </Link>
                ))}
            </div>

            <Link
                href="/blog"
                className="inline-flex items-center gap-1 text-[11px] font-semibold text-[var(--colour-fsP2)] hover:underline mt-3"
            >
                View all news <ChevronRight className="w-3 h-3" />
            </Link>
        </div>
    );
};

export default RelatedNews;