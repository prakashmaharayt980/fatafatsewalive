'use client'

import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import {
    Loader2, CheckCircle2, RotateCcw, Camera,
    FileText, Hash, UploadCloud, ChevronLeft,
    Plus, MapPin, Navigation, Phone,
    User, Check, Crosshair, Trash2, Edit2,
    Wrench, X, AlertTriangle
} from 'lucide-react'
import { toast } from 'sonner'

import { cn } from '@/lib/utils'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'

import type { ShippingAddress } from '../../checkout/checkoutTypes'
import { ShippingAddressList, ShippingAddressUpdate, CreateShippingAddress, ShippingAddressDelete } from '@/app/api/services/address.service'
import GoogleMapAddress, { type LocationData } from '../../checkout/GoogleMapAddress'
import { REPAIR_CATEGORIES, type RepairCategory } from '../repair-helpers'

interface Props {
    selectedProduct: any
    isLoadingDetail: boolean
    selectedRepairs: string[]
    onToggleRepair: (id: string) => void
    issueDescription: string
    onDescriptionChange: (val: string) => void
    photoUrls: string[]
    onPhotoUpload: (files: File[]) => void
    onPhotoRemove: (index: number) => void
    pickupSelected: boolean
    onPickupSelect: (selected: boolean) => void
    onCheckout: () => void
    onLoginRequest: () => void
    isLoggedIn: boolean
    selectedAddress: ShippingAddress | null
    onAddressSelect: (address: ShippingAddress) => void
    serialNumber: string

    phoneNumber: string
    onVerificationChange: (key: 'serialNumber'  | 'phoneNumber', value: string) => void
    isSubmitting: boolean
}

