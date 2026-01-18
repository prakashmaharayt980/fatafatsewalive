export interface BannerImage {
    id: number
    link: string
    content: string
    image: {
        full: string
        thumb: string
        banner: string
    }
    order: number
}

export interface BannerItem {
    id: number
    slug: string
    images: BannerImage[]
    name: string
}

export interface BannerMeta {
    current_page: number
    last_page: number
    per_page: number
    total: number
}

export interface BannerTypes {
    data: BannerItem[]
    meta: BannerMeta
}
