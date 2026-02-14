




'use client'
import React, { useState, useMemo, useEffect } from 'react'; // Added useState, useEffect
import { ChevronDown, ChevronRight, Globe, Telescope } from 'lucide-react'; // Added ChevronRight
import Link from 'next/link';
import {
    HoverCard,
    HoverCardContent,
    HoverCardTrigger,
} from "@/components/ui/hover-card";

import { useRouter } from 'next/navigation';
import { navitems } from '@/app/context/GlobalData';

import Image from 'next/image'; // Added Image import
import { imglist } from '../CommonVue/Image'; // Added imglist import

// Mock Data
const mockBrandLogos = [
    { name: "Samsung", color: "text-blue-600" },
    { name: "Apple", color: "text-gray-800" },
    { name: "Xiaomi", color: "text-orange-500" },
    { name: "Dell", color: "text-blue-700" },
    { name: "HP", color: "text-blue-600" },
    { name: "Sony", color: "text-black" },
    { name: "OnePlus", color: "text-red-500" },
    { name: "Asus", color: "text-blue-600" }
];

const mockPriceRanges = [
    "Under Rs. 10,000",
    "Rs. 10,000 - 20,000",
    "Rs. 20,000 - 50,000",
    "Rs. 50,000 - 1,00,000",
    "Above Rs. 1,00,000"
];



