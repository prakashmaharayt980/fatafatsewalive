"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Flame, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { CampaignDetails } from "@/app/api/services/offers.interface";

interface OfferBannerClientProps {
    offer: CampaignDetails;
}

const OfferBannerClient = ({ offer }: OfferBannerClientProps) => {
    const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

    useEffect(() => {
        const calculateTimeLeft = () => {
            const distance = new Date(offer.end_date).getTime() - Date.now();
            if (distance < 0) return { days: 0, hours: 0, minutes: 0, seconds: 0 };

            return {
                days: Math.floor(distance / (1000 * 60 * 60 * 24)),
                hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
                minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
                seconds: Math.floor((distance % (1000 * 60)) / 1000),
            };
        };

        setTimeLeft(calculateTimeLeft());

        const timer = setInterval(() => {
            const newTime = calculateTimeLeft();
            setTimeLeft(newTime);
            if (newTime.days + newTime.hours + newTime.minutes + newTime.seconds === 0) {
                clearInterval(timer);
            }
        }, 1000);

        return () => clearInterval(timer);
    }, [offer.end_date]);

    return (
        <div className="w-full bg-gradient-to-r from-[var(--colour-fsP2)]/50 via-[var(--colour-fsP2)]/10 to-yellow-50 py-6 sm:py-10 px-4 sm:px-6 min-h-[400px] sm:min-h-[500px] lg:min-h-[500px]">
            <div className="max-w-7xl mx-auto h-full">
                <div className="flex flex-col lg:flex-row justify-between items-center gap-8 lg:gap-12 mb-8">
                    {/* Left Content */}
                    <div className="flex flex-col items-center lg:items-start gap-3 w-full lg:w-1/2 text-center lg:text-left">
                        <div className="inline-flex items-center gap-2 bg-[var(--colour-fsP2)] pl-1.5 pr-4 py-1.5 rounded-full shadow-xl">
                            <span className="bg-[var(--colour-fsP1)] p-1.5 rounded-full ">
                                <Flame className="w-3.5 h-3.5 text-white" />
                            </span>
                            <span className="text-white text-xs font-bold uppercase tracking-wider">
                                Limited Time Offer
                            </span>
                        </div>
 
                        <div className="space-y-2">
                             <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black text-[var(--colour-fsP2)] tracking-tight leading-[1.1]">
                                {offer.name}
                            </h2>
                            <p className="text-base sm:text-lg text-slate-600 max-w-md mx-auto lg:mx-0 leading-relaxed">
                                Don&apos;t miss out on our latest <span className="font-bold text-[var(--colour-fsP1)]">{offer.name}</span> deals. Exclusive offers available for a limited time.
                            </p>
                        </div>

                        {/* Timer */}
                        <div className="flex items-center gap-2 sm:gap-3">
                            {[
                                { value: timeLeft.days, label: 'Days' },
                                { value: timeLeft.hours, label: 'Hours' },
                                { value: timeLeft.minutes, label: 'Min' },
                                { value: timeLeft.seconds, label: 'Sec' },
                            ].map((item, idx) => (
                                <div key={idx} className="flex items-center gap-2 sm:gap-3">
                                    <div className="flex flex-col items-center">
                                        <div className="bg-[var(--colour-fsP2)] text-white w-14 h-14 sm:w-16 sm:h-16 rounded-xl flex items-center justify-center shadow-lg">
                                            <span className="text-xl sm:text-2xl font-bold font-mono">
                                                {String(item.value).padStart(2, '0')}
                                            </span>
                                        </div>
                                        <span className="text-[10px] sm:text-xs text-[var(--colour-fsP2)] font-semibold mt-1.5 uppercase tracking-wide">
                                            {item.label}
                                        </span>
                                    </div>
                                    {idx < 3 && (
                                        <span className="text-[var(--colour-fsP1)] font-black text-xl sm:text-2xl mb-5">:</span>
                                    )}
                                </div>
                            ))}
                        </div>

                        {/* CTA Buttons */}
                        <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4 mt-1">
                            <Link href={`/offers/${offer.slug}`}>
                                <Button
                                    className={cn(
                                        "relative overflow-hidden",
                                        "bg-[var(--colour-fsP2)] hover:bg-[var(--colour-fsP2)] text-white",
                                        "px-8 sm:px-10 py-6 sm:py-7 rounded-full",
                                        "text-sm sm:text-base font-bold transition-all duration-300",
                                        "inline-flex items-center justify-center gap-3",
                                        "shadow-2xl shadow-[var(--colour-fsP2)]/30",
                                        "group"
                                    )}
                                >
                                    <span className="relative z-10 flex items-center gap-3">
                                        <ShoppingBag className="w-5 h-5" />
                                        <span>Shop Now</span>
                                        <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                                    </span>
                                    <div className="absolute inset-0 bg-[var(--colour-fsP1)] translate-x-[-100%] group-hover:translate-x-0 transition-transform duration-300" />
                                </Button>
                            </Link>

                            <Link href="/offers" className="flex items-center gap-2 text-[var(--colour-fsP2)] hover:text-[var(--colour-fsP1)] font-semibold text-sm transition-colors group">
                                <span>View All Deals</span>
                                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                            </Link>
                        </div>
                    </div>

                    {/* Right Image */}
                    <div className="relative w-full lg:w-1/2 flex justify-center py-2 aspect-auto">
                        <div className="absolute inset-0 bg-[var(--colour-fsP2)]/20 rounded-full blur-3xl scale-75" />
                        {offer?.thumb?.url && (
                            <Image
                                src={offer.thumb.url}
                                alt={offer.thumb.alt_text || offer.name}
                                width={620}
                                height={620}
                                sizes="(max-width: 640px) 65vw, (max-width: 1024px) 50vw, 420px"
                                className="relative object-contain aspect-square z-10 drop-shadow-2xl transition-transform duration-500"
                                priority
                            />
                        )}
                    </div>
                </div>

                {/* Product Cards */}
                <div className="grid grid-cols-2 gap-2 sm:flex sm:gap-3 sm:overflow-x-auto scrollbar-hide pb-2">
                    {(offer.products?.data || []).slice(0, 5).map((product) => (
                        <Link
                            key={product.id}
                            href={`/product-details/${product.slug}`}
                            className="group bg-white cursor-pointer flex items-center gap-2 sm:gap-3 p-2 rounded-xl border border-white/50 hover:border-[var(--colour-fsP2)]/30 hover:shadow-lg transition-all duration-300 sm:flex-shrink-0 sm:min-w-[180px]"
                        >
                            <div className="relative w-12 h-12 sm:w-14 sm:h-14 bg-slate-50 rounded-lg overflow-hidden flex-shrink-0">
                                {product?.thumb?.url && (
                                    <Image
                                        src={product.thumb.url}
                                        alt={product.thumb.alt_text || product.name}
                                        fill
                                        sizes="56px"
                                        className="object-contain p-1.5 transition-transform duration-300"
                                        loading="lazy"
                                    />
                                )}
                            </div>

                            <div className="min-w-0 flex-1">
                                <h3 className="text-xs sm:text-sm font-semibold text-[var(--colour-fsP2)] truncate">
                                    {product.name}
                                </h3>
                                <div className="flex flex-col">
                                    <span className="text-xs sm:text-sm font-bold text-[var(--colour-fsP1)]">
                                        Rs. {product.price.discounted.toLocaleString()}
                                    </span>
                                    {product.price.current > product.price.discounted && (
                                        <span className="text-[10px] text-slate-400 line-through">
                                            Rs. {product.price.current.toLocaleString()}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default OfferBannerClient;
