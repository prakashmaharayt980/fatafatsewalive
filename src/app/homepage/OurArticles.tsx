'use client';

import React, { useMemo } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { BlogArticle, Article } from '@/app/types/Blogtypes';
import { trackArticleClick, trackCategoryClick } from '@/lib/analytics';
import BlogCard from '../blogs/components/BlogCard';

const OurArticles = ({ blogpage, initialData }: { blogpage: string, initialData?: any[] }) => {
  const router = useRouter();

  const visibleArticles = useMemo(() => initialData || [], [initialData]);

  if (!initialData) return <ArticleSkeleton blogpage={blogpage} />;

  const isSidebar = blogpage === 'sidebar';
  const isProductPage = blogpage === 'product-page';

  return (
    <div className={cn("mx-auto", isSidebar ? "py-0 px-0" : isProductPage ? "py-0" : "py-8 md:py-12 px-4")}>
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

      <div className={cn(
        "grid",
        isSidebar ? "grid-cols-1 gap-3" : "",
        isProductPage ? "grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4" : "",
        !isSidebar && !isProductPage ? "grid-cols-2 sm:grid-cols-2 lg:grid-cols-5 gap-6 md:gap-8" : ""
      )}>
        {visibleArticles.slice(0, isSidebar ? 4 : (isProductPage ? 4 : 10)).map((article) => (
          <div key={article.id} onClick={() => trackArticleClick(article.title, article.id.toString())}>
            <BlogCard post={article} />
          </div>
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

export default React.memo(OurArticles);
