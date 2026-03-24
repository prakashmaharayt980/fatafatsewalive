
'use client';

import React, { useState, memo, useCallback, useMemo } from 'react';
import {
    ChevronDown,
    Check,
    SlidersHorizontal,
    Grid3X3,
    LayoutGrid,
    LayoutList,
    List,
    Search,
    ChevronRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { FilterState, ViewMode } from '../types';
import { SORT_OPTIONS } from '../types';

import type { SortDropdownProps, CategoryHeaderProps, ViewModeToggleProps } from './interfaces';

const SortDropdown = memo(({ value, onChange }: SortDropdownProps) => {
    const [isOpen, setIsOpen] = useState(false);

    const selectedLabel = useMemo(
        () => SORT_OPTIONS.find((o) => o.id === value)?.label || 'Sort',
        [value]
    );

    const handleSelect = useCallback(
        (sortValue: FilterState['sort']) => {
            onChange(sortValue);
            setIsOpen(false);
        },
        [onChange]
    );

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 rounded-xl font-medium text-sm min-w-[180px] justify-between hover:border-(--colour-fsP2) transition-colors"
                aria-expanded={isOpen}
                aria-haspopup="listbox"
            >
                <span className="truncate">{selectedLabel}</span>
                <ChevronDown
                    size={16}
                    className={cn('transition-transform duration-200', isOpen && 'rotate-180')}
                />
            </button>

            {isOpen && (
                <>
                    <div
                        className="fixed inset-0 z-40"
                        onClick={() => setIsOpen(false)}
                        aria-hidden="true"
                    />
                    <ul
                        className="absolute right-0 top-full mt-2 bg-white border border-gray-200 rounded-xl shadow-xl py-2 min-w-[200px] z-50 overflow-hidden"
                        role="listbox"
                    >
                        {SORT_OPTIONS.map((opt) => (
                            <li key={opt.id}>
                                <button
                                    onClick={() => handleSelect(opt.id as FilterState['sort'])}
                                    className={cn(
                                        'w-full text-left px-4 py-2.5 text-sm flex items-center justify-between transition-colors',
                                        value === opt.id
                                            ? 'bg-(--colour-fsP2)/10 text-(--colour-fsP2) font-medium'
                                            : 'hover:bg-gray-50 text-gray-700'
                                    )}
                                    role="option"
                                    aria-selected={value === opt.id}
                                >
                                    {opt.label}
                                    {value === opt.id && <Check size={16} className="text-(--colour-fsP2)" />}
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






const VIEW_MODES: { mode: ViewMode; icon: React.ElementType; label: string }[] = [
    { mode: 'grid5', icon: Grid3X3, label: '5 Columns view' },
    { mode: 'grid4', icon: LayoutGrid, label: '4 Columns view' },
    { mode: 'list', icon: LayoutList, label: 'List view' },
];

const ViewModeToggle = memo(({ value, onChange }: ViewModeToggleProps) => (
    <div className="hidden sm:flex items-center bg-white border border-gray-200 rounded-xl p-1">
        {VIEW_MODES.map(({ mode, icon: Icon, label }) => (
            <button
                key={mode}
                onClick={() => onChange(mode)}
                className={cn(
                    'p-2 rounded-lg transition-all',
                    value === mode
                        ? 'bg-(--colour-fsP2) text-white shadow-md'
                        : 'text-gray-500 hover:text-gray-700'
                )}
                aria-label={label}
                aria-pressed={value === mode}
            >
                <Icon size={18} />
            </button>
        ))}
    </div>
));
ViewModeToggle.displayName = 'ViewModeToggle';


const CategoryHeader = memo(({
    title,
    totalProducts,
    sortBy,
    activeFilterCount,
    onSortChange,
    onMobileFilterClick,
    viewMode,
    onViewModeChange,
}: CategoryHeaderProps) => (
    <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 mb-6">
        <div className="flex flex-wrap items-center justify-between gap-3 sm:gap-4">
            <h1 className="text-xl lg:text-3xl font-extrabold text-gray-900 tracking-tight">{title}</h1>
            <div className='flex flex-row gap-1 items-center'>
                <span className="text-(--colour-fsP2) flex flex-row items-center gap-2 border border-(--colour-fsP2) p-1 rounded-sm text-sm font-semibold">
                 Products &nbsp;
                    {totalProducts.toLocaleString()}
                </span>
                <button
                    onClick={onMobileFilterClick}
                    className="sm:hidden flex items-center justify-center w-10 h-10 rounded-lg hover:bg-gray-100 transition-colors"
                    aria-label="Open filters"
                >
                    <SlidersHorizontal size={20} className="text-(--colour-fsP2)" />
                </button>
            </div>
        </div>

        <div className="hidden sm:flex items-center gap-2 sm:gap-3">
            <ViewModeToggle value={viewMode} onChange={onViewModeChange} />
            <SortDropdown value={sortBy} onChange={onSortChange} />
        </div>
    </header>
));

CategoryHeader.displayName = 'CategoryHeader';

export default CategoryHeader;
export { SortDropdown };
