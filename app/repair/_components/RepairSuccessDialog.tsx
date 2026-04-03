'use client'

import React from 'react'
import {
    Package, Wrench, Truck, ClipboardCheck, Shield, Check,
    MapPin, Phone, ArrowRight,
} from 'lucide-react'
import {
    Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from '@/components/ui/dialog'
import Image from 'next/image'
import Link from 'next/link'
import { getRepairLabels } from '../repair-helpers'

interface SuccessData {
    name: string
    phone: string
    device: string
    image: string
    repairs: string[]
    address: string
}

const STEPS = [
    { label: 'Received', icon: Package },
    { label: 'Pickup', icon: Truck },
    { label: 'Diagnosis', icon: ClipboardCheck },
    { label: 'Repair', icon: Wrench },
    { label: 'Complete', icon: Shield },
]

const noBar = '[&::-webkit-scrollbar]:w-0 [scrollbar-width:none]'

export default function RepairSuccessDialog({
    data,
    onClose,
}: {
    data: SuccessData | null
    onClose: () => void
}) {
    if (!data) return null

    const repairLabels = getRepairLabels(data.repairs)

    return (
        <Dialog open={!!data} onOpenChange={onClose}>
            <DialogContent className={`w-full sm:max-w-lg max-h-[95dvh] sm:max-h-[90dvh] p-0 flex flex-col gap-0 bg-white border border-gray-200 rounded-t-xl sm:rounded-xl overflow-hidden ${noBar}`}>
                <DialogHeader className="shrink-0 px-6 py-4 border-b border-gray-100">
                    <DialogTitle className="text-base font-bold text-slate-900">Repair Request Submitted</DialogTitle>
                    <DialogDescription className="text-xs text-slate-500 mt-0.5">
                        We have received your request and will be in touch shortly.
                    </DialogDescription>
                </DialogHeader>

                <div className={`flex-1 overflow-y-auto ${noBar} divide-y divide-gray-100`}>
                    {/* Progress — step 0 active */}
                    <div className="px-6 py-6">
                        <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest mb-5">Repair Progress</p>
                        <div className="relative w-full">
                            <div className="absolute top-3.75 left-0 right-0 h-0.5 bg-gray-100 rounded-full" />
                            <div className="absolute top-3.75 left-0 h-0.5 bg-(--colour-fsP2) rounded-full" style={{ width: '0%' }} />
                            <div className="relative z-10 flex justify-between">
                                {STEPS.map((step, i) => {
                                    const active = i === 0
                                    const isFirst = i === 0
                                    const isLast = i === STEPS.length - 1
                                    const Icon = step.icon
                                    return (
                                        <div key={i} className="relative flex flex-col items-center">
                                            <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center ${active ? 'bg-(--colour-fsP2) border-(--colour-fsP2) scale-110 shadow-sm' : 'bg-white border-gray-200'}`}>
                                                <Icon className={`h-3.5 w-3.5 ${active ? 'text-white' : 'text-gray-300'}`} />
                                            </div>
                                            <div className={`absolute top-10 w-20 ${isFirst ? 'left-0 text-left' : isLast ? 'right-0 text-right' : 'left-1/2 -translate-x-1/2 text-center'}`}>
                                                <span className={`block text-[10px] font-bold uppercase tracking-wider leading-tight ${active ? 'text-(--colour-fsP2)' : 'text-slate-400'}`}>
                                                    {step.label}
                                                </span>
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                            <div className="h-14" />
                        </div>
                    </div>

                    {/* Device */}
                    <div className="px-6 py-4">
                        <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest border-b border-gray-100 pb-1.5 mb-3">Device</p>
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 shrink-0 rounded-lg border border-gray-100 bg-gray-50 flex items-center justify-center overflow-hidden">
                                {data.image
                                    ? <Image src={data.image} alt={data.device} width={48} height={48} className="object-contain p-0.5" />
                                    : <Package size={18} className="text-gray-300" />}
                            </div>
                            <div>
                                <p className="text-sm font-bold text-slate-900">{data.device}</p>
                                {repairLabels.length > 0 && (
                                    <p className="text-xs text-slate-500 mt-0.5">{repairLabels.join(' · ')}</p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Customer details */}
                    <div className="px-6 py-4">
                        <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest border-b border-gray-100 pb-1.5 mb-3">Pickup Details</p>
                        <div className="space-y-2">
                            <div className="flex items-center gap-2 text-sm text-slate-700">
                                <Phone size={13} className="text-(--colour-fsP2) shrink-0" />
                                <span className="font-semibold">{data.phone || data.name}</span>
                            </div>
                            {data.address && (
                                <div className="flex items-start gap-2 text-sm text-slate-700">
                                    <MapPin size={13} className="text-(--colour-fsP2) shrink-0 mt-0.5" />
                                    <span className="font-semibold">{data.address}</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Notice */}
                    <div className="px-6 py-4">
                        <div className="flex items-start gap-2 p-3 bg-slate-50 border border-slate-200 rounded-lg">
                            <Check size={13} className="text-(--colour-fsP2) shrink-0 mt-0.5" />
                            <p className="text-xs text-slate-600 font-semibold">
                                Free diagnosis included. Final cost confirmed after inspection. No repair without your approval.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="shrink-0 flex gap-2 px-6 py-3 border-t border-gray-100 bg-gray-50/40">
                    <button
                        onClick={onClose}
                        className="flex-1 h-9 rounded-lg border border-gray-200 bg-white text-xs font-semibold text-slate-700 hover:bg-gray-50 transition-colors"
                    >
                        Close
                    </button>
                    <Link href="/profile?tab=repair" onClick={onClose} className="flex-1">
                        <button className="w-full h-9 rounded-lg bg-(--colour-fsP2) hover:bg-blue-700 text-xs font-semibold text-white transition-colors flex items-center justify-center gap-1.5">
                            Track in Profile <ArrowRight size={12} />
                        </button>
                    </Link>
                </div>
            </DialogContent>
        </Dialog>
    )
}
