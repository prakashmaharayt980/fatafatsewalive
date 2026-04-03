'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import Image from 'next/image'
import {
    ArrowLeft, ChevronRight, Info,
    Smartphone, ShieldCheck, HardDrive,
    XCircle, AlertTriangle, Monitor, Battery,
    Camera as CameraIcon, Volume2, Wifi, Settings2,
    Package, Receipt, Cable,
    UploadCloud, Check, Loader2, MapPin,
    TrendingUp, Wallet, ThumbsUp, AlertCircle,
    Hash, Phone, RefreshCw,
} from 'lucide-react'
import { toast } from 'sonner'

import { cn } from '@/lib/utils'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

import type { NavbarItem } from '@/app/context/navbar.interface'
import type { ShippingAddress } from '../../checkout/checkoutTypes'
import { ShippingAddressList, ShippingAddressUpdate, CreateShippingAddress } from '@/app/api/services/address.service'
import {
    type FullProduct, type ProductListItem, type ConditionAnswer,
    calculateExchangeValueBreakdown,
    getThumbnail, parsePrice,
} from '../exchange-helpers'
import GoogleMapAddress, { type LocationData } from '../../checkout/GoogleMapAddress'

interface Props {
    questions: any[]
    selectedCategory: NavbarItem | null
    selectedProduct: FullProduct | null
    isLoadingDetail: boolean
    conditionAnswers: ConditionAnswer
    exchangeValue: number
    valuationBreakdown: { label: string; value: number }[]
    isSatisfied: boolean | null
    onSatisfactionChange: (val: boolean) => void
    expectedAmount: string
    satisfactionReason: string
    onNegotiationChange: (key: string, val: string) => void
    pickupSelected: boolean
    onConditionAnswer: (key: string, value: any) => void
    onPickupSelect: (selected: boolean) => void
    onCheckout: () => void
    onLoginRequest: () => void
    isLoggedIn: boolean
    selectedAddress: ShippingAddress | null
    onAddressSelect: (address: ShippingAddress) => void
    serialNumber: string
    governmentId: string
    devicePhoto: string | null
    phoneNumber: string
    onVerificationChange: (key: string, value: any) => void
    availableProducts: ProductListItem[]
    isLoadingProducts: boolean
    onSearchProducts: (q: string) => void
    selectedNewProduct: ProductListItem | null
    onSelectNewProduct: (p: ProductListItem) => void
    onBack: () => void
}

interface State {
    stepIndex: number
    addrView: 'list' | 'form'
    savedAddresses: ShippingAddress[]
    isLoadingAddr: boolean
    isSaving: boolean
    editingId: number | null
    addrForm: { city: string; district: string; province: string; landmark: string; contact_number: string; first_name: string; last_name: string }
    newProductSearch: string
    mapLocation: LocationData | null
}

// ── Shared label style identical to OrdersSection ────────────────────────────
const SL = ({ children }: { children: React.ReactNode }) => (
    <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest border-b border-gray-100 pb-1.5 mb-3">
        {children}
    </p>
)

// ── Boolean question row used inside a grouped card ──────────────────────────
function BoolRow({ q, answers, onAnswer }: { q: any; answers: ConditionAnswer; onAnswer: (k: string, v: any) => void }) {
    return (
        <div className="px-4 py-4 space-y-3">
            <p className="text-[11px] font-bold text-slate-800 uppercase tracking-wide">{q.label}</p>
            <div className="grid grid-cols-2 gap-3">
                {q.options.map((opt: any) => {
                    const isSelected = String(answers[q.key]) === String(opt.value)
                    return (
                        <button
                            key={opt.label}
                            onClick={() => onAnswer(q.key, opt.value)}
                            className={cn(
                                'h-11 rounded-xl border-2 font-bold text-xs transition-all flex items-center justify-center gap-2',
                                isSelected
                                    ? 'border-[var(--colour-fsP2)] bg-[var(--colour-fsP2)] text-white shadow-md shadow-blue-100'
                                    : 'border-gray-100 bg-gray-50 text-slate-500 hover:border-gray-200'
                            )}
                        >
                            {isSelected && <Check size={14} strokeWidth={3} />}
                            {opt.label}
                        </button>
                    )
                })}
            </div>
        </div>
    )
}

// ── Icon map for multi-select options ────────────────────────────────────────
const ICONS: Record<string, React.ReactNode> = {
    Smartphone: <Smartphone size={18} />, Monitor: <Monitor size={18} />,
    Battery: <Battery size={18} />, Camera: <CameraIcon size={18} />,
    Volume2: <Volume2 size={18} />, Wifi: <Wifi size={18} />,
    Settings2: <Settings2 size={18} />, AlertTriangle: <AlertTriangle size={18} />,
    XCircle: <XCircle size={18} />, Package: <Package size={18} />,
    Receipt: <Receipt size={18} />, Cable: <Cable size={18} />,
    HardDrive: <HardDrive size={18} />,
}
const renderIcon = (name: string) => ICONS[name] ?? <Info size={18} />