const NavBar = ({ navbaritems }: {
    navbaritems: navitems[];
}) => {
    const router = useRouter()
    const [activeCategory, setActiveCategory] = useState<navitems | null>(null);

    // Set initial active category when navbaritems load
    useEffect(() => {
        if (navbaritems && navbaritems.length > 0) {
            setActiveCategory(navbaritems[0]);
        }
    }, [navbaritems]);

    const handlerouter = (slug: string) => {
        router.push(`/category/${slug}`)
    }

    // Early return if no valid navigation items
    if (!navbaritems?.length) {
        return null;
    }

    return (
        <nav className="bg-[var(--colour-fsP2)] shadow-md relative hidden md:block border-t border-white/10">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center h-12">
                    {/* Explore Menu Trigger */}
                    <HoverCard openDelay={0} closeDelay={100}>
                        <HoverCardTrigger asChild>
                            <button className="flex items-center gap-2 px-4 py-1.5 bg-white/10 hover:bg-white/20 text-white font-medium rounded-full transition-all duration-300 h-9 cursor-pointer border border-white/20 shadow-xs hover:shadow-sm active:scale-95 group">
                                <div className="flex items-center gap-2">
                                    <Telescope className="h-4 w-4 opacity-70 group-hover:opacity-100 group-hover:text-yellow-400 transition-all" />   <span className="text-[12px] font-bold  group-hover:text-yellow-400 transition-colors">Explore</span>
                                </div>
                                <ChevronDown className="h-4 w-4 opacity-70 group-hover:opacity-100 group-hover:text-yellow-400 transition-all" />
                            </button>
                        </HoverCardTrigger>

                        <HoverCardContent
                            className="w-[950px] p-0 border-0 shadow-xl bg-white rounded-xl overflow-hidden mt-1"
                            align="start"
                            sideOffset={4}
                        >
                            <div className="flex h-[520px]">
                                {/* Sidebar Categories */}
                                <div className="w-[220px] bg-slate-100 border-r border-slate-100 overflow-y-auto py-2 [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-slate-200 hover:[&::-webkit-scrollbar-thumb]:bg-slate-300">
                                    {navbaritems.map((category) => (
                                        <div
                                            key={category.id}
                                            onMouseEnter={() => setActiveCategory(category)}
                                            onClick={() => handlerouter(category.slug)}
                                            className={`
                                                flex items-center justify-between px-2 py-2.5 cursor-pointer transition-all mx-1 rounded-lg group mb-1
                                                ${activeCategory?.id === category.id
                                                    ? 'bg-white  ring-1 ring-slate-100'
                                                    : 'hover:bg-white '}
                                            `}
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className={`
                                                    p-1.5 rounded-md transition-colors overflow-hidden
                                                    ${activeCategory?.id === category.id
                                                        ? 'bg-blue-50'
                                                        : 'bg-slate-100 group-hover:bg-blue-50'}
                                                `}>
                                                    <Image
                                                        src={category.image ? category.image : imglist.blog}
                                                        alt={category.title}
                                                        width={20}
                                                        height={20}
                                                        className="object-contain"
                                                    />
                                                </div>
                                                <span className={`
                                                    text-sm font-medium transition-colors
                                                    ${activeCategory?.id === category.id
                                                        ? 'text-[var(--colour-fsP2)] font-semibold'
                                                        : 'text-slate-600 group-hover:text-[var(--colour-fsP2)]'}
                                                `}>
                                                    {category.title}
                                                </span>
                                            </div>
                                            {activeCategory?.id === category.id && (
                                                <ChevronRight className="h-4 w-4 text-[var(--colour-fsP2)]" />
                                            )}
                                        </div>
                                    ))}
                                </div>

                                {/* Main Content Area */}
                                <div className="flex-1 bg-slate-200 flex flex-col">
                                    {activeCategory && (
                                        <div className="flex-1 flex flex-col h-full animate-in fade-in duration-300">

                                            {/* Top Section: Categories & Quick Links */}
                                            <div className="flex-1 p-8 flex gap-10 min-h-0 overflow-hidden">

                                                {/* Left: Sub-Categories */}
                                                <div className="flex-1 overflow-y-auto pr-2 [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-slate-200 hover:[&::-webkit-scrollbar-thumb]:bg-slate-300">
                                                    <div className="flex items-center justify-between mb-6">
                                                        <h2
                                                            onClick={() => handlerouter(activeCategory.slug)}
                                                            className="text-xl font-bold text-slate-800 flex items-center gap-2 cursor-pointer hover:text-[var(--colour-fsP2)] transition-colors"
                                                        >
                                                            {activeCategory.title}
                                                            <ChevronRight className="h-5 w-5 text-gray-300" />
                                                        </h2>
                                                    </div>

                                                    <div className="grid grid-cols-2 gap-x-6 gap-y-3">
                                                        {activeCategory.children && activeCategory.children.length > 0 ? (
                                                            activeCategory.children.map((child, idx) => (
                                                                <span
                                                                    key={idx}
                                                                    onClick={() => handlerouter(child.slug)}
                                                                    className="text-[13px] font-medium text-slate-600 hover:text-[var(--colour-fsP2)] hover:translate-x-1 transition-all cursor-pointer block py-1"
                                                                >
                                                                    {child.title}
                                                                </span>
                                                            ))
                                                        ) : (
                                                            <span className="text-sm text-slate-400 italic col-span-2">No sub-categories available</span>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Right: Price Range */}
                                                <div className="w-[260px] h-full flex flex-col gap-8 border-l border-slate-100 pl-8">

                                                    {/* Price Range */}
                                                    <div className="space-y-4">
                                                        <h3 className="text-xs font-bold text-[#1967b3] uppercase tracking-widest flex items-center gap-2">
                                                            Price Range
                                                        </h3>
                                                        <div className="flex flex-col gap-2">
                                                            {mockPriceRanges.map((range, idx) => (
                                                                <span
                                                                    key={idx}
                                                                    className="text-xs font-medium text-slate-600 bg-slate-100 hover:bg-[var(--colour-fsP2)] hover:text-white transition-all cursor-pointer rounded-md px-3 py-2.5 border border-slate-100 hover:border-transparent text-center"
                                                                >
                                                                    {range}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Bottom Section: Top Brands */}
                                            <div className="border-t border-slate-100 p-6 bg-slate-100/50">
                                                <div className="flex items-center gap-2 mb-4">
                                                    <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Top Brands</span>
                                                    <div className="h-[1px] flex-1 bg-slate-200"></div>
                                                </div>
                                                <div className="grid grid-cols-8 gap-4">
                                                    {mockBrandLogos.map((brand, idx) => (
                                                        <div
                                                            key={idx}
                                                            className="group flex flex-col items-center justify-center gap-2 p-2 bg-white rounded-lg border border-slate-100 hover:border-[var(--colour-fsP2)]/30 hover:shadow-md transition-all cursor-pointer h-16"
                                                        >
                                                            {/* Placeholder for actual brand logo - using stylized text for "face data" */}
                                                            <span className={`text-sm font-black ${brand.color} group-hover:scale-110 transition-transform`}>
                                                                {brand.name.substring(0, 1)}
                                                            </span>
                                                            <span className="text-[10px] font-medium text-slate-600 uppercase tracking-wide group-hover:text-slate-800">
                                                                {brand.name}
                                                            </span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </HoverCardContent>
                    </HoverCard>

                    {/* Quick Horizontal Links (Optional - showing first few items as quick access if needed, or just keeping Explore) */}
                    <div className="flex items-center ml-6 gap-6">
                        {navbaritems.slice(0, 5).map((item, idx) => (
                            <span
                                key={idx}
                                onClick={() => handlerouter(item.slug)}
                                className="text-sm font-medium text-white/90 hover:text-white cursor-pointer transition-colors"
                            >
                                {item.title}
                            </span>
                        ))}
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default NavBar;