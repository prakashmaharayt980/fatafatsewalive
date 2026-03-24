




'use client'
import React, { useState, useEffect, useMemo } from 'react';
import { ChevronDown, ChevronRight, Telescope, HelpCircle, Calculator, Star, BookOpen, ArrowLeftRight, Info, Wrench, BookCopy, ShoppingBag } from 'lucide-react';
import Link from 'next/link';
import {
    HoverCard,
    HoverCardContent,
    HoverCardTrigger,
} from "@/components/ui/hover-card";

import type { NavbarItem } from '../context/navbar.interface';

import Image from 'next/image';
import { placeholderimg } from '../CommonVue/Image';


const generatePriceRanges = (min: number | null | undefined, max: number | null | undefined) => {
    if (!max || max <= 0) return [];
    const safeMin = min && min > 0 ? min : 0;
    const ranges: string[] = [];
    if (safeMin > 0) ranges.push(`Price above ${safeMin.toLocaleString()}`);
    const remaining = 5 - ranges.length;
    const step = Math.ceil((max - safeMin) / remaining);
    for (let i = 0; i < remaining; i++) {
        const start = safeMin + i * step;
        const end = i === remaining - 1 ? max : safeMin + (i + 1) * step;
        ranges.push(`Price below ${end.toLocaleString()}`);
    }
    return ranges;
};




export interface navitemsExtra {
    path: string;
    title: string;
    icon: React.ReactNode | null;
}

export const navbarExtradata: navitemsExtra[] = [
    {
        path: '/emi',
        title: 'EMI',
        icon: <Calculator className="h-3.5 w-3.5" />,
    },

    {
        path: '/blogs',
        title: 'Blogs',
        icon: <BookOpen className="h-3.5 w-3.5" />,
    },
    {
        path: '/exchangeProducts',
        title: 'Exchange',
        icon: <ArrowLeftRight className="h-3.5 w-3.5" />,
    },
    {
        path: '/about-us',
        title: 'About',
        icon: <Info className="h-3.5 w-3.5" />,
    },
    {
        path: '/Insurance',
        title: 'Insurance',
        icon: <BookCopy className="h-3.5 w-3.5" />,
    },
    {
        path: '/EarnInvestReferral',
        title: 'Earn & Invest',
        icon: <Star className="h-3.5 w-3.5" />,
    },
    {
        path: '/emi/shop',
        title: 'Shop by EMI',
        icon: <ShoppingBag className="h-3.5 w-3.5" />,
    },

    {
        path: '/repair',
        title: 'Repair',
        icon: <Wrench className="h-3.5 w-3.5" />,
    },
    {
        path: '/help',
        title: 'Help',
        icon: <HelpCircle className="h-3.5 w-3.5" />,
    }
]



