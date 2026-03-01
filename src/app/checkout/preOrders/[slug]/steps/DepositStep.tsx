'use client';

import React, { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Banknote, AlertCircle, ArrowRight, BadgePercent, Truck, ShieldCheck, ChevronLeft } from 'lucide-react';

interface DepositStepProps {
    productPrice: number;
    depositAmount: number;
    setDepositAmount: (amount: number) => void;
    isFullPaymentRequired: boolean;
    onNext: () => void;
    onBack: () => void;
}

const PRESET_PERCENTAGES = [
    { label: '10%', value: 0.10 },
    { label: '25%', value: 0.25 },
    { label: '50%', value: 0.50 },
    { label: 'Full', value: 1.00 },
];

export default function DepositStep({
    productPrice,
    depositAmount,
    setDepositAmount,
    isFullPaymentRequired,
    onNext,
    onBack,
}: DepositStepProps) {
    const MIN_DEPOSIT = isFullPaymentRequired ? productPrice : 5000;
    const [inputStr, setInputStr] = useState<string>(depositAmount.toString());
    const [error, setError] = useState<string>('');

    const clampAndSet = useCallback((raw: number) => {
        const clamped = Math.min(Math.max(Math.round(raw), MIN_DEPOSIT), productPrice);
        setDepositAmount(clamped);
        setInputStr(clamped.toString());
        if (raw < MIN_DEPOSIT) setError(`Minimum deposit is Rs. ${MIN_DEPOSIT.toLocaleString()}`);
        else if (raw > productPrice) setError(`Cannot exceed product price Rs. ${productPrice.toLocaleString()}`);
        else setError('');
    }, [MIN_DEPOSIT, productPrice, setDepositAmount]);

    const handleBlur = () => {
        const parsed = parseInt(inputStr.replace(/,/g, ''), 10);
        if (isNaN(parsed)) { clampAndSet(MIN_DEPOSIT); return; }
        clampAndSet(parsed);
    };

    const handlePreset = (pct: number) => {
        const raw = Math.round(productPrice * pct);
        clampAndSet(raw);
    };

    const sliderPct = Math.round(((depositAmount - MIN_DEPOSIT) / Math.max(productPrice - MIN_DEPOSIT, 1)) * 100);
    const remainingBalance = productPrice - depositAmount;

    const perks = [
        { icon: ShieldCheck, text: "Fully refundable if we can't deliver", color: 'text-purple-500', bg: 'bg-purple-50' },
        { icon: BadgePercent, text: "Price locked at today's rate", color: 'text-emerald-500', bg: 'bg-emerald-50' },
        { icon: Truck, text: 'Priority dispatch once stock arrives', color: 'text-orange-500', bg: 'bg-orange-50' },
    ];

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden animate-in fade-in zoom-in-95 duration-300">
            {/* Header — theme colour */}
            <div className="px-6 py-5 border-b border-gray-100 bg-(--colour-fsP2)">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
                        <Banknote className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-white leading-tight">Choose Your Deposit</h3>
                        <p className="text-white/70 text-xs mt-0.5">Pay minimum Rs. 5,000 now — rest on delivery</p>
                    </div>
                </div>
            </div>

            <div className="p-6 space-y-6">

                {/* Full Payment Notice */}
                {isFullPaymentRequired ? (
                    <div className="bg-orange-50 p-4 rounded-xl border border-orange-100 flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 text-orange-500 shrink-0 mt-0.5" />
                        <div className="text-sm text-orange-800">
                            <strong>Full Payment Required:</strong> Product price is under Rs. 5,000, so the full amount is required to secure this pre-order.
                        </div>
                    </div>
                ) : (
                    <div className="space-y-5">
                        {/* Number Input */}
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Deposit Amount</label>
                            <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-bold">Rs.</span>
                                <input
                                    type="number"
                                    value={inputStr}
                                    onChange={(e) => { setInputStr(e.target.value); if (error) setError(''); }}
                                    onBlur={handleBlur}
                                    className={`w-full pl-12 pr-4 h-14 text-xl font-bold rounded-xl border-2 bg-gray-50 focus:bg-white outline-none transition-all ${error ? 'border-red-400 focus:border-red-500' : 'border-gray-200 focus:border-(--colour-fsP2)'}`}
                                />
                            </div>
                            {error && (
                                <p className="text-xs text-red-500 font-medium mt-1.5 flex items-center gap-1">
                                    <AlertCircle className="w-3 h-3" /> {error}
                                </p>
                            )}
                        </div>

                        {/* Slider */}
                        <div className="space-y-2">
                            <input
                                type="range"
                                min={MIN_DEPOSIT}
                                max={productPrice}
                                step={100}
                                value={depositAmount}
                                onChange={(e) => clampAndSet(parseInt(e.target.value))}
                                className="w-full h-2 rounded-full appearance-none cursor-pointer accent-(--colour-fsP2)"
                            />
                            <div className="flex justify-between text-[10px] text-gray-400 font-medium">
                                <span>Min: Rs. {MIN_DEPOSIT.toLocaleString()}</span>
                                <span className="text-(--colour-fsP2) font-bold">{sliderPct}% of total</span>
                                <span>Full: Rs. {productPrice.toLocaleString()}</span>
                            </div>
                        </div>

                        {/* Preset Buttons */}
                        <div className="grid grid-cols-4 gap-2">
                            {PRESET_PERCENTAGES.map(({ label, value }) => {
                                const presetAmt = Math.round(productPrice * value);
                                const isActive = depositAmount === Math.max(presetAmt, MIN_DEPOSIT);
                                return (
                                    <button
                                        key={label}
                                        onClick={() => handlePreset(value)}
                                        className={`py-2 rounded-lg text-xs font-bold border-2 transition-all ${isActive
                                                ? 'bg-(--colour-fsP2) border-(--colour-fsP2) text-white shadow-sm'
                                                : 'bg-gray-50 border-gray-200 text-gray-600 hover:border-(--colour-fsP2)/40 hover:bg-(--colour-fsP2)/5'
                                            }`}
                                    >
                                        {label}
                                    </button>
                                );
                            })}
                        </div>

                        {/* Split Preview */}
                        <div className="bg-(--colour-fsP2)/5 rounded-xl p-4 flex gap-4 border border-(--colour-fsP2)/15">
                            <div className="flex-1 text-center border-r border-(--colour-fsP2)/20 pr-4">
                                <p className="text-[10px] font-bold text-(--colour-fsP2) uppercase tracking-wider mb-1">Pay Now</p>
                                <p className="text-xl font-extrabold text-(--colour-fsP2)">Rs. {depositAmount.toLocaleString()}</p>
                            </div>
                            <div className="flex-1 text-center pl-2">
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">On Delivery</p>
                                <p className="text-xl font-extrabold text-gray-700">Rs. {remainingBalance.toLocaleString()}</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Perks Row */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {perks.map(({ icon: Icon, text, color, bg }) => (
                        <div key={text} className={`flex items-start gap-2 p-3 rounded-xl ${bg}`}>
                            <Icon className={`w-4 h-4 shrink-0 mt-0.5 ${color}`} />
                            <p className="text-xs text-gray-700 leading-snug font-medium">{text}</p>
                        </div>
                    ))}
                </div>

                {/* Navigation */}
                <div className="pt-2 flex items-center justify-between">
                    <button
                        type="button"
                        onClick={onBack}
                        className="flex items-center gap-1.5 text-sm font-semibold text-gray-500 hover:text-gray-800 transition-colors"
                    >
                        <ChevronLeft className="w-4 h-4" /> Back
                    </button>
                    <Button
                        onClick={() => {
                            handleBlur();
                            if (!error) onNext();
                        }}
                        className="h-12 px-8 bg-(--colour-fsP2) hover:bg-(--colour-fsP2)/90 text-white font-bold rounded-xl shadow-md transition-all active:scale-95 gap-2"
                    >
                        Continue to Payment
                        <ArrowRight className="w-4 h-4" />
                    </Button>
                </div>
            </div>
        </div>
    );
}
