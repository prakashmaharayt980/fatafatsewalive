'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { trackBannerClick, trackCategoryClick } from '@/lib/analytics';

// Demo data matching the user's design image
const TOP_BANNERS = [
    {
        id: 1,
        title: "Trending NIKE Sneaker",
        subtitle: "FASHION",
        buttonText: "SHOP NOW ->",
        image: "https://images.unsplash.com/photo-1549298916-b41d501d3772?q=80&w=2912&auto=format&fit=crop",
        bgColor: "bg-[#1e1e1e]", // Dark background
        textColor: "text-white",
        colSpan: "col-span-12 md:col-span-4"
    },
    {
        id: 2,
        title: "Vegan Friendly Makeup",
        subtitle: "HEALTHY & BEAUTY",
        buttonText: "23 Products",
        image: "https://images.unsplash.com/photo-1596462502278-27bfdd403348?q=80&w=2787&auto=format&fit=crop",
        bgColor: "bg-[#f5f5f5]", // Light background
        textColor: "text-gray-900",
        colSpan: "col-span-12 md:col-span-4"
    },
    {
        id: 3,
        title: "Fashion Apple Accessories",
        subtitle: "ELECTRONICS",
        buttonText: "12 Products",
        image: "https://images.unsplash.com/photo-1592921870789-04563d5503ce?q=80&w=2938&auto=format&fit=crop",
        bgColor: "bg-[#2d3748]", // Dark grey background
        textColor: "text-white",
        colSpan: "col-span-12 md:col-span-4"
    }
];

import { Shirt, Armchair, Calculator, Trophy, Gamepad2, MonitorSmartphone } from 'lucide-react';

const CATEGORIES = [
    { id: 1, name: "Fashion", icon: Shirt, color: "text-pink-500", bg: "bg-pink-50" },
    { id: 2, name: "Furniture", icon: Armchair, color: "text-amber-600", bg: "bg-amber-50" },
    { id: 3, name: "Sneaker", icon: Calculator, color: "text-blue-500", bg: "bg-blue-50" }, // Using Calculator as placeholder for Sneaker if correct icon not available, or footprint
    { id: 4, name: "Sports", icon: Trophy, color: "text-green-500", bg: "bg-green-50" },
    { id: 5, name: "Gaming", icon: Gamepad2, color: "text-purple-500", bg: "bg-purple-50" },
    { id: 6, name: "Electronics", icon: MonitorSmartphone, color: "text-cyan-500", bg: "bg-cyan-50" },
];

const FeaturedCategoryGrid = () => {
    return (
        <div className="w-full max-w-[1400px] mx-auto px-4 sm:px-6 my-10">
            {/* Top Row: 3 Highlight Banners */}
            <div className="grid grid-cols-12 gap-4 mb-6">
                {TOP_BANNERS.map((banner) => (
                    <div
                        key={banner.id}
                        className={`${banner.colSpan} relative h-[220px] rounded-xl overflow-hidden ${banner.bgColor} transition-transform duration-300 hover:scale-[1.01] hover:shadow-lg group cursor-pointer`}
                        onClick={() => trackBannerClick(banner.title, 'Featured Category Top Banner')}
                    >
                        <div className="absolute inset-0 p-6 z-10 flex flex-col justify-center">
                            <span className={`text-xs font-bold uppercase tracking-wider mb-2 opacity-80 ${banner.textColor === 'text-white' ? 'text-white' : 'text-orange-500'}`}>
                                {banner.subtitle}
                            </span>
                            <h3 className={`text-2xl font-bold mb-4 leading-tight max-w-[70%] ${banner.textColor}`}>
                                {banner.title}
                            </h3>
                            <button className={`text-sm font-semibold underline underline-offset-4 decoration-2 ${banner.textColor} hover:opacity-80`}>
                                {banner.buttonText}
                            </button>
                        </div>
                        {/* Image Area - Right side positioning */}
                        <div className="absolute right-0 bottom-0 top-0 w-1/2 h-full">
                            <div className="relative w-full h-full">
                                {/* Using a placeholder div if image fails, or the actual image */}
                                <div className="w-full h-full bg-black/5" />
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Bottom Row: Category Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {CATEGORIES.map((cat) => (
                    <div
                        key={cat.id}
                        className="flex flex-col items-center justify-center p-6 bg-gray-50 rounded-xl cursor-pointer transition-all duration-300 hover:bg-white hover:shadow-md border border-transparent hover:border-gray-100 group"
                        onClick={() => trackCategoryClick(cat.name, 'grid_click')}
                    >
                        <div className="w-20 h-20 mb-4 relative flex items-center justify-center">
                            {/* Icon Placeholder */}
                            <div className={`w-16 h-16 ${cat.bg} rounded-full shadow-sm flex items-center justify-center ${cat.color} group-hover:scale-110 transition-transform`}>
                                <cat.icon className="w-8 h-8" />
                            </div>
                        </div>
                        <span className="text-gray-700 font-semibold group-hover:text-black">{cat.name}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default FeaturedCategoryGrid;
