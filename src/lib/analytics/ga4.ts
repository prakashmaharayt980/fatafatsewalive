import { GA4EventNames, GA4EventParams } from './types';

// Declare the gtag function on the window object
declare global {
    interface Window {
        gtag?: (...args: any[]) => void;
    }
}

export const trackGA4Event = (eventName: GA4EventNames, params?: GA4EventParams) => {
    if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
        window.gtag('event', eventName, params);
    } else {
        // Development fallback or logging can be added here
        console.debug(`[GA4 Development] Event: ${eventName}`, params);
    }
};
