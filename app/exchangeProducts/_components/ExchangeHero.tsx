'use client'

import React from 'react'
import { RefreshCw, ArrowRight } from 'lucide-react'
import Image from 'next/image'
import logoImg from '@/public/imgfile/logoimg.png'

const POPULAR_BRANDS = ['Samsung', 'Apple', 'Xiaomi', 'OnePlus', 'Oppo', 'Vivo', 'Realme', 'Nokia']
const TRUST_STATS = [
    { value: '10,000+', label: 'Devices exchanged' },
    { value: '4.8★', label: 'Customer rating' },
    { value: '2 hrs', label: 'Avg pickup time' },
    { value: '100%', label: 'Free pickup' },
]

interface ExchangeHeroProps {
    onWizardClick: () => void
    onCatalogClick: () => void
}

export default function ExchangeHero({ onWizardClick, onCatalogClick }: ExchangeHeroProps) {
    return (
        <section className="bg-white border-b border-gray-100">
            <div className="mx-auto px-4 lg:px-8 max-w-7xl py-10 md:py-14">
                <div className="flex flex-col md:flex-row items-center gap-10 md:gap-14">

                    {/* Left Content */}
                    <div className="flex-1 space-y-5 text-center md:text-left">
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-widest border" style={{ color: 'var(--colour-fsP2)', borderColor: '#C7D9F5', background: '#EEF3FB' }}>
                            <RefreshCw style={{ width: 10, height: 10 }} /> Mobile Exchange Program
                        </div>

                        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-gray-900 leading-[1.15] tracking-tight">
                            Exchange your old phone.<br />
                            <span style={{ color: 'var(--colour-fsP2)' }}>Get instant value.</span>
                        </h1>

                        <p className="text-gray-500 text-base max-w-lg mx-auto md:mx-0 leading-relaxed font-medium">
                            Trade in your old smartphone and get the best market value applied directly towards your new device. Free doorstep pickup across Nepal — no hassle, no hidden charges.
                        </p>

                        {/* Trust stats */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-lg mx-auto md:mx-0">
                            {TRUST_STATS.map((s, i) => (
                                <div key={i} className="bg-[#F5F7FA] rounded-xl p-3 text-center border border-gray-100">
                                    <p className="text-lg font-extrabold text-gray-900">{s.value}</p>
                                    <p className="text-[11px] text-gray-400 font-bold mt-0.5 leading-tight">{s.label}</p>
                                </div>
                            ))}
                        </div>

                        <div className="flex flex-col sm:flex-row gap-3 justify-center md:justify-start">
                            <button
                                onClick={onWizardClick}
                                className="h-11 px-6 rounded-xl text-white text-sm font-bold cursor-pointer transition-opacity hover:opacity-90 flex items-center justify-center gap-2"
                                style={{ background: 'var(--colour-fsP2)' }}
                            >
                                Look for exchange product <ArrowRight style={{ width: 14, height: 14 }} />
                            </button>
                            <button
                                onClick={onCatalogClick}
                                className="h-11 px-6 rounded-xl text-sm font-bold border border-gray-200 bg-white text-gray-700 cursor-pointer hover:bg-gray-50 transition-colors"
                            >
                                View all categories
                            </button>
                        </div>
                    </div>

                    {/* Right Image Content */}
                    <div className="shrink-0 flex flex-col items-center gap-5">
                        <div className="relative w-[200px] h-[200px] md:w-[240px] md:h-[240px]">
                            <div className="absolute inset-0 rounded-full" style={{ background: '#EEF3FB' }} />
                            <Image
                                src={logoImg}
                                alt="Mobile Exchange Nepal — Fatafat Sewa"
                                fill
                                className="object-contain relative z-10 drop-shadow-xl p-6"
                                sizes="240px"
                                priority
                            />
                        </div>

                        {/* Popular brands strip */}
                        <div className="text-center">
                            <p className="text-[11px] font-bold uppercase tracking-widest text-gray-400 mb-2">Popular brands we accept</p>
                            <div className="flex flex-wrap justify-center gap-1.5">
                                {POPULAR_BRANDS.map(b => (
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
