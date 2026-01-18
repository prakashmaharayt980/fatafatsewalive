'use client';

import React, { useState, memo, useCallback, useMemo } from 'react';
import {
    ChevronDown,
    ChevronUp,
    X,
    SlidersHorizontal,
    Check,
    Star,
    Sparkles,
    Tag,
    Palette,
    Box,
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
import { debounce } from '../utils';

// ============================================
// FILTER BACKGROUND (Cleaned up as per request to "make well")
// ============================================
const FilterBackground = memo(() => (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Subtler background */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-orange-50/30 rounded-full blur-3xl" />
        <div className="absolute -bottom-32 -left-16 w-64 h-64 bg-amber-50/30 rounded-full blur-3xl" />
    </div>
));
FilterBackground.displayName = 'FilterBackground';

// ============================================
// FILTER SECTION
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
        <div className="group/section border-b border-gray-100 last:border-0">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center justify-between w-full py-4 text-left transition-all duration-300"
                aria-expanded={isOpen}
            >
                <div className="flex items-center gap-2.5">
                    {Icon && (
                        <div
                            className={cn(
                                'w-7 h-7 rounded-md flex items-center justify-center transition-all duration-300',
                                isOpen
                                    ? 'bg-orange-50 text-orange-600'
                                    : 'bg-gray-50 text-gray-500 group-hover/section:bg-orange-50 group-hover/section:text-orange-600'
                            )}
                        >
                            <Icon size={15} />
                        </div>
                    )}
                    <span
                        className={cn(
                            'font-semibold text-sm tracking-wide transition-colors duration-300',
                            isOpen
                                ? 'text-gray-900'
                                : 'text-gray-600 group-hover/section:text-gray-900'
                        )}
                    >
                        {title}
                    </span>
                    {showClear && onClear && (
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                onClear();
                            }}
                            className="text-[10px] uppercase font-bold text-orange-600 hover:text-orange-700 px-2 py-0.5 rounded bg-orange-50 hover:bg-orange-100 transition-all ml-2"
                        >
                            Clear
                        </button>
                    )}
                </div>
                <div
                    className={cn(
                        'transition-transform duration-300',
                        isOpen ? 'rotate-180' : 'rotate-0'
                    )}
                >
                    <ChevronDown size={14} className={cn(isOpen ? "text-orange-600" : "text-gray-400")} />
                </div>
            </button>

            <div
                className={cn(
                    'overflow-hidden transition-all duration-500 ease-in-out',
                    isOpen ? 'max-h-[500px] opacity-100 pb-5' : 'max-h-0 opacity-0'
                )}
            >
                {loading ? (
                    <div className="space-y-3">
                        {[...Array(4)].map((_, i) => (
                            <div
                                key={i}
                                className="h-8 bg-gray-50 rounded-lg animate-pulse"
                                style={{ animationDelay: `${i * 100}ms` }}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="pl-1">{children}</div>
                )}
            </div>
        </div>
    );
});
FilterSection.displayName = 'FilterSection';

// ============================================
// CHECKBOX ITEM
// ============================================
interface CheckboxItemProps {
    option: FilterOption;
    checked: boolean;
    onChange: (id: string | number) => void;
    showColor?: boolean;
}

const CheckboxItem = memo(({
    option,
    checked,
    onChange,
    showColor = false,
}: CheckboxItemProps) => (
    <label className="flex items-center gap-2.5 py-1 px-2 cursor-pointer group/item rounded-md transition-all duration-200 hover:bg-gray-50">
        <div className="relative flex items-center">
            <input
                type="checkbox"
                checked={checked}
                onChange={() => onChange(option.id)}
                className="w-4 h-4 rounded border-gray-300 text-orange-500 focus:ring-orange-500"
            />
        </div>

        {showColor && option.color && (
            <span
                className={cn(
                    'w-4 h-4 rounded-full border border-gray-200',
                    option.color === '#fafafa' && 'border-gray-300'
                )}
                style={{ backgroundColor: option.color }}
            />
        )}

        <span
            className={cn(
                'flex-1 text-sm transition-colors duration-200',
                checked
                    ? 'text-gray-900 font-medium'
                    : 'text-gray-600 group-hover/item:text-gray-900'
            )}
        >
            {option.label}
        </span>

        {option.count !== undefined && (
            <span
                className={cn(
                    'text-xs px-2 py-0.5 rounded-full transition-all duration-200',
                    checked
                        ? 'bg-orange-100 text-orange-700'
                        : 'bg-gray-100 text-gray-500'
                )}
            >
                {option.count}
            </span>
        )}
    </label>
));
CheckboxItem.displayName = 'CheckboxItem';

