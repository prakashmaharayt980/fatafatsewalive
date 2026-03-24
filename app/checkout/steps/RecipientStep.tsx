'use client';

import React, { useRef, useState } from 'react';
import { User, Gift, EyeOff, ChevronRight, ChevronLeft, Phone, UserCircle, MessageSquare, Check, Heart, Camera, Upload, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CheckoutState, RECIPIENT_TYPES, RecipientType, RecipientInfo } from '../checkoutTypes';
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
        description: 'I will receive this order personally',
    },
    {
        type: RECIPIENT_TYPES.GIFT,
        icon: Gift,
        title: 'Gift for Someone',
        description: 'Send as a gift with a personal message',
    }

];

export default function RecipientStep({ state, onRecipientChange, onNext, onBack }: RecipientStepProps) {
    const { recipient } = state;
    const fileInputRefRecipient = useRef<HTMLInputElement>(null);
    const fileInputRefSender = useRef<HTMLInputElement>(null);

    const handleTypeSelect = (type: RecipientType) => {
        onRecipientChange({
            ...recipient,
            type,
            // Only reset name for SELF, keep phone as it might be needed
            name: type === RECIPIENT_TYPES.SELF ? '' : recipient.name,
            phone: recipient.phone,
            message: type === RECIPIENT_TYPES.GIFT ? recipient.message : '',
            recipientPhoto: undefined,
            senderPhoto: undefined,
        });
    };

    const handleFieldChange = (field: keyof RecipientInfo, value: string) => {
        onRecipientChange({
            ...recipient,
            [field]: value,
        });
    };

    const handlePhotoUpload = (field: 'recipientPhoto' | 'senderPhoto', file: File) => {
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                onRecipientChange({
                    ...recipient,
                    [field]: reader.result as string,
                });
            };
            reader.readAsDataURL(file);
        }
    };

    const removePhoto = (field: 'recipientPhoto' | 'senderPhoto') => {
        onRecipientChange({
            ...recipient,
            [field]: undefined,
        });
        if (field === 'recipientPhoto' && fileInputRefRecipient.current) fileInputRefRecipient.current.value = '';
        if (field === 'senderPhoto' && fileInputRefSender.current) fileInputRefSender.current.value = '';
    };

    const isComplete = () => {
        // For Self, we need phone number now
        if (recipient.type === RECIPIENT_TYPES.SELF) {
            return !!recipient.phone?.trim() && recipient.phone.length >= 10;
        }

        // For Gift AND Anonymous, we need recipient details to deliver!
        if (recipient.type === RECIPIENT_TYPES.GIFT || recipient.type === RECIPIENT_TYPES.ANONYMOUS) {
            return !!recipient.name?.trim() && !!recipient.phone?.trim();
        }
        return true;
    };

    // Helper for Photo Upload UI
    const PhotoUpload = ({
        label,
        photo,
        field,
        inputRef
    }: {
        label: string,
        photo?: string,
        field: 'recipientPhoto' | 'senderPhoto',
        inputRef: React.RefObject<HTMLInputElement>
    }) => (
        <div className="space-y-2">
            <Label className="text-xs font-bold text-gray-600 uppercase tracking-wide">{label}</Label>

            {photo ? (
                <div className="relative w-full h-32 rounded-xl overflow-hidden border border-gray-200 group">
                    <Image src={photo} alt="Uploaded" fill className="object-cover" />
                    <button
                        onClick={() => removePhoto(field)}
                        className="absolute top-2 right-2 bg-white/90 p-1 rounded-full shadow-sm hover:bg-red-50 text-gray-500 hover:text-red-500 transition-colors"
                    >
                        <X className="w-4 h-4" />
                    </button>
                    <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-[10px] py-1 text-center font-medium">
                        Uploaded Successfully
                    </div>
                </div>
            ) : (
                <div
                    onClick={() => inputRef.current?.click()}
                    className="border-2 border-dashed border-gray-200 hover:border-[var(--colour-fsP2)] hover:bg-blue-50/30 rounded-xl h-32 flex flex-col items-center justify-center cursor-pointer transition-all group"
                >
                    <div className="p-2 bg-gray-50 rounded-full mb-2 group-hover:scale-110 transition-transform">
                        <Camera className="w-5 h-5 text-gray-400 group-hover:text-[var(--colour-fsP2)]" />
                    </div>
                    <p className="text-xs font-medium text-gray-500 group-hover:text-[var(--colour-fsP2)]">Click to Upload Photo</p>
                    <p className="text-[10px] text-gray-400 mt-1">JPG, PNG (Max 5MB)</p>
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
        <div className="space-y-6">
            <div className="bg-white rounded-xl shadow border border-gray-200 overflow-hidden">
                {/* Header */}
                <div className="p-6 border-b border-gray-100 flex items-center gap-3 bg-white">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
                        <UserCircle className="w-6 h-6 text-[var(--colour-fsP2)]" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-gray-900">Who is receiving this?</h2>
                        <p className="text-sm text-gray-500">Select the recipient for this order</p>
                    </div>
                </div>

                <div className="p-6 space-y-6">
                    {/* Option Cards Grid */}
                    <div className="grid gap-4 sm:grid-cols-3">
                        {recipientOptions.map((option) => {
                            const isSelected = recipient.type === option.type;
                            const Icon = option.icon;

                            return (
                                <button
                                    key={option.type}
                                    onClick={() => handleTypeSelect(option.type)}
                                    className={`relative p-4 rounded-xl border-2 text-left transition-all duration-200 group flex flex-col justify-between h-full ${isSelected
                                        ? 'border-[var(--colour-fsP2)] bg-blue-50/30 shadow-sm'
                                        : 'border-gray-200 bg-white hover:border-[var(--colour-fsP2)]/30 hover:bg-blue-50/20'
                                        }`}
                                >
                                    <div>
                                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 transition-colors ${isSelected
                                            ? 'bg-[var(--colour-fsP2)] text-white'
                                            : 'bg-gray-100 text-gray-500 group-hover:bg-gray-200'
                                            }`}>
                                            <Icon className="w-5 h-5" />
                                        </div>
                                        <h3 className={`font-bold text-sm mb-1 ${isSelected ? 'text-[var(--colour-fsP2)]' : 'text-gray-900'}`}>
                                            {option.title}
                                        </h3>
                                        <p className="text-xs text-gray-500 leading-relaxed">
                                            {option.description}
                                        </p>
                                    </div>

                                    {isSelected && (
                                        <div className="absolute top-3 right-3 text-[var(--colour-fsP2)]">
                                            <div className="w-5 h-5 rounded-full bg-[var(--colour-fsP2)] flex items-center justify-center shadow-sm">
                                                <Check className="w-3 h-3 text-white" strokeWidth={3} />
                                            </div>
                                        </div>
                                    )}
                                </button>
                            );
                        })}
                    </div>

                    {/* Dynamic Form Sections */}
                    <div className="min-h-[100px]">
                        {/* SELF RECIPIENT MSG */}
                        {recipient.type === RECIPIENT_TYPES.SELF && (
                            <div className="bg-blue-50/30 rounded p-6 border border-blue-100 flex flex-col gap-6 animate-fade-in-up">
                                <div className="flex items-start gap-4">
                                    <div className="p-2.5 bg-white rounded-full shadow-sm border border-blue-100">
                                        <User className="w-5 h-5 text-[var(--colour-fsP2)]" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-gray-900 text-sm">You are the recipient</h4>
                                        <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                                            Please verify your contact number. This will be used by our delivery partner to contact you.
                                        </p>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider ml-1">Contact Number <span className="text-red-500">*</span></Label>
                                    <div className="relative group">
                                        <div className="absolute left-3 top-1/2 -translate-y-1/2 p-1.5  rounded-md ">
                                            <Phone className="w-4 h-4 text-gray-400 group-focus-within:text-[var(--colour-fsP2)] transition-colors" />
                                        </div>
                                        <Input
                                            placeholder="98XXXXXXXX"
                                            value={recipient.phone || ''}
                                            onChange={(e) => handleFieldChange('phone', e.target.value.replace(/\D/g, ''))}
                                            maxLength={10}
                                            className="pl-12 h-12 border-2 bg-white border-gray-200 focus:border-[var(--colour-fsP2)] focus:ring-6 focus:ring-blue-50/50 rounded-xl text-sm font-bold tracking-widest  text-gray-700 placeholder:text-gray-300  transition-all"
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* GIFT FORM */}
                        {recipient.type === RECIPIENT_TYPES.GIFT && (
                            <div className="space-y-6 animate-fade-in-up bg-gradient-to-br from-pink-50/50 to-blue-50/30 p-6 rounded-xl border border-gray-200">
                                <div className="flex items-center gap-2 mb-2">
                                    <Heart className="w-4 h-4 text-pink-500 fill-pink-500" />
                                    <h4 className="font-bold text-gray-900 text-sm">Gift Details</h4>
                                </div>

                                <div className="grid gap-5 sm:grid-cols-2">
                                    <div className="space-y-1.5">
                                        <Label className="text-xs font-bold text-gray-600 uppercase tracking-wide">Recipient Name <span className="text-red-500">*</span></Label>
                                        <div className="relative">
                                            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                            <Input
                                                placeholder="e.g. John Doe"
                                                value={recipient.name || ''}
                                                onChange={(e) => handleFieldChange('name', e.target.value)}
                                                className="pl-10 border-2 h-11 bg-white border-gray-200 focus:border-pink-500 focus:ring-pink-100 rounded-lg text-sm"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label className="text-xs font-bold text-gray-600 uppercase tracking-wide">Recipient Phone <span className="text-red-500">*</span></Label>
                                        <div className="relative">
                                            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                            <Input
                                                placeholder="98XXXXXXXX"
                                                value={recipient.phone || ''}
                                                onChange={(e) => handleFieldChange('phone', e.target.value.replace(/\D/g, ''))}
                                                maxLength={10}
                                                className="pl-10  border-2 h-11 bg-white border-gray-200 focus:border-pink-500 focus:ring-pink-100 rounded-lg text-sm tracking-widest font-mono"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="grid gap-5 sm:grid-cols-2">
                                    <PhotoUpload
                                        label="Recipient Photo (For Delivery)"
                                        photo={recipient.recipientPhoto}
                                        field="recipientPhoto"
                                        inputRef={fileInputRefRecipient}
                                    />
                                    <PhotoUpload
                                        label="Your Photo (For Gift Card)"
                                        photo={recipient.senderPhoto}
                                        field="senderPhoto"
                                        inputRef={fileInputRefSender}
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <Label className="text-xs font-bold text-gray-600 uppercase tracking-wide">Personal Message <span className="text-gray-400 font-normal normal-case">(Optional)</span></Label>
                                    <div className="relative">
                                        <MessageSquare className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                                        <textarea
                                            placeholder="Write a sweet note..."
                                            value={recipient.message || ''}
                                            onChange={(e) => handleFieldChange('message', e.target.value)}
                                            rows={3}
                                            className="w-full border-2 pl-10 pr-4 py-3 bg-white  border-gray-200 rounded-lg focus:border-pink-500 focus:ring-4 focus:ring-pink-50 outline-none text-sm transition-all resize-none"
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                    </div>
                </div>
            </div>

            {/* Navigation Buttons */}
            <div className="flex flex-col-reverse sm:flex-row justify-between gap-4 pt-2">
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
                    disabled={!isComplete()}
                    className="h-11 px-8 bg-[var(--colour-fsP2)] hover:bg-[var(--colour-fsP1)] text-white font-bold rounded-xl shadow-lg shadow-blue-200 transition-all hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 text-sm"
                >
                    Continue
                    <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
            </div>
        </div>
    );
}
