'use client'

import { Suspense, useState, useEffect } from 'react'
import { Check, ChevronRight, ArrowRight, Home, PackageCheck, Truck, Smartphone, FileText, MapPin, Hash, AlertTriangle, HelpCircle, Phone, User, Camera } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import Image from 'next/image'
import { useSearchParams } from 'next/navigation'

const NEXT_STEPS = [
    {
        icon: Truck,
        title: 'Our Team Will Contact You',
        desc: "We'll call within 24-48 hrs to schedule a convenient pickup time at your address.",
        color: 'bg-blue-50 text-[var(--colour-fsP2)]',
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
        desc: 'Once inspection is passed, your exchange credit is instantly added to your account.',
        color: 'bg-emerald-50 text-emerald-600',
    },
]

function SuccessPageContent() {
    const searchParams = useSearchParams()
    const [devicePhoto, setDevicePhoto] = useState('')

    useEffect(() => {
        try {
            const stored = sessionStorage.getItem('exchangeDevicePhoto')
            if (stored) setDevicePhoto(stored)
        } catch {}
    }, [])

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
        pickup: searchParams.get('pickup') || 'No',
        problems: searchParams.get('problems') || '',
        reason: searchParams.get('reason') || '',
        contactName: searchParams.get('contactName') || '',
        contactPhone: searchParams.get('contactPhone') || '',
    }

    const estimated = Number(p.value)

    return (
        <main className="min-h-screen bg-[#F5F7FA] pb-12">
            <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">

                {/* Breadcrumb */}
                <nav className="flex items-center gap-1.5 text-[11px] mb-8 text-gray-400">
                    <Link href="/" className="hover:text-gray-700 font-bold uppercase tracking-wider transition-colors">Home</Link>
                    <ChevronRight size={10} strokeWidth={3} />
                    <Link href="/exchangeProducts" className="hover:text-gray-700 font-bold uppercase tracking-wider transition-colors">Exchange</Link>
                    <ChevronRight size={10} strokeWidth={3} />
                    <span className="text-[var(--colour-fsP2)] font-bold uppercase tracking-wider">Success</span>
                </nav>

                {/* Success Banner */}
                <div className="bg-gradient-to-br from-[var(--colour-fsP2)] to-[var(--colour-fsP2)] rounded-[2rem] p-8 sm:p-10 text-center text-white mb-6 relative overflow-hidden shadow-2xl">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/4" />
                    <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/4" />
                    <div className="relative z-10">
                        <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4 backdrop-blur-md shadow-inner border border-white/20">
                            <Check size={28} className="text-white" strokeWidth={3} />
                        </div>
                        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/70 mb-2">Application Received</p>
                        <h1 className="text-2xl sm:text-3xl font-black mb-2 tracking-tight">Great news, {p.name}!</h1>
                        <p className="text-white/80 text-sm font-medium mb-6">Your device exchange value has been estimated successfully.</p>
                        <div className="inline-block bg-white/10 border border-white/20 rounded-2xl px-8 py-4 backdrop-blur-md">
                            <p className="text-[10px] font-black uppercase tracking-widest text-white/70 mb-1">Estimated Value</p>
                            <p className="text-4xl sm:text-5xl font-black tracking-tighter">Rs. {estimated.toLocaleString()}</p>
                            <p className="text-[10px] text-white/60 mt-2 font-bold uppercase tracking-widest bg-white/10 py-1 px-3 rounded-full inline-block">Subject to physical verification</p>
                        </div>
                    </div>
                </div>

                {/* Application Details Card */}
                <div className="bg-white rounded-[2rem] border border-gray-100 overflow-hidden shadow-sm mb-6">
                    <div className="px-6 py-4 border-b border-gray-50 flex items-center justify-between bg-gray-50/30">
                        <div className="flex items-center gap-2.5">
                            <FileText size={15} className="text-[var(--colour-fsP2)]" />
                            <h2 className="text-[11px] font-black uppercase tracking-[0.15em] text-gray-800">Exchange Summary</h2>
                        </div>
                        <div className="bg-emerald-100/50 px-2.5 py-1 rounded-full flex items-center gap-1.5">
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                            <span className="text-[10px] font-black uppercase text-emerald-700 tracking-wider">Submitted</span>
                        </div>
                    </div>

                    <div className="p-6 sm:p-8">
                        {/* Product row */}
                        <div className="flex flex-col sm:flex-row items-start gap-6 mb-6">
                            {p.image && (
                                <div className="w-20 h-20 rounded-2xl bg-gray-50 border-2 border-gray-100 flex items-center justify-center shrink-0 relative overflow-hidden">
                                    <Image src={p.image} alt={p.device} fill className="object-contain p-2" sizes="80px" />
                                </div>
                            )}
                            <div className="flex-1 min-w-0 pt-1">
                                <h3 className="text-lg sm:text-xl font-black text-gray-900 leading-tight mb-1 line-clamp-2">{p.device}</h3>
                                {p.color && <p className="text-sm text-[var(--colour-fsP2)] font-bold mb-3 uppercase tracking-wider">{p.color} Edition</p>}

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    {p.serial && (
                                        <div className="flex flex-col gap-0.5">
                                            <span className="text-[9px] font-black uppercase tracking-widest text-gray-400">IMEI / Serial</span>
                                            <div className="flex items-center gap-1.5 text-[13px] font-bold text-gray-800">
                                                <Hash size={11} className="text-[var(--colour-fsP2)] shrink-0" />
                                                <span className="truncate">{p.serial}</span>
                                            </div>
                                        </div>
                                    )}
                                    {p.govtId && (
                                        <div className="flex flex-col gap-0.5">
                                            <span className="text-[9px] font-black uppercase tracking-widest text-gray-400">ID Verification</span>
                                            <div className="flex items-center gap-1.5 text-[13px] font-bold text-gray-800">
                                                <FileText size={11} className="text-[var(--colour-fsP2)] shrink-0" />
                                                <span className="truncate">{p.govtId}</span>
                                            </div>
                                        </div>
                                    )}
                                    {(p.contactName || p.contactPhone) && (
                                        <div className="flex flex-col gap-0.5">
                                            <span className="text-[9px] font-black uppercase tracking-widest text-gray-400">Contact</span>
                                            <div className="flex items-center gap-1.5 text-[13px] font-bold text-gray-800">
                                                <User size={11} className="text-[var(--colour-fsP2)] shrink-0" />
                                                {p.contactName}
                                            </div>
                                            {p.contactPhone && (
                                                <div className="flex items-center gap-1.5 text-[12px] text-gray-600 font-medium">
                                                    <Phone size={10} className="text-gray-400 shrink-0" />
                                                    {p.contactPhone}
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Device photo taken by user */}
                        {devicePhoto && (
                            <div className="mb-6 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                                <div className="flex items-center gap-2 mb-3">
                                    <Camera size={13} className="text-[var(--colour-fsP2)]" />
                                    <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">Submitted Device Photo</span>
                                </div>
                                <div className="relative w-full h-40 rounded-xl overflow-hidden border border-gray-200">
                                    <Image src={devicePhoto} alt="Device photo" fill className="object-contain" sizes="100vw" />
                                </div>
                            </div>
                        )}

                        {/* Extra Details Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-6 border-t border-gray-50">
                            <div className="bg-gray-50/50 rounded-2xl p-5 border border-gray-100/50">
                                <div className="flex items-center gap-2.5 mb-3">
                                    <MapPin size={15} className="text-[var(--colour-fsP2)]" />
                                    <span className="text-[10px] font-black uppercase tracking-[0.1em] text-gray-500">Pickup Details</span>
                                </div>
                                <p className="text-[13px] font-bold text-gray-800 mb-1">
                                    {p.pickup === 'Yes' ? 'Doorstep Collection' : 'Walk-in Store Drop'}
                                </p>
                                <p className="text-[11px] text-gray-500 font-medium leading-relaxed italic">{p.address || 'Pickup method selected'}</p>
                            </div>

                            <div className="bg-gray-50/50 rounded-2xl p-5 border border-gray-100/50">
                                <div className="flex items-center gap-2.5 mb-3">
                                    <AlertTriangle size={15} className="text-[#eb5a2c]" />
                                    <span className="text-[10px] font-black uppercase tracking-[0.1em] text-gray-500">Condition Reported</span>
                                </div>
                                <p className="text-[12px] font-bold text-gray-800 leading-relaxed">
                                    {p.problems
                                        ? <span className="text-[#eb5a2c]">{p.problems}</span>
                                        : <span className="text-emerald-600">No major issues reported</span>
                                    }
                                </p>
                                {p.reason && (
                                    <div className="mt-2 flex items-center gap-1.5 opacity-60">
                                        <HelpCircle size={10} />
                                        <span className="text-[10px] font-bold italic">{p.reason}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Timeline Section */}
                <div className="bg-white rounded-[2rem] border border-gray-100 overflow-hidden shadow-sm mb-8">
                    <div className="px-6 py-4 border-b border-gray-50 bg-gray-50/30">
                        <h2 className="text-[11px] font-black uppercase tracking-[0.15em] text-gray-800">Process Timeline</h2>
                    </div>
                    <div className="p-6 sm:p-8 space-y-7">
                        {NEXT_STEPS.map((step, i) => (
                            <div key={i} className="flex gap-5 items-start">
                                <div className="flex flex-col items-center">
                                    <div className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 ${step.color}`}>
                                        <step.icon size={20} strokeWidth={2.5} />
                                    </div>
                                    {i < NEXT_STEPS.length - 1 && (
                                        <div className="w-px h-8 bg-gray-100 my-1" />
                                    )}
                                </div>
                                <div className="flex-1 pt-0.5">
                                    <p className="text-[14px] font-black text-gray-900 mb-1 tracking-tight">{step.title}</p>
                                    <p className="text-[12px] text-gray-500 leading-relaxed font-medium">{step.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col sm:flex-row gap-3">
                    <Link href="/" className="flex-1">
                        <Button variant="outline" className="w-full h-12 font-black uppercase tracking-widest rounded-2xl text-[11px] border-2 border-gray-100 hover:bg-gray-50 transition-all active:scale-95">
                            <Home size={16} className="mr-2" /> Main Menu
                        </Button>
                    </Link>
                    <Link href="/products" className="flex-[2]">
                        <Button className="w-full h-12 font-black uppercase tracking-widest rounded-2xl text-[11px] text-white bg-[var(--colour-fsP2)] hover:opacity-90 shadow-lg transition-all active:scale-95">
                            Continue Shopping <ArrowRight size={16} className="ml-2" />
                        </Button>
                    </Link>
                </div>
            </div>
        </main>
    )
}

export default function ExchangeSuccessPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-[#F5F7FA] flex items-center justify-center">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[var(--colour-fsP2)]" />
            </div>
        }>
            <SuccessPageContent />
        </Suspense>
    )
}
