'use client';

import React, { useRef, useEffect, useMemo } from 'react';
import Image from 'next/image';
import { CompanyLogo } from '@/app/CommonVue/Payment';
import { Facebook, Instagram, Youtube, Star, CheckCircle, Package } from 'lucide-react';

const TiktokIcon = ({ className }: { className?: string }) => (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
        <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
    </svg>
);

interface BannerImage {
    id: string | number;
    image: { full: string;[key: string]: any };
    order: number;
    link?: string;
}

interface AboutHeroProps {
    bannerData?: {
        images?: BannerImage[];
        [key: string]: any;
    } | null;
}

export default function AboutHero({ bannerData }: AboutHeroProps) {
    const scrollRef = useRef<HTMLDivElement>(null);

    const slides = useMemo(() => {
        if (!bannerData || !bannerData.images || bannerData.images.length === 0) {
            // Fallback dummy image array if endpoint is empty
            return [
                {
                    id: 'fallback-1',
                    src: 'https://images.unsplash.com/photo-1556761175-4b46a572b786?q=80&w=2000&auto=format&fit=crop',
                    link: '#'
                }
            ];
        }

        return [...bannerData.images]
            .sort((a, b) => a.order - b.order)
            .map(img => ({
                id: img.id.toString(),
                src: img.image.full,
                link: img.link || '#'
            }));
    }, [bannerData]);

    // Auto-scroll logic continuously smoothly
    useEffect(() => {
        const el = scrollRef.current;
        if (!el || slides.length <= 1) return;

        const SPEED = 0.8; // px per frame
        let x = 0;
        let raf: number;

        const step = () => {
            const maxScroll = el.scrollWidth - el.clientWidth;
            if (maxScroll <= 0) return;

            x = (x + SPEED);
            if (x >= maxScroll) {
                x = 0; // reset instantly for infinite feel if loop is matched, or just rewind
            }
            el.scrollLeft = x;
            raf = requestAnimationFrame(step);
        };

        raf = requestAnimationFrame(step);
        return () => cancelAnimationFrame(raf);
    }, [slides.length]);

    const SocaiMediaData = [
        {
            icon: <Facebook className="w-7 h-7 text-blue-600" />,
            value: '475K+',
            label: 'FB Followers',
            hoverBorder: 'hover:border-blue-200',
            hoverBg: 'hover:bg-blue-50/50',
        },
        {
            icon: <Instagram className="w-7 h-7 text-pink-600" />,
            value: '50K+',
            label: 'IG Followers',
            hoverBorder: 'hover:border-pink-200',
            hoverBg: 'hover:bg-pink-50/50',
        },
        {
            icon: <TiktokIcon className="w-7 h-7 text-slate-800" />,
            value: '80K+',
            label: 'TikTok Fans',
            hoverBorder: 'hover:border-slate-300',
            hoverBg: 'hover:bg-slate-100/50',
        },
        {
            icon: <Youtube className="w-7 h-7 text-red-600" />,
            value: '12K+',
            label: 'Subscribers',
            hoverBorder: 'hover:border-red-200',
            hoverBg: 'hover:bg-red-50/50',
        },
        {
            icon: <Star className="w-7 h-7 text-amber-500 fill-amber-500" />,
            value: (
                <span className="flex items-center gap-1">
                    4.8 <span className="text-xs text-slate-400 font-normal">/ 5</span>
                </span>
            ),
            label: 'Google Rating',
            hoverBorder: 'hover:border-amber-200',
            hoverBg: 'hover:bg-amber-50/50',
        },
        {
            icon: <CheckCircle className="w-7 h-7 text-emerald-500" />,
            value: '100K+',
            label: 'Customers',
            hoverBorder: 'hover:border-emerald-200',
            hoverBg: 'hover:bg-emerald-50/50',
        }
    ]



    return (
        <section className="relative bg-slate-50 overflow-hidden pt-0 pb-1">
            {/* ─── 1) TOP: 2000x600 Auto-Scrolling Banner ─── */}
            <div className="w-full relative bg-slate-200">

                <div
                    ref={scrollRef}
                    className="flex overflow-x-auto w-full relative"
                    style={{ scrollbarWidth: 'none', aspectRatio: '20 / 6' }}
                >
                    {slides.map((slide, i) => (
                        <div
                            key={slide.id}
                            className="relative shrink-0 h-full block"
                            style={{ width: '100%' }} // Every image takes 100% width of container (2000:600 ratio)
                        >
                            <Image
                                src={slide.src}
                                alt={`About Fatafatsewa banner ${i + 1}`}
                                fill
                                className="object-contain"
                                priority={i === 0}
                                sizes="100vw"

                            />
                        </div>
                    ))}
                </div>

                {/* Dark gradient overlay bottom to help content visibility if it touches */}
                <div className="absolute inset-x-0 bottom-0 h-1/3 bg-linear-to-t from-slate-900/30 to-transparent pointer-events-none"></div>
            </div>

            {/* ─── 2) BOTTOM: Uplifted Content Card ─── */}
            <div className="container-responsive relative z-10 w-full mx-auto px-4 md:px-6">

                <div className="relative -mt-16 sm:-mt-24 md:-mt-32 lg:-mt-40 xl:-mt-48 
                                bg-white/95 backdrop-blur-xs rounded-2xl 
                                shadow-premium-xs border border-white/50 
                                p-6 sm:p-10 md:p-12 lg:p-16
                                mx-auto max-w-6xl text-center 
                                animate-fade-in-premium flex flex-col items-center gap-6">

                    {/* Logo & Heading Group */}
                    <div className="flex flex-col md:flex-row items-center justify-center gap-6 md:gap-10 w-full mb-4">
                        {/* Logo */}
                        <div className="relative w-[180px] h-[52px] sm:w-[240px] sm:h-[70px] shrink-0">
                            <Image
                                src={CompanyLogo}
                                alt="Fatafatsewa Logo"
                                fill
                                className="object-contain"
                                sizes="240px"
                                priority
                            />
                        </div>

                        {/* Divider Line (Desktop) */}
                        <div className="hidden md:block w-px h-20 bg-slate-200"></div>

                        {/* Title */}
                        <h1 className="text-3xl sm:text-4xl lg:text-[42px] font-extrabold text-slate-900 leading-[1.15] font-heading text-center md:text-left tracking-tight">
                            Empowering Nepal's <br className="hidden md:block" />
                            <span className="text-transparent bg-clip-text bg-linear-to-r from-[var(--colour-fsP1)] to-orange-400">
                                Digital
                            </span> Shopping Experience
                        </h1>
                    </div>

                    <p className="text-base sm:text-lg text-slate-600 leading-relaxed font-poppins max-w-3xl mx-auto mt-2 text-center">
                        Fatafatsewa is Nepal's premier online shopping destination, committed to delivering quality products, exceptional services, and a seamless shopping experience. From electronics to EMI services, we bring the best right to your doorstep.
                    </p>

                    {/* ─── Social & Metrics Grid ─── */}
                    <div className="w-full pt-8 border-t border-slate-100">
                        <div className="flex flex-wrap justify-center gap-4 sm:gap-6 w-full">
                            {SocaiMediaData.map((item, index) => (
                                <div
                                    key={index}
                                    className={`w-[130px] sm:w-[150px] flex flex-col items-center justify-center gap-2 p-3 sm:p-4 rounded-xl bg-slate-50 border border-slate-100 transition-all shadow-xs ${item.hoverBorder} ${item.hoverBg}`}
                                >
                                    {item.icon}
                                    <div className="text-lg sm:text-xl font-bold text-slate-900">{item.value}</div>
                                    <div className="text-[11px] sm:text-xs text-slate-500 font-medium">{item.label}</div>
                                </div>
                            ))}
                        </div>
                    </div>

                </div>
            </div>


        </section>
    );
}

