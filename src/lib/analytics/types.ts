export type GA4EventNames =
    | 'select_promotion'
    | 'select_item_list'
    | 'select_item'
    | 'add_to_cart'
    | 'select_content'
    | 'view_item_list'
    | 'view_item';

export type MetaEventNames =
    | 'ViewContent'
    | 'AddToCart'
    | 'Search'
    | 'ClickBanner'
    | 'ViewCategory';

export interface GA4EventParams {
    promotion_name?: string;
    creative_slot?: string;
    creative_name?: string;
    item_list_name?: string;
    item_list_id?: string;
    item_category?: string;
    item_id?: string;
    item_name?: string;
    price?: number;
    currency?: string;
    content_type?: string;
    destination_url?: string;
    event_action?: string;
    [key: string]: any;
}

export interface MetaEventParams {
    content_type?: string;
    content_ids?: string[];
    content_name?: string;
    content_category?: string;
    value?: number;
    currency?: string;
    search_string?: string;
    promotion_name?: string;
    creative_slot?: string;
    destination?: string;
    action?: string;
    [key: string]: any;
}
