import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
    Smartphone, Laptop, Tablet, Volume2, Plug, Send,
    Calculator, ShoppingBag, FileText, CreditCard,
    Wrench, RefreshCcw, SlidersHorizontal,
    Phone, Mail, MessageCircle, Bot,
    Newspaper, BookOpen, Tag, Lightbulb, Zap,
    ChevronRight, MapPin, ArrowRight,
} from 'lucide-react';

const categories = [
    { label: 'Smartphones', slug: 'mobile-price-in-nepal', Icon: Smartphone },
    { label: 'Laptops & Mac', slug: 'laptop-price-in-nepal', Icon: Laptop },
    { label: 'Tablets & iPad', slug: 'tablet-price-in-nepal', Icon: Tablet },
    { label: 'Speakers', slug: 'speaker-price-in-nepal', Icon: Volume2 },
    { label: 'Accessories', slug: 'accessories-price-in-nepal', Icon: Plug },
    { label: 'Drones', slug: 'drone-price-in-nepal', Icon: Send },
];

const emiLinks = [
    { label: 'EMI Calculator', sub: 'Know your limit before you apply', href: '/emi', Icon: Calculator },
    { label: 'Shop by EMI', sub: 'Products sorted by monthly price', href: '/emi/shop', Icon: ShoppingBag },
    { label: 'Apply for EMI', sub: 'Paperless — takes under 5 minutes', href: '/emi/apply/slug', Icon: FileText },

];

const serviceLinks = [
    { label: 'Device Repair', sub: 'Genuine parts · 30-day warranty', href: '/repair', Icon: Wrench },
    { label: 'Phone Exchange', sub: 'Get top value for your old device', href: '/exchangeProducts', Icon: RefreshCcw },
    { label: 'Compare Products', sub: 'Pick the right one, confidently', href: '/compare', Icon: SlidersHorizontal },
];

const blogLinks = [
    { label: 'Phone Reviews', Icon: Smartphone, href: '/blogs?category=tech-reviews' },
    { label: 'Buying Guides', Icon: BookOpen, href: '/blogs?category=buying-guide' },
    { label: 'EMI Tips & Guide', Icon: Tag, href: '/blogs?category=emi-guide' },
    { label: 'Mobile Tips', Icon: Lightbulb, href: '/blogs?category=mobile-tips' },
    { label: 'Deals & Offers', Icon: Zap, href: '/blogs?category=deals' },
    { label: 'News & Updates', Icon: Newspaper, href: '/blogs?category=news' },
];





