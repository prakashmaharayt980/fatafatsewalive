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
            className="group bg-white rounded border border-gray-100 overflow-hidden hover:shadow-2xl hover:shadow-[var(--colour-fsP2)]/15 transition-all duration-500 flex flex-col h-full hover:border-[var(--colour-fsP2)]/30 hover:-translate-y-2"
        >
            {/* Image Container - Square Aspect Ratio */}
            <div className="relative w-full bg-gradient-to-br from-gray-50 to-gray-100 overflow-hidden">
                <Image
                    src={post.thumbnail_image?.full || imglogo.src}
                    alt={post.title}
                    // fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                    width={500}
                    height={500}
                    className="object-fill aspect-[3/2] transition-transform duration-1000 "

                />

                {/* Category Badge */}
                <div className="absolute top-2 left-2 bg-white/90 backdrop-blur-md px-2 py-1 rounded-lg text-[10px] font-bold text-[var(--colour-fsP2)] uppercase tracking-wider border border-[var(--colour-fsP2)]/10 shadow-sm z-10">
                    {post.category?.title}
                </div>


            </div>

            {/* Content Area */}
            <div className="px-1 sm:px-2 flex flex-col flex-1">



                <h3 className="text-base font-bold text-gray-800 line-clamp-2 my-1 group-hover:text-[var(--colour-fsP2)] transition-colors">
                    {(post.title).length > 50 ? (post.title).slice(0, 50) + '...' : post.title}
                </h3>

                {/* Excerpt - Showing more content */}
                <p className="text-gray-500 text-sm line-clamp-4 mb-1 flex-1">
                    {post.short_desc || stripHtml(post.content)}
                </p>


            </div>
        </Link>
    );
}
