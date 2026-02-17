// utils/analytics.ts
import { sendGAEvent } from '@next/third-parties/google'


const getPixel = async () => (await import('react-facebook-pixel')).default


export const trackSearch = async (searchTerm: string) => {

    sendGAEvent('event', 'search', {
        search_term: searchTerm
    })


    const ReactPixel = await getPixel()
    ReactPixel.track('Search', {
        search_string: searchTerm
    })
}


export const trackViewContent = async (product: any) => {

    sendGAEvent('event', 'view_item', {
        currency: 'NPR',
        value: product.discounted_price || product.price,
        items: [{ item_id: product.id, item_name: product.name }]
    })


    const ReactPixel = await getPixel()
    ReactPixel.track('ViewContent', {
        content_ids: [product.id],
        content_type: 'product',
        value: product.discounted_price || product.price,
        currency: 'NPR',
        content_name: product.name
    })
}

export const trackAddToCart = async (product: any, quantity: number = 1) => {
    sendGAEvent('event', 'add_to_cart', {
        currency: 'NPR',
        value: (product.discounted_price || product.price) * quantity,
        items: [{
            item_id: product.id,
            item_name: product.name,
            quantity: quantity
        }]
    })

    const ReactPixel = await getPixel()
    ReactPixel.track('AddToCart', {
        content_ids: [product.id],
        content_type: 'product',
        value: (product.discounted_price || product.price) * quantity,
        currency: 'NPR',
        content_name: product.name,
        num_items: quantity
    })
}

export const trackInitiateCheckout = async (cart: any) => {
    const items = cart?.items || []
    sendGAEvent('event', 'begin_checkout', {
        currency: 'NPR',
        value: cart.cart_total,
        items: items.map((item: any) => ({
            item_id: item.product?.id,
            item_name: item.product?.name,
            quantity: item.quantity
        }))
    })

    const ReactPixel = await getPixel()
    ReactPixel.track('InitiateCheckout', {
        content_ids: items.map((item: any) => item.product?.id),
        content_type: 'product',
        value: cart.cart_total,
        currency: 'NPR',
        num_items: items.length
    })
}

export const trackPurchase = async (order: any) => {
    sendGAEvent('event', 'purchase', {
        transaction_id: order.orderNumber || order.id,
        currency: 'NPR',
        value: order.total,
        items: order.items.map((item: any) => ({
            item_id: item.id,
            item_name: item.name,
            quantity: item.qty || 1
        }))
    })

    const ReactPixel = await getPixel()
    ReactPixel.track('Purchase', {
        content_ids: order.items.map((item: any) => item.id),
        content_type: 'product',
        value: order.total,
        currency: 'NPR',
        num_items: order.items.length
    })
    const ReactPixelPurchase = await getPixel()
    ReactPixelPurchase.track('Purchase', {
        content_ids: order.items.map((item: any) => item.id),
        content_type: 'product',
        value: order.total,
        currency: 'NPR',
        num_items: order.items.length
    })
}

// ─── User Activity Tracking ───

export const trackScroll = async (depth: number, path: string) => {
    // GA4 Event
    sendGAEvent('event', 'scroll', {
        percent_scrolled: depth,
        page_path: path
    })

    // Meta Pixel Custom Event
    const ReactPixel = await getPixel()
    ReactPixel.trackCustom('ScrollDepth', {
        depth: `${depth}%`,
        path: path
    })
}

export const trackClick = async (elementId: string, text: string, path: string) => {
    sendGAEvent('event', 'click', {
        element_id: elementId,
        element_text: text,
        page_path: path
    })

    const ReactPixel = await getPixel()
    ReactPixel.trackCustom('ElementClick', {
        element_id: elementId,
        element_text: text,
        path: path
    })
}

export const trackHover = async (elementId: string, duration: number, path: string) => {
    // Only track meaningful hovers (> 2 seconds maybe, or as passed)
    if (duration < 1000) return;

    sendGAEvent('event', 'hover', {
        element_id: elementId,
        duration_ms: duration,
        page_path: path
    })

    const ReactPixel = await getPixel()
    ReactPixel.trackCustom('ElementHover', {
        element_id: elementId,
        duration: duration,
        path: path
    })
}

export const trackPageView = async (path: string) => {
    sendGAEvent('event', 'page_view', {
        page_path: path
    })

    const ReactPixel = await getPixel()
    ReactPixel.pageView()
}