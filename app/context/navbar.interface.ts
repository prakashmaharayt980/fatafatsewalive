export interface NavbarItem {
    id: number;
    title: string;
    slug: string;
    status: boolean;
    thumb: {
        url: string;
        alt_text: string | null;
    } | null;
    children: {
        id: number;
        title?: string;
        name?: string;
        slug: string;
    }[];
    price_range: {
        min: number | null;
        max: number | null;
    };
    brands: {
        name: string;
        slug: string;
        thumb: {
            url: string;
            alt_text: string | null;
        } | null;
    }[];
}
