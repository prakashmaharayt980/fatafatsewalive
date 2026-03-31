'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { trackArticleClick } from '@/lib/analytics';
import BlogCard from '../blogs/components/BlogCard';
import YouTubeVideoCard from '../blogs/components/YouTubeVideoCard';
import ProductDeals from '../blogs/components/ProductDeals';
import type { YouTubeVideo } from '../blogs/components/YouTubeVideoCard';
import type { BasketProduct } from '../types/ProductDetailsTypes';

interface Props {
  blogpage: string;
  initialData?: any[];
  videoDeal?: YouTubeVideo;
  productDeals?: BasketProduct[];
}

const OurArticles = ({ blogpage, initialData, videoDeal, productDeals }: Props) => {
  const router = useRouter();
  const articles = initialData || [];
  
  const isSidebar = blogpage === 'sidebar';
  const isProductPage = blogpage === 'product-page';
  const isHome = blogpage === 'home';

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
                onClick={() => router.push('/blogs')}
                className="flex items-center gap-1 text-xs font-semibold text-[var(--colour-fsP2)] hover:underline"
              >
                View All <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </>
          ) : (
            <>
              <div className="h-[1px] md:h-[2px] flex-1 bg-gradient-to-r from-transparent to-blue-600" />
              <h2 className="text-xl md:text-3xl font-extrabold tracking-tight text-gray-900 uppercase whitespace-nowrap">
                Latest <span className="text-blue-600">Articles & Deals</span>
              </h2>
              <div className="h-[1px] md:h-[2px] flex-1 bg-gradient-to-l from-transparent to-blue-600" />
            </>
          )}
        </div>
      )}

      {/* Main Content Grid */}
      <div className={cn(
        "grid gap-6 md:gap-8",
        isHome ? "lg:grid-cols-4" : "grid-cols-1"
      )}>
        {/* Left/Main Column: Articles */}
        <div className={cn(
          "grid gap-6 md:gap-8",
          isHome ? "lg:col-span-3 grid-cols-2 sm:grid-cols-3" : 
          isProductPage ? "grid-cols-2 sm:grid-cols-4" : 
          isSidebar ? "grid-cols-1" : "grid-cols-2 sm:grid-cols-3 lg:grid-cols-5"
        )}>
          {articles.slice(0, isHome ? 6 : (isSidebar ? 4 : (isProductPage ? 4 : 10))).map((article) => (
            <div key={article.id} onClick={() => trackArticleClick(article.title, article.id.toString())}>
              <BlogCard post={article} />
            </div>
          ))}
        </div>

        {/* Right Column: Video & Deals (Only on Home) */}
        {isHome && (
          <div className="space-y-8">
            {videoDeal && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Video Deal</h3>
                </div>
                <YouTubeVideoCard video={videoDeal} />
              </div>
            )}
            
            {productDeals && productDeals.length > 0 && (
              <ProductDeals 
                title="Trending Deals" 
                products={productDeals as any} 
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default React.memo(OurArticles);
