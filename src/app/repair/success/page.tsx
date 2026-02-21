'use client'

import React, { useState, Suspense } from 'react'
import {
    Check, ChevronRight, ChevronDown, ArrowRight, Home, Wrench, Truck, Package,
    ClipboardCheck, Shield, Clock, MapPin, Phone, Star, AlertTriangle, HelpCircle,
    ShoppingBag, RefreshCw, CreditCard
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import Image from 'next/image'
import { useSearchParams } from 'next/navigation'
import { cn } from '@/lib/utils'
import { PICKUP_LOCATIONS, PICKUP_PARTNERS, CROSS_SELL_ITEMS } from '../repair-helpers'

const STEPS = [
    { label: 'Received', icon: Package },
    { label: 'Pickup', icon: Truck },
    { label: 'Diagnosis', icon: ClipboardCheck },
    { label: 'Repair', icon: Wrench },
    { label: 'Complete', icon: Shield },
]

// Mock diagnosis data
const MOCK_DIAGNOSIS = [
    { part: 'Display Assembly', issue: 'Cracked glass with damaged OLED panel', severity: 'high', action: 'Full replacement needed', cost: 8500, status: 'Needs Replacement' },
    { part: 'Battery Health', issue: '72% maximum capacity - degraded', severity: 'medium', action: 'Battery swap recommended', cost: 2500, status: 'Replace' },
    { part: 'Charging Port', issue: 'Lint and debris causing intermittent connection', severity: 'low', action: 'Deep clean + test', cost: 800, status: 'Clean & Service' },
    { part: 'Internal Components', issue: 'All other components tested and working', severity: 'none', action: 'No action needed', cost: 0, status: 'OK' },
]

const STEP_FAQS: Record<number, { q: string; a: string }[]> = {
    0: [
        { q: 'How long until my repair starts?', a: 'Once we receive your device, diagnosis begins within 2-4 hours. You will be notified of the findings before any repair starts.' },
        { q: 'Can I cancel my repair request?', a: 'Yes, you can cancel anytime before the repair begins. Contact us at +977 9828757575.' },
        { q: 'Is there a diagnosis fee?', a: 'No! Diagnosis is completely free. You only pay if you approve the repair.' },
        { q: 'Will I lose my data?', a: 'We always try to preserve your data. However, for some repairs (like motherboard work), data backup is recommended before sending your device.' },
    ],
    1: [
        { q: 'When will my device be picked up?', a: 'Our pickup partner will contact you within 24-48 hours to schedule a time.' },
        { q: 'Is pickup really free?', a: 'Yes, pickup and return delivery are completely free across the Kathmandu Valley.' },
        { q: 'How should I prepare my device?', a: 'Remove SIM and memory cards, disable Find My Phone / Google lock, and back up important data.' },
        { q: 'Can someone else hand over the device?', a: 'Yes, as long as they have a photocopy of your ID and know the repair reference.' },
    ],
    2: [
        { q: 'What happens during diagnosis?', a: 'Our certified technician will thoroughly test all components including display, battery, charging, speakers, cameras, and internal circuitry to identify every issue.' },
        { q: 'Do I have to approve the repair cost?', a: 'Absolutely. We will share the full diagnosis report with you. No repair starts without your explicit approval.' },
        { q: 'What if additional issues are found?', a: 'We will update the diagnosis and inform you before proceeding. You can choose to repair some or all issues.' },
        { q: 'How accurate is the cost estimate?', a: 'The post-diagnosis quote is the final cost. No surprises or hidden charges.' },
    ],
    3: [
        { q: 'How long does the repair take?', a: 'Most repairs are completed within 1-3 business days depending on the complexity and parts availability.' },
        { q: 'Do you use original parts?', a: 'We use OEM-quality parts. For Apple devices, we offer both original Apple parts and high-quality alternatives.' },
        { q: 'What warranty do repairs carry?', a: 'All repairs come with a 90-day warranty covering the repaired parts and workmanship.' },
        { q: 'Can I track repair progress?', a: 'Yes, you will receive SMS/call updates at each stage. You can also call us for real-time status.' },
    ],
    4: [
        { q: 'How do I get my device back?', a: 'We will deliver it to your address for free, or you can pick it up from the service center where you dropped it off.' },
        { q: 'What does the 90-day warranty cover?', a: 'If the same repaired component fails within 90 days due to a workmanship defect, we will fix it for free.' },
        { q: 'What if the same issue returns?', a: 'Bring it back within 90 days and we will re-diagnose and repair at no additional cost.' },
        { q: 'Can I repair another device?', a: 'Of course! Submit a new repair request from our repair page anytime.' },
    ],
}

function RepairSuccessContent() {
    const searchParams = useSearchParams()
    const p = {
        name: searchParams.get('name') || 'Customer',
        phone: searchParams.get('phone') || '',
        device: searchParams.get('device') || 'Device',
        image: searchParams.get('image') || '/imgfile/logoimg.png',
        repairs: (searchParams.get('repairs') || '').split(',').filter(Boolean),
        pickup: searchParams.get('pickup') || 'pickup',
        address: searchParams.get('address') || '',
        estMin: searchParams.get('estMin') || '0',
        estMax: searchParams.get('estMax') || '0',
    }

    const diagnosisCost = MOCK_DIAGNOSIS.reduce((s, d) => s + d.cost, 0)

    const [step, setStep] = useState(0)
    const [approved, setApproved] = useState(false)
    const [done, setDone] = useState(false)
    const [openFaq, setOpenFaq] = useState<number | null>(null)

    const next = () => { if (step < 4) setStep(s => s + 1) }
    const approve = () => { setApproved(true); setStep(3) }
    const complete = () => { setDone(true); setStep(4) }

    return (
        <main className="min-h-screen bg-gray-50 font-sans">
            <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4 sm:py-6">

                {/* Breadcrumb */}
                <nav className="flex items-center gap-1.5 text-sm mb-4 overflow-x-auto pb-1 scrollbar-hide" aria-label="Breadcrumb">
                    <Link href="/" className="text-[var(--colour-fsP2)] hover:text-[var(--colour-fsP1)] whitespace-nowrap font-medium transition-colors">Home</Link>
                    <ChevronRight className="w-4 h-4 text-gray-400 flex-shrink-0" />
                    <Link href="/repair" className="text-[var(--colour-fsP2)] hover:text-[var(--colour-fsP1)] whitespace-nowrap font-medium transition-colors">Repair</Link>
                    <ChevronRight className="w-4 h-4 text-gray-400 flex-shrink-0" />
                    <span className="text-slate-800 font-semibold">Status</span>
                    {step > 0 && (
                        <>
                            <ChevronRight className="w-4 h-4 text-gray-400 flex-shrink-0" />
                            <span className="text-[var(--colour-fsP1)] font-medium">{STEPS[step].label}</span>
                        </>
                    )}
                </nav>

                {/* Progress Bar */}
                <div className="relative mb-6">
                    <div className="absolute top-[15px] left-[8%] right-[8%] h-[2px] bg-gray-200 rounded-full" />
                    <div className="absolute top-[15px] left-[8%] h-[2px] bg-[var(--colour-fsP1)] rounded-full transition-all duration-500 ease-out"
                        style={{ width: `${(step / (STEPS.length - 1)) * 84}%` }} />
                    <div className="relative z-10 flex justify-between">
                        {STEPS.map((s, i) => {
                            const isDone = i < step || done
                            const isActive = i === step && !done
                            const Icon = s.icon
                            return (
                                <div key={i} className="flex flex-col items-center gap-1.5 w-14 sm:w-16">
                                    <div className={cn(
                                        'w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 border-2',
                                        isDone ? 'bg-[var(--colour-bg3)] border-[var(--colour-bg3)] text-white' :
                                            isActive ? 'bg-[var(--colour-fsP1)] border-[var(--colour-fsP1)] text-white shadow-md shadow-[var(--colour-fsP1)]/25 scale-110' :
                                                'bg-white border-gray-300 text-gray-400'
                                    )}>
                                        {isDone ? <Check className="h-3.5 w-3.5 stroke-[3]" /> : <Icon className="h-3.5 w-3.5" />}
                                    </div>
                                    <span className={cn('text-[9px] sm:text-[10px] font-bold uppercase tracking-wider',
                                        isActive ? 'text-[var(--colour-fsP1)]' : isDone ? 'text-[var(--colour-text2)]' : 'text-gray-400'
                                    )}>{s.label}</span>
                                </div>
                            )
                        })}
                    </div>
                </div>

                {/* Content */}
                <div className="flex flex-col lg:flex-row gap-5">

                    {/* Left */}
                    <div className="w-full lg:w-5/12 flex flex-col gap-4">
                        {/* Device */}
                        <div className="bg-white rounded-xl border border-gray-200 p-4">
                            <div className="flex items-center gap-3">
                                <div className="w-14 h-14 bg-gray-50 rounded-lg flex items-center justify-center shrink-0 p-1">
                                    <Image src={p.image} alt={p.device} width={48} height={48} className="object-contain" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h2 className="text-sm font-bold text-[var(--colour-text2)] line-clamp-2">{p.device}</h2>
                                    <p className="text-xs text-gray-500 mt-0.5">{p.repairs.length} repair{p.repairs.length > 1 ? 's' : ''} requested</p>
                                    <p className="text-[10px] text-gray-400 uppercase font-semibold tracking-wide mt-1">{step >= 2 ? 'Diagnosis Cost' : 'Estimated Cost'}</p>
                                    <div className="flex items-baseline gap-1.5">
                                        {step >= 2 ? (
                                            <span className="text-lg font-extrabold text-[var(--colour-fsP1)]">Rs. {diagnosisCost.toLocaleString()}</span>
                                        ) : (
                                            <span className="text-lg font-extrabold text-[var(--colour-fsP1)]">Rs. {Number(p.estMin).toLocaleString()} - {Number(p.estMax).toLocaleString()}</span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Details - early steps */}
                        {step < 2 && (
                            <div className="bg-white rounded-xl border border-gray-200 p-4">
                                <h3 className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">Your Details</h3>
                                <div className="space-y-2 text-sm">
                                    <div className="flex justify-between"><span className="text-gray-500">Name</span><span className="font-semibold">{p.name}</span></div>
                                    {p.phone && <div className="flex justify-between"><span className="text-gray-500">Phone</span><span className="font-semibold">{p.phone}</span></div>}
                                    <div className="flex justify-between"><span className="text-gray-500">Method</span><span className="font-semibold">{p.pickup === 'pickup' ? 'Home Pickup' : 'Drop at Store'}</span></div>
                                    {p.address && <div><span className="text-gray-500 text-xs">Location</span><p className="font-semibold text-xs mt-0.5">{p.address}</p></div>}
                                </div>
                            </div>
                        )}

                        {/* Cost Breakdown - after diagnosis */}
                        {step >= 2 && (
                            <div className="bg-white rounded-xl border border-gray-200 p-4 animate-in fade-in duration-200">
                                <h3 className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">Repair Breakdown</h3>
                                <div className="space-y-1.5 text-sm">
                                    {MOCK_DIAGNOSIS.filter(d => d.cost > 0).map((d, i) => (
                                        <div key={i} className="flex justify-between text-xs">
                                            <span className="text-gray-500">{d.part}</span>
                                            <span className="font-medium text-[var(--colour-fsP1)]">Rs. {d.cost.toLocaleString()}</span>
                                        </div>
                                    ))}
                                    <div className="border-t border-dashed pt-2 flex justify-between items-baseline">
                                        <span className="font-bold text-[var(--colour-text2)]">Total</span>
                                        <span className="text-lg font-extrabold text-[var(--colour-fsP1)]">Rs. {diagnosisCost.toLocaleString()}</span>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Action Buttons */}
                        {!done && (
                            <div className="bg-white rounded-xl border border-gray-200 p-4">
                                {step < 2 && (
                                    <Button onClick={next} className="w-full h-10 bg-[var(--colour-fsP1)] hover:bg-[var(--colour-bg2)] text-white font-bold rounded-lg text-sm cursor-pointer">
                                        {step === 0 ? 'Continue to Pickup' : 'Continue to Diagnosis'} <ChevronRight className="ml-1 h-4 w-4" />
                                    </Button>
                                )}
                                {step === 2 && !approved && (
                                    <Button onClick={approve} className="w-full h-10 bg-[var(--colour-bg3)] hover:bg-[#0D5500] text-white font-bold rounded-lg text-sm cursor-pointer shadow-md">
                                        Approve Repair - Rs. {diagnosisCost.toLocaleString()} <Check className="ml-1 h-4 w-4" />
                                    </Button>
                                )}
                                {(step === 3 || approved) && step < 4 && (
                                    <Button onClick={complete} className="w-full h-10 bg-[var(--colour-fsP1)] hover:bg-[var(--colour-bg2)] text-white font-bold rounded-lg text-sm cursor-pointer">
                                        Mark as Complete <ChevronRight className="ml-1 h-4 w-4" />
                                    </Button>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Right */}
                    <div className="w-full lg:w-7/12 flex flex-col gap-4">

                        {/* Step 0-1: Received / Pickup */}
                        {step < 2 && !done && (
                            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                                <div className="p-6 md:p-8 text-center">
                                    <div className={cn('w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4',
                                        step === 0 ? 'bg-green-50 text-[var(--colour-bg3)]' : 'bg-blue-50 text-[var(--colour-fsP2)]'
                                    )}>
                                        {step === 0 ? <Package className="h-7 w-7" /> : <Truck className="h-7 w-7" />}
                                    </div>
                                    <h1 className="text-lg font-bold text-[var(--colour-text2)] mb-2">
                                        {step === 0 ? "Repair Request Received!" : "Device Pickup Arranged"}
                                    </h1>
                                    <p className="text-sm text-gray-500 max-w-sm mx-auto leading-relaxed">
                                        {step === 0
                                            ? `Thank you, ${p.name}! Your repair request is registered. We will arrange ${p.pickup === 'pickup' ? 'a pickup from your location' : 'for you to drop off at our center'}.`
                                            : `Our partner will ${p.pickup === 'pickup' ? `call ${p.phone || 'you'} to schedule pickup` : 'be ready at the service center for your device drop-off'}.`
                                        }
                                    </p>
                                </div>
                                <div className="bg-amber-50/60 border-t border-amber-100 px-4 py-2.5 flex gap-2 items-start">
                                    <AlertTriangle className="h-3.5 w-3.5 text-amber-500 shrink-0 mt-0.5" />
                                    <p className="text-[11px] text-amber-700 leading-relaxed">
                                        Free diagnosis included. Final cost confirmed after inspection. No repair without your approval.
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* Pickup Partner & Location */}
                        {step >= 1 && step < 3 && !done && (
                            <div className="bg-white rounded-xl border border-gray-200 p-4 animate-in slide-in-from-bottom-2 duration-200">
                                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">{p.pickup === 'pickup' ? 'Pickup Partner' : 'Drop-off Location'}</h3>
                                {p.pickup === 'pickup' ? (
                                    <div className="flex items-center gap-3">
                                        <Image src={PICKUP_PARTNERS[0].logo} alt={PICKUP_PARTNERS[0].name} width={40} height={40} className="rounded-lg object-contain bg-gray-50 p-1" />
                                        <div className="flex-1">
                                            <p className="text-sm font-bold text-[var(--colour-text2)]">{PICKUP_PARTNERS[0].name}</p>
                                            <div className="flex items-center gap-2 mt-0.5">
                                                <span className="text-xs text-gray-500 flex items-center gap-0.5"><Star className="h-3 w-3 text-yellow-500 fill-yellow-500" /> {PICKUP_PARTNERS[0].rating}</span>
                                                <span className="text-xs text-gray-500 flex items-center gap-0.5"><Clock className="h-3 w-3" /> {PICKUP_PARTNERS[0].deliveryTime}</span>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="space-y-2">
                                        {PICKUP_LOCATIONS.slice(0, 2).map(loc => (
                                            <div key={loc.id} className="flex items-start gap-2 p-2 rounded-lg bg-gray-50">
                                                <MapPin className="h-4 w-4 text-[var(--colour-fsP1)] shrink-0 mt-0.5" />
                                                <div>
                                                    <p className="text-xs font-bold text-[var(--colour-text2)]">{loc.name}</p>
                                                    <p className="text-[10px] text-gray-500">{loc.address}</p>
                                                    <p className="text-[10px] text-gray-400 flex items-center gap-1 mt-0.5"><Phone className="h-2.5 w-2.5" /> {loc.phone}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Step 2: Diagnosis Report */}
                        {step >= 2 && !done && (
                            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden animate-in slide-in-from-bottom-2 duration-200">
                                <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
                                    <h1 className="text-sm font-bold text-[var(--colour-text2)] flex items-center gap-1.5">
                                        <ClipboardCheck className="h-4 w-4 text-[var(--colour-fsP1)]" /> Diagnosis Report
                                    </h1>
                                    <span className="text-[10px] font-bold text-gray-400 bg-gray-50 px-2 py-0.5 rounded-full">{MOCK_DIAGNOSIS.length} components</span>
                                </div>

                                <div className="divide-y divide-gray-100">
                                    {MOCK_DIAGNOSIS.map((item, i) => (
                                        <div key={i} className="p-3 flex items-start gap-3">
                                            <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5',
                                                item.severity === 'high' ? 'bg-red-50 text-red-500' :
                                                    item.severity === 'medium' ? 'bg-amber-50 text-amber-500' :
                                                        item.severity === 'low' ? 'bg-blue-50 text-blue-500' :
                                                            'bg-green-50 text-green-500'
                                            )}>
                                                {item.severity === 'none' ? <Check className="h-4 w-4" /> : <Wrench className="h-4 w-4" />}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center justify-between mb-0.5">
                                                    <h4 className="text-xs font-bold text-[var(--colour-text2)]">{item.part}</h4>
                                                    <span className={cn('text-[9px] font-bold uppercase px-1.5 py-0.5 rounded',
                                                        item.severity === 'high' ? 'bg-red-50 text-red-600' :
                                                            item.severity === 'medium' ? 'bg-amber-50 text-amber-600' :
                                                                item.severity === 'low' ? 'bg-blue-50 text-blue-600' :
                                                                    'bg-green-50 text-green-600'
                                                    )}>{item.status}</span>
                                                </div>
                                                <p className="text-[10px] text-gray-500 mb-1">{item.issue}</p>
                                                <div className="flex items-center justify-between">
                                                    <span className="text-[10px] font-semibold text-[var(--colour-fsP1)] flex items-center gap-0.5"><Wrench className="h-2.5 w-2.5" /> {item.action}</span>
                                                    {item.cost > 0 && <span className="text-[10px] font-bold text-[var(--colour-fsP1)]">Rs. {item.cost.toLocaleString()}</span>}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Step 3: Repair In Progress */}
                        {step === 3 && !done && (
                            <div className="bg-white rounded-xl border border-gray-200 p-4 animate-in slide-in-from-bottom-2 duration-200">
                                <h3 className="text-sm font-bold text-[var(--colour-text2)] flex items-center gap-2 mb-3">
                                    <Wrench className="h-4 w-4 text-[var(--colour-fsP1)]" /> Repair in Progress
                                </h3>
                                <div className="space-y-2">
                                    {MOCK_DIAGNOSIS.filter(d => d.cost > 0).map((d, i) => (
                                        <div key={i} className="flex items-center gap-3 p-2.5 rounded-lg bg-gray-50">
                                            <div className="w-6 h-6 rounded-full bg-[var(--colour-fsP1)]/10 flex items-center justify-center">
                                                <div className="w-2 h-2 rounded-full bg-[var(--colour-fsP1)] animate-pulse" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-xs font-bold text-[var(--colour-text2)]">{d.part}</p>
                                                <p className="text-[10px] text-gray-500">{d.action}</p>
                                            </div>
                                            <span className="text-[9px] font-bold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded">In Progress</span>
                                        </div>
                                    ))}
                                </div>
                                <div className="mt-3 p-2.5 bg-blue-50 rounded-lg flex items-center gap-2">
                                    <Clock className="h-4 w-4 text-[var(--colour-fsP2)]" />
                                    <p className="text-xs text-[var(--colour-fsP2)] font-semibold">Estimated completion: 1-2 business days</p>
                                </div>
                            </div>
                        )}

                        {/* Done */}
                        {done && (
                            <div className="animate-in slide-in-from-bottom-2 duration-300 flex flex-col gap-4">
                                <div className="bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 rounded-xl border border-green-200 p-6 md:p-8 text-center relative overflow-hidden">
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-green-100/50 rounded-full -translate-y-1/2 translate-x-1/2" />
                                    <div className="absolute bottom-0 left-0 w-24 h-24 bg-teal-100/40 rounded-full translate-y-1/2 -translate-x-1/2" />
                                    <div className="relative z-10">
                                        <div className="inline-flex items-center gap-1.5 bg-[var(--colour-bg3)] text-white px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider mb-4">
                                            <Check className="h-3 w-3 stroke-[3]" /> Repair Complete
                                        </div>
                                        <h1 className="text-xl font-bold text-[var(--colour-text2)] mb-1">Your Device is Ready!</h1>
                                        <p className="text-sm text-gray-500 mb-2">{p.device} has been repaired and tested.</p>
                                        <p className="text-2xl font-extrabold text-[var(--colour-bg3)] mb-1">Rs. {diagnosisCost.toLocaleString()}</p>
                                        <p className="text-xs text-gray-400">90-day warranty on all repaired parts</p>
                                    </div>
                                </div>

                                {/* What Was Repaired */}
                                <div className="bg-white rounded-xl border border-gray-200 p-4">
                                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">What Was Repaired</h3>
                                    <div className="space-y-2">
                                        {MOCK_DIAGNOSIS.filter(d => d.cost > 0).map((d, i) => (
                                            <div key={i} className="flex items-center justify-between p-2 rounded-lg bg-green-50/50">
                                                <div className="flex items-center gap-2">
                                                    <Check className="h-3.5 w-3.5 text-[var(--colour-bg3)]" />
                                                    <span className="text-xs font-semibold text-[var(--colour-text2)]">{d.part}</span>
                                                </div>
                                                <span className="text-xs font-bold text-[var(--colour-bg3)]">Rs. {d.cost.toLocaleString()}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Also from Fatafat Sewa */}
                                <div className="bg-white rounded-xl border border-gray-200 p-4">
                                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Also from Fatafat Sewa</h3>
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                                        {CROSS_SELL_ITEMS.map((item, i) => (
                                            <Link key={i} href={item.href} className="flex items-center gap-2.5 p-2.5 rounded-lg border border-gray-100 hover:border-[var(--colour-fsP1)]/40 hover:shadow-sm transition-all group">
                                                <span className="text-xl">{item.icon}</span>
                                                <div>
                                                    <p className="text-xs font-bold text-[var(--colour-text2)] group-hover:text-[var(--colour-fsP1)]">{item.title}</p>
                                                    <p className="text-[9px] text-gray-500">{item.description}</p>
                                                </div>
                                            </Link>
                                        ))}
                                    </div>
                                </div>

                                {/* CTAs */}
                                <div className="flex gap-3">
                                    <Link href="/" className="flex-1">
                                        <Button variant="outline" className="w-full h-10 font-semibold rounded-lg text-sm border-gray-200 cursor-pointer">
                                            <Home className="mr-1 h-3.5 w-3.5" /> Home
                                        </Button>
                                    </Link>
                                    <Link href="/repair" className="flex-[2]">
                                        <Button className="w-full h-10 bg-[var(--colour-fsP1)] hover:bg-[var(--colour-bg2)] text-white font-bold rounded-lg text-sm cursor-pointer shadow-md">
                                            Repair Another Device <ArrowRight className="ml-1 h-3.5 w-3.5" />
                                        </Button>
                                    </Link>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* FAQ */}
                <div className="mt-6">
                    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                        <div className="px-4 py-3 border-b border-gray-100 flex items-center gap-2">
                            <HelpCircle className="h-4 w-4 text-[var(--colour-fsP1)]" />
                            <h2 className="text-sm font-bold text-[var(--colour-text2)]">Frequently Asked Questions</h2>
                        </div>
                        <div className="divide-y divide-gray-100">
                            {(STEP_FAQS[done ? 4 : Math.min(step, 4)] || STEP_FAQS[0]).map((faq, i) => (
                                <div key={i}>
                                    <button onClick={() => setOpenFaq(openFaq === i ? null : i)}
                                        className="w-full flex items-center justify-between px-4 py-3 text-left cursor-pointer hover:bg-gray-50 transition-colors">
                                        <span className="text-sm font-medium text-[var(--colour-text2)] pr-4">{faq.q}</span>
                                        <ChevronDown className={cn('h-4 w-4 text-gray-400 shrink-0 transition-transform duration-200', openFaq === i && 'rotate-180 text-[var(--colour-fsP1)]')} />
                                    </button>
                                    {openFaq === i && (
                                        <div className="px-4 pb-3 animate-in slide-in-from-top-1 duration-150">
                                            <p className="text-xs text-gray-500 leading-relaxed">{faq.a}</p>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </main>
    )
}

export default function RepairSuccessPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-gray-50 flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--colour-fsP1)]"></div></div>}>
            <RepairSuccessContent />
        </Suspense>
    )
}
