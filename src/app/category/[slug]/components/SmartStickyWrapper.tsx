'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { SmartStickyWrapperProps } from './interfaces';

export const SmartStickyWrapper = ({
    children,
    topOffset = 24,
    bottomOffset = 24
}: SmartStickyWrapperProps) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [style, setStyle] = useState<React.CSSProperties>({});
    const [viewportHeight, setViewportHeight] = useState(0);
    const [contentHeight, setContentHeight] = useState(0);

    const updateStickyState = useCallback(() => {
        if (!containerRef.current) return;

        const isTaller = contentHeight > (viewportHeight - topOffset - bottomOffset);

        if (isTaller) {
            setStyle({
                position: 'sticky',
                top: topOffset,
                maxHeight: `calc(100vh - ${topOffset + bottomOffset}px)`,
                overflowY: 'auto',
                overflowX: 'hidden',
                scrollbarWidth: 'thin'
            });
        } else {
            setStyle({
                position: 'sticky',
                top: topOffset,
                maxHeight: 'none',
                overflowY: 'visible'
            });
        }
    }, [contentHeight, viewportHeight, topOffset, bottomOffset]);

    useEffect(() => {
        setViewportHeight(window.innerHeight);
        const handleResize = () => setViewportHeight(window.innerHeight);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
        if (!containerRef.current) return;

        const resizeObserver = new ResizeObserver((entries) => {
            for (const entry of entries) {
                setContentHeight(entry.contentRect.height);
            }
        });

        const contentDiv = containerRef.current.firstElementChild;
        if (contentDiv) resizeObserver.observe(contentDiv);

        return () => resizeObserver.disconnect();
    }, [children]);

    useEffect(() => {
        updateStickyState();
    }, [updateStickyState]);

    return (
        <div ref={containerRef} style={style} className="transition-all duration-300 custom-scrollbar">
            <div className="h-full">
                {children}
            </div>
        </div>
    );
};
