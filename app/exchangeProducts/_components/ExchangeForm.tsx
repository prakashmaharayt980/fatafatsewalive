'use client'

import React, { useState, useEffect } from 'react'
import Image from 'next/image'
import { 
    Loader2, Truck, Store, CheckCircle2, 
    RotateCcw, Camera, FileText, Hash, UploadCloud, ChevronLeft, 
    Plus, MapPin, X, AlertCircle 
} from 'lucide-react'
import { toast } from 'sonner'

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'

import type { NavbarItem } from '@/app/context/navbar.interface'
import type { ShippingAddress } from '../../checkout/checkoutTypes'
import { AddressService } from '@/app/api/services/address.service'
import GoogleMapAddress, { type LocationData } from '../../checkout/GoogleMapAddress'
import {
    type FullProduct, type ConditionAnswer,
    GET_CONDITION_QUESTIONS, GET_PROBLEM_OPTIONS, REASON_OPTIONS,
} from '../exchange-helpers'

interface ExchangeFormProps {
    selectedCategory: NavbarItem | null
    selectedProduct: FullProduct | null
    isLoadingDetail: boolean
    conditionAnswers: ConditionAnswer
    conditionComplete: boolean
    exchangeValue: number
    pickupSelected: boolean
    onConditionAnswer: (key: 'screen' | 'body' | 'battery' | 'functional', value: number) => void
    onPickupSelect: (selected: boolean) => void
    onCheckout: () => void
    onLoginRequest: () => void
    isLoggedIn: boolean
    selectedAddress: ShippingAddress | null
    onAddressSelect: (address: ShippingAddress) => void
    serialNumber: string
    governmentId: string
    devicePhoto: File | string | null
    onVerificationChange: (key: 'serialNumber' | 'governmentId' | 'devicePhoto', value: any) => void
    problems: string[]
    reason: string
    onConditionExtra: (key: 'problems' | 'reason', value: any) => void
}

