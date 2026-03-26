'use client';

import React, { useState, useRef, useEffect, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { Calendar, AlertCircle } from 'lucide-react';
import NepaliDate from 'nepali-date-converter';
import 'nepali-datepicker-reactjs/dist/index.css';

// Dynamically import the Nepali picker to prevent SSR issues
const ReactNepaliDatePicker = dynamic(
    () => import('nepali-datepicker-reactjs').then((mod) => mod.NepaliDatePicker),
    {
        ssr: false,
        loading: () => <div className="h-10 w-full animate-pulse bg-gray-100 rounded-lg border border-gray-200"></div>
    }
);

interface CustomDatePickerProps {
    label?: string;
    name: string;
    value?: string; // Format: "YYYY-MM-DD"
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
    error?: string;
    className?: string;
    placeholder?: string;
    mode?: 'BS' | 'AD';
    disabled?: boolean;
}

/** Get today's BS date in YYYY-MM-DD format */
function getTodayBS() {
    const nd = new NepaliDate();
    const y = nd.getYear();
    const m = String(nd.getMonth() + 1).padStart(2, '0');
    const d = String(nd.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
}

export default function CustomDatePicker({
    label,
    name,
    value,
    onChange,
    error,
    className = '',
    placeholder,
    mode = 'BS',
    disabled = false
}: CustomDatePickerProps) {
    const [isFocused, setIsFocused] = useState(false);

    // Default placeholder based on mode
    const activePlaceholder = placeholder || (mode === 'BS' ? "YYYY-MM-DD (BS)" : "YYYY-MM-DD (AD)");

    const handleDateChange = (rawDate: string) => {
        // Ensure consistent hyphen format
        const normalizedDate = rawDate.replace(/\//g, '-');
        const syntheticEvent = {
            target: { name, value: normalizedDate }
        } as React.ChangeEvent<HTMLInputElement>;
        onChange(syntheticEvent);
    };

    return (
        <div className={`w-full group ${className}`}>
            {/* Label - Consistent with FormField */}
            {label && (
                <label className="text-xs font-semibold text-gray-600 uppercase tracking-wider block mb-1">
                    {label}
                </label>
            )}

            <div className="relative group border-none">
                {/* Icon Wrapper - Matching FormField exactly */}
                <div className={`absolute left-0 top-0 bottom-0 w-10 flex items-center justify-center text-gray-400 transition-colors z-[25] pointer-events-none ${error ? 'text-red-400' : 'group-focus-within:text-[var(--colour-fsP2)]'}`}>
                    <Calendar className="w-5 h-5" />
                </div>

                {mode === 'BS' ? (
                    <ReactNepaliDatePicker
                        value={value || ''}
                        onChange={handleDateChange}
                        options={{ calenderLocale: 'en', valueLocale: 'en' }}
                        inputClassName={`w-full h-10 pl-10 pr-4 text-gray-700 text-sm rounded-lg border bg-white transition-all duration-150 ${error ? 'border-red-400 ring-1 ring-red-200 bg-red-50/30' : 'border-gray-200 focus:border-[var(--colour-fsP2)] focus:ring-1 focus:ring-[var(--colour-fsP2)]'} ${disabled ? 'opacity-60 cursor-not-allowed bg-gray-50' : 'cursor-pointer'}`}
                    />
                ) : (
                    <input
                        type="date"
                        name={name}
                        value={value || ''}
                        onChange={onChange}
                        disabled={disabled}
                        className={`w-full h-10 pl-10 pr-4 text-gray-700 text-sm rounded-lg border bg-white transition-all duration-150 ${error ? 'border-red-400 ring-1 ring-red-200 bg-red-50/30' : 'border-gray-200 focus:border-[var(--colour-fsP2)] focus:ring-1 focus:ring-[var(--colour-fsP2)]'} ${disabled ? 'opacity-60 cursor-not-allowed bg-gray-50' : ''}`}
                    />
                )}
            </div>

            {/* Error Message */}
            <div className="h-4 mt-0.5 ml-1">
                {error && <p className="text-red-500 text-[11px] leading-tight font-medium">{error}</p>}
            </div>


        </div>
    );
}