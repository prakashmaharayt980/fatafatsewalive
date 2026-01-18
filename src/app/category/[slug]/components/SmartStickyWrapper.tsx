
import React, { useEffect, useRef, useState, useCallback } from 'react';

/**
 * SmartStickyWrapper
 * 
 * Uses ResizeObserver to monitor content height and window resize to intelligently
 * manage sticky positioning. 
 * - If content fits in viewport: Sticks to top.
 * - If content taller than viewport: Sticks to natural flow until bottom is visible, then sticks to bottom.
 * - Handles dynamic content updates (e.g. accordion expansion).
 */
export const SmartStickyWrapper = ({
    children,
    topOffset = 24,
    bottomOffset = 24
}: {
    children: React.ReactNode;
    topOffset?: number;
    bottomOffset?: number;
}) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [style, setStyle] = useState<React.CSSProperties>({});

    // State to track dimensions
    const [viewportHeight, setViewportHeight] = useState(0);
    const [contentHeight, setContentHeight] = useState(0);

    const updateStickyState = useCallback(() => {
        if (!containerRef.current) return;

        const isTaller = contentHeight > (viewportHeight - topOffset - bottomOffset);

        if (isTaller) {
            // Content is taller than viewport
            // We want to stick to the BOTTOM of the viewport
            // CSS Sticky allows top or bottom. 
            // If we set `top: auto` and `bottom: bottomOffset`, it sticks to bottom.
            // But we need to ensure it doesn't jump.

            // Actually, simpler logic:
            // Just set max-height to viewport and overflow-y-auto?
            // "handle its updated" implies the user wants it to just WORK without internal scrollbar if possible (scrolling with page).
            // But standard UX for tall sidebar is internal scrollbar OR bottom-sticky.

            // Let's go with Internal Scrollbar if taller, to match "managed" UI.
            // It ensures you can always reach everything easily.

            setStyle({
                position: 'sticky',
                top: topOffset,
                maxHeight: `calc(100vh - ${topOffset + bottomOffset}px)`,
                overflowY: 'auto',
                scrollbarWidth: 'thin' // Firefox
            });
        } else {
            // Content fits
            setStyle({
                position: 'sticky',
                top: topOffset,
                maxHeight: 'none',
                overflowY: 'visible'
            });
        }
    }, [contentHeight, viewportHeight, topOffset, bottomOffset]);

    useEffect(() => {
        // Initial set
        setViewportHeight(window.innerHeight);

        const handleResize = () => setViewportHeight(window.innerHeight);
        window.addEventListener('resize', handleResize);

        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
        if (!containerRef.current) return;

        const resizeObserver = new ResizeObserver((entries) => {
            for (const entry of entries) {
                // Update content height when filters expand/collapse
                setContentHeight(entry.contentRect.height);
            }
        });

        // We observe the child div, not the sticky container itself (which might be constrained)
        // Check if children is a single element or wrap it?
        // We'll calculate based on scrollHeight of the ref, but ResizeObserver is better.
        // Let's create a wrapper div for content.
        const contentDiv = containerRef.current.firstElementChild;
        if (contentDiv) {
            resizeObserver.observe(contentDiv);
        }

        return () => resizeObserver.disconnect();
    }, [children]); // Re-run if children change? 

    // Also run update when dependencies change
    useEffect(() => {
        updateStickyState();
    }, [updateStickyState]);

    return (
        <div
            ref={containerRef}
            style={style}
            className="transition-all duration-300 custom-scrollbar"
        >
            <div className="h-full">
                {children}
            </div>
        </div>
    );
};
