export interface Review {
    data: Array<{
        id: number;
        product_id: number;
        user_id: number;
        rating: number;
        review: string;
        status: number;
        user: {
            id: number;
            name: string;
            email: string;
            phone: string | null;
            status: number;
            avatar_image: {
                thumb: string;
                full: string;
            };
        };
        created_at: string;
    }>;
    meta: {
        current_page: number;
        per_page: number;
        total: number;
        last_page: number;
        average_rating: number;
    }
}

export interface ReviewCreateData {
    product_id: number;
    rating: number;
    review: string;
}
