import { MetaEventNames, MetaEventParams } from './types';

// Declare the fbq function on the window object
declare global {
    interface Window {
        fbq?: (...args: any[]) => void;
    }
}

// Events that Meta recognizes natively as Standard Events
const STANDARD_EVENTS: string[] = ['ViewContent', 'AddToCart', 'Search', 'Purchase', 'InitiateCheckout', 'Lead'];

export const trackMetaEvent = (eventName: MetaEventNames, params?: MetaEventParams) => {
    if (typeof window !== 'undefined' && typeof window.fbq === 'function') {
        if (STANDARD_EVENTS.includes(eventName)) {
            window.fbq('track', eventName, params);
        } else {
            // Treat as a custom event
            window.fbq('trackCustom', eventName, params);
        }
    } else {
        // Development fallback or logging can be added here
        console.debug(`[Meta Development] Event: ${eventName}`, params);
    }
};
