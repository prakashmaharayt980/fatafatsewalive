'use client';

import React, { useState, useEffect, memo, useCallback, useMemo } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FilterState } from '../types';
import { FilterOption } from '@/app/types/category';
import {
    FilterSectionProps,
    CheckboxItemProps,
    SearchableListProps,
    PriceRangeSliderProps,
    ToggleSwitchProps,
    ActiveFilterTagProps,
    FilterSidebarProps
} from './interfaces';
import { FilterSidebarSkeleton } from './Skeletons';

// ─── Filter Section ───────────────────────────────────────────────────────────

const FilterSection = memo(({
    title,
    children,
    defaultOpen = true,
    loading = false,
    onClear,
    showClear = false,
}: FilterSectionProps) => {
    const [isOpen, setIsOpen] = useState(defaultOpen);

    return (
        <div className="border-b border-gray-100 last:border-0">
            <div
                className="flex items-center justify-between py-3 cursor-pointer select-none"
                onClick={() => setIsOpen(!isOpen)}
            >
                <div className="flex items-center gap-2">
                    <span className="text-[11px] font-semibold text-[var(--colour-fsP2)] uppercase tracking-widest">
                        {title}
                    </span>
                    {showClear && onClear && (
                        <button
                            onClick={(e) => { e.stopPropagation(); onClear(); }}
                            className="text-[10px] text-gray-400 hover:text-gray-700 transition-colors uppercase tracking-wide cursor-pointer"
                        >
                            Clear
                        </button>
                    )}
                </div>
                <ChevronDown
                    size={14}
                    className={cn(
                        'text-gray-400 transition-transform duration-200',
                        isOpen && 'rotate-180'
                    )}
                />
            </div>

            <div className={cn(
                'overflow-hidden transition-all duration-200 ease-in-out',
                isOpen ? 'max-h-[400px] opacity-100 pb-3' : 'max-h-0 opacity-0'
            )}>
                {loading ? <FilterSidebarSkeleton /> : children}
            </div>
        </div>
    );
});
FilterSection.displayName = 'FilterSection';

// ─── Checkbox Item ────────────────────────────────────────────────────────────

const CheckboxItem = memo(({ option, checked, onChange }: CheckboxItemProps) => (
    <div
        role="button"
        tabIndex={0}
        className="flex items-center justify-between w-full py-1.5 cursor-pointer group rounded-sm hover:bg-gray-50 px-1 -mx-1"
    
    >
        <div className="flex items-center gap-2.5 overflow-hidden">
            <Checkbox
                id={`checkbox-${option.id}`}
                checked={checked}
                onCheckedChange={() => onChange(option.id)}
                className="shrink-0 cursor-pointer"
                onClick={(e) => e.stopPropagation()}
            />
            <Label
                htmlFor={`checkbox-${option.id}`}
                className={cn(
                    'text-[13px] truncate cursor-pointer transition-colors leading-none',
                    checked ? 'text-gray-900 font-medium' : 'text-gray-500 group-hover:text-gray-800'
                )}
            >
                {option.label}
            </Label>
        </div>
        {option.count !== undefined && (
            <span className="text-[11px] text-gray-400 ml-2 shrink-0">{option.count}</span>
        )}
    </div>
));
CheckboxItem.displayName = 'CheckboxItem';

// ─── Searchable List ──────────────────────────────────────────────────────────

const SearchableList = memo(({
    items,
    selectedIds,
    onToggle,
    placeholder = 'Search...',
    emptyMessage = 'No items found',
}: SearchableListProps) => {
    const [searchTerm, setSearchTerm] = useState('');

    const filteredItems = useMemo(() => {
        if (!searchTerm) return items;
        const lower = searchTerm.toLowerCase();
        return items.filter((item) => item.label.toLowerCase().includes(lower));
    }, [items, searchTerm]);

    return (
        <div className="space-y-1">
            {items.length > 5 && (
                <Input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder={placeholder}
                    className="h-8 text-[12px] mb-2"
                />
            )}
            <div className="overflow-y-auto max-h-[200px] space-y-0.5">
                {filteredItems.map((item) => (
                    <CheckboxItem
                        key={item.id}
                        option={{ id: item.id, label: item.label }}
                        checked={selectedIds.includes(item.id)}
                        onChange={onToggle}
                    />
                ))}
                {filteredItems.length === 0 && (
                    <p className="text-[12px] text-gray-400 py-3 text-center">{emptyMessage}</p>
                )}
            </div>
        </div>
    );
});
SearchableList.displayName = 'SearchableList';

