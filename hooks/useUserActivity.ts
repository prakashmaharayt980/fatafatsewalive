import { useEffect, useRef, useCallback } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { trackScroll, trackClick, trackHover, trackPageView } from '@/lib/Analytic';

export const useUserActivity = () => {
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const scrollTriggered = useRef<boolean>(false);
    const hoverTimer = useRef<NodeJS.Timeout | null>(null);

    // 1. Track Page View on Route Change
    useEffect(() => {
        const url = `${pathname}?${searchParams.toString()}`;
        trackPageView(url);

        // Reset scroll trigger on page change
        scrollTriggered.current = false;
    }, [pathname, searchParams]);

    // 2. Track Scroll Depth (Only at 90%)
    useEffect(() => {
        const handleScroll = () => {
            if (scrollTriggered.current) return;

            const scrollTop = window.scrollY;
            const docHeight = document.documentElement.scrollHeight;
            const winHeight = window.innerHeight;
            const scrollPercent = (scrollTop + winHeight) / docHeight;

            if (scrollPercent >= 0.9) {
                trackScroll(90, pathname);
                scrollTriggered.current = true;
            }
        };

        // Throttle scroll event
        let timeoutId: NodeJS.Timeout;
        const throttledScroll = () => {
            if (timeoutId) return;
            timeoutId = setTimeout(() => {
                handleScroll();
                clearTimeout(timeoutId);
                // @ts-ignore
                timeoutId = null;
            }, 500); // Check every 500ms
        };

        window.addEventListener('scroll', throttledScroll);
        return () => window.removeEventListener('scroll', throttledScroll);
    }, [pathname]);

    // 3. Track Clicks (Buttons, Links, [data-track])
    useEffect(() => {
        const handleClick = (e: MouseEvent) => {
            const target = e.target as HTMLElement;
            const trackableElement = target.closest('button, a, [data-track]');

            if (trackableElement) {
                const id = trackableElement.id || trackableElement.getAttribute('data-track') || 'unknown';
                const text = (trackableElement as HTMLElement).innerText || (trackableElement as HTMLInputElement).value || 'no-text';

                // Avoid tracking excessively long text
                const truncatedText = text.substring(0, 50);

                trackClick(id, truncatedText, pathname);
            }
        };

        window.addEventListener('click', handleClick);
        return () => window.removeEventListener('click', handleClick);
    }, [pathname]);

    // 4. Track Hover ([data-track-hover])
    useEffect(() => {
        const handleMouseOver = (e: MouseEvent) => {
            const target = e.target as HTMLElement;
            const hoverElement = target.closest('[data-track-hover]');

            if (hoverElement) {
                const startTime = Date.now();
                const id = hoverElement.id || hoverElement.getAttribute('data-track-hover') || 'unknown';

                const handleMouseOut = () => {
                    const duration = Date.now() - startTime;
                    if (duration > 1000) { // Only track if hovered > 1s
                        trackHover(id, duration, pathname);
                    }
                    hoverElement.removeEventListener('mouseout', handleMouseOut);
                };

                hoverElement.addEventListener('mouseout', handleMouseOut);
            }
        };

        window.addEventListener('mouseover', handleMouseOver);
        return () => window.removeEventListener('mouseover', handleMouseOver);
    }, [pathname]);
};
