'use client';

import LazySection from './LazySection';
import { getBlogList } from '@/app/api/services/blog.service';
import OurArticles from '@/app/homepage/OurArticles';

async function fetchBlogs() {
  const res = await getBlogList({ per_page: 5 });
  return Array.isArray(res) ? res : (res.data ?? []);
}

export default function OurArticlesSectionClient() {
  return (
    <LazySection
      className="min-h-[400px] sm:min-h-[600px]"
      minHeight="0"
      fetcher={fetchBlogs}
      render={(data) => <OurArticles blogpage="home" initialData={data} />}
    />
  );
}
