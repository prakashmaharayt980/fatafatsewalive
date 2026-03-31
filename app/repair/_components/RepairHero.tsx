'use client'

import React from 'react'
import { Wrench, ArrowRight, ShieldCheck, Clock, Truck, Award } from 'lucide-react'
import Image from 'next/image'
import logoImg from '@/public/imgfile/logoimg.png'

const TRUST_STATS = [
    { icon: <ShieldCheck className="w-4 h-4 text-emerald-500" />, value: '90 Days', label: 'Service Warranty' },
    { icon: <Award className="w-4 h-4 text-blue-500" />, value: 'Certified', label: 'Expert Technicians' },
    { icon: <Clock className="w-4 h-4 text-amber-500" />, value: 'Quick Fix', label: 'Same Day Service' },
    { icon: <Truck className="w-4 h-4 text-purple-500" />, value: 'Free', label: 'Doorstep Pickup' },
]

interface RepairHeroProps {
    onStartClick: () => void
    onCatalogClick: () => void
}

export default function RepairHero({ onStartClick, onCatalogClick }: RepairHeroProps) {
    return (
        <section className="bg-white border-b border-gray-100">
            <div className="mx-auto px-4 lg:px-8 max-w-7xl py-10 md:py-14">
                <div className="flex flex-col md:flex-row items-center gap-10 md:gap-14">

                    {/* Left Content */}
                    <div className="flex-1 space-y-5 text-center md:text-left">
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-widest border" style={{ color: 'var(--colour-fsP2)', borderColor: '#C7D9F5', background: '#EEF3FB' }}>
                            <Wrench style={{ width: 10, height: 10 }} /> Professional Device Repair
                        </div>

                        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-gray-900 leading-[1.15] tracking-tight">
                            Expert repair for your<br />
                            <span style={{ color: 'var(--colour-fsP2)' }}>Mobile & Laptops.</span>
                        </h1>

                        <p className="text-gray-500 text-base max-w-lg mx-auto md:mx-0 leading-relaxed font-medium">
                            Screen cracked? Battery dying? We fix all brands with genuine parts and a 90-day warranty. Free doorstep pickup across Nepal — get your device back like new.
                        </p>

                        {/* Trust stats */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-lg mx-auto md:mx-0">
                            {TRUST_STATS.map((s, i) => (
                                <div key={i} className="bg-[#F5F7FA] rounded-xl p-3 text-center border border-gray-100 flex flex-col items-center">
                                    <div className="mb-1">{s.icon}</div>
                                    <p className="text-sm font-extrabold text-gray-900">{s.value}</p>
                                    <p className="text-[10px] text-gray-400 font-bold mt-0.5 leading-tight">{s.label}</p>
                                </div>
                            ))}
                        </div>

                        <div className="flex flex-col sm:flex-row gap-3 justify-center md:justify-start pt-2">
                            <button
                                onClick={onStartClick}
                                className="h-11 px-6 rounded-xl text-white text-sm font-bold cursor-pointer transition-opacity hover:opacity-90 flex items-center justify-center gap-2"
                                style={{ background: 'var(--colour-fsP2)' }}
                            >
                                Start Repair Request <ArrowRight style={{ width: 14, height: 14 }} />
                            </button>
                            <button
                                onClick={onCatalogClick}
                                className="h-11 px-6 rounded-xl text-sm font-bold border border-gray-200 bg-white text-gray-700 cursor-pointer hover:bg-gray-50 transition-colors"
                            >
                                View common fixes
                            </button>
                        </div>
                    </div>

                    {/* Right Image Content */}
                    <div className="shrink-0 flex flex-col items-center gap-5">
                        <div className="relative w-[200px] h-[200px] md:w-[240px] md:h-[240px]">
                            <div className="absolute inset-0 rounded-full" style={{ background: '#EEF3FB' }} />
                            <Image
                                src={logoImg}
                                alt="Device Repair Nepal — Fatafat Sewa"
                                fill
                                className="object-contain relative z-10 drop-shadow-xl p-6"
                                sizes="240px"
                                priority
                            />
                        </div>

                        <div className="text-center">
                            <p className="text-[11px] font-bold uppercase tracking-widest text-gray-400 mb-2">Brands we repair</p>
                            <div className="flex flex-wrap justify-center gap-1.5 max-w-[280px]">
                                {['Samsung', 'Apple', 'Xiaomi', 'Dell', 'HP', 'Lenovo', 'OnePlus'].map(b => (
                                    <span key={b} className="px-2.5 py-1 rounded-lg bg-white border border-gray-200 text-[11px] font-bold text-gray-600">
                                        {b}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}