export default function ExchangeForm({
    questions,
    selectedCategory,
    selectedProduct,
    conditionAnswers,
    exchangeValue,
    valuationBreakdown,
    isSatisfied,
    onSatisfactionChange,
    expectedAmount,
    satisfactionReason,
    onNegotiationChange,
    onConditionAnswer,
    onCheckout,
    isLoggedIn,
    selectedAddress,
    onAddressSelect,
    serialNumber,
    governmentId,
    devicePhoto,
    phoneNumber,
    onVerificationChange,
    availableProducts,
    isLoadingProducts,
    onSearchProducts,
    selectedNewProduct,
    onSelectNewProduct,
    onBack,
}: Props) {
    const [uiState, setUiState] = useState<State>({
        stepIndex: 0,
        addrView: 'list',
        savedAddresses: [],
        isLoadingAddr: false,
        isSaving: false,
        editingId: null,
        addrForm: { city: '', district: '', province: '', landmark: '', contact_number: '', first_name: '', last_name: '' },
        newProductSearch: '',
        mapLocation: null,
    })

    const updateUi = useCallback((upd: Partial<State>) => setUiState(p => ({ ...p, ...upd })), [])

    useEffect(() => {
        if (!isLoggedIn || uiState.addrView !== 'list' || uiState.savedAddresses.length > 0) return
        updateUi({ isLoadingAddr: true })
        ShippingAddressList()
            .then(res => {
                const list: ShippingAddress[] = Array.isArray(res) ? res : (res.data ?? [])
                updateUi({ savedAddresses: list })
                if (list.length > 0 && !selectedAddress) onAddressSelect(list[0])
            })
            .catch(() => { })
            .finally(() => updateUi({ isLoadingAddr: false }))
    }, [isLoggedIn, uiState.addrView, uiState.savedAddresses.length, selectedAddress, onAddressSelect, updateUi])

    const handleMapSelect = (loc: LocationData) => {
        updateUi({
            mapLocation: loc,
            addrForm: {
                ...uiState.addrForm,
                province: loc.addressComponents?.province ?? uiState.addrForm.province,
                district: loc.addressComponents?.district ?? uiState.addrForm.district,
                city: loc.addressComponents?.municipality ?? loc.addressComponents?.city ?? uiState.addrForm.city,
                landmark: loc.addressComponents?.tole ?? loc.addressComponents?.city ?? uiState.addrForm.landmark,
            }
        })
    }

    const openForm = (addr?: ShippingAddress) => {
        if (addr) {
            updateUi({
                editingId: addr.id ?? null, addrView: 'form',
                addrForm: {
                    city: addr.address.city ?? '', district: addr.address.district ?? '',
                    province: addr.address.province ?? '', landmark: addr.address.landmark ?? '',
                    contact_number: addr.contact_info?.contact_number ?? '',
                    first_name: addr.contact_info?.first_name ?? '', last_name: addr.contact_info?.last_name ?? '',
                },
                mapLocation: addr.geo?.lat ? { lat: addr.geo.lat, lng: addr.geo.lng!, address: addr.address.landmark ?? addr.address.city ?? '' } : null
            })
        } else {
            updateUi({
                editingId: null, addrView: 'form',
                addrForm: { city: '', district: '', province: '', landmark: '', contact_number: '', first_name: '', last_name: '' },
                mapLocation: null
            })
        }
    }

    const handleSaveAddress = async () => {
        const { addrForm, editingId, mapLocation } = uiState
        if (!addrForm.city || !addrForm.province) { toast.error('City and Province are required'); return }
        updateUi({ isSaving: true })
        try {
            const addrStr = [addrForm.landmark, addrForm.city, addrForm.district, addrForm.province].filter(Boolean).join(', ')
            const payload = {
                first_name: addrForm.first_name, last_name: addrForm.last_name,
                contact_number: addrForm.contact_number,
                lat: mapLocation?.lat ?? null, lng: mapLocation?.lng ?? null,
                label: 'Home', landmark: addrForm.landmark,
                city: addrForm.city, district: addrForm.district,
                province: addrForm.province, country: 'Nepal',
                address: addrStr, state: addrForm.province,
            }
            const res = editingId ? await ShippingAddressUpdate(editingId, payload) : await CreateShippingAddress(payload)
            const saved: ShippingAddress = {
                id: res?.id ?? editingId ?? Date.now(),
                contact_info: { first_name: payload.first_name, last_name: payload.last_name, contact_number: payload.contact_number },
                address: { label: 'Home', landmark: addrForm.landmark, city: addrForm.city, district: addrForm.district, province: addrForm.province, country: 'Nepal', is_default: false },
                geo: { lat: payload.lat, lng: payload.lng },
            }
            updateUi({
                savedAddresses: editingId ? uiState.savedAddresses.map(a => a.id === editingId ? saved : a) : [...uiState.savedAddresses, saved],
                addrView: 'list', editingId: null
            })
            onAddressSelect(saved)
            toast.success(editingId ? 'Address updated' : 'Address saved')
        } catch {
            toast.error('Failed to save address')
        } finally {
            updateUi({ isSaving: false })
        }
    }

    // ── Split flat questions into 3 grouped screens ──────────────────────────
    const baselineQs = useMemo(() => questions.filter(q => q.key === 'switch_on' || q.key === 'mdms_registered'), [questions])
    const defectQs   = useMemo(() => questions.filter(q => q.key === 'problems'), [questions])
    const docQs      = useMemo(() => questions.filter(q => q.key === 'under_warranty' || q.key === 'accessories'), [questions])

    // 7 fixed wizard screens
    const STEPS = useMemo(() => [
        { key: 'baseline',      label: 'Status',            group: 'Inspect' },
        { key: 'defects',       label: 'Defects',           group: 'Inspect' },
        { key: 'documentation', label: 'Warranty',          group: 'Inspect' },
        { key: 'satisfaction',  label: 'Review',            group: 'Review'  },
        { key: 'new_device',    label: 'Upgrade',           group: 'Upgrade' },
        { key: 'verification',  label: 'Verify',            group: 'Verify'  },
        { key: 'pickup',        label: 'Pickup',            group: 'Pickup'  },
        { key: 'summary',       label: 'Summary',           group: 'Review'  },
    ], [])

    const step    = STEPS[uiState.stepIndex]
    const totalSt = STEPS.length
    const pct     = ((uiState.stepIndex + 1) / totalSt) * 100

    const selectedNewProductPrice = selectedNewProduct ? parsePrice(selectedNewProduct.price) : 0
    const priceAfterExchange      = Math.max(0, selectedNewProductPrice - exchangeValue)

    // Compute depreciated base value from product price when exchangeValue is not yet ready
    const footerAmount = useMemo(() => {
        if (selectedNewProduct) return priceAfterExchange
        return exchangeValue
    }, [selectedNewProduct, priceAfterExchange, exchangeValue])

    const handleNext = () => {
        const currentKey = step?.key

        if (currentKey === 'baseline') {
            if (conditionAnswers.switch_on === undefined) return toast.error('Please confirm if the device switches on.')
            if (conditionAnswers.mdms_registered === undefined) return toast.error('Please confirm MDMS registration.')
        }

        if (currentKey === 'documentation') {
            if (conditionAnswers.under_warranty === undefined) return toast.error('Please select warranty status.')
        }

        if (currentKey === 'satisfaction') {
            if (isSatisfied === null) return toast.error('Please choose your satisfaction level.')
            if (isSatisfied === false) {
                if (!expectedAmount.trim()) return toast.error('Please enter your expected amount.')
                if (satisfactionReason.trim().length <= 5) return toast.error('Please provide a reason for negotiation.')
            }
        }

        if (currentKey === 'new_device' && !selectedNewProduct) {
            return toast.error('Please select an upgrade device.')
        }

        if (currentKey === 'verification') {
            if (serialNumber.trim().length <= 5) return toast.error('Please enter a valid IMEI/Serial Number.')
            if (governmentId.trim().length <= 5) return toast.error('Please enter your Government ID.')
            if (phoneNumber.trim().length <= 9) return toast.error('Please enter a valid phone number.')
            if (!devicePhoto) return toast.error('Please upload a photo of your device.')
        }

        if (currentKey === 'pickup' && !selectedAddress) {
            return toast.error('Please select a pickup address.')
        }

        if (uiState.stepIndex < STEPS.length - 1) updateUi({ stepIndex: uiState.stepIndex + 1 })
        else onCheckout()
    }

    const handleBack = () => {
        if (uiState.stepIndex > 0) updateUi({ stepIndex: uiState.stepIndex - 1 })
        else onBack()
    }

    const isStepValid = (): boolean => {
        switch (step?.key) {
            case 'baseline':
                return conditionAnswers.switch_on !== undefined && conditionAnswers.mdms_registered !== undefined
            case 'defects':
                return true
            case 'documentation':
                return conditionAnswers.under_warranty !== undefined
            case 'satisfaction':
                if (isSatisfied === true) return true
                if (isSatisfied === false) return expectedAmount.trim().length > 0 && satisfactionReason.trim().length > 5
                return false
            case 'new_device':
                return !!selectedNewProduct
            case 'verification':
                return serialNumber.trim().length > 5 && governmentId.trim().length > 5 && phoneNumber.trim().length > 9 && !!devicePhoto
            case 'pickup':
                return !!selectedAddress
            default:
                return true
        }
    }

    // ── Multi-select option card (defects + accessories) ─────────────────────
    const MultiCard = ({ opt, collection, qKey }: { opt: any; collection: any[]; qKey: string }) => {
        const isSelected = collection.some((x: any) => x.key === opt.key)
        return (
            <button
                onClick={() => {
                    const next = isSelected ? collection.filter((x: any) => x.key !== opt.key) : [...collection, opt]
                    onConditionAnswer(qKey, next)
                }}
                className={cn(
                    'flex flex-col items-start gap-2.5 p-4 rounded-2xl border-2 transition-all text-left group',
                    isSelected 
                        ? 'border-[var(--colour-fsP2)] bg-[var(--colour-fsP2)]/5 shadow-sm' 
                        : 'border-gray-100 bg-white hover:border-gray-200'
                )}
            >
                <div className="flex items-center justify-between w-full">
                    <div className={cn(
                        'w-8 h-8 rounded-lg flex items-center justify-center transition-colors',
                        isSelected ? 'bg-[var(--colour-fsP2)] text-white' : 'bg-gray-100 text-slate-400 group-hover:bg-gray-200'
                    )}>
                        {renderIcon(opt.icon)}
                    </div>
                    {isSelected && (
                        <div className="w-5 h-5 rounded-full bg-[var(--colour-fsP2)] flex items-center justify-center">
                            <Check size={10} strokeWidth={4} className="text-white" />
                        </div>
                    )}
                </div>
                <div className="space-y-0.5">
                    <p className={cn('text-[11px] font-black uppercase tracking-widest', isSelected ? 'text-[var(--colour-fsP2)]' : 'text-slate-700')}>
                        {opt.label}
                    </p>
                    <p className="text-[10px] text-slate-400 font-medium leading-tight">
                        {opt.description ?? 'Check for issues'}
                    </p>
                </div>
            </button>
        )
    }

    return (
        <div className="flex flex-col w-full h-full bg-white">

            {/* ── Top Progress Tracker (Repair Style) ── */}
            <div className="px-6 py-8 pb-10 bg-[#F5F7FA] shrink-0">
                <div className="relative w-full">
                    <div className="absolute top-[7px] left-0 w-full h-[2px] bg-gray-200 z-0 rounded-full" />
                    <div
                        className="absolute top-[7px] left-0 h-[2px] bg-[var(--colour-fsP2)] z-0 transition-all duration-500 ease-out rounded-full"
                        style={{ width: `${(uiState.stepIndex / (STEPS.length - 1)) * 100}%` }}
                    />
                    <div className="relative z-10 flex justify-between w-full">
                        {STEPS.map((s, i) => {
                            const isPast = uiState.stepIndex >= i
                            const isActive = uiState.stepIndex === i
                            const isFirst = i === 0
                            const isLast = i === STEPS.length - 1
                            return (
                                <div key={s.key} className="flex flex-col items-center">
                                    <div className={cn(
                                        'w-4 h-4 rounded-full border-2 transition-all duration-300 z-20',
                                        isPast ? 'border-[var(--colour-fsP2)] bg-[var(--colour-fsP2)] scale-110 shadow-md shadow-blue-200' : 'border-gray-300 bg-white'
                                    )} />
                                    <div className={cn(
                                        'absolute top-6 w-24 transition-opacity duration-300',
                                        isFirst ? 'left-0 text-left' : isLast ? 'right-0 text-right' : 'left-1/2 -translate-x-1/2 text-center',
                                        (isActive || isFirst || isLast) ? 'opacity-100' : 'opacity-0 pointer-events-none'
                                    )}>
                                        <span className={cn(
                                            'text-[9px] font-black uppercase tracking-widest leading-tight transition-colors duration-300 block',
                                            isActive ? 'text-[var(--colour-fsP2)]' : 'text-gray-400'
                                        )}>
                                            {s.label}
                                        </span>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto px-1">
                <div className="px-5 py-2">
                    <h2 className="text-[11px] font-black uppercase tracking-widest text-[var(--colour-fsP2)] mb-4">{step?.label}</h2>
                </div>

                {/* ── 1. BASELINE: switch_on + mdms_registered ── */}
                {step?.key === 'baseline' && baselineQs.length > 0 && (
                    <div className="px-5 pb-5">
                        <div className="border border-gray-200 rounded-xl overflow-hidden divide-y divide-gray-100">
                            {baselineQs.map(q => (
                                <BoolRow key={q.key} q={q} answers={conditionAnswers} onAnswer={onConditionAnswer} />
                            ))}
                        </div>
                    </div>
                )}

                {/* ── 2. DEFECTS: problems multi-select ── */}
                {step?.key === 'defects' && defectQs.length > 0 && (
                    <div className="px-5 pb-5">
                        <div className="border border-gray-200 rounded-xl overflow-hidden">
                            <div className="px-4 py-3 bg-gray-50/60 border-b border-gray-100">
                                <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest">
                                    Select any issues · Skip if none
                                </p>
                            </div>
                            <div className="p-3 grid grid-cols-2 gap-2">
                                {defectQs[0]?.options.map((opt: any) => (
                                    <MultiCard
                                        key={opt.key}
                                        opt={opt}
                                        collection={conditionAnswers.problems ?? []}
                                        qKey="problems"
                                    />
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* ── 3. DOCUMENTATION: under_warranty (bool) + accessories (multi) ── */}
                {step?.key === 'documentation' && docQs.length > 0 && (
                    <div className="px-5 pb-5 space-y-4">
                        {docQs.map(q => (
                            q.type === 'boolean' ? (
                                <div key={q.key} className="border border-gray-200 rounded-xl overflow-hidden">
                                    <BoolRow q={q} answers={conditionAnswers} onAnswer={onConditionAnswer} />
                                </div>
                            ) : (
                                <div key={q.key} className="border border-gray-200 rounded-xl overflow-hidden">
                                    <div className="px-4 py-3 bg-gray-50/60 border-b border-gray-100">
                                        <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest">
                                            Accessories / Documents · Select all you have
                                        </p>
                                    </div>
                                    <div className="p-3 grid grid-cols-3 gap-2">
                                        {q.options.map((opt: any) => (
                                            <MultiCard
                                                key={opt.key}
                                                opt={opt}
                                                collection={conditionAnswers.accessories ?? []}
                                                qKey="accessories"
                                            />
                                        ))}
                                    </div>
                                </div>
                            )
                        ))}
                    </div>
                )}

                {/* ── 4. SATISFACTION (The big price card) ── */}
                {step?.key === 'satisfaction' && (
                    <div className="px-5 pb-8 space-y-6 flex flex-col items-center text-center">
                        <div className="w-20 h-20 rounded-full bg-emerald-50 flex items-center justify-center mb-2">
                            <TrendingUp className="text-emerald-500" size={32} />
                        </div>
                        <div className="space-y-1">
                            <h3 className="text-xl font-black text-slate-900 tracking-tight">Are you happy with the offer?</h3>
                            <p className="text-xs font-medium text-slate-400 max-w-[240px] mx-auto">We've calculated the best possible market value for your device.</p>
                        </div>

                        <div className="w-full bg-[#F8FAFC] border-2 border-dashed border-slate-200 rounded-3xl p-8 relative overflow-hidden group">
                           <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:opacity-10 transition-opacity">
                               <RefreshCw size={120} />
                           </div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Estimated Exchange Credit</p>
                            <p className="text-4xl font-black text-[var(--colour-fsP2)] tracking-tighter">
                                Rs. {exchangeValue.toLocaleString()}
                            </p>
                        </div>

                        <div className="grid grid-cols-2 gap-4 w-full pt-2">
                            <button
                                onClick={() => onSatisfactionChange(true)}
                                className={cn(
                                    'flex flex-col items-center gap-3 p-5 rounded-3xl border-2 transition-all group',
                                    isSatisfied === true 
                                        ? 'border-[var(--colour-fsP2)] bg-[var(--colour-fsP2)] shadow-xl shadow-blue-100 scale-[1.02]' 
                                        : 'border-gray-100 bg-white hover:border-gray-200 text-slate-600'
                                )}
                            >
                                <div className={cn(
                                    'w-10 h-10 rounded-full flex items-center justify-center transition-colors',
                                    isSatisfied === true ? 'bg-white/20 text-white' : 'bg-gray-50 text-slate-400 group-hover:bg-gray-100'
                                )}>
                                    <ThumbsUp size={18} />
                                </div>
                                <div className="text-center">
                                    <p className={cn('text-xs font-black uppercase tracking-widest', isSatisfied === true ? 'text-white' : 'text-slate-800')}>Yes, Happy!</p>
                                    <p className={cn('text-[9px] font-medium mt-0.5', isSatisfied === true ? 'text-white/70' : 'text-slate-400')}>Proceed to upgrade</p>
                                </div>
                            </button>

                            <button
                                onClick={() => onSatisfactionChange(false)}
                                className={cn(
                                    'flex flex-col items-center gap-3 p-5 rounded-3xl border-2 transition-all group',
                                    isSatisfied === false 
                                        ? 'border-[var(--colour-fsP2)] bg-[var(--colour-fsP2)] shadow-xl shadow-blue-100 scale-[1.02]' 
                                        : 'border-gray-100 bg-white hover:border-gray-200 text-slate-600'
                                )}
                            >
                                <div className={cn(
                                    'w-10 h-10 rounded-full flex items-center justify-center transition-colors',
                                    isSatisfied === false ? 'bg-white/20 text-white' : 'bg-gray-50 text-slate-400 group-hover:bg-gray-100'
                                )}>
                                    <AlertCircle size={18} />
                                </div>
                                <div className="text-center">
                                    <p className={cn('text-xs font-black uppercase tracking-widest', isSatisfied === false ? 'text-white' : 'text-slate-800')}>Not Happy</p>
                                    <p className={cn('text-[9px] font-medium mt-0.5', isSatisfied === false ? 'text-white/70' : 'text-slate-400')}>I need a better offer</p>
                                </div>
                            </button>
                        </div>

                        {isSatisfied === false && (
                            <div className="w-full space-y-6 pt-6 border-t border-gray-100 animate-in fade-in slide-in-from-top-4 duration-500">
                                <div className="bg-blue-50/50 border border-blue-100 rounded-2xl p-4 flex items-start gap-4 text-left">
                                    <div className="p-2 bg-white rounded-xl text-[var(--colour-fsP2)] shadow-sm">
                                        <Info className="w-5 h-5" strokeWidth={2.5} />
                                    </div>
                                    <div className="space-y-0.5 text-left">
                                        <p className="text-sm font-black text-slate-900 leading-none">Negotiation Details</p>
                                        <p className="text-[11px] text-slate-600 font-medium">Tell us what you expected. Our team will review this.</p>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div className="space-y-2 text-left">
                                        <Label className="text-[10px] font-black text-[var(--colour-fsP2)] uppercase tracking-widest">Expected Amount (Rs.)</Label>
                                        <Input
                                            type="number"
                                            value={expectedAmount}
                                            onChange={e => onNegotiationChange('expectedAmount', e.target.value)}
                                            placeholder="e.g. 50000"
                                            className="h-12 text-sm px-4 rounded-xl border-2 border-gray-100 bg-gray-50 focus:bg-white focus:border-[var(--colour-fsP2)] font-bold transition-all focus-visible:ring-0"
                                        />
                                    </div>
                                    <div className="space-y-2 text-left">
                                        <Label className="text-[10px] font-black text-[var(--colour-fsP2)] uppercase tracking-widest">Why do you expect more?</Label>
                                        <textarea
                                            value={satisfactionReason}
                                            onChange={e => onNegotiationChange('satisfactionReason', e.target.value)}
                                            placeholder="Battery replaced, extra accessories, etc..."
                                            className="w-full h-32 p-4 border-2 border-gray-100 bg-gray-50 rounded-2xl text-xs font-bold leading-relaxed resize-none focus:bg-white focus:border-[var(--colour-fsP2)] transition-all placeholder:text-gray-400 outline-none"
                                        />
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* ── 5. NEW DEVICE PICKER ── */}
                {step?.key === 'new_device' && (
                    <div className="px-5 pb-5 space-y-4">
                        <div className="relative">
                            <HardDrive size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                            <Input
                                placeholder="Search model..."
                                value={uiState.newProductSearch}
                                onChange={e => { updateUi({ newProductSearch: e.target.value }); onSearchProducts(e.target.value) }}
                                className="h-10 pl-9 rounded-xl border-gray-200 text-sm"
                            />
                        </div>

                        {selectedNewProduct && (
                            <div className="flex items-center gap-3 px-3 py-2.5 border border-emerald-200 bg-emerald-50/40 rounded-xl">
                                <div className="relative w-9 h-9 shrink-0 rounded-lg border border-gray-100 bg-white overflow-hidden">
                                    <Image src={getThumbnail(selectedNewProduct)} alt={selectedNewProduct.name} fill className="object-contain p-0.5" unoptimized />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-[10px] font-semibold text-emerald-600 uppercase tracking-widest">Selected</p>
                                    <p className="text-xs font-bold text-slate-800 truncate">{selectedNewProduct.name}</p>
                                </div>
                                <Check size={14} className="text-emerald-500 shrink-0" />
                            </div>
                        )}

                        <div>
                            <SL>Available Devices</SL>
                            {isLoadingProducts ? (
                                <div className="flex justify-center py-10">
                                    <Loader2 size={20} className="animate-spin text-slate-400" />
                                </div>
                            ) : (
                                <div className="border border-gray-200 rounded-xl overflow-hidden divide-y divide-gray-100">
                                    {availableProducts.map(p => {
                                        const isSelected = selectedNewProduct?.id === p.id
                                        return (
                                            <div
                                                key={p.id}
                                                onClick={() => onSelectNewProduct(p)}
                                                className={cn(
                                                    'flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors',
                                                    isSelected ? 'bg-emerald-50/30' : 'bg-white hover:bg-gray-50/60'
                                                )}
                                            >
                                                <div className="relative w-10 h-10 shrink-0 rounded-lg border border-gray-100 bg-gray-50 overflow-hidden">
                                                    <Image src={getThumbnail(p)} alt={p.name} fill className="object-contain p-0.5" unoptimized />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-xs font-semibold text-slate-900 truncate">{p.name}</p>
                                                    <p className="text-[11px] text-slate-500 mt-0.5">{p.brand?.name}</p>
                                                </div>
                                                <div className={cn(
                                                    'w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0',
                                                    isSelected ? 'border-emerald-500 bg-emerald-500' : 'border-gray-300'
                                                )}>
                                                    {isSelected && <Check size={9} strokeWidth={4} className="text-white" />}
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* ── 6. VERIFICATION: IMEI + Gov ID + Phone ── */}
                {step?.key === 'verification' && (
                    <div className="px-5 pb-5 space-y-6">
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label className="text-[10px] font-bold text-[var(--colour-fsP2)] uppercase tracking-widest flex items-center gap-2">
                                    <ShieldCheck size={14} /> IMEI / Serial Number
                                </Label>
                                <Input
                                    value={serialNumber}
                                    onChange={e => onVerificationChange('serialNumber', e.target.value)}
                                    placeholder="Dial *#06# to get IMEI"
                                    className="h-12 text-sm px-4 rounded-xl border-2 border-gray-100 bg-gray-50 focus:bg-white focus:border-[var(--colour-fsP2)] font-bold transition-all focus-visible:ring-0"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-bold text-[var(--colour-fsP2)] uppercase tracking-widest flex items-center gap-2">
                                        <Hash size={14} /> Government ID
                                    </Label>
                                    <Input
                                        value={governmentId}
                                        onChange={e => onVerificationChange('governmentId', e.target.value)}
                                        placeholder="ID Number"
                                        className="h-12 text-sm px-4 rounded-xl border-2 border-gray-100 bg-gray-50 focus:bg-white focus:border-[var(--colour-fsP2)] font-bold transition-all focus-visible:ring-0"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-bold text-[var(--colour-fsP2)] uppercase tracking-widest flex items-center gap-2">
                                        <Phone size={14} /> Contact Phone
                                    </Label>
                                    <Input
                                        value={phoneNumber}
                                        onChange={e => onVerificationChange('phoneNumber', e.target.value)}
                                        placeholder="98XXXXXXXX"
                                        className="h-12 text-sm px-4 rounded-xl border-2 border-gray-100 bg-gray-50 focus:bg-white focus:border-[var(--colour-fsP2)] font-bold transition-all focus-visible:ring-0"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Device Photo */}
                        <div className="space-y-2">
                            <Label className="text-[10px] font-bold text-[var(--colour-fsP2)] uppercase tracking-widest flex items-center gap-2">
                                <CameraIcon size={14} /> Device Condition Photo
                            </Label>
                            <input type="file" id="devphoto" className="hidden" accept="image/*" onChange={e => {
                                const f = e.target.files?.[0]; if (!f) return
                                const r = new FileReader(); r.onloadend = () => onVerificationChange('devicePhoto', r.result); r.readAsDataURL(f)
                            }} />
                            <label htmlFor="devphoto" className={cn(
                                'flex flex-col items-center justify-center w-full h-40 rounded-2xl border-2 border-dashed cursor-pointer relative overflow-hidden transition-all',
                                devicePhoto ? 'border-emerald-400 bg-emerald-50/10' : 'border-gray-200 bg-gray-50 hover:border-[var(--colour-fsP2)] hover:bg-white group'
                            )}>
                                {devicePhoto ? (
                                    <>
                                        <Image src={devicePhoto} alt="Device" fill className="object-cover" unoptimized />
                                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                                            <span className="bg-white px-4 py-2 rounded-xl text-xs font-bold text-slate-900 shadow-lg">Change Photo</span>
                                        </div>
                                    </>
                                ) : (
                                    <div className="flex flex-col items-center gap-2 text-slate-400 group-hover:text-[var(--colour-fsP2)] transition-colors">
                                        <div className="p-3 rounded-full bg-white shadow-sm border border-gray-100">
                                            <UploadCloud size={24} />
                                        </div>
                                        <p className="text-[11px] font-bold uppercase tracking-wider">Tap to upload photo</p>
                                    </div>
                                )}
                            </label>
                        </div>
                    </div>
                )}

                {/* ── 6. PICKUP ADDRESS ── */}
                {step?.key === 'pickup' && (
                    <div className="px-5 pb-5 space-y-3">
                        {uiState.addrView === 'list' ? (
                            <>
                                <SL>Pickup Location</SL>
                                <div className="space-y-2.5">
                                    {uiState.savedAddresses.map(addr => {
                                        const isSel = selectedAddress?.id === addr.id
                                        return (
                                            <div
                                                key={addr.id}
                                                onClick={() => onAddressSelect(addr)}
                                                className={cn(
                                                    'flex items-start gap-3 p-4 rounded-2xl border-2 cursor-pointer transition-all duration-200',
                                                    isSel ? 'border-[var(--colour-fsP2)] bg-[var(--colour-fsP2)]/[0.03] shadow-sm' : 'border-gray-100 bg-white hover:border-gray-200'
                                                )}
                                            >
                                                <div className={cn(
                                                    'w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5',
                                                    isSel ? 'border-[var(--colour-fsP2)] bg-[var(--colour-fsP2)]' : 'border-gray-200'
                                                )}>
                                                    {isSel && <Check size={10} className="text-white" strokeWidth={3} />}
                                                </div>

                                                <div className="flex-1 min-w-0 space-y-0.5">
                                                    <span className={cn('text-[9px] font-black uppercase tracking-widest block', isSel ? 'text-[var(--colour-fsP2)]' : 'text-slate-400')}>
                                                        {addr.address?.label ?? 'Pickup Location'}
                                                    </span>
                                                    <p className="text-[12.5px] font-bold text-slate-800 leading-snug">
                                                        {[addr.address?.city, addr.address?.province].filter(Boolean).join(', ')}
                                                    </p>
                                                    {addr.address?.landmark && <p className="text-[11px] font-medium text-slate-500">Near: {addr.address.landmark}</p>}
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>
                                <button
                                    onClick={() => openForm()}
                                    className="w-full h-10 rounded-xl border-2 border-dashed border-gray-200 text-xs font-semibold text-slate-500 hover:border-slate-300 hover:text-slate-700 transition-all"
                                >
                                    + Add New Address
                                </button>
                            </>
                        ) : (
                            <>
                                <SL>New Address</SL>
                                <div className="space-y-3">
                                    <GoogleMapAddress onLocationSelect={handleMapSelect} initialPosition={uiState.mapLocation ?? undefined} />
                                    <div className="grid grid-cols-2 gap-3">
                                        {[
                                            ['First Name', 'first_name'], ['Last Name', 'last_name'],
                                            ['Phone', 'contact_number'], ['City', 'city'],
                                            ['District', 'district'], ['Province', 'province'],
                                            ['Landmark', 'landmark'],
                                        ].map(([ph, field]) => (
                                            <div key={field} className={cn('space-y-2', field === 'landmark' ? 'col-span-2' : '')}>
                                                <Label className="text-[10px] font-bold text-[var(--colour-fsP2)] uppercase tracking-widest">{ph}</Label>
                                                <Input
                                                    placeholder={`Enter ${ph.toLowerCase()}`}
                                                    value={(uiState.addrForm as any)[field]}
                                                    onChange={e => updateUi({ addrForm: { ...uiState.addrForm, [field]: e.target.value } })}
                                                    className="h-12 text-sm px-4 rounded-xl border-2 border-gray-100 bg-gray-50 focus:bg-white focus:border-[var(--colour-fsP2)] font-bold transition-all focus-visible:ring-0"
                                                />
                                            </div>
                                        ))}
                                    </div>
                                    <div className="flex gap-3 pt-2">
                                        <button 
                                            onClick={() => updateUi({ addrView: 'list' })} 
                                            className="flex-1 h-11 rounded-xl border-2 border-gray-100 text-xs font-bold text-slate-500 hover:bg-gray-50 transition-all"
                                        >
                                            Cancel
                                        </button>
                                        <button 
                                            onClick={handleSaveAddress} 
                                            disabled={uiState.isSaving} 
                                            className="flex-[2] h-11 rounded-xl bg-[var(--colour-fsP2)] text-white text-xs font-bold hover:opacity-90 disabled:opacity-50 transition-all shadow-md shadow-blue-100"
                                        >
                                            {uiState.isSaving ? 'Saving…' : 'Confirm Address'}
                                        </button>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                )}

                {/* ── 7. SUMMARY ── */}
                {step?.key === 'summary' && (
                    <div className="px-5 pb-5 space-y-4">

                        {/* Device being exchanged */}
                        <div className="space-y-2">
                            <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Device Being Exchanged</Label>
                            <div className="flex items-center gap-4 p-4 border-2 border-gray-100 rounded-3xl bg-white shadow-sm">
                                <div className="relative w-14 h-14 shrink-0 rounded-2xl border border-gray-100 bg-gray-50 overflow-hidden flex items-center justify-center">
                                    <Image src={getThumbnail(selectedProduct)} alt="Device" fill className="object-contain p-2" />
                                </div>
                                <div className="min-w-0">
                                    <p className="text-[10px] font-black text-[var(--colour-fsP2)] uppercase tracking-widest leading-none mb-1">{selectedCategory?.title}</p>
                                    <p className="text-[15px] font-bold text-slate-900 truncate leading-none">{selectedProduct?.name}</p>
                                </div>
                            </div>
                        </div>

                        {/* Valuation */}
                        <div>
                            <SL>Valuation Breakdown</SL>
                            <div className="border border-gray-200 rounded-xl overflow-hidden divide-y divide-gray-100">
                                {valuationBreakdown.map((item, idx) => (
                                    <div key={idx} className="flex justify-between items-center px-4 py-2.5 text-xs">
                                        <span className={cn('font-medium', item.value < 0 ? 'text-red-500' : 'text-slate-600')}>{item.label}</span>
                                        <span className={cn('font-bold', item.value < 0 ? 'text-red-500' : 'text-slate-800')}>
                                            {item.value > 0 ? '+' : ''}Rs. {Math.abs(item.value).toLocaleString()}
                                        </span>
                                    </div>
                                ))}
                                <div className="flex justify-between items-center px-4 py-3 bg-gray-50/60">
                                    <p className="text-xs font-bold text-slate-700">Exchange Credit</p>
                                    <p className="text-base font-bold text-[var(--colour-fsP2)]">Rs. {exchangeValue.toLocaleString()}</p>
                                </div>
                            </div>
                        </div>

                        {/* Upgrade device */}
                        {selectedNewProduct && (
                            <div>
                                <SL>Upgrade Device</SL>
                                <div className="border border-gray-200 rounded-xl overflow-hidden divide-y divide-gray-100">
                                    <div className="flex items-center gap-3 px-4 py-3">
                                        <div className="relative w-10 h-10 shrink-0 rounded-lg border border-gray-100 bg-gray-50 overflow-hidden">
                                            <Image src={getThumbnail(selectedNewProduct)} alt={selectedNewProduct.name} fill className="object-contain p-0.5" unoptimized />
                                        </div>
                                        <p className="text-xs font-semibold text-slate-900 truncate">{selectedNewProduct.name}</p>
                                    </div>
                                    <div className="flex justify-between px-4 py-2.5 text-xs">
                                        <span className="text-slate-500">Retail Price</span>
                                        <span className="font-semibold text-slate-800">Rs. {selectedNewProductPrice.toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between px-4 py-2.5 text-xs">
                                        <span className="text-slate-500">Exchange Credit</span>
                                        <span className="font-semibold text-emerald-600">−Rs. {exchangeValue.toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between items-center px-4 py-3 bg-gray-50/60">
                                        <p className="text-xs font-bold text-slate-700">Amount To Pay</p>
                                        <p className="text-base font-bold text-emerald-600">Rs. {priceAfterExchange.toLocaleString()}</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="flex gap-2.5 p-3 rounded-xl bg-orange-50 border border-orange-100">
                            <Info size={13} className="text-orange-500 shrink-0 mt-0.5" />
                            <p className="text-[11px] text-orange-700 font-medium leading-relaxed">
                                Final valuation confirmed after our technician's physical check at time of pickup.
                            </p>
                        </div>
                    </div>
                )}

            </div>

            {/* ── Footer ── */}
            <div className="shrink-0 flex items-center justify-between gap-4 px-5 py-3.5 border-t border-gray-100 bg-gray-50/40">
                <div>
                    <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest leading-none">
                        {selectedNewProduct ? 'Payable Amount' : 'Evaluated Price'}
                    </p>
                    <p className={cn(
                        'text-xl font-bold mt-0.5',
                        selectedNewProduct ? 'text-emerald-600' : 'text-slate-900'
                    )}>
                        Rs. {footerAmount.toLocaleString()}
                    </p>
                    {!selectedNewProduct && exchangeValue === 0 && footerAmount > 0 && (
                        <p className="text-[9px] text-slate-400 mt-0.5">Estimate · decreases with defects</p>
                    )}
                </div>
                <button
                    onClick={handleNext}
                    className={cn(
                        'flex items-center gap-1.5 px-6 h-10 rounded-xl font-bold text-sm transition-all shadow-md',
                        isStepValid()
                            ? 'bg-[var(--colour-fsP2)] text-white hover:opacity-90 active:scale-95 shadow-blue-100'
                            : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                    )}
                >
                    {uiState.stepIndex === STEPS.length - 1 ? 'Complete Exchange' : 'Continue'}
                    <ChevronRight size={16} />
                </button>
            </div>
        </div>
    )
}
