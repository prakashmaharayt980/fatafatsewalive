export interface Campaign {
    name: string;
    slug: string;
    start_date: string;
    end_date: string;
    status: string;
    thumb: {
        url: string | null;
        alt_text: string | null;
    };
    products_count: number;
}

export interface CampaignProduct {
    id: number;
    name: string;
    slug: string;
    highlights: string;
    thumb: {
        url: string | null;
        alt_text: string | null;
    };
    price: {
        current: number;
        discounted: number;
    };
    discount: {
        type: string;
        value: number;
        amount: number;
        campaign_slug: string;
    };
    quantity: number;
    brand: {
        name: string;
        slug: string;
        thumb: string | null;
    };
    categories: Array<{
        name: string;
        slug: string;
    }>;
    sku: string;
    emi_enabled: boolean;
    pre_order: {
        available: boolean;
        price: number | null;
    };
    short_desc: string;
}

export interface CampaignDetails extends Campaign {
    products: {
        data: CampaignProduct[];
        current_page: number;
        per_page: number;
        total: number;
    };
}

export interface CampaignsResponse {
    success: boolean;
    data: Campaign[];
}

export interface CampaignDetailsResponse {
    success: boolean;
    data: CampaignDetails;
}
