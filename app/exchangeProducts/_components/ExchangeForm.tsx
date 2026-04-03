'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import Image from 'next/image'
import {
    ChevronRight, Info,
    Smartphone, ShieldCheck, HardDrive,
    XCircle, AlertTriangle, Monitor, Battery,
    Camera as CameraIcon, Volume2, Wifi, Settings2,
    Package, Receipt, Cable,
    UploadCloud, Check, Loader2,
    ThumbsUp, AlertCircle,
    Hash, Phone,
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
    calculateExchangeValueBreakdown, EVALUATION_VALUES,
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

// ── Boolean question row — inline: question left, Yes/No buttons right ───────
function BoolRow({ q, answers, onAnswer }: { q: any; answers: ConditionAnswer; onAnswer: (k: string, v: any) => void }) {
    return (
        <div className="flex items-center justify-between px-4 py-3 gap-4">
            <p className="text-xs font-semibold text-slate-700 flex-1 leading-snug">{q.label}</p>
            <div className="flex items-center gap-2 shrink-0">
                {q.options.map((opt: any) => {
                    const isSelected = String(answers[q.key]) === String(opt.value)
                    return (
                        <button
                            key={opt.label}
                            onClick={() => onAnswer(q.key, opt.value)}
                            className={cn(
                                'h-8 px-5 rounded-lg border font-bold text-xs transition-all',
                                isSelected
                                    ? 'border-(--colour-fsP2) bg-(--colour-fsP2) text-white'
                                    : 'border-gray-200 bg-white text-slate-500 hover:border-gray-300 hover:bg-gray-50'
                            )}
                        >
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
    const defectQs = useMemo(() => questions.filter(q => q.key === 'problems'), [questions])
    const docQs = useMemo(() => questions.filter(q => q.key === 'under_warranty' || q.key === 'accessories'), [questions])

    // 7 fixed wizard screens
    const STEPS = useMemo(() => [
        { key: 'baseline', label: 'Status', group: 'Inspect' },
   
        { key: 'documentation', label: 'Warranty', group: 'Inspect' },
        { key: 'satisfaction', label: 'Review', group: 'Review' },
        { key: 'new_device', label: 'Upgrade', group: 'Upgrade' },
        { key: 'verification', label: 'Verify', group: 'Verify' },
        { key: 'pickup', label: 'Pickup', group: 'Pickup' },
        { key: 'summary', label: 'Summary', group: 'Review' },
    ], [])

    const step = STEPS[uiState.stepIndex]
    const totalSt = STEPS.length
    const pct = ((uiState.stepIndex + 1) / totalSt) * 100

    const selectedNewProductPrice = selectedNewProduct ? parsePrice(selectedNewProduct.price) : 0
    const priceAfterExchange = Math.max(0, selectedNewProductPrice - exchangeValue)

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
     
            case 'documentation':
                return conditionAnswers.under_warranty !== undefined
            case 'satisfaction':
                return isSatisfied !== null
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

    // ── Multi-select row (defects + accessories) ────────────────────────────
    const MultiCard = ({ opt, collection, qKey }: { opt: any; collection: any[]; qKey: string }) => {
        const isSelected = collection.some((x: any) => x.key === opt.key)
        return (
            <button
                onClick={() => {
                    const next = isSelected ? collection.filter((x: any) => x.key !== opt.key) : [...collection, opt]
                    onConditionAnswer(qKey, next)
                }}
                className={cn(
                    'flex items-center gap-3 px-4 py-2.5 w-full text-left',
                    isSelected ? 'bg-gray-50' : 'bg-white hover:bg-gray-50'
                )}
            >
                <div className={cn(
                    'w-6 h-6 rounded flex items-center justify-center shrink-0',
                    isSelected ? 'bg-(--colour-fsP2) text-white' : 'bg-gray-100 text-slate-400'
                )}>
                    {renderIcon(opt.icon)}
                </div>
                <p className="flex-1 text-xs font-medium text-slate-700 text-left">{opt.label}</p>
                <div className={cn(
                    'w-4 h-4 rounded border-2 flex items-center justify-center shrink-0',
                    isSelected ? 'border-(--colour-fsP2) bg-(--colour-fsP2)' : 'border-gray-300'
                )}>
                    {isSelected && <Check size={9} strokeWidth={4} className="text-white" />}
                </div>
            </button>
        )
    }

    return (
        <div className="flex flex-col w-full h-full bg-white">

            {/* ── Top Progress Tracker ── */}
            <div className="px-6 pt-5 pb-4 bg-white border-b border-gray-100 shrink-0">
                <div className="relative w-full">
                    <div className="absolute top-3 left-0 w-full h-0.5 bg-gray-200 z-0" />
                    <div
                        className="absolute top-3 left-0 h-0.5 bg-(--colour-fsP2) z-0 transition-all duration-500 ease-out"
                        style={{ width: `${(uiState.stepIndex / (STEPS.length - 1)) * 100}%` }}
                    />
                    <div className="relative z-10 flex justify-between w-full">
                        {STEPS.map((s, i) => {
                            const isDone = uiState.stepIndex > i
                            const isActive = uiState.stepIndex === i
                            const isClickable = i <= uiState.stepIndex
                            return (
                                <button
                                    key={s.key}
                                    onClick={() => { if (isClickable) updateUi({ stepIndex: i }) }}
                                    disabled={!isClickable}
                                    className={cn('flex flex-col items-center gap-1.5', isClickable ? 'cursor-pointer' : 'cursor-default')}
                                >
                                    <div className={cn(
                                        'w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-300',
                                        isDone ? 'border-(--colour-fsP2) bg-(--colour-fsP2)'
                                            : isActive ? 'border-(--colour-fsP2) bg-white'
                                            : 'border-gray-300 bg-white'
                                    )}>
                                        {isDone
                                            ? <Check size={11} strokeWidth={3} className="text-white" />
                                            : isActive
                                            ? <div className="w-2 h-2 rounded-full bg-(--colour-fsP2)" />
                                            : null
                                        }
                                    </div>
                                    <span className={cn(
                                        'text-[8px] font-bold uppercase tracking-wider text-center leading-none',
                                        isActive ? 'text-(--colour-fsP2)' : isDone ? 'text-slate-500' : 'text-gray-300'
                                    )}>
                                        {s.label}
                                    </span>
                                </button>
                            )
                        })}
                    </div>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto">
                <div className="w-full py-3">

                {/* ── 1. BASELINE + DEFECTS (combined) ── */}
                {step?.key === 'baseline' && baselineQs.length > 0 && (
                    <div className="px-5 space-y-3">
                        <div className="border border-gray-200 rounded-xl overflow-hidden divide-y divide-gray-100">
                            {baselineQs.map(q => (
                                <BoolRow key={q.key} q={q} answers={conditionAnswers} onAnswer={onConditionAnswer} />
                            ))}
                        </div>
                        {defectQs.length > 0 && (
                            <div className="border border-gray-200 rounded-xl overflow-hidden">
                                <div className="px-4 py-2.5 bg-gray-50 border-b border-gray-100">
                                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Issues · skip if none</p>
                                </div>
                                <div className="divide-y divide-gray-100">
                                    {defectQs[0]?.options.map((opt: any) => (
                                        <MultiCard key={opt.key} opt={opt} collection={conditionAnswers.problems ?? []} qKey="problems" />
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}


                {/* ── 3. DOCUMENTATION: under_warranty (doc toggle) + accessories (multi) ── */}
                {step?.key === 'documentation' && docQs.length > 0 && (
                    <div className="px-5 space-y-3">
                        {docQs.map(q => (
                            q.type === 'boolean' ? (
                                <div key={q.key} className="border border-gray-200 rounded-xl overflow-hidden">
                                    <div className="px-4 py-3 bg-gray-50 border-b border-gray-100">
                                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{q.label}</p>
                                    </div>
                                    <div className="flex gap-3 p-3">
                                        {q.options.map((opt: any) => {
                                            const isSelected = String(conditionAnswers[q.key]) === String(opt.value)
                                            const isWarranty = opt.value === EVALUATION_VALUES.under_warranty_multiplier
                                            return (
                                                <button
                                                    key={opt.label}
                                                    onClick={() => onConditionAnswer(q.key, opt.value)}
                                                    className={cn(
                                                        'flex-1 flex items-center justify-center gap-2 h-10 rounded-lg border font-bold text-xs transition-all',
                                                        isSelected
                                                            ? 'border-(--colour-fsP2) bg-(--colour-fsP2) text-white'
                                                            : 'border-gray-200 bg-white text-slate-600 hover:border-gray-300'
                                                    )}
                                                >
                                                    <ShieldCheck size={14} />
                                                    {isWarranty ? 'Under Warranty' : 'Expired / None'}
                                                </button>
                                            )
                                        })}
                                    </div>
                                </div>
                            ) : (
                                <div key={q.key} className="border border-gray-200 rounded-xl overflow-hidden">
                                    <div className="px-4 py-3 bg-gray-50 border-b border-gray-100">
                                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                                            Accessories / Documents · Select all you have
                                        </p>
                                    </div>
                                    <div className="divide-y divide-gray-100">
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

                {/* ── 4. SATISFACTION ── */}
                {step?.key === 'satisfaction' && (
                    <div className="px-5 space-y-3">
                        <div className="border border-gray-200 rounded-xl overflow-hidden divide-y divide-gray-100">
                            <div className="flex items-center justify-between px-4 py-3">
                                <div>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Exchange Credit</p>
                                    <p className="text-xl font-black text-(--colour-fsP2) mt-0.5">Rs. {exchangeValue.toLocaleString()}</p>
                                </div>
                            </div>
                            <div className="flex items-center justify-between px-4 py-3 bg-gray-50">
                                <p className="text-xs font-semibold text-slate-600">Satisfied with offer?</p>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => onSatisfactionChange(true)}
                                        className={cn(
                                            'flex items-center gap-1.5 h-8 px-4 rounded-lg border font-bold text-xs',
                                            isSatisfied === true ? 'border-(--colour-fsP2) bg-(--colour-fsP2) text-white' : 'border-gray-200 bg-white text-slate-600 hover:border-gray-300'
                                        )}
                                    >
                                        <ThumbsUp size={12} /> Yes
                                    </button>
                                    <button
                                        onClick={() => onSatisfactionChange(false)}
                                        className={cn(
                                            'flex items-center gap-1.5 h-8 px-4 rounded-lg border font-bold text-xs',
                                            isSatisfied === false ? 'border-(--colour-fsP2) bg-(--colour-fsP2) text-white' : 'border-gray-200 bg-white text-slate-600 hover:border-gray-300'
                                        )}
                                    >
                                        <AlertCircle size={12} /> Negotiate
                                    </button>
                                </div>
                            </div>
                        </div>

                        {isSatisfied === false && (
                            <div className="border border-gray-200 rounded-xl overflow-hidden divide-y divide-gray-100">
                                <div className="px-4 py-2.5 bg-gray-50 border-b border-gray-100">
                                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Negotiation Details</p>
                                </div>
                                <div className="p-4 space-y-3">
                                    <div className="space-y-1.5">
                                        <Label className="text-[10px] font-bold text-(--colour-fsP2) uppercase tracking-widest">Expected Amount (Rs.)</Label>
                                        <Input
                                            type="number"
                                            value={expectedAmount}
                                            onChange={e => onNegotiationChange('expectedAmount', e.target.value)}
                                            placeholder="e.g. 50000"
                                            className="h-9 text-sm px-3 rounded-lg border border-gray-200 bg-gray-50 focus:bg-white focus:border-(--colour-fsP2) font-bold focus-visible:ring-0"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label className="text-[10px] font-bold text-(--colour-fsP2) uppercase tracking-widest">Why do you expect more?</Label>
                                        <textarea
                                            value={satisfactionReason}
                                            onChange={e => onNegotiationChange('satisfactionReason', e.target.value)}
                                            placeholder="Battery replaced, extra accessories, etc..."
                                            className="w-full h-20 p-3 border border-gray-200 bg-gray-50 rounded-lg text-xs font-medium leading-relaxed resize-none focus:bg-white focus:border-(--colour-fsP2) placeholder:text-gray-400 outline-none"
                                        />
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* ── 5. NEW DEVICE PICKER ── */}
                {step?.key === 'new_device' && (
                    <div className="px-5 space-y-3">
                        <div className="flex items-center gap-2 h-10 px-3 border border-gray-200 rounded-lg bg-gray-50 focus-within:border-(--colour-fsP2) focus-within:bg-white">
                            <HardDrive size={13} className="text-slate-400 shrink-0" />
                            <Input
                                placeholder="Search model..."
                                value={uiState.newProductSearch}
                                onChange={e => { updateUi({ newProductSearch: e.target.value }); onSearchProducts(e.target.value) }}
                                className="flex-1 h-full border-0 bg-transparent shadow-none focus-visible:ring-0 text-sm font-bold p-0 placeholder:text-slate-400"
                            />
                            {uiState.newProductSearch && (
                                <button onClick={() => { updateUi({ newProductSearch: '' }); onSearchProducts('') }} className="text-slate-400 hover:text-slate-600 shrink-0">
                                    <XCircle size={14} />
                                </button>
                            )}
                        </div>

                        <div className="border border-gray-200 rounded-xl overflow-hidden">
                            <div className="px-4 py-2.5 bg-gray-50 border-b border-gray-100">
                                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Available Devices</p>
                            </div>
                            {isLoadingProducts ? (
                                <div className="flex justify-center py-10">
                                    <Loader2 size={20} className="animate-spin text-slate-400" />
                                </div>
                            ) : (
                                <div className="divide-y divide-gray-100">
                                    {availableProducts.map(p => {
                                        const isSelected = selectedNewProduct?.id === p.id
                                        return (
                                            <div
                                                key={p.id}
                                                onClick={() => onSelectNewProduct(p)}
                                                className={cn(
                                                    'flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors',
                                                    isSelected ? 'bg-gray-50' : 'bg-white hover:bg-gray-50'
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
                                                    isSelected ? 'border-(--colour-fsP2) bg-(--colour-fsP2)' : 'border-gray-300'
                                                )}>
                                                    {isSelected && <Check size={9} strokeWidth={4} className="text-white" />}
                                                </div>
                                            </div>
                                        )
                                    })}
                                    {availableProducts.length === 0 && !isLoadingProducts && (
                                        <div className="py-10 text-center text-[11px] text-slate-400 font-medium">No devices found</div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* ── 6. VERIFICATION: IMEI + Gov ID + Phone ── */}
                {step?.key === 'verification' && (
                    <div className="px-5 space-y-3">
                        <div className="border border-gray-200 rounded-xl overflow-hidden divide-y divide-gray-100">
                            <div className="flex items-center gap-3 px-4 py-2.5">
                                <ShieldCheck size={13} className="text-(--colour-fsP2) shrink-0" />
                                <Label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest w-28 shrink-0">IMEI / Serial</Label>
                                <Input
                                    value={serialNumber}
                                    onChange={e => onVerificationChange('serialNumber', e.target.value)}
                                    placeholder="Dial *#06# to get IMEI"
                                    className="flex-1 h-8 text-sm px-2 border border-gray-200 bg-gray-50 focus:bg-white focus:border-(--colour-fsP2) font-medium rounded-lg focus-visible:ring-0"
                                />
                            </div>
                            <div className="flex items-center gap-3 px-4 py-2.5">
                                <Hash size={13} className="text-(--colour-fsP2) shrink-0" />
                                <Label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest w-28 shrink-0">Gov. ID No.</Label>
                                <Input
                                    value={governmentId}
                                    onChange={e => onVerificationChange('governmentId', e.target.value)}
                                    placeholder="ID Number"
                                    className="flex-1 h-8 text-sm px-2 border border-gray-200 bg-gray-50 focus:bg-white focus:border-(--colour-fsP2) font-medium rounded-lg focus-visible:ring-0"
                                />
                            </div>
                            <div className="flex items-center gap-3 px-4 py-2.5">
                                <Phone size={13} className="text-(--colour-fsP2) shrink-0" />
                                <Label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest w-28 shrink-0">Contact</Label>
                                <Input
                                    value={phoneNumber}
                                    onChange={e => onVerificationChange('phoneNumber', e.target.value)}
                                    placeholder="98XXXXXXXX"
                                    className="flex-1 h-8 text-sm px-2 border border-gray-200 bg-gray-50 focus:bg-white focus:border-(--colour-fsP2) font-medium rounded-lg focus-visible:ring-0"
                                />
                            </div>
                        </div>

                        <div className="border border-gray-200 rounded-xl overflow-hidden">
                            <div className="px-4 py-2.5 bg-gray-50 border-b border-gray-100 flex items-center gap-2">
                                <CameraIcon size={13} className="text-(--colour-fsP2)" />
                                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Device Photo</p>
                            </div>
                            <input type="file" id="devphoto" className="hidden" accept="image/*" onChange={e => {
                                const f = e.target.files?.[0]; if (!f) return
                                const r = new FileReader(); r.onloadend = () => onVerificationChange('devicePhoto', r.result); r.readAsDataURL(f)
                            }} />
                            <label htmlFor="devphoto" className={cn(
                                'flex items-center justify-center w-full h-32 cursor-pointer relative overflow-hidden',
                                devicePhoto ? 'bg-gray-50' : 'bg-white hover:bg-gray-50'
                            )}>
                                {devicePhoto ? (
                                    <>
                                        <Image src={devicePhoto} alt="Device" fill className="object-cover" unoptimized />
                                        <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 hover:opacity-100">
                                            <span className="bg-white px-3 py-1.5 rounded-lg text-xs font-bold text-slate-900">Change Photo</span>
                                        </div>
                                    </>
                                ) : (
                                    <div className="flex items-center gap-2 text-slate-400">
                                        <UploadCloud size={18} />
                                        <p className="text-xs font-medium">Tap to upload photo</p>
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
                                                    isSel ? 'border-(--colour-fsP2) bg-(--colour-fsP2)/[0.03] shadow-sm' : 'border-gray-100 bg-white hover:border-gray-200'
                                                )}
                                            >
                                                <div className={cn(
                                                    'w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5',
                                                    isSel ? 'border-(--colour-fsP2) bg-(--colour-fsP2)' : 'border-gray-200'
                                                )}>
                                                    {isSel && <Check size={10} className="text-white" strokeWidth={3} />}
                                                </div>

                                                <div className="flex-1 min-w-0 space-y-0.5">
                                                    <span className={cn('text-[9px] font-black uppercase tracking-widest block', isSel ? 'text-(--colour-fsP2)' : 'text-slate-400')}>
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
                                                <Label className="text-[10px] font-bold text-(--colour-fsP2) uppercase tracking-widest">{ph}</Label>
                                                <Input
                                                    placeholder={`Enter ${ph.toLowerCase()}`}
                                                    value={(uiState.addrForm as any)[field]}
                                                    onChange={e => updateUi({ addrForm: { ...uiState.addrForm, [field]: e.target.value } })}
                                                    className="h-12 text-sm px-4 rounded-xl border-2 border-gray-100 bg-gray-50 focus:bg-white focus:border-(--colour-fsP2) font-bold transition-all focus-visible:ring-0"
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
                                            className="flex-[2] h-11 rounded-xl bg-(--colour-fsP2) text-white text-xs font-bold hover:opacity-90 disabled:opacity-50 transition-all shadow-md shadow-blue-100"
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
                                    <p className="text-[10px] font-black text-(--colour-fsP2) uppercase tracking-widest leading-none mb-1">{selectedCategory?.title}</p>
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
                                    <p className="text-base font-bold text-(--colour-fsP2)">Rs. {exchangeValue.toLocaleString()}</p>
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
                            ? 'bg-(--colour-fsP2) text-white hover:opacity-90 active:scale-95 shadow-blue-100'
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
