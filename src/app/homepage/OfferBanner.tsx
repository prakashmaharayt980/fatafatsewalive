import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import productimg from '../../../public/imgfile/product1.webp';
import iphoneImg from '../../../public/imgfile/iphone-14.webp';
import { useEffect, useMemo, useState } from "react";
import { ArrowRight, Clock, ShoppingBasket } from "lucide-react";

const OfferBanner = () => {
  const [timeLeft, setTimeLeft] = useState({
    days: 208,
    hours: 15,
    minutes: 46,
    seconds: 12,
  });

  const [currentTextIndex, setCurrentTextIndex] = useState(0);
  const [currentText, setCurrentText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  // Dummy timestamp (e.g., 30 days from now for demo)
  const dummyEndTimestamp = new Date("2025-08-30T20:09:00+0545").getTime();
  const texts = useMemo(
    () => [
      'Available for Mobile Devices',
      'Enjoy your time',
      'Apply Now to Buy with EMI ',
      'Check Out Our EMI Terms',
    ],
    []
  )

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

  useEffect(() => {
    const fullText = texts[currentTextIndex];
    const timeout = setTimeout(() => {
      if (!isDeleting) {
        if (currentText.length < fullText.length) {
          setCurrentText(fullText.substring(0, currentText.length + 1));
        } else {
          setTimeout(() => setIsDeleting(true), 2000);
        }
      } else {
        if (currentText.length > 0) {
          setCurrentText(fullText.substring(0, currentText.length - 1));
        } else {
          setIsDeleting(false);
          setCurrentTextIndex((prev) => (prev + 1) % texts.length);
        }
      }
    }, isDeleting ? 50 : 120);

    return () => clearTimeout(timeout);
  }, [currentText, isDeleting, currentTextIndex, texts]);

  return (
    <div className="w-full bg-gradient-to-r from-[var(--colour-fsP2)]/50 to-yellow-50 via-[var(--colour-fsP2)]/10 border-[var(--colour-fsP2)] shadow-md py-6 sm:py-12 lg:py-16 px-0 m-0 font-inter">
      <div className="max-w-7xl mx-auto px-3 sm:px-6">
        {/* Image and Content Section */}
        <div className="flex flex-col md:flex-row justify-center items-center mb-6 sm:mb-12 gap-4 sm:gap-12">
          <Image
            src={productimg}
            alt="Apple Product"
            width={320}
            height={320}
            sizes="(max-width: 640px) 80vw, (max-width: 1024px) 50vw, 400px"
            className="object-contain object-center rounded-lg shadow-sm w-full sm:w-3/4 md:w-1/2 max-w-[320px] sm:max-w-[400px]"
            loading="lazy"
          />
          <div className="flex flex-col items-start gap-3 sm:gap-8 w-full md:w-1/2">
            {/* Title */}
            <div className="text-center md:text-left">
              <h2 className="text-lg sm:text-2xl font-bold text-[var(--colour-fsP2)] tracking-tight">
                Apple Shopping Event
              </h2>
              <p className="text-sm sm:text-base text-gray-600 max-w-lg leading-relaxed font-medium">
                Save up to 20% on all Apple devices – limited time only!
              </p>
            </div>

            {/* Timer */}
            <div className="w-full max-w-xs sm:max-w-md">
              <div className="backdrop-blur-xs rounded-lg shadow-xs p-2 sm:p-6">
                <div className="flex flex-row flex-wrap sm:flex-nowrap items-center justify-center gap-1 sm:gap-4">
                  <Clock className="w-4 h-4 sm:w-6 sm:h-6 text-[var(--colour-fsP1)] animate-spin-slow flex-shrink-0" />
                  <div className="flex gap-0.5 sm:gap-2">
                    {["days", "hours", "minutes", "seconds"].map((unit) => (
                      <div key={unit} className="flex items-center">
                        <div className="flex gap-0.5 sm:gap-1">
                          {String(timeLeft[unit]).padStart(2, "0").split("").map((digit, i) => (
                            <div
                              key={i}
                              className="w-5 sm:w-8 h-7 sm:h-10 flex items-center justify-center bg-blue-50 border-2 border-[var(--colour-fsP2)]/10 rounded-md text-sm sm:text-xl font-bold text-[var(--colour-fsP1)]/70"
                            >
                              {digit}
                            </div>
                          ))}
                        </div>
                        {unit !== "seconds" && (
                          <span className="mx-0.5 sm:mx-1 text-base sm:text-2xl font-bold text-[var(--colour-fsP1)]/70">
                            :
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col w-full max-w-xs sm:max-w-md sm:flex-row justify-between items-center py-1 sm:py-4">
              <div className="text-sm sm:text-lg font-medium text-gray-800 border-b pb-2 sm:pb-3 border-gray-300 mb-2 sm:mb-0">
                {currentText}
                <span className="text-blue-600 animate-pulse">|</span>
              </div>
              <Button
                className={cn(
                  "bg-[var(--colour-fsP2)] px-6 sm:px-8 cursor-pointer py-4 sm:py-5 text-white hover:from-blue-700 hover:to-indigo-700",
                  "text-sm sm:text-lg font-semibold rounded-full shadow-sm",
                  "transition-all duration-300 hover:shadow-xl focus:ring-4 focus:ring-blue-300/50 w-full sm:w-auto",
                  "flex flex-row gap-1 sm:gap-2 items-center"
                )}
              >
                <ShoppingBasket className="w-3 h-3 sm:w-7 sm:h-7" />
                <span>Shop Now</span>
              </Button>
            </div>
          </div>
        </div>

        {/* Product Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 sm:gap-4 md:gap-6">
          {[
            { name: "iPad Mini", price: "Rs. 49,800", img: iphoneImg },
            { name: "Apple Watch", price: "Rs. 66,317", img: iphoneImg },
            { name: "MacBook", price: "Rs. 82,917", img: iphoneImg },
            { name: "iPhone 14", price: "Rs. 66,317", img: iphoneImg },
            { name: "iMac 24", price: "Rs. 107,767", img: iphoneImg },
          ].map((product, index) => (
            <div
              key={index}
              className="bg-white/90 cursor-pointer backdrop-blur-lg flex flex-row items-center p-2 sm:p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300 min-w-0"
            >
              <Image
                src={product.img}
                alt={product.name}
                width={48}
                height={48}
                sizes="(max-width: 640px) 36px, (max-width: 1024px) 60px, 80px"
                className="object-contain rounded-md mr-2 sm:mr-4 w-9 h-9 sm:w-[60px] sm:h-[60px] flex-shrink-0"
                loading="lazy"
              />
              <div className="flex flex-col justify-center min-w-0 overflow-hidden">
                <p className="text-yellow-500 text-[10px] sm:text-sm mb-0.5 sm:mb-1 font-medium">★★★★★</p>
                <p className="text-gray-700 font-semibold text-[10px] sm:text-base leading-tight truncate">{product.name}</p>
                <p className="text-[var(--colour-fsP2)] font-bold text-[10px] sm:text-sm truncate">{product.price}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default OfferBanner;