export interface bloginfointerface {
  data: Array<{
    author: string;
    content: string;
    created_at: string;
    id: number;
    slug: string;
    title: string;
    updated_at: string;
    image?: string;
    category?: string;
    readTime?: string;
  }>;
  meta: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
}


interface NavbarData {
  data: Array<{
    tittle: string;
    SubMenu: Array<{
      tittle: string;
      link: string;
    }>;
    link?: string;

  }>
}





export interface Article {
  id: number;
  title: string;
  slug: string;
  short_desc: string;
  content: string;
  author: string;
  publish_date: string; // From your JSON
  published_at?: string; // Optional if fallback is needed
  category: {
    id: number;
    title: string;
    slug: string;
  };
  thumbnail_image: {
    full: string;
    thumb: string;
    preview: string;
  };
}

export interface ApiResponse {
  data: Article[];
}