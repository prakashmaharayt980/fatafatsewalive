'use client'

import React from 'react'
import {
    BadgePercent, Truck, CreditCard, ShieldCheck, Zap,
    Smartphone, Handshake, ArrowRight, Store, TrendingUp
} from 'lucide-react'

const POPULAR_BRANDS = ['Samsung', 'Apple', 'Xiaomi', 'OnePlus', 'Oppo', 'Vivo', 'Realme', 'Nokia']

interface ExchangeSeoSectionsProps {
    onGetQuoteClick: () => void
}

export default function ExchangeSeoSections({ onGetQuoteClick }: ExchangeSeoSectionsProps) {
    return (
        <>
            {/* Why Exchange — Refined Grid */}
            <section className="bg-white border-t border-gray-100 py-16">
                <div className="mx-auto px-4 lg:px-8 max-w-7xl">
                    <div className="text-center mb-12">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-[10px] font-bold text-[var(--colour-fsP2)] uppercase tracking-wider mb-4 border border-blue-100">
                            <ShieldCheck size={12} /> The Fatafat Advantage
                        </div>
                        <h2 className="text-2xl md:text-3xl font-black text-gray-900 mb-3 tracking-tight">
                            Why exchange with Fatafat Sewa?
                        </h2>
                        <p className="text-sm text-gray-500 max-w-2xl mx-auto leading-relaxed">
                            Nepal's premier mobile exchange destination. We offer a transparent, 
                            no-hassle upgrade path with the best market rates guaranteed.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                        {[
                            { icon: BadgePercent, title: 'Top Market Value', desc: 'Real-time valuation based on current demand.' },
                            { icon: Truck, title: 'Doorstep Pickup', desc: 'Free collection from your home or office.' },
                            { icon: CreditCard, title: '0% EMI Option', desc: 'Pay the balance in easy monthly installments.' },
                            { icon: ShieldCheck, title: 'Secure & Wiped', desc: 'Certified data wiping for your old device.' },
                            { icon: Zap, title: 'Instant Credit', desc: 'Get your new phone on the same day.' },
                        ].map((item, i) => (
                            <div
                                key={i}
                                className="group flex flex-col items-center text-center p-6 rounded-2xl border border-gray-100 bg-gray-50/30 hover:bg-white hover:border-[var(--colour-fsP2)]/30 hover:shadow-xl hover:shadow-blue-500/5 transition-all duration-300"
                            >
                                <div className="w-12 h-12 rounded-xl bg-white shadow-sm border border-gray-100 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                                    <item.icon size={20} className="text-[var(--colour-fsP2)]" />
                                </div>
                                <h3 className="text-xs font-black text-gray-900 mb-2 uppercase tracking-wide">{item.title}</h3>
                                <p className="text-[11px] text-gray-500 leading-relaxed font-medium">{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Brands We Accept — Full Width Scrolling Look */}
            <section className="bg-gray-50/50 border-t border-b border-gray-100 py-16 overflow-hidden">
                <div className="mx-auto px-4 lg:px-8 max-w-7xl mb-10">
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                        <div className="max-w-xl">
                            <h2 className="text-2xl font-black text-gray-900 mb-2 tracking-tight uppercase">Brands We Accept</h2>
                            <p className="text-sm text-gray-500 font-medium">All major smartphone brands accepted. Get the highest trade-in value in Nepal regardless of your device's origin.</p>
                        </div>
                        <div className="hidden md:block">
                            <div className="px-4 py-2 rounded-xl bg-[var(--colour-fsP2)] text-white text-[10px] font-bold uppercase tracking-widest shadow-lg shadow-blue-500/20">
                                20+ Brands Supported
                            </div>
                        </div>
                    </div>
                </div>

                {/* Brands Grid — Scrolling 100 Style */}
                <div className="w-full relative px-4">
                    <div className="flex flex-wrap justify-center gap-3">
                        {[...POPULAR_BRANDS, 'Huawei', 'Motorola', 'Sony', 'Google', 'Asus', 'Lenovo', 'Tecno', 'Infinix', 'Itel', 'HMD', 'ZTE', 'Meizu', 'Blackberry'].map(b => (
                            <div
                                key={b}
                                className="px-6 py-3.5 rounded-xl bg-white border border-gray-200 text-xs font-bold text-gray-800 hover:border-[var(--colour-fsP2)] hover:text-[var(--colour-fsP2)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)] transition-all duration-200 cursor-default flex items-center justify-center min-w-[120px]"
                            >
                                {b}
                            </div>
                        ))}
                    </div>
                </div>

                <div className="text-center mt-12">
                    <p className="text-xs text-gray-400 font-medium">
                        Don't see your brand?{' '}
                        <button className="text-[var(--colour-fsP2)] font-black uppercase tracking-tighter hover:underline">
                            Ask our dynamic team
                        </button>
                    </p>
                </div>
            </section>

            {/* How it Works — Clean Modern Steps */}
            <section className="bg-white py-20 relative overflow-hidden">
                <div className="mx-auto px-4 lg:px-8 max-w-7xl relative z-10">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-black text-gray-900 mb-4 tracking-tighter uppercase">How it works</h2>
                        <div className="h-1.5 w-24 bg-[var(--colour-fsP2)] mx-auto rounded-full mb-6"></div>
                        <p className="text-sm text-gray-500 font-medium max-w-xl mx-auto">Simple 4-step professional process to get your new device today.</p>
                    </div>

                    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
                        {[
                            { icon: Smartphone, n: '01', title: 'Instant Quote', desc: 'Assess your device condition online and get a guaranteed price estimate immediately.' },
                            { icon: Truck, n: '02', title: 'Free Pickup', desc: 'Secure a hassle-free doorstep collection at your preferred time, anywhere in the city.' },
                            { icon: ShieldCheck, n: '03', title: 'Verification', desc: 'Our technicians perform a fast onsite check to confirm the final exchange valuation.' },
                            { icon: Handshake, n: '04', title: 'Fast Upgrade', desc: 'Switch to your new phone instantly. Pay the balance via cash or 0% EMI installments.' },
                        ].map((item, i) => (
                            <div key={i} className="group relative">
                                <div className="mb-6 relative">
                                    <div className="w-16 h-16 rounded-2xl bg-white shadow-xl shadow-blue-500/5 flex items-center justify-center border border-gray-100 group-hover:border-[var(--colour-fsP2)]/50 transition-colors duration-300">
                                        <item.icon size={28} className="text-[var(--colour-fsP2)]" />
                                    </div>
                                    <div className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-gray-900 text-white flex items-center justify-center text-[10px] font-black tracking-tighter">
                                        {item.n}
                                    </div>
                                </div>
                                <h4 className="text-sm font-black text-gray-900 mb-3 uppercase tracking-wide">{item.title}</h4>
                                <p className="text-[12px] text-gray-500 leading-relaxed font-medium">{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Banner */}
            <section className="bg-white border-t border-gray-100 py-12">
                <div className="container mx-auto px-4 lg:px-8 max-w-2xl text-center">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-widest border mb-4" style={{ color: 'var(--colour-fsP2)', borderColor: '#C7D9F5', background: '#EEF3FB' }}>
                        <TrendingUp style={{ width: 10, height: 10 }} /> Best exchange rates in Nepal
                    </div>
                    <h2 className="text-2xl font-extrabold text-gray-900 mb-2">Ready to upgrade your smartphone?</h2>
                    <p className="text-gray-500 text-sm mb-7 leading-relaxed">Join 10,000+ customers who've already exchanged their phones with Fatafat Sewa. Get the best trade-in value, free pickup, and instant upgrade.</p>
                    <div className="flex flex-col sm:flex-row justify-center gap-3">
                        <button 
                            className="h-11 px-7 rounded-xl text-white text-sm font-bold cursor-pointer hover:opacity-90 transition-opacity flex items-center justify-center gap-2" 
                            style={{ background: 'var(--colour-fsP2)' }}
                            onClick={onGetQuoteClick}
                        >
                            Get exchange quote <ArrowRight style={{ width: 14, height: 14 }} />
                        </button>
                        <button className="h-11 px-7 rounded-xl text-sm font-bold border border-gray-200 bg-white text-gray-700 cursor-pointer hover:bg-gray-50 transition-colors flex items-center justify-center gap-2">
                            <Store style={{ width: 14, height: 14 }} /> Find showroom
                        </button>
                    </div>
                </div>
            </section>
        </>
    )
}
