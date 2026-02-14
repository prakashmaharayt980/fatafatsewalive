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

} from 'lucide-react';
import Image from 'next/image';
import imglogo from '@/app/assets/CompanyLogo.webp';
import Link from 'next/link';

const FooterBody = () => {
  const QuickLinks = [
    { title: "About Us", url: "/pages/about-us" },
    { title: "Contact Us", url: "/pages/contact-us" },
    { title: "Terms & Conditions", url: "/pages/terms-and-conditions" },
    { title: "Privacy Policy", url: "/pages/privacy-policy" },
    { title: "Return Policy", url: "/pages/return-policy" },
    { title: "Location", url: "/pages/location" },

  ];

  const Categories = [
    { title: "Laptops", url: "#" },
    { title: "Mobile Phone", url: "#" },
    { title: "Accessories", url: "#" },
    { title: "Office Parts", url: "#" },
    { title: "Emi Payment ", url: "#" },

  ];

  const ContactInfo = [
    { title: "Sitapaila Road-14, Kathmandu, Nepal", icon: MapPin },
    { title: "+977 9828757575", icon: PhoneCall },
    { title: "info@fatafatsewa.com", icon: Mail },

  ];

  const socialIcons = [
    { name: "Facebook", Icon: Facebook, url: "#", color: "hover:text-blue-600" },
    { name: "Twitter", Icon: Twitter, url: "#", color: "hover:text-sky-500" },
    { name: "Instagram", Icon: Instagram, url: "#", color: "hover:text-pink-600" },
    { name: "YouTube", Icon: Youtube, url: "#", color: "hover:text-red-600" },
    { name: "LinkedIn", Icon: Linkedin, url: "#", color: "hover:text-blue-700" },
  ];

  const paymentMethods = [
    { src: "/imgfile/paymentMethod1.svg", alt: "eSewa" },
    { src: "/imgfile/paymentMethod2.svg", alt: "Khalti" },
    { src: "/imgfile/paymentMethod4.png", alt: "Payment Method 4" },
    { src: "/imgfile/paymentMethod3.png", alt: "Payment Method 3" },
    { src: "/imgfile/paymentMethod6.png", alt: "Payment Method 6" },
  ];

  const playStoreImages = [
    { src: "/imgfile/google-play.svg", alt: "Google Play Store", url: "#" },
    { src: "/imgfile/app-store.svg", alt: "App Store", url: "#" },
  ];



  return (
    <footer className="bg-gradient-to-b from-gray-50 to-gray-100 border-t border-gray-200 font-[Inter,sans-serif]">
      {/* Main Footer Content */}
      <div className="py-8 lg:py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">

          {/* Logo and Company Info */}
          <div className="sm:col-span-2 lg:col-span-1">
            <div className="mb-4 flex justify-center lg:justify-start">
              <Image
                src={imglogo}
                alt="FatafatSewa Logo"
                width={480}
                height={120}
                className="rounded-lg object-contain"
              />
            </div>
            <p className="text-gray-600 text-sm lg:text-base font-normal mb-6 max-w-md text-center lg:text-left leading-relaxed">
              Nepal&lsquo;s Leading Online Shopping Platform<br />
              Making Quality Products Accessible to All
            </p>

            {/* Social Media */}
            <div className="mb-6">
              <h4 className="text-[var(--colour-fsP2)] font-semibold text-lg mb-4 text-center lg:text-left">Follow Us</h4>
              <div className="flex gap-3 justify-center lg:justify-start">
                {socialIcons.map(({ name, Icon, url, color }, index) => (
                  <a
                    key={index}
                    href={url}
                    aria-label={name}
                    className={`w-11 h-11 bg-white rounded-full flex items-center justify-center text-gray-600 ${color} transition-all duration-300 shadow-md hover:shadow-xl hover:-translate-y-1 hover:scale-105`}
                  >
                    <Icon className="w-5 h-5" />
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div className="sm:col-span-1">
            <h3 className="font-semibold text-[var(--colour-fsP2)] text-lg lg:text-xl mb-4 text-center sm:text-left">
              Quick Links
            </h3>
            <ul className="space-y-3 flex flex-col justify-center lg:justify-start items-center sm:items-start">
              {QuickLinks.map((link, index) => (
                <li key={index}>
                  <Link
                    href={link.url}
                    className="text-gray-600 hover:text-[var(--colour-fsP1)] transition-colors duration-200 font-normal flex items-center group text-center sm:text-left"
                  >
                    <span className="group-hover:translate-x-1 transition-transform duration-200">
                      {link.title}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Categories */}
          <div className="sm:col-span-1">
            <h3 className="font-semibold text-[var(--colour-fsP2)] text-lg lg:text-xl mb-4 text-center sm:text-left">
              Categories
            </h3>
            <ul className="space-y-3 flex flex-col justify-center lg:justify-start items-center sm:items-start">
              {Categories.map((category, index) => (
                <li key={index}>
                  <Link
                    href={category.url}
                    className="text-gray-600 hover:text-[var(--colour-fsP1)] transition-colors duration-200 font-normal flex items-center group text-center sm:text-left"
                  >
                    <span className="group-hover:translate-x-1 transition-transform duration-200">
                      {category.title}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Information & Payment Methods */}
          <div className="sm:col-span-2 lg:col-span-1">
            <h3 className="font-semibold text-[var(--colour-fsP2)] text-lg lg:text-xl mb-4 text-center lg:text-left">
              Contact Info
            </h3>
            <ul className="space-y-3 flex flex-col justify-center lg:justify-start sm:items-start mb-6">
              {ContactInfo.map((info, index) => (
                <li key={index} className="flex items-start gap-3 text-center lg:text-left">
                  <div className="flex-shrink-0 w-9 h-9 bg-blue-100 rounded-full flex items-center justify-center mx-0">
                    <info.icon className="w-4 h-4 text-blue-600" />
                  </div>
                  <span className="text-gray-600 text-sm lg:text-base font-normal leading-relaxed">{info.title}</span>
                </li>
              ))}
            </ul>

            {/* Payment Methods */}
            <div className="mt-6">
              <h4 className="font-semibold text-[var(--colour-fsP2)] text-lg mb-4 text-center lg:text-left">Payment Methods</h4>
              <div className="grid grid-cols-4 gap-3 justify-center lg:justify-start">
                {[
                  "/imgfile/esewa.png",
                  "/imgfile/khalti.webp",
                  "/imgfile/paymentMethod1.png",
                  "/imgfile/paymentMethod2.png",
                  "/imgfile/paymentMethod3.png",
                  "/imgfile/paymentMethod4.png",
                  "/imgfile/bankingPartners1.png",
                  "/imgfile/bankingPartners2.png",
                  "/imgfile/bankingPartners3.png",
                  "/imgfile/bankingPartners4.png",
                  "/imgfile/bankingPartners5.png",
                  "/imgfile/bankingPartners6.png",
                  "/imgfile/bankingPartners7.png",
                  "/imgfile/bankingPartners8.png"
                ].map((src, index) => (
                  <div
                    key={index}
                    className="bg-white rounded-md p-1 border border-gray-100 shadow-sm hover:shadow-md transition-all flex items-center justify-center h-10 w-full"
                  >
                    <Image
                      src={src}
                      alt={`Payment Method ${index + 1}`}
                      width={40}
                      height={24}
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

      {/* Copyright Section */}
      <div className="bg-[var(--colour-fsP2)] text-white py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
            <p className="text-sm">
              © 2025 FatafatSewa. All rights reserved.
            </p>
            <div className="flex flex-wrap gap-4 text-sm justify-center sm:justify-end">
              <a href="#" className="hover:text-gray-300 transition-colors duration-200">Privacy Policy</a>
              <a href="#" className="hover:text-gray-300 transition-colors duration-200">Terms of Service</a>
              <a href="#" className="hover:text-gray-300 transition-colors duration-200">Sitemap</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default FooterBody;