'use client';

import React, { useMemo } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import useSWR from 'swr';
import { useInView } from 'react-intersection-observer';

import { cn } from '@/lib/utils';
import imglogo from '../assets/logoimg.png';
import { formatDate, stripHtml } from '../CommonVue/datetime';
import RemoteServices from '../api/remoteservice';
import { Article } from '@/app/types/Blogtypes';

const fetcher = async (): Promise<Article[]> => {
  const res = await RemoteServices.Bloglist();
  return res.data;
};

const OurArticles = ({ blogpage }: { blogpage: string }) => {
  const router = useRouter();
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.1 });

  const { data: articles, isLoading } = useSWR<Article[]>(
    inView && blogpage ? 'blog-list' : null,
    fetcher,
    { dedupingInterval: 60000 }
  );

  const visibleArticles = useMemo(() => articles || [], [articles]);

  if (isLoading) return <ArticleSkeleton />;

  return (
    <div className="mx-auto py-8 md:py-12 max-w-[1400px] px-4" ref={ref}>
      {/* Responsive Header */}
      <div className="flex items-center gap-2 md:gap-4 mb-8 md:mb-10">
        <div className="h-[1px] md:h-[2px] flex-1 bg-gradient-to-r from-transparent to-blue-600" />
        <h2 className="text-xl md:text-3xl font-extrabold tracking-tight text-gray-900 uppercase whitespace-nowrap">
          Latest <span className="text-blue-600">Articles</span>
        </h2>
        <div className="h-[1px] md:h-[2px] flex-1 bg-gradient-to-l from-transparent to-blue-600" />
      </div>

      {/* Responsive Grid: 1 col mobile, 2 col tablet, 4 col desktop for product page context */}
      <div className={cn(
        "grid gap-6 md:gap-8",
        blogpage === 'product-page' ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4" : "grid-cols-2 sm:grid-cols-2 lg:grid-cols-5"
      )}>
        {visibleArticles.slice(0, blogpage === 'product-page' ? 4 : 10).map((article) => (
          <article
            key={article.id}
            onClick={() => router.push(`/blog/${article.slug}`)}
            className="group cursor-pointer flex flex-col bg-white rounded-2xl overflow-hidden hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 border border-gray-100"
          >
            {/* Aspect ratio stays consistent for mobile and desktop */}
            <div className="relative aspect-[16/10] overflow-hidden bg-gray-100">
              <Image
                src={article.thumbnail_image?.full || imglogo}
                alt={article.title}
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-110"
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 20vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity" />
              <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm text-blue-900 text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wide shadow-sm">
                {article.category?.title}
              </div>
            </div>

            {/* Content Body with adaptive padding */}
            <div className="p-5 flex flex-col flex-1 relative">
              <h3 className="text-lg font-bold text-gray-900 mb-3 line-clamp-2 leading-tight group-hover:text-blue-700 transition-colors">
                {article.title}
              </h3>

              <p className="text-gray-500 text-sm line-clamp-2 mb-4 flex-1 leading-relaxed">
                {article.short_desc || stripHtml(article.content)}
              </p>

              <div className="pt-4 border-t border-gray-50 flex items-center justify-between text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                <span className="truncate max-w-[120px] flex items-center gap-1">
                  <span className="w-1 h-4 bg-gray-200 rounded-full"></span>
                  {article.author}
                </span>
                <span className="whitespace-nowrap">{formatDate(article.publish_date)}</span>
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
};

const ArticleSkeleton = () => (
  <div className="mx-auto px-4 py-12 max-w-[1400px]">
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 md:gap-6">
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="animate-pulse bg-gray-100 rounded-xl md:rounded-2xl h-64 md:h-80" />
      ))}
    </div>
  </div>
);

export default OurArticles;