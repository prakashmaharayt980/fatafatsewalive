'use client';

import React, { useState, useEffect, useRef } from 'react';

interface LazyAboutSectionProps {
    children: React.ReactNode;
    threshold?: number;
    rootMargin?: string;
    minHeight?: string;
}

const LazyAboutSection = ({ 
    children, 
    threshold = 0.1, 
    rootMargin = '100px',
    minHeight = '100px'
}: LazyAboutSectionProps) => {
    const [isInView, setIsInView] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (isInView) return;

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsInView(true);
                    observer.disconnect();
                }
            },
            { threshold, rootMargin }
        );

        if (containerRef.current) {
            observer.observe(containerRef.current);
        }

        return () => observer.disconnect();
    }, [isInView, threshold, rootMargin]);

    return (
        <div ref={containerRef} style={{ minHeight: isInView ? 'auto' : minHeight }}>
            {isInView ? children : null}
        </div>
    );
};

export default LazyAboutSection;
