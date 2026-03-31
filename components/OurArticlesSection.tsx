import { getBlogList } from '@/app/api/services/blog.service';
import OurArticles from '@/app/homepage/OurArticles';
import { getRandomBasketProducts } from '@/app/api/utils/productFetchers';
import { YOUTUBE_VIDEOS } from '@/app/blogs/components/youtubeData';

export default async function OurArticlesSection() {
  const [blogRes, dealsRes] = await Promise.all([
    getBlogList({ per_page: 6 }),
    getRandomBasketProducts('mobile-price-in-nepal', 6)
  ]);

  const blogs = Array.isArray(blogRes) ? blogRes : (blogRes.data ?? []);
  const dealsInner = dealsRes?.data ?? dealsRes;
  const products = Array.isArray(dealsInner) ? dealsInner : (dealsInner?.products ?? []);
  
  // Latest video from our local YouTube data
  const latestVideo = YOUTUBE_VIDEOS[0];

  return (
    <div className="w-full">
      <OurArticles 
        blogpage="home" 
        initialData={blogs} 
        videoDeal={latestVideo}
        productDeals={products}
      />
    </div>
  );
}
