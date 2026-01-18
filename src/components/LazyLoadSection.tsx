'use client';

import React from 'react';
import { useInView } from 'react-intersection-observer';

import { cn } from '@/lib/utils';

interface LazyLoadSectionProps {
    children: React.ReactNode;
    fallback?: React.ReactNode;
    className?: string;
    delay?: number;
}

const LazyLoadSection: React.FC<LazyLoadSectionProps> = ({ children, fallback, className, delay = 0 }) => {
    const { ref, inView } = useInView({
        triggerOnce: true,
        rootMargin: '200px 0px', // Load 200px before it comes into view
    });

    const [shouldRender, setShouldRender] = React.useState(false);

    React.useEffect(() => {
        if (inView) {
            if (delay > 0) {
                const timer = setTimeout(() => {
                    setShouldRender(true);
                }, delay);
                return () => clearTimeout(timer);
            } else {
                setShouldRender(true);
            }
        }
    }, [inView, delay]);

    return (
        <div ref={ref} className={cn("min-h-[100px]", className)}>
            {shouldRender ? children : fallback}
        </div>
    );
};

export default LazyLoadSection;
