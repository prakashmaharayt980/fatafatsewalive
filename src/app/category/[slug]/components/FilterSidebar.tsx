'use client';

import React, { useState, memo, useCallback, useMemo, useRef, useEffect } from 'react';
import {
    ChevronDown,
    X,
    SlidersHorizontal,
    Check,
    Palette,
    DollarSign,
    Search,
    Layers,
    Store,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
    FilterState,
    FilterOption,
    CategoryData,
    BrandData,
    COLORS,
} from '../types';

// ============================================
// FILTER SECTION — minimal accordion
// ============================================
interface FilterSectionProps {
    title: string;
    icon?: React.ElementType;
    children: React.ReactNode;
    defaultOpen?: boolean;
    loading?: boolean;
    onClear?: () => void;
    showClear?: boolean;
}

const FilterSection = memo(({
    title,
    icon: Icon,
    children,
    defaultOpen = true,
    loading = false,
    onClear,
    showClear = false,
}: FilterSectionProps) => {
    const [isOpen, setIsOpen] = useState(defaultOpen);

    return (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-3 mb-3 relative group/filter overflow-hidden">
            {/* Soft left accent on hover */}
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-[var(--colour-fsP2)] to-[var(--colour-fsP1)] opacity-0 group-hover/filter:opacity-100 transition-opacity duration-300" />
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center justify-between w-full py-1.5 text-left group/sec cursor-pointer"
                aria-expanded={isOpen}
            >
                <div className="flex items-center gap-2.5">
                    {Icon && (
                        <div className="w-7 h-7 rounded-lg bg-gray-50 flex items-center justify-center group-hover/sec:bg-blue-50 transition-colors">
                            <Icon
                                size={14}
                                className={cn(
                                    'transition-colors',
                                    isOpen ? 'text-[var(--colour-fsP2)]' : 'text-gray-500 group-hover/sec:text-[var(--colour-fsP2)]'
                                )}
                            />
                        </div>
                    )}
                    <span className="font-bold text-[13.5px] text-gray-800 tracking-tight">
                        {title}
                    </span>
                    {showClear && onClear && (
                        <button
                            onClick={(e) => { e.stopPropagation(); onClear(); }}
                            className="text-[10px] font-bold text-[var(--colour-fsP2)] hover:text-red-500 ml-1.5 transition-colors cursor-pointer bg-blue-50 hover:bg-red-50 px-1.5 py-0.5 rounded"
                        >
                            CLEAR
                        </button>
                    )}
                </div>
                <ChevronDown
                    size={15}
                    className={cn(
                        'text-gray-400 transition-transform duration-300',
                        isOpen && 'rotate-180 text-[var(--colour-fsP2)]'
                    )}
                />
            </button>

            <div
                className={cn(
                    'overflow-hidden transition-all duration-300 ease-in-out',
                    isOpen ? 'max-h-[500px] opacity-100 mt-3 pb-1' : 'max-h-0 opacity-0'
                )}
            >
                {loading ? (
                    <div className="space-y-2.5">
                        {[...Array(4)].map((_, i) => (
                            <div key={i} className="h-7 bg-gray-50 rounded-md animate-pulse" />
                        ))}
                    </div>
                ) : (
                    children
                )}
            </div>
        </div>
    );
});
FilterSection.displayName = 'FilterSection';

// ============================================
// CHECKBOX ITEM — compact pill style
// ============================================
interface CheckboxItemProps {
    option: FilterOption;
    checked: boolean;
    onChange: (id: string | number) => void;
}

const CheckboxItem = memo(({ option, checked, onChange }: CheckboxItemProps) => (
    <button
        onClick={() => onChange(option.id)}
        className={cn(
            'flex items-center gap-2.5 w-full py-2 px-2.5 rounded-lg text-left transition-all duration-200 cursor-pointer',
            checked
                ? 'bg-[var(--colour-fsP2)] text-white shadow-sm'
                : 'hover:bg-gray-50 text-gray-600'
        )}
    >
        <div
            className={cn(
                'w-4 h-4 rounded-[4px] border flex items-center justify-center flex-shrink-0 transition-all duration-200',
                checked
                    ? 'bg-white border-transparent'
                    : 'border-gray-300 bg-white'
            )}
        >
            {checked && <Check size={12} className="text-[var(--colour-fsP2)]" strokeWidth={3.5} />}
        </div>
        <span className={cn(
            'flex-1 text-[13px] truncate',
            checked ? 'font-semibold' : 'font-medium'
        )}>
            {option.label}
        </span>
        {option.count !== undefined && (
            <span className={cn("text-[11px] tabular-nums font-medium", checked ? 'text-blue-100' : 'text-gray-400')}>
                {option.count}
            </span>
        )}
    </button>
));
CheckboxItem.displayName = 'CheckboxItem';

