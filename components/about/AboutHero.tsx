'use client';

import { useRef, useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import { CompanyLogo } from '@/app/CommonVue/Payment';
import { Star, CheckCircle } from 'lucide-react';

import facebookIcon from '@/public/svgfile/facebook.svg';
import tiktokIcon from '@/public/svgfile/tiktok.svg';
import youtubeIcon from '@/public/svgfile/youtube.svg';
import instagramIcon from '@/public/svgfile/instagram.svg';

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

const metrics = [
    { icon: facebookIcon,  alt: 'Facebook',  num: 24,  suffix: 'K+', label: 'FB Followers',  decimal: false, href: 'https://www.facebook.com/fatafatsewanpl' },
    { icon: instagramIcon, alt: 'Instagram', num: 16,  suffix: 'K+', label: 'IG Followers',  decimal: false, href: 'https://www.instagram.com/fatafatsewanp' },
    { icon: tiktokIcon,    alt: 'TikTok',    num: 7,   suffix: 'K+', label: 'TikTok Fans',   decimal: false, href: 'https://www.tiktok.com/@fatafatsewa.com' },
    { icon: youtubeIcon,   alt: 'YouTube',   num: 800, suffix: '+',  label: 'Subscribers',   decimal: false, href: 'https://www.youtube.com/@fatafatsewa' },
    { icon: null, alt: 'Rating',    num: 4.8, suffix: '', label: 'Google Rating', decimal: true,  href: null },
    { icon: null, alt: 'Customers', num: 100, suffix: 'K+', label: 'Customers',  decimal: false, href: null },
];

export default function AboutHero({ bannerData }: AboutHeroProps) {
    const scrollRef   = useRef<HTMLDivElement>(null);
    const metricsRef  = useRef<HTMLDivElement>(null);
    const hasAnimated = useRef(false);
    const [counts, setCounts] = useState(metrics.map(() => 0));

    const slides = useMemo(() => {
        if (!bannerData?.images?.length) {
            return [{ id: 'fallback-1', src: 'https://images.unsplash.com/photo-1556761175-4b46a572b786?q=80&w=2000&auto=format&fit=crop', link: '#' }];
        }
        return [...bannerData.images]
            .sort((a, b) => a.order - b.order)
            .map(img => ({
                id: img.id.toString(),
                src: (img.image && typeof img.image === 'object') ? img.image.full : 'https://images.unsplash.com/photo-1556761175-4b46a572b786?q=80&w=2000&auto=format&fit=crop',
                link: img.link ?? '#',
            }));
    }, [bannerData]);

    useEffect(() => {
        const el = scrollRef.current;
        if (!el || slides.length <= 1) return;
        const SPEED = 0.8;
        let x = 0;
        let raf: number;
        const step = () => {
            const maxScroll = el.scrollWidth - el.clientWidth;
            if (maxScroll <= 0) return;
            x = x + SPEED;
            if (x >= maxScroll) x = 0;
            el.scrollLeft = x;
            raf = requestAnimationFrame(step);
        };
        raf = requestAnimationFrame(step);
        return () => cancelAnimationFrame(raf);
    }, [slides.length]);

    useEffect(() => {
        const el = metricsRef.current;
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
                setCounts(metrics.map(m =>
                    m.decimal ? parseFloat((m.num * eased).toFixed(1)) : Math.round(m.num * eased)
                ));
                if (progress < 1) requestAnimationFrame(tick);
            };
            requestAnimationFrame(tick);
            observer.disconnect();
        }, { threshold: 0.4 });
        observer.observe(el);
        return () => observer.disconnect();
    }, []);

    return (
        <section className="relative bg-slate-100 overflow-hidden pt-0 pb-1">
            {/* Banner */}
            <div className="w-full relative bg-slate-200">
                <div
                    ref={scrollRef}
                    className="flex overflow-x-auto w-full relative"
                    style={{ scrollbarWidth: 'none', aspectRatio: '20 / 6' }}
                >
                    {slides.map((slide, i) => (
                        <div key={slide.id} className="relative shrink-0 h-full block" style={{ width: '100%' }}>
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
            </div>

            {/* Uplifted Content Card */}
            <div className="container-responsive relative z-10 w-full mx-auto px-4 md:px-6">
                <div className="relative -mt-16 sm:-mt-24 md:-mt-32 lg:-mt-40 xl:-mt-48
                                bg-white border border-slate-200
                                p-6 sm:p-10 md:p-12 lg:p-16
                                mx-auto max-w-6xl text-center
                                flex flex-col items-center gap-6">

                    {/* Logo & Heading */}
                    <div className="flex flex-col md:flex-row items-center justify-center gap-6 md:gap-10 w-full mb-4">
                        <div className="relative w-45 h-13 sm:w-60 sm:h-[70px] shrink-0">
                            <Image src={CompanyLogo} alt="Fatafatsewa Logo" fill className="object-contain" sizes="240px" priority />
                        </div>
                        <div className="hidden md:block w-px h-20 bg-slate-200" />
                        <h1 className="text-3xl sm:text-4xl lg:text-[42px] font-extrabold text-slate-900 leading-[1.15] font-heading text-center md:text-left tracking-tight">
                            Empowering Nepal's <br className="hidden md:block" />
                            <span className="text-(--colour-fsP1)">Digital</span> Shopping Experience
                        </h1>
                    </div>

                    <p className="text-base sm:text-lg text-slate-600 leading-relaxed font-poppins max-w-3xl mx-auto mt-2 text-center">
                        Fatafatsewa is Nepal's premier online shopping destination, committed to delivering quality products, exceptional services, and a seamless shopping experience. From electronics to EMI services, we bring the best right to your doorstep.
                    </p>

                    {/* Metrics Row */}
                    <div ref={metricsRef} className="w-full pt-8 border-t border-slate-100">
                        <div className="flex flex-wrap justify-center gap-3 sm:gap-4 w-full">
                            {metrics.map((item, index) => {
                                const inner = (
                                    <>
                                        {item.icon ? (
                                            <Image src={item.icon} alt={item.alt} width={28} height={28} className="w-7 h-7" />
                                        ) : item.label === 'Google Rating' ? (
                                            <Star className="w-7 h-7 text-(--colour-fsP1) fill-(--colour-fsP1)" />
                                        ) : (
                                            <CheckCircle className="w-7 h-7 text-(--colour-fsP2)" />
                                        )}
                                        <div className="text-lg sm:text-xl font-bold text-slate-900 tabular-nums">
                                            {item.label === 'Google Rating' ? (
                                                <span className="flex items-center gap-1">
                                                    {counts[index].toFixed(1)}
                                                    <span className="text-xs text-slate-400 font-normal">/ 5</span>
                                                </span>
                                            ) : (
                                                `${counts[index]}${item.suffix}`
                                            )}
                                        </div>
                                        <div className="text-[11px] sm:text-xs text-slate-500 font-medium">{item.label}</div>
                                    </>
                                );

                                const baseClass = "w-32.5 flex flex-col items-center justify-center gap-2 p-3 sm:p-4 bg-white rounded-xl border border-slate-200 transition-colors";

                                return item.href ? (
                                    <a
                                        key={index}
                                        href={item.href}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className={`${baseClass} hover:border-(--colour-fsP1) hover:bg-orange-50 cursor-pointer`}
                                    >
                                        {inner}
                                    </a>
                                ) : (
                                    <div key={index} className={`${baseClass} hover:border-slate-300`}>
                                        {inner}
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                </div>
            </div>
        </section>
    );
}