export default function AboutQuickLinks() {
    return (
        <section className="py-12 bg-white border-t border-slate-100">
            <div className="w-full max-w-7xl mx-auto px-4 md:px-6">

                <div className="text-center mb-10">
                    <p className="text-xs font-bold uppercase tracking-widest text-(--colour-fsP1) mb-3">One Platform, Everything You Need</p>
                    <h2 className="text-3xl md:text-4xl font-bold text-slate-900 font-heading mb-3">
                        Explore Fatafatsewa
                    </h2>
                    <p className="text-slate-500 text-base max-w-lg mx-auto font-poppins">
                        Shop on EMI, read expert reviews, get repairs, or talk to our AI — all from Nepal's most trusted electronics platform.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">

                    {/* ── Panel 1: Product Categories ── */}
                    <div className="border border-slate-200 p-5 flex flex-col">
                        <p className="text-[11px] font-bold uppercase tracking-widest text-(--colour-fsP1) mb-4">Top Category</p>

                        <div className="grid grid-cols-2 gap-2 flex-1">
                            {categories.map(({ label, slug, Icon }) => (
                                <Link
                                    key={slug}
                                    href={`/category/${slug}`}
                                    className="flex flex-col items-center justify-center gap-2 p-3 rounded-xl border border-slate-100 hover:border-(--colour-fsP1) hover:bg-orange-50 transition-colors text-center group"
                                >
                                    <div className="w-8 h-8 rounded-xl bg-slate-50 group-hover:bg-orange-100 flex items-center justify-center transition-colors">
                                        <Icon className="w-4 h-4 text-slate-400 group-hover:text-(--colour-fsP1) transition-colors" strokeWidth={1.5} />
                                    </div>
                                    <span className="text-[11px] font-semibold text-slate-600 group-hover:text-(--colour-fsP1) leading-tight transition-colors">{label}</span>
                                </Link>
                            ))}
                        </div>

                        <Link
                            href="/emi/shop"
                            className="mt-4 flex items-center justify-between text-xs font-bold text-(--colour-fsP2) hover:underline pt-3 border-t border-slate-100 cursor-pointer"
                        >
                            View All Categories <ChevronRight className="w-3.5 h-3.5" />
                        </Link>
                    </div>

                    {/* ── Panel 2: EMI Hub + Services ── */}
                    <div className="border border-slate-200 p-5 flex flex-col">
                        <p className="text-[11px] font-bold uppercase tracking-widest text-(--colour-fsP1) mb-3">EMI Hub</p>

                        <div className="space-y-1 flex-1">
                            {emiLinks.map(({ label, sub, href, Icon }) => (
                                <Link
                                    key={href}
                                    href={href}
                                    className="flex items-center gap-3 p-2 rounded-xl hover:bg-orange-50 transition-colors group"
                                >
                                    <div className="w-8 h-8 rounded-xl bg-orange-50 flex items-center justify-center shrink-0 group-hover:bg-orange-100 transition-colors">
                                        <Icon className="w-4 h-4 text-(--colour-fsP1)" strokeWidth={1.75} />
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-sm font-semibold text-slate-800 group-hover:text-(--colour-fsP1) transition-colors leading-tight">{label}</p>
                                        <p className="text-[11px] text-slate-400 leading-tight mt-0.5">{sub}</p>
                                    </div>
                                    <ChevronRight className="w-3.5 h-3.5 text-slate-200 ml-auto shrink-0 group-hover:text-(--colour-fsP1) transition-colors" />
                                </Link>
                            ))}
                        </div>

                        <div className="my-3 border-t border-slate-100" />
                        <p className="text-[11px] font-bold uppercase tracking-widest text-(--colour-fsP2) mb-2">After-Sales Services</p>

                        <div className="space-y-1">
                            {serviceLinks.map(({ label, sub, href, Icon }) => (
                                <Link
                                    key={href}
                                    href={href}
                                    className="flex items-center gap-3 p-2 rounded-xl hover:bg-blue-50 transition-colors group"
                                >
                                    <div className="w-8 h-8 rounded-xl bg-blue-50 flex items-center justify-center shrink-0 group-hover:bg-blue-100 transition-colors">
                                        <Icon className="w-4 h-4 text-(--colour-fsP2)" strokeWidth={1.75} />
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-sm font-semibold text-slate-800 group-hover:text-(--colour-fsP2) transition-colors leading-tight">{label}</p>
                                        <p className="text-[11px] text-slate-400 leading-tight mt-0.5">{sub}</p>
                                    </div>
                                    <ChevronRight className="w-3.5 h-3.5 text-slate-200 ml-auto shrink-0 group-hover:text-(--colour-fsP2) transition-colors" />
                                </Link>
                            ))}
                        </div>
                    </div>

                    {/* ── Panel 3: Blog & Content ── */}
                    <div className="border border-slate-200 p-5 flex flex-col">
                        <p className="text-[11px] font-bold uppercase tracking-widest text-(--colour-fsP1) mb-4">Read & Learn</p>

                        <div className="space-y-0.5 flex-1">
                            {blogLinks.map(({ label, Icon, href }) => (
                                <Link
                                    key={href}
                                    href={href}
                                    className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-slate-50 transition-colors group"
                                >
                                    <div className="w-7 h-7 rounded-xl bg-slate-50 flex items-center justify-center shrink-0 group-hover:bg-orange-50 transition-colors">
                                        <Icon className="w-3.5 h-3.5 text-slate-400 group-hover:text-(--colour-fsP1) transition-colors" strokeWidth={1.5} />
                                    </div>
                                    <span className="text-sm font-medium text-slate-700 group-hover:text-(--colour-fsP1) transition-colors flex-1">{label}</span>
                                    <ChevronRight className="w-3 h-3 text-slate-200 ml-auto group-hover:text-(--colour-fsP1) transition-colors" />
                                </Link>
                            ))}
                        </div>

                        <Link
                            href="/blogs"
                            className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-(--colour-fsP2) hover:underline"
                        >
                            Browse All Articles <ChevronRight className="w-3.5 h-3.5" />
                        </Link>
                    </div>

                </div>

                {/* ── Chatbot strip ── */}
                <div className="border border-slate-200 p-5 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <div className="w-11 h-11 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center shrink-0">
                            <Bot className="w-5 h-5 text-(--colour-fsP2)" strokeWidth={1.5} />
                        </div>
                        <div>
                            <h3 className="text-sm font-bold text-slate-900 mb-0.5">Have questions? Talk to Fatafat AI</h3>
                            <p className="text-[13px] text-slate-500 font-poppins">
                                Ask about any product, EMI limit, delivery time, or repair status — instant answers, 24 / 7.
                            </p>
                        </div>
                    </div>
                    <Link
                        href="/chatbot"
                        className="shrink-0 flex items-center gap-2 px-5 py-2.5 rounded-xl bg-(--colour-fsP2) text-white text-sm font-bold hover:bg-blue-700 transition-colors"
                    >
                        Open Chatbot <ArrowRight className="w-4 h-4" />
                    </Link>
                </div>

            </div>
        </section>
    );
}
