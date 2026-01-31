"use client";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import productimg from '../../../public/imgfile/product1.webp';
import iphoneImg from '../../../public/imgfile/iphone-14.webp';
import { useEffect, useState } from "react";
import { ArrowRight, Flame, ShoppingBag } from "lucide-react";

const OfferBanner = () => {
  const [timeLeft, setTimeLeft] = useState({
    days: 208,
    hours: 15,
    minutes: 46,
    seconds: 12,
  });

  const dummyEndTimestamp = new Date("2025-08-30T20:09:00+0545").getTime();

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date().getTime();
      const distance = dummyEndTimestamp - now;

      if (distance < 0) {
        clearInterval(timer);
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        return;
      }

      const days = Math.floor(distance / (1000 * 60 * 60 * 24));
      const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((distance % (1000 * 60)) / 1000);

      setTimeLeft({ days, hours, minutes, seconds });
    }, 1000);

    return () => clearInterval(timer);
  }, [dummyEndTimestamp]);

  const products = [
    { name: "iPad Mini", price: "Rs. 49,800", originalPrice: "Rs. 62,250", img: iphoneImg },
    { name: "Apple Watch", price: "Rs. 66,317", originalPrice: "Rs. 82,896", img: iphoneImg },
    { name: "MacBook Air", price: "Rs. 82,917", originalPrice: "Rs. 103,646", img: iphoneImg },
    { name: "iPhone 14", price: "Rs. 66,317", originalPrice: "Rs. 82,896", img: iphoneImg },
    { name: "iMac 24", price: "Rs. 107,767", originalPrice: "Rs. 134,708", img: iphoneImg },
  ];

  return (
    <div className="w-full bg-gradient-to-r from-[var(--colour-fsP2)]/50 via-[var(--colour-fsP2)]/10 to-yellow-50 py-10 sm:py-14 lg:py-20 px-4 sm:px-6 min-h-[500px] sm:min-h-[550px] lg:min-h-[600px]">
      <div className="max-w-7xl mx-auto h-full">
        {/* Main Content Section */}
        <div className="flex flex-col lg:flex-row justify-between items-center gap-8 lg:gap-12 mb-8">

          {/* Left Content */}
          <div className="flex flex-col items-center lg:items-start gap-6 w-full lg:w-1/2 text-center lg:text-left">

            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-[var(--colour-fsP2)] pl-1.5 pr-4 py-1.5 rounded-full shadow-xl">
              <span className="bg-[var(--colour-fsP1)] p-1.5 rounded-full animate-pulse">
                <Flame className="w-3.5 h-3.5 text-white" />
              </span>
              <span className="text-white text-xs font-bold uppercase tracking-wider">
                Limited Time Offer
              </span>
            </div>

            {/* Title */}
            <div className="space-y-4">
              <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black text-[var(--colour-fsP2)] tracking-tight leading-[1.1]">
                Apple
                <span className="block">Shopping</span>
                <span className="relative inline-block text-slate-900">
                  Event
                  <svg className="absolute -bottom-2 left-0 w-full" height="8" viewBox="0 0 100 8" preserveAspectRatio="none">
                    <path d="M0 7 Q 50 0, 100 7" stroke="var(--colour-fsP1)" strokeWidth="3" fill="none" strokeLinecap="round" />
                  </svg>
                </span>
              </h2>
              <p className="text-base sm:text-lg text-slate-600 max-w-md mx-auto lg:mx-0 leading-relaxed">
                Save up to <span className="font-bold text-[var(--colour-fsP1)]">20%</span> on all Apple devices. Exclusive deals await.
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
            <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4 mt-2">
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

              <button className="flex items-center gap-2 text-[var(--colour-fsP2)] hover:text-[var(--colour-fsP1)] font-semibold text-sm transition-colors group">
                <span>View All Deals</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </button>
            </div>
          </div>

          {/* Right Image */}
          <div className="relative w-full lg:w-1/2 flex justify-center py-6">
            <div className="absolute inset-0 bg-[var(--colour-fsP2)]/20 rounded-full blur-3xl scale-75" />
            <Image
              src={productimg}
              alt="Apple Product"
              width={420}
              height={420}
              sizes="(max-width: 640px) 65vw, (max-width: 1024px) 50vw, 420px"
              className="relative object-contain z-10 drop-shadow-2xl hover:scale-105 transition-transform duration-500"
              priority
            />
          </div>
        </div>

        {/* Product Cards */}
        <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-2 pt-2">
          {products.map((product, index) => (
            <div
              key={index}
              className="group bg-white cursor-pointer flex items-center gap-3 p-2.5 rounded-xl border border-white/50 hover:border-[var(--colour-fsP2)]/30 hover:shadow-lg transition-all duration-300 flex-shrink-0 min-w-[160px] sm:min-w-[180px]"
            >
              {/* Product Image */}
              <div className="relative w-12 h-12 sm:w-14 sm:h-14 bg-slate-50 rounded-lg overflow-hidden flex-shrink-0">
                <Image
                  src={product.img}
                  alt={product.name}
                  fill
                  sizes="56px"
                  className="object-contain p-1.5 group-hover:scale-110 transition-transform duration-300"
                  loading="lazy"
                />
              </div>

              {/* Product Info */}
              <div className="min-w-0 flex-1">
                <h3 className="text-xs sm:text-sm font-semibold text-[var(--colour-fsP2)] truncate">
                  {product.name}
                </h3>
                <span className="text-xs sm:text-sm font-bold text-[var(--colour-fsP1)]">
                  {product.price}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <style jsx>{`
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
};

export default OfferBanner;