export interface BrandsResponse {
    data: Array<{
        id: number;
        name: string;
        slug: string;
        image: {
            full: string;
            thumb: string;
        }
    }>,
    meta: {
        current_page: number;
        per_page: number;
        total: number;
        last_page: number;
    }
}

