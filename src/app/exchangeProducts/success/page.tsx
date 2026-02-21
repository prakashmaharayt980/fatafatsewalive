'use client'

import React, { useState, Suspense } from 'react'
import { Check, AlertTriangle, ArrowRight, Home, ChevronRight, ChevronDown, Wrench, CircleCheckBig, RotateCcw, Truck, PackageCheck, ClipboardCheck, Shield, HelpCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import Image from 'next/image'
import { useSearchParams } from 'next/navigation'
import { cn } from '@/lib/utils'

const STEPS = [
    { label: 'Received', icon: PackageCheck },
    { label: 'Pickup', icon: Truck },
    { label: 'Inspection', icon: ClipboardCheck },
    { label: 'Confirm', icon: Shield },
]

const MOCK_PARTS = [
    {
        part: 'Display Screen',
        damage: 'Micro-scratches on lower half',
        severity: 'low' as const,
        condition: 85,
        repairAction: 'Polish & Clean',
        repairCost: 200,
        damageImg: '/imgfile/mock-inspection/screen-damage.png',
        replacement: null,
    },
    {
        part: 'Back Panel',
        damage: 'Hairline crack near camera module',
        severity: 'medium' as const,
        condition: 60,
        repairAction: 'Full Replacement',
        repairCost: 1200,
        damageImg: '/imgfile/mock-inspection/back-panel-crack.png',
        replacement: { name: 'OEM Back Glass Panel', status: 'Replaced', img: '/imgfile/mock-inspection/back-panel-crack.png' },
    },
    {
        part: 'Battery',
        damage: '78% max capacity, minor swelling',
        severity: 'low' as const,
        condition: 78,
        repairAction: 'Serviceable',
        repairCost: 0,
        damageImg: '/imgfile/mock-inspection/battery-wear.png',
        replacement: null,
    },
    {
        part: 'Charging Port',
        damage: 'Lint buildup, minor corrosion',
        severity: 'medium' as const,
        condition: 70,
        repairAction: 'Deep Clean',
        repairCost: 300,
        damageImg: '/imgfile/mock-inspection/screen-damage.png',
        replacement: { name: 'Port Cleaning + Sealant', status: 'Serviced', img: '/imgfile/mock-inspection/battery-wear.png' },
    },
]

const totalDeduction = MOCK_PARTS.reduce((s, p) => s + p.repairCost, 0)

const STEP_FAQS: Record<number, { q: string; a: string }[]> = {
    0: [
        { q: 'How long does it take to process my exchange request?', a: 'Most exchange requests are processed within 24 hours. You will receive a confirmation call from our delivery partner to schedule pickup.' },
        { q: 'Can I cancel my exchange request?', a: 'Yes, you can cancel anytime before the device is picked up. Simply contact our support team at +977 9828757575.' },
        { q: 'What should I do before handing over my device?', a: 'Please back up all your data, remove your SIM card and memory card, sign out of all accounts (Google, iCloud, etc.), and factory reset your device.' },
        { q: 'Is the estimated value guaranteed?', a: 'The estimated value is based on the information you provided. The final value may change after our technicians physically inspect the device.' },
    ],
    1: [
        { q: 'When will my device be picked up?', a: 'Our delivery partner will call you within 24-48 hours to schedule a convenient pickup time at your provided address.' },
        { q: 'Do I need to be present during pickup?', a: 'Yes, the person whose name is on the exchange request must be present with a valid ID during device handover.' },
        { q: 'What if I miss the pickup call?', a: 'Our partner will try 3 times. You can also call us directly at +977 9828757575 to reschedule.' },
        { q: 'Is pickup free?', a: 'Yes! Pickup is completely free across Nepal. No hidden charges.' },
    ],
    2: [
        { q: 'How is the inspection done?', a: 'Our certified technicians check display, battery health, charging port, body condition, buttons, speakers, and camera. The process takes about 15-30 minutes.' },
        { q: 'Why did my value decrease after inspection?', a: 'Physical damages like scratches, cracks, or battery degradation that were not reported initially can reduce the value. The breakdown shows exactly what was deducted and why.' },
        { q: 'Can I reject the revised value?', a: 'Yes, if you disagree with the final value, you can reject it and get your device returned at no cost.' },
        { q: 'What happens to replaced parts?', a: 'Replaced parts (like back panels) are fitted with OEM-quality replacements. The old parts are recycled responsibly.' },
    ],
    3: [
        { q: 'How do I use my exchange credit?', a: 'Your credit is automatically applied to your Fatafat Sewa account. Use it at checkout when purchasing any product from our store.' },
        { q: 'Does the credit expire?', a: 'Exchange credits are valid for 6 months from the date of exchange completion.' },
        { q: 'Can I get cash instead of credit?', a: 'Currently, exchange value is only available as store credit. This helps us offer you the best possible value for your device.' },
        { q: 'Can I combine credit with EMI?', a: 'Yes! You can use your exchange credit as a down payment and finance the remaining amount through our EMI options.' },
    ],
}

function SuccessPageContent() {
    const searchParams = useSearchParams()
    const p = {
        name: searchParams.get('name') || 'Customer',
        phone: searchParams.get('phone') || '',
        device: searchParams.get('device') || 'Device',
        value: searchParams.get('value') || '0',
        color: searchParams.get('color') || '',
        image: searchParams.get('image') || '/imgfile/logoimg.png',
        address: searchParams.get('address') || '',
    }

    const estimated = Number(p.value)
    const finalVal = Math.max(0, estimated - totalDeduction)

    const [step, setStep] = useState(0)
    const [okCondition, setOkCondition] = useState(false)
    const [okTerms, setOkTerms] = useState(false)
    const [done, setDone] = useState(false)
    const [openFaq, setOpenFaq] = useState<number | null>(null)

    const next = () => { if (step < 3) setStep(s => s + 1) }
    const finish = () => { if (okCondition && okTerms) { setDone(true); setStep(3) } }

    return (
        <main className="min-h-screen bg-gray-50 font-sans">
            <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4 sm:py-6">

                {/* Breadcrumb */}
                <nav className="flex items-center gap-1.5 text-sm mb-4 overflow-x-auto pb-1 scrollbar-hide" aria-label="Breadcrumb">
                    <Link href="/" className="text-[var(--colour-fsP2)] hover:text-[var(--colour-fsP1)] whitespace-nowrap font-medium transition-colors">Home</Link>
                    <ChevronRight className="w-4 h-4 text-gray-400 flex-shrink-0" />
                    <Link href="/exchangeProducts" className="text-[var(--colour-fsP2)] hover:text-[var(--colour-fsP1)] whitespace-nowrap font-medium transition-colors">Exchange</Link>
                    <ChevronRight className="w-4 h-4 text-gray-400 flex-shrink-0" />
                    <span className="text-slate-800 font-semibold">Status</span>
                    {step > 0 && (
                        <>
                            <ChevronRight className="w-4 h-4 text-gray-400 flex-shrink-0" />
                            <span className="text-[var(--colour-fsP2)] font-medium">{STEPS[step].label}</span>
                        </>
                    )}
                </nav>

                {/* Progress Bar */}
                <div className="relative mb-6">
                    <div className="absolute top-[15px] left-[10%] right-[10%] h-[2px] bg-gray-200 rounded-full" />
                    <div className="absolute top-[15px] left-[10%] h-[2px] bg-[var(--colour-fsP2)] rounded-full transition-all duration-500 ease-out"
                        style={{ width: `${(step / (STEPS.length - 1)) * 80}%` }} />
                    <div className="relative z-10 flex justify-between">
                        {STEPS.map((s, i) => {
                            const isDone = i < step || done
                            const isActive = i === step && !done
                            const isPast = i <= step || done
                            const Icon = s.icon
                            return (
                                <div key={i} className="flex flex-col items-center gap-1.5 w-16 sm:w-20">
                                    <div className={cn(
                                        'w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 border-2',
                                        isDone ? 'bg-[var(--colour-bg3)] border-[var(--colour-bg3)] text-white' :
                                            isActive ? 'bg-[var(--colour-fsP2)] border-[var(--colour-fsP2)] text-white shadow-md shadow-[var(--colour-fsP2)]/25 scale-110' :
                                                'bg-white border-gray-300 text-gray-400'
                                    )}>
                                        {isDone ? <Check className="h-3.5 w-3.5 stroke-[3]" /> : <Icon className="h-3.5 w-3.5" />}
                                    </div>
                                    <span className={cn('text-[10px] font-bold uppercase tracking-wider',
                                        isActive ? 'text-[var(--colour-fsP2)]' : isPast ? 'text-[var(--colour-text2)]' : 'text-gray-400'
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
                        {/* Product */}
                        <div className="bg-white rounded-xl border border-gray-200 p-4">
                            <div className="flex items-center gap-3">
                                <div className="w-16 h-16 bg-gray-50 rounded-lg flex items-center justify-center shrink-0 p-1">
                                    <Image src={p.image} alt={p.device} width={56} height={56} className="object-contain" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h2 className="text-sm font-bold text-[var(--colour-text2)] line-clamp-2">{p.device}</h2>
                                    {p.color && <p className="text-xs text-gray-500 mt-0.5">{p.color}</p>}
                                    <p className="text-[10px] text-gray-400 uppercase font-semibold tracking-wide mt-1.5">{step >= 2 ? 'Revised Value' : 'Est. Value'}</p>
                                    <div className="flex items-baseline gap-2">
                                        <span className="text-xl font-extrabold text-[var(--colour-bg3)]">Rs. {(step >= 2 ? finalVal : estimated).toLocaleString()}</span>
                                        {step >= 2 && estimated !== finalVal && <span className="text-[11px] text-gray-400 line-through">Rs. {estimated.toLocaleString()}</span>}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Details - early steps only */}
                        {step < 2 && (
                            <div className="bg-white rounded-xl border border-gray-200 p-4">
                                <h3 className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">Your Details</h3>
                                <div className="space-y-2 text-sm">
                                    <div className="flex justify-between"><span className="text-gray-500">Name</span><span className="font-semibold text-[var(--colour-text2)]">{p.name}</span></div>
                                    {p.phone && <div className="flex justify-between"><span className="text-gray-500">Phone</span><span className="font-semibold text-[var(--colour-text2)]">{p.phone}</span></div>}
                                    {p.address && <div><span className="text-gray-500 text-xs">Address</span><p className="font-semibold text-[var(--colour-text2)] text-xs mt-0.5">{p.address}</p></div>}
                                </div>
                            </div>
                        )}

                        {/* Value Breakdown - after inspection */}
                        {step >= 2 && (
                            <div className="bg-white rounded-xl border border-gray-200 p-4 animate-in fade-in duration-200">
                                <h3 className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">Value Breakdown</h3>
                                <div className="space-y-1.5 text-sm">
                                    <div className="flex justify-between"><span className="text-gray-500">Estimated Value</span><span className="font-medium">Rs. {estimated.toLocaleString()}</span></div>
                                    {MOCK_PARTS.filter(mp => mp.repairCost > 0).map((mp, i) => (
                                        <div key={i} className="flex justify-between text-xs"><span className="text-gray-500">{mp.part}</span><span className="font-medium text-red-500">-Rs. {mp.repairCost.toLocaleString()}</span></div>
                                    ))}
                                    <div className="border-t border-dashed pt-2 flex justify-between items-baseline">
                                        <span className="font-bold text-[var(--colour-text2)]">Final Value</span>
                                        <span className="text-lg font-extrabold text-[var(--colour-bg3)]">Rs. {finalVal.toLocaleString()}</span>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Action Buttons - always visible with amount */}
                        {!done && (
                            <div className="bg-white rounded-xl border border-gray-200 p-4">
                                {step < 2 && (
                                    <Button onClick={next} className="w-full h-10 bg-[var(--colour-fsP2)] hover:bg-[var(--colour-bg2)] text-white font-bold rounded-lg text-sm cursor-pointer">
                                        {step === 0 ? 'Continue to Pickup' : 'Continue to Inspection'} <ChevronRight className="ml-1 h-4 w-4" />
                                    </Button>
                                )}
                                {step === 2 && (
                                    <Button onClick={() => setStep(3)} className="w-full h-10 bg-[var(--colour-fsP2)] hover:bg-[var(--colour-bg2)] text-white font-bold rounded-lg text-sm cursor-pointer">
                                        Proceed to Accept <ArrowRight className="ml-1 h-4 w-4" />
                                    </Button>
                                )}
                                {step >= 3 && (
                                    <>
                                        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                                            <CircleCheckBig className="h-3.5 w-3.5 text-[var(--colour-fsP2)]" /> Confirm to proceed
                                        </h3>
                                        <div className="space-y-2 mb-3">
                                            <label className="flex items-start gap-2.5 cursor-pointer group p-2 rounded-lg border border-gray-200 hover:border-[var(--colour-fsP2)]/40 transition-colors">
                                                <input type="checkbox" checked={okCondition} onChange={e => setOkCondition(e.target.checked)} className="sr-only" />
                                                <div className={cn('w-4 h-4 rounded border-2 flex items-center justify-center transition-all mt-0.5 shrink-0',
                                                    okCondition ? 'bg-[var(--colour-fsP2)] border-[var(--colour-fsP2)]' : 'bg-white border-gray-300 group-hover:border-[var(--colour-fsP2)]')}>
                                                    {okCondition && <Check className="h-2.5 w-2.5 text-white" />}
                                                </div>
                                                <span className="text-xs text-gray-500 leading-snug">I accept the <strong className="text-[var(--colour-text2)]">inspection results & final value</strong>.</span>
                                            </label>
                                            <label className="flex items-start gap-2.5 cursor-pointer group p-2 rounded-lg border border-gray-200 hover:border-[var(--colour-fsP2)]/40 transition-colors">
                                                <input type="checkbox" checked={okTerms} onChange={e => setOkTerms(e.target.checked)} className="sr-only" />
                                                <div className={cn('w-4 h-4 rounded border-2 flex items-center justify-center transition-all mt-0.5 shrink-0',
                                                    okTerms ? 'bg-[var(--colour-fsP2)] border-[var(--colour-fsP2)]' : 'bg-white border-gray-300 group-hover:border-[var(--colour-fsP2)]')}>
                                                    {okTerms && <Check className="h-2.5 w-2.5 text-white" />}
                                                </div>
                                                <span className="text-xs text-gray-500 leading-snug">
                                                    I agree to <Link href="#" className="text-[var(--colour-fsP2)] font-semibold hover:underline">Exchange T&C</Link> and <Link href="#" className="text-[var(--colour-fsP2)] font-semibold hover:underline">Sale Policy</Link>.
                                                </span>
                                            </label>
                                        </div>
                                        <Button onClick={finish} disabled={!okTerms || !okCondition}
                                            className={cn('w-full h-10 font-bold rounded-lg text-sm transition-all',
                                                okTerms && okCondition
                                                    ? 'bg-[var(--colour-bg3)] hover:bg-[#0D5500] text-white shadow-md cursor-pointer'
                                                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                            )}>
                                            Accept & Complete <Check className="ml-1.5 h-4 w-4" />
                                        </Button>
                                    </>
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
                                        {step === 0 ? <PackageCheck className="h-7 w-7" /> : <Truck className="h-7 w-7" />}
                                    </div>
                                    <h1 className="text-lg font-bold text-[var(--colour-text2)] mb-2">
                                        {step === 0 ? "Exchange Request Received!" : "Pickup Is Being Arranged"}
                                    </h1>
                                    <p className="text-sm text-gray-500 max-w-sm mx-auto mb-6 leading-relaxed">
                                        {step === 0
                                            ? `Thank you, ${p.name}! Your device is registered for exchange. We are scheduling your pickup now.`
                                            : `Our partner will call ${p.phone || 'you'} shortly to confirm a convenient pickup slot.`
                                        }
                                    </p>

                                </div>
                                <div className="bg-amber-50/60 border-t border-amber-100 px-4 py-2.5 flex gap-2 items-start">
                                    <AlertTriangle className="h-3.5 w-3.5 text-amber-500 shrink-0 mt-0.5" />
                                    <p className="text-[11px] text-amber-700 leading-relaxed">
                                        Est. <strong>Rs. {estimated.toLocaleString()}</strong> may change after physical inspection.
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* Step 2: Inspection Report */}
                        {step >= 2 && !done && (
                            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden animate-in slide-in-from-bottom-2 duration-200">
                                <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
                                    <h1 className="text-sm font-bold text-[var(--colour-text2)] flex items-center gap-1.5">
                                        <ClipboardCheck className="h-4 w-4 text-[var(--colour-fsP2)]" /> Inspection Report
                                    </h1>
                                    <span className="text-[10px] font-bold text-gray-400 bg-gray-50 px-2 py-0.5 rounded-full">{MOCK_PARTS.length} parts</span>
                                </div>

                                <div className="divide-y divide-gray-100">
                                    {MOCK_PARTS.map((part, i) => (
                                        <div key={i} className="p-3">
                                            {/* Part Header */}
                                            <div className="flex items-center justify-between mb-2">
                                                <h4 className="text-xs font-bold text-[var(--colour-text2)]">{part.part}</h4>
                                                <div className="flex items-center gap-1.5">
                                                    <div className="w-12 h-1 bg-gray-200 rounded-full overflow-hidden">
                                                        <div className={cn('h-full rounded-full',
                                                            part.condition >= 80 ? 'bg-green-500' : part.condition >= 65 ? 'bg-amber-500' : 'bg-red-500'
                                                        )} style={{ width: `${part.condition}%` }} />
                                                    </div>
                                                    <span className={cn('text-[10px] font-bold',
                                                        part.condition >= 80 ? 'text-green-600' : part.condition >= 65 ? 'text-amber-600' : 'text-red-600'
                                                    )}>{part.condition}%</span>
                                                </div>
                                            </div>

                                            {/* Side by side: Damaged | Replaced */}
                                            <div className={cn('grid gap-2', part.replacement ? 'grid-cols-2' : 'grid-cols-1')}>
                                                <div className="rounded-lg border border-red-100 bg-red-50/30 overflow-hidden">
                                                    <div className="relative w-full aspect-[3/2] bg-white">
                                                        <Image src={part.damageImg} alt={`${part.part} damage`} fill className="object-cover" sizes="180px" />
                                                        <span className="absolute top-1.5 left-1.5 text-[8px] font-bold uppercase bg-red-500 text-white px-1 py-0.5 rounded">Damaged</span>
                                                    </div>
                                                    <div className="p-2">
                                                        <p className="text-[10px] text-gray-500 leading-snug mb-1">{part.damage}</p>
                                                        <div className="flex items-center justify-between">
                                                            <span className="text-[9px] font-semibold text-[var(--colour-fsP2)] flex items-center gap-0.5"><Wrench className="h-2.5 w-2.5" /> {part.repairAction}</span>
                                                            {part.repairCost > 0 && <span className="text-[9px] font-bold text-red-500">-Rs.{part.repairCost.toLocaleString()}</span>}
                                                        </div>
                                                    </div>
                                                </div>

                                                {part.replacement && (
                                                    <div className="rounded-lg border border-green-100 bg-green-50/30 overflow-hidden">
                                                        <div className="relative w-full aspect-[3/2] bg-white">
                                                            <Image src={part.replacement.img} alt={`${part.part} fixed`} fill className="object-cover" sizes="180px" />
                                                            <span className="absolute top-1.5 left-1.5 text-[8px] font-bold uppercase bg-[var(--colour-bg3)] text-white px-1 py-0.5 rounded">{part.replacement.status}</span>
                                                        </div>
                                                        <div className="p-2">
                                                            <p className="text-[10px] font-semibold text-[var(--colour-text2)]">{part.replacement.name}</p>
                                                            <span className="text-[9px] text-[var(--colour-bg3)] font-semibold flex items-center gap-0.5 mt-0.5"><RotateCcw className="h-2.5 w-2.5" /> {part.replacement.status}</span>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>


                            </div>
                        )}



                        {/* Done - Device Sold */}
                        {done && (
                            <div className="animate-in slide-in-from-bottom-2 duration-300 flex flex-col gap-4">
                                {/* Sold Banner */}
                                <div className="bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 rounded-xl border border-green-200 p-6 md:p-8 text-center relative overflow-hidden">
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-green-100/50 rounded-full -translate-y-1/2 translate-x-1/2" />
                                    <div className="absolute bottom-0 left-0 w-24 h-24 bg-teal-100/40 rounded-full translate-y-1/2 -translate-x-1/2" />
                                    <div className="relative z-10">
                                        <div className="inline-flex items-center gap-1.5 bg-[var(--colour-bg3)] text-white px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider mb-4">
                                            <Check className="h-3 w-3 stroke-[3]" /> Device Sold
                                        </div>
                                        <h1 className="text-xl font-bold text-[var(--colour-text2)] mb-1">Exchange Complete!</h1>
                                        <p className="text-sm text-gray-500 mb-3">Your {p.device} has been successfully exchanged.</p>
                                        <p className="text-3xl font-extrabold text-[var(--colour-bg3)] mb-1">Rs. {finalVal.toLocaleString()}</p>
                                        <p className="text-xs text-gray-400">Credit added to your account</p>
                                    </div>
                                </div>

                                {/* What Happens Next */}
                                <div className="bg-white rounded-xl border border-gray-200 p-4">
                                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">What Happens Next</h3>
                                    <div className="space-y-3">
                                        <div className="flex gap-3 items-start">
                                            <div className="w-6 h-6 rounded-full bg-blue-50 flex items-center justify-center shrink-0 mt-0.5">
                                                <span className="text-[10px] font-bold text-[var(--colour-fsP2)]">1</span>
                                            </div>
                                            <div>
                                                <p className="text-sm font-semibold text-[var(--colour-text2)]">Credit Applied</p>
                                                <p className="text-xs text-gray-500">Rs. {finalVal.toLocaleString()} is ready to use on any purchase</p>
                                            </div>
                                        </div>
                                        <div className="flex gap-3 items-start">
                                            <div className="w-6 h-6 rounded-full bg-blue-50 flex items-center justify-center shrink-0 mt-0.5">
                                                <span className="text-[10px] font-bold text-[var(--colour-fsP2)]">2</span>
                                            </div>
                                            <div>
                                                <p className="text-sm font-semibold text-[var(--colour-text2)]">Shop & Save</p>
                                                <p className="text-xs text-gray-500">Browse our latest phones and use your credit at checkout</p>
                                            </div>
                                        </div>
                                        <div className="flex gap-3 items-start">
                                            <div className="w-6 h-6 rounded-full bg-blue-50 flex items-center justify-center shrink-0 mt-0.5">
                                                <span className="text-[10px] font-bold text-[var(--colour-fsP2)]">3</span>
                                            </div>
                                            <div>
                                                <p className="text-sm font-semibold text-[var(--colour-text2)]">Free Delivery</p>
                                                <p className="text-xs text-gray-500">Your new device will be delivered to your doorstep</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* CTA */}
                                <div className="flex gap-3">
                                    <Link href="/" className="flex-1">
                                        <Button variant="outline" className="w-full h-10 font-semibold rounded-lg text-sm border-gray-200 cursor-pointer">
                                            <Home className="mr-1 h-3.5 w-3.5" /> Home
                                        </Button>
                                    </Link>
                                    <Link href="/emi/shop" className="flex-[2]">
                                        <Button className="w-full h-10 bg-[var(--colour-bg3)] hover:bg-[#0D5500] text-white font-bold rounded-lg text-sm cursor-pointer shadow-md">
                                            Shop with Rs. {finalVal.toLocaleString()} <ArrowRight className="ml-1 h-3.5 w-3.5" />
                                        </Button>
                                    </Link>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* FAQ Section - visible on all steps */}
            <div className="max-w-5xl mx-auto px-4 sm:px-6 pb-8">
                <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                    <div className="px-4 py-3 border-b border-gray-100 flex items-center gap-2">
                        <HelpCircle className="h-4 w-4 text-[var(--colour-fsP2)]" />
                        <h2 className="text-sm font-bold text-[var(--colour-text2)]">Frequently Asked Questions</h2>
                    </div>
                    <div className="divide-y divide-gray-100">
                        {(STEP_FAQS[done ? 3 : Math.min(step, 3)] || STEP_FAQS[0]).map((faq, i) => (
                            <div key={i}>
                                <button
                                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                                    className="w-full flex items-center justify-between px-4 py-3 text-left cursor-pointer hover:bg-gray-50 transition-colors"
                                >
                                    <span className="text-sm font-medium text-[var(--colour-text2)] pr-4">{faq.q}</span>
                                    <ChevronDown className={cn('h-4 w-4 text-gray-400 shrink-0 transition-transform duration-200', openFaq === i && 'rotate-180 text-[var(--colour-fsP2)]')} />
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
        </main>
    )
}

export default function ExchangeSuccessPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-gray-50 flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--colour-fsP2)]"></div></div>}>
            <SuccessPageContent />
        </Suspense>
    )
}
