'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import {
    Loader2, CheckCircle2, RotateCcw, Camera,
    FileText, Hash, UploadCloud, ChevronLeft,
    Plus, MapPin, Navigation, Phone,
    User, Check, Crosshair, Trash2, Edit2
} from 'lucide-react'
import { toast } from 'sonner'

import { cn } from '@/lib/utils'
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

interface Props {
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
    phoneNumber: string
    onVerificationChange: (key: 'serialNumber' | 'governmentId' | 'devicePhoto' | 'phoneNumber', value: any) => void
    problems: string[]
    reason: string
    onConditionExtra: (key: 'problems' | 'reason', value: any) => void
}

export default function ExchangeForm({
    selectedCategory,
    isLoadingDetail,
    conditionAnswers,
    conditionComplete,
    pickupSelected,
    onConditionAnswer,
    onCheckout,
    onLoginRequest,
    isLoggedIn,
    selectedAddress,
    onAddressSelect,
    serialNumber,
    governmentId,
    devicePhoto,
    phoneNumber,
    onVerificationChange,
    problems,
    reason,
    onConditionExtra,
}: Props) {

    const [step, setStep] = useState(1)
    const [addrView, setAddrView] = useState<'list' | 'form'>('list')
    const [savedAddresses, setSavedAddresses] = useState<ShippingAddress[]>([])
    const [isLoadingAddr, setIsLoadingAddr] = useState(false)
    const [isSaving, setIsSaving] = useState(false)
    const [mapLocation, setMapLocation] = useState<LocationData | null>(null)
    const [editingId, setEditingId] = useState<number | null>(null)
    const [addrForm, setAddrForm] = useState({
        city: '', district: '', province: '', landmark: '',
        contact_number: '', first_name: '', last_name: ''
    })

    useEffect(() => {
        if (!isLoggedIn || addrView !== 'list') return
        if (savedAddresses.length > 0) return
        setIsLoadingAddr(true)
        AddressService.ShippingAddressList()
            .then(res => {
                const list: ShippingAddress[] = Array.isArray(res) ? res : (res.data ?? [])
                setSavedAddresses(list)
                if (list.length > 0 && !selectedAddress) onAddressSelect(list[0])
            })
            .catch(() => { })
            .finally(() => setIsLoadingAddr(false))
    }, [isLoggedIn, addrView])

    const handleMapSelect = (loc: LocationData) => {
        setMapLocation(loc)
        if (!loc.addressComponents) return
        setAddrForm(p => ({
            ...p,
            province: loc.addressComponents?.province ?? p.province,
            district: loc.addressComponents?.district ?? p.district,
            city: loc.addressComponents?.municipality ?? loc.addressComponents?.city ?? p.city,
            landmark: loc.addressComponents?.tole ?? loc.addressComponents?.city ?? p.landmark,
        }))
    }

    const openForm = (addr?: ShippingAddress) => {
        if (addr) {
            setAddrForm({
                city: addr.address.city ?? '',
                district: addr.address.district ?? '',
                province: addr.address.province ?? '',
                landmark: addr.address.landmark ?? '',
                contact_number: addr.contact_info?.contact_number ?? '',
                first_name: addr.contact_info?.first_name ?? '',
                last_name: addr.contact_info?.last_name ?? '',
            })
            setMapLocation(addr.geo?.lat ? {
                lat: addr.geo.lat, lng: addr.geo.lng!,
                address: addr.address.landmark ?? addr.address.city ?? ''
            } : null)
            setEditingId(addr.id ?? null)
        } else {
            setAddrForm({ city: '', district: '', province: '', landmark: '', contact_number: '', first_name: '', last_name: '' })
            setMapLocation(null)
            setEditingId(null)
        }
        setAddrView('form')
    }

    const closeForm = () => { setAddrView('list'); setEditingId(null) }

    const handleSaveAddress = async () => {
        if (!addrForm.city || !addrForm.province) {
            toast.error('City and Province are required')
            return
        }
        setIsSaving(true)
        try {
            const fullAddress = [addrForm.landmark, addrForm.city, addrForm.district, addrForm.province].filter(Boolean).join(', ')
            const payload = {
                first_name: addrForm.first_name || 'Customer',
                last_name: addrForm.last_name || 'User',
                contact_number: addrForm.contact_number || '0000000000',
                lat: mapLocation?.lat ?? null, lng: mapLocation?.lng ?? null,
                label: 'Home', landmark: addrForm.landmark,
                city: addrForm.city, district: addrForm.district,
                province: addrForm.province, country: 'Nepal',
                address: fullAddress, state: addrForm.province,
            }
            const res = editingId
                ? await AddressService.ShippingAddressUpdate(editingId, payload)
                : await AddressService.CreateShippingAddress(payload)

            const saved: ShippingAddress = {
                id: res?.id ?? editingId ?? Date.now(),
                contact_info: {
                    first_name: addrForm.first_name || 'Customer',
                    last_name: addrForm.last_name || 'User',
                    contact_number: addrForm.contact_number || '',
                },
                address: {
                    label: 'Home', landmark: addrForm.landmark,
                    city: addrForm.city, district: addrForm.district,
                    province: addrForm.province, country: 'Nepal', is_default: false,
                },
                geo: { lat: mapLocation?.lat ?? null, lng: mapLocation?.lng ?? null },
            }
            setSavedAddresses(p => editingId ? p.map(a => a.id === editingId ? saved : a) : [...p, saved])
            onAddressSelect(saved)
            closeForm()
            toast.success(editingId ? 'Address updated' : 'Address saved')
        } catch {
            toast.error('Failed to save address')
        } finally {
            setIsSaving(false)
        }
    }

    const handleDelete = async (id: number) => {
        try {
            await AddressService.ShippingAddressDelete(id)
            setSavedAddresses(p => p.filter(a => a.id !== id))
            if (selectedAddress?.id === id) onAddressSelect(null as any)
            toast.success('Address deleted')
        } catch {
            toast.error('Failed to delete address')
        }
    }

    const isVerified = serialNumber.trim().length > 3 && governmentId.trim().length > 3 && phoneNumber.trim().length > 3 && !!devicePhoto
    const canSubmit = conditionComplete && isVerified && (!pickupSelected || !!selectedAddress)
    const questions = GET_CONDITION_QUESTIONS(selectedCategory?.slug ?? 'mobile')

    const NavBtn = ({ label, onClick, disabled = false }: { label: string; onClick: () => void; disabled?: boolean }) => (
        <button
            onClick={onClick}
            disabled={disabled}
            className={cn(
                'w-full h-10 flex items-center justify-center gap-1.5 rounded-xl text-[11px] font-bold uppercase tracking-widest transition-all active:scale-[0.98]',
                disabled
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-[var(--colour-fsP2)] text-white hover:opacity-90'
            )}
        >
            {label}
            {!disabled && (
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
            )}
        </button>
    )

    return (
        <div className="flex py-4 flex-col h-full bg-[#F5F7FA]">
            <div className="px-4 py-5 space-y-5 max-w-2xl mx-auto w-full bg-[#F5F7FA]">

                {/* ── Step indicator ── */}
                <div className="relative w-full mb-10 mt-2 px-2 sm:px-0">
                    <div className="relative w-full">
                        <div className="absolute top-[7px] left-0 w-full h-[2px] bg-gray-200 z-0 rounded-full" />
                        <div
                            className="absolute top-[7px] left-0 h-[2px] bg-[var(--colour-fsP2)] z-0 transition-all duration-500 ease-out rounded-full"
                            style={{ width: `${((step - 1) / 2) * 100}%` }}
                        />
                        <div className="relative z-10 flex justify-between w-full">
                            {(['Condition', 'Verification', 'Address'] as const).map((label, i) => {
                                const s = i + 1
                                const isPast = step >= s
                                const isActive = step === s
                                const isFirst = i === 0
                                const isLast = i === 2
                                return (
                                    <div key={label} className="flex flex-col items-center cursor-pointer" onClick={() => setStep(s)}>
                                        <div className={cn(
                                            'w-4 h-4 rounded-full border-2 transition-all duration-300 z-20',
                                            isPast ? 'border-[var(--colour-fsP2)] bg-[var(--colour-fsP2)] scale-110 shadow-md shadow-blue-200' : 'border-gray-300 bg-white'
                                        )} />
                                        <div className={cn(
                                            'absolute top-6 w-24 sm:w-32',
                                            isFirst ? 'left-0 text-left' : isLast ? 'right-0 text-right' : 'left-1/2 -translate-x-1/2 text-center'
                                        )}>
                                            <span className={cn(
                                                'text-[10px] sm:text-xs font-bold uppercase tracking-wider transition-colors duration-300 block leading-tight',
                                                isActive ? 'text-[var(--colour-fsP2)]' : isPast ? 'text-[var(--colour-fsP2)] opacity-70' : 'text-gray-400'
                                            )}>
                                                {label}
                                            </span>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                </div>

                {/* ── Step 1: Condition ── */}
                {step === 1 && (
                    <section className="space-y-6  ">
                        <div className="flex items-center justify-between">
                            <h3 className="text-[11px] font-black uppercase tracking-widest text-[var(--colour-fsP2)]">Device Condition</h3>
                            {conditionComplete && <CheckCircle2 size={14} className="text-emerald-500" />}
                        </div>

                        {questions.map((q) => {
                            const val = conditionAnswers[q.key as keyof ConditionAnswer]
                            return (
                                <div key={q.key} className="space-y-3">
                                    <p className="text-[13px] font-bold text-gray-800 leading-snug">{q.label}</p>
                                    <RadioGroup
                                        value={val > 0 ? String(val) : ''}
                                        onValueChange={v => onConditionAnswer(q.key as any, Number(v))}
                                        className="grid grid-cols-2 gap-3"
                                    >
                                        {q.options.map(opt => {
                                            const isSel = val === opt.value
                                            const isGood = opt.label === 'Yes'
                                            return (
                                                <label
                                                    key={opt.label}
                                                    htmlFor={`${q.key}-${opt.label}`}
                                                    className={cn(
                                                        'flex items-center gap-3 p-3.5 rounded-xl border-2 transition-all duration-200 cursor-pointer select-none',
                                                        isSel
                                                            ? isGood ? 'bg-emerald-50/50 border-emerald-500' : 'bg-red-50/50 border-red-500'
                                                            : 'bg-white border-gray-100 hover:border-gray-200'
                                                    )}
                                                >
                                                    <div className={cn(
                                                        'w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all shrink-0',
                                                        isSel ? isGood ? 'border-emerald-500' : 'border-red-500' : 'border-gray-300'
                                                    )}>
                                                        {isSel && <div className={cn('w-1.5 h-1.5 rounded-full', isGood ? 'bg-emerald-500' : 'bg-red-500')} />}
                                                    </div>
                                                    <span className={cn('text-[12.5px] font-bold', isSel ? (isGood ? 'text-emerald-700' : 'text-red-700') : 'text-gray-500')}>
                                                        {opt.label}
                                                    </span>
                                                    <RadioGroupItem value={String(opt.value)} id={`${q.key}-${opt.label}`} className="sr-only" />
                                                </label>
                                            )
                                        })}
                                    </RadioGroup>
                                </div>
                            )
                        })}

                        <div className="pt-4 border-t border-gray-100 space-y-4">
                            <div>
                                <p className="text-[11px] font-black uppercase tracking-widest text-[var(--colour-fsP2)] mb-3">Current issues</p>
                                <div className="flex flex-wrap gap-2">
                                    {GET_PROBLEM_OPTIONS(selectedCategory?.slug ?? '').map(problem => {
                                        const isSel = problems.includes(problem)
                                        return (
                                            <button
                                                key={problem}
                                                type="button"
                                                onClick={() => onConditionExtra('problems', isSel ? problems.filter(p => p !== problem) : [...problems, problem])}
                                                className={cn(
                                                    'px-3.5 py-2 rounded-xl border-2 text-[12px] font-bold transition-all duration-200',
                                                    isSel ? 'border-[#eb5a2c] bg-[#eb5a2c]/5 text-[#eb5a2c]' : 'border-gray-100 bg-white text-gray-500 hover:border-gray-200'
                                                )}
                                            >
                                                {problem}
                                            </button>
                                        )
                                    })}
                                </div>
                            </div>

                            <div>
                                <p className="text-[11px] font-black uppercase tracking-widest text-[var(--colour-fsP2)] mb-3">Reason for exchanging</p>
                                <RadioGroup value={reason} onValueChange={v => onConditionExtra('reason', v)} className="space-y-2">
                                    {REASON_OPTIONS.map(r => (
                                        <label
                                            key={r}
                                            htmlFor={`reason-${r}`}
                                            className={cn(
                                                'flex items-center gap-3 px-4 py-3 rounded-xl border-2 cursor-pointer transition-all duration-200',
                                                reason === r ? 'border-[var(--colour-fsP2)] bg-[var(--colour-fsP2)]/5' : 'bg-white border-gray-100 hover:border-gray-200'
                                            )}
                                        >
                                            <div className={cn(
                                                'w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all shrink-0',
                                                reason === r ? 'border-[var(--colour-fsP2)]' : 'border-gray-300'
                                            )}>
                                                {reason === r && <div className="w-1.5 h-1.5 rounded-full bg-[var(--colour-fsP2)]" />}
                                            </div>
                                            <span className={cn('text-[13px] font-bold', reason === r ? 'text-[var(--colour-fsP2)]' : 'text-gray-600')}>
                                                {r}
                                            </span>
                                            <RadioGroupItem value={r} id={`reason-${r}`} className="sr-only" />
                                        </label>
                                    ))}
                                </RadioGroup>
                            </div>

                            <div className="pt-2">
                                {!isLoggedIn
                                    ? <button onClick={onLoginRequest} className="w-full h-10 flex items-center justify-center rounded-xl text-[11px] font-bold uppercase tracking-widest text-white bg-[#eb5a2c] hover:opacity-90 transition-all active:scale-[0.98]">Login to Continue</button>
                                    : <NavBtn label="Next" onClick={() => setStep(2)} disabled={!conditionComplete} />
                                }
                            </div>
                        </div>
                    </section>
                )}

                {/* ── Step 2: Verification ── */}
                {step === 2 && (
                    <section className="space-y-5">
                        <div className="flex items-center justify-between">
                            <h3 className="text-[11px] font-black uppercase tracking-widest text-[var(--colour-fsP2)]">Verification</h3>
                            {isVerified && <CheckCircle2 size={14} className="text-emerald-500" />}
                        </div>

                        <div className="space-y-2">
                            <Label className="text-[10px] font-bold text-[var(--colour-fsP2)] uppercase tracking-widest flex items-center gap-2">
                                <Hash size={15} className="text-[var(--colour-fsP2)]" />
                                Serial / IMEI Number
                            </Label>
                            <Input
                                value={serialNumber}
                                onChange={e => onVerificationChange('serialNumber', e.target.value)}
                                placeholder="Dial *#06# to find IMEI"
                                className={cn(
                                    'h-12 text-[14px] px-4 rounded-xl border-2 transition-all duration-200 focus-visible:ring-0 font-bold',
                                    serialNumber.length > 3
                                        ? 'border-[var(--colour-fsP2)] bg-blue-50/20'
                                        : 'border-gray-100 bg-gray-50/50 focus-visible:border-[var(--colour-fsP2)] focus-visible:bg-white'
                                )}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label className="text-[10px] font-bold text-[var(--colour-fsP2)] uppercase tracking-widest flex items-center gap-2">
                                <FileText size={15} className="text-[var(--colour-fsP2)]" />
                                Government ID Number
                            </Label>
                            <Input
                                value={governmentId}
                                onChange={e => onVerificationChange('governmentId', e.target.value)}
                                placeholder="Citizenship or Licence Number"
                                className={cn(
                                    'h-12 text-[14px] px-4 rounded-xl border-2 transition-all duration-200 focus-visible:ring-0 font-bold',
                                    governmentId.length > 3
                                        ? 'border-[var(--colour-fsP2)] bg-blue-50/20'
                                        : 'border-gray-100 bg-gray-50/50 focus-visible:border-[var(--colour-fsP2)] focus-visible:bg-white'
                                )}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label className="text-[10px] font-bold text-[var(--colour-fsP2)] uppercase tracking-widest flex items-center gap-2">
                                <Phone size={15} className="text-[var(--colour-fsP2)]" />
                                Device Owner's Phone Number
                            </Label>
                            <Input
                                value={phoneNumber}
                                onChange={e => onVerificationChange('phoneNumber', e.target.value)}
                                placeholder="98XXXXXXXX"
                                className={cn(
                                    'h-12 text-[14px] px-4 rounded-xl border-2 transition-all duration-200 focus-visible:ring-0 font-bold',
                                    phoneNumber.length >= 10
                                        ? 'border-[var(--colour-fsP2)] bg-blue-50/20'
                                        : 'border-gray-100 bg-gray-50/50 focus-visible:border-[var(--colour-fsP2)] focus-visible:bg-white'
                                )}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label className="text-[10px] font-bold text-[var(--colour-fsP2)] uppercase tracking-widest flex items-center gap-2">
                                <Camera size={15} className="text-[var(--colour-fsP2)]" />
                                Front Side Photo
                                <span className="text-gray-300 font-medium normal-case tracking-normal">(max 300 KB)</span>
                            </Label>
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
                                    'flex flex-col items-center justify-center gap-3 w-full h-32 rounded-2xl border-2 border-dashed cursor-pointer overflow-hidden relative transition-all duration-300',
                                    devicePhoto
                                        ? 'border-[var(--colour-fsP2)] bg-blue-50/10'
                                        : 'bg-gray-50/50 border-gray-200 hover:border-[var(--colour-fsP2)] hover:bg-white'
                                )}
                            >
                                {devicePhoto ? (
                                    <>
                                        <Image src={devicePhoto as string} alt="Preview" fill className="object-cover" />
                                        <div className="absolute inset-0 bg-black/60 opacity-0 hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2">
                                            <RotateCcw size={18} className="text-white" />
                                            <span className="text-[11px] font-bold text-white uppercase tracking-widest">Change Photo</span>
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <div className="w-11 h-11 rounded-full bg-white shadow-sm flex items-center justify-center border border-gray-100">
                                            <UploadCloud size={20} className="text-[var(--colour-fsP2)]" />
                                        </div>
                                        <div className="text-center">
                                            <p className="text-[13px] font-bold text-gray-700">Upload Device Front Photo</p>
                                            <p className="text-[10px] uppercase font-bold tracking-widest text-gray-400 mt-1">Tap to select</p>
                                        </div>
                                    </>
                                )}
                            </label>
                        </div>

                        <div className="pt-2">
                            {!isLoggedIn
                                ? <button onClick={onLoginRequest} className="w-full h-10 flex items-center justify-center rounded-xl text-[11px] font-bold uppercase tracking-widest text-white bg-[#eb5a2c] hover:opacity-90 transition-all active:scale-[0.98]">Login to Continue</button>
                                : <NavBtn label="Next" onClick={() => setStep(3)} disabled={!isVerified} />
                            }
                        </div>
                    </section>
                )}

                {/* ── Step 3: Address ── */}
                {step === 3 && (
                    <section className="space-y-3">
                        <div className="flex items-center justify-between">
                            <h3 className="text-[11px] font-black uppercase tracking-widest text-[var(--colour-fsP2)]">Pickup Address</h3>
                            {selectedAddress && <CheckCircle2 size={14} className="text-emerald-500" />}
                        </div>

                        {/* List */}
                        {addrView === 'list' && (
                            <div className="space-y-2">
                                {isLoadingAddr ? (
                                    <div className="py-10 flex items-center justify-center gap-2">
                                        <Loader2 size={16} className="animate-spin text-[var(--colour-fsP2)]" />
                                        <p className="text-[10px] font-bold text-gray-400">Loading...</p>
                                    </div>
                                ) : savedAddresses.length > 0 ? (
                                    savedAddresses.slice(0, 3).map(addr => {
                                        const isSel = selectedAddress?.id === addr.id
                                        const hasGeo = !!(addr.geo?.lat && addr.geo?.lng)
                                        return (
                                            <div
                                                key={addr.id}
                                                onClick={() => onAddressSelect(addr)}
                                                className={cn(
                                                    'flex items-start gap-3 p-3.5 rounded-2xl border-2 cursor-pointer transition-all duration-200',
                                                    isSel ? 'border-[var(--colour-fsP2)] bg-[var(--colour-fsP2)]/5' : 'border-gray-100 bg-white hover:border-gray-200'
                                                )}
                                            >
                                                <div className={cn(
                                                    'w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5',
                                                    isSel ? 'border-[var(--colour-fsP2)] bg-[var(--colour-fsP2)]' : 'border-gray-300'
                                                )}>
                                                    {isSel && <Check size={10} className="text-white" strokeWidth={3} />}
                                                </div>

                                                <div className="flex-1 min-w-0 space-y-0.5">
                                                    <span className={cn(
                                                        'text-[9px] font-black uppercase tracking-widest block',
                                                        isSel ? 'text-[var(--colour-fsP2)]' : 'text-gray-400'
                                                    )}>
                                                        {addr.address?.label ?? 'Home'}
                                                    </span>
                                                    <p className="text-[12.5px] font-semibold text-gray-800 leading-snug">
                                                        {[addr.address?.city, addr.address?.district, addr.address?.province].filter(Boolean).join(', ') || 'No address details'}
                                                    </p>
                                                    {addr.address?.landmark && (
                                                        <p className="text-[11px] font-medium text-[var(--colour-fsP2)]/80">
                                                            Near: <span className="font-bold">{addr.address.landmark}</span>
                                                        </p>
                                                    )}
                                                    {(addr.contact_info?.first_name || addr.contact_info?.contact_number) && (
                                                        <div className="flex items-center gap-3 pt-0.5 flex-wrap">
                                                            {addr.contact_info?.first_name && (
                                                                <span className="text-[10px] font-semibold text-gray-500 flex items-center gap-1">
                                                                    <User size={9} className="text-gray-400" />
                                                                    {addr.contact_info.first_name} {addr.contact_info.last_name ?? ''}
                                                                </span>
                                                            )}
                                                            {addr.contact_info?.contact_number && (
                                                                <span className="text-[10px] font-semibold text-gray-500 flex items-center gap-1">
                                                                    <Phone size={9} className="text-gray-400" />
                                                                    {addr.contact_info.contact_number}
                                                                </span>
                                                            )}
                                                        </div>
                                                    )}
                                                    {hasGeo && (
                                                        <div className="flex items-center gap-1 pt-0.5">
                                                            <span className="flex items-center gap-1 bg-green-50 border border-green-200 text-green-700 text-[9px] font-bold px-2 py-0.5 rounded-full">
                                                                <Crosshair size={8} /> GPS
                                                            </span>
                                                        </div>
                                                    )}
                                                </div>

                                                <div className="flex flex-col gap-1.5 shrink-0">
                                                    <button
                                                        onClick={e => { e.stopPropagation(); openForm(addr) }}
                                                        className="p-1.5 rounded-lg text-gray-400 hover:text-[var(--colour-fsP2)] hover:bg-blue-50 transition-colors"
                                                    >
                                                        <Edit2 size={13} />
                                                    </button>
                                                    <button
                                                        onClick={e => { e.stopPropagation(); addr.id && handleDelete(addr.id) }}
                                                        className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                                                    >
                                                        <Trash2 size={13} />
                                                    </button>
                                                </div>
                                            </div>
                                        )
                                    })
                                ) : (
                                    <div className="flex flex-col items-center py-10 rounded-2xl bg-gray-50">
                                        <MapPin size={22} className="text-gray-200 mb-2" />
                                        <p className="text-[11px] font-bold text-gray-400">No saved addresses</p>
                                        <p className="text-[10px] text-gray-300 mt-0.5">Add a pickup location below</p>
                                    </div>
                                )}

                                {savedAddresses.length < 4 && (
                                    <button
                                        onClick={() => openForm()}
                                        className="w-full h-11 rounded-xl border border-dashed border-gray-200 text-[11px] font-bold uppercase tracking-widest text-gray-400 hover:border-[var(--colour-fsP2)] hover:text-[var(--colour-fsP2)] hover:bg-[var(--colour-fsP2)]/[0.03] transition-all flex items-center justify-center gap-1.5"
                                    >
                                        <Plus size={12} /> Add Address
                                    </button>
                                )}

                                {/* Submit — only when ready */}
                                {!isLoggedIn ? (
                                    <button onClick={onLoginRequest} className="w-full h-10 mt-2 flex items-center justify-center rounded-xl text-[11px] font-bold uppercase tracking-widest text-white bg-[#eb5a2c] hover:opacity-90 transition-all active:scale-[0.98]">
                                        Login to Continue
                                    </button>
                                ) : canSubmit ? (
                                    <button
                                        onClick={onCheckout}
                                        className="w-full h-10 mt-2 flex items-center justify-center gap-2 rounded-xl text-[11px] font-bold uppercase tracking-widest text-white bg-[var(--colour-fsP2)] hover:opacity-90 transition-all active:scale-[0.98]"
                                    >
                                        <CheckCircle2 size={14} />
                                        Submit Exchange
                                    </button>
                                ) : null}
                            </div>
                        )}

                        {/* Form */}
                        {addrView === 'form' && (
                            <div className="space-y-4">
                                <button
                                    onClick={closeForm}
                                    className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-[var(--colour-fsP2)] transition-colors"
                                >
                                    <ChevronLeft size={14} />
                                    Back
                                </button>

                                <div className="h-52 rounded-2xl overflow-hidden relative">
                                    <GoogleMapAddress onLocationSelect={handleMapSelect} initialPosition={mapLocation ?? undefined} />
                                    {!mapLocation && (
                                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                            <div className="bg-white/90 px-4 py-2 rounded-full shadow flex items-center gap-2">
                                                <Navigation size={13} className="text-[var(--colour-fsP2)] animate-bounce" />
                                                <span className="text-[10px] font-bold text-gray-600">Tap map to pin location</span>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {mapLocation && (
                                    <div className="flex items-center gap-2 bg-green-50 border border-green-100 rounded-xl px-3 py-2">
                                        <Navigation size={11} className="shrink-0 text-green-500" />
                                        <span className="text-[11px] font-medium text-green-700 truncate">{mapLocation.address}</span>
                                    </div>
                                )}

                                <div className="grid grid-cols-3 gap-2">
                                    {([
                                        { label: 'Province', key: 'province', placeholder: 'Bagmati', req: true },
                                        { label: 'District', key: 'district', placeholder: 'Kathmandu', req: false },
                                        { label: 'City', key: 'city', placeholder: 'City', req: true },
                                    ] as const).map(f => (
                                        <div key={f.key} className="space-y-1">
                                            <Label className="text-[9px] font-black text-gray-400 uppercase tracking-widest">
                                                {f.label}{f.req && <span className="text-[#eb5a2c]">*</span>}
                                            </Label>
                                            <Input
                                                value={addrForm[f.key]}
                                                onChange={e => setAddrForm(p => ({ ...p, [f.key]: e.target.value }))}
                                                placeholder={f.placeholder}
                                                className="h-9 rounded-xl bg-gray-50 border-gray-200 focus:bg-white focus:border-[var(--colour-fsP2)] text-xs font-medium focus-visible:ring-0"
                                            />
                                        </div>
                                    ))}
                                </div>

                                <div className="space-y-1">
                                    <Label className="text-[9px] font-black text-gray-400 uppercase tracking-widest">
                                        Landmark <span className="normal-case font-medium text-gray-300">(optional)</span>
                                    </Label>
                                    <Input
                                        value={addrForm.landmark}
                                        onChange={e => setAddrForm(p => ({ ...p, landmark: e.target.value }))}
                                        placeholder="Near temple, school, etc."
                                        className="h-9 rounded-xl bg-gray-50 border-gray-200 focus:bg-white focus:border-[var(--colour-fsP2)] text-xs font-medium focus-visible:ring-0"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-2">
                                    <div className="space-y-1">
                                        <Label className="text-[9px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-1">
                                            <User size={9} className="text-[var(--colour-fsP2)]" />First Name
                                        </Label>
                                        <Input
                                            value={addrForm.first_name}
                                            onChange={e => setAddrForm(p => ({ ...p, first_name: e.target.value }))}
                                            placeholder="John"
                                            className="h-9 rounded-xl bg-gray-50 border-gray-200 focus:bg-white focus:border-[var(--colour-fsP2)] text-xs font-medium focus-visible:ring-0"
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <Label className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Last Name</Label>
                                        <Input
                                            value={addrForm.last_name}
                                            onChange={e => setAddrForm(p => ({ ...p, last_name: e.target.value }))}
                                            placeholder="Doe"
                                            className="h-9 rounded-xl bg-gray-50 border-gray-200 focus:bg-white focus:border-[var(--colour-fsP2)] text-xs font-medium focus-visible:ring-0"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-1">
                                    <Label className="text-[9px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
                                        <Phone size={9} className="text-[var(--colour-fsP2)]" />Pickup Contact Number
                                    </Label>
                                    <Input
                                        value={addrForm.contact_number}
                                        onChange={e => setAddrForm(p => ({ ...p, contact_number: e.target.value }))}
                                        placeholder="98XXXXXXXX"
                                        className="h-9 rounded-xl bg-gray-50 border-gray-200 focus:bg-white focus:border-[var(--colour-fsP2)] text-xs font-medium focus-visible:ring-0"
                                    />
                                </div>

                                <button
                                    onClick={handleSaveAddress}
                                    disabled={isSaving}
                                    className="w-full h-10 rounded-xl text-[11px] font-bold uppercase tracking-widest text-white bg-[var(--colour-fsP2)] hover:opacity-90 disabled:opacity-50 transition-all flex items-center justify-center gap-2 active:scale-[0.98]"
                                >
                                    {isSaving
                                        ? <Loader2 size={15} className="animate-spin" />
                                        : <><CheckCircle2 size={13} />{editingId ? 'Update' : 'Save'} Location</>
                                    }
                                </button>
                            </div>
                        )}
                    </section>
                )}
            </div>
        </div>
    )
}
