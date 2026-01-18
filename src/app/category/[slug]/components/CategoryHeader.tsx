'use client';

import React, { useState, memo, useCallback, useMemo } from 'react';
import {
    ChevronDown,
    Check,
    SlidersHorizontal,
    Grid3X3,
    LayoutGrid,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { FilterState, SORT_OPTIONS, ViewMode } from '../types';

// ============================================
// SORT DROPDOWN
// ============================================
interface SortDropdownProps {
    value: FilterState['sortBy'];
    onChange: (value: FilterState['sortBy']) => void;
}

const SortDropdown = memo(({ value, onChange }: SortDropdownProps) => {
    const [isOpen, setIsOpen] = useState(false);

    const selectedLabel = useMemo(
        () => SORT_OPTIONS.find((o) => o.id === value)?.label || 'Sort',
        [value]
    );

    const handleSelect = useCallback(
        (sortValue: FilterState['sortBy']) => {
            onChange(sortValue);
            setIsOpen(false);
        },
        [onChange]
    );

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 rounded-xl font-medium text-sm min-w-[180px] justify-between hover:border-orange-300 transition-colors"
                aria-expanded={isOpen}
                aria-haspopup="listbox"
            >
                <span className="truncate">{selectedLabel}</span>
                <ChevronDown
                    size={16}
                    className={cn(
                        'transition-transform duration-200',
                        isOpen && 'rotate-180'
                    )}
                />
            </button>

            {isOpen && (
                <>
                    <div
                        className="fixed inset-0 z-10"
                        onClick={() => setIsOpen(false)}
                        aria-hidden="true"
                    />
                    <ul
                        className="absolute right-0 top-full mt-2 bg-white border border-gray-200 rounded-xl shadow-xl py-2 min-w-[200px] z-20 overflow-hidden"
                        role="listbox"
                    >
                        {SORT_OPTIONS.map((opt) => (
                            <li key={opt.id}>
                                <button
                                    onClick={() => handleSelect(opt.id as FilterState['sortBy'])}
                                    className={cn(
                                        'w-full text-left px-4 py-2.5 text-sm flex items-center justify-between transition-colors',
                                        value === opt.id
                                            ? 'bg-orange-50 text-orange-600 font-medium'
                                            : 'hover:bg-gray-50 text-gray-700'
                                    )}
                                    role="option"
                                    aria-selected={value === opt.id}
                                >
                                    {opt.label}
                                    {value === opt.id && (
                                        <Check size={16} className="text-orange-500" />
                                    )}
                                </button>
                            </li>
                        ))}
                    </ul>
                </>
            )}
        </div>
    );
});
SortDropdown.displayName = 'SortDropdown';

// ============================================
// VIEW MODE TOGGLE
// ============================================
interface ViewModeToggleProps {
    value: ViewMode;
    onChange: (mode: ViewMode) => void;
}

const ViewModeToggle = memo(({ value, onChange }: ViewModeToggleProps) => (
    <div className="hidden sm:flex items-center bg-white border border-gray-200 rounded-xl p-1">
        <button
            onClick={() => onChange('grid')}
            className={cn(
                'p-2 rounded-lg transition-all',
                value === 'grid'
                    ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-md'
                    : 'text-gray-500 hover:text-gray-700'
            )}
            aria-label="Grid view"
            aria-pressed={value === 'grid'}
        >
            <LayoutGrid size={18} />
        </button>
        <button
            onClick={() => onChange('compact')}
            className={cn(
                'p-2 rounded-lg transition-all',
                value === 'compact'
                    ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-md'
                    : 'text-gray-500 hover:text-gray-700'
            )}
            aria-label="Compact view"
            aria-pressed={value === 'compact'}
        >
            <Grid3X3 size={18} />
        </button>
    </div>
));
ViewModeToggle.displayName = 'ViewModeToggle';

// ============================================
// MOBILE FILTER BUTTON
// ============================================
interface MobileFilterButtonProps {
    onClick: () => void;
    activeCount?: number;
}

const MobileFilterButton = memo(({ onClick, activeCount = 0 }: MobileFilterButtonProps) => (
    <button
        onClick={onClick}
        className="lg:hidden flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 rounded-xl font-medium text-sm hover:border-orange-300 transition-colors"
    >
        <SlidersHorizontal size={18} />
        <span>Filters</span>
        {activeCount > 0 && (
            <span className="bg-gradient-to-r from-orange-500 to-amber-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                {activeCount}
            </span>
        )}
    </button>
));
MobileFilterButton.displayName = 'MobileFilterButton';

// ============================================
// MAIN CATEGORY HEADER
// ============================================
interface CategoryHeaderProps {
    title: string;
    totalProducts: number;
    sortBy: FilterState['sortBy'];
    viewMode: ViewMode;
    activeFilterCount: number;
    onSortChange: (sortBy: FilterState['sortBy']) => void;
    onViewModeChange: (mode: ViewMode) => void;
    onMobileFilterClick: () => void;
}

const CategoryHeader = memo(({
    title,
    totalProducts,
    sortBy,
    viewMode,
    activeFilterCount,
    onSortChange,
    onViewModeChange,
    onMobileFilterClick,
}: CategoryHeaderProps) => (
    <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">{title}</h1>
            <span className="text-gray-500 bg-gray-100 px-3 py-1 rounded-full text-sm">
                {totalProducts.toLocaleString()} Products
            </span>
        </div>

        <div className="flex items-center gap-3">
            <MobileFilterButton
                onClick={onMobileFilterClick}
                activeCount={activeFilterCount}
            />
            <ViewModeToggle value={viewMode} onChange={onViewModeChange} />
            <SortDropdown value={sortBy} onChange={onSortChange} />
        </div>
    </header>
));

CategoryHeader.displayName = 'CategoryHeader';

export default CategoryHeader;
export { SortDropdown, ViewModeToggle, MobileFilterButton };