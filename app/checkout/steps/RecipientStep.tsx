'use client';

import React, { useRef } from 'react';
import { User, Gift, ChevronRight, ChevronLeft, Phone, UserCircle, MessageSquare, Heart, Camera, X, Check } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { CheckoutState, RecipientType, RecipientInfo } from '../checkoutTypes';
import { RECIPIENT_TYPES } from '../checkoutTypes';
import Image from 'next/image';

interface RecipientStepProps {
    state: CheckoutState;
    onRecipientChange: (recipient: RecipientInfo) => void;
    onNext: () => void;
    onBack: () => void;
}

const recipientOptions = [
    {
        type: RECIPIENT_TYPES.SELF,
        icon: User,
        title: 'For Myself',
        description: 'I will receive this personally',
    },
    {
        type: RECIPIENT_TYPES.GIFT,
        icon: Gift,
        title: 'Gift for Someone',
        description: 'Send with a personal message',
    },
];

export default function RecipientStep({ state, onRecipientChange, onNext, onBack }: RecipientStepProps) {
    const { recipient } = state;
    const fileInputRefRecipient = useRef<HTMLInputElement>(null);
    const fileInputRefSender = useRef<HTMLInputElement>(null);

    const handleTypeSelect = (type: RecipientType) => {
        onRecipientChange({
            ...recipient,
            type,
            name: type === RECIPIENT_TYPES.SELF ? '' : recipient.name,
            phone: recipient.phone,
            message: type === RECIPIENT_TYPES.GIFT ? recipient.message : '',
            recipientPhoto: undefined,
            senderPhoto: undefined,
        });
    };

    const handleFieldChange = (field: keyof RecipientInfo, value: string) => {
        onRecipientChange({ ...recipient, [field]: value });
    };

    const handlePhotoUpload = (field: 'recipientPhoto' | 'senderPhoto', file: File) => {
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                onRecipientChange({ ...recipient, [field]: reader.result as string });
            };
            reader.readAsDataURL(file);
        }
    };

    const removePhoto = (field: 'recipientPhoto' | 'senderPhoto') => {
        onRecipientChange({ ...recipient, [field]: undefined });
        if (field === 'recipientPhoto' && fileInputRefRecipient.current) fileInputRefRecipient.current.value = '';
        if (field === 'senderPhoto' && fileInputRefSender.current) fileInputRefSender.current.value = '';
    };

    const isComplete = () => {
        if (recipient.type === RECIPIENT_TYPES.SELF) {
            return !!recipient.phone?.trim() && recipient.phone.length >= 10;
        }
        if (recipient.type === RECIPIENT_TYPES.GIFT || recipient.type === RECIPIENT_TYPES.ANONYMOUS) {
            return !!recipient.name?.trim() && !!recipient.phone?.trim();
        }
        return true;
    };

    const PhotoUpload = ({
        label,
        photo,
        field,
        inputRef,
    }: {
        label: string;
        photo?: string;
        field: 'recipientPhoto' | 'senderPhoto';
        inputRef: React.RefObject<HTMLInputElement | null>;
    }) => (
        <div className="space-y-1.5">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wide block">{label}</span>
            {photo ? (
                <div className="relative w-full h-24 rounded-xl overflow-hidden border border-gray-100 group">
                    <Image src={photo} alt="Uploaded" fill sizes="300px" className="object-cover" />
                    <button
                        onClick={() => removePhoto(field)}
                        className="absolute top-1.5 right-1.5 w-6 h-6 bg-white/90 rounded-full flex items-center justify-center shadow-sm hover:bg-red-50 text-gray-400 hover:text-red-400 transition-colors cursor-pointer"
                    >
                        <X className="w-3.5 h-3.5" />
                    </button>
                    <div className="absolute bottom-0 left-0 right-0 bg-black/40 text-white text-[9px] py-1 text-center font-medium">
                        Uploaded
                    </div>
                </div>
            ) : (
                <div
                    onClick={() => inputRef.current?.click()}
                    className="border border-dashed border-gray-200 hover:border-[var(--colour-fsP2)] rounded-xl h-24 flex flex-col items-center justify-center gap-1.5 cursor-pointer transition-colors bg-gray-50/50 hover:bg-[#EBF3FC]/30 group"
                >
                    <Camera className="w-4 h-4 text-gray-300 group-hover:text-[var(--colour-fsP2)] transition-colors" />
                    <span className="text-[10px] text-gray-400 group-hover:text-[var(--colour-fsP2)] transition-colors">Upload Photo</span>
                </div>
            )}
            <input
                type="file"
                ref={inputRef}
                className="hidden"
                accept="image/*"
                onChange={(e) => e.target.files?.[0] && handlePhotoUpload(field, e.target.files[0])}
            />
        </div>
    );

    return (
        <div className="space-y-4">
            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">

                {/* Header */}
                <div className="px-4 sm:px-5 py-3 sm:py-4 border-b border-gray-100 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-[#EBF3FC] flex items-center justify-center flex-shrink-0">
                        <UserCircle className="w-4 h-4 text-[var(--colour-fsP2)]" />
                    </div>
                    <div>
                        <h2 className="text-sm font-bold text-gray-900">Who is receiving this?</h2>
                        <p className="text-[11px] text-gray-400 mt-0.5">Select the recipient for this order</p>
                    </div>
                </div>

                <div className="p-3 sm:p-5 space-y-3 sm:space-y-4">

                    {/* Option Cards - 2-col always for compact layout */}
                    <div className="grid grid-cols-2 gap-2 sm:gap-2.5">
                        {recipientOptions.map((option) => {
                            const isSelected = recipient.type === option.type;
                            const Icon = option.icon;
                            return (
                                <button
                                    key={option.type}
                                    onClick={() => handleTypeSelect(option.type)}
                                    className={`relative flex items-center gap-2.5 p-3 sm:p-3.5 rounded-xl border text-left transition-all ${isSelected
                                            ? 'border-[var(--colour-fsP2)] bg-[#EBF3FC]/40'
                                            : 'border-gray-100 bg-white hover:border-gray-200 hover:bg-gray-50/60'
                                        }`}
                                >
                                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors ${isSelected ? 'bg-[var(--colour-fsP2)]' : 'bg-gray-100'
                                        }`}>
                                        <Icon className={`w-4 h-4 ${isSelected ? 'text-white' : 'text-gray-400'}`} />
                                    </div>
                                    <div className="min-w-0">
                                        <p className={`text-xs font-bold ${isSelected ? 'text-[var(--colour-fsP2)]' : 'text-gray-700'}`}>
                                            {option.title}
                                        </p>
                                        <p className="text-[10px] text-gray-400 leading-snug mt-0.5">{option.description}</p>
                                    </div>
                                    {isSelected && (
                                        <div className="absolute top-2.5 right-2.5 w-4 h-4 rounded-full bg-[var(--colour-fsP2)] flex items-center justify-center">
                                            <Check className="w-2.5 h-2.5 text-white" strokeWidth={3} />
                                        </div>
                                    )}
                                </button>
                            );
                        })}
                    </div>

                    {/* SELF form */}
                    {recipient.type === RECIPIENT_TYPES.SELF && (
                        <div className="bg-gray-50/60 rounded-xl border border-gray-100 p-3 sm:p-4 space-y-3 animate-in fade-in duration-200">
                            <div className="flex items-center gap-2">
                                <User className="w-3.5 h-3.5 text-[var(--colour-fsP2)]" />
                                <p className="text-xs font-bold text-gray-700">You are the recipient</p>
                            </div>
                            <p className="text-[11px] text-gray-400 leading-relaxed">
                                Please verify your contact number. Our delivery partner will use this to reach you.
                            </p>
                            <div className="space-y-1.5">
                                <span className="text-[11px] font-bold text-gray-700 uppercase tracking-wide block">
                                    Contact Number <span className="text-red-500">*</span>
                                </span>
                                <div className="relative">
                                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <Input
                                        placeholder="98XXXXXXXX"
                                        value={recipient.phone || ''}
                                        onChange={(e) => handleFieldChange('phone', e.target.value.replace(/\D/g, ''))}
                                        maxLength={10}
                                        className="pl-10 h-12 bg-white border-gray-200 focus:border-[var(--colour-fsP2)] focus:ring-[var(--colour-fsP2)]/10 rounded-xl text-sm font-bold tracking-widest text-gray-900 placeholder:text-gray-400 shadow-sm"
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* GIFT form */}
                    {recipient.type === RECIPIENT_TYPES.GIFT && (
                        <div className="bg-gray-50/60 rounded-xl border border-gray-100 p-3 sm:p-4 space-y-3 sm:space-y-4 animate-in fade-in duration-200">
                            <div className="flex items-center gap-2 pb-1 border-b border-pink-100/50">
                                <Heart className="w-4 h-4 text-pink-500 fill-pink-500" />
                                <p className="text-[13px] font-extrabold text-gray-900 uppercase tracking-tight">Gift Delivery Details</p>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div className="space-y-1.5">
                                    <span className="text-[11px] font-bold text-gray-700 uppercase tracking-wide block">
                                        Recipient Name <span className="text-red-500">*</span>
                                    </span>
                                    <div className="relative">
                                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                        <Input
                                            placeholder="e.g. John Doe"
                                            value={recipient.name || ''}
                                            onChange={(e) => handleFieldChange('name', e.target.value)}
                                            className="pl-10 h-12 bg-white border-gray-200 focus:border-[var(--colour-fsP2)] rounded-xl text-sm font-bold text-gray-900 placeholder:text-gray-400 shadow-sm"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-1.5">
                                    <span className="text-[11px] font-bold text-gray-700 uppercase tracking-wide block">
                                        Recipient Phone <span className="text-red-500">*</span>
                                    </span>
                                    <div className="relative">
                                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                        <Input
                                            placeholder="98XXXXXXXX"
                                            value={recipient.phone || ''}
                                            onChange={(e) => handleFieldChange('phone', e.target.value.replace(/\D/g, ''))}
                                            maxLength={10}
                                            className="pl-10 h-12 bg-white border-gray-200 focus:border-[var(--colour-fsP2)] rounded-xl text-sm tracking-widest font-bold text-gray-900 placeholder:text-gray-400 shadow-sm"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <PhotoUpload
                                    label="Recipient Photo"
                                    photo={recipient.recipientPhoto}
                                    field="recipientPhoto"
                                    inputRef={fileInputRefRecipient}
                                />
                                <PhotoUpload
                                    label="Your Photo"
                                    photo={recipient.senderPhoto}
                                    field="senderPhoto"
                                    inputRef={fileInputRefSender}
                                />
                            </div>

                            <div className="space-y-1.5">
                                <span className="text-[11px] font-bold text-gray-700 uppercase tracking-wide block">
                                    Personal Message <span className="font-normal normal-case text-gray-400">(optional)</span>
                                </span>
                                <div className="relative">
                                    <MessageSquare className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                                    <textarea
                                        placeholder="Write a sweet note..."
                                        value={recipient.message || ''}
                                        onChange={(e) => handleFieldChange('message', e.target.value)}
                                        rows={3}
                                        className="w-full border border-gray-200 pl-10 pr-4 py-3 bg-white rounded-xl focus:border-[var(--colour-fsP2)] focus:ring-2 focus:ring-[var(--colour-fsP2)]/10 outline-none text-sm transition-all resize-none text-gray-900 font-medium placeholder:text-gray-400 shadow-sm min-h-[88px]"
                                    />
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Navigation */}
            <div className="flex flex-col-reverse sm:flex-row justify-between gap-3 pt-4 border-t border-gray-100">
                <button
                    onClick={onBack}
                    className="w-full sm:w-auto flex items-center justify-center gap-2 h-12 px-6 border border-gray-200 rounded-xl bg-white text-sm font-bold text-gray-500 hover:bg-gray-50 hover:text-gray-700 transition-all cursor-pointer shadow-sm active:scale-95"
                >
                    <ChevronLeft className="w-4 h-4" />
                    Back
                </button>
                <button
                    onClick={onNext}
                    disabled={!isComplete()}
                    className="w-full sm:w-auto flex items-center justify-center gap-2 h-12 px-6 sm:px-10 rounded-xl bg-[var(--colour-fsP2)] text-white text-sm font-extrabold hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all active:scale-95 cursor-pointer shadow-lg shadow-blue-100/50"
                >
                    <span>Continue to Payment</span>
                    <ChevronRight className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
}