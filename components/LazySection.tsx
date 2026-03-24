'use client';

import React, { useState, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';

interface LazySectionProps<T = any> {
  children?: React.ReactNode;
  /** Optional fetcher for data-driven lazy loading */
  fetcher?: () => Promise<T>;
  /** Optional render function for fetched data */
  render?: (data: T) => React.ReactNode;
  /** @deprecated Use render instead */
  component?: (data: T) => React.ReactNode;
  fallback?: React.ReactNode;
  className?: string;
  minHeight?: string;
  /** Buffer in pixels before the section enters the viewport to start loading */
  rootMargin?: string;
  /** Optional delay in ms before showing the content after it enters view */
  delay?: number;
}

/**
 * Unified Lazy Loading Section.
 * Efficiently renders children or fetches data only when it enters the viewport.
 * Resolves hydration issues by using a consistent intersection observer.
 */
function LazySection<T = any>({
  children,
  fetcher,
  render,
  component, // backward compatibility
  fallback = null,
  className,
  minHeight = '100px',
  rootMargin = '200px',
  delay = 0,
}: LazySectionProps<T>) {
  const [inView, setInView] = useState(false);
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const renderFn = render || component;

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          const activate = async () => {
            if (delay > 0) {
              await new Promise(resolve => setTimeout(resolve, delay));
            }
            
            setInView(true);

            if (fetcher && !data && !isLoading) {
              setIsLoading(true);
              try {
                const result = await fetcher();
                setData(result);
              } catch (error) {
                console.error("LazySection fetch error:", error);
              } finally {
                setIsLoading(false);
              }
            }
          };

          activate();
          observer.disconnect();
        }
      },
      {
        rootMargin: `${rootMargin} 0px`,
        threshold: 0.01,
      }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, [rootMargin, delay, fetcher, data, isLoading]);

  return (
    <div
      ref={containerRef}
      className={cn('w-full', className)}
      style={{ minHeight }}
    >
      {!inView || (fetcher && !data && isLoading) ? (
        fallback
      ) : (
        <>
          {renderFn && data ? renderFn(data) : children}
        </>
      )}
    </div>
  );
}

export default LazySection;
