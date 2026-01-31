'use client';

import React, { memo, useEffect } from 'react';
import { X, SlidersHorizontal } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MobileFilterDrawerProps {
    isOpen: boolean;
    onClose: () => void;
    onClear: () => void;
    onApply: () => void;
    children: React.ReactNode;
}

const MobileFilterDrawer = memo(({
    isOpen,
    onClose,
    onClear,
    onApply,
    children,
}: MobileFilterDrawerProps) => {
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => { document.body.style.overflow = ''; };
    }, [isOpen]);

    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && isOpen) onClose();
        };
        document.addEventListener('keydown', handleEscape);
        return () => document.removeEventListener('keydown', handleEscape);
    }, [isOpen, onClose]);

    return (
        <div
            className={cn(
                'fixed inset-0 z-50 lg:hidden transition-all duration-300',
                isOpen ? 'visible' : 'invisible pointer-events-none'
            )}
            role="dialog"
            aria-modal="true"
            aria-label="Filter options"
        >
            {/* Backdrop */}
            <div
                className={cn(
                    'absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity duration-300',
                    isOpen ? 'opacity-100' : 'opacity-0'
                )}
                onClick={onClose}
                aria-hidden="true"
            />

            {/* Drawer */}
            <div
                className={cn(
                    'absolute left-0 top-0 bottom-0 w-[85%] max-w-sm bg-white transform transition-transform duration-300 ease-out flex flex-col',
                    isOpen ? 'translate-x-0' : '-translate-x-full'
                )}
            >
                {/* Header */}
                <div className="bg-white border-b border-gray-100 px-4 py-3.5 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-[var(--colour-fsP2)] flex items-center justify-center">
                            <SlidersHorizontal size={14} className="text-white" />
                        </div>
                        <h2 className="text-base font-bold text-gray-900">Filters</h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
                        aria-label="Close filters"
                    >
                        <X size={16} />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto">
                    {children}
                </div>

                {/* Footer */}
                <div className="bg-white border-t border-gray-100 px-4 py-3 flex gap-2.5 shadow-[0_-2px_12px_rgba(0,0,0,0.04)]">
                    <button
                        onClick={onClear}
                        className="flex-1 py-2.5 border border-gray-200 rounded-lg font-semibold text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                        Clear All
                    </button>
                    <button
                        onClick={onApply}
                        className="flex-1 py-2.5 bg-[var(--colour-fsP2)] text-white rounded-lg font-semibold text-sm hover:opacity-90 transition-all"
                    >
                        Show Results
                    </button>
                </div>
            </div>
        </div>
    );
});

MobileFilterDrawer.displayName = 'MobileFilterDrawer';

export default MobileFilterDrawer;
