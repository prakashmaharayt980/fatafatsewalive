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

const FooterBody = () => {
  const QuickLinks = [
    { title: "About Us", url: "#" },
    { title: "Contact Us", url: "#" },
    { title: "Terms & Conditions", url: "#" },
    { title: "Privacy Policy", url: "#" },
    { title: "Return Policy", url: "#" },
    
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
    { Icon: Facebook, url: "#", color: "hover:text-blue-600" },
    { Icon: Twitter, url: "#", color: "hover:text-sky-500" },
    { Icon: Instagram, url: "#", color: "hover:text-pink-600" },
    { Icon: Youtube, url: "#", color: "hover:text-red-600" },
    { Icon: Linkedin, url: "#", color: "hover:text-blue-700" },
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
                src="/imgfile/footerlogo.png"
                alt="FatafatSewa Logo"
                width={160}
                height={70}
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
                {socialIcons.map(({ Icon, url, color }, index) => (
                  <a
                    key={index}
                    href={url}
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
                  <a
                    href={link.url}
                    className="text-gray-600 hover:text-[var(--colour-fsP1)] transition-colors duration-200 font-normal flex items-center group text-center sm:text-left"
                  >
                    <span className="group-hover:translate-x-1 transition-transform duration-200">
                      {link.title}
                    </span>
                  </a>
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
                  <a
                    href={category.url}
                    className="text-gray-600 hover:text-[var(--colour-fsP1)] transition-colors duration-200 font-normal flex items-center group text-center sm:text-left"
                  >
                    <span className="group-hover:translate-x-1 transition-transform duration-200">
                      {category.title}
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Information */}
          <div className="sm:col-span-2 lg:col-span-1">
            <h3 className="font-semibold text-[var(--colour-fsP2)] text-lg lg:text-xl mb-4 text-center lg:text-left">
              Contact Info
            </h3>
            <ul className="space-y-3 flex flex-col justify-center lg:justify-start  sm:items-start">
              {ContactInfo.map((info, index) => (
                <li key={index} className="flex items-start gap-3 text-center lg:text-left">
                  <div className="flex-shrink-0 w-9 h-9 bg-blue-100 rounded-full flex items-center justify-center mx-0">
                    <info.icon className="w-4 h-4 text-blue-600" />
                  </div>
                  <span className="text-gray-600 text-sm lg:text-base font-normal leading-relaxed">{info.title}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Section */}
      <div className="bg-white border-t border-gray-200 py-8 lg:py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
            {/* Payment Methods */}
            <div className="lg:col-span-1">
              <h4 className="font-semibold text-[var(--colour-fsP2)] text-lg mb-4 text-center lg:text-left">Payment Methods</h4>
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-4 justify-center lg:justify-start">
                {paymentMethods.map((method, index) => (
                  <div
                    key={index}
                    className="bg-white rounded-lg shadow-md p-3 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border border-gray-100"
                  >
                    <Image
                      src={method.src}
                      alt={method.alt}
                      width={55}
                      height={35}
                      className="object-contain"
                      quality={100}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Newsletter Subscription */}
            <div className="lg:col-span-1">
              <div className="text-center lg:text-left">
                <p className="text-gray-600 text-sm lg:text-base mb-4 font-medium">Subscribe to get special offers and updates</p>
                <div className="flex flex-col sm:flex-row gap-3 w-full">
                  <input
                    type="email"
                    placeholder="your@email.com"
                    className="flex-1 px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--colour-fsP1)] focus:border-transparent transition-all duration-200"
                  />
                  <button className="bg-[var(--colour-fsP1)] text-white px-6 py-3 rounded-lg font-medium transition-all duration-200 hover:bg-opacity-90 hover:shadow-lg text-sm whitespace-nowrap">
                    Subscribe
                  </button>
                </div>
              </div>
            </div>

            {/* App Store Links */}
            <div className="lg:col-span-1">
              <h4 className="font-semibold text-[var(--colour-fsP2)] text-lg mb-4 text-center lg:text-left">Download Our App</h4>
              <div className="flex gap-3 justify-center lg:justify-start">
                {playStoreImages.map((image, index) => (
                  <a
                    key={index}
                    href={image.url}
                    className="block bg-black rounded-lg shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-1 hover:scale-105"
                  >
                    <Image
                      src={image.src}
                      alt={image.alt}
                      width={130}
                      height={45}
                      className="object-contain"
                      quality={100}
                    />
                  </a>
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