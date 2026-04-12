'use client'

import React, { useEffect, useMemo, useState } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import {
    ArrowRight, Banknote, Calculator, Check,
    RefreshCcw, ShieldCheck,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type { BannerItem } from '@/app/types/BannerTypes'
import type { ProductDetails } from '@/app/types/ProductDetailsTypes'
import ProductEMIUI from './EmiProduct'
import { calculateEMI, formatRs } from './_func_emiCalacutor'
import { useContextEmi } from './emiContext'
import HeroBanner from '../../blogs/components/HeroBanner'
import EmiFaq from '../apply/_components/EmiFaq'

interface Props {
    initialProduct: ProductDetails | null
    emiBanner: BannerItem | null
}

interface State {
    product:         ProductDetails | null
    productPrice:    number
    downPayment:     number
    tenure:          number
    selectedBankId:  string
    selectedVariant: string
}

const getCurrentPrice = (product: ProductDetails | null): number => {
    if (!product) return 0;
    const p = product.price as any;
    if (typeof p === "number") return p;
    return p?.current ?? 0;
};

const getProductImage = (product: ProductDetails | null) => {
    if (!product) return ''
    if (typeof product.image === 'string') return product.image
    return product.image?.full ?? product.image?.thumb ?? product.thumb?.url ?? product.images?.[0]?.url ?? ''
}

const labelCls = 'text-[10px] font-bold text-(--colour-fsP2) uppercase tracking-widest'
const inputCls = 'h-10 w-full px-3 bg-gray-50 border border-gray-200 rounded-lg text-sm font-bold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-(--colour-fsP2) focus:bg-white transition-colors disabled:cursor-not-allowed disabled:opacity-60'

function BankMark({ name }: { name: string }) {
    const initials = name.split(' ').filter(Boolean).slice(0, 2).map(p => p[0]?.toUpperCase() ?? '').join('')
    return (
        <div className="flex h-full w-full items-center justify-center rounded-lg bg-slate-800 text-[10px] font-black tracking-widest text-white">
            {initials || 'BK'}
        </div>
    )
}

const ClientEmiPage: React.FC<Props> = ({ initialProduct, emiBanner }) => {
    const router = useRouter()
    const { emiContextInfo, setEmiContextInfo, banks, isBanksLoading, fetchBanks } = useContextEmi()

    const [state, setState] = useState<State>({
        product:         initialProduct,
        productPrice:    getCurrentPrice(initialProduct),
        downPayment:     0,
        tenure:          12,
        selectedBankId:  '',
        selectedVariant: '',
    })

    const update = (u: Partial<State>) => setState(p => ({ ...p, ...u }))

    useEffect(() => { fetchBanks() }, [fetchBanks])

    const activeProduct      = state.product ?? initialProduct ?? emiContextInfo.product
    const activeProductPrice = state.productPrice > 0 ? state.productPrice : getCurrentPrice(activeProduct)
    const selectedBankId     = state.selectedBankId || banks[0]?.id || ''
    const selectedBank       = useMemo(() => banks.find(b => b.id === selectedBankId) ?? null, [banks, selectedBankId])
    const activeTenure       = selectedBank?.tenureOptions.includes(state.tenure) ? state.tenure : (selectedBank?.tenureOptions[0] ?? state.tenure)

    const emiData = useMemo(() => calculateEMI({
        principal:   activeProductPrice,
        tenure:      activeTenure,
        downPayment: state.downPayment,
        bankId:      selectedBank?.id,
    }), [activeProductPrice, activeTenure, selectedBank?.id, state.downPayment])

    const quickDownPayments = useMemo(() => (
        [0, 20, 40].map(pct => ({
            label: pct === 0 ? 'Zero down' : `${pct}% down`,
            value: Math.round((activeProductPrice * pct) / 100),
        }))
    ), [activeProductPrice])

    const tenureOptions    = selectedBank?.tenureOptions ?? [6, 12, 18, 24]
    const productImage     = getProductImage(activeProduct)
    const primaryHighlights = (activeProduct?.highlights ?? activeProduct?.description?.highlights ?? '')
        .split(/[,\n]/).map(s => s.trim()).filter(Boolean).slice(0, 3)
    const faqParams = useMemo(() => ({ type: 'category', per_page: 10, page: 1 }), [])

    const resetCalculator = () => update({
        product:         activeProduct,
        productPrice:    getCurrentPrice(activeProduct),
        downPayment:     0,
        tenure:          selectedBank?.tenureOptions[0] ?? 12,
        selectedVariant: '',
    })

    const handleApply = () => {
        if (!activeProduct || !selectedBank) return
        setEmiContextInfo(prev => ({
            ...prev,
            product:        activeProduct,
            selectedVariant: state.selectedVariant,
            bankinfo:       { ...prev.bankinfo, bankname: selectedBank.name },
            emiCalculation: {
                ...prev.emiCalculation,
                monthlyEmi:  Math.round(emiData.paymentPerMonth),
                duration:    activeTenure,
                downPayment: Math.round(emiData.downPayment),
            },
        }))
        const search = new URLSearchParams({
            slug:        activeProduct.slug,
            bank:        selectedBank.name,
            tenure:      String(activeTenure),
            downPayment: String(Math.round(emiData.downPayment)),
        })
        if (state.selectedVariant) search.set('variant', state.selectedVariant)
        router.push(`/emi/apply/${search.toString()}`)
    }

    const chooseProduct = (color: string) => {
        if (!activeProduct?.variants?.length) return
        const matchedVariant = activeProduct.variants.find(v => v.attributes?.Color === color)
        // Variant price is a plain number on the API response
        const nextPrice = matchedVariant?.price ?? getCurrentPrice(activeProduct)
        // Variant images live on the variant itself (not product.images)
        const variantImg = matchedVariant?.images?.[0]
        setState(prev => ({
            ...prev,
            selectedVariant: color,
            productPrice:    Number(nextPrice),
            product:         activeProduct ? {
                ...activeProduct,
                image: variantImg
                    ? { full: variantImg.url, thumb: variantImg.url, preview: variantImg.url }
                    : activeProduct.image,
            } : null,
        }))
    }

    const summaryRows = [
        { label: 'Product price',  value: formatRs(activeProductPrice)       },
        { label: 'Down payment',   value: formatRs(emiData.downPayment)       },
        { label: 'Finance amount', value: formatRs(emiData.financeAmount)     },
        { label: 'Total payable',  value: formatRs(emiData.totalPayment)      },
    ]

    return (
        <div className="min-h-screen bg-[#F5F7FA]">
            <div className="max-w-7xl mx-auto px-4 lg:px-8 py-6 space-y-4">

         

                {/* ── Product selector ──────────────────────────────────── */}
                <div className="border border-gray-200 rounded-xl bg-white overflow-hidden">
                    <div className="flex items-center gap-2 px-5 py-3 border-b border-gray-100">
                        <p className={labelCls}>Selected Product</p>
                        <button onClick={()=>  router.push(`/emi/eligibility`)} className="text-[10px] cursor-pointer font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded uppercase tracking-widest ml-auto">
                              Am I  Eligible for EMI?
                            </button>
                    </div>
                    <div className="p-5">
                        <ProductEMIUI
                            chooseProduct={chooseProduct}
                            onProductChange={product => {
                                setEmiContextInfo(prev => ({ ...prev, product, selectedVariant: "" }));
                                update({ product, productPrice: getCurrentPrice(product), selectedVariant: "" });
                            }}
                            product={activeProduct}
                            selectedVariant={state.selectedVariant}
                        />
                    </div>
                </div>

                {/* ── Two-column layout ─────────────────────────────────── */}
                <div className="grid gap-5 lg:grid-cols-[1fr_360px] items-start">

                    {/* ── LEFT: Calculator ─────────────────────────────── */}
                    <div className="space-y-3">

                        {/* Product price */}
                        <div className="border border-gray-200 rounded-xl bg-white p-5">
                            <div className="flex items-center justify-between mb-3">
                                <p className={labelCls}>Product Price</p>
                                <span className="text-[10px] font-bold text-slate-400 border border-gray-200 rounded px-2 py-0.5">NPR</span>
                            </div>
                            <input
                                type="number"
                                min="0"
                                value={activeProductPrice}
                                onChange={e => update({ productPrice: Number(e.target.value) })}
                                disabled={!!activeProduct}
                                className={inputCls + ' h-12 text-lg font-black'}
                                placeholder="Enter product amount"
                            />
                            {activeProduct && (
                                <p className="text-[11px] text-slate-400 mt-1.5">Price locked to selected product</p>
                            )}
                        </div>

                        {/* Down payment */}
                        <div className="border border-gray-200 rounded-xl bg-white p-5">
                            <div className="flex items-center justify-between mb-3">
                                <p className={labelCls}>Down Payment</p>
                                <span className="text-xs font-bold text-slate-500">{formatRs(emiData.downPayment)} paid now</span>
                            </div>
                            <input
                                type="number"
                                min="0"
                                max={activeProductPrice}
                                value={state.downPayment || ''}
                                onChange={e => {
                                    const v = Number(e.target.value)
                                    if (v >= 0 && v <= activeProductPrice) update({ downPayment: v })
                                }}
                                className={inputCls}
                                placeholder="Enter your down payment"
                            />
                            <div className="flex flex-wrap gap-2 mt-3">
                                {quickDownPayments.map(item => (
                                    <button
                                        key={item.label}
                                        onClick={() => update({ downPayment: item.value })}
                                        className={cn(
                                            'h-7 px-3 rounded-lg text-xs font-bold border transition-colors',
                                            state.downPayment === item.value
                                                ? 'bg-(--colour-fsP2) border-(--colour-fsP2) text-white'
                                                : 'bg-white border-gray-200 text-slate-600 hover:border-(--colour-fsP2) hover:text-(--colour-fsP2)'
                                        )}
                                    >
                                        {item.label}
                                    </button>
                                ))}
                            </div>

                        </div>

                        {/* Bank selection */}
                        <div className="border border-gray-200 rounded-xl bg-white overflow-hidden">
                            <div className="flex items-center gap-2 px-5 py-4 border-b border-gray-100">
                                <Banknote size={13} className="text-(--colour-fsP2) shrink-0" />
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-bold text-slate-900">Partner Bank</p>
                                    <p className="text-[11px] text-slate-500 mt-0.5">Select your bank and preferred repayment tenure</p>
                                </div>
                    
                            </div>

                    

                            <div className="p-4">
                                {isBanksLoading ? (
                                    <div className="grid gap-2 sm:grid-cols-2">
                                        {Array.from({ length: 4 }, (_, i) => (
                                            <div key={i} className="h-16 animate-pulse rounded-lg bg-gray-100" />
                                        ))}
                                    </div>
                                ) : (
                                    <div className="grid gap-2 sm:grid-cols-2">
                                        {banks.map(bank => {
                                            const active = bank.id === selectedBankId
                                            return (
                                                <button
                                                    key={bank.id}
                                                    onClick={() => update({ selectedBankId: bank.id })}
                                                    className={cn(
                                                        'flex items-center gap-3 p-3 rounded-lg border text-left transition-colors',
                                                        active
                                                            ? 'border-(--colour-fsP2) bg-blue-50'
                                                            : 'border-gray-200 bg-gray-50 hover:border-(--colour-fsP2)/50'
                                                    )}
                                                >
                                                    <div className="w-10 h-10 rounded-lg border border-gray-200 bg-white overflow-hidden shrink-0">
                                                        {bank.img
                                                            ? <Image src={bank.img} alt={bank.name} width={40} height={40} className="object-contain p-1" />
                                                            : <BankMark name={bank.name} />}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className={cn('text-xs font-bold truncate', active ? 'text-(--colour-fsP2)' : 'text-slate-900')}>
                                                            {bank.name}
                                                        </p>
                                                        <p className="text-[10px] text-slate-500 mt-0.5">
                                                            {bank.tenureOptions?.length
                                                                ? `${bank.tenureOptions.length} tenure plan${bank.tenureOptions.length > 1 ? 's' : ''}`
                                                                : 'EMI partner'}
                                                        </p>
                                                    </div>
                                                    {active && <Check size={13} className="text-(--colour-fsP2) shrink-0" />}
                                                </button>
                                            )
                                        })}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Tenure */}
                        <div className="border border-gray-200 rounded-xl bg-white p-5">
                            <div className="flex items-center justify-between mb-3">
                                <p className={labelCls}>Repayment Tenure</p>
                                <span className="text-[11px] text-slate-400">
                                    {selectedBank ? `${selectedBank.name} plans` : 'Select a bank first'}
                                </span>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {tenureOptions.map(months => (
                                    <button
                                        key={months}
                                        onClick={() => update({ tenure: months })}
                                        className={cn(
                                            'h-9 px-4 rounded-lg border text-xs font-bold transition-colors',
                                            activeTenure === months
                                                ? 'bg-(--colour-fsP2) border-(--colour-fsP2) text-white'
                                                : 'bg-white border-gray-200 text-slate-600 hover:border-(--colour-fsP2) hover:text-(--colour-fsP2)'
                                        )}
                                    >
                                        {months} months
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* ── RIGHT: Summary sidebar ─────────────────────────── */}
                    <div className="lg:sticky lg:top-6 space-y-3">

                        {/* Monthly EMI */}
                        <div className="border border-gray-200 rounded-xl bg-white overflow-hidden">
                            <div className="px-5 py-4 border-b border-gray-100">
                                <p className={labelCls}>Monthly EMI</p>
                                <p className="text-4xl font-black text-slate-900 mt-1 tracking-tight">
                                    {formatRs(emiData.paymentPerMonth)}
                                </p>
                                <p className="text-xs text-slate-500 mt-1">
                                    {activeTenure} months{selectedBank ? ` · ${selectedBank.name}` : ''}
                                </p>
                            </div>

                            <div className="px-5 py-4 space-y-4">
                                {/* Product card */}
                                {activeProduct ? (
                                    <div className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg bg-gray-50">
                                        <div className="w-12 h-12 shrink-0 rounded-lg border border-gray-200 bg-white overflow-hidden">
                                            {productImage
                                                ? <Image src={productImage} alt={activeProduct.name} width={48} height={48} className="object-contain p-1 w-full h-full" />
                                                : <div className="w-full h-full flex items-center justify-center text-[10px] text-slate-400">No img</div>}
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            {activeProduct.brand?.name && (
                                                <p className={labelCls + ' mb-0.5'}>{activeProduct.brand.name}</p>
                                            )}
                                            <p className="text-xs font-bold text-slate-900 line-clamp-2">{activeProduct.name}</p>
                                            {state.selectedVariant && (
                                                <p className="text-[10px] text-slate-400 mt-0.5">{state.selectedVariant}</p>
                                            )}
                                        </div>
                                    </div>
                                ) : (
                                    <div className="p-3 border border-gray-200 rounded-lg bg-gray-50 text-center text-xs font-semibold text-slate-400">
                                        No product selected
                                    </div>
                                )}

                                {/* Breakdown */}
                                <div className="divide-y divide-gray-100">
                                    {summaryRows.map(row => (
                                        <div key={row.label} className="flex items-center justify-between py-2.5">
                                            <span className="text-xs text-slate-500">{row.label}</span>
                                            <span className="text-xs font-bold text-slate-900">{row.value}</span>
                                        </div>
                                    ))}
                                </div>

                     

                                {/* Notice */}
                                <div className="flex items-start gap-2 p-3 border border-gray-200 rounded-lg bg-gray-50">
                                    <ShieldCheck size={12} className="text-(--colour-fsP2) shrink-0 mt-0.5" />
                                    <p className="text-[11px] text-slate-600">
                                        Selected bank, down payment, tenure and EMI carry forward into the application form.
                                    </p>
                                </div>

                                {/* Apply button */}
                                <div className="flex gap-2">
                                    <button
                                        onClick={handleApply}
                                        disabled={!activeProduct || !selectedBank}
                                        className="flex-1 h-10 rounded-lg bg-(--colour-fsP2) hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed text-xs font-bold text-white transition-colors flex items-center justify-center gap-1.5"
                                    >
                                        Continue to apply <ArrowRight size={13} />
                                    </button>
                                    <button
                                        onClick={resetCalculator}
                                        className="h-10 w-10 rounded-lg border border-gray-200 bg-white hover:border-(--colour-fsP2) hover:text-(--colour-fsP2) text-slate-500 flex items-center justify-center transition-colors"
                                    >
                                        <RefreshCcw size={13} />
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* How it works */}
                        <div className="border border-gray-200 rounded-xl bg-white p-5">
                            <p className="text-sm font-bold text-slate-900 mb-0.5">How it works</p>
                            <p className="text-xs text-slate-500 mb-4">Three steps before you apply</p>
                            <div className="space-y-2">
                                {[
                                    'Choose any EMI-eligible product from search or product pages.',
                                    'Switch between partner banks and their available tenure plans.',
                                    'Your product, EMI, and bank carry forward into the application.',
                                ].map((item, i) => (
                                    <div key={i} className="flex items-start gap-3 p-3 border border-gray-100 rounded-lg bg-gray-50">
                                        <div className="w-5 h-5 rounded-full bg-(--colour-fsP2)/10 border border-(--colour-fsP2)/20 flex items-center justify-center shrink-0 mt-0.5">
                                            <span className="text-[9px] font-black text-(--colour-fsP2)">{i + 1}</span>
                                        </div>
                                        <p className="text-xs text-slate-600 leading-relaxed">{item}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
                {/* ── FAQ ──────────────────────────────────────────────── */}
                <div className="pt-2">
                    <EmiFaq params={faqParams} />
                </div>
            </div>
        </div>
    )
}

export default ClientEmiPage