export default function ExchangeForm({
    selectedCategory,
    selectedProduct,
    isLoadingDetail,
    conditionAnswers,
    conditionComplete,
    exchangeValue,
    pickupSelected,
    onConditionAnswer,
    onPickupSelect,
    onCheckout,
    onLoginRequest,
    isLoggedIn,
    selectedAddress,
    onAddressSelect,
    serialNumber,
    governmentId,
    devicePhoto,
    onVerificationChange,
    problems,
    reason,
    onConditionExtra,
}: ExchangeFormProps) {

    const [addrView, setAddrView] = useState<'list' | 'form'>('list')
    const [savedAddresses, setSavedAddresses] = useState<ShippingAddress[]>([])
    const [isLoadingAddr, setIsLoadingAddr] = useState(false)
    const [isSaving, setIsSaving] = useState(false)
    const [mapLocation, setMapLocation] = useState<LocationData | null>(null)
    const [addrForm, setAddrForm] = useState({ city: '', district: '', province: '', landmark: '' })

    useEffect(() => {
        if (isLoggedIn && addrView === 'list' && savedAddresses.length === 0) {
            setIsLoadingAddr(true)
            AddressService.ShippingAddressList()
                .then(res => {
                    const list: ShippingAddress[] = Array.isArray(res) ? res : (res.data || [])
                    setSavedAddresses(list)
                    if (list.length > 0 && !selectedAddress) onAddressSelect(list[0])
                })
                .catch(() => { })
                .finally(() => setIsLoadingAddr(false))
        }
    }, [isLoggedIn, addrView])

    const handleMapSelect = (loc: LocationData) => {
        setMapLocation(loc)
        if (loc.addressComponents) {
            setAddrForm(p => ({
                ...p,
                province: loc.addressComponents?.province || p.province,
                district: loc.addressComponents?.district || p.district,
                city: loc.addressComponents?.municipality ?? loc.addressComponents?.city ?? p.city,
                landmark: loc.addressComponents?.tole ?? loc.addressComponents?.city ?? p.landmark,
            }))
        }
    }

    const handleSaveAddress = async () => {
        if (!addrForm.city || !addrForm.province) {
            toast.error('City and Province are required')
            return
        }
        setIsSaving(true)
        try {
            const fullAddress = [addrForm.landmark, addrForm.city, addrForm.district, addrForm.province].filter(Boolean).join(', ')
            const res = await AddressService.CreateShippingAddress({
                first_name: 'Customer', last_name: 'Exchange', contact_number: '0000000000',
                lat: mapLocation?.lat || null, lng: mapLocation?.lng || null,
                label: 'Home', landmark: addrForm.landmark,
                city: addrForm.city, district: addrForm.district,
                province: addrForm.province, country: 'Nepal',
                address: fullAddress, state: addrForm.province,
            })
            const newAddr: ShippingAddress = {
                id: res?.id || Date.now(),
                address: { label: 'Home', ...addrForm, country: 'Nepal', is_default: false },
                geo: { lat: mapLocation?.lat || null, lng: mapLocation?.lng || null },
            }
            setSavedAddresses(p => [...p, newAddr])
            onAddressSelect(newAddr)
            setAddrView('list')
            toast.success('Address saved')
        } catch { toast.error('Failed to save address') }
        finally { setIsSaving(false) }
    }

    const isVerified = serialNumber.trim().length > 3 && governmentId.trim().length > 3 && !!devicePhoto
    const canSubmit = conditionComplete && isVerified && (!pickupSelected || !!selectedAddress)
    const questions = GET_CONDITION_QUESTIONS(selectedCategory?.slug || 'mobile')



    if (isLoadingDetail) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center gap-4 bg-white h-full">
                <div className="relative">
                    <div className="absolute inset-0 bg-[#1967b3]/20 blur-xl rounded-full" />
                    <Loader2 size={32} className="animate-spin relative z-10 text-[#1967b3]" />
                </div>
                <p className="text-xs text-gray-400 font-bold tracking-widest uppercase">Loading Device...</p>
            </div>
        )
    }

    return (
        <div className="flex flex-col h-full bg-gray-50/50 relative">


            <div className="px-5 py-6 space-y-8 max-w-2xl mx-auto w-full">
                {/* section 1: condition */}
                <div className="bg-white rounded-3xl p-5 border border-gray-200/60 shadow-sm">
                    <div className="flex items-center gap-2 mb-4">
                        <div className="w-6 h-6 rounded-full bg-[#1967b3]/10 flex items-center justify-center text-[#1967b3]">
                            <span className="text-[11px] font-black">1</span>
                        </div>
                        <h3 className="text-[12px] font-black uppercase tracking-widest text-gray-900">Device Condition</h3>
                        {conditionComplete && <CheckCircle2 size={14} className="text-emerald-500 ml-auto" />}
                    </div>

                    <div className="space-y-5">
                        {questions.map((q) => {
                            const val = conditionAnswers[q.key as keyof ConditionAnswer]
                            const answered = val > 0
                            return (
                                <div key={q.key} className="space-y-2.5">
                                    <p className="text-[12.5px] font-bold text-gray-700">{q.label}</p>
                                    <RadioGroup
                                        value={val > 0 ? String(val) : ''}
                                        onValueChange={v => onConditionAnswer(q.key as any, Number(v))}
                                        className="grid grid-cols-2 gap-2"
                                    >
                                        {q.options.map(opt => {
                                            const isSel = val === opt.value
                                            const isGood = opt.label === 'Yes'
                                            return (
                                                <label
                                                    key={opt.label}
                                                    htmlFor={`${q.key}-${opt.label}`}
                                                    className={cn(
                                                        'flex items-center gap-2.5 py-3 px-4 rounded-2xl border-2 cursor-pointer transition-all duration-200',
                                                        isSel
                                                            ? isGood ? 'bg-emerald-50 border-emerald-400 ring-2 ring-emerald-500/10' : 'bg-red-50 border-red-300 ring-2 ring-red-500/10'
                                                            : 'border-gray-100 bg-white hover:border-gray-300'
                                                    )}
                                                >
                                                    <RadioGroupItem value={String(opt.value)} id={`${q.key}-${opt.label}`} />
                                                    <span className={cn(
                                                        'text-[11.5px] font-black uppercase tracking-widest',
                                                        isSel ? (isGood ? 'text-emerald-700' : 'text-red-700') : 'text-gray-500'
                                                    )}>{opt.label}</span>
                                                </label>
                                            )
                                        })}
                                    </RadioGroup>
                                </div>
                            )
                        })}

                        <div className="pt-2 border-t border-gray-100">
                            <p className="text-[12px] font-bold text-gray-700 mb-2.5">Current issues?</p>
                            <div className="flex flex-wrap gap-2">
                                {GET_PROBLEM_OPTIONS(selectedCategory?.slug ?? '').map(problem => {
                                    const isSel = problems.includes(problem)
                                    return (
                                        <button
                                            key={problem}
                                            type="button"
                                            onClick={() => onConditionExtra('problems', isSel ? problems.filter(p => p !== problem) : [...problems, problem])}
                                            className={cn(
                                                'px-4 py-2 rounded-xl border-2 text-[11.5px] font-bold transition-all duration-200',
                                                isSel
                                                    ? 'border-orange-200 bg-orange-50 text-orange-700'
                                                    : 'border-gray-100 bg-white text-gray-500 hover:border-gray-300'
                                            )}
                                        >
                                            {problem}
                                        </button>
                                    )
                                })}
                            </div>
                        </div>

                        <div>
                            <p className="text-[12px] font-bold text-gray-700 mb-2.5">Reason for exchanging?</p>
                            <RadioGroup value={reason} onValueChange={v => onConditionExtra('reason', v)} className="grid grid-cols-1 gap-2">
                                {REASON_OPTIONS.map(r => (
                                    <label
                                        key={r}
                                        htmlFor={`reason-${r}`}
                                        className={cn(
                                            'flex items-center gap-3 px-4 py-3.5 rounded-2xl border-2 cursor-pointer transition-all duration-200',
                                            reason === r
                                                ? 'border-[#1967b3] bg-[#1967b3]/5'
                                                : 'border-gray-100 bg-white hover:border-gray-300'
                                        )}
                                    >
                                        <RadioGroupItem value={r} id={`reason-${r}`} />
                                        <span className={cn(
                                            'text-[12px] font-bold',
                                            reason === r ? 'text-[#1967b3]' : 'text-gray-600'
                                        )}>{r}</span>
                                    </label>
                                ))}
                            </RadioGroup>
                        </div>
                    </div>
                </div>

                {/* section 2: verification */}
                <div className="bg-white rounded-3xl p-5 border border-gray-200/60 shadow-sm opacity-100">
                    <div className="flex items-center gap-2 mb-4">
                        <div className="w-6 h-6 rounded-full bg-[#1967b3]/10 flex items-center justify-center text-[#1967b3]">
                            <span className="text-[11px] font-black">2</span>
                        </div>
                        <h3 className="text-[12px] font-black uppercase tracking-widest text-gray-900">Verification</h3>
                        {isVerified && <CheckCircle2 size={14} className="text-emerald-500 ml-auto" />}
                    </div>

                    <div className="space-y-4">
                        <div className="space-y-1.5">
                            <Label className="text-[10px] font-black text-gray-500 uppercase tracking-widest flex items-center gap-1.5">
                                <Hash size={11} className="text-[#1967b3]" />
                                Serial / IMEI Number
                            </Label>
                            <div className="relative">
                                <Input
                                    value={serialNumber}
                                    onChange={e => onVerificationChange('serialNumber', e.target.value)}
                                    placeholder="Dial *#06# to find IMEI"
                                    className={cn(
                                        'h-12 text-[13px] px-4 rounded-2xl border-2 focus-visible:ring-0 font-bold transition-all',
                                        serialNumber.length > 3 ? 'border-emerald-300 bg-emerald-50/20' : 'border-gray-200 bg-gray-50 focus-visible:border-[#1967b3]'
                                    )}
                                />
                                {serialNumber.length > 3 && <CheckCircle2 size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-emerald-500" />}
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <Label className="text-[10px] font-black text-gray-500 uppercase tracking-widest flex items-center gap-1.5">
                                <FileText size={11} className="text-[#1967b3]" />
                                Citizenship / Licence No.
                            </Label>
                            <div className="relative">
                                <Input
                                    value={governmentId}
                                    onChange={e => onVerificationChange('governmentId', e.target.value)}
                                    placeholder="National ID or Driving Licence"
                                    className={cn(
                                        'h-12 text-[13px] px-4 rounded-2xl border-2 focus-visible:ring-0 font-bold transition-all',
                                        governmentId.length > 3 ? 'border-emerald-300 bg-emerald-50/20' : 'border-gray-200 bg-gray-50 focus-visible:border-[#1967b3]'
                                    )}
                                />
                                {governmentId.length > 3 && <CheckCircle2 size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-emerald-500" />}
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <Label className="text-[10px] font-black text-gray-500 uppercase tracking-widest flex items-center gap-1.5">
                                <Camera size={11} className="text-[#1967b3]" />
                                Front Photo <span className="text-gray-400 font-bold normal-case ml-1">(max 300 KB)</span>
                            </Label>
                            <div className="relative group">
                                <input
                                    type="file"
                                    id="device-photo"
                                    className="hidden"
                                    accept="image/*"
                                    onChange={e => {
                                        const file = e.target.files?.[0]
                                        if (!file) return
                                        if (file.size > 300 * 1024) {
                                            toast.error('Photo must be under 300 KB')
                                            e.target.value = ''
                                            return
                                        }
                                        const reader = new FileReader()
                                        reader.onloadend = () => onVerificationChange('devicePhoto', reader.result)
                                        reader.readAsDataURL(file)
                                    }}
                                />
                                <label
                                    htmlFor="device-photo"
                                    className={cn(
                                        'flex flex-col items-center justify-center gap-2.5 w-full h-32 rounded-2xl border-2 border-dashed cursor-pointer overflow-hidden relative transition-all',
                                        devicePhoto
                                            ? 'border-emerald-300'
                                            : 'bg-gray-50 border-gray-300 hover:border-[#1967b3] hover:bg-white'
                                    )}
                                >
                                    {devicePhoto ? (
                                        <>
                                            <Image src={devicePhoto as string} alt="Preview" fill className="object-cover" />
                                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1.5">
                                                <RotateCcw size={16} className="text-white" />
                                                <span className="text-[11px] font-bold text-white uppercase tracking-widest">Change Photo</span>
                                            </div>
                                        </>
                                    ) : (
                                        <>
                                            <div className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center">
                                                <UploadCloud size={18} className="text-[#1967b3]" />
                                            </div>
                                            <div className="text-center">
                                                <p className="text-[12px] font-bold text-gray-700">Tap to upload</p>
                                                <p className="text-[10px] font-semibold text-gray-400 mt-0.5">JPG / PNG only</p>
                                            </div>
                                        </>
                                    )}
                                </label>
                            </div>
                        </div>
                    </div>
                </div>

                {/* section 3: delivery */}
                <div className="bg-white rounded-3xl p-5 border border-gray-200/60 shadow-sm opacity-100">
                    <div className="flex items-center gap-2 mb-4">
                        <div className="w-6 h-6 rounded-full bg-[#1967b3]/10 flex items-center justify-center text-[#1967b3]">
                            <span className="text-[11px] font-black">3</span>
                        </div>
                        <h3 className="text-[12px] font-black uppercase tracking-widest text-gray-900">Delivery Mode</h3>
                        {(!pickupSelected || selectedAddress) && <CheckCircle2 size={14} className="text-emerald-500 ml-auto" />}
                    </div>

                    <div className="grid grid-cols-2 gap-3 mb-5">
                        {([
                            { label: 'Doorstep Pickup', icon: <Truck size={20} />, value: true },
                            { label: 'Walk-in Store', icon: <Store size={20} />, value: false },
                        ] as const).map(opt => (
                            <button
                                key={String(opt.value)}
                                onClick={() => onPickupSelect(opt.value)}
                                className={cn(
                                    'flex flex-col items-center justify-center gap-2.5 h-[85px] rounded-2xl border-2 text-[11px] font-black uppercase tracking-widest transition-all duration-300',
                                    pickupSelected === opt.value
                                        ? opt.value
                                            ? 'bg-[#1967b3] border-[#1967b3] text-white shadow-lg shadow-[#1967b3]/25 scale-[1.02]'
                                            : 'bg-gray-900 border-gray-900 text-white shadow-lg shadow-gray-900/25 scale-[1.02]'
                                        : 'bg-white border-gray-200 text-gray-500 hover:border-gray-300 hover:text-gray-700'
                                )}
                            >
                                {opt.icon}
                                <span>{opt.label}</span>
                            </button>
                        ))}
                    </div>

                    {pickupSelected && (
                        <div className="space-y-3">
                            <Label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Pickup Address</Label>
                            {isLoadingAddr ? (
                                <div className="py-8 flex justify-center">
                                    <Loader2 size={24} className="animate-spin text-[#1967b3]" />
                                </div>
                            ) : addrView === 'list' ? (
                                <div className="space-y-2.5">
                                    {savedAddresses.length > 0 ? savedAddresses.slice(0, 3).map(addr => {
                                        const isSel = selectedAddress?.id === addr.id

                                        return (
                                            <button
                                                key={addr.id}
                                                onClick={() => onAddressSelect(addr)}
                                                className={cn(
                                                    'w-full flex items-center gap-3.5 p-3.5 rounded-2xl border-2 text-left transition-all duration-200',
                                                    isSel
                                                        ? 'border-[#1967b3] bg-[#1967b3]/5 ring-2 ring-[#1967b3]/10'
                                                        : 'border-gray-100 bg-white hover:border-gray-300'
                                                )}
                                            >

                                                <div className="flex-1 min-w-0">
                                                    <span className={cn(
                                                        'text-[10px] font-black uppercase tracking-widest block mb-0.5',
                                                        isSel ? 'text-[#1967b3]' : 'text-gray-500'
                                                    )}>{addr.address?.label || 'Home'}</span>
                                                    <p className="text-[13px] font-bold text-gray-900 truncate">{addr.address?.landmark || addr.address?.city}</p>
                                                    <p className="text-[11px] text-gray-500 font-medium truncate">{addr.address?.district}, {addr.address?.province}</p>
                                                </div>
                                                {isSel && <CheckCircle2 size={18} className="text-[#1967b3] shrink-0" />}
                                            </button>
                                        )
                                    }) : (
                                        <div className="flex flex-col items-center py-8 rounded-2xl bg-gray-50 border-2 border-dashed border-gray-200">
                                            <MapPin size={24} className="text-gray-400 mb-2" />
                                            <p className="text-[12px] font-bold text-gray-500">No saved addresses</p>
                                        </div>
                                    )}
                                    <button
                                        onClick={() => setAddrView('form')}
                                        className="w-full h-12 rounded-2xl border-2 border-dashed border-gray-200 text-[12px] font-bold text-gray-500 hover:border-[#1967b3] hover:text-[#1967b3] transition-colors flex items-center justify-center gap-2 bg-white"
                                    >
                                        <Plus size={14} /> Add New Address
                                    </button>
                                </div>
                            ) : (
                                <div className="bg-gray-50/50 rounded-2xl border border-gray-200 p-4 space-y-4">
                                    <div className="flex items-center gap-2 mb-1">
                                        <button
                                            onClick={() => setAddrView('list')}
                                            className="w-8 h-8 rounded-full bg-white hover:bg-gray-100 text-gray-500 flex items-center justify-center transition-colors shadow-sm"
                                        >
                                            <ChevronLeft size={16} />
                                        </button>
                                        <p className="text-[13px] font-black text-gray-900">New Pickup Address</p>
                                    </div>
                                    <div className="h-44 rounded-2xl overflow-hidden border-2 border-gray-200 shadow-inner">
                                        <GoogleMapAddress onLocationSelect={handleMapSelect} initialPosition={mapLocation || undefined} />
                                    </div>
                                    <div className="grid grid-cols-2 gap-3">
                                        {([
                                            { label: 'City *', key: 'city' },
                                            { label: 'Province *', key: 'province' },
                                            { label: 'District', key: 'district' },
                                            { label: 'Landmark', key: 'landmark' },
                                        ] as const).map(f => (
                                            <div key={f.key} className="space-y-1.5">
                                                <Label className="text-[10px] uppercase font-black text-gray-500">{f.label}</Label>
                                                <Input
                                                    value={addrForm[f.key as keyof typeof addrForm]}
                                                    onChange={e => setAddrForm(p => ({ ...p, [f.key]: e.target.value }))}
                                                    className="h-11 text-[13px] rounded-xl border-gray-300 bg-white focus-visible:ring-0 focus-visible:border-[#1967b3]"
                                                />
                                            </div>
                                        ))}
                                    </div>
                                    {mapLocation && (
                                        <div className="flex items-center gap-2 text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-2.5">
                                            <MapPin size={12} className="shrink-0" />
                                            GPS Confirmed
                                        </div>
                                    )}
                                    <Button
                                        onClick={handleSaveAddress}
                                        disabled={isSaving}
                                        className="w-full h-12 rounded-xl text-[12px] font-black text-white bg-[#1967b3] hover:bg-[#1967b3]/90 shadow-lg shadow-[#1967b3]/20"
                                    >
                                        {isSaving ? <Loader2 size={16} className="animate-spin" /> : 'Save Address'}
                                    </Button>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Bottom Floating Bar */}
            <div className="absolute bottom-0 left-0 right-0 p-4 bg-white/90 backdrop-blur-xl border-t border-gray-100 shadow-[0_-10px_40px_-10px_rgba(0,0,0,0.05)] z-20">
                <div className="max-w-xl mx-auto flex flex-col items-center gap-2">
                    {!isLoggedIn ? (
                        <Button
                            onClick={onLoginRequest}
                            className="w-full h-14 rounded-2xl text-[13px] font-black uppercase tracking-widest text-white shadow-lg bg-[#eb5a2c] hover:bg-[#d64e23]"
                        >
                            Login to Submit
                        </Button>
                    ) : (
                        <Button
                            onClick={onCheckout}
                            disabled={!canSubmit}
                            className={cn(
                                'w-full h-14 rounded-2xl text-[13px] font-black uppercase tracking-widest transition-all duration-300 flex items-center justify-center gap-2',
                                canSubmit
                                    ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-xl shadow-emerald-600/20 scale-[1.01]'
                                    : 'bg-gray-100 text-gray-400 cursor-not-allowed shadow-none'
                            )}
                        >
                            <CheckCircle2 size={18} />
                            Submit Exchange
                        </Button>
                    )}
                    {!canSubmit && isLoggedIn && (
                        <p className="text-[11px] font-bold text-gray-400 flex items-center gap-1.5 mt-1">
                            <AlertCircle size={12} />
                            Complete all details above to proceed
                        </p>
                    )}
                </div>
            </div>
        </div>
    )
}
