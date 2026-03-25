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
  /** Visual Aspect Ratio to reserve space (e.g. '16/9' or '5/1') */
  aspectRatio?: string;
  /** Whether to load this section immediately without waiting for intersection */
  priority?: boolean;
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
  aspectRatio,
  priority = false,
}: LazySectionProps<T>) {
  const [inView, setInView] = useState(priority);
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const renderFn = render || component;

  // Manual trigger if priority is set
  useEffect(() => {
    if (priority && !data && !isLoading) {
      const activate = async () => {
        if (delay > 0) {
          await new Promise(resolve => setTimeout(resolve, delay));
        }
        setInView(true);
        if (fetcher) {
          setIsLoading(true);
          try {
            const result = await fetcher();
            setData(result);
          } catch (err) {
            console.error('LazySection fetch error:', err);
          } finally {
            setIsLoading(false);
          }
        }
      };
      activate();
    }
  }, [priority, fetcher, data, isLoading, delay]);

  useEffect(() => {
    if (priority) return; // Skip observer if priority is handled

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
              } catch (err) {
                console.error('LazySection fetch error:', err);
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
        rootMargin,
        threshold: 0.01,
      }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, [fetcher, data, isLoading, rootMargin, delay, priority]);

  return (
    <div
      ref={containerRef}
      className={className}
      style={{ minHeight, aspectRatio }}
    >
      {inView ? (
        <>
          {isLoading && !data ? fallback : null}
          {renderFn && data ? renderFn(data) : children}
          {!fetcher && children}
        </>
      ) : (
        fallback
      )}
    </div>
  );
}

export default LazySection;
