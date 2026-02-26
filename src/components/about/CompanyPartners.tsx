'use client';

import React from 'react';
import Image from 'next/image';

/* ─── Partner image paths — same files used by the footer ─────────────── */
const bankingEmiPartners = [
    '/imgfile/bankingPartners1.png',
    '/imgfile/bankingPartners2.png',
    '/imgfile/bankingPartners3.png',
    '/imgfile/bankingPartners4.png',
    '/imgfile/bankingPartners5.png',
    '/imgfile/bankingPartners6.png',
    '/imgfile/bankingPartners7.png',
    '/imgfile/bankingPartners8.png',
    '/imgfile/bankingPartners9.png',
    '/imgfile/bankingPartners10.png',
    '/imgfile/bankingPartners11.png',
    '/imgfile/bankingPartners12.png',
    '/imgfile/bankingPartners17.png',
];

const paymentPartners = [
    '/imgfile/esewa.png',
    '/imgfile/khalti.webp',
    '/imgfile/paymentMethod1.png',
    '/imgfile/paymentMethod2.png',
    '/imgfile/paymentMethod3.png',
    '/imgfile/paymentMethod4.png',
    '/imgfile/paymentMethod6.png',
];

const insurancePartners = [
    '/imgfile/insurancepartner1.png',
    '/imgfile/insurancepartner2.png',
];

/* ─── Marquee row component ──────────────────────────────────────────── */
interface MarqueeRowProps {
    images: string[];
    label: string;
    speed?: number; // seconds for one full loop
    reverse?: boolean;
}

function MarqueeRow({ images, label, speed = 28, reverse = false }: MarqueeRowProps) {
    // duplicate to make seamless loop
    const doubled = [...images, ...images];

    return (
        <div className="mb-5 last:mb-0">
            {/* Row label */}
            <p className="text-xs font-bold uppercase tracking-widest text-[var(--colour-fsP2)] mb-4 px-1">{label}</p>

            {/* Scrolling track */}
            <div className="overflow-hidden partner-scroll-container">
                <div
                    className="flex gap-4 w-max"
                    style={{
                        animation: `scrollX${reverse ? 'Rev' : ''} ${speed}s linear infinite`,
                    }}
                >
                    {doubled.map((src, i) => (
                        <div
                            key={i}
                            className="flex-shrink-0 bg-white rounded-xl border border-slate-100 shadow-xs flex items-center justify-center px-5 py-3 h-16 min-w-[100px] hover:shadow-md hover:border-slate-200 transition-all duration-300"
                        >
                            <Image
                                src={src}
                                alt={`${label} partner ${(i % images.length) + 1}`}
                                width={72}
                                height={36}
                                className="object-cover h-8 w-auto  transition-all duration-300"
                                quality={80}
                            />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

/* ─── Main component ─────────────────────────────────────────────────── */
const CompanyPartners = () => {
    return (
        <section className="py-8 md:py-10 bg-slate-50 border-t border-slate-100">
            <div className="w-full max-w-6xl mx-auto ">

                {/* ── Header ──────────────────────────────────────── */}
                <div className="text-center max-w-2xl mx-auto mb-6">

                    <h2 className="text-4xl md:text-[2.75rem] font-extrabold text-slate-900 leading-tight tracking-tight mb-5 font-heading">
                        Backed by{' '}
                        <span
                            className="text-transparent bg-clip-text"
                            style={{ backgroundImage: 'linear-gradient( var(--colour-fsP1), var(--colour-fsP2))' }}
                        >
                            Industry Leaders
                        </span>
                    </h2>
                    <p className="text-slate-500 text-base md:text-lg leading-relaxed">
                        Our partnerships with Nepal&apos;s top banks, payment systems, and insurance providers
                        let us deliver seamless EMI, secure checkout, and full device coverage — all in one place.
                    </p>
                </div>

                {/* ── Marquee rows ────────────────────────────────── */}
                <div className="bg-white  p-8 ">
                    <MarqueeRow images={bankingEmiPartners} label="Banking & EMI Partners" speed={32} />
                    <MarqueeRow images={paymentPartners} label="Payment Methods" speed={20} reverse />
                    <MarqueeRow images={insurancePartners} label="Insurance Partners" speed={16} />
                </div>

                {/* ── Stats strip ─────────────────────────────────── */}
                <div className="mt-10 grid grid-cols-2 md:grid-cols-4 gap-5">
                    {[
                        { value: '15+', label: 'Commercial Banks', sub: 'EMI partners' },
                        { value: '7+', label: 'Payment Gateways', sub: 'National & International' },
                        { value: '2', label: 'Insurance Providers', sub: 'Device protection' },
                        { value: '100%', label: 'Secure Transactions', sub: 'Encrypted checkout' },
                    ].map((stat, i) => (
                        <div
                            key={i}
                            className="bg-white rounded-2xl border border-slate-100 p-6 text-center hover:shadow-md transition-shadow duration-300"
                        >
                            <p
                                className="text-3xl font-extrabold mb-1 text-[var(--colour-fsP1)]"
                            // style={{ backgroundImage: 'linear-gradient(90deg, #f86014, #1967b3)' }}
                            >
                                {stat.value}
                            </p>
                            <p className="text-sm font-bold text-[var(--colour-fsP2)]">{stat.label}</p>
                            <p className="text-xs text-[var(--colour-fsP2)] mt-0.5">{stat.sub}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* ── Keyframe CSS ────────────────────────────────────── */}
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
                .partner-scroll-container > div {
                    animation-timing-function: linear;
                    animation-iteration-count: infinite;
                }
                .partner-scroll-container:hover > div {
                    animation-play-state: paused;
                }
            `}} />
        </section>
    );
};

export default CompanyPartners;
