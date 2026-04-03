'use client'

import React from 'react';
import Image from "next/image";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import type { FieldOption } from "./FormField";
import { useContextEmi } from "../../_components/emiContext";

interface CreditCardComponentProps {
  cardinfofield: {
    fields: FieldOption[];
  };
  errors: Record<string, string>;
}

export default function CreditCardComponent({ cardinfofield, errors }: CreditCardComponentProps) {
  const { banks } = useContextEmi();

  const expiryField = cardinfofield.fields.find((field: FieldOption) => field.name === 'expiryDate');
  const limitField = cardinfofield.fields.find((field: FieldOption) => field.name === 'cardLimit');

  return (
    <div className="bg-white rounded-xl p-1 sm:p-2">
      <div className="w-full space-y-4">
        {cardinfofield.fields
          .filter((field) => field.name !== 'expiryDate' && field.name !== 'cardLimit')
          .map((field, fieldIndex) => (
            <div key={fieldIndex}>
              <Label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1.5">
                {field.label}
              </Label>
              <div className="relative">
                {field.type === 'select' ? (
                  <Select
                    value={field.value !== undefined && field.value !== null ? String(field.value) : undefined}
                    onValueChange={(value) => field.onChange({ target: { name: field.name, value } } as unknown as React.ChangeEvent<HTMLSelectElement>)}
                    modal={false}
                  >
                    <SelectTrigger
                      className={`w-full h-10 pl-10 bg-white border-gray-200 text-gray-700 text-sm rounded-lg focus:border-(--colour-fsP2) focus:ring-1 focus:ring-(--colour-fsP2) transition-all duration-150 ${errors[field.name] ? 'border-red-500' : ''}`}
                    >
                      <SelectValue placeholder={`Select ${field.label}`} />
                      <div className={`absolute left-0 top-0 bottom-0 w-10 flex items-center justify-center transition-colors z-10 pointer-events-none ${errors[field.name] ? 'text-red-500' : 'text-gray-400 group-focus-within:text-(--colour-fsP2)'}`}>
                        {field.svgicon}
                      </div>
                    </SelectTrigger>
                    <SelectContent className="bg-white border-gray-100 rounded-lg shadow-lg max-h-60 overflow-y-auto z-[1000] text-sm">
                      {field.options ? (
                        field.options.map((option) => (
                          <SelectItem
                            key={option}
                            value={option}
                            className="cursor-pointer px-4 py-2 hover:bg-blue-50 hover:text-(--colour-fsP2) focus:text-(--colour-fsP2) transition-all duration-150"
                          >
                            {option}
                          </SelectItem>
                        ))
                      ) : (
                        banks.map((bank) => (
                          <SelectItem
                            key={bank.id}
                            value={bank.name}
                            className="cursor-pointer px-4 py-2 hover:bg-blue-50 hover:text-[var(--colour-fsP2)] focus:text-[var(--colour-fsP2)] transition-all duration-150"
                          >
                            <div className="flex items-center gap-2">
                              {bank.img && (
                                <Image src={bank.img} alt={bank.name} width={20} height={20} className="rounded object-contain" />
                              )}
                              {bank.name}
                            </div>
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                ) : (
                  <div className="relative group">
                    <Input
                      type={field.type || 'text'}
                      value={field.value ?? ''}
                      onChange={field.onChange}
                      name={field.name}
                      placeholder={field.placeholder}
                      maxLength={field.maxLength}
                      max={field.maxvalue}
                      autoComplete="off"
                      className={`w-full h-10 pl-10 bg-white border-gray-200 text-gray-700 text-sm rounded-lg focus:border-transparent focus:ring-1 focus:ring-(--colour-fsP2) transition-all duration-150 ${errors[field.name] ? 'border-red-500' : ''}`}
                    />
                    <div className={`absolute left-0 top-0 bottom-0 w-10 flex items-center justify-center transition-colors z-10 pointer-events-none ${errors[field.name] ? 'text-red-500' : 'text-gray-400 group-focus-within:text-(--colour-fsP2)'}`}>
                      {field.svgicon}
                    </div>
                  </div>
                )}
                {errors[field.name] && <p className="text-red-500 text-xs mt-1">{errors[field.name]}</p>}
              </div>
            </div>
          ))}

        {(expiryField || limitField) && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2">
            {expiryField && (
              <div>
                <Label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1.5">
                  {expiryField.label}
                </Label>
                <div className="relative group">
                  <Input
                    type={expiryField.type || 'text'}
                    value={expiryField.value ?? ''}
                    onChange={expiryField.onChange}
                    name={expiryField.name}
                    placeholder={expiryField.placeholder}
                    maxLength={expiryField.maxLength}
                    autoComplete="off"
                    className={`w-full h-10 pl-10 bg-white border-gray-200 text-gray-700 text-sm rounded-lg focus:border-transparent focus:ring-1 focus:ring-(--colour-fsP2) transition-all duration-150 ${errors[expiryField.name] ? 'border-red-500' : ''}`}
                  />
                  <div className={`absolute left-0 top-0 bottom-0 w-10 flex items-center justify-center transition-colors z-10 pointer-events-none ${errors[expiryField.name] ? 'text-red-500' : 'text-gray-400 group-focus-within:text-(--colour-fsP2)'}`}>
                    {expiryField.svgicon}
                  </div>
                  {errors[expiryField.name] && (
                    <p className="text-red-500 text-xs mt-1">{errors[expiryField.name]}</p>
                  )}
                </div>
              </div>
            )}
            {limitField && (
              <div>
                <Label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1.5">
                  {limitField.label}
                </Label>
                <div className="relative group">
                  <Input
                    type={limitField.type || 'text'}
                    value={limitField.value ?? ''}
                    onChange={limitField.onChange}
                    name={limitField.name}
                    placeholder={limitField.placeholder}
                    maxLength={limitField.maxLength}
                    autoComplete="off"
                    className={`w-full h-10 pl-10 bg-white border-gray-200 text-gray-700 text-sm rounded-lg focus:border-transparent focus:ring-1 focus:ring-(--colour-fsP2) transition-all duration-150 ${errors[limitField.name] ? 'border-red-500' : ''}`}
                  />
                  <div className={`absolute left-0 top-0 bottom-0 w-10 flex items-center justify-center transition-colors z-10 pointer-events-none ${errors[limitField.name] ? 'text-red-500' : 'text-gray-400 group-focus-within:text-(--colour-fsP2)'}`}>
                    {limitField.svgicon}
                  </div>
                  {errors[limitField.name] && (
                    <p className="text-red-500 text-xs mt-1">{errors[limitField.name]}</p>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
