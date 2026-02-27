import React from 'react';
import {
  MapPin,
  Facebook,
  Twitter,
  Instagram,
  Youtube,
  Linkedin,
  PhoneCall,
  Mail,
  Headphones,
  Clock,
  Truck,
  Shield,
} from 'lucide-react';
import Image from 'next/image';
import imglogo from '@/app/assets/CompanyLogo.webp';
import Link from 'next/link';

const FooterBody = () => {

  const QuickLinks = [
    { title: "About Us", url: "/pages/about-us" },
    { title: "Contact Us", url: "/pages/contact-us" },
    { title: "Careers", url: "/pages/contact-us" },
    { title: "Sell with Us", url: "/pages/contact-us" },
    { title: "Terms & Conditions", url: "/pages/terms-and-conditions" },
    { title: "Privacy Policy", url: "/pages/privacy-policy" },
  ];

  const CustomerService = [
    { title: "Return Policy", url: "/pages/return-policy" },
    { title: "Warranty Policy", url: "/pages/return-policy" },
    { title: "EMI Payment", url: "/pages/emi" },
    { title: "Shipping Info", url: "/pages/contact-us" },
    { title: "FAQs", url: "/pages/contact-us" },
    { title: "Store Location", url: "/pages/location" },
  ];

  const Categories = [
    { title: "Mobile Phones", url: "/category/mobile" },
    { title: "Laptops", url: "/category/laptop" },
    { title: "Tablets", url: "/category/tablet" },
    { title: "Accessories", url: "/category/accessories" },
    { title: "Wearables", url: "/category/wearable" },
    { title: "Audio", url: "/category/audio" },
  ];

  const TopBrands = [
    { title: "Apple", url: "/brand/apple" },
    { title: "Samsung", url: "/brand/samsung" },
    { title: "Xiaomi", url: "/brand/xiaomi" },
    { title: "OnePlus", url: "/brand/oneplus" },
    { title: "Lenovo", url: "/brand/lenovo" },
    { title: "HP", url: "/brand/hp" },
  ];

  const DiscoverMore = [
    { title: "Blogs", url: "/blogs" },
    { title: "Trending Products", url: "/products" },
    { title: "EMI Application", url: "/apply-emi" },
    { title: "Compare Products", url: "/compare" },
  ];

  const socialIcons = [
    { name: "Facebook", Icon: Facebook, url: "https://www.facebook.com/fatafatsewanpl" },
    { name: "Twitter", Icon: Twitter, url: "https://www.twitter.com/fatafatsewanp" },
    { name: "Instagram", Icon: Instagram, url: "https://www.instagram.com/fatafatsewanp" },
    { name: "YouTube", Icon: Youtube, url: "https://www.youtube.com/@fatafatsewa" },
    { name: "LinkedIn", Icon: Linkedin, url: "https://www.linkedin.com/company/fatafatsewanp" },
  ];

  const paymentMethods = [
    "/imgfile/esewa.png",
    "/imgfile/khalti.webp",
    "/imgfile/paymentMethod1.png",
    "/imgfile/paymentMethod2.png",
    "/imgfile/paymentMethod3.png",
    "/imgfile/paymentMethod4.png",
    "/imgfile/paymentMethod6.png",
  ];

  const bankingPartners = [
    "/imgfile/bankingPartners1.png",
    "/imgfile/bankingPartners2.png",
    "/imgfile/bankingPartners3.png",
    "/imgfile/bankingPartners4.png",
    "/imgfile/bankingPartners5.png",
    "/imgfile/bankingPartners6.png",
    "/imgfile/bankingPartners7.png",
    "/imgfile/bankingPartners8.png",
    "/imgfile/bankingPartners9.png",
    "/imgfile/bankingPartners10.png",
    "/imgfile/bankingPartners11.png",
    "/imgfile/bankingPartners12.png",
    "/imgfile/bankingPartners17.png",
    "/imgfile/insurancepartner1.png",
    "/imgfile/insurancepartner2.png",
  ];

  return (
    <footer className="font-[Inter,sans-serif]">
      <span className="sr-only">Fatafatsewa footer</span>

      {/* ═══ Help Banner ═══ */}
      <div className="bg-[var(--colour-fsP1)] border border-red-500 rounded-t-2xl">
        <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <Headphones className="w-5 h-5 text-white drop-shadow-sm" />
              <div>
                <p className="text-white font-bold text-sm drop-shadow-md">We&apos;re Always Here To Help</p>
                <p className="text-white/90 font-medium text-[11px] drop-shadow-sm">Reach out to us through any of these support channels</p>
              </div>
            </div>
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2 text-white">
                <PhoneCall className="w-4 h-4 text-white drop-shadow-sm" />
                <div>
                  <p className="text-[10px] text-white/90 uppercase tracking-wider font-bold drop-shadow-sm">Call Us</p>
                  <p className="text-sm font-bold text-white drop-shadow-md">+977 9828757575</p>
                </div>
              </div>
              <div className="hidden sm:block h-8 bg-white/30 w-[1px]" />
              <div className="flex items-center gap-2 text-white">
                <Mail className="w-4 h-4 text-white drop-shadow-sm" />
                <div>
                  <p className="text-[10px] text-white/90 uppercase tracking-wider font-bold drop-shadow-sm">Email</p>
                  <p className="text-sm font-bold text-white drop-shadow-md">info@fatafatsewa.com</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ═══ Main Footer ═══ */}
      <div className="bg-slate-900 text-gray-300">
        <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-8 lg:gap-6">

            {/* ── Column 1: Quick Links ── */}
            <div>
              <h3 className="text-white font-bold text-[13px] mb-4 uppercase tracking-wider">Quick Links</h3>
              <ul className="space-y-2">
                {QuickLinks.map((link, i) => (
                  <li key={i}>
                    <Link href={link.url} className="text-slate-400 hover:text-blue-300 text-[13px] transition-colors duration-200 block">
                      {link.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* ── Column 2: Customer Service ── */}
            <div>
              <h3 className="text-white font-bold text-[13px] mb-4 uppercase tracking-wider">Customer Service</h3>
              <ul className="space-y-2">
                {CustomerService.map((link, i) => (
                  <li key={i}>
                    <Link href={link.url} className="text-slate-400 hover:text-blue-300 text-[13px] transition-colors duration-200 block">
                      {link.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* ── Column 3: Categories ── */}
            <div>
              <h3 className="text-white font-bold text-[13px] mb-4 uppercase tracking-wider">Categories</h3>
              <ul className="space-y-2">
                {Categories.map((link, i) => (
                  <li key={i}>
                    <Link href={link.url} className="text-slate-400 hover:text-blue-300 text-[13px] transition-colors duration-200 block">
                      {link.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* ── Column 4: Top Brands ── */}
            <div>
              <h3 className="text-white font-bold text-[13px] mb-4 uppercase tracking-wider">Top Brands</h3>
              <ul className="space-y-2">
                {TopBrands.map((link, i) => (
                  <li key={i}>
                    <Link href={link.url} className="text-slate-400 hover:text-blue-300 text-[13px] transition-colors duration-200 block">
                      {link.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* ── Column 5: Discover ── */}
            <div>
              <h3 className="text-white font-bold text-[13px] mb-4 uppercase tracking-wider">Discover</h3>
              <ul className="space-y-2">
                {DiscoverMore.map((link, i) => (
                  <li key={i}>
                    <Link href={link.url} className="text-slate-400 hover:text-blue-300 text-[13px] transition-colors duration-200 block">
                      {link.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* ── Column 6: Contact Info ── */}
            <div>
              <h3 className="text-white font-bold text-[13px] mb-4 uppercase tracking-wider">Contact Info</h3>
              <ul className="space-y-3">
                <li className="flex items-start gap-2">
                  <MapPin className="w-3.5 h-3.5 text-blue-400 flex-shrink-0 mt-0.5" />
                  <span className="text-slate-400 text-[13px] leading-snug">Sitapaila Road-14, Kathmandu, Nepal</span>
                </li>
                <li className="flex items-start gap-2">
                  <PhoneCall className="w-3.5 h-3.5 text-blue-400 flex-shrink-0 mt-0.5" />
                  <span className="text-slate-400 text-[13px]">+977 9828757575</span>
                </li>
                <li className="flex items-start gap-2">
                  <Mail className="w-3.5 h-3.5 text-blue-400 flex-shrink-0 mt-0.5" />
                  <span className="text-slate-400 text-[13px]">info@fatafatsewa.com</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* ═══ Shop on the Go + Connect With Us ═══ */}
        <div className="border-t border-white/10">
          <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">

              {/* App Download */}
              <div className="flex items-center gap-4">
                <span className="text-white font-bold text-xs uppercase tracking-wider">Shop on the Go</span>
                <div className="flex gap-2">
                  <a href="#" className="block hover:opacity-80 transition-opacity">
                    <Image src="/imgfile/google-play.svg" alt="Google Play Store" width={120} height={36} className="h-9 w-auto" />
                  </a>
                  <a href="#" className="block hover:opacity-80 transition-opacity">
                    <Image src="/imgfile/app-store.svg" alt="App Store" width={120} height={36} className="h-9 w-auto" />
                  </a>
                </div>
              </div>

              {/* USP Badges */}
              <div className="hidden md:flex items-center gap-5">
                <div className="flex items-center gap-1.5 text-slate-400 text-xs">
                  <Truck className="w-4 h-4 text-blue-400" />
                  <span>Fast Delivery</span>
                </div>
                <div className="flex items-center gap-1.5 text-slate-400 text-xs">
                  <Shield className="w-4 h-4 text-blue-400" />
                  <span>Genuine Products</span>
                </div>
                <div className="flex items-center gap-1.5 text-slate-400 text-xs">
                  <Clock className="w-4 h-4 text-blue-400" />
                  <span>24/7 Support</span>
                </div>
              </div>

              {/* Connect With Us — Social Icons */}
              <div className="flex items-center gap-3">
                <span className="text-white font-bold text-xs uppercase tracking-wider">Connect With Us</span>
                <div className="flex gap-1.5">
                  {socialIcons.map(({ name, Icon, url }, i) => (
                    <a
                      key={i}
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={name}
                      className="w-8 h-8 rounded-full bg-[var(--colour-fsP2)] flex items-center justify-center text-white hover:bg-blue-500 transition-all duration-300 hover:scale-110"
                    >
                      <Icon className="w-3.5 h-3.5" />
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ═══ Payment Methods — Horizontal Scroll ═══ */}
        <div className="border-t border-white/10">
          <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5">
            <div className="flex items-center gap-4">
              <span className="text-white text-xs font-bold uppercase tracking-wider whitespace-nowrap">Payment Methods</span>
              <div className="flex overflow-x-auto gap-2 scrollbar-hide pb-1">
                {paymentMethods.map((src, i) => (
                  <div
                    key={i}
                    className="flex-shrink-0 bg-white rounded-md px-2 py-1.5 flex items-center justify-center h-9 min-w-[56px] hover:shadow-md transition-shadow"
                  >
                    <Image
                      src={src}
                      alt={`Payment Method ${i + 1}`}
                      width={40}
                      height={24}
                      className="object-contain h-5 w-auto"
                      quality={75}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ═══ Banking & Insurance Partners — Auto-Scroll Row ═══ */}
        <div className="border-t border-white/10 overflow-hidden">
          <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5">
            <div className="flex items-center gap-4">
              <span className="text-white text-xs font-bold uppercase tracking-wider whitespace-nowrap">Our Partners</span>
              <div className="overflow-hidden flex-1 partner-scroll-container">
                <div className="flex gap-4 animate-scroll-x whitespace-nowrap w-max">
                  {[...bankingPartners, ...bankingPartners].map((src, i) => (
                    <div
                      key={i}
                      className="flex-shrink-0 bg-white/90 rounded-md px-3 py-1.5 flex items-center justify-center h-10 min-w-[72px] hover:bg-white transition-colors"
                    >
                      <Image
                        src={src}
                        alt={`Partner ${(i % bankingPartners.length) + 1}`}
                        width={48}
                        height={28}
                        className="object-contain h-6 w-auto"
                        quality={75}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ═══ Copyright Bar ═══ */}
      <div className="bg-[var(--colour-fsP2)]">
        <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-center sm:text-left">
            <div className="flex items-center gap-3">
              <Image src={imglogo} alt="FatafatSewa Logo" width={100} height={28} className="object-contain brightness-0 invert h-6 w-auto" />
              <p className="text-blue-100 text-xs">
                © {new Date().getFullYear()} FatafatSewa. All rights reserved.
              </p>
            </div>
            <div className="flex flex-wrap gap-4 text-xs">
              <Link href="/pages/privacy-policy" className="text-blue-100 hover:text-white transition-colors">Privacy Policy</Link>
              <Link href="/pages/terms-and-conditions" className="text-blue-100 hover:text-white transition-colors">Terms of Service</Link>
              <Link href="/pages/return-policy" className="text-blue-100 hover:text-white transition-colors">Warranty Policy</Link>
              <Link href="/sitemap.xml" className="text-blue-100 hover:text-white transition-colors">Sitemap</Link>
              <Link href="/pages/contact-us" className="text-blue-100 hover:text-white transition-colors">Consumer Rights</Link>
            </div>
          </div>
        </div>
      </div>

      {/* CSS for auto-scroll animation */}
      <style dangerouslySetInnerHTML={{
        __html: `
        @keyframes scrollX {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-scroll-x {
          animation: scrollX 30s linear infinite;
        }
        .partner-scroll-container:hover .animate-scroll-x {
          animation-play-state: paused;
        }
      `}} />
    </footer>
  );
};

export default FooterBody;