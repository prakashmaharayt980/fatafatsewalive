import { trackGA4Event } from './ga4';
import { trackMetaEvent } from './meta';

/**
 * Triggers when a user clicks on a banner or promotion.
 */
export const trackBannerClick = (promotionName: string, slot?: string, destination?: string) => {
    trackGA4Event('select_promotion', {
        promotion_name: promotionName,
        creative_slot: slot,
        destination_url: destination,
    });

    trackMetaEvent('ClickBanner', {
        promotion_name: promotionName,
        creative_slot: slot,
        destination: destination,
    });
};

/**
 * Triggers when a category block or "View All" is clicked.
 */
export const trackCategoryClick = (categoryName: string, action: 'view_all' | 'grid_click') => {
    trackGA4Event('select_item_list', {
        item_list_name: categoryName,
        event_action: action
    });

    trackMetaEvent('ViewCategory', {
        content_category: categoryName,
        action: action
    });
};

/**
 * Triggers when a specific product is clicked from a list (e.g. BasketCard).
 */
export const trackProductClick = (params: { id: string; name: string; listName?: string; price?: number; category?: string }) => {
    trackGA4Event('select_item', {
        item_id: params.id,
        item_name: params.name,
        item_list_name: params.listName,
        item_category: params.category,
        price: params.price,
        currency: 'NPR'
    });

    trackMetaEvent('ViewContent', {
        content_ids: [params.id],
        content_name: params.name,
        content_category: params.category,
        content_type: 'product',
        value: params.price,
        currency: 'NPR'
    });
};

/**
 * Triggers when a blog/article is clicked.
 */
export const trackArticleClick = (title: string, id?: string) => {
    trackGA4Event('select_content', {
        content_type: 'article',
        item_id: id || title,
        item_name: title
    });

    trackMetaEvent('ViewContent', {
        content_type: 'article',
        content_name: title,
        content_ids: id ? [id] : undefined
    });
};
