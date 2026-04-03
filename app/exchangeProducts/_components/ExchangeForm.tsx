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
    valuationBreakdown: any[]
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
    problems: string[]
    reason: string
    onConditionExtra: (key: 'reason' | 'problems', value: any) => void
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
        <div className="px-4 py-3.5">
            <p className="text-xs font-semibold text-slate-800 mb-2.5">{q.label}</p>
            <div className="grid grid-cols-2 gap-2">
                {q.options.map((opt: any) => {
                    const isSelected = String(answers[q.key]) === String(opt.value)
                    const isYes = opt.label === 'YES'
                    return (
                        <button
                            key={opt.label}
                            onClick={() => onAnswer(q.key, opt.value)}
                            className={cn(
                                'h-10 rounded-lg border-2 font-semibold text-sm transition-all flex items-center justify-center gap-2',
                                isSelected
                                    ? isYes
                                        ? 'border-emerald-500 bg-emerald-500 text-white'
                                        : 'border-red-500 bg-red-500 text-white'
                                    : 'border-gray-200 bg-white text-slate-600 hover:border-gray-300'
                            )}
                        >
                            {isSelected && <Check size={13} strokeWidth={3} />}
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
        { key: 'baseline',      label: 'Device Status',            group: 'Inspect' },
        { key: 'defects',       label: 'Technical Inspection',      group: 'Inspect' },
        { key: 'documentation', label: 'Documentation & Warranty',  group: 'Inspect' },
        { key: 'new_device',    label: 'Choose Your Upgrade',       group: 'Upgrade' },
        { key: 'verification',  label: 'Verify Your Device',        group: 'Verify'  },
        { key: 'pickup',        label: 'Pickup Address',            group: 'Pickup'  },
        { key: 'summary',       label: 'Exchange Summary',          group: 'Review'  },
    ], [])

    const step    = STEPS[uiState.stepIndex]
    const totalSt = STEPS.length
    const pct     = ((uiState.stepIndex + 1) / totalSt) * 100

    const selectedNewProductPrice = selectedNewProduct ? parsePrice(selectedNewProduct.price) : 0
    const priceAfterExchange      = Math.max(0, selectedNewProductPrice - exchangeValue)

    // Compute depreciated base value from product price when exchangeValue is not yet ready
    const footerAmount = useMemo(() => {
        if (selectedNewProduct) return priceAfterExchange
        if (exchangeValue > 0) return exchangeValue
        if (!selectedProduct) return 0
        const rawPrice = parsePrice(String(selectedProduct.price || selectedProduct.discounted_price || 0))
        if (!rawPrice) return 0
        const d = new Date(selectedProduct.created_at ?? '')
        const months = isNaN(d.getTime())
            ? 24
            : (new Date().getFullYear() - d.getFullYear()) * 12 + (new Date().getMonth() - d.getMonth())
        const mult = months <= 6 ? 0.9 : months <= 12 ? 0.75 : months <= 24 ? 0.6 : months <= 36 ? 0.45 : 0.3
        return Math.round(rawPrice * mult)
    }, [selectedNewProduct, priceAfterExchange, exchangeValue, selectedProduct])

    const handleNext = () => {
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
                    'relative flex flex-col items-center justify-center gap-2 p-3.5 rounded-xl border-2 transition-all text-center',
                    isSelected ? 'border-emerald-500 bg-emerald-50/30' : 'border-gray-200 bg-white hover:border-gray-300'
                )}
            >
                <div className={cn(
                    'absolute top-2 left-2 w-4 h-4 rounded border-2 flex items-center justify-center',
                    isSelected ? 'border-emerald-500 bg-emerald-500' : 'border-gray-300'
                )}>
                    {isSelected && <Check size={9} strokeWidth={4} className="text-white" />}
                </div>
                <div className={cn('transition-colors', isSelected ? 'text-emerald-600' : 'text-slate-400')}>
                    {renderIcon(opt.icon)}
                </div>
                <span className={cn('text-[11px] font-semibold leading-tight', isSelected ? 'text-slate-800' : 'text-slate-600')}>
                    {opt.label}
                </span>
            </button>
        )
    }

    return (
        <div className="flex flex-col w-full h-full bg-white">

            {/* ── Top bar ── */}
            <div className="shrink-0 flex items-center gap-2.5 px-5 py-3 border-b border-gray-100">
                <button
                    onClick={handleBack}
                    className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors"
                >
                    <ArrowLeft size={13} />
                    Back
                </button>
                {selectedProduct && (
                    <>
                        <span className="text-gray-200">·</span>
                        <span className="text-xs font-semibold text-slate-700 truncate">{selectedProduct.name}</span>
                    </>
                )}
                <span className="ml-auto text-[10px] font-semibold text-slate-400">
                    {uiState.stepIndex + 1} / {totalSt}
                </span>
            </div>

            {/* ── Progress bar ── */}
            <div className="shrink-0 h-[3px] bg-gray-100">
                <div
                    className="h-full bg-[var(--colour-fsP2)] transition-all duration-500 ease-out"
                    style={{ width: `${pct}%` }}
                />
            </div>

            {/* ── Body ── */}
            <div className="flex-1 overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:w-0">

                {/* Step title block */}
                <div className="px-5 pt-5 pb-4">
                    <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-0.5">
                        {step?.group}
                    </p>
                    <h2 className="text-base font-bold text-slate-900">{step?.label}</h2>
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

                {/* ── 4. NEW DEVICE PICKER ── */}
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

                {/* ── 5. VERIFICATION ── */}
                {step?.key === 'verification' && (
                    <div className="px-5 pb-5 space-y-4">
                        <div className="border border-gray-200 rounded-xl overflow-hidden">
                            {/* IMEI */}
                            <div className="px-4 py-3.5 border-b border-gray-100">
                                <Label className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest mb-2 block">
                                    IMEI / Serial Number
                                </Label>
                                <div className="relative">
                                    <Input
                                        value={serialNumber}
                                        onChange={e => onVerificationChange('serialNumber', e.target.value)}
                                        placeholder="Dial *#06# to get IMEI"
                                        className="h-10 rounded-lg border-gray-200 pr-8 text-sm"
                                    />
                                    <ShieldCheck size={13} className="absolute right-3 top-3 text-slate-400" />
                                </div>
                            </div>
                            {/* ID + Phone */}
                            <div className="grid grid-cols-2 divide-x divide-gray-100">
                                <div className="px-4 py-3.5 space-y-1.5">
                                    <Label className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest">Gov. ID</Label>
                                    <Input value={governmentId} onChange={e => onVerificationChange('governmentId', e.target.value)} placeholder="ID Number" className="h-10 rounded-lg border-gray-200 text-sm" />
                                </div>
                                <div className="px-4 py-3.5 space-y-1.5">
                                    <Label className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest">Phone</Label>
                                    <Input value={phoneNumber} onChange={e => onVerificationChange('phoneNumber', e.target.value)} placeholder="98XXXXXXXX" className="h-10 rounded-lg border-gray-200 text-sm" />
                                </div>
                            </div>
                        </div>

                        {/* Device Photo */}
                        <div>
                            <SL>Device Photo</SL>
                            <input type="file" id="devphoto" className="hidden" accept="image/*" onChange={e => {
                                const f = e.target.files?.[0]; if (!f) return
                                const r = new FileReader(); r.onloadend = () => onVerificationChange('devicePhoto', r.result); r.readAsDataURL(f)
                            }} />
                            <label htmlFor="devphoto" className={cn(
                                'flex flex-col items-center justify-center w-full h-36 rounded-xl border-2 border-dashed cursor-pointer relative overflow-hidden transition-all',
                                devicePhoto ? 'border-emerald-400' : 'border-gray-200 hover:border-slate-300'
                            )}>
                                {devicePhoto ? (
                                    <>
                                        <Image src={devicePhoto} alt="Device" fill className="object-cover" unoptimized />
                                        <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                                            <span className="bg-white/90 px-3 py-1 rounded text-[10px] font-semibold text-slate-700">Change</span>
                                        </div>
                                    </>
                                ) : (
                                    <div className="flex flex-col items-center gap-2 text-slate-400">
                                        <UploadCloud size={22} />
                                        <p className="text-xs font-semibold text-slate-500">Upload device photo</p>
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
                                <div className="border border-gray-200 rounded-xl overflow-hidden divide-y divide-gray-100">
                                    {uiState.savedAddresses.map(addr => (
                                        <div
                                            key={addr.id}
                                            onClick={() => onAddressSelect(addr)}
                                            className={cn(
                                                'flex items-start gap-3 px-4 py-3.5 cursor-pointer transition-colors',
                                                selectedAddress?.id === addr.id ? 'bg-blue-50/30' : 'bg-white hover:bg-gray-50/60'
                                            )}
                                        >
                                            <div className={cn(
                                                'w-7 h-7 rounded-lg border flex items-center justify-center shrink-0 mt-0.5',
                                                selectedAddress?.id === addr.id ? 'border-[var(--colour-fsP2)] bg-blue-50' : 'border-gray-200 bg-gray-50'
                                            )}>
                                                <MapPin size={12} className={selectedAddress?.id === addr.id ? 'text-[var(--colour-fsP2)]' : 'text-slate-400'} />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-xs font-bold text-slate-900">
                                                    {[addr.address?.landmark, addr.address?.city].filter(Boolean).join(', ')}
                                                </p>
                                                <p className="text-[11px] text-slate-500 mt-0.5">
                                                    {[addr.address?.district, addr.address?.province].filter(Boolean).join(', ')}
                                                </p>
                                            </div>
                                            {selectedAddress?.id === addr.id && (
                                                <Check size={13} className="text-[var(--colour-fsP2)] shrink-0 mt-1" />
                                            )}
                                        </div>
                                    ))}
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
                                    <div className="grid grid-cols-2 gap-2">
                                        {[
                                            ['First Name', 'first_name'], ['Last Name', 'last_name'],
                                            ['Phone', 'contact_number'], ['City', 'city'],
                                            ['District', 'district'], ['Province', 'province'],
                                        ].map(([ph, field]) => (
                                            <Input
                                                key={field}
                                                placeholder={ph}
                                                value={(uiState.addrForm as any)[field]}
                                                onChange={e => updateUi({ addrForm: { ...uiState.addrForm, [field]: e.target.value } })}
                                                className="h-10 rounded-lg text-sm"
                                            />
                                        ))}
                                        <Input
                                            placeholder="Landmark"
                                            value={uiState.addrForm.landmark}
                                            onChange={e => updateUi({ addrForm: { ...uiState.addrForm, landmark: e.target.value } })}
                                            className="h-10 rounded-lg text-sm col-span-2"
                                        />
                                    </div>
                                    <div className="flex gap-2">
                                        <button onClick={() => updateUi({ addrView: 'list' })} className="flex-1 h-10 rounded-lg border border-gray-200 text-xs font-semibold text-slate-600">Cancel</button>
                                        <button onClick={handleSaveAddress} disabled={uiState.isSaving} className="flex-1 h-10 rounded-lg bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 disabled:opacity-50 transition-colors">
                                            {uiState.isSaving ? 'Saving…' : 'Save Address'}
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
                        <div>
                            <SL>Device Being Exchanged</SL>
                            <div className="flex items-center gap-3 px-4 py-3 border border-gray-200 rounded-xl">
                                <div className="relative w-12 h-12 shrink-0 rounded-lg border border-gray-100 bg-gray-50 overflow-hidden">
                                    <Image src={getThumbnail(selectedProduct)} alt="Device" fill className="object-contain p-1" />
                                </div>
                                <div className="min-w-0">
                                    <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest">{selectedCategory?.title}</p>
                                    <p className="text-sm font-bold text-slate-900 truncate">{selectedProduct?.name}</p>
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
                    disabled={!isStepValid()}
                    className={cn(
                        'flex items-center gap-1.5 px-6 h-10 rounded-xl font-semibold text-sm transition-all',
                        isStepValid()
                            ? 'bg-slate-900 text-white hover:bg-slate-800 active:scale-95'
                            : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    )}
                >
                    {uiState.stepIndex === STEPS.length - 1 ? 'Submit' : 'Continue'}
                    <ChevronRight size={16} />
                </button>
            </div>
        </div>
    )
}
