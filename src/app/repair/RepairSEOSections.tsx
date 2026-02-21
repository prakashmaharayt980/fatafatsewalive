'use client'

import React from 'react'
import Link from 'next/link'
import { FileText, Truck, Wrench, Package, MapPin, Phone, Clock } from 'lucide-react'
import { REPAIR_CATEGORIES, REPAIR_SERVICES, CROSS_SELL_ITEMS, PICKUP_LOCATIONS } from './repair-helpers'

export default function RepairSEOSections() {
    return (
        <>
            {/* What We Repair */}
            <section className="container mx-auto px-4 lg:px-8 mb-12 animate-in fade-in duration-500 delay-100">
                <h2 className="text-2xl font-bold text-[var(--colour-text2)] text-center mb-2">What We Repair</h2>
                <p className="text-sm text-gray-500 text-center mb-6 max-w-xl mx-auto">From smartphones to laptops, we fix it all with genuine parts and expert hands.</p>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                    {REPAIR_CATEGORIES.slice(0, 8).map(cat => (
                        <div key={cat.id} className="bg-white rounded-2xl border border-[var(--colour-border3)] p-5 text-center hover:shadow-[var(--shadow-premium-md)] hover:-translate-y-1 transition-all duration-300 group">
                            <div className="w-14 h-14 mx-auto rounded-xl bg-gray-50 flex items-center justify-center mb-3 group-hover:bg-[var(--colour-fsP1)]/10 transition-colors">
                                <span className="text-3xl block group-hover:scale-110 transition-transform">{cat.icon}</span>
                            </div>
                            <h3 className="text-sm font-bold text-[var(--colour-text2)] mb-1 group-hover:text-[var(--colour-fsP1)] transition-colors">{cat.label}</h3>
                            <p className="text-[10px] text-gray-500 leading-relaxed mb-3">{cat.description}</p>
                            <div className="inline-block px-2.5 py-1 bg-gray-50 rounded text-xs font-semibold text-[var(--colour-fsP1)] group-hover:bg-[var(--colour-fsP1)] group-hover:text-white transition-colors">
                                From Rs. {cat.priceRange[0].toLocaleString()}
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* How It Works */}
            <section className="bg-white py-14 mb-12 border-y border-gray-100 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-orange-50 to-transparent rounded-full -translate-y-1/2 translate-x-1/2 opacity-60" />
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-blue-50 to-transparent rounded-full translate-y-1/2 -translate-x-1/2 opacity-60" />

                <div className="container mx-auto px-4 lg:px-8 relative z-10">
                    <h2 className="text-2xl font-bold text-[var(--colour-text2)] text-center mb-10">How It Works</h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 relative">
                        {/* Connecting line for desktop */}
                        <div className="hidden md:block absolute top-[28px] left-[10%] right-[10%] h-0.5 bg-gradient-to-r from-transparent via-gray-200 to-transparent -z-10" />

                        {[
                            { step: 1, icon: <FileText className="h-6 w-6" />, title: 'Submit Request', desc: 'Tell us your device and issue' },
                            { step: 2, icon: <Truck className="h-6 w-6" />, title: 'We Pickup', desc: 'Free collection or drop at store' },
                            { step: 3, icon: <Wrench className="h-6 w-6" />, title: 'Expert Repair', desc: 'Certified techs fix your device' },
                            { step: 4, icon: <Package className="h-6 w-6" />, title: 'Get It Back', desc: 'Delivered with 90-day warranty' },
                        ].map(item => (
                            <div key={item.step} className="text-center group">
                                <div className="w-14 h-14 rounded-2xl bg-white border-2 border-[var(--colour-fsP1)]/20 shadow-sm flex items-center justify-center mx-auto mb-4 text-[var(--colour-fsP1)] group-hover:bg-[var(--colour-fsP1)] group-hover:text-white transition-all duration-300 group-hover:scale-110 group-hover:rotate-3">
                                    {item.icon}
                                </div>
                                <div className="text-[10px] font-bold text-[var(--colour-fsP1)] uppercase tracking-wider mb-1.5 opacity-80">Step {item.step}</div>
                                <h3 className="text-sm font-bold text-[var(--colour-text2)] mb-1 group-hover:text-[var(--colour-fsP1)] transition-colors">{item.title}</h3>
                                <p className="text-[11px] text-gray-500 max-w-[160px] mx-auto leading-relaxed">{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Devices We Service & Also Available */}
            <section className="container mx-auto px-4 lg:px-8 mb-12">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
                    {/* Devices */}
                    <div>
                        <h2 className="text-xl font-bold text-[var(--colour-text2)] mb-5 flex items-center gap-2">
                            <span className="w-6 h-6 rounded bg-[var(--colour-fsP1)]/10 text-[var(--colour-fsP1)] flex items-center justify-center text-sm">📱</span>
                            Devices We Service
                        </h2>
                        <div className="flex flex-col gap-3">
                            {REPAIR_SERVICES.map((svc, i) => (
                                <div key={i} className="bg-white rounded-xl border border-[var(--colour-border3)] p-4 flex items-center gap-4 hover:shadow-md transition-shadow group">
                                    <div className="w-12 h-12 rounded-lg bg-gray-50 flex items-center justify-center shrink-0 group-hover:bg-[var(--colour-fsP1)]/10 transition-colors">
                                        <span className="text-2xl group-hover:scale-110 transition-transform">{svc.icon}</span>
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-bold text-[var(--colour-text2)] mb-0.5 group-hover:text-[var(--colour-fsP1)] transition-colors">{svc.label}</h3>
                                        <p className="text-xs text-gray-500 leading-snug">{svc.description}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Available */}
                    <div>
                        <h2 className="text-xl font-bold text-[var(--colour-text2)] mb-5 flex items-center gap-2">
                            <span className="w-6 h-6 rounded bg-[var(--colour-fsP1)]/10 text-[var(--colour-fsP1)] flex items-center justify-center text-sm">💡</span>
                            Also Available
                        </h2>
                        <div className="flex flex-col gap-3">
                            {CROSS_SELL_ITEMS.map((item, i) => (
                                <Link key={i} href={item.href} className="bg-white rounded-xl border border-[var(--colour-border3)] p-4 flex items-center gap-4 hover:border-[var(--colour-fsP1)]/40 hover:shadow-md transition-all group">
                                    <div className="w-12 h-12 rounded-lg bg-gray-50 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                                        <span className="text-2xl">{item.icon}</span>
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="text-sm font-bold text-[var(--colour-text2)] mb-0.5 group-hover:text-[var(--colour-fsP1)] transition-colors">{item.title}</h3>
                                        <p className="text-xs text-gray-500 leading-snug">{item.description}</p>
                                    </div>
                                    <div className="w-6 h-6 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-[var(--colour-fsP1)] group-hover:text-white transition-colors">
                                        <span className="text-xs">→</span>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* Our Pickup Locations */}
            <section className="bg-white py-14 border-t border-gray-100">
                <div className="container mx-auto px-4 lg:px-8">
                    <h2 className="text-2xl font-bold text-[var(--colour-text2)] text-center mb-2">Our Service Centers</h2>
                    <p className="text-sm text-gray-500 text-center mb-8 max-w-xl mx-auto">Drop off your device at any of our authorized service centers across the valley</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {PICKUP_LOCATIONS.map(loc => (
                            <div key={loc.id} className="bg-[var(--colour-bg4)] rounded-2xl p-5 border border-[var(--colour-border3)] hover:shadow-md hover:-translate-y-1 transition-all duration-300">
                                <div className="w-10 h-10 bg-white rounded-xl shadow-sm border border-gray-100 flex items-center justify-center mb-4">
                                    <MapPin className="h-5 w-5 text-[var(--colour-fsP1)]" />
                                </div>
                                <h3 className="text-sm font-bold text-[var(--colour-text2)] mb-1.5">{loc.name}</h3>
                                <p className="text-xs text-gray-500 mb-4 leading-relaxed h-[36px]">{loc.address}</p>
                                <div className="space-y-2 pt-3 border-t border-gray-200/60">
                                    <p className="text-[11px] text-gray-600 flex items-center gap-2 font-medium">
                                        <Phone className="h-3.5 w-3.5 text-gray-400" /> {loc.phone}
                                    </p>
                                    <p className="text-[11px] text-gray-600 flex items-center gap-2 font-medium">
                                        <Clock className="h-3.5 w-3.5 text-gray-400" /> {loc.hours}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        </>
    )
}