// ─── Price Range ──────────────────────────────────────────────────────────────

const PriceRangeSlider = memo(({ min, max, value, onChange }: PriceRangeSliderProps) => {
    const [localMin, setLocalMin] = useState(String(value[0]));
    const [localMax, setLocalMax] = useState(String(value[1]));


    const commitMin = useCallback(() => {
        const parsed = localMin === '' ? 0 : Number(localMin);
        if (!isNaN(parsed) && parsed >= 0) {
            onChange([parsed, value[1]]);
        } else {
            setLocalMin(String(value[0])); // revert invalid
        }
    }, [localMin, value, onChange]);

    const commitMax = useCallback(() => {
        const parsed = localMax === '' ? 0 : Number(localMax);
        if (!isNaN(parsed) && parsed >= 0) {
            onChange([value[0], parsed]);
        } else {
            setLocalMax(String(value[1])); // revert invalid
        }
    }, [localMax, value, onChange]);

    return (
        <div className="space-y-3">
            <div className="flex items-center gap-2">
                <div className="flex-1">
                    <Label className="text-[10px] text-gray-400 uppercase tracking-wide mb-1 block">Min</Label>
                    <div className="relative">
                        <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[11px] text-gray-400 pointer-events-none z-10">
                            Rs.
                        </span>
                        <Input
                            type="number"
                            min={0}
                            value={localMin}
                            onChange={(e) => setLocalMin(e.target.value)}
                            onBlur={commitMin}
                            onKeyDown={(e) => e.key === 'Enter' && commitMin()}
                            className="pl-8 h-8 text-[12px] cursor-text"
                        />
                    </div>
                </div>
                <div className="pt-5 text-gray-300 text-xs select-none">—</div>
                <div className="flex-1">
                    <Label className="text-[10px] text-gray-400 uppercase tracking-wide mb-1 block">Max</Label>
                    <div className="relative">
                        <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[11px] text-gray-400 pointer-events-none z-10">
                            Rs.
                        </span>
                        <Input
                            type="number"
                            min={0}
                            value={localMax}
                            onChange={(e) => setLocalMax(e.target.value)}
                            onBlur={commitMax}
                            onKeyDown={(e) => e.key === 'Enter' && commitMax()}
                            className="pl-8 h-8 text-[12px] cursor-text"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
});
PriceRangeSlider.displayName = 'PriceRangeSlider';

// ─── Toggle Switch ────────────────────────────────────────────────────────────

const ToggleSwitch = memo(({ label, checked, onChange }: ToggleSwitchProps) => (
    <div
        role="button"
        tabIndex={0}
        aria-pressed={checked}
        className="flex items-center justify-between w-full py-2 cursor-pointer group select-none"
        onClick={() => onChange()}
        onKeyDown={(e) => e.key === 'Enter' && onChange()}
    >
        <span className={cn(
            'text-[13px] transition-colors',
            checked ? 'text-gray-900 font-medium' : 'text-gray-500 group-hover:text-gray-800'
        )}>
            {label}
        </span>
        {/* Hand-rolled toggle — guaranteed visible regardless of shadcn CSS loading */}
        <span
            className={cn(
                'relative inline-flex items-center shrink-0 w-9 h-5 rounded-full border-2 border-transparent transition-colors duration-200',
                checked ? 'bg-blue-600' : 'bg-gray-200'
            )}
            style={{ minWidth: '2.25rem' }}
        >
            <span
                className={cn(
                    'inline-block w-4 h-4 rounded-full bg-white shadow transition-transform duration-200',
                    checked ? 'translate-x-4' : 'translate-x-0'
                )}
            />
        </span>
    </div>
));
ToggleSwitch.displayName = 'ToggleSwitch';

// ─── Active Filter Tag ────────────────────────────────────────────────────────

export const ActiveFilterTag = memo(({ label, onRemove }: ActiveFilterTagProps) => (
    <Badge
        variant="secondary"
        className="gap-1 px-2 py-0.5 text-[11px] font-medium"
    >
        {label}
        <button
            onClick={onRemove}
            aria-label={`Remove ${label} filter`}
            className="ml-0.5 text-gray-400 hover:text-gray-700 transition-colors cursor-pointer leading-none"
        >
            ×
        </button>
    </Badge>
));
ActiveFilterTag.displayName = 'ActiveFilterTag';

// ─── Filter Sidebar ───────────────────────────────────────────────────────────

const FilterSidebar = memo(({
    filters,
    onFiltersChange,
    onToggleFilter,
    onClearAll,
    categories,
    brands,
    loadingCategories = false,
    loadingBrands = false,
    className,
}: FilterSidebarProps) => {
    const handlePriceChange = useCallback(
        (priceRange: [number, number]) =>
            onFiltersChange({ ...filters, min_price: priceRange[0], max_price: priceRange[1] }),
        [filters, onFiltersChange]
    );
    const handlePreOrderChange = useCallback(
        () => onFiltersChange({ ...filters, pre_order: !filters.pre_order }),
        [filters, onFiltersChange]
    );
    const handleExchangeChange = useCallback(
        () => onFiltersChange({ ...filters, exchange_available: !filters.exchange_available }),
        [filters, onFiltersChange]
    );
    const handleEmiOnlyChange = useCallback(
        () => onFiltersChange({ ...filters, emi_enabled: !filters.emi_enabled }),
        [filters, onFiltersChange]
    );
    const handleCategoryToggle = useCallback(
        (id: string | number) => onToggleFilter('category', id),
        [onToggleFilter]
    );
    const handleBrandToggle = useCallback(
        (id: string | number) => onToggleFilter('brand', id),
        [onToggleFilter]
    );

    const categoryItems = useMemo(
        () => categories?.map(cat => ({ id: cat.slug, label: cat.title })) || [],
        [categories]
    );
    const brandItems = useMemo(
        () => brands?.map(brand => ({ id: brand.slug, label: brand.name })) || [],
        [brands]
    );

    const hasActiveFilters =
        filters.category.length > 0 ||
        (filters.brand?.length ?? 0) > 0 ||
        filters.pre_order ||
        filters.emi_enabled ||
        filters.exchange_available;

    return (
        <div className={cn('bg-white w-full rounded-lg border border-gray-100 overflow-hidden', className)}>
            {/* Header */}
            <div className="px-4 py-3 flex items-center justify-between border-b border-gray-100">
                <span className="text-[11px] font-semibold text-[var(--colour-fsP2)] uppercase tracking-widest">
                    Filters
                </span>
                {hasActiveFilters && (
                    <button
                        onClick={onClearAll}
                        className="text-[11px] text-gray-400 hover:text-gray-700 transition-colors uppercase tracking-wide cursor-pointer"
                    >
                        Clear all
                    </button>
                )}
            </div>

            <div className="px-4">
                {/* Toggles */}
                <div className="py-1 border-b border-gray-100">
                    <ToggleSwitch label="Pre Order" checked={filters.pre_order} onChange={handlePreOrderChange} />
                    <ToggleSwitch label="EMI Available" checked={filters.emi_enabled} onChange={handleEmiOnlyChange} />
                    <ToggleSwitch label="Exchange Available" checked={filters.exchange_available} onChange={handleExchangeChange} />
                </div>

                {/* Categories */}
                <FilterSection
                    title="Category"
                    loading={loadingCategories}
                    showClear={filters.category.length > 0}
                    onClear={() => onFiltersChange({ ...filters, category: [] })}
                >
                    <SearchableList
                        items={categoryItems}
                        selectedIds={filters.category}
                        onToggle={handleCategoryToggle}
                        placeholder="Search categories..."
                        emptyMessage="No categories"
                    />
                </FilterSection>

                {/* Brands */}
                <FilterSection
                    title="Brand"
                    loading={loadingBrands}
                    showClear={(filters.brand?.length ?? 0) > 0}
                    onClear={() => onFiltersChange({ ...filters, brand: [] })}
                >
                    <SearchableList
                        items={brandItems}
                        selectedIds={filters.brand ?? []}
                        onToggle={handleBrandToggle}
                        placeholder="Search brands..."
                        emptyMessage="No brands"
                    />
                </FilterSection>

                {/* Price Range */}
                <FilterSection title="Price Range">
                    <PriceRangeSlider
                        min={0}
                        max={100000}
                        value={[filters.min_price, filters.max_price]}
                        onChange={handlePriceChange}
                    />
                </FilterSection>
            </div>
        </div>
    );
});

FilterSidebar.displayName = 'FilterSidebar';

export default FilterSidebar;