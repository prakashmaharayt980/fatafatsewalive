'use client'

import React, { useState, useEffect, useMemo } from 'react';
import { Calculator, CheckCircle, ChevronDown, RefreshCcw, ShoppingBag, ArrowRight } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import ProductEMIUI from './EmiProduct';
import { useContextEmi } from './emiContext';
import { calculateEMI } from './_func_emiCalacutor';
import type { ProductDetails } from '@/app/types/ProductDetailsTypes';
import type { BannerItem } from '@/app/types/BannerTypes';
import HeroBanner from '../../blogs/components/HeroBanner';
import EmiFaq from '../apply/_components/EmiFaq';

// ─── Types ────────────────────────────────────────────────────────────────────
interface ClientEmiPageProps {
    initialProduct: ProductDetails | null;
    emiBanner: BannerItem | null;
}



// Placeholder bank logo — swap once you have real images
const BankLogo = ({ name }: { name: string }) => (
    <div className="w-full h-full flex items-center justify-center bg-gray-50 rounded-lg">
        <span className="text-[10px] font-bold text-gray-400 text-center leading-tight px-1">
            {name.split(' ').slice(0, 2).join('\n')}
        </span>
    </div>
);

// ─── Component ───────────────────────────────────────────────────────────────
const ClientEmiPage: React.FC<ClientEmiPageProps> = ({ initialProduct, emiBanner }) => {
    const router = useRouter();
    const { emiContextInfo, banks, isBanksLoading, fetchBanks } = useContextEmi();

    const [product, setProduct] = useState<ProductDetails | null>(initialProduct);
    const [productPrice, setProductPrice] = useState<number>(
        initialProduct ? Number(initialProduct.discounted_price || initialProduct.price) : 0
    );
    const [downPayment, setDownPayment] = useState<number>(0);
    const [tenure, setTenure] = useState<number>(12);

    const [selectedBank, setSelectedBank] = useState<typeof banks[0] | null>(null);

    // Typewriter
    const texts = useMemo(() => [
        'Available for Mobile Devices',
        'Enjoy your time',
        'Apply Now to Buy with EMI Services',
        'Check Out Our EMI Terms',
    ], []);
    const [currentTextIndex, setCurrentTextIndex] = useState(0);
    const [currentText, setCurrentText] = useState('');
    const [isDeleting, setIsDeleting] = useState(false);

    // ── Preload Banks ────────────────────────────────────────────────────────────
    useEffect(() => {
        fetchBanks();
    }, [fetchBanks]);

    useEffect(() => {
        if (banks.length > 0 && !selectedBank) {
            setSelectedBank(banks[0]);
        }
    }, [banks, selectedBank]);

    // ── Sync product ─────────────────────────────────────────────────────────────
    useEffect(() => {
        const p = emiContextInfo.product ?? initialProduct;
        if (!p) return;
        setProduct(p);
        setProductPrice(Number(p.discounted_price || p.price));
    }, [emiContextInfo.product, initialProduct]);

    // ── Sync bank logic handles its own static rates in func_emiCalacutor ───────

    // ── EMI calculation ──────────────────────────────────────────────────────────
    const emiData = useMemo(() => {
        if (!selectedBank) return null;
        return calculateEMI({
            principal: productPrice,
            tenure,
            downPayment,
            bankId: selectedBank.id,
        });
    }, [productPrice, tenure, downPayment, selectedBank]);

    // ── Typewriter ───────────────────────────────────────────────────────────────
    useEffect(() => {
        const full = texts[currentTextIndex];
        const delay = isDeleting ? 50 : 120;
        const t = setTimeout(() => {
            if (!isDeleting) {
                if (currentText.length < full.length) {
                    setCurrentText(full.slice(0, currentText.length + 1));
                } else {
                    setTimeout(() => setIsDeleting(true), 2000);
                }
            } else {
                if (currentText.length > 0) {
                    setCurrentText(full.slice(0, currentText.length - 1));
                } else {
                    setIsDeleting(false);
                    setCurrentTextIndex(i => (i + 1) % texts.length);
                }
            }
        }, delay);
        return () => clearTimeout(t);
    }, [currentText, isDeleting, currentTextIndex, texts]);

    // ── Handlers ─────────────────────────────────────────────────────────────────
    const chooseProduct = (col: string) => {
        if (!product?.variants) return;
        const match = product.variants.filter(v => v.attributes?.Color === col);
        const price = match[0]?.price ?? product.price ?? 0;
        setProductPrice(Number(price));
        const colorImage = product.images?.find(
            img => img.color === col || img.custom_properties?.color === col
        );
        if (colorImage) {
            setProduct(prev => prev ? {
                ...prev,
                image: { full: colorImage.url, thumb: colorImage.thumb, preview: colorImage.preview }
            } : null);
        }
        return match;
    };



    const resetCalc = () => {
        setDownPayment(0);
        setTenure(12);
    };

    const downPaymentPct = productPrice > 0 ? Number(emiData?.downPayment ?? 0) / productPrice : 0;
    const params = useMemo(() => ({ type: 'category', per_page: 10, page: 1 }), [])
    // ─────────────────────────────────────────────────────────────────────────────
    return (
        <div className="min-h-screen bg-[var(--colour-bg4)] font-sans">

            {/* HERO BANNER - Just like blog banner */}
            <section className="container mx-auto px-4 lg:px-8 mt-4">
                <HeroBanner data={emiBanner || undefined} />
            </section>

            <div className="container mx-auto px-4 lg:px-8 mt-6 relative z-20 pb-12">

                {/* Product */}
                <div className="bg-white rounded-2xl shadow-[var(--shadow-premium-lg)] overflow-hidden border border-[var(--colour-border3)] mb-8">
                    <ProductEMIUI chooseProduct={chooseProduct} setProductPrice={setProductPrice} product={product} />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">

                    {/* LEFT — Calculator Controls */}
                    <div className="lg:col-span-7 space-y-6">
                        <div className="bg-white rounded-2xl shadow-[var(--shadow-premium-md)] border border-[var(--colour-border3)] overflow-hidden">

                            {/* Panel header */}
                            <div className="bg-gradient-to-r from-[var(--colour-fsP2)] to-[#1565C0] px-6 py-3.5 flex items-center gap-2.5">
                                <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                                    <Calculator className="w-4 h-4 text-white" />
                                </div>
                                <h2 className="text-white font-bold text-base">Configure EMI Plan</h2>
                            </div>

                            <div className="p-6 sm:p-7 space-y-7">

                                {/* Product price */}
                                <div className="space-y-2.5">
                                    <label className="text-sm font-bold text-[var(--colour-text2)] flex items-center gap-1.5">
                                        Product Price
                                        <span className="text-[var(--colour-text3)] font-normal text-xs">(NPR)</span>
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="number"
                                            value={productPrice}
                                            onChange={e => setProductPrice(Number(e.target.value))}
                                            className="w-full px-4 py-3.5 text-lg font-bold text-[var(--colour-text2)] bg-[var(--colour-bg4)] border-2 border-[var(--colour-border3)] rounded-xl focus:border-[var(--colour-fsP2)] focus:ring-3 focus:ring-[var(--colour-fsP2)]/10 outline-none transition-all"
                                            placeholder="Enter Amount"
                                            min="0"
                                            disabled={!!product}
                                        />
                                        <div className="absolute inset-y-0 right-4 flex items-center">
                                            <span className="text-xs font-bold text-[var(--colour-fsP2)] bg-[var(--colour-fsP2)]/10 px-2.5 py-1 rounded-md">NPR</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Down payment */}
                                <div className="space-y-2.5">
                                    <label className="text-sm font-bold text-[var(--colour-text2)]">Down Payment</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                                            <span className="text-sm font-bold text-[var(--colour-fsP2)]">Rs.</span>
                                        </div>
                                        <input
                                            type="number"
                                            min="0"
                                            max={productPrice}
                                            value={downPayment || ''}
                                            onChange={e => {
                                                const val = Number(e.target.value);
                                                if (val >= 0 && val <= productPrice) setDownPayment(val);
                                            }}
                                            placeholder="Enter down payment"
                                            className="w-full pl-12 pr-4 py-3.5 bg-[var(--colour-bg4)] border-2 border-[var(--colour-border3)] rounded-xl focus:border-[var(--colour-fsP2)] focus:ring-3 focus:ring-[var(--colour-fsP2)]/10 outline-none text-[var(--colour-text2)] font-semibold transition-all"
                                        />
                                    </div>
                                    <div className="flex gap-2 mt-1.5">
                                        <button
                                            onClick={() => setDownPayment(0)}
                                            className="text-xs font-semibold bg-[var(--colour-bg4)] hover:bg-[var(--colour-fsP2)]/10 px-3.5 py-1.5 rounded-full text-[var(--colour-text3)] hover:text-[var(--colour-fsP2)] border border-[var(--colour-border3)] transition-all"
                                        >
                                            0% downpayment
                                        </button>
                                        <button
                                            onClick={() => setDownPayment(Math.ceil(productPrice * 0.4))}
                                            className="text-xs font-semibold bg-[var(--colour-bg4)] hover:bg-[var(--colour-fsP2)]/10 px-3.5 py-1.5 rounded-full text-[var(--colour-text3)] hover:text-[var(--colour-fsP2)] border border-[var(--colour-border3)] transition-all"
                                        >
                                            40% downpayment
                                        </button>
                                    </div>
                                </div>

                                {/* Partner bank */}
                                <div className="space-y-2.5">
                                    <label className="text-sm font-bold text-[var(--colour-text2)]">Partner Bank</label>
                                    {isBanksLoading ? (
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                            {Array.from({ length: 6 }).map((_, i) => (
                                                <div key={i} className="h-16 rounded-xl bg-gray-100 animate-pulse" />
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                            {banks.map(bank => {
                                                const isSelected = selectedBank?.id === bank.id;
                                                const rate = bank.rate;
                                                return (
                                                    <button
                                                        key={bank.id}
                                                        onClick={() => setSelectedBank(bank)}
                                                        className={cn(
                                                            'flex items-center gap-3.5 p-3.5 rounded-xl text-left transition-all duration-200 border-2',
                                                            isSelected
                                                                ? 'border-[var(--colour-fsP2)] bg-blue-50/60 shadow-sm'
                                                                : 'border-[var(--colour-border3)] bg-white hover:border-[var(--colour-fsP2)]/40 hover:shadow-sm'
                                                        )}
                                                    >
                                                        {/* Logo */}
                                                        <div className="relative w-11 h-11 shrink-0 bg-white rounded-lg border border-gray-100 overflow-hidden flex items-center justify-center p-1">
                                                            {bank.img ? (
                                                                <Image src={bank.img} alt={bank.name} fill sizes="44px" className="object-contain" />
                                                            ) : (
                                                                <BankLogo name={bank.name} />
                                                            )}
                                                        </div>

                                                        <div className="flex-1 min-w-0">
                                                            <div className={cn(
                                                                'font-bold text-sm truncate',
                                                                isSelected ? 'text-[var(--colour-fsP2)]' : 'text-[var(--colour-text2)]'
                                                            )}>
                                                                {bank.name}
                                                            </div>
                                                            <div className="text-[11px] text-[var(--colour-text3)] font-medium mt-0.5">
                                                                {rate === 0 ? 'Interest free' : `${rate}% p.a.`}
                                                            </div>
                                                        </div>

                                                        {isSelected && (
                                                            <div className="w-5 h-5 bg-[var(--colour-fsP2)] rounded-full flex items-center justify-center shrink-0">
                                                                <CheckCircle className="w-3.5 h-3.5 text-white" />
                                                            </div>
                                                        )}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>

                                {/* Tenure */}
                                <div className="space-y-2.5">
                                    <label className="text-sm font-bold text-[var(--colour-text2)]">Tenure</label>
                                    <div className="flex flex-wrap gap-2">
                                        {(selectedBank?.tenureOptions || [6, 9, 12, 18, 24, 36]).map(months => (
                                            <button
                                                key={months}
                                                onClick={() => setTenure(months)}
                                                className={cn(
                                                    'px-6 py-2.5 rounded-full text-sm font-bold transition-all duration-200 border-2',
                                                    tenure === months
                                                        ? 'bg-[var(--colour-fsP2)] text-white border-[var(--colour-fsP2)] shadow-md shadow-[var(--colour-fsP2)]/20 scale-105'
                                                        : 'bg-white text-[var(--colour-text3)] border-[var(--colour-border3)] hover:border-[var(--colour-fsP2)]/50 hover:text-[var(--colour-fsP2)]'
                                                )}
                                            >
                                                {months} Months
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="pt-2 flex gap-2.5">
                                    <Button
                                        onClick={() => console.log('EMI:', emiData)}
                                        className="flex-1 bg-gradient-to-r from-[var(--colour-fsP2)] to-[#1565C0] hover:from-[#1565C0] hover:to-[var(--colour-fsP2)] text-white rounded-lg py-3 font-bold text-sm shadow-md shadow-[var(--colour-fsP2)]/15 hover:shadow-lg transition-all"
                                    >
                                        <Calculator className="w-4 h-4 mr-1.5" />
                                        Confirm Calculations
                                    </Button>
                                    <Button
                                        onClick={resetCalc}
                                        variant="outline"
                                        className="px-4 py-3 border border-gray-200 text-gray-500 hover:bg-gray-50 hover:text-gray-700 hover:border-gray-300 rounded-lg font-semibold text-sm transition-all"
                                    >
                                        <RefreshCcw className="w-4 h-4 mr-1.5" />
                                        Reset
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* RIGHT — Results */}
                    <div className="lg:col-span-5 space-y-6">
                        <div className="bg-white rounded-2xl shadow-[var(--shadow-premium-md)] overflow-hidden border border-[var(--colour-border3)]">

                            {/* Receipt header */}
                            <div className="bg-gradient-to-br from-[var(--colour-fsP2)] to-[#1565C0] p-6 text-center relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
                                <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/3" />
                                <div className="relative z-10">
                                    <p className="text-white/80 text-xs font-bold uppercase tracking-widest mb-2">Your Monthly EMI</p>
                                    <div className="text-4xl lg:text-[2.75rem] font-extrabold text-white tracking-tight">
                                        Rs {emiData ? Math.round(emiData.paymentPerMonth).toLocaleString() : '0'}
                                    </div>
                                    <p className="text-white/60 text-xs mt-1.5 font-medium">per month</p>
                                </div>
                            </div>

                            {/* Receipt body */}
                            <div className="p-5 sm:p-6 space-y-5">

                                {/* Selected bank info */}
                                {selectedBank && (
                                    <div className="flex items-center gap-3.5 p-3.5 bg-[var(--colour-bg4)] rounded-xl border border-[var(--colour-border3)]">
                                        <div className="relative w-12 h-12 bg-white rounded-lg border border-gray-100 shrink-0 overflow-hidden flex items-center justify-center p-1">
                                            {selectedBank.img ? (
                                                <Image src={selectedBank.img} alt={selectedBank.name} fill sizes="48px" className="object-contain" />
                                            ) : (
                                                <BankLogo name={selectedBank.name} />
                                            )}
                                        </div>
                                        <div>
                                            <div className="font-bold text-sm text-[var(--colour-text2)]">{selectedBank.name}</div>
                                            <div className="text-xs text-[var(--colour-text3)] font-medium">
                                                {tenure} months · {selectedBank.rate === 0 ? 'Interest free' : `${selectedBank.rate}% p.a.`}
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Financial details */}
                                <div className="bg-[var(--colour-bg4)] rounded-xl divide-y divide-[var(--colour-border3)] border border-[var(--colour-border3)]">
                                    <div className="flex justify-between items-center px-4 py-3">
                                        <span className="text-sm text-[var(--colour-text3)]">Product Price</span>
                                        <span className="text-sm font-bold text-[var(--colour-text2)]">Rs {productPrice.toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between items-center px-4 py-3">
                                        <span className="text-sm text-[var(--colour-text3)]">Down Payment</span>
                                        <span className="text-sm font-bold text-[var(--colour-bg3)]">
                                            - Rs {emiData ? Math.round(Number(emiData.downPayment)).toLocaleString() : '0'}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center px-4 py-3">
                                        <span className="text-sm text-[var(--colour-text3)]">Finance Amount</span>
                                        <span className="text-sm font-bold text-[var(--colour-fsP2)]">
                                            Rs {emiData ? Math.round(emiData.financeAmount).toLocaleString() : '0'}
                                        </span>
                                    </div>
                                </div>

                                {/* Charge notice */}
                                {downPaymentPct >= 0.4 ? (
                                    <div className="bg-emerald-50 text-emerald-700 text-xs p-2.5 rounded-lg text-center font-semibold border border-emerald-200 flex items-center justify-center gap-1.5">
                                        <CheckCircle className="w-3.5 h-3.5" />
                                        No Additional Charges Apply
                                    </div>
                                ) : (
                                    <div className="bg-amber-50 text-amber-700 text-xs p-2.5 rounded-lg text-center font-semibold border border-amber-200">
                                        Additional charges on &lt;40% down payment
                                    </div>
                                )}

                                {/* Apply */}
                                <Button
                                    onClick={() => {
                                        if (!product || !selectedBank) return;
                                        const params = new URLSearchParams({
                                            slug: product.slug,
                                            bank: selectedBank.name,
                                            tenure: String(tenure),
                                            downPayment: String(emiData?.downPayment ?? 0),
                                        }).toString();
                                        router.push(`/emi/applyemi?${params}`);
                                    }}
                                    className="w-full py-3.5 bg-gradient-to-r from-[#166534] to-[#15803d] hover:from-[#14532d] hover:to-[#166534] text-white rounded-lg shadow-md shadow-green-800/15 font-bold text-sm group transition-all"
                                >
                                    Apply Now
                                    <ChevronDown className="ml-1.5 w-4 h-4 group-hover:translate-y-0.5 transition-transform" />
                                </Button>

                                <p className="text-center text-xs font-medium text-gray-400">
                                    {currentText}<span className="animate-pulse">|</span>
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
                <EmiFaq params={params} />
            </div>
        </div>
    );
};

export default ClientEmiPage;