'use client'

import React from 'react';
import dynamic from 'next/dynamic';
import { useInView } from 'react-intersection-observer';

const FooterBody = dynamic(() => import('./FooterBody'), {
  ssr: true,
  loading: () => <div className="h-60 bg-slate-900 animate-pulse" />
});

export default function LazyFooter() {
  const { ref, inView } = useInView({
    triggerOnce: true,
    rootMargin: '800px', // Load well before it enters viewport
  });

  return (
    <div ref={ref}>
      {inView ? (
        <FooterBody />
      ) : (
        <div className="h-[400px] bg-slate-900" />
      )}
    </div>
  );
}