export default function RepairForm({
    selectedProduct,
    isLoadingDetail,
    selectedRepairs,
    onToggleRepair,
    issueDescription,
    onDescriptionChange,
    photoUrls,
    onPhotoUpload,
    onPhotoRemove,
    pickupSelected,
    onPickupSelect,
    onCheckout,
    onLoginRequest,
    isLoggedIn,
    selectedAddress,
    onAddressSelect,
    serialNumber,
  
    phoneNumber,
    onVerificationChange,
    isSubmitting,
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
    const fileInputRef = useRef<HTMLInputElement>(null)

    useEffect(() => {
        if (!isLoggedIn || addrView !== 'list') return
        if (savedAddresses.length > 0) return
        setIsLoadingAddr(true)
        ShippingAddressList()
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
            landmark: loc.addressComponents?.municipality ?? loc.addressComponents?.city ?? p.landmark,
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
                ? await ShippingAddressUpdate(editingId, payload)
                : await CreateShippingAddress(payload)

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
            await ShippingAddressDelete(id)
            setSavedAddresses(p => p.filter(a => a.id !== id))
            if (selectedAddress?.id === id) onAddressSelect(null as any)
            toast.success('Address deleted')
        } catch {
            toast.error('Failed to delete address')
        }
    }

    const isVerified = serialNumber.trim().length > 3 &&  phoneNumber.trim().length > 3
    const canSubmit = selectedRepairs.length > 0 && isVerified && (!!selectedAddress)

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

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || [])
        onPhotoUpload(files)
    }

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
                            {(['Repair', 'Verification', 'Address'] as const).map((label, i) => {
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

                {/* ── Step 1: Repair Selection ── */}
                {step === 1 && (
                    <section className="space-y-6">
                        <div className="flex items-center justify-between">
                            <h3 className="text-[11px] font-black uppercase tracking-widest text-[var(--colour-fsP2)]">What Needs Repair?</h3>
                            {selectedRepairs.length > 0 && <CheckCircle2 size={14} className="text-emerald-500" />}
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            {REPAIR_CATEGORIES.map((cat) => {
                                const isSel = selectedRepairs.includes(cat.id)
                                return (
                                    <button
                                        key={cat.id}
                                        onClick={() => onToggleRepair(cat.id)}
                                        className={cn(
                                            'flex flex-col items-start gap-2 p-3.5 rounded-xl border-2 transition-all duration-200 text-left',
                                            isSel ? 'border-[var(--colour-fsP2)] bg-[var(--colour-fsP2)]/5 shadow-sm' : 'border-gray-100 bg-white hover:border-gray-200'
                                        )}
                                    >
                                        <div className="flex items-center justify-between w-full">
                                            <span className="text-xl">{cat.icon}</span>
                                            {isSel && <Check className="w-4 h-4 text-[var(--colour-fsP2)]" strokeWidth={3} />}
                                        </div>
                                        <span className={cn('text-[13px] font-bold', isSel ? 'text-[var(--colour-fsP2)]' : 'text-gray-800')}>{cat.label}</span>
                                        <span className="text-[10px] text-gray-400 leading-tight line-clamp-1">{cat.description}</span>
                                    </button>
                                )
                            })}
                        </div>

                        <div className="space-y-3 pt-4 border-t border-gray-100">
                            <p className="text-[11px] font-black uppercase tracking-widest text-[var(--colour-fsP2)]">Issue Details</p>
                            <textarea
                                value={issueDescription}
                                onChange={e => onDescriptionChange(e.target.value)}
                                placeholder="Tell us more about the problem..."
                                className="w-full h-32 p-4 border-2 border-gray-100 bg-white rounded-xl text-[13px] leading-relaxed resize-none focus:border-[var(--colour-fsP2)] transition-colors placeholder:text-gray-400 outline-none"
                            />
                        </div>

                        <div className="pt-2">
                            <NavBtn
                                label={isLoggedIn ? 'Next' : 'Login to Continue'}
                                onClick={() => isLoggedIn ? setStep(2) : onLoginRequest()}
                                disabled={selectedRepairs.length === 0}
                            />
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
                                <Hash size={15} /> Serial / IMEI Number
                            </Label>
                            <Input
                                value={serialNumber}
                                onChange={e => onVerificationChange('serialNumber', e.target.value)}
                                placeholder="IMEI number (dial *#06#)"
                                className="h-12 text-sm px-4 rounded-xl border-2 border-gray-100 bg-gray-50 focus:bg-white focus:border-[var(--colour-fsP2)] font-bold transition-all focus-visible:ring-0"
                            />
                        </div>

                 

                        <div className="space-y-2">
                            <Label className="text-[10px] font-bold text-[var(--colour-fsP2)] uppercase tracking-widest flex items-center gap-2">
                                <Phone size={15} /> Contact Number
                            </Label>
                            <Input
                                value={phoneNumber}
                                onChange={e => onVerificationChange('phoneNumber', e.target.value)}
                                placeholder="98XXXXXXXX"
                                className="h-12 text-sm px-4 rounded-xl border-2 border-gray-100 bg-gray-50 focus:bg-white focus:border-[var(--colour-fsP2)] font-bold transition-all focus-visible:ring-0"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label className="text-[10px] font-bold text-[var(--colour-fsP2)] uppercase tracking-widest flex items-center gap-2">
                                <Camera size={15} /> Issue Photos
                                <span className="text-gray-300 font-medium normal-case tracking-normal">(optional)</span>
                            </Label>
                            <div className="flex flex-wrap gap-2">
                                {photoUrls.map((url, i) => (
                                    <div key={i} className="relative w-24 h-24 rounded-xl overflow-hidden border-2 border-gray-100 group">
                                        <Image src={url} alt="Issue" fill className="object-cover" />
                                        <button
                                            onClick={() => onPhotoRemove(i)}
                                            className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            <X size={12} />
                                        </button>
                                    </div>
                                ))}
                                {photoUrls.length < 5 && (
                                    <button
                                        onClick={() => fileInputRef.current?.click()}
                                        className="w-24 h-24 rounded-xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center gap-1 text-gray-400 hover:border-[var(--colour-fsP2)] hover:text-[var(--colour-fsP2)] hover:bg-white transition-all"
                                    >
                                        <UploadCloud size={20} />
                                        <span className="text-[9px] font-bold uppercase">Add Photo</span>
                                    </button>
                                )}
                            </div>
                            <input ref={fileInputRef} type="file" multiple className="hidden" accept="image/*" onChange={handleFileChange} />
                        </div>

                        <div className="pt-2">
                            <NavBtn
                                label={isLoggedIn ? 'Next' : 'Login to Continue'}
                                onClick={() => isLoggedIn ? setStep(3) : onLoginRequest()}
                                disabled={!isVerified}
                            />
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
                                                    <span className={cn('text-[9px] font-black uppercase tracking-widest block', isSel ? 'text-[var(--colour-fsP2)]' : 'text-gray-400')}>
                                                        {addr.address?.label ?? 'Pickup Location'}
                                                    </span>
                                                    <p className="text-[12.5px] font-semibold text-gray-800 leading-snug">
                                                        {[addr.address?.city, addr.address?.district, addr.address?.province].filter(Boolean).join(', ')}
                                                    </p>
                                                    {addr.address?.landmark && <p className="text-[11px] font-medium text-gray-500">Near: {addr.address.landmark}</p>}
                                                </div>

                                                <div className="flex flex-col gap-1.5 shrink-0">
                                                    <button onClick={e => { e.stopPropagation(); openForm(addr) }} className="p-1.5 rounded-lg text-gray-400 hover:text-[var(--colour-fsP2)] hover:bg-blue-50 transition-colors"><Edit2 size={13} /></button>
                                                    <button onClick={e => { e.stopPropagation(); addr.id && handleDelete(addr.id) }} className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"><Trash2 size={13} /></button>
                                                </div>
                                            </div>
                                        )
                                    })
                                ) : (
                                    <div className="flex flex-col items-center py-10 rounded-2xl bg-gray-50">
                                        <MapPin size={22} className="text-gray-200 mb-2" />
                                        <p className="text-[11px] font-bold text-gray-400">No saved addresses</p>
                                    </div>
                                )}

                                {savedAddresses.length < 4 && (
                                    <button
                                        onClick={() => openForm()}
                                        className="w-full h-11 rounded-xl border border-dashed border-gray-200 text-[11px] font-bold uppercase tracking-widest text-gray-400 hover:border-[var(--colour-fsP2)] hover:text-[var(--colour-fsP2)] hover:bg-[var(--colour-fsP2)]/[0.03] transition-all flex items-center justify-center gap-1.5"
                                    >
                                        <Plus size={12} /> Add Pickup Address
                                    </button>
                                )}

                                <div className="bg-amber-50 border border-amber-200 p-3.5 rounded-xl flex items-start gap-3 mt-4">
                                    <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                                    <p className="text-[11px] text-amber-800 font-medium leading-relaxed">
                                        Our technician will contact you for a physical inspection. Estimated costs will be provided after diagnosis.
                                    </p>
                                </div>

                                {(!isLoggedIn || canSubmit) && (
                                    <button
                                        onClick={isLoggedIn ? onCheckout : onLoginRequest}
                                        disabled={isSubmitting}
                                        className="w-full h-11 mt-2 flex items-center justify-center gap-2 rounded-xl text-[13px] font-bold text-white bg-[var(--colour-fsP2)] hover:opacity-90 transition-all active:scale-[0.98] disabled:opacity-50"
                                    >
                                        {isSubmitting ? <Loader2 className="animate-spin" /> : (isLoggedIn ? 'Submit Repair Request' : 'Login to Continue')}
                                    </button>
                                )}
                            </div>
                        )}

                        {addrView === 'form' && (
                            <div className="space-y-4">
                                <button onClick={closeForm} className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-[var(--colour-fsP2)] transition-colors"><ChevronLeft size={14} /> Back</button>
                                <div className="h-52 rounded-2xl overflow-hidden relative">
                                    <GoogleMapAddress onLocationSelect={handleMapSelect} initialPosition={mapLocation ?? undefined} />
                                </div>
                                <div className="grid grid-cols-3 gap-2">
                                    {(['province', 'district', 'city'] as const).map(f => (
                                        <div key={f} className="space-y-1">
                                            <Label className="text-[9px] font-black text-gray-400 uppercase tracking-widest">{f}</Label>
                                            <Input
                                                value={addrForm[f]}
                                                onChange={e => setAddrForm(p => ({ ...p, [f]: e.target.value }))}
                                                className="h-9 rounded-xl bg-gray-50 border-gray-100 text-xs font-medium focus-visible:ring-0"
                                            />
                                        </div>
                                    ))}
                                </div>
                                <div className="space-y-1">
                                    <Label className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Landmark / Tole</Label>
                                    <Input value={addrForm.landmark} onChange={e => setAddrForm(p => ({ ...p, landmark: e.target.value }))} className="h-9 rounded-xl bg-gray-50 border-gray-100 text-xs font-medium focus-visible:ring-0" />
                                </div>
                                <div className="grid grid-cols-2 gap-2">
                                    <div className="space-y-1">
                                        <Label className="text-[9px] font-black text-gray-400 uppercase tracking-widest">First Name</Label>
                                        <Input value={addrForm.first_name} onChange={e => setAddrForm(p => ({ ...p, first_name: e.target.value }))} className="h-9 rounded-xl bg-gray-50 border-gray-100 text-xs font-medium focus-visible:ring-0" />
                                    </div>
                                    <div className="space-y-1">
                                        <Label className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Last Name</Label>
                                        <Input value={addrForm.last_name} onChange={e => setAddrForm(p => ({ ...p, last_name: e.target.value }))} className="h-9 rounded-xl bg-gray-50 border-gray-100 text-xs font-medium focus-visible:ring-0" />
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <Label className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Contact Number</Label>
                                    <Input value={addrForm.contact_number} onChange={e => setAddrForm(p => ({ ...p, contact_number: e.target.value }))} className="h-9 rounded-xl bg-gray-50 border-gray-100 text-xs font-medium focus-visible:ring-0" />
                                </div>
                                <Button onClick={handleSaveAddress} disabled={isSaving} className="w-full h-11 bg-[var(--colour-fsP2)] text-white font-bold rounded-xl">{isSaving ? <Loader2 className="animate-spin" /> : 'Save Location'}</Button>
                            </div>
                        )}
                    </section>
                )}
            </div>
        </div>
    )
}