// ============================================
// SEARCHABLE LIST
// ============================================
interface SearchableListProps {
    items: Array<{ id: string | number; label: string }>;
    selectedIds: Array<string | number>;
    onToggle: (id: string | number) => void;
    placeholder?: string;
    emptyMessage?: string;
}

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
        <div>
            <div className="relative mb-3">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                    type="text"
                    placeholder={placeholder}
                    className="w-full pl-8 pr-3 py-2 text-[13px] border border-gray-200 rounded-lg bg-gray-50 focus:outline-none focus:border-[var(--colour-fsP2)] focus:ring-1 focus:ring-[var(--colour-fsP2)] focus:bg-white transition-all"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
            <div className="overflow-y-auto space-y-0.5">
                {filteredItems.map((item) => (
                    <CheckboxItem
                        key={item.id}
                        option={{ id: item.id, label: item.label }}
                        checked={selectedIds.includes(item.id)}
                        onChange={onToggle}
                    />
                ))}
                {filteredItems.length === 0 && (
                    <p className="text-xs text-gray-400 py-3 text-center">{emptyMessage}</p>
                )}
            </div>
        </div>
    );
});
SearchableList.displayName = 'SearchableList';

// ============================================
// COLOR SWATCH GRID — cleaner circles
// ============================================
interface ColorSwatchGridProps {
    colors: FilterOption[];
    selected: string[];
    onChange: (id: string | number) => void;
}

const ColorSwatchGrid = memo(({ colors, selected, onChange }: ColorSwatchGridProps) => (
    <div className="flex flex-wrap gap-2">
        {colors.map((color) => {
            const isSelected = selected.includes(color.id as string);
            return (
                <button
                    key={color.id}
                    onClick={() => onChange(color.id)}
                    className="group/color relative cursor-pointer"
                    title={color.label}
                    aria-pressed={isSelected}
                >
                    <div
                        className={cn(
                            'w-7 h-7 rounded-full border-2 flex items-center justify-center transition-all duration-150',
                            isSelected
                                ? 'border-[var(--colour-fsP2)] scale-110 shadow-sm'
                                : 'border-gray-200 hover:border-gray-300 hover:scale-105',
                            color.color === '#fafafa' && 'border-gray-300'
                        )}
                        style={{ backgroundColor: color.color }}
                    >
                        {isSelected && (
                            <Check
                                size={12}
                                className="text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.5)]"
                                strokeWidth={3}
                            />
                        )}
                    </div>
                </button>
            );
        })}
    </div>
));
ColorSwatchGrid.displayName = 'ColorSwatchGrid';

// ============================================
// PRICE RANGE SLIDER — redesigned with dual thumbs
// ============================================
interface PriceRangeSliderProps {
    min: number;
    max: number;
    value: [number, number];
    onChange: (v: [number, number]) => void;
}

