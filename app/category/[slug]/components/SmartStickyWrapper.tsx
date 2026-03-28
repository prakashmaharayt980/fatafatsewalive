'use client';

import React from 'react';
import type { SmartStickyWrapperProps } from './interfaces';

/**
 * A highly optimized sticky wrapper that uses CSS for stickiness and max-height.
 * This avoids expensive ResizeObserver and window state updates on every resize.
 */
export const SmartStickyWrapper = ({
    children,
    topOffset = 24,
    bottomOffset = 24
}: SmartStickyWrapperProps) => {
    return (
        <div 
            className="sticky transition-all duration-300 custom-scrollbar overflow-y-auto overflow-x-hidden"
            style={{ 
                top: topOffset,
                maxHeight: `calc(100vh - ${topOffset + bottomOffset}px)`,
                scrollbarWidth: 'thin'
            }}
        >
            <div className="h-full">
                {children}
            </div>
        </div>
    );
};

