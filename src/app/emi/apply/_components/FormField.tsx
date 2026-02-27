import React from 'react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export interface FieldOption {
    label: string;
    name: string;
    value: string | number | undefined;
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
    placeholder?: string;
    maxLength?: number;
    svgicon?: string | React.ReactNode;
    extenduserinfo?: string;
    type?: string;
    options?: string[];
    step?: string;
    disabled?: boolean;
    helper?: string | null;
    maxvalue?: number;
}

interface FormFieldProps {
    field: FieldOption;
    error?: string;
}

const FormField: React.FC<FormFieldProps> = React.memo(({ field, error }) => (
    <div className={`${field.extenduserinfo || ''}`}>
        <label className="text-xs font-semibold text-gray-600 uppercase tracking-wider block mb-1">{field.label}</label>
        <div className="relative group">
            <div className={`absolute left-0 top-0 bottom-0 w-10 flex items-center justify-center text-gray-400 transition-colors z-10 pointer-events-none ${error ? 'text-red-400' : 'group-focus-within:text-(--colour-fsP2)'}`}>
                {field.svgicon}
            </div>
            {field.type === 'select' ? (
                <Select
                    name={field.name}
                    value={field.value ? String(field.value) : undefined}
                    onValueChange={(value) => field.onChange({ target: { name: field.name, value } } as unknown as React.ChangeEvent<HTMLSelectElement>)}
                    disabled={field.disabled}
                >
                    <SelectTrigger className={`w-full h-10 pl-10 bg-white text-gray-700 text-sm rounded-lg border transition-all duration-150 ${error ? 'border-red-400 ring-1 ring-red-200' : 'border-gray-200 focus:border-(--colour-fsP2) focus:ring-1 focus:ring-(--colour-fsP2)'} ${field.disabled ? 'opacity-60 cursor-not-allowed bg-gray-50' : ''}`}>
                        <SelectValue placeholder={`Select ${field.label}`} />
                    </SelectTrigger>
                    <SelectContent className="bg-white border-gray-100 rounded-lg shadow-lg max-h-60 overflow-y-auto z-50 text-sm">
                        {field.options?.map((opt: string) => (
                            <SelectItem key={opt} value={opt} className="cursor-pointer px-4 py-2 hover:bg-blue-50 hover:text-(--colour-fsP2) focus:text-(--colour-fsP2) transition-colors">
                                {opt}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            ) : (
                <Input
                    type={field.type || 'text'}
                    name={field.name}
                    value={field.value ?? ''}
                    onChange={field.onChange}
                    placeholder={field.placeholder}
                    maxLength={field.maxLength}
                    max={field.maxvalue !== undefined ? field.maxvalue : undefined}
                    step={field.step}
                    disabled={field.disabled}
                    autoComplete="off"
                    className={`w-full h-10 pl-10 text-gray-700 text-sm rounded-lg border transition-all duration-150 ${error ? 'border-red-400 ring-1 ring-red-200 bg-red-50/30' : 'border-gray-200 bg-white focus:border-(--colour-fsP2) focus:ring-1 focus:ring-(--colour-fsP2)'} ${field.disabled ? 'opacity-60 cursor-not-allowed bg-gray-50' : ''}`}
                />
            )}
        </div>
        {/* Fixed-height error slot — prevents layout shift */}
        <div className="h-4 mt-0.5">
            {error && <p className="text-red-500 text-[11px] leading-tight">{error}</p>}
        </div>
        {field.helper && !error && (
            <p className="text-[11px] text-gray-400 -mt-3.5 ml-1">{field.helper}</p>
        )}
    </div>
));


FormField.displayName = 'FormField';

export default FormField;