const PriceRangeSlider = memo(({ min, max, value, onChange }: PriceRangeSliderProps) => {
    const [localValue, setLocalValue] = useState(value);
    const trackRef = useRef<HTMLDivElement>(null);

    const minPct = ((localValue[0] - min) / (max - min)) * 100;
    const maxPct = ((localValue[1] - min) / (max - min)) * 100;

    const handleMin = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const v = Math.min(Number(e.target.value), localValue[1] - 500);
        setLocalValue([v, localValue[1]]);
    }, [localValue]);

    const handleMax = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const v = Math.max(Number(e.target.value), localValue[0] + 500);
        setLocalValue([localValue[0], v]);
    }, [localValue]);

    const commit = useCallback(() => {
        onChange(localValue);
    }, [localValue, onChange]);

    return (
        <div className="space-y-4 pt-1">
            {/* Inputs row first */}
            <div className="flex items-center gap-2">
                <div className="flex-1 relative">
                    <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 text-[11px]">Rs.</span>
                    <input
                        type="number"
                        value={localValue[0]}
                        onChange={handleMin}
                        onBlur={commit}
                        className="w-full pl-7 pr-2 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs font-medium focus:outline-none focus:border-[var(--colour-fsP2)] transition-all text-center"
                    />
                </div>
                <span className="text-gray-300 text-xs">—</span>
                <div className="flex-1 relative">
                    <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 text-[11px]">Rs.</span>
                    <input
                        type="number"
                        value={localValue[1]}
                        onChange={handleMax}
                        onBlur={commit}
                        className="w-full pl-7 pr-2 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs font-medium focus:outline-none focus:border-[var(--colour-fsP2)] transition-all text-center"
                    />
                </div>
            </div>

            {/* Track */}
            <div ref={trackRef} className="relative h-1.5 mx-1">
                {/* Background track */}
                <div className="absolute inset-0 bg-gray-200 rounded-full" />
                {/* Active range */}
                <div
                    className="absolute h-full bg-[var(--colour-fsP2)] rounded-full"
                    style={{ left: `${minPct}%`, right: `${100 - maxPct}%` }}
                />
                {/* Range inputs (invisible, on top) */}
                <input
                    type="range"
                    min={min}
                    max={max}
                    step={100}
                    value={localValue[0]}
                    onChange={handleMin}
                    onMouseUp={commit}
                    onTouchEnd={commit}
                    className="absolute inset-0 w-full opacity-0 cursor-pointer z-20"
                />
                <input
                    type="range"
                    min={min}
                    max={max}
                    step={100}
                    value={localValue[1]}
                    onChange={handleMax}
                    onMouseUp={commit}
                    onTouchEnd={commit}
                    className="absolute inset-0 w-full opacity-0 cursor-pointer z-20"
                />
                {/* Thumb indicators */}
                <div
                    className="absolute w-4 h-4 rounded-full bg-white border-2 border-[var(--colour-fsP2)] shadow-sm -translate-y-1/2 top-1/2 -translate-x-1/2 pointer-events-none z-10"
                    style={{ left: `${minPct}%` }}
                />
                <div
                    className="absolute w-4 h-4 rounded-full bg-white border-2 border-[var(--colour-fsP2)] shadow-sm -translate-y-1/2 top-1/2 -translate-x-1/2 pointer-events-none z-10"
                    style={{ left: `${maxPct}%` }}
                />
            </div>
        </div>
    );
});
PriceRangeSlider.displayName = 'PriceRangeSlider';

// ============================================
// TOGGLE SWITCH — compact
// ============================================
interface ToggleSwitchProps {
    label: string;
    checked: boolean;
    onChange: () => void;
}

const ToggleSwitch = memo(({ label, checked, onChange }: ToggleSwitchProps) => (
    <button
        onClick={onChange}
        className={cn(
            'flex items-center justify-between w-full py-2.5 px-3 rounded-xl border transition-all duration-200 cursor-pointer group hover:shadow-sm',
            checked ? 'bg-white border-[var(--colour-fsP2)] shadow-[0_0_10px_rgba(26,86,219,0.1)]' : 'bg-white border-gray-100 hover:border-gray-300'
        )}
    >
        <span className={cn(
            'text-[13px] font-bold tracking-tight',
            checked ? 'text-[var(--colour-fsP2)]' : 'text-gray-600 group-hover:text-gray-900'
        )}>
            {label}
        </span>
        <div className="relative">
            <div className={cn(
                'w-10 h-6 rounded-full transition-colors duration-300',
                checked ? 'bg-[var(--colour-fsP2)]' : 'bg-gray-200 group-hover:bg-gray-300'
            )}>
                <div className={cn(
                    'absolute w-[18px] h-[18px] bg-white rounded-full shadow-md top-[3px] transition-all duration-300',
                    checked ? 'left-[19px]' : 'left-[3px]'
                )} />
            </div>
        </div>
    </button>
));
ToggleSwitch.displayName = 'ToggleSwitch';

// ============================================
// ACTIVE FILTER TAG
// ============================================
interface ActiveFilterTagProps {
    label: string;
    onRemove: () => void;
}

export const ActiveFilterTag = memo(({ label, onRemove }: ActiveFilterTagProps) => (
    <span className="inline-flex items-center gap-1 bg-[var(--colour-fsP2)]/8 text-[var(--colour-fsP2)] px-2 py-0.5 rounded-md text-xs font-medium">
        {label}
        <button
            onClick={onRemove}
            className="p-0.5 rounded hover:bg-[var(--colour-fsP2)]/15 transition-colors cursor-pointer"
            aria-label={`Remove ${label} filter`}
        >
            <X size={11} />
        </button>
    </span>
));
ActiveFilterTag.displayName = 'ActiveFilterTag';

// ============================================
// MAIN FILTER SIDEBAR
// ============================================
interface FilterSidebarProps {
    filters: FilterState;
    onFiltersChange: (filters: FilterState) => void;
    onToggleFilter: (key: 'categories' | 'brands' | 'colors' | 'sizes', value: string | number) => void;
    onClearAll: () => void;
    categories: CategoryData[];
    brands: BrandData[];
    loadingCategories?: boolean;
    loadingBrands?: boolean;
    activeFilterCount?: number;
    className?: string;
}

