'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import type { Article, BlogArticle } from '../../types/Blogtypes';
import { formatDate, stripHtml } from '../../CommonVue/datetime';
import imglogo from '../../assets/logoimg.png';

interface BlogCardProps {
    post: Article | BlogArticle;
}

function getReadTime(content: string) {
    const words = stripHtml(content || '').split(/\s+/).filter(Boolean).length;
    return Math.max(1, Math.round(words / 200));
}

export default function BlogCard({ post }: BlogCardProps) {
    const categoryName = post.category
        ? ('title' in post.category ? post.category.title : post.category.name)
        : null;
    const imageUrl = post.thumb?.url ?? ('thumbnail_image' in post ? post.thumbnail_image?.full : undefined) ?? imglogo.src;
    const readTime = getReadTime(post.content ?? '');

    return (
        <Link
            href={`/blogs/${post.slug}`}
            className="group bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-lg hover:shadow-gray-200/60 transition-all duration-300 flex flex-col h-full hover:border-gray-200 hover:-translate-y-0.5"
        >
            {/* Image */}
            <div className="relative w-full overflow-hidden bg-gray-50">
                <Image
                    src={imageUrl}
                    alt={post.thumb?.alt_text ?? post.title}
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                    width={500}
                    height={500}
                    className="object-fill aspect-[3/2] transition-transform duration-500 group-hover:scale-[1.03]"
                />
                {categoryName && (
                    <div className="absolute top-2.5 left-2.5 bg-[var(--colour-fsP2)] px-2 py-0.5 rounded-full text-[10px] font-bold text-white uppercase tracking-wider shadow-sm">
                        {categoryName}
                    </div>
                )}
            </div>

            {/* Content */}
            <div className="p-3 flex flex-col flex-1 gap-1.5">
                <h3 className="text-[13px] sm:text-sm font-bold text-gray-800 line-clamp-2 group-hover:text-(--colour-fsP2) transition-colors leading-snug">
                    {post.title}
                </h3>

                <p className="text-gray-400 text-[11px] line-clamp-2 flex-1 leading-relaxed">
                    {post.short_desc || stripHtml(post.content ?? '')}
                </p>

                {/* Meta row */}
                <div className="flex items-center justify-between pt-1 border-t border-gray-50 mt-auto">
                    <span className="text-[10px] text-gray-400">
                        {post.publish_date ? formatDate(post.publish_date) : ''}
                    </span>
                    <span className="text-[10px] text-gray-400 font-medium">
                        {readTime} min read
                    </span>
                </div>
            </div>
        </Link>
    );
}
