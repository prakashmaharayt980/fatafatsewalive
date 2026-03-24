'use client';

import React from 'react';
import { Truck, ChevronRight, ChevronLeft, Hash, Check, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Image from 'next/image';
import { CheckoutState, DeliveryPartner, DeliverySelection } from '../checkoutTypes';
import { deliveypartnerDetails } from '../../CommonVue/deliveypartner';

interface DeliveryStepProps {
    state: CheckoutState;
    onDeliveryChange: (delivery: DeliverySelection) => void;
    onNext: () => void;
    onBack: () => void;
}

export default function DeliveryStep({ state, onDeliveryChange, onNext, onBack }: DeliveryStepProps) {
    const { delivery } = state;

    const handlePartnerSelect = (partner: DeliveryPartner) => {
        onDeliveryChange({
            partner,
            userId: '', // Reset user ID when switching
        });
    };

    const handleUserIdChange = (userId: string) => {
        onDeliveryChange({
            ...delivery,
            userId,
        });
    };

    const isComplete = delivery.partner !== null;

    return (
        <div className="animate-fade-in-premium space-y-6">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-[var(--shadow-premium-sm)] overflow-hidden">
                {/* Header */}
                <div className="p-6 border-b border-gray-100 bg-white">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
                            <Truck className="w-6 h-6 text-[var(--colour-fsP2)]" />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-gray-900">Choose Delivery Partner</h3>
                            <p className="text-sm text-gray-500">Select how you'd like your order delivered</p>
                        </div>
                    </div>
                </div>

                <div className="p-6 space-y-6">
                    {/* Partner Cards Grid - Clean, Recommended & Blue */}
                    <div className="grid gap-4 sm:grid-cols-2">
                        {deliveypartnerDetails.map((partner) => {
                            const isSelected = delivery.partner?.id === partner.id;
                            const isFatafat = partner.id === 0;

                            return (
                                <button
                                    key={partner.id}
                                    onClick={() => handlePartnerSelect(partner as DeliveryPartner)}
                                    className={`relative p-4 rounded-xl border-2 text-left transition-all duration-300 group overflow-hidden flex items-center gap-4 ${isSelected
                                        ? 'border-[var(--colour-fsP2)] bg-blue-50/30'
                                        : 'border-gray-100 bg-white hover:border-gray-200 hover:shadow-md'
                                        }`}
                                >
                                    {/* Recommended Badge */}
                                    {isFatafat && (
                                        <div className="absolute top-0 right-0 bg-[var(--colour-fsP1)] text-white text-[9px] font-bold px-2 py-0.5 rounded-bl-lg z-10 shadow-sm">
                                            RECOMMENDED
                                        </div>
                                    )}

                                    {/* Logo Container */}
                                    <div className={`relative w-14 h-14 rounded-lg flex-shrink-0 flex items-center justify-center p-1 bg-white border ${isSelected ? 'border-blue-100' : 'border-gray-100'
                                        }`}>
                                        <Image
                                            src={partner.img}
                                            alt={partner.name}
                                            width={64}
                                            height={64}
                                            className="object-contain "
                                        />
                                    </div>

                                    {/* Content */}
                                    <div className="flex-1 min-w-0">
                                        <h4 className={`text-base font-bold mb-1 ${isSelected ? 'text-[var(--colour-fsP2)]' : 'text-gray-900'}`}>
                                            {partner.name}
                                        </h4>
                                        <p className="text-xs text-gray-500 leading-relaxed">
                                            {partner.description}
                                        </p>
                                    </div>

                                    {/* Selection Indicator */}
                                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${isSelected
                                        ? 'border-[var(--colour-fsP2)] bg-[var(--colour-fsP2)]'
                                        : 'border-gray-300 bg-transparent'
                                        }`}>
                                        {isSelected && <Check className="w-3 h-3 text-white" strokeWidth={4} />}
                                    </div>
                                </button>
                            );
                        })}
                    </div>

                    {/* Delivery Instructions - Blue Theme Focus */}
                    <div className="pt-6 border-t border-gray-100 animate-fade-in-up">
                        <div className="space-y-3">
                            <Label className="text-sm font-bold text-gray-900 uppercase tracking-wider block">
                                Delivery Instructions <span className="text-gray-400 font-normal normal-case">(Optional)</span>
                            </Label>
                            <div className="relative">
                                <textarea
                                    placeholder="Any special requests for the driver?"
                                    value={delivery.instructions || ''}
                                    onChange={(e) => onDeliveryChange({ ...delivery, instructions: e.target.value })}
                                    rows={3}
                                    className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:border-[var(--colour-fsP2)] focus:ring-4 focus:ring-blue-50 outline-none text-sm font-medium transition-all resize-none placeholder:text-gray-400"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Partner Specific Info / ID Input - Blue Theme */}
                    {delivery.partner?.requiresUserId && (
                        <div className="pt-2 animate-fade-in-up">
                            <div className="bg-blue-50/50 rounded-xl border border-blue-100 p-5 space-y-4">
                                <div className="flex items-center gap-3">
                                    <Info className="w-5 h-5 text-[var(--colour-fsP2)]" />
                                    <h4 className="font-semibold text-gray-900 text-sm">
                                        Enter {delivery.partner.name} Details
                                    </h4>
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-xs font-bold text-gray-700 uppercase tracking-wide">
                                        {delivery.partner.name} User ID
                                    </Label>
                                    <div className="relative">
                                        <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                        <Input
                                            placeholder={`Enter ${delivery.partner.name} ID`}
                                            value={delivery.userId || ''}
                                            onChange={(e) => handleUserIdChange(e.target.value)}
                                            className="pl-10 h-11 bg-white border-gray-200 focus:border-[var(--colour-fsP2)] focus:ring-blue-50 rounded-lg text-sm"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Navigation Buttons - Fixed Footer */}
            <div className="flex flex-col-reverse sm:flex-row justify-between gap-4 pt-6 border-t border-gray-100">
                <Button
                    onClick={onBack}
                    variant="outline"
                    className="h-11 px-6 border-gray-200 text-gray-700 font-bold rounded-xl hover:bg-gray-50 text-sm"
                >
                    <ChevronLeft className="w-4 h-4 mr-1" />
                    Back
                </Button>
                <Button
                    onClick={onNext}
                    disabled={!isComplete}
                    className="h-11 px-8 bg-[var(--colour-fsP2)] hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg shadow-blue-200 transition-all hover:shadow-xl active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                >
                    Continue
                    <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
            </div>
        </div>
    );
}