const FilterSidebar = memo(({
    filters,
    onFiltersChange,
    onToggleFilter,
    onClearAll,
    categories,
    brands,
    loadingCategories = false,
    loadingBrands = false,
    activeFilterCount = 0,
    className,
}: FilterSidebarProps) => {
    const handlePriceChange = useCallback(
        (priceRange: [number, number]) => {
            onFiltersChange({ ...filters, priceRange });
        },
        [filters, onFiltersChange]
    );

    const handleInStockChange = useCallback(() => {
        onFiltersChange({ ...filters, inStock: !filters.inStock });
    }, [filters, onFiltersChange]);

    const handleOnSaleChange = useCallback(() => {
        onFiltersChange({ ...filters, onSale: !filters.onSale });
    }, [filters, onFiltersChange]);

    const handleEmiOnlyChange = useCallback(() => {
        onFiltersChange({ ...filters, emiOnly: !filters.emiOnly });
    }, [filters, onFiltersChange]);

    const handleCategoryToggle = useCallback(
        (id: string | number) => { onToggleFilter('categories', id); },
        [onToggleFilter]
    );

    const handleBrandToggle = useCallback(
        (id: string | number) => { onToggleFilter('brands', id); },
        [onToggleFilter]
    );

    const categoryItems = useMemo(
        () => categories.map(cat => ({ id: cat.id, label: cat.title })),
        [categories]
    );

    const brandItems = useMemo(
        () => brands.map(brand => ({ id: brand.id, label: brand.name })),
        [brands]
    );

    return (
        <div className={cn(
            'relative rounded-2xl overflow-hidden',
            className
        )}>
            {/* Header */}
            <div className="px-1 py-1 mb-2 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <SlidersHorizontal size={15} className="text-gray-700" />
                    <h2 className="text-sm font-bold text-gray-900">Filters</h2>
                    {activeFilterCount > 0 && (
                        <span className="text-[10px] font-bold bg-[var(--colour-fsP2)] text-white w-4.5 h-4.5 min-w-[18px] min-h-[18px] rounded-full flex items-center justify-center">
                            {activeFilterCount}
                        </span>
                    )}
                </div>
                {activeFilterCount > 0 && (
                    <button
                        onClick={onClearAll}
                        className="text-[11px] font-medium text-[var(--colour-fsP2)] hover:underline transition-all cursor-pointer"
                    >
                        Reset
                    </button>
                )}
            </div>

            {/* Content */}
            <div className="py-1">
                {/* Quick Toggles */}
                <div className="py-2 mb-4 space-y-2">
                    <ToggleSwitch
                        label="In Stock Only"
                        checked={filters.inStock}
                        onChange={handleInStockChange}
                    />
                    <ToggleSwitch
                        label="On Sale"
                        checked={filters.onSale}
                        onChange={handleOnSaleChange}
                    />
                    <ToggleSwitch
                        label="EMI Available"
                        checked={filters.emiOnly}
                        onChange={handleEmiOnlyChange}
                    />
                </div>

                {/* Categories */}
                <FilterSection
                    title="Categories"
                    icon={Layers}
                    loading={loadingCategories}
                    onClear={() => onFiltersChange({ ...filters, categories: [] })}
                    showClear={filters.categories.length > 0}
                >
                    <SearchableList
                        items={categoryItems}
                        selectedIds={filters.categories}
                        onToggle={handleCategoryToggle}
                        placeholder="Search categories..."
                        emptyMessage="No categories"
                    />
                </FilterSection>

                {/* Price Range */}
                <FilterSection title="Price Range" icon={DollarSign}>
                    <PriceRangeSlider
                        min={0}
                        max={100000}
                        value={filters.priceRange}
                        onChange={handlePriceChange}
                    />
                </FilterSection>

                {/* Brands */}
                <FilterSection
                    title="Brands"
                    icon={Store}
                    loading={loadingBrands}
                    onClear={() => onFiltersChange({ ...filters, brands: [] })}
                    showClear={filters.brands.length > 0}
                >
                    <SearchableList
                        items={brandItems}
                        selectedIds={filters.brands}
                        onToggle={handleBrandToggle}
                        placeholder="Search brands..."
                        emptyMessage="No brands"
                    />
                </FilterSection>

                {/* Colors */}
                <FilterSection
                    title="Colors"
                    icon={Palette}
                    defaultOpen={true}
                    onClear={() => onFiltersChange({ ...filters, colors: [] })}
                    showClear={filters.colors.length > 0}
                >
                    <ColorSwatchGrid
                        colors={COLORS}
                        selected={filters.colors}
                        onChange={(id) => onToggleFilter('colors', id)}
                    />
                </FilterSection>
            </div>
        </div>
    );
});

FilterSidebar.displayName = 'FilterSidebar';

export default FilterSidebar;