// ============================================
// SEARCHABLE LIST COMPONENT
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
        const lowerTerm = searchTerm.toLowerCase();
        return items.filter((item) =>
            item.label.toLowerCase().includes(lowerTerm)
        );
    }, [items, searchTerm]);

    return (
        <>
            <div className="mb-3 px-1 relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                    type="text"
                    placeholder={placeholder}
                    className="w-full pl-8 pr-3 py-2 text-xs border border-gray-200 rounded-lg focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 bg-white transition-all"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
            <div className="space-y-0.5 max-h-52 overflow-y-auto custom-scrollbar pr-2">
                {filteredItems.map((item) => (
                    <div key={item.id}>
                        <CheckboxItem
                            option={{ id: item.id, label: item.label }}
                            checked={selectedIds.includes(item.id)}
                            onChange={onToggle}
                        />
                    </div>
                ))}
                {filteredItems.length === 0 && (
                    <p className="text-sm text-gray-400 py-4 text-center">
                        {emptyMessage}
                    </p>
                )}
            </div>
        </>
    );
});

SearchableList.displayName = 'SearchableList';

// ============================================
// COLOR SWATCH GRID (Redesigned)
// ============================================
interface ColorSwatchGridProps {
    colors: FilterOption[];
    selected: string[];
    onChange: (id: string | number) => void;
}

const ColorSwatchGrid = memo(({ colors, selected, onChange }: ColorSwatchGridProps) => (
    <div className="grid grid-cols-5 gap-2">
        {colors.map((color) => {
            const isSelected = selected.includes(color.id as string);
            return (
                <button
                    key={color.id}
                    onClick={() => onChange(color.id)}
                    className={cn(
                        "group/color flex flex-col items-center justify-center p-1 rounded-lg transition-all border-2",
                        isSelected ? "border-orange-500 bg-orange-50" : "border-transparent hover:bg-gray-50"
                    )}
                    title={color.label}
                    aria-pressed={isSelected}
                >
                    <div
                        className={cn(
                            'w-8 h-8 rounded-full shadow-sm border border-gray-200 flex items-center justify-center relative overflow-hidden',
                        )}
                        style={{ backgroundColor: color.color }}
                    >
                        {isSelected && (
                            <div className="absolute inset-0 bg-black/10 flex items-center justify-center">
                                <Check
                                    size={14}
                                    className="text-white drop-shadow-md"
                                    strokeWidth={3}
                                />
                            </div>
                        )}
                    </div>
                    {/* Tooltip-style Label on Hover could go here, but omitted for cleanliness as requested */}
                </button>
            );
        })}
    </div>
));
ColorSwatchGrid.displayName = 'ColorSwatchGrid';

// ============================================
// PRICE RANGE SLIDER
// ============================================
interface PriceRangeSliderProps {
    min: number;
    max: number;
    value: [number, number];
    onChange: (v: [number, number]) => void;
}

const PriceRangeSlider = memo(({ min, max, value, onChange }: PriceRangeSliderProps) => {
    const [localValue, setLocalValue] = useState(value);
    const debouncedOnChange = useMemo(() => debounce(onChange, 500), [onChange]);

    const handleMin = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const newMin = Math.min(Number(e.target.value), localValue[1] - 500);
        const newValue: [number, number] = [newMin, localValue[1]];
        setLocalValue(newValue);
    }, [localValue]);

    const handleMax = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const newMax = Math.max(Number(e.target.value), localValue[0] + 500);
        const newValue: [number, number] = [localValue[0], newMax];
        setLocalValue(newValue);
    }, [localValue]);

    const commit = useCallback(() => {
        onChange(localValue);
    }, [localValue, onChange]);

    const minPct = ((localValue[0] - min) / (max - min)) * 100;
    const maxPct = ((localValue[1] - min) / (max - min)) * 100;

    return (
        <div className="space-y-6 pt-2">
            <div className="relative h-2 mt-2">
                <div className="absolute inset-0 bg-gray-100 rounded-full" />
                <div
                    className="absolute h-full bg-orange-500 rounded-full"
                    style={{ left: `${minPct}%`, right: `${100 - maxPct}%` }}
                />
                <input
                    type="range"
                    min={min}
                    max={max}
                    value={localValue[0]}
                    onChange={handleMin}
                    onMouseUp={commit}
                    onTouchEnd={commit}
                    className="absolute w-full h-full opacity-0 cursor-pointer z-10"
                />
                <input
                    type="range"
                    min={min}
                    max={max}
                    value={localValue[1]}
                    onChange={handleMax}
                    onMouseUp={commit}
                    onTouchEnd={commit}
                    className="absolute w-full h-full opacity-0 cursor-pointer z-10"
                />
                <div
                    className="absolute w-5 h-5 bg-white border-2 border-orange-500 rounded-full shadow hover:scale-110 transition-transform -translate-y-1/2 top-1/2 -translate-x-1/2 pointer-events-none"
                    style={{ left: `${minPct}%` }}
                />
                <div
                    className="absolute w-5 h-5 bg-white border-2 border-orange-500 rounded-full shadow hover:scale-110 transition-transform -translate-y-1/2 top-1/2 -translate-x-1/2 pointer-events-none"
                    style={{ left: `${maxPct}%` }}
                />
            </div>

            <div className="flex items-center gap-4">
                <div className="flex-1">
                    <label className="text-[10px] uppercase font-bold text-gray-500 mb-1 block">Min</label>
                    <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs">Rs.</span>
                        <input
                            type="number"
                            value={localValue[0]}
                            onChange={handleMin}
                            onBlur={commit}
                            className="w-full pl-8 pr-2 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm font-medium focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
                        />
                    </div>
                </div>
                <div className="flex-1">
                    <label className="text-[10px] uppercase font-bold text-gray-500 mb-1 block">Max</label>
                    <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs">Rs.</span>
                        <input
                            type="number"
                            value={localValue[1]}
                            onChange={handleMax}
                            onBlur={commit}
                            className="w-full pl-8 pr-2 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm font-medium focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
});
PriceRangeSlider.displayName = 'PriceRangeSlider';

