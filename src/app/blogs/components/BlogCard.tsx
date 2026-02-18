'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Article } from '../../types/Blogtypes';
import { formatDate, stripHtml } from '../../CommonVue/datetime';
import imglogo from '../../assets/logoimg.png';

interface BlogCardProps {
    post: Article;
}

export default function BlogCard({ post }: BlogCardProps) {
    return (
        <Link
            href={`/blogs/${post.slug}`}
            className="group bg-white rounded-xl border border-gray-100 overflow-hidden hover:shadow-xl hover:shadow-[var(--colour-fsP2)]/15 transition-all duration-500 flex flex-col h-full hover:border-[var(--colour-fsP2)]/30 hover:-translate-y-1"
        >
            {/* Image Container */}
            <div className="relative w-full bg-gradient-to-br from-gray-50 to-gray-100 overflow-hidden">
                <Image
                    src={post.thumbnail_image?.full || imglogo.src}
                    alt={post.title}
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                    width={500}
                    height={500}
                    className="object-fill aspect-[3/2] transition-transform duration-700 group-hover:scale-105"
                />

                {/* Category Badge */}
                <div className="absolute top-2.5 left-2.5 bg-[var(--colour-fsP2)] backdrop-blur-md px-2.5 py-1 rounded-full text-[10px] font-bold text-white uppercase tracking-wider shadow-md">
                    {post.category?.title}
                </div>
            </div>

            {/* Content Area */}
            <div className="p-3 flex flex-col flex-1">
                <h3 className="text-sm font-bold text-gray-800 line-clamp-2 mb-1.5 group-hover:text-[var(--colour-fsP2)] transition-colors leading-snug">
                    {(post.title).length > 50 ? (post.title).slice(0, 50) + '...' : post.title}
                </h3>

                {/* Excerpt */}
                <p className="text-gray-500 text-xs line-clamp-3 mb-2 flex-1 leading-relaxed">
                    {post.short_desc || stripHtml(post.content)}
                </p>

                {/* Read More indicator */}
                <span className="text-[var(--colour-fsP2)] text-xs font-bold opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    Read More →
                </span>
            </div>
        </Link>
    );
}
