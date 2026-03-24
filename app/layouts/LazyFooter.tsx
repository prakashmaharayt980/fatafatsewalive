'use client'

import dynamic from 'next/dynamic';
import { useInView } from 'react-intersection-observer';

const FooterBody = dynamic(() => import('./FooterBody'), {
  ssr: true,
  loading: () => <div className="h-60 bg-slate-900 animate-pulse" />
});

export default function LazyFooter() {
  const { ref, inView } = useInView({
    triggerOnce: true,
    rootMargin: '200px 0px',
  });

  return (
    <div ref={ref} className="min-h-[100px]">
      {inView ? <FooterBody /> : <div className="h-60 bg-slate-900" />}
    </div>
  );
}
