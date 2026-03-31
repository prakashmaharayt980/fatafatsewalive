export interface BannerImage {
  url: string;
  alt?: string;
}

export interface BannerData {
  images?: BannerImage[];
  link?: string;
}
