'use client';

import { useState, useEffect, useRef, type ReactNode } from 'react';

interface LazySectionProps<T = unknown> {
  children?: ReactNode;
  fetcher?: () => Promise<T>;
  initialData?: T;
  render?: (data: T) => ReactNode;
  fallback?: ReactNode;
  className?: string;
  minHeight?: string;
  rootMargin?: string;
  delay?: number;
  aspectRatio?: string;
  priority?: boolean;
}

export default function LazySection<T = unknown>({
  children,
  fetcher,
  initialData,
  render,
  fallback = null,
  className,
  minHeight = '100px',
  rootMargin = '800px',
  delay = 0,
  aspectRatio,
  priority = false,
}: LazySectionProps<T>) {
  const [inView, setInView] = useState(priority || !!initialData);
  const [data, setData] = useState<T | null>(initialData ?? null);
  const [isLoading, setIsLoading] = useState(false);
  const didFetch = useRef(!!initialData);
  const containerRef = useRef<HTMLDivElement>(null);

  const activate = async () => {
    if (didFetch.current && data) return;
    didFetch.current = true;

    if (delay > 0) await new Promise(r => setTimeout(r, delay));
    setInView(true);

    if (fetcher && !data) {
      setIsLoading(true);
      try {
        setData(await fetcher());
      } catch (e) {
        console.error('LazySection:', e);
      } finally {
        setIsLoading(false);
      }
    }
  };

  useEffect(() => {
    if (priority || (!!initialData && !fetcher)) activate();
  }, [priority, initialData, fetcher]);

  useEffect(() => {
    if (priority || didFetch.current || !containerRef.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          activate();
          observer.disconnect();
        }
      },
      { rootMargin, threshold: 0.01 }
    );

    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, [rootMargin, priority, initialData]);

  const content = inView
    ? fetcher
      ? isLoading || !data ? fallback : render?.(data) ?? null
      : children
    : fallback;

  return (
    <div ref={containerRef} className={className} style={{ minHeight, aspectRatio }}>
      {content}
    </div>
  );
}