// ============================================
// TOGGLE SWITCH
// ============================================
interface ToggleSwitchProps {
    label: string;
    description?: string;
    checked: boolean;
    onChange: () => void;
    icon?: React.ElementType;
}

const ToggleSwitch = memo(({
    label,
    description,
    checked,
    onChange,
    icon: Icon,
}: ToggleSwitchProps) => (
    <label className="flex items-center gap-3 py-2 px-3 cursor-pointer group/toggle rounded-xl transition-all hover:bg-gray-50 border border-transparent hover:border-gray-100">
        {Icon && (
            <div
                className={cn(
                    'w-8 h-8 rounded-lg flex items-center justify-center transition-all',
                    checked ? 'bg-orange-100 text-orange-600' : 'bg-gray-100 text-gray-500'
                )}
            >
                <Icon size={16} />
            </div>
        )}

        <div className="flex-1">
            <span
                className={cn(
                    'block text-sm font-medium transition-colors',
                    checked ? 'text-gray-900' : 'text-gray-600'
                )}
            >
                {label}
            </span>
        </div>

        <div className="relative">
            <input
                type="checkbox"
                checked={checked}
                onChange={onChange}
                className="sr-only"
            />
            <div
                className={cn(
                    'w-10 h-6 rounded-full transition-all duration-300',
                    checked ? 'bg-orange-500' : 'bg-gray-200'
                )}
            >
                <div
                    className={cn(
                        'absolute w-4 h-4 bg-white rounded-full shadow-sm top-1 transition-all duration-300',
                        checked ? 'left-5' : 'left-1'
                    )}
                />
            </div>
        </div>
    </label>
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
    <span className="inline-flex items-center gap-1.5 bg-orange-50 text-orange-700 px-2.5 py-1 rounded-full text-xs font-medium border border-orange-100">
        {label}
        <button
            onClick={onRemove}
            className="p-0.5 rounded-full hover:bg-orange-100 text-orange-600 transition-colors"
            aria-label={`Remove ${label} filter`}
        >
            <X size={12} />
        </button>
    </span>
));
ActiveFilterTag.displayName = 'ActiveFilterTag';

// ============================================
// MAIN FILTER SIDEBAR COMPONENT
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

    const handleCategoryToggle = useCallback(
        (id: string | number) => {
            onToggleFilter('categories', id);
        },
        [onToggleFilter]
    );

    const handleBrandToggle = useCallback(
        (id: string | number) => {
            onToggleFilter('brands', id);
        },
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
        <div
            className={cn(
                'relative bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden',
                className
            )}
        >
            <FilterBackground />

            {/* Header */}
            <div className="relative px-5 py-4 border-b border-gray-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <SlidersHorizontal size={18} className="text-gray-800" />
                    <h2 className="text-base font-bold text-gray-900">Filters</h2>
                </div>

                {activeFilterCount > 0 && (
                    <button
                        onClick={onClearAll}
                        className="text-xs font-medium text-orange-600 hover:text-orange-700 hover:underline transition-all"
                    >
                        Reset All
                    </button>
                )}
            </div>

            {/* Filter Content */}
            <div className="relative px-5 py-2 max-h-[calc(100vh-200px)] overflow-y-auto custom-scrollbar">
                {/* Quick Toggles */}
                <div className="py-4 space-y-2 border-b border-gray-100">
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
                        placeholder="Filter categories..."
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
                        placeholder="Filter brands..."
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