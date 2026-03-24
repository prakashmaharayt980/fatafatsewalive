'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { trackArticleClick } from '@/lib/analytics';
import BlogCard from '../blogs/components/BlogCard';
import { getBlogList } from '@/app/api/services/blog.service';

const OurArticles = ({ blogpage, initialData }: { blogpage: string, initialData?: any[] }) => {
  const router = useRouter();
  const [articles, setArticles] = useState<any[]>(initialData || []);
  const [isLoading, setIsLoading] = useState(!initialData);
  const [hasFetched, setHasFetched] = useState(!!initialData);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (hasFetched || initialData) return;

    const observer = new IntersectionObserver(
      async (entries) => {
        if (entries[0].isIntersecting) {
          setIsLoading(true);
          try {
            const rawData = await getBlogList({ per_page: 5 });
            const fetchedArticles = Array.isArray(rawData) ? rawData : (rawData.data || []);
            setArticles(fetchedArticles);
            setHasFetched(true);
          } catch (error) {
            console.error('Failed to fetch articles on demand:', error);
          } finally {
            setIsLoading(false);
            observer.disconnect();
          }
        }
      },
      { threshold: 0.1, rootMargin: '100px' }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, [hasFetched, initialData]);

  if (isLoading && !hasFetched) return (
    <div ref={containerRef} className="min-h-[400px]" />
  );

  const isSidebar = blogpage === 'sidebar';
  const isProductPage = blogpage === 'product-page';

  return (
    <div ref={containerRef} className={cn("mx-auto", isSidebar ? "py-0 px-0" : isProductPage ? "py-0" : "py-8 md:py-12 px-4")}>
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
        {articles.slice(0, isSidebar ? 4 : (isProductPage ? 4 : 10)).map((article) => (
          <div key={article.id} onClick={() => trackArticleClick(article.title, article.id.toString())}>
            <BlogCard post={article} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default React.memo(OurArticles);
