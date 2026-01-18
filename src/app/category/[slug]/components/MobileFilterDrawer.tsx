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
    // Prevent body scroll when drawer is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }

        return () => {
            document.body.style.overflow = '';
        };
    }, [isOpen]);

    // Handle escape key
    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && isOpen) {
                onClose();
            }
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
                    'absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-300',
                    isOpen ? 'opacity-100' : 'opacity-0'
                )}
                onClick={onClose}
                aria-hidden="true"
            />

            {/* Drawer */}
            <div
                className={cn(
                    'absolute left-0 top-0 bottom-0 w-[85%] max-w-md bg-white transform transition-transform duration-300 ease-out flex flex-col shadow-2xl',
                    isOpen ? 'translate-x-0' : '-translate-x-full'
                )}
            >
                {/* Header */}
                <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between z-10">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center shadow-lg shadow-orange-200">
                            <SlidersHorizontal size={18} className="text-white" />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-gray-900">Filters</h2>
                            <p className="text-xs text-gray-400">Refine your search</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
                        aria-label="Close filters"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto">
                    {children}
                </div>

                {/* Footer */}
                <div className="sticky bottom-0 bg-white border-t border-gray-100 px-6 py-4 flex gap-3 shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
                    <button
                        onClick={onClear}
                        className="flex-1 py-3.5 border-2 border-gray-200 rounded-xl font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                        Clear All
                    </button>
                    <button
                        onClick={onApply}
                        className="flex-1 py-3.5 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-xl font-semibold hover:from-orange-600 hover:to-amber-600 transition-all shadow-lg shadow-orange-200"
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