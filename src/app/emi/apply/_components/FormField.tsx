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
    <div className={`space-y-1 ${field.extenduserinfo || ''}`}>
        <label className="text-xs font-semibold text-gray-600 uppercase tracking-wider">{field.label}</label>
        <div className="relative group">
            <div className={`absolute left-0 top-0 bottom-0 w-10 flex items-center justify-center text-gray-400 transition-colors z-10 pointer-events-none ${error ? 'text-red-500' : 'group-focus-within:text-(--colour-fsP2)'}`}>
                {field.svgicon}
            </div>
            {field.type === 'select' ? (
                <div className="relative">
                    <Select
                        name={field.name}
                        value={field.value ? String(field.value) : undefined}
                        onValueChange={(value) => field.onChange({ target: { name: field.name, value } } as unknown as React.ChangeEvent<HTMLSelectElement>)}
                    >
                        <SelectTrigger className={`w-full h-10 pl-10 bg-white border-blue-200 text-gray-600 text-sm rounded-lg focus:border-(--colour-fsP2) focus:ring-1 focus:ring-(--colour-fsP2) transition-all duration-150 ${error ? 'border-red-500' : ''}`}>
                            <SelectValue placeholder={`Select ${field.label}`} />
                        </SelectTrigger>
                        <SelectContent className="bg-white border-blue-100 rounded-lg shadow-lg max-h-60 overflow-y-auto z-50 text-sm">
                            {field.options && field.options.map((opt: string) => (
                                <SelectItem key={opt} value={opt} className="cursor-pointer px-4 py-2 hover:bg-blue-50 hover:text-(--colour-fsP2) focus:text-(--colour-fsP2) transition-all duration-150">
                                    {opt}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            ) : (
                <Input
                    type={field.type || 'text'}
                    name={field.name}
                    value={field.value ?? ''}
                    onChange={field.onChange}
                    placeholder={field.placeholder}
                    maxLength={field.maxLength}
                    autoComplete="off"
                    className={`w-full h-10 pl-10 bg-white border-blue-200 text-gray-600 text-sm rounded-lg focus:border-transparent focus:ring-1 focus:ring-(--colour-fsP2) transition-all duration-150 ${error ? 'border-red-500' : ''}`}
                />
            )}
        </div>
        {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
));

FormField.displayName = 'FormField';

export default FormField;
