'use client'

import React, { Suspense } from 'react'
import { Check, ChevronRight, ArrowRight, Home, PackageCheck, Truck, Smartphone, FileText, MapPin, Hash } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import Image from 'next/image'
import { useSearchParams } from 'next/navigation'
import { logoImg } from '@/app/CommonVue/Image'

const NEXT_STEPS = [
    {
        icon: Truck,
        title: 'Our Team Will Contact You',
        desc: "We'll call within 24-48 hrs to schedule a convenient pickup time at your address.",
        color: 'bg-blue-50 text-blue-600',
    },
    {
        icon: Smartphone,
        title: 'Device Pickup and Inspection',
        desc: 'A certified technician will collect and inspect your device at the pickup location.',
        color: 'bg-violet-50 text-violet-600',
    },
    {
        icon: PackageCheck,
        title: 'Credit Applied to Account',
        desc: 'Once inspection is passed, your exchange credit is instantly added to your Fatafat Sewa account.',
        color: 'bg-emerald-50 text-emerald-600',
    },
]

function SuccessPageContent() {
    const searchParams = useSearchParams()
    const p = {
        name: searchParams.get('name') || 'Customer',
        phone: searchParams.get('phone') || '',
        device: searchParams.get('device') || 'Your Device',
        value: searchParams.get('value') || '0',
        color: searchParams.get('color') || '',
        image: searchParams.get('image') || '',
        address: searchParams.get('address') || '',
        serial: searchParams.get('serial') || '',
        govtId: searchParams.get('govtId') || '',
        pickup: searchParams.get('pickup') || 'doorstep',
    }

    const estimated = Number(p.value)

    return (
        <main className="min-h-screen bg-[#F5F7FA]">
            <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6">

                {/* Breadcrumb */}
                <nav className="flex items-center gap-1.5 text-xs mb-6 text-gray-400">
                    <Link href="/" className="hover:text-gray-700 font-medium transition-colors">Home</Link>
                    <ChevronRight size={12} />
                    <Link href="/exchangeProducts" className="hover:text-gray-700 font-medium transition-colors">Exchange</Link>
                    <ChevronRight size={12} />
                    <span className="text-gray-700 font-semibold">Confirmed</span>
                </nav>

                {/* Success Banner */}
                <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl p-8 text-center text-white mb-5 relative overflow-hidden shadow-xl shadow-emerald-500/20">
                    <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/4" />
                    <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/4" />
                    <div className="relative z-10">
                        <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4 backdrop-blur-sm">
                            <Check size={28} className="text-white" strokeWidth={2.5} />
                        </div>
                        <p className="text-[11px] font-black uppercase tracking-[0.2em] text-emerald-100 mb-2">Exchange Request Submitted</p>
                        <h1 className="text-2xl font-black mb-1">Thank you, {p.name}!</h1>
                        <p className="text-emerald-100 text-sm font-medium mb-5">Your exchange application has been received.</p>
                        <div className="inline-block bg-white/15 border border-white/20 rounded-2xl px-6 py-3 backdrop-blur-sm">
                            <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-100 mb-0.5">Estimated Exchange Value</p>
                            <p className="text-4xl font-black tracking-tighter">Rs. {estimated.toLocaleString()}</p>
                            <p className="text-[10px] text-emerald-200 mt-1">Final value confirmed after inspection</p>
                        </div>
                    </div>
                </div>

                {/* Application Summary */}
                <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm mb-5">
                    <div className="px-5 py-3.5 border-b border-gray-100 flex items-center gap-2">
                        <FileText size={14} style={{ color: 'var(--colour-fsP2)' }} />
                        <h2 className="text-xs font-black uppercase tracking-widest text-gray-700">Application Summary</h2>
                    </div>

                    <div className="p-5 flex items-start gap-4">
                        {p.image && (
                            <div className="w-16 h-16 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center shrink-0 relative overflow-hidden">
                                <Image src={p.image} alt={p.device} fill className="object-contain p-1.5" sizes="64px" onError={() => { }} />
                            </div>
                        )}
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-black text-gray-900 leading-snug mb-0.5 line-clamp-2">{p.device}</p>
                            {p.color && <p className="text-xs text-gray-500 mb-3">{p.color}</p>}
                            <div className="space-y-1.5">
                                {p.serial && (
                                    <div className="flex items-center gap-2 text-xs text-gray-600">
                                        <Hash size={11} className="text-gray-400" />
                                        <span className="font-semibold">{p.serial}</span>
                                    </div>
                                )}
                                {p.govtId && (
                                    <div className="flex items-center gap-2 text-xs text-gray-600">
                                        <FileText size={11} className="text-gray-400" />
                                        <span className="font-semibold">{p.govtId}</span>
                                    </div>
                                )}
                                {p.address && (
                                    <div className="flex items-start gap-2 text-xs text-gray-600">
                                        <MapPin size={11} className="text-gray-400 shrink-0 mt-0.5" />
                                        <span className="font-semibold leading-snug">{p.address}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="mx-5 mb-5 rounded-xl bg-gray-50 border border-gray-100 px-4 py-3 flex items-center justify-between">
                        <div>
                            <p className="text-[9px] font-bold uppercase tracking-widest text-gray-400 mb-0.5">Delivery Mode</p>
                            <p className="text-sm font-black text-gray-900 flex items-center gap-1.5">
                                <Truck size={13} style={{ color: 'var(--colour-fsP2)' }} />
                                {p.pickup === 'doorstep' ? 'Doorstep Pickup' : 'Walk-in Drop-off'}
                            </p>
                        </div>
                        <div className="text-right">
                            <p className="text-[9px] font-bold uppercase tracking-widest text-gray-400 mb-0.5">Est. Value</p>
                            <p className="text-lg font-black" style={{ color: 'var(--colour-fsP2)' }}>Rs. {estimated.toLocaleString()}</p>
                        </div>
                    </div>
                </div>

                {/* What happens next */}
                <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm mb-5">
                    <div className="px-5 py-3.5 border-b border-gray-100">
                        <h2 className="text-xs font-black uppercase tracking-widest text-gray-700">What Happens Next</h2>
                    </div>
                    <div className="p-5 space-y-4">
                        {NEXT_STEPS.map((step, i) => (
                            <div key={i} className="flex gap-3.5 items-start">
                                <div className={cn('w-9 h-9 rounded-xl flex items-center justify-center shrink-0', step.color)}>
                                    <step.icon size={17} />
                                </div>
                                <div className="flex-1 pt-0.5">
                                    <p className="text-sm font-bold text-gray-900 mb-0.5">{step.title}</p>
                                    <p className="text-xs text-gray-500 leading-relaxed">{step.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* CTAs */}
                <div className="flex gap-3">
                    <Link href="/" className="flex-1">
                        <Button variant="outline" className="w-full h-11 font-bold rounded-xl text-sm border-gray-200">
                            <Home size={15} className="mr-1.5" /> Home
                        </Button>
                    </Link>
                    <Link href="/products" className="flex-[2]">
                        <Button className="w-full h-11 font-black rounded-xl text-sm text-white" style={{ background: 'var(--colour-fsP2)' }}>
                            Browse Products <ArrowRight size={14} className="ml-1.5" />
                        </Button>
                    </Link>
                </div>
            </div>
        </main>
    )
}

// cn helper imported inline since this file is standalone
function cn(...classes: (string | boolean | undefined)[]) {
    return classes.filter(Boolean).join(' ')
}

export default function ExchangeSuccessPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-[#F5F7FA] flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--colour-fsP2)]" />
            </div>
        }>
            <SuccessPageContent />
        </Suspense>
    )
}
