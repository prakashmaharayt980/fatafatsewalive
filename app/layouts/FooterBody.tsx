
import { MapPin, PhoneCall, Mail, Headphones, Clock, Truck, Shield, Building2, IdCard } from 'lucide-react';
import Image from 'next/image';
import imglogo from '@/app/assets/CompanyLogo.webp';
import Link from 'next/link';
import facebookIcon from '@/public/svgfile/facebook.svg';
import twitterIcon from '@/public/svgfile/twitter.svg';
import youtubeIcon from '@/public/svgfile/youtube.svg';
import tiktokIcon from '@/public/svgfile/tiktok.svg';
import appStore from '@/public/imgfile/app-store.svg';
import playStore from '@/public/imgfile/google-play.svg';
import linkedinIcon from '@/public/svgfile/linkedin.svg';
import { bankingEmiPartners, paymentPartners, insurancePartners } from '@/app/CommonVue/Partners';



const FooterBody = async () => {

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

  ];

  const Categories = [
    { title: "Mobile Phones", url: "/category/mobile-price-in-nepal" },
    { title: "Laptops", url: "/category/laptop-price-in-nepal" },
    { title: "Tablets", url: "/category/tablet-price-in-nepal" },
    { title: "Accessories", url: "/category/accessories-price-in-nepal" },
    { title: "Drone", url: "/category/drone-price-in-nepal" },
    { title: "Speaker", url: "/category/speaker-price-in-nepal" },
  ];

  const TopBrands = [
    { title: "Apple", url: "/category/mobile-price-in-nepal?brand=iphone-price-in-nepal" },
    { title: "Samsung", url: "/category/mobile-price-in-nepal?brand=samsung-price-in-nepal" },
    { title: "Xiaomi", url: "/category/mobile-price-in-nepal?brand=xiaomi-price-in-nepal" },
    { title: "OnePlus", url: "/category/mobile-price-in-nepal?brand=oneplus-price-in-nepal" },
    { title: "Mac book", url: "/category/laptop-price-in-nepal?brand=iphone-price-in-nepal" },
    { title: "Dell", url: "/category/laptop-price-in-nepal?brand=dell-laptop-price-in-nepal" },
  ];

  const DiscoverMore = [
    { title: "Blogs", url: "/blogs" },
    { title: "Trending Products", url: "/products" },
    { title: "EMI Application", url: "/emi" },
    { title: "Compare Products", url: "/compare" },
  ];

  const socialIcons = [
    { name: "Facebook", Icon: <Image src={facebookIcon} alt="Facebook" width={24} height={24} className="w-6 h-6" />, url: "https://www.facebook.com/fatafatsewanpl" },
    { name: "Twitter", Icon: <Image src={twitterIcon} alt="Twitter" width={24} height={24} className="w-6 h-6" />, url: "https://www.twitter.com/fatafatsewanp" },
    { name: "TikTok", Icon: <Image src={tiktokIcon} alt="TikTok" width={24} height={24} className="w-6 h-6" />, url: "https://www.tiktok.com/@fatafatsewa" },
    { name: "YouTube", Icon: <Image src={youtubeIcon} alt="Youtube" width={24} height={24} className="w-6 h-6" />, url: "https://www.youtube.com/@fatafatsewa" },
    { name: "LinkedIn", Icon: <Image src={linkedinIcon} alt="LinkedIn" width={24} height={24} className="w-6 h-6" />, url: "https://www.linkedin.com/company/fatafatsewanp" },
  ];

  return (
    <footer className="font-[Inter,sans-serif]">
      <span className="sr-only">Fatafatsewa footer</span>

      {/* ═══ Help Banner ═══ */}
      <div className="bg-[var(--colour-fsP1)] rounded-t-2xl">
        <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <Headphones className="w-5 h-5 text-[#1a1a1a]" />
              <div>
                <p className="text-[#1a1a1a] font-bold text-sm">We&apos;re Always Here To Help</p>
                <p className="text-[#1a1a1a] font-medium text-[11px]">Reach out to us through any of these support channels</p>
              </div>
            </div>
            <div className="flex items-center gap-6">
              <a href="tel:+9779828757575" className="flex items-center gap-2 text-[#1a1a1a] hover:opacity-80 transition-opacity">
                <PhoneCall className="w-4 h-4 text-[#1a1a1a]" />
                <div>
                  <p className="text-[10px] text-[#1a1a1a] uppercase tracking-wider font-bold">Call Us</p>
                  <p className="text-sm font-bold text-[#1a1a1a]">+977 9828757575</p>
                </div>
              </a>
              <div className="hidden sm:block h-8 bg-[#1a1a1a]/20 w-[1px]" />
              <a href="mailto:info@fatafatsewa.com" className="flex items-center gap-2 text-[#1a1a1a] hover:opacity-80 transition-opacity">
                <Mail className="w-4 h-4 text-[#1a1a1a]" />
                <div>
                  <p className="text-[10px] text-[#1a1a1a] uppercase tracking-wider font-bold">Email</p>
                  <p className="text-sm font-bold text-[#1a1a1a]">info@fatafatsewa.com</p>
                </div>
              </a>
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
                  <Building2 className="w-3.5 h-3.5 text-blue-400 flex-shrink-0 mt-0.5" />
                  <span className="text-slate-400 text-[13px]">Fatafat Sewa Pvt. Ltd.</span>
                </li>
                <li className="flex items-start gap-2">
                  <IdCard className="w-3.5 h-3.5 text-blue-400 flex-shrink-0 mt-0.5" />
                  <span className="text-slate-400 text-[13px]">Reg No : 242282/077/078</span>
                </li>
                <li className="flex items-start gap-2">
                  <IdCard className="w-3.5 h-3.5 text-blue-400 flex-shrink-0 mt-0.5" />
                  <span className="text-slate-400 text-[13px]"> VAT No: 609800038</span>
                </li>
                <li className="flex items-start gap-2">
                  <MapPin className="w-3.5 h-3.5 text-blue-400 flex-shrink-0 mt-0.5" />
                  <a
                    href="https://www.google.com/maps/search/?api=1&query=Fatafat+Sewa+Sitapaila+Kathmandu"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-slate-400 text-[13px] leading-snug hover:text-blue-300 transition-colors"
                  >
                    Sitapaila, Kathmandu
                  </a>
                </li>


                <li className="flex items-start gap-2">
                  <PhoneCall className="w-3.5 h-3.5 text-blue-400 flex-shrink-0 mt-0.5" />
                  <a href="tel:+9779828757575" className="text-slate-400 text-[13px] hover:text-blue-300 transition-colors">+977 9828757575</a>
                </li>

                <li className="flex items-start gap-2">
                  <Mail className="w-3.5 h-3.5 text-blue-400 flex-shrink-0 mt-0.5" />
                  <a href="mailto:info@fatafatsewa.com" className="text-slate-400 text-[13px] hover:text-blue-300 transition-colors">info@fatafatsewa.com</a>
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
                    <Image src={playStore} alt="Google Play Store" width={120} height={36} className="h-9 w-auto object-contain" />
                  </a>
                  <a href="#" className="block hover:opacity-80 transition-opacity">
                    <Image src={appStore} alt="App Store" width={120} height={36} className="h-9 w-auto object-contain" />
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
                      className="w-8 h-8 rounded-full  flex items-center justify-center text-white hover:bg-blue-500 transition-all duration-300 hover:scale-110"
                    >
                      {Icon}
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
                {paymentPartners.map((src, i) => (
                  <div
                    key={i}
                    className="flex-shrink-0 bg-white rounded-md px-2 py-1.5 flex items-center justify-center h-9 min-w-[56px] hover:shadow-md transition-shadow"
                  >
                    <Image
                      src={src}
                      alt={`Payment Method ${i + 1}`}
                      width={33}
                      height={20}
                      className="object-contain w-auto h-5"
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
                  {[...bankingEmiPartners, ...insurancePartners, ...bankingEmiPartners, ...insurancePartners].map((src, i) => (
                    <div
                      key={i}
                      className="flex-shrink-0 bg-white/90 rounded-md px-3 py-1.5 flex items-center justify-center h-10 min-w-[72px] hover:bg-white transition-colors"
                    >
                      <Image
                        src={src}
                        alt={`Partner ${(i % (bankingEmiPartners.length + insurancePartners.length)) + 1}`}
                        width={41}
                        height={24}
                        className="object-contain w-auto h-6"
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
              <Image src={imglogo} alt="FatafatSewa Logo" width={86} height={24} className="object-contain brightness-0 invert h-6 w-auto" />
              <p className="text-blue-100 text-xs">
                © 2026 FatafatSewa. All rights reserved.
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

    </footer>
  );
};

export default FooterBody;