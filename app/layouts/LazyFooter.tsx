'use client'

import React from 'react';
import dynamic from 'next/dynamic';
import { useInView } from 'react-intersection-observer';

const FooterBody = dynamic(() => import('./FooterBody'), {
  ssr: true,
  loading: () => <div className="h-60 bg-slate-900 animate-pulse" />
});

export default function LazyFooter() {
  const [shouldLoad, setShouldLoad] = React.useState(false);
  const { ref, inView } = useInView({
    triggerOnce: true,
    rootMargin: '0px',
  });

  React.useEffect(() => {
    if (inView) {
      // 1.5s delay to ensure it loads at the absolute last
      // prioritizing all main content hydration first
      const timer = setTimeout(() => setShouldLoad(true), 1500);
      return () => clearTimeout(timer);
    }
  }, [inView]);

  return (
    <div ref={ref} className="min-h-[100px]">
      {shouldLoad ? (
        <FooterBody />
      ) : (
        <div className="h-60 bg-slate-900 animate-pulse" />
      )}
    </div>
  );
}
