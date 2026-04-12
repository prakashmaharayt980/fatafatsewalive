'use client';

import React, { useRef, useEffect, useState } from 'react';
import Image from 'next/image';

import { bankingEmiPartners, paymentPartners, insurancePartners } from '@/app/CommonVue/Partners';

interface MarqueeRowProps {
    images: any[];
    label: string;
    speed?: number;
    reverse?: boolean;
}

function MarqueeRow({ images, label, speed = 28, reverse = false }: MarqueeRowProps) {
    const doubled = [...images, ...images];

    return (
        <div className="mb-5 last:mb-0">
            <p className="text-xs font-bold uppercase tracking-widest text-(--colour-fsP2) mb-4 px-1">{label}</p>
            <div className="overflow-hidden partner-scroll-container">
                <div
                    className="flex gap-4 w-max"
                    style={{ animation: `scrollX${reverse ? 'Rev' : ''} ${speed}s linear infinite` }}
                >
                    {doubled.map((src, i) => (
                        <div
                            key={i}
                            className="shrink-0 bg-white border border-slate-200 flex items-center justify-center px-5 py-3 h-16 min-w-25 hover:border-slate-300 transition-colors duration-200"
                        >
                            <Image
                                src={src}
                                alt={`${label} partner ${(i % images.length) + 1}`}
                                width={72}
                                height={36}
                                className="object-cover h-8 w-auto"
                                quality={80}
                            />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

const partnerStats = [
    { num: 15, suffix: '+', label: 'Commercial Banks', sub: 'EMI partners' },
    { num: 7, suffix: '+', label: 'Payment Gateways', sub: 'National & International' },
    { num: 2, suffix: '', label: 'Insurance Providers', sub: 'Device protection' },
    { num: 100, suffix: '%', label: 'Secure Transactions', sub: 'Encrypted checkout' },
];

const CompanyPartners = () => {
    const statsRef = useRef<HTMLDivElement>(null);
    const hasAnimated = useRef(false);
    const [counts, setCounts] = useState(partnerStats.map(() => 0));

    useEffect(() => {
        const el = statsRef.current;
        if (!el) return;

        const observer = new IntersectionObserver(([entry]) => {
            if (!entry.isIntersecting || hasAnimated.current) return;
            hasAnimated.current = true;

            const DURATION = 1600;
            const start = performance.now();

            const tick = (now: number) => {
                const elapsed = now - start;
                const progress = Math.min(elapsed / DURATION, 1);
                const eased = 1 - Math.pow(1 - progress, 3);

                setCounts(partnerStats.map(s => Math.round(s.num * eased)));

                if (progress < 1) requestAnimationFrame(tick);
            };

            requestAnimationFrame(tick);
            observer.disconnect();
        }, { threshold: 0.4 });

        observer.observe(el);
        return () => observer.disconnect();
    }, []);

    return (
        <section className="py-10 md:py-14 bg-white border-t border-slate-100">
            <div className="w-full max-w-6xl mx-auto px-4 md:px-6">

                <div className="text-center max-w-2xl mx-auto mb-10">
                    <h2 className="text-4xl md:text-[2.75rem] font-extrabold text-slate-900 leading-tight tracking-tight mb-4 font-heading">
                        Backed by{' '}
                        <span className="text-(--colour-fsP1)">Industry Leaders</span>
                    </h2>
                    <p className="text-slate-500 text-base md:text-lg leading-relaxed">
                        Our partnerships with Nepal&apos;s top banks, payment systems, and insurance providers
                        let us deliver seamless EMI, secure checkout, and full device coverage — all in one place.
                    </p>
                </div>

                <div className="rounded-xl border border-slate-200 p-8">
                    <MarqueeRow images={bankingEmiPartners} label="Banking & EMI Partners" speed={32} />
                    <MarqueeRow images={paymentPartners} label="Payment Methods" speed={20} reverse />
                    <MarqueeRow images={insurancePartners} label="Insurance Partners" speed={16} />
                </div>

                <div ref={statsRef} className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-5">
                    {partnerStats.map((stat, i) => (
                        <div key={i} className="bg-white rounded-xl border border-slate-200 p-6 text-center hover:border-slate-300 transition-colors duration-200">
                            <p className="text-3xl font-extrabold mb-1 text-(--colour-fsP1) tabular-nums">
                                {counts[i]}{stat.suffix}
                            </p>
                            <p className="text-sm font-bold text-(--colour-fsP2)">{stat.label}</p>
                            <p className="text-xs text-slate-500 mt-0.5">{stat.sub}</p>
                        </div>
                    ))}
                </div>
            </div>

            <style dangerouslySetInnerHTML={{
                __html: `
                @keyframes scrollX {
                    0%   { transform: translateX(0); }
                    100% { transform: translateX(-50%); }
                }
                @keyframes scrollXRev {
                    0%   { transform: translateX(-50%); }
                    100% { transform: translateX(0); }
                }
                .partner-scroll-container:hover > div {
                    animation-play-state: paused;
                }
            `}} />
        </section>
    );
};

export default CompanyPartners;
