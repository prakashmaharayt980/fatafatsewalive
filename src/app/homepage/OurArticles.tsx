'use client';

import React, { useMemo } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import useSWR from 'swr';
import { useInView } from 'react-intersection-observer';
import { ChevronRight } from 'lucide-react';

import { cn } from '@/lib/utils';
import imglogo from '../assets/logoimg.png';
import { formatDate, stripHtml } from '../CommonVue/datetime';
import RemoteServices from '../api/remoteservice';
import { Article } from '@/app/types/Blogtypes';

const fetcher = async (): Promise<Article[]> => {
  const res = await RemoteServices.getBlogList();
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

  if (isLoading) return <ArticleSkeleton blogpage={blogpage} />;

  const isSidebar = blogpage === 'sidebar';
  const isProductPage = blogpage === 'product-page';

  return (
    <div className={cn("mx-auto", isSidebar ? "py-0 px-0" : isProductPage ? "py-0" : "py-8 md:py-12 px-4")} ref={ref}>
      {/* Header */}
      {!isSidebar && (
        <div className={cn(
          "flex items-center mb-6",
          isProductPage ? "justify-between" : "gap-2 md:gap-4 mb-8 md:mb-10"
        )}>
          {isProductPage ? (
            <>
              <div className="flex items-center gap-3">
                <div className="w-1 h-6 bg-[var(--colour-fsP2)] rounded-full" />
                <h2 className="text-lg font-bold text-slate-800">Latest Articles</h2>
              </div>
              <button
                onClick={() => router.push('/blog')}
                className="flex items-center gap-1 text-xs font-semibold text-[var(--colour-fsP2)] hover:underline"
              >
                View All <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </>
          ) : (
            <>
              <div className="h-[1px] md:h-[2px] flex-1 bg-gradient-to-r from-transparent to-blue-600" />
              <h2 className="text-xl md:text-3xl font-extrabold tracking-tight text-gray-900 uppercase whitespace-nowrap">
                Latest <span className="text-blue-600">Articles</span>
              </h2>
              <div className="h-[1px] md:h-[2px] flex-1 bg-gradient-to-l from-transparent to-blue-600" />
            </>
          )}
        </div>
      )}

      {/* Grid */}
      <div className={cn(
        "grid",
        isSidebar ? "grid-cols-1 gap-3" : "",
        isProductPage ? "grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4" : "",
        !isSidebar && !isProductPage ? "grid-cols-2 sm:grid-cols-2 lg:grid-cols-5 gap-6 md:gap-8" : ""
      )}>
        {visibleArticles.slice(0, isSidebar ? 4 : (isProductPage ? 4 : 10)).map((article) => (
          <article
            key={article.id}
            onClick={() => router.push(`/blogs/${article.slug}`)}
            className={cn(
              "group cursor-pointer flex flex-col bg-white overflow-hidden transition-all duration-300",
              isSidebar
                ? "rounded hover:bg-gray-50 border-0 border-b last:border-0 hover:border-transparent py-2"
                : isProductPage
                  ? "rounded-xl border border-gray-100 hover:shadow-lg hover:-translate-y-0.5"
                  : "rounded border border-gray-100 hover:shadow-2xl hover:-translate-y-1"
            )}
          >
            {isSidebar ? (
              <div className="flex gap-3 items-center">
                <div className="relative w-20 h-16 flex-shrink-0 rounded overflow-hidden bg-gray-100">
                  <Image
                    src={article.thumbnail_image?.thumb || article.thumbnail_image?.full || imglogo}
                    alt={article.title}
                    fill
                    className="object-cover"
                    sizes="80px"

                  />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-xs font-bold text-gray-800 line-clamp-2 mb-1 group-hover:text-[var(--colour-fsP2)] transition-colors">
                    {article.title}
                  </h3>
                  <p className="text-[10px] text-gray-400 font-medium">
                    {formatDate(article.publish_date)}
                  </p>
                </div>
              </div>
            ) : isProductPage ? (
              <>
                {/* Compact card for product page */}
                <div className="relative aspect-[16/10] overflow-hidden bg-gray-100">
                  <Image
                    src={article.thumbnail_image?.full || article.thumbnail_image?.thumb || imglogo}
                    alt={article.title}
                    fill
                    className="object-cover"
                    sizes="(max-width: 640px) 50vw, 25vw"

                  />
                  {article.category?.title && (
                    <div className="absolute top-2 left-2 bg-[var(--colour-fsP2)]/90 text-white text-[9px] font-bold px-2 py-0.5 rounded uppercase tracking-wide">
                      {article.category.title}
                    </div>
                  )}
                </div>
                <div className="p-3 flex flex-col flex-1">
                  <h3 className="text-xs sm:text-sm font-bold text-slate-800 line-clamp-2 leading-snug group-hover:text-[var(--colour-fsP2)] transition-colors">
                    {article.title}
                  </h3>
                  <p className="text-[11px] text-gray-400 mt-1.5 line-clamp-2 leading-relaxed hidden sm:block">
                    {article.short_desc || stripHtml(article.content)}
                  </p>
                  <div className="flex items-center justify-between mt-auto pt-2 text-[10px] text-gray-400 font-medium">
                    <span className="truncate max-w-[80px]">{article.author}</span>
                    <span>{formatDate(article.publish_date)}</span>
                  </div>
                </div>
              </>
            ) : (
              <>
                {/* Full card for homepage */}
                <div className="relative aspect-[16/10] overflow-hidden bg-gray-100">
                  <Image
                    src={article.thumbnail_image?.full}
                    alt={article.title}
                    fill
                    className="object-cover transition-transform duration-700 "
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 20vw"

                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity" />
                  <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm text-blue-900 text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wide shadow-sm">
                    {article.category?.title}
                  </div>
                </div>

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
              </>
            )}
          </article>
        ))}
      </div>
    </div>
  );
};

const ArticleSkeleton = ({ blogpage }: { blogpage: string }) => (
  <div className={cn("mx-auto", blogpage === 'product-page' ? "py-0" : "px-4 py-12 max-w-[1400px]")}>
    <div className={cn(
      "grid gap-4",
      blogpage === 'product-page' ? "grid-cols-2 lg:grid-cols-4" : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 md:gap-6"
    )}>
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className={cn(
          "animate-pulse bg-gray-100 rounded-xl",
          blogpage === 'product-page' ? "h-48 sm:h-56" : "h-64 md:h-80 md:rounded-2xl"
        )} />
      ))}
    </div>
  </div>
);

export default OurArticles;
