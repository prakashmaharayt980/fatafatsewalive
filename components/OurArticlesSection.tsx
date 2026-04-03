import { getBlogList } from '@/app/api/services/blog.service';
import OurArticles from '@/app/homepage/OurArticles';


export default async function OurArticlesSection() {
  const [blogRes] = await Promise.all([
    getBlogList({ per_page: 6 , sort:'asc'}),
 
  ]);

  const blogs = Array.isArray(blogRes) ? blogRes : (blogRes.data ?? []);


  return (
    <div className="w-full">
      <OurArticles 
        blogpage="home" 
        initialData={blogs} 
   
      />
    </div>
  );
}