const NavBar = ({ navbaritems }: {
    navbaritems: NavbarItem[];
}) => {
    const [activeCategory, setActiveCategory] = useState<NavbarItem | null>(null);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    const closeDropdown = () => {
        setIsDropdownOpen(false);
        setActiveCategory(null);
    };

    // Set initial active category when navbaritems load
    useEffect(() => {
        if (navbaritems && navbaritems.length > 0) {
            setActiveCategory(navbaritems[0]);
        }
    }, [navbaritems]);



    if (!navbaritems?.length) return null;

    const priceRanges = useMemo(() => {
        return generatePriceRanges(activeCategory?.price_range?.min, activeCategory?.price_range?.max);
    }, [activeCategory]);

    const uniqueBrands = useMemo(() => {
        return activeCategory?.brands
            ? Array.from(new Map(activeCategory.brands.map(b => [b.name, b])).values())
            : [];
    }, [activeCategory]);

    return (
        <nav className="relative shadow-md hidden md:block border-t border-white/10 overflow-hidden">
            {/* Blue base */}
            <div className="absolute inset-0 bg-[var(--colour-fsP2)]" />
            {/* Yellow diagonal slice — starts right after Explore button */}
            <div className="absolute inset-0 bg-[var(--colour-fsP1)]" style={{ clipPath: 'polygon(24% 0%, 100% 0%, 100% 100%, 22% 100%)' }} />
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                <div className="flex items-center h-12">
                    {/* Explore Menu Trigger */}
                    <HoverCard openDelay={0} closeDelay={100} open={isDropdownOpen} onOpenChange={(open) => {
                        setIsDropdownOpen(open);
                        if (open && navbaritems?.length) setActiveCategory(navbaritems[0]);
                    }}>
                        <HoverCardTrigger asChild>
                            <button className="flex items-center gap-2 px-4 py-1.5 bg-white/20 hover:bg-white/30 text-[#1a1a1a] font-medium rounded-full transition-all duration-300 h-9 cursor-pointer border border-white/30 shadow-xs hover:shadow-sm active:scale-95 group">
                                <div className="flex items-center gap-2">
                                    <Telescope className="h-4 w-4 opacity-90 group-hover:opacity-100 transition-all text-[#1a1a1a] group-hover:text-white" />   <span className="text-[12px] font-bold transition-colors text-[#1a1a1a] group-hover:text-white">Explore</span>
                                </div>
                                <ChevronDown className="h-4 w-4 opacity-90 group-hover:opacity-100 transition-all text-[#1a1a1a] group-hover:text-white" />
                            </button>
                        </HoverCardTrigger>
                        {/* Sidebar Categories */}
                        <HoverCardContent
                            className="w-[950px]  p-0 border-0 shadow-xl bg-white rounded-xl overflow-hidden mt-1"
                            align="start"
                            sideOffset={4}
                        >
                            <div className="flex h-[520px]">

                                <div className="w-[220px] shrink-0 bg-white border-r  border-blue-50 overflow-y-auto py-2 [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-blue-100 hover:[&::-webkit-scrollbar-thumb]:bg-blue-200">
                                    {navbaritems.map((category) => (
                                        <div
                                            key={category.id}
                                            onMouseEnter={() => setActiveCategory(category)}
                                            className={`
                                                flex items-center justify-between px-2 py-2.5 transition-all mx-1 rounded-lg group mb-1
                                                ${activeCategory?.id === category.id
                                                    ? 'bg-blue-50  ring-1 ring-blue-100'
                                                    : 'hover:bg-blue-50/50 '}
                                            `}
                                        >
                                            <Link href={`/category/${category.slug}`} onClick={closeDropdown} className="flex items-center gap-3 w-full">
                                                <div className={`
                                                    p-1.5 rounded-md h-8  transition-colors overflow-hidden
                                                    ${activeCategory?.id === category.id
                                                        ? 'bg-white'
                                                        : 'bg-gray-50 group-hover:bg-white'}
                                                `}>
                                                    <Image
                                                        src={category.thumb?.url || placeholderimg}
                                                        alt={category.title}
                                                        width={20}
                                                        height={20}
                                                        className="object-contain aspect-auto"



                                                    />
                                                </div>
                                                <span className={`
                                                    text-sm break-after-avoid font-medium transition-colors
                                                    ${activeCategory?.id === category.id
                                                        ? 'text-[var(--colour-fsP2)] font-semibold'
                                                        : 'text-slate-600 group-hover:text-[var(--colour-fsP2)]'}
                                                `}>
                                                    {category.title}
                                                </span>
                                            </Link>
                                            {activeCategory?.id === category.id && (
                                                <ChevronRight className="h-4 w-4 text-[var(--colour-fsP2)]" />
                                            )}
                                        </div>
                                    ))}
                                </div>

                                {/* Main Content Area */}
                                <div className="flex-1 bg-white flex flex-col min-w-0">
                                    {activeCategory && (
                                        <div className="flex-1 flex flex-col h-full animate-in fade-in duration-200">

                                            {/* Content: Sub-Categories + Price Range */}
                                            <div className="flex-1 flex min-h-0 border-none">

                                                {/* Left: Sub-Categories */}
                                                <div className="flex-1 p-6 overflow-y-auto min-w-0 [&::-webkit-scrollbar]:w-0.5 [&::-webkit-scrollbar-thumb]:bg-slate-200">
                                                    <Link href={`/category/${activeCategory.slug}`} onClick={closeDropdown}>
                                                        <h2 className="text-lg font-bold text-black mb-5 flex items-center gap-1.5 hover:text-[var(--colour-fsP2)] transition-colors">
                                                            {activeCategory.title}
                                                            <ChevronRight className="h-4 w-4 text-slate-300" />
                                                        </h2>
                                                    </Link>
                                                    <div className="grid grid-cols-2 gap-x-3 gap-y-1">
                                                        {activeCategory.children?.length ? activeCategory.children.map((child, i) => (
                                                            <Link key={i} href={`/category/${activeCategory.slug}?sub_category=${child.slug}`}
                                                                onClick={closeDropdown}
                                                                className="flex items-center gap-2 text-[13px] text-slate-600 hover:text-[var(--colour-fsP2)] py-1.5 transition-colors group/link overflow-hidden">
                                                                <span className="w-1 h-1 rounded-full bg-slate-300 group-hover/link:bg-(--colour-fsP2) shrink-0 transition-colors" />
                                                                <span className="truncate">{child.name || child.title}</span>
                                                            </Link>
                                                        )) : (
                                                            <span className="text-sm text-slate-400 italic col-span-2">No sub-categories</span>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Right: Price Range */}
                                                <div className="w-[250px] shrink-0 border-l mt-8 border-slate-100 p-6">
                                                    <h3 className="text-[11px] font-bold text-black uppercase tracking-widest mb-4">Price Range</h3>
                                                    <div className="flex flex-col gap-1.5">
                                                        {priceRanges.map((range, i) => (
                                                            <span key={i} className="text-xs text-slate-600 bg-slate-50 hover:bg-[var(--colour-fsP2)] hover:text-white rounded-md px-3 py-2 border border-slate-100 hover:border-transparent text-center cursor-pointer transition-all whitespace-nowrap">
                                                                {range}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Bottom: Top Brands */}
                                            {uniqueBrands.length > 0 && (
                                                <div className="border-none px-2 py-2 bg-blue-50/30 overflow-hidden">
                                                    <div className="flex items-center gap-2 mb-3">
                                                        <div className="h-px flex-1 bg-[var(--colour-fsP2)]" />
                                                        <span className="text-[12px] font-bold text-black uppercase tracking-widest shrink-0">Top Brands</span>
                                                        <div className="h-px flex-1 bg-[var(--colour-fsP2)]" />
                                                    </div>
                                                    <div className="flex gap-3 overflow-x-auto min-w-0 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                                                        {uniqueBrands.map((brand, i) => (
                                                            <Link key={i} href={`/category/${activeCategory.slug}?brand=${brand.slug}`}
                                                                title={brand.name}
                                                                onClick={closeDropdown}
                                                                className="flex items-center gap-2 px-4 py-2 h-12 bg-white border-2 border-blue-100  hover:shadow-sm rounded-lg text-sm text-slate-700 hover:text-[var(--colour-fsP2)] shrink-0 transition-all">
                                                                {brand.thumb?.url ? (
                                                                    <Image src={brand.thumb.url || placeholderimg} alt={brand.name} width={24} height={20} className="object-contain"
                                                                    />
                                                                ) : (
                                                                    <span className="w-6 h-6 rounded bg-blue-50 flex items-center justify-center text-xs font-bold text-blue-600">{brand.name[0]}</span>
                                                                )}
                                                                <span className="font-bold whitespace-nowrap">{brand.name}</span>
                                                            </Link>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </HoverCardContent>
                    </HoverCard>

                    {/* Quick Horizontal Links (Optional - showing first few items as quick access if needed, or just keeping Explore) */}
                    <div className="flex items-center ml-6 gap-6">



                        {navbarExtradata.map((item, idx) => (
                            <Link
                                key={idx}
                                href={item.path}
                                className="text-sm font-bold text-[#1a1a1a] hover:text-white transition-colors flex items-center gap-1"
                            >
                                {item.icon && item.icon}
                                {item.title}
                            </Link>
                        ))}
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default React.memo(NavBar);